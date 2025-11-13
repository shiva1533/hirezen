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
    const { fileData, fileName } = await req.json();

    if (!fileData) {
      return new Response(JSON.stringify({ error: "No file data provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Extracting job from PDF: ${fileName ?? "unnamed"}`);

    // Step 1: Parse PDF to get text
    const parsePdfResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/parse-pdf`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": req.headers.get("Authorization") || "",
      },
      body: JSON.stringify({ fileData, fileName }),
    });

    if (!parsePdfResponse.ok) {
      const errorData = await parsePdfResponse.json();
      throw new Error(errorData.error || "Failed to parse PDF");
    }

    const parsePdfData = await parsePdfResponse.json();
    const { text, usedOCR } = parsePdfData;

    if (!text || text.trim().length < 50) {
      return new Response(
        JSON.stringify({ error: "Insufficient text content in PDF to extract job information" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Extracted ${text.length} characters from PDF${usedOCR ? ' (via OCR)' : ''}, analyzing with AI...`);

    // Step 2: Use Lovable AI to extract structured job data
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are an expert HR assistant that extracts structured job posting information from text."
          },
          {
            role: "user",
            content: `Extract job information from the following job posting text. Return the data in the specified format.\n\nJob Posting Text:\n${text}`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_job_data",
              description: "Extract structured job fields from job posting text",
              parameters: {
                type: "object",
                properties: {
                  position: { type: "string", description: "Job position/title" },
                  department: { type: "string", description: "Department name" },
                  sector: { type: "string", description: "Industry sector" },
                  experience: { type: "string", description: "Required years of experience" },
                  role_experience: { type: "string", description: "Specific role experience requirements" },
                  expected_qualification: { type: "string", description: "Required qualifications or degrees" },
                  job_type: { type: "string", description: "Job type (e.g., Full-time, Part-time, Contract)" },
                  mode_of_work: { type: "string", description: "Work mode (e.g., Remote, Hybrid, On-site)" },
                  priority_level: { type: "string", description: "Priority level (e.g., High, Medium, Low)" },
                  salary_min: { type: "string", description: "Minimum salary" },
                  salary_max: { type: "string", description: "Maximum salary" },
                  currency: { type: "string", description: "Salary currency (e.g., USD, INR)" },
                  billing_rate: { type: "string", description: "Billing rate if applicable" },
                  job_description: { type: "string", description: "Full job description including responsibilities and requirements" },
                  segments: { type: "string", description: "Job segments or categories" },
                  language: { type: "string", description: "Language requirement (default: english)" },
                  vacancies: { type: "number", description: "Number of vacancies (default: 1)" },
                  state: { type: "string", description: "State location" },
                  zone: { type: "string", description: "Zone location" },
                  branch: { type: "string", description: "Branch location" },
                  primary_locations: { type: "string", description: "Primary locations" },
                  secondary_locations: { type: "string", description: "Secondary locations" },
                },
                required: ["position", "job_description"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "extract_job_data" } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI request failed: ${errorText}`);
    }

    const aiData = await aiResponse.json();
    console.log("AI response:", JSON.stringify(aiData));

    // Extract the structured data from AI response
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || !toolCall.function?.arguments) {
      throw new Error("AI did not return structured job data");
    }

    const extractedData = JSON.parse(toolCall.function.arguments);
    console.log("Extracted job data:", extractedData);

    // Step 3: Create job in database
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { data: jobData, error: insertError } = await supabaseClient
      .from("jobs")
      .insert({
        position: extractedData.position,
        department: extractedData.department || null,
        sector: extractedData.sector || null,
        experience: extractedData.experience || null,
        role_experience: extractedData.role_experience || null,
        expected_qualification: extractedData.expected_qualification || null,
        job_type: extractedData.job_type || null,
        mode_of_work: extractedData.mode_of_work || null,
        priority_level: extractedData.priority_level || null,
        salary_min: extractedData.salary_min || null,
        salary_max: extractedData.salary_max || null,
        currency: extractedData.currency || "INR",
        billing_rate: extractedData.billing_rate || null,
        job_description: extractedData.job_description,
        segments: extractedData.segments || null,
        language: extractedData.language || "english",
        vacancies: extractedData.vacancies || 1,
        state: extractedData.state || null,
        zone: extractedData.zone || null,
        branch: extractedData.branch || null,
        primary_locations: extractedData.primary_locations || null,
        secondary_locations: extractedData.secondary_locations || null,
        status: "published", // Created as published so it's visible immediately
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting job:", insertError);
      throw new Error(`Failed to create job: ${insertError.message}`);
    }

    console.log("Job created successfully:", jobData.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        jobData: extractedData,
        jobId: jobData.id,
        sourceFileName: fileName,
        usedOCR: usedOCR || false
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error("Error extracting job from PDF:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to extract job from PDF",
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
