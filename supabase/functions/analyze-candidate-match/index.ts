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
    const { candidateId } = await req.json();
    
    if (!candidateId) {
      throw new Error("candidateId is required");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch candidate data
    const { data: candidate, error: candidateError } = await supabase
      .from("candidates")
      .select("*, jobs(*)")
      .eq("id", candidateId)
      .single();

    if (candidateError || !candidate) {
      throw new Error("Candidate not found");
    }

    // Build analysis prompt
    const prompt = `You are an expert HR analyst. Analyze this candidate's qualifications against the job requirements and provide a detailed assessment.

Job Details:
- Position: ${candidate.jobs.position}
- Required Experience: ${candidate.jobs.experience || "Not specified"}
- Department: ${candidate.jobs.department || "Not specified"}
- Job Description: ${candidate.jobs.job_description || "Not provided"}

Candidate Profile:
- Name: ${candidate.full_name}
- Experience: ${candidate.experience_years || "Not specified"} years
- Resume Content: ${candidate.resume_text || "No resume text available"}

Provide your analysis in the following JSON structure:
{
  "match_score": <number from 0-100>,
  "strengths": ["list", "of", "key", "strengths"],
  "weaknesses": ["list", "of", "gaps", "or", "concerns"],
  "recommendation": "<string: 'highly_recommended' | 'recommended' | 'consider' | 'not_recommended'>",
  "summary": "<brief summary of the assessment>"
}`;

    console.log("Sending analysis request to Lovable AI...");

    // Call Lovable AI for analysis
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are an expert HR analyst. Provide objective, detailed candidate assessments based on job requirements. Always respond with valid JSON only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      if (aiResponse.status === 402) {
        throw new Error("AI credits exhausted. Please add funds to continue.");
      }
      
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    console.log("AI Response:", content);

    // Parse AI response
    let analysis;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      analysis = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Invalid AI response format");
    }

    // Update candidate with AI analysis
    const { error: updateError } = await supabase
      .from("candidates")
      .update({
        ai_match_score: analysis.match_score,
        ai_match_analysis: analysis,
      })
      .eq("id", candidateId);

    if (updateError) {
      throw updateError;
    }

    console.log("Successfully updated candidate with AI analysis");

    return new Response(
      JSON.stringify({
        success: true,
        analysis,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in analyze-candidate-match:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
