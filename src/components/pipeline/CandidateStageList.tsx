import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Phone, Briefcase, MoveRight, Users } from "lucide-react";

interface CandidateStageListProps {
  stage: string;
  stageLabel: string;
}

const PIPELINE_STAGES = [
  { value: "hr", label: "HR" },
  { value: "written_test", label: "Written Test" },
  { value: "demo_slot", label: "Demo Slot" },
  { value: "demo_schedule", label: "Demo Schedule" },
  { value: "feedback", label: "Feedback/Result" },
  { value: "interaction", label: "Interaction" },
  { value: "bgv", label: "BGV" },
  { value: "confirmation", label: "Confirmation" },
  { value: "upload_documents", label: "Upload Documents" },
  { value: "verify", label: "Verify" },
  { value: "approval", label: "Approval" },
  { value: "offer_letter", label: "Offer Letter" },
  { value: "onboarding", label: "Onboarding" },
];

export const CandidateStageList = ({ stage, stageLabel }: CandidateStageListProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [bulkTargetStage, setBulkTargetStage] = useState<string>("");

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('candidates-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'candidates'
        },
        (payload: any) => {
          const oldRecord = payload.old;
          const newRecord = payload.new;
          
          // Check if status changed
          if (oldRecord.status !== newRecord.status) {
            const oldStageLabel = PIPELINE_STAGES.find(s => s.value === oldRecord.status)?.label || oldRecord.status;
            const newStageLabel = PIPELINE_STAGES.find(s => s.value === newRecord.status)?.label || newRecord.status;
            
            toast({
              title: "Candidate Moved",
              description: `${newRecord.full_name} moved from ${oldStageLabel} to ${newStageLabel}`,
            });
          }
          
          // Invalidate all candidate queries
          queryClient.invalidateQueries({ queryKey: ["candidates"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, toast]);

  const { data: candidates, isLoading } = useQuery({
    queryKey: ["candidates", stage],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("candidates")
        .select(`
          *,
          jobs (
            id,
            position,
            department
          )
        `)
        .eq("status", stage)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const updateStageMutation = useMutation({
    mutationFn: async ({ candidateId, newStage, oldStage }: { candidateId: string; newStage: string; oldStage: string }) => {
      const { error } = await supabase
        .from("candidates")
        .update({ status: newStage })
        .eq("id", candidateId);

      if (error) throw error;

      // Send stage change email
      supabase.functions.invoke("send-candidate-email", {
        body: { 
          candidateId,
          type: "stage_change",
          oldStage,
          newStage
        },
      }).catch(err => console.error("Failed to send email:", err));
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      queryClient.invalidateQueries({ queryKey: ["job-candidates"] });
      queryClient.invalidateQueries({ queryKey: ["pipeline-activity"] });
      
      // Send stage change email
      try {
        await supabase.functions.invoke("send-candidate-email", {
          body: {
            candidateId: variables.candidateId,
            type: "stage_change",
            oldStage: variables.oldStage,
            newStage: variables.newStage,
          },
        });
      } catch (error) {
        console.error("Failed to send stage change email:", error);
      }

      // If moved to confirmation stage, create AI interview and send email
      if (variables.newStage === "confirmation") {
        try {
          // Create AI interview record
          const { data: interviewData, error: interviewError } = await supabase
            .from("ai_interviews")
            .insert({
              candidate_id: variables.candidateId,
            })
            .select()
            .single();

          if (interviewError) throw interviewError;

          // Send AI interview email
          await supabase.functions.invoke("send-candidate-email", {
            body: {
              candidateId: variables.candidateId,
              type: "ai_interview",
              interviewToken: interviewData.interview_token,
            },
          });

          toast({
            title: "AI Interview Scheduled",
            description: "Interview invitation sent to candidate.",
          });
        } catch (error) {
          console.error("Failed to create AI interview:", error);
        }
      }

      toast({
        title: "Success",
        description: "Candidate stage updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to move candidate",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ candidateIds, newStage, oldStage }: { candidateIds: string[]; newStage: string; oldStage: string }) => {
      const { error } = await supabase
        .from("candidates")
        .update({ status: newStage })
        .in("id", candidateIds);

      if (error) throw error;

      // Send stage change emails to all candidates
      for (const candidateId of candidateIds) {
        supabase.functions.invoke("send-candidate-email", {
          body: { 
            candidateId,
            type: "stage_change",
            oldStage,
            newStage
          },
        }).catch(err => console.error("Failed to send email:", err));
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      setSelectedCandidates([]);
      setBulkTargetStage("");
      toast({
        title: "Success",
        description: `${variables.candidateIds.length} candidate(s) moved successfully. Email notifications sent.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to move candidates",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  const handleBulkMove = () => {
    if (selectedCandidates.length === 0 || !bulkTargetStage) {
      toast({
        title: "Selection Required",
        description: "Please select candidates and a target stage",
        variant: "destructive",
      });
      return;
    }

    bulkUpdateMutation.mutate({
      candidateIds: selectedCandidates,
      newStage: bulkTargetStage,
      oldStage: stage,
    });
  };

  const toggleSelectAll = () => {
    if (selectedCandidates.length === candidates?.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(candidates?.map((c: any) => c.id) || []);
    }
  };

  const toggleSelectCandidate = (candidateId: string) => {
    setSelectedCandidates((prev) =>
      prev.includes(candidateId)
        ? prev.filter((id) => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!candidates || candidates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Candidates in {stageLabel}</CardTitle>
          <CardDescription>No candidates at this stage yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No candidates found in this stage
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Candidates in {stageLabel}</CardTitle>
            <CardDescription>{candidates.length} candidate(s) at this stage</CardDescription>
          </div>
          {candidates.length > 0 && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="select-all"
                checked={selectedCandidates.length === candidates.length}
                onCheckedChange={toggleSelectAll}
              />
              <label
                htmlFor="select-all"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Select All
              </label>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {selectedCandidates.length > 0 && (
          <div className="mb-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Users className="h-4 w-4" />
                {selectedCandidates.length} selected
              </div>
              <div className="flex items-center gap-2 flex-1">
                <span className="text-sm text-muted-foreground">Move to:</span>
                <Select value={bulkTargetStage} onValueChange={setBulkTargetStage}>
                  <SelectTrigger className="w-[200px] h-9">
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {PIPELINE_STAGES.map((stageOption) => (
                      <SelectItem key={stageOption.value} value={stageOption.value}>
                        {stageOption.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleBulkMove}
                  disabled={!bulkTargetStage || bulkUpdateMutation.isPending}
                  size="sm"
                >
                  {bulkUpdateMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Moving...
                    </>
                  ) : (
                    "Move Selected"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
        <div className="space-y-4">
          {candidates.map((candidate: any) => (
            <div
              key={candidate.id}
              className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <Checkbox
                checked={selectedCandidates.includes(candidate.id)}
                onCheckedChange={() => toggleSelectCandidate(candidate.id)}
                className="mt-4"
              />
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {candidate.full_name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-foreground">{candidate.full_name}</h4>
                    {candidate.jobs && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {candidate.jobs.position} - {candidate.jobs.department}
                      </p>
                    )}
                  </div>
                  {candidate.ai_match_score && (
                    <Badge variant="secondary" className="shrink-0">
                      {candidate.ai_match_score}% Match
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {candidate.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {candidate.email}
                    </div>
                  )}
                  {candidate.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {candidate.phone}
                    </div>
                  )}
                  {candidate.experience_years && (
                    <div className="text-sm">
                      {candidate.experience_years} years exp.
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <MoveRight className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Move to:</span>
                  <Select
                    value={candidate.status}
                    onValueChange={(newStage) =>
                      updateStageMutation.mutate({
                        candidateId: candidate.id,
                        newStage,
                        oldStage: candidate.status,
                      })
                    }
                  >
                    <SelectTrigger className="w-[200px] h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PIPELINE_STAGES.map((stageOption) => (
                        <SelectItem key={stageOption.value} value={stageOption.value}>
                          {stageOption.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
