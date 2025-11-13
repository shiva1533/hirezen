import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, TrendingDown, CheckCircle2 } from "lucide-react";

interface MatchScoreDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: {
    full_name: string;
    ai_match_score: number | null;
    ai_match_analysis: any;
  } | null;
}

const MatchScoreDetailModal = ({ open, onOpenChange, candidate }: MatchScoreDetailModalProps) => {
  if (!candidate?.ai_match_analysis) {
    return null;
  }

  const analysis = candidate.ai_match_analysis;
  const bestMatch = analysis.all_matches?.find(
    (m: any) => m.job_id === analysis.best_job_id
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            AI Match Analysis: {candidate.full_name}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Detailed scoring and recommendations for job positions
          </DialogDescription>
        </DialogHeader>

        {/* Overall Score */}
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 border border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Overall Match Score</h3>
              <p className="text-sm text-muted-foreground">{analysis.summary}</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-primary">{candidate.ai_match_score}%</div>
              <Badge variant={candidate.ai_match_score >= 80 ? "default" : "secondary"}>
                {bestMatch?.recommendation || "Evaluated"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Best Match Details */}
        {bestMatch && (
          <div className="space-y-4">
            <Separator />
            
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Best Matching Position
            </h3>

            <div className="space-y-4">
              {/* Score Breakdown */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Skills Match</div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-foreground">{bestMatch.skills_match}%</span>
                    <div className="w-16 h-16">
                      <svg className="transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="hsl(var(--muted))"
                          strokeWidth="3"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="hsl(var(--primary))"
                          strokeWidth="3"
                          strokeDasharray={`${bestMatch.skills_match}, 100`}
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Experience Match</div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-foreground">{bestMatch.experience_match}%</span>
                    <div className="w-16 h-16">
                      <svg className="transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="hsl(var(--muted))"
                          strokeWidth="3"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="hsl(var(--primary))"
                          strokeWidth="3"
                          strokeDasharray={`${bestMatch.experience_match}, 100`}
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Strengths */}
              <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Key Strengths</h4>
                    <p className="text-sm text-green-700 dark:text-green-300">{bestMatch.strengths}</p>
                  </div>
                </div>
              </div>

              {/* Gaps */}
              {bestMatch.gaps && (
                <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <TrendingDown className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Areas for Development</h4>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">{bestMatch.gaps}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* All Matches */}
        {analysis.all_matches && analysis.all_matches.length > 1 && (
          <div className="space-y-4">
            <Separator />
            <h3 className="text-lg font-semibold text-foreground">All Position Matches</h3>
            <div className="space-y-3">
              {analysis.all_matches.map((match: any, index: number) => (
                <div 
                  key={match.job_id || index}
                  className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground">Position {index + 1}</span>
                    <Badge variant={match.match_score >= 80 ? "default" : "secondary"}>
                      {match.match_score}% Match
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {match.recommendation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MatchScoreDetailModal;
