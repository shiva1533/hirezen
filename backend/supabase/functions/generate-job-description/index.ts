import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { position, department, experience, roleExperience, language } = await req.json();
    
    console.log('Generating job description for:', { position, department, experience, language });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build a comprehensive prompt for the AI
    const prompt = `Generate a professional, comprehensive job description for an academic position with the following details:

Position: ${position || 'Not specified'}
Department: ${department || 'Not specified'}
Experience Level: ${experience || 'Not specified'}
Role Relevant Experience: ${roleExperience ? roleExperience + ' years' : 'Not specified'}
Language: ${language || 'English'}

Please create a well-structured job description that includes:
1. A brief overview of the position
2. Key responsibilities and duties
3. Required qualifications and experience
4. Preferred skills and competencies
5. Any other relevant information for an academic institution

IMPORTANT: Write in plain text format without any markdown formatting. Do not use asterisks (*), hashes (#), or other markdown symbols. Use simple line breaks and proper punctuation instead.

The tone should be professional and suitable for a college HRMS system. Write in ${language === 'hindi' ? 'Hindi' : language === 'telugu' ? 'Telugu' : 'English'}.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: "You are an expert HR professional specializing in creating detailed, professional job descriptions for academic positions in colleges and universities."
          },
          {
            role: "user",
            content: prompt
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`AI gateway error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const generatedDescription = data.choices?.[0]?.message?.content;

    if (!generatedDescription) {
      throw new Error("No job description generated");
    }

    console.log('Successfully generated job description');

    return new Response(
      JSON.stringify({ jobDescription: generatedDescription }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-job-description function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
