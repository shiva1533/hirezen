import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ProfileFilters } from "@/components/profiles/ProfilesFilterBar";

export interface Candidate {
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
  skills: string | null;
  jobs: {
    id: string;
    position: string;
    department: string | null;
  } | null;
}

export const useCandidates = (filters: ProfileFilters) => {
  return useQuery({
    queryKey: ["candidates", filters],
    queryFn: async () => {
      let query = supabase
        .from("candidates")
        .select(`
          *,
          jobs:job_id (
            id,
            position,
            department
          )
        `);

      // Apply experience filter
      if (filters.experienceRange && filters.experienceRange !== "all") {
        if (filters.experienceRange === "0-2") {
          query = query.gte("experience_years", 0).lte("experience_years", 2);
        } else if (filters.experienceRange === "2-5") {
          query = query.gte("experience_years", 2).lte("experience_years", 5);
        } else if (filters.experienceRange === "5-10") {
          query = query.gte("experience_years", 5).lte("experience_years", 10);
        } else if (filters.experienceRange === "10+") {
          query = query.gte("experience_years", 10);
        }
      }

      // Apply search filter (name, email, phone)
      if (filters.search) {
        query = query.or(
          `full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`
        );
      }

      // Apply sorting
      if (filters.sortBy === "recent") {
        query = query.order("created_at", { ascending: false });
      } else if (filters.sortBy === "exp-high") {
        query = query.order("experience_years", { ascending: false, nullsFirst: false });
      } else if (filters.sortBy === "exp-low") {
        query = query.order("experience_years", { ascending: true, nullsFirst: false });
      } else if (filters.sortBy === "alphabetical") {
        query = query.order("full_name", { ascending: true });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      // Client-side filtering for skills and location (since they're in resume_text)
      let filteredData = data as Candidate[];

      if (filters.skills) {
        const skillsArray = filters.skills.toLowerCase().split(",").map(s => s.trim());
        filteredData = filteredData.filter(candidate => {
          const resumeText = candidate.resume_text?.toLowerCase() || "";
          return skillsArray.some(skill => resumeText.includes(skill));
        });
      }

      if (filters.location && filters.location !== "all") {
        filteredData = filteredData.filter(candidate => {
          const resumeText = candidate.resume_text?.toLowerCase() || "";
          return resumeText.includes(filters.location.toLowerCase());
        });
      }

      // Remove duplicates based on email, keeping the most recent one
      const uniqueCandidates = new Map<string, Candidate>();
      
      filteredData.forEach(candidate => {
        const email = candidate.email.toLowerCase();
        const existing = uniqueCandidates.get(email);
        
        // If no existing candidate with this email, or this one is more recent, keep it
        if (!existing || new Date(candidate.updated_at) > new Date(existing.updated_at)) {
          uniqueCandidates.set(email, candidate);
        }
      });

      // Convert map back to array and maintain original sort order
      const deduplicatedData = Array.from(uniqueCandidates.values());
      
      // Re-sort based on the original sort criteria
      if (filters.sortBy === "recent") {
        deduplicatedData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      } else if (filters.sortBy === "exp-high") {
        deduplicatedData.sort((a, b) => (b.experience_years || 0) - (a.experience_years || 0));
      } else if (filters.sortBy === "exp-low") {
        deduplicatedData.sort((a, b) => (a.experience_years || 0) - (b.experience_years || 0));
      } else if (filters.sortBy === "alphabetical") {
        deduplicatedData.sort((a, b) => a.full_name.localeCompare(b.full_name));
      } else {
        deduplicatedData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }

      return deduplicatedData;
    },
  });
};
