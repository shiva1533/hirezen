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
      throw new Error("Candidate ID is required");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Fetching candidate and jobs...");

    // Get candidate details
    const { data: candidate, error: candidateError } = await supabase
      .from("candidates")
      .select("*")
      .eq("id", candidateId)
      .single();

    if (candidateError || !candidate) {
      throw new Error("Candidate not found");
    }

    // Get all active jobs
    const { data: jobs, error: jobsError } = await supabase
      .from("jobs")
      .select("*")
      .in("status", ["open", "active", "draft"]);

    if (jobsError) {
      throw new Error("Failed to fetch jobs");
    }

    if (!jobs || jobs.length === 0) {
      console.log("No active jobs found");
      return new Response(
        JSON.stringify({ 
          message: "No active jobs to match against",
          matches: []
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Matching candidate against ${jobs.length} jobs...`);

    // Find best matching job using AI
    const jobSummaries = jobs.map(job => ({
      id: job.id,
      position: job.position,
      department: job.department,
      experience: job.experience,
      description: job.job_description?.substring(0, 500) || "No description",
    }));

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
            content: "You are an expert HR recruiter specializing in candidate-job matching. Analyze candidate qualifications against job requirements and provide detailed match scores."
          },
          {
            role: "user",
            content: `Analyze this candidate's fit for the available positions and provide match scores.

CANDIDATE:
Name: ${candidate.full_name}
Experience: ${candidate.experience_years} years
Resume: ${candidate.resume_text?.substring(0, 1000) || "No resume text available"}

AVAILABLE POSITIONS:
${JSON.stringify(jobSummaries, null, 2)}

Evaluate the candidate's fit for EACH position based on:
1. Skills match (technical and soft skills)
2. Experience level alignment
3. Domain/industry relevance
4. Overall qualification fit`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "evaluate_candidate_matches",
              description: "Evaluate candidate fit for multiple job positions with detailed scoring",
              parameters: {
                type: "object",
                properties: {
                  matches: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        job_id: { type: "string", description: "Job ID" },
                        match_score: { 
                          type: "number", 
                          description: "Overall match score from 0-100",
                          minimum: 0,
                          maximum: 100
                        },
                        skills_match: { 
                          type: "number", 
                          description: "Skills alignment score 0-100" 
                        },
                        experience_match: { 
                          type: "number", 
                          description: "Experience level match 0-100" 
                        },
                        strengths: { 
                          type: "string", 
                          description: "Key strengths for this position" 
                        },
                        gaps: { 
                          type: "string", 
                          description: "Skill or experience gaps" 
                        },
                        recommendation: { 
                          type: "string", 
                          description: "Hiring recommendation (Strong Match, Good Match, Potential Match, Not Recommended)" 
                        }
                      },
                      required: ["job_id", "match_score", "skills_match", "experience_match", "strengths", "gaps", "recommendation"]
                    }
                  },
                  best_match_job_id: {
                    type: "string",
                    description: "ID of the best matching job"
                  },
                  overall_summary: {
                    type: "string",
                    description: "Brief summary of candidate's overall fit across all positions"
                  }
                },
                required: ["matches", "best_match_job_id", "overall_summary"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "evaluate_candidate_matches" } }
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
      throw new Error("AI matching failed");
    }

    const aiData = await aiResponse.json();
    console.log("AI matching completed");

    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No match data generated");
    }

    const matchResults = JSON.parse(toolCall.function.arguments);
    console.log("Match results:", matchResults);

    // Update candidate with best match score and analysis
    const bestMatch = matchResults.matches.find(
      (m: any) => m.job_id === matchResults.best_match_job_id
    );

    if (bestMatch) {
      const { error: updateError } = await supabase
        .from("candidates")
        .update({
          ai_match_score: Math.round(bestMatch.match_score),
          ai_match_analysis: {
            best_job_id: matchResults.best_match_job_id,
            all_matches: matchResults.matches,
            summary: matchResults.overall_summary,
            analyzed_at: new Date().toISOString()
          },
          job_id: matchResults.best_match_job_id
        })
        .eq("id", candidateId);

      if (updateError) {
        console.error("Failed to update candidate:", updateError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        candidateId,
        matchResults,
        bestMatch
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in match-candidate-to-jobs:", error);
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
