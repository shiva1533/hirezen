import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeText } = await req.json();
    
    if (!resumeText) {
      throw new Error("Resume text is required");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Extracting candidate info with AI...");

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
      throw new Error("AI extraction failed");
    }

    const aiData = await aiResponse.json();
    console.log("AI response received");

    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No candidate data extracted from resume");
    }

    const candidateData = JSON.parse(toolCall.function.arguments);
    console.log("Extracted candidate data:", candidateData);

    return new Response(
      JSON.stringify({
        success: true,
        extractedData: candidateData
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in extract-candidate-info function:", error);
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