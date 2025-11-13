import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowRight, Briefcase, Clock, User, ChevronDown, ChevronUp, Video, CheckCircle, XCircle, Search, Mail, Trophy } from "lucide-react";
import TopNavBar from "@/components/layout/TopNavBar";
import Sidebar from "@/components/layout/Sidebar";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import InterviewDetailsModal from "@/components/pipeline/InterviewDetailsModal";

interface ActivityLog {
  id: string;
  candidate_name: string;
  candidate_email?: string;
  job_position: string | null;
  old_stage: string | null;
  new_stage: string;
  old_stage_label: string | null;
  new_stage_label: string;
  changed_by_name: string;
  created_at: string;
  interview_score?: number;
  interview_details?: any;
  has_video?: boolean;
  video_size?: number;
  server_logs_video?: {
    size_bytes: number;
    size_mb: string;
    stored_at: string;
  };
}

interface InterviewActivity {
  id: string;
  candidate_id: string;
  candidate_name: string;
  candidate_email: string;
  job_position: string;
  score: number;
  status: string;
  completed_at: string;
  video_url: string | null;
  questions: any[];
  answers: any[];
  evaluation: any;
  video_analysis?: any;
}

const ActivityLog = () => {
  const [expandedInterviews, setExpandedInterviews] = useState<Set<string>>(new Set());
  const [selectedInterview, setSelectedInterview] = useState<InterviewActivity | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Enhanced filtering state
  const [emailFilter, setEmailFilter] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [filteredActivities, setFilteredActivities] = useState<ActivityLog[]>([]);

  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 0 });

  const loadActivities = async (page = 1, filters: Record<string, string> = {}) => {
    setIsLoadingActivities(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', '50');

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`http://localhost:3002/activity-logs?${queryParams.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setActivities(result.data || []);
        setPagination(result.pagination);
      } else {
        throw new Error(result.error || 'Failed to load activity logs');
      }
    } catch (error) {
      console.error('Error loading activity logs:', error);
      // Fallback to empty array
      setActivities([]);
    } finally {
      setIsLoadingActivities(false);
    }
  };

  // Load activities on mount and filter changes
  useEffect(() => {
    const filters: Record<string, string> = {};
    if (emailFilter) filters.candidate_email = emailFilter;
    if (stageFilter && stageFilter !== 'all') {
      // Map stage filters to MongoDB query
      if (stageFilter === 'interview') filters.job_position = 'Interview';
      if (stageFilter === 'passed') filters.new_stage = 'Interview Passed';
      if (stageFilter === 'failed') filters.new_stage = 'Interview Failed';
    }

    loadActivities(1, filters);
  }, [emailFilter, stageFilter]);

  // Client-side filtering for already loaded activities
  useEffect(() => {
    if (!activities) return;

    let filtered = activities;

    if (emailFilter.trim()) {
      filtered = filtered.filter(activity =>
        activity.candidate_email?.toLowerCase().includes(emailFilter.toLowerCase()) ||
        activity.candidate_name?.toLowerCase().includes(emailFilter.toLowerCase())
      );
    }

    if (stageFilter && stageFilter !== "all") {
      if (stageFilter === "interview") {
        filtered = filtered.filter(activity =>
          activity.new_stage?.includes("Interview")
        );
      } else if (stageFilter === "passed") {
        filtered = filtered.filter(activity =>
          activity.new_stage?.includes("Passed")
        );
      } else if (stageFilter === "failed") {
        filtered = filtered.filter(activity =>
          activity.new_stage?.includes("Failed")
        );
      }
    }

    setFilteredActivities(filtered);
  }, [activities, emailFilter, stageFilter]);

  const { data: interviews, isLoading: interviewsLoading, refetch: refetchInterviews } = useQuery({
    queryKey: ["completed-interviews-activity"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_interviews")
        .select(`
          id,
          candidate_id,
          score,
          status,
          completed_at,
          video_url,
          video_analysis,
          questions,
          answers,
          evaluation,
          candidates (
            full_name,
            email,
            jobs (
              position
            )
          )
        `)
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      
      return data.map((interview: any) => ({
        id: interview.id,
        candidate_id: interview.candidate_id,
        candidate_name: interview.candidates?.full_name || "Unknown",
        candidate_email: interview.candidates?.email || "",
        job_position: interview.candidates?.jobs?.position || "N/A",
        score: interview.score || 0,
        status: interview.status,
        completed_at: interview.completed_at,
        video_url: interview.video_url,
        video_analysis: interview.video_analysis,
        questions: interview.questions || [],
        answers: interview.answers || [],
        evaluation: interview.evaluation || {},
      })) as InterviewActivity[];
    },
  });

  // Filter rejected and passed interviews
  const rejectedInterviews = interviews?.filter(i => i.score < 50) || [];
  const passedInterviews = interviews?.filter(i => i.score >= 10) || [];

  const toggleInterview = (id: string) => {
    setExpandedInterviews(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const openInterviewDetails = (interview: InterviewActivity) => {
    setSelectedInterview(interview);
    setIsModalOpen(true);
  };

  const isLoading = isLoadingActivities || interviewsLoading;

  // Set up realtime subscriptions
  useEffect(() => {
    const activityChannel = supabase
      .channel('activity-log-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pipeline_activity_logs'
        },
        () => {
          loadActivities(1); // Refetch activities from MongoDB
        }
      )
      .subscribe();

    const interviewChannel = supabase
      .channel('interview-completion-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ai_interviews',
          filter: 'status=eq.completed'
        },
        () => {
          refetchInterviews();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(activityChannel);
      supabase.removeChannel(interviewChannel);
    };
  }, [refetchInterviews]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopNavBar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="ml-0 lg:ml-56 flex-1 p-4 lg:p-8 bg-slate-50 dark:bg-slate-950">
          <div className="container mx-auto space-y-6">
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Pipeline Activity Log</h1>
                <p className="text-muted-foreground mt-1">
                  Track all candidate movements across pipeline stages with enhanced journey tracking
                </p>
              </div>

              {/* Enhanced Filtering Section */}
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search by email or candidate name..."
                          value={emailFilter}
                          onChange={(e) => setEmailFilter(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="sm:w-48">
                      <Select value={stageFilter} onValueChange={setStageFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Filter by stage" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Stages</SelectItem>
                          <SelectItem value="interview">Interview Related</SelectItem>
                          <SelectItem value="passed">Interview Passed</SelectItem>
                          <SelectItem value="failed">Interview Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Rejected Candidates */}
            {rejectedInterviews.length > 0 && (
              <Card className="border-destructive/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <XCircle className="h-5 w-5" />
                    Rejected Candidates (Score &lt; 50%)
                  </CardTitle>
                  <CardDescription>
                    {rejectedInterviews.length} candidate{rejectedInterviews.length !== 1 ? 's' : ''} with low interview scores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {rejectedInterviews.map((interview) => {
                      const isExpanded = expandedInterviews.has(interview.id);
                      const evaluation = interview.evaluation || {};
                      const wrongAnswers = evaluation.answerEvaluations?.filter((a: any) => a.score < 70) || [];
                      
                      return (
                        <div
                          key={interview.id}
                          className="rounded-lg border-2 border-destructive/30 bg-destructive/5 overflow-hidden"
                        >
                          <div className="p-4">
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div className="flex-1">
                                <h4 
                                  className="font-semibold text-foreground flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
                                  onClick={() => openInterviewDetails(interview)}
                                >
                                  {interview.candidate_name}
                                  <Badge variant="destructive" className="text-xs">
                                    {interview.score}% - Rejected
                                  </Badge>
                                </h4>
                                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                  <Briefcase className="h-3 w-3" />
                                  {interview.job_position}
                                </p>
                                <p className="text-xs text-destructive font-medium mt-1">
                                  {wrongAnswers.length} wrong answer{wrongAnswers.length !== 1 ? 's' : ''}
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {formatDistanceToNow(new Date(interview.completed_at), {
                                    addSuffix: true,
                                  })}
                                </span>
                              </div>
                            </div>

                            <Progress value={interview.score} className="mb-3" />

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleInterview(interview.id)}
                              className="w-full justify-between"
                            >
                              <span>View Wrong Answers</span>
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </div>

                          {isExpanded && (
                            <div className="border-t bg-muted/50 p-4 space-y-4">
                              {/* Wrong Answers Only */}
                              <div>
                                <h5 className="font-semibold text-sm mb-3 text-destructive">Wrong Answers</h5>
                                <div className="space-y-3">
                                  {wrongAnswers.map((answer: any, idx: number) => {
                                    const question = interview.questions[answer.questionIndex];
                                    const candidateAnswer = interview.answers[answer.questionIndex];
                                    
                                    return (
                                      <div
                                        key={idx}
                                        className="p-3 rounded-lg border-2 border-red-200 bg-red-50/50 dark:bg-red-950/20"
                                      >
                                        <div className="flex items-start gap-3 mb-2">
                                          <div className="flex-shrink-0 mt-0.5 p-1 rounded-full bg-red-100 dark:bg-red-900">
                                            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                          </div>
                                          
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                              <h6 className="font-semibold text-sm flex items-center gap-2">
                                                <span className="text-red-700 dark:text-red-300">
                                                  Q{answer.questionIndex + 1}.
                                                </span>
                                                <span>{question?.question}</span>
                                              </h6>
                                              <Badge variant="destructive" className="flex-shrink-0">
                                                {answer.score}%
                                              </Badge>
                                            </div>
                                            
                                            <div className="text-xs space-y-2">
                                              <div className="p-2 rounded bg-background/50 border border-red-200">
                                                <span className="font-medium text-muted-foreground">Candidate's Answer:</span>
                                                <p className="mt-1 text-foreground">{candidateAnswer?.answer}</p>
                                              </div>
                                              
                                              {answer.improvements && (
                                                <div className="flex items-start gap-2 p-2 rounded bg-red-100/50 dark:bg-red-900/20">
                                                  <XCircle className="h-3 w-3 mt-0.5 flex-shrink-0 text-red-600" />
                                                  <p className="text-red-700 dark:text-red-400">
                                                    <strong>What went wrong:</strong> {answer.improvements}
                                                  </p>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Passed AI Interviews */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Passed Interviews (Score ≥ 10%)
                </CardTitle>
                <CardDescription>
                  {passedInterviews.length} candidate{passedInterviews.length !== 1 ? 's' : ''} passed the interview
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : passedInterviews.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No passed interviews yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {passedInterviews.map((interview) => {
                      const isExpanded = expandedInterviews.has(interview.id);
                      const evaluation = interview.evaluation || {};
                      
                      return (
                        <div
                          key={interview.id}
                          className="rounded-lg border bg-card overflow-hidden"
                        >
                          <div className="p-4">
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div className="flex-1">
                                <h4 
                                  className="font-semibold text-foreground flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
                                  onClick={() => openInterviewDetails(interview)}
                                >
                                  {interview.candidate_name}
                                  <Badge 
                                    variant={interview.score >= 70 ? "default" : interview.score >= 50 ? "secondary" : "destructive"}
                                    className="text-xs"
                                  >
                                    {interview.score}%
                                  </Badge>
                                </h4>
                                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                  <Briefcase className="h-3 w-3" />
                                  {interview.job_position}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {interview.candidate_email}
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {formatDistanceToNow(new Date(interview.completed_at), {
                                    addSuffix: true,
                                  })}
                                </span>
                              </div>
                            </div>

                            <Progress value={interview.score} className="mb-3" />

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleInterview(interview.id)}
                              className="w-full justify-between"
                            >
                              <span>View Details</span>
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </div>

                          {isExpanded && (
                            <div className="border-t bg-muted/50 p-4 space-y-4">
                              {/* Candidate Profile */}
                              <div>
                                <h5 className="font-semibold text-sm mb-2">Candidate Profile</h5>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Name:</span>
                                    <span className="ml-2 font-medium">{interview.candidate_name}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Position:</span>
                                    <span className="ml-2 font-medium">{interview.job_position}</span>
                                  </div>
                                  <div className="col-span-2">
                                    <span className="text-muted-foreground">Email:</span>
                                    <span className="ml-2 font-medium">{interview.candidate_email}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Video Recording */}
                              {interview.video_url && (
                                <div>
                                  <h5 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                    <Video className="h-4 w-4" />
                                    Interview Recording
                                  </h5>
                                  <video
                                    src={interview.video_url}
                                    controls
                                    className="w-full rounded-lg bg-black max-h-60"
                                  />
                                </div>
                              )}

                              {/* Questions & Answers with Validation */}
                              <div>
                                <h5 className="font-semibold text-sm mb-3">Questions & Answers</h5>
                                <div className="space-y-3">
                                  {evaluation.answerEvaluations?.map((answer: any, idx: number) => {
                                    const question = interview.questions[answer.questionIndex];
                                    const candidateAnswer = interview.answers[answer.questionIndex];
                                    const isCorrect = answer.score >= 70;
                                    
                                    return (
                                      <div
                                        key={idx}
                                        className={`p-3 rounded-lg border-2 ${
                                          isCorrect 
                                            ? 'border-green-200 bg-green-50/50 dark:bg-green-950/10' 
                                            : 'border-red-200 bg-red-50/50 dark:bg-red-950/10'
                                        }`}
                                      >
                                        <div className="flex items-start gap-3 mb-2">
                                          {/* Validation Icon */}
                                          <div className={`flex-shrink-0 mt-0.5 p-1 rounded-full ${
                                            isCorrect ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
                                          }`}>
                                            {isCorrect ? (
                                              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                            ) : (
                                              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                            )}
                                          </div>
                                          
                                          {/* Question and Score */}
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                              <h6 className="font-semibold text-sm flex items-center gap-2">
                                                <span className={isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>
                                                  Q{answer.questionIndex + 1}.
                                                </span>
                                                <span>{question?.question}</span>
                                              </h6>
                                              <Badge 
                                                variant={isCorrect ? "default" : "destructive"}
                                                className="flex-shrink-0"
                                              >
                                                {answer.score}%
                                              </Badge>
                                            </div>
                                            
                                            {/* Answer Section */}
                                            <div className="text-xs space-y-2">
                                              <div className="p-2 rounded bg-background/50 border">
                                                <span className="font-medium text-muted-foreground">Answer:</span>
                                                <p className="mt-1 text-foreground">{candidateAnswer?.answer}</p>
                                              </div>
                                              
                                              {/* Feedback */}
                                              {answer.feedback && (
                                                <div className="flex items-start gap-2 text-green-700 dark:text-green-400">
                                                  <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                                  <p><strong>Good:</strong> {answer.feedback}</p>
                                                </div>
                                              )}
                                              
                                              {/* Improvements */}
                                              {answer.improvements && (
                                                <div className="flex items-start gap-2 text-red-700 dark:text-red-400">
                                                  <XCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                                  <p><strong>Improve:</strong> {answer.improvements}</p>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Overall Assessment */}
                              {evaluation.summary && (
                                <div>
                                  <h5 className="font-semibold text-sm mb-2">Overall Assessment</h5>
                                  <p className="text-sm text-muted-foreground">{evaluation.summary}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pipeline Stage Changes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Pipeline Stage Changes
                </CardTitle>
                <CardDescription>
                  {(filteredActivities.length || activities?.length || 0)} stage transitions recorded
                  {emailFilter && (
                    <span className="ml-2 text-sm">
                      (filtered from {activities?.length || 0} total)
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : !activities || activities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No activity recorded yet. Stage changes will appear here.
                  </div>
                ) : filteredActivities.length === 0 && emailFilter ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No activities match your search criteria.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(emailFilter || stageFilter ? filteredActivities : activities)?.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-shrink-0 mt-1">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <ArrowRight className="h-5 w-5 text-primary" />
                          </div>
                        </div>

                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-start gap-3">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                                    {activity.candidate_name}
                                    {activity.interview_score && (
                                      <Badge variant={activity.interview_score >= 70 ? "default" : activity.interview_score >= 50 ? "secondary" : "destructive"} className="text-xs">
                                        <Trophy className="h-3 w-3 mr-1" />
                                        {activity.interview_score}%
                                      </Badge>
                                    )}
                                  </h4>
                                  {activity.candidate_email && (
                                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                      <Mail className="h-3 w-3" />
                                      {activity.candidate_email}
                                    </p>
                                  )}
                                  {activity.job_position && (
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                      <Briefcase className="h-3 w-3" />
                                      {activity.job_position}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatDistanceToNow(new Date(activity.created_at), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            {activity.old_stage_label ? (
                              <>
                                <Badge variant="outline" className="text-xs">
                                  {activity.old_stage_label}
                                </Badge>
                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                <Badge variant="default" className="text-xs">
                                  {activity.new_stage_label}
                                </Badge>
                              </>
                            ) : (
                              <Badge variant="default" className="text-xs">
                                Added to {activity.new_stage_label}
                              </Badge>
                            )}
                          </div>

                          {/* Interview Details for interview-related activities */}
                          {activity.interview_details && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                MCQ: {activity.interview_details.mcq_score}%
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                Essay: {activity.interview_details.essay_score}%
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                Questions: {activity.interview_details.total_questions}
                              </Badge>
                              {activity.interview_details.video_recorded && (
                                <Badge variant="secondary" className="text-xs flex items-center gap-1">
                                  <Video className="h-3 w-3" />
                                  Video Recorded
                                </Badge>
                              )}
                            </div>
                          )}

                          {/* Video Playback for MongoDB stored videos */}
                          {activity.has_video && (
                            <div className="mt-3">
                              <div className="flex items-center gap-2 mb-2">
                                <Video className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium">Interview Recording</span>
                                {activity.video_size && (
                                  <Badge variant="outline" className="text-xs">
                                    {(activity.video_size / 1024 / 1024).toFixed(2)} MB
                                  </Badge>
                                )}
                              </div>
                              <video
                                src={`http://localhost:3002/activity-logs/${activity.id}/video`}
                                controls
                                className="w-full rounded-lg bg-black max-h-48"
                                preload="metadata"
                              />
                            </div>
                          )}

                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span>Changed by: {activity.changed_by_name}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <InterviewDetailsModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        interview={selectedInterview}
      />
    </div>
  );
};

export default ActivityLog;
