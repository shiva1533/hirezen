import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface JobCandidate {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  experience_years: number | null;
  resume_text: string | null;
  resume_url: string | null;
  ai_match_score: number | null;
  ai_match_analysis: any;
  status: string | null;
  created_at: string;
  updated_at: string;
  job_id: string | null;
}

export interface JobMetrics {
  totalApplicants: number;
  inProgress: number;
  rejected: number;
  completed: number;
  placed: number;
}

export const useJobCandidates = (jobId: string | undefined) => {
  return useQuery({
    queryKey: ["job-candidates", jobId],
    queryFn: async () => {
      if (!jobId) return [];
      
      const { data, error } = await supabase
        .from("candidates")
        .select("*")
        .eq("job_id", jobId)
        .order("ai_match_score", { ascending: false, nullsFirst: false });

      if (error) throw error;
      return data as JobCandidate[];
    },
    enabled: !!jobId,
  });
};

export const calculateJobMetrics = (candidates: JobCandidate[]): JobMetrics => {
  const total = candidates.length;
  
  // Count by status
  const rejected = candidates.filter(c => 
    c.status === "rejected" ||
    c.status?.toLowerCase().includes("reject") || 
    c.status?.toLowerCase().includes("declined")
  ).length;
  
  const placed = candidates.filter(c => 
    c.status === "placed" ||
    c.status?.toLowerCase().includes("placed") || 
    c.status?.toLowerCase().includes("hired")
  ).length;
  
  const completed = candidates.filter(c => 
    c.status === "completed" ||
    c.status?.toLowerCase().includes("completed") || 
    c.status?.toLowerCase().includes("approved") ||
    c.status?.toLowerCase().includes("final")
  ).length;
  
  const inProgress = candidates.filter(c =>
    c.status === "in_progress" ||
    c.status === "pending" ||
    (!c.status || c.status === "") ||
    (c.status !== "rejected" && 
     c.status !== "placed" && 
     c.status !== "completed" &&
     !c.status?.toLowerCase().includes("reject") &&
     !c.status?.toLowerCase().includes("declined") &&
     !c.status?.toLowerCase().includes("placed") &&
     !c.status?.toLowerCase().includes("hired") &&
     !c.status?.toLowerCase().includes("completed") &&
     !c.status?.toLowerCase().includes("approved") &&
     !c.status?.toLowerCase().includes("final"))
  ).length;
  
  return {
    totalApplicants: total,
    inProgress,
    rejected,
    completed,
    placed,
  };
};
