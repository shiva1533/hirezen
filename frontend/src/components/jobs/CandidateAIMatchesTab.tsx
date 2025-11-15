import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Briefcase, MapPin, TrendingUp, TrendingDown, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AIMatchesTabContentProps {
  candidateId: string;
}

interface JobMatch {
  job_id: string;
  match_score: number;
  experience_match: number;
  skills_match: number;
  recommendation: string;
  strengths: string;
  gaps: string;
}

interface Job {
  id: string;
  position: string;
  department: string | null;
  experience: string | null;
  primary_locations: string | null;
  vacancies: number;
}

const AIMatchesTabContent = ({ candidateId }: AIMatchesTabContentProps) => {
  const navigate = useNavigate();

  // Fetch candidate with AI match analysis
  const { data: candidate, isLoading: candidateLoading } = useQuery({
    queryKey: ['candidate-ai-matches', candidateId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('candidates')
        .select('ai_match_analysis')
        .eq('id', candidateId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!candidateId
  });

  const aiAnalysis = candidate?.ai_match_analysis as { all_matches?: JobMatch[] } | null;
  const matches = aiAnalysis?.all_matches || [];

  // Fetch job details for matched positions
  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['matched-jobs', matches.map(m => m.job_id)],
    queryFn: async () => {
      if (matches.length === 0) return [];
      
      const jobIds = matches.map(m => m.job_id);
      const { data, error } = await supabase
        .from('jobs')
        .select('id, position, department, experience, primary_locations, vacancies')
        .in('id', jobIds);

      if (error) throw error;
      return data as Job[];
    },
    enabled: matches.length > 0
  });

  const getScoreColor = (score: number) => {
    if (score >= 70) return "bg-green-500/10 text-green-700 border-green-500/20";
    if (score >= 50) return "bg-blue-500/10 text-blue-700 border-blue-500/20";
    if (score >= 30) return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20";
    return "bg-red-500/10 text-red-700 border-red-500/20";
  };

  const getRecommendationColor = (recommendation: string) => {
    if (recommendation.includes("Strong") || recommendation.includes("Excellent")) {
      return "bg-green-500/10 text-green-700 border-green-500/20";
    }
    if (recommendation.includes("Potential")) {
      return "bg-blue-500/10 text-blue-700 border-blue-500/20";
    }
    return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20";
  };

  if (candidateLoading || jobsLoading) {
    return (
      <div className="px-8 py-12 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading AI matches...</p>
        </div>
      </div>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="px-8 py-12">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No AI matches found for this candidate.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-8 py-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">
          AI Matched Positions ({matches.length})
        </h2>
      </div>

      <div className="grid gap-4">
        {matches.map((match) => {
          const job = jobs?.find(j => j.id === match.job_id);
          if (!job) return null;

          return (
            <Card 
              key={match.job_id} 
              className="p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/jobs/${job.id}`)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  {/* Job Header */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      {job.position}
                      <Badge variant="outline" className={getScoreColor(match.match_score)}>
                        <Target className="h-3 w-3 mr-1" />
                        {match.match_score}% Match
                      </Badge>
                      <Badge variant="outline" className={getRecommendationColor(match.recommendation)}>
                        {match.recommendation}
                      </Badge>
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      {job.department && (
                        <div className="flex items-center gap-1.5">
                          <Briefcase className="h-4 w-4" />
                          <span>{job.department}</span>
                        </div>
                      )}
                      {job.primary_locations && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" />
                          <span>{job.primary_locations}</span>
                        </div>
                      )}
                      {job.experience && (
                        <span>{job.experience} years</span>
                      )}
                    </div>
                  </div>

                  {/* Match Metrics */}
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Experience Match:</span>
                      <Badge variant="secondary" className="bg-background">
                        {match.experience_match}%
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Skills Match:</span>
                      <Badge variant="secondary" className="bg-background">
                        {match.skills_match}%
                      </Badge>
                    </div>
                  </div>

                  {/* Strengths */}
                  {match.strengths && (
                    <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-green-700 mb-1">Strengths</p>
                          <p className="text-sm text-foreground">{match.strengths}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Gaps */}
                  {match.gaps && (
                    <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <TrendingDown className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-yellow-700 mb-1">Gaps</p>
                          <p className="text-sm text-foreground">{match.gaps}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AIMatchesTabContent;