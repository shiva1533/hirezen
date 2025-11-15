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
    const { jobId } = await req.json();
    
    if (!jobId) {
      throw new Error("jobId is required");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Fetching job and all candidates...");

    // Get job details
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      throw new Error("Job not found");
    }

    // Get ALL candidates from the system
    const { data: candidates, error: candidatesError } = await supabase
      .from("candidates")
      .select("*");

    if (candidatesError) {
      throw new Error("Failed to fetch candidates");
    }

    if (!candidates || candidates.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: "No candidates found in the system",
          matchedCount: 0
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Analyzing ${candidates.length} candidates for ${job.position}...`);

    // Process candidates in batches to avoid rate limits
    const batchSize = 5;
    let successCount = 0;
    let errors: string[] = [];

    for (let i = 0; i < candidates.length; i += batchSize) {
      const batch = candidates.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (candidate) => {
        try {
          // Build analysis prompt
          const prompt = `Analyze this candidate's qualifications against the job requirements.

Job Details:
- Position: ${job.position}
- Required Experience: ${job.experience || "Not specified"}
- Department: ${job.department || "Not specified"}
- Job Description: ${job.job_description?.substring(0, 1000) || "Not provided"}
- Required Qualifications: ${job.expected_qualification || "Not specified"}

Candidate Profile:
- Name: ${candidate.full_name}
- Experience: ${candidate.experience_years || 0} years
- Resume: ${candidate.resume_text?.substring(0, 2000) || "No resume available"}

Evaluate based on: skills match, experience alignment, qualification fit, and overall suitability.`;

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
                  content: "You are an expert HR recruiter. Provide objective candidate assessments."
                },
                {
                  role: "user",
                  content: prompt
                }
              ],
              tools: [
                {
                  type: "function",
                  function: {
                    name: "evaluate_candidate_match",
                    description: "Evaluate candidate fit for a job position",
                    parameters: {
                      type: "object",
                      properties: {
                        match_score: { 
                          type: "number", 
                          description: "Overall match score 0-100" 
                        },
                        strengths: { 
                          type: "array",
                          items: { type: "string" },
                          description: "Key strengths (3-5 points)" 
                        },
                        weaknesses: { 
                          type: "array",
                          items: { type: "string" },
                          description: "Gaps or concerns (2-4 points)" 
                        },
                        recommendation: { 
                          type: "string", 
                          enum: ["highly_recommended", "recommended", "consider", "not_recommended"],
                          description: "Hiring recommendation" 
                        },
                        summary: { 
                          type: "string", 
                          description: "Brief assessment summary (2-3 sentences)" 
                        }
                      },
                      required: ["match_score", "strengths", "weaknesses", "recommendation", "summary"],
                      additionalProperties: false
                    }
                  }
                }
              ],
              tool_choice: { type: "function", function: { name: "evaluate_candidate_match" } }
            }),
          });

          if (!aiResponse.ok) {
            throw new Error(`AI request failed: ${aiResponse.status}`);
          }

          const aiData = await aiResponse.json();
          const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
          
          if (!toolCall) {
            throw new Error("No match data generated");
          }

          const analysis = JSON.parse(toolCall.function.arguments);

          // Create a new candidate entry specifically for this job match
          const { error: insertError } = await supabase
            .from("candidates")
            .upsert({
              id: candidate.id,
              full_name: candidate.full_name,
              email: candidate.email,
              phone: candidate.phone,
              experience_years: candidate.experience_years,
              resume_text: candidate.resume_text,
              resume_url: candidate.resume_url,
              job_id: jobId,
              ai_match_score: Math.round(analysis.match_score),
              ai_match_analysis: analysis,
              status: candidate.status || "in_progress",
            }, {
              onConflict: "id",
              ignoreDuplicates: false
            });

          if (insertError) {
            console.error(`Failed to update candidate ${candidate.id}:`, insertError);
          } else {
            successCount++;
          }
        } catch (error) {
          console.error(`Error analyzing candidate ${candidate.id}:`, error);
          errors.push(`${candidate.full_name}: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      }));

      // Small delay between batches to avoid rate limits
      if (i + batchSize < candidates.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`Matching complete: ${successCount} successful, ${errors.length} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        totalCandidates: candidates.length,
        matchedCount: successCount,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in match-all-candidates-to-job:", error);
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