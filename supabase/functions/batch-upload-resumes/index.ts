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
    const { candidates } = await req.json();

    if (!candidates || !Array.isArray(candidates)) {
      return new Response(
        JSON.stringify({ error: "Invalid request: candidates array required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing batch upload of ${candidates.length} candidates`);

    // Create Supabase client with service role to bypass RLS
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: { autoRefreshToken: false, persistSession: false },
      }
    );

    const results: {
      success: Array<{ id: string; email: string; full_name: string; updated?: boolean }>;
      failed: Array<{ email: string; error: string; isDuplicate?: boolean }>;
    } = {
      success: [],
      failed: [],
    };

    // Process each candidate
    for (const candidate of candidates) {
      try {
        // Validate required fields
        if (!candidate.full_name || !candidate.email) {
          console.error("Missing required fields:", candidate);
          results.failed.push({
            email: candidate.email || "unknown",
            error: "Missing required fields (full_name or email)",
          });
          continue;
        }

        // Check for duplicates
        const { data: existingCandidate } = await supabaseClient
          .from("candidates")
          .select("id, full_name")
          .eq("email", candidate.email)
          .maybeSingle();

        if (existingCandidate) {
          console.log(`Existing candidate found, performing update: ${candidate.email}`);
          
          // Fetch full existing data for comparison
          const { data: oldData } = await supabaseClient
            .from("candidates")
            .select("*")
            .eq("id", existingCandidate.id)
            .single();

          const newData = {
            full_name: candidate.full_name,
            phone: candidate.phone || null,
            experience_years: candidate.experience_years || null,
            resume_text: candidate.resume_text || null,
            resume_url: candidate.resume_url || null,
            job_id: candidate.job_id || null,
            skills: candidate.skills || null,
            status: "pending",
          };

          // Track changed fields
          const changedFields: string[] = [];
          const oldValues: Record<string, any> = {};
          const newValues: Record<string, any> = {};

          if (oldData) {
            for (const [key, newValue] of Object.entries(newData)) {
              const oldValue = oldData[key];
              if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
                changedFields.push(key);
                oldValues[key] = oldValue;
                newValues[key] = newValue;
              }
            }
          }

          const { data: updatedRow, error: updateError } = await supabaseClient
            .from("candidates")
            .update(newData)
            .eq("id", existingCandidate.id)
            .select("id")
            .single();

          if (updateError) {
            console.error("Update error:", updateError);
            results.failed.push({ email: candidate.email, error: updateError.message });
            continue;
          }

          // Log the change
          if (changedFields.length > 0) {
            const { error: logError } = await supabaseClient
              .from("candidate_change_logs")
              .insert({
                candidate_id: existingCandidate.id,
                candidate_email: candidate.email,
                action: "updated",
                changed_fields: changedFields,
                old_values: oldValues,
                new_values: newValues,
                source: "resume_upload",
              });
            
            if (logError) {
              console.error("Failed to log change:", logError);
            }
          }

          results.success.push({ 
            id: updatedRow?.id || existingCandidate.id, 
            email: candidate.email, 
            full_name: candidate.full_name, 
            updated: true 
          });

          // Trigger background tasks
          supabaseClient.functions
            .invoke("match-candidate-to-jobs", { body: { candidateId: existingCandidate.id } })
            .catch((err) => console.error("Failed to trigger matching:", err));
          supabaseClient.functions
            .invoke("send-candidate-email", { body: { candidateId: existingCandidate.id, type: "resume_processed" } })
            .catch((err) => console.error("Failed to send email:", err));
          
          continue;
        }

        // Insert candidate using service role (bypasses RLS)
        const { data: insertedCandidate, error: insertError } = await supabaseClient
          .from("candidates")
          .insert({
            full_name: candidate.full_name,
            email: candidate.email,
            phone: candidate.phone || null,
            experience_years: candidate.experience_years || null,
            resume_text: candidate.resume_text || null,
            resume_url: candidate.resume_url || null,
            job_id: candidate.job_id || null,
            status: "pending",
            skills: candidate.skills || null,
          })
          .select()
          .single();

        if (insertError) {
          console.error("Insert error:", insertError);
          results.failed.push({
            email: candidate.email,
            error: insertError.message,
          });
          continue;
        }

        console.log(`Successfully inserted candidate: ${candidate.email}`);
        
        // Log the creation
        const { error: logError } = await supabaseClient
          .from("candidate_change_logs")
          .insert({
            candidate_id: insertedCandidate.id,
            candidate_email: candidate.email,
            action: "created",
            changed_fields: null,
            old_values: null,
            new_values: {
              full_name: candidate.full_name,
              email: candidate.email,
              phone: candidate.phone,
              skills: candidate.skills,
              experience_years: candidate.experience_years,
            },
            source: "resume_upload",
          });
        
        if (logError) {
          console.error("Failed to log creation:", logError);
        }
        
        results.success.push({
          id: insertedCandidate.id,
          email: candidate.email,
          full_name: candidate.full_name,
        });

        // Trigger AI matching asynchronously (don't wait)
        supabaseClient.functions
          .invoke("match-candidate-to-jobs", {
            body: { candidateId: insertedCandidate.id },
          })
          .catch((err) => console.error("Failed to trigger matching:", err));

        // Send email notification (don't wait)
        supabaseClient.functions
          .invoke("send-candidate-email", {
            body: {
              candidateId: insertedCandidate.id,
              type: "resume_processed",
            },
          })
          .catch((err) => console.error("Failed to send email:", err));
      } catch (error: any) {
        console.error("Error processing candidate:", error);
        results.failed.push({
          email: candidate.email || "unknown",
          error: error.message || "Unknown error",
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        results: {
          successCount: results.success.length,
          failedCount: results.failed.length,
          successfulCandidates: results.success,
          failedCandidates: results.failed,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Batch upload error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
