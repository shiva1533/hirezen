import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeText, jobId, additionalInfo, resumeUrl } = await req.json();
    
    // SECURITY: Input validation
    if (!resumeText) {
      throw new Error("Resume text is required");
    }

    // Validate resume text length (prevent abuse)
    if (resumeText.length > 50000) {
      return new Response(
        JSON.stringify({ error: "Resume text too long. Maximum 50,000 characters." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (resumeText.length < 50) {
      return new Response(
        JSON.stringify({ error: "Resume text too short. Minimum 50 characters." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate email format if provided
    if (additionalInfo?.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(additionalInfo.email)) {
        return new Response(
          JSON.stringify({ error: "Invalid email format" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Parsing resume with AI...");

    // Call Lovable AI to extract structured data from resume
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a resume parser. Extract candidate information accurately from resumes."
          },
          {
            role: "user",
            content: `Parse this resume and extract the candidate information:\n\n${resumeText}`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_candidate_info",
              description: "Extract structured candidate information from resume text",
              parameters: {
                type: "object",
                properties: {
                  full_name: { type: "string", description: "Full name of the candidate" },
                  email: { type: "string", description: "Email address" },
                  phone: { type: "string", description: "Phone number" },
                  experience_years: { type: "number", description: "Years of experience as a number" },
                  position: { type: "string", description: "Job position or title" },
                  skills: { type: "string", description: "Comma-separated list of skills" },
                  location: { type: "string", description: "Location (city, state, country)" },
                  education: { type: "string", description: "Educational qualifications" },
                  summary: { type: "string", description: "Brief professional summary" }
                },
                required: ["full_name", "email"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "extract_candidate_info" } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      if (aiResponse.status === 402) {
        throw new Error("Payment required. Please add credits to your workspace.");
      }
      throw new Error("AI parsing failed");
    }

    const aiData = await aiResponse.json();
    console.log("AI response received:", JSON.stringify(aiData));

    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No candidate data extracted from resume");
    }

    const candidateData = JSON.parse(toolCall.function.arguments);
    console.log("Extracted candidate data:", candidateData);

    // Sanitize resume text to remove null bytes and other problematic Unicode characters
    const sanitizeText = (text: string): string => {
      return text
        .replace(/\u0000/g, '') // Remove null bytes
        .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '') // Remove other control characters
        .trim();
    };

    const cleanResumeText = sanitizeText(resumeText);

    // Save to database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Validate provided jobId (if any). If invalid, set to null.
    let jobIdToUse: string | null = null;
    if (jobId) {
      const { data: jobRow, error: jobErr } = await supabase
        .from("jobs")
        .select("id")
        .eq("id", jobId)
        .maybeSingle();
      if (jobErr) {
        console.warn("Job lookup failed:", jobErr.message);
      }
      if (jobRow?.id) {
        jobIdToUse = jobRow.id;
      } else {
        console.log("Provided jobId not found; inserting candidate without job assignment.");
      }
    }

    const { data: insertedCandidate, error: insertError } = await supabase
      .from("candidates")
      .insert({
        full_name: additionalInfo?.fullName || candidateData.full_name,
        email: additionalInfo?.email || candidateData.email,
        phone: additionalInfo?.phone || candidateData.phone || null,
        experience_years: candidateData.experience_years || null,
        resume_text: cleanResumeText,
        resume_url: resumeUrl || null,
        job_id: jobIdToUse, // Nullable if not found
        status: "pending",
        skills: candidateData.skills || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      throw new Error(`Failed to save candidate: ${insertError.message}`);
    }

    console.log("Candidate saved successfully:", insertedCandidate.id);

    // Trigger AI matching asynchronously (don't wait for it)
    fetch(`${supabaseUrl}/functions/v1/match-candidate-to-jobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ candidateId: insertedCandidate.id }),
    }).catch(err => console.error("Failed to trigger matching:", err));

    // Send welcome email to candidate asynchronously
    fetch(`${supabaseUrl}/functions/v1/send-candidate-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ 
        candidateId: insertedCandidate.id,
        type: "resume_processed"
      }),
    }).catch(err => console.error("Failed to send email:", err));

    return new Response(
      JSON.stringify({
        success: true,
        candidate: insertedCandidate,
        extractedData: candidateData,
        message: "Resume parsed successfully. AI matching in progress..."
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in parse-resume function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
