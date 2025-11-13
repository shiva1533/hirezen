import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QuestionRequest {
  jobDescription: string;
  position: string;
  numQuestions?: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobDescription, position, numQuestions = 5 }: QuestionRequest = await req.json();

    console.log("Generating interview questions for position:", position);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const prompt = `You are an expert HR interviewer. Generate interview questions for a ${position} position.

Job Description:
${jobDescription || "No specific job description provided"}

Requirements:
- Generate EXACTLY ${numQuestions} questions total
- FIRST 10 questions MUST be Multiple Choice Questions (MCQ) with 4 options each
- REMAINING ${numQuestions - 10} questions MUST be written/descriptive questions
- Mix of technical skills, problem-solving, and behavioral questions
- Questions should be relevant to the ${position} role
- Each question should be clear and specific
- For MCQ: one option must be the correct answer
- Include expected answer guideline for evaluation

Return ONLY a JSON array in this exact format:
[
  {
    "question": "MCQ question text here?",
    "category": "technical",
    "type": "mcq",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "expectedAnswer": "The correct option from above"
  },
  {
    "question": "Written question text here?",
    "category": "behavioral",
    "type": "written",
    "expectedAnswer": "Brief guideline of what makes a good answer"
  }
]

IMPORTANT: First 10 must have type "mcq" with options array, remaining must have type "written" without options.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an expert HR interviewer. Always respond with valid JSON arrays only." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse the JSON response
    let questions;
    try {
      // Remove markdown code blocks if present
      const jsonString = content.replace(/```json\n?|\n?```/g, '').trim();
      questions = JSON.parse(jsonString);
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI response as JSON");
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("AI did not return valid questions array");
    }

    console.log("Generated questions:", questions.length);

    return new Response(
      JSON.stringify({ questions }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in generate-interview-questions function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
