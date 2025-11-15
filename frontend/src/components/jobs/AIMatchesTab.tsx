import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, TrendingUp, TrendingDown, AlertCircle, Loader2, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface MatchAnalysis {
  match_score: number;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
  summary: string;
}

interface Candidate {
  id: string;
  full_name: string;
  email: string;
  experience_years: number;
  ai_match_score: number | null;
  ai_match_analysis: MatchAnalysis | null;
  status: string;
}

const AIMatchesTab = () => {
  const { id: jobId } = useParams();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [isScanningAll, setIsScanningAll] = useState(false);

  useEffect(() => {
    loadCandidates();
  }, [jobId]);

  const loadCandidates = async () => {
    setIsLoading(true);
    try {
      // Get ALL candidates and show their match scores for this job
      const { data, error } = await supabase
        .from("candidates")
        .select("*")
        .eq("job_id", jobId)
        .order("ai_match_score", { ascending: false, nullsFirst: false });

      if (error) throw error;
      
      // Cast ai_match_analysis from Json to MatchAnalysis type
      const typedCandidates = (data || []).map(candidate => ({
        ...candidate,
        ai_match_analysis: candidate.ai_match_analysis as unknown as MatchAnalysis | null
      }));
      
      setCandidates(typedCandidates);
    } catch (error) {
      console.error("Error loading candidates:", error);
      toast({
        title: "Error",
        description: "Failed to load candidates",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const scanAllProfiles = async () => {
    setIsScanningAll(true);
    try {
      toast({
        title: "Scanning Profiles",
        description: "AI is analyzing all profiles against this job. This may take a moment...",
      });

      const { error } = await supabase.functions.invoke("match-all-candidates-to-job", {
        body: { jobId },
      });

      if (error) throw error;

      toast({
        title: "Scan Complete",
        description: "All profiles have been analyzed and matched to this job",
      });

      await loadCandidates();
    } catch (error: any) {
      console.error("Error scanning profiles:", error);
      toast({
        title: "Scan Failed",
        description: error.message || "Failed to scan profiles",
        variant: "destructive",
      });
    } finally {
      setIsScanningAll(false);
    }
  };

  const analyzeCandidate = async (candidateId: string) => {
    setAnalyzingId(candidateId);
    try {
      const { error } = await supabase.functions.invoke("analyze-candidate-match", {
        body: { candidateId },
      });

      if (error) throw error;

      toast({
        title: "Analysis Complete",
        description: "AI matching analysis completed successfully",
      });

      await loadCandidates();
    } catch (error: any) {
      console.error("Error analyzing candidate:", error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze candidate",
        variant: "destructive",
      });
    } finally {
      setAnalyzingId(null);
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case "highly_recommended":
        return "bg-green-50 text-green-700 border-green-200";
      case "recommended":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "consider":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "not_recommended":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-amber-600";
    return "text-red-600";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No candidates found for this position</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            AI-Powered Candidate Matching
          </h3>
        </div>
        <Button
          onClick={scanAllProfiles}
          disabled={isScanningAll}
          className="gap-2"
          size="lg"
        >
          {isScanningAll ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Scanning All Profiles...
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              Scan All Profiles
            </>
          )}
        </Button>
      </div>

      {candidates.map((candidate) => (
        <Card key={candidate.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl">{candidate.full_name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{candidate.email}</p>
                <p className="text-sm text-muted-foreground">
                  {candidate.experience_years} years experience
                </p>
              </div>
              {candidate.ai_match_score !== null ? (
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getScoreColor(candidate.ai_match_score)}`}>
                    {candidate.ai_match_score}
                  </div>
                  <div className="text-xs text-muted-foreground">Match Score</div>
                </div>
              ) : (
                <Button
                  onClick={() => analyzeCandidate(candidate.id)}
                  disabled={analyzingId === candidate.id}
                  className="gap-2"
                >
                  {analyzingId === candidate.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Analyze Match
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>

          {candidate.ai_match_analysis && (
            <CardContent className="space-y-4">
              <div>
                <Badge
                  variant="outline"
                  className={getRecommendationColor(candidate.ai_match_analysis.recommendation)}
                >
                  {candidate.ai_match_analysis.recommendation.replace("_", " ").toUpperCase()}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground">
                {candidate.ai_match_analysis.summary}
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-semibold text-foreground">Strengths</span>
                  </div>
                  <ul className="space-y-1">
                    {candidate.ai_match_analysis.strengths.map((strength, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">•</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-semibold text-foreground">Areas of Concern</span>
                  </div>
                  <ul className="space-y-1">
                    {candidate.ai_match_analysis.weaknesses.map((weakness, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-amber-600 mt-0.5">•</span>
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
};

export default AIMatchesTab;
