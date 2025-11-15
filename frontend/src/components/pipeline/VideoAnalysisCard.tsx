import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, TrendingUp, Eye, Users } from "lucide-react";

interface VideoAnalysis {
  overallEngagement: number;
  overallConfidence: number;
  overallProfessionalism: number;
  engagementNotes: string;
  confidenceNotes: string;
  bodyLanguageNotes: string;
  strengths: string[];
  areasForImprovement: string[];
  summary: string;
}

interface VideoAnalysisCardProps {
  analysis: VideoAnalysis;
}

export function VideoAnalysisCard({ analysis }: VideoAnalysisCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = (score: number) => {
    if (score >= 8) return "bg-green-500";
    if (score >= 6) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Brain className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">AI Video Analysis</h3>
        <Badge variant="outline" className="ml-auto">
          Powered by AI
        </Badge>
      </div>

      {/* Overall Scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Engagement</span>
            </div>
            <span className={`text-lg font-bold ${getScoreColor(analysis.overallEngagement)}`}>
              {analysis.overallEngagement}/10
            </span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div 
              className={`h-full ${getProgressColor(analysis.overallEngagement)} transition-all`}
              style={{ width: `${analysis.overallEngagement * 10}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">{analysis.engagementNotes}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Confidence</span>
            </div>
            <span className={`text-lg font-bold ${getScoreColor(analysis.overallConfidence)}`}>
              {analysis.overallConfidence}/10
            </span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div 
              className={`h-full ${getProgressColor(analysis.overallConfidence)} transition-all`}
              style={{ width: `${analysis.overallConfidence * 10}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">{analysis.confidenceNotes}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Professionalism</span>
            </div>
            <span className={`text-lg font-bold ${getScoreColor(analysis.overallProfessionalism)}`}>
              {analysis.overallProfessionalism}/10
            </span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div 
              className={`h-full ${getProgressColor(analysis.overallProfessionalism)} transition-all`}
              style={{ width: `${analysis.overallProfessionalism * 10}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">{analysis.bodyLanguageNotes}</p>
        </div>
      </div>

      {/* Summary */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-semibold mb-2">Overall Assessment</h4>
        <p className="text-sm text-muted-foreground">{analysis.summary}</p>
      </div>

      {/* Strengths and Areas for Improvement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
        <div>
          <h4 className="text-sm font-semibold mb-2 text-green-600">Strengths</h4>
          <ul className="space-y-1">
            {analysis.strengths.map((strength, idx) => (
              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                {strength}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-2 text-orange-600">Areas for Improvement</h4>
          <ul className="space-y-1">
            {analysis.areasForImprovement.map((area, idx) => (
              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-orange-600 mt-0.5">→</span>
                {area}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
