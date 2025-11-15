import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle, TrendingUp, TrendingDown } from "lucide-react";

export default function AIInterviewResults() {
  const { token } = useParams();
  const { toast } = useToast();
  
  const [interview, setInterview] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, [token]);

  const loadResults = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_interviews")
        .select(`
          *,
          candidates (
            full_name,
            email,
            jobs (
              position
            )
          )
        `)
        .eq("interview_token", token)
        .single();

      if (error) throw error;
      
      if (!data) {
        toast({
          title: "Results not found",
          description: "This interview link is invalid.",
          variant: "destructive",
        });
        return;
      }

      if (data.status !== "completed") {
        toast({
          title: "Interview Not Complete",
          description: "This interview has not been completed yet.",
          variant: "destructive",
        });
        return;
      }

      setInterview(data);
    } catch (error: any) {
      console.error("Error loading results:", error);
      toast({
        title: "Error",
        description: "Failed to load interview results.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6">
          <p className="text-lg">Interview results not found.</p>
        </Card>
      </div>
    );
  }

  const candidateData = interview.candidates as any;
  const evaluation = interview.evaluation || {};
  const score = interview.score || 0;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <Card className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold mb-2">Interview Results</h1>
              <p className="text-muted-foreground">
                {candidateData?.full_name} - {candidateData?.jobs?.position}
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-primary">{score}%</div>
              <p className="text-sm text-muted-foreground">Overall Score</p>
            </div>
          </div>
          <Progress value={score} className="mt-4" />
        </Card>

        {interview.video_url && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Interview Recording</h2>
            <video
              src={interview.video_url}
              controls
              className="w-full rounded-lg bg-black"
            />
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <h2 className="text-xl font-semibold">Strengths</h2>
            </div>
            <ul className="space-y-2">
              {evaluation.strengths?.map((strength: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="h-5 w-5 text-orange-500" />
              <h2 className="text-xl font-semibold">Areas for Improvement</h2>
            </div>
            <ul className="space-y-2">
              {evaluation.weaknesses?.map((weakness: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>{weakness}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Overall Assessment</h2>
          <p className="text-muted-foreground">{evaluation.summary}</p>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Question-by-Question Feedback</h2>
          <div className="space-y-6">
            {evaluation.answerEvaluations?.map((answer: any, index: number) => {
              const questionData = interview.questions[answer.questionIndex];
              const answerData = interview.answers[answer.questionIndex];
              
              return (
                <div key={index} className="border-b pb-4 last:border-0">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">
                      Q{answer.questionIndex + 1}. {questionData?.question}
                    </h3>
                    <Badge variant={answer.score >= 70 ? "default" : "secondary"}>
                      {answer.score}%
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Your Answer:</strong> {answerData?.answer}
                  </p>
                  <div className="space-y-1 text-sm">
                    <p className="text-green-600">
                      <strong>✓ Good:</strong> {answer.feedback}
                    </p>
                    <p className="text-orange-600">
                      <strong>→ Improve:</strong> {answer.improvements}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
