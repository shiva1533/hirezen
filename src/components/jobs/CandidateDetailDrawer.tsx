import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mail, Phone, Calendar, Briefcase, Target, FileText, Clock } from "lucide-react";
import { format } from "date-fns";

interface Candidate {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  experience_years: number;
  ai_match_score: number | null;
  ai_match_analysis: any;
  status: string;
  resume_text: string | null;
  resume_url: string | null;
  created_at: string;
  updated_at: string;
}

interface CandidateDetailDrawerProps {
  candidate: Candidate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CandidateDetailDrawer = ({ candidate, open, onOpenChange }: CandidateDetailDrawerProps) => {
  if (!candidate) return null;

  const getScoreColor = (score: number | null) => {
    if (!score) return "bg-muted text-muted-foreground";
    if (score >= 80) return "bg-green-500/10 text-green-600 border-green-500/20";
    if (score >= 60) return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    if (score >= 40) return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
    return "bg-red-500/10 text-red-600 border-red-500/20";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      applied: "Applied",
      screening: "Screening Test",
      demo: "Demo Round",
      interview: "Panel Interview",
      approval: "Final Approval",
    };
    return labels[status] || status;
  };

  const analysis = candidate.ai_match_analysis as {
    strengths?: string[];
    weaknesses?: string[];
    recommendation?: string;
    summary?: string;
  } | null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-hidden p-0">
        <SheetHeader className="px-6 pt-6 pb-4 bg-muted/30">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-2xl">{candidate.full_name}</SheetTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="capitalize">
                  {getStatusLabel(candidate.status)}
                </Badge>
                {candidate.ai_match_score !== null && (
                  <Badge variant="outline" className={getScoreColor(candidate.ai_match_score)}>
                    <Target className="h-3 w-3 mr-1" />
                    {candidate.ai_match_score}% Match
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-140px)]">
          <div className="px-6 py-4 space-y-6">
            {/* Contact Information */}
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Contact Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${candidate.email}`} className="text-primary hover:underline">
                    {candidate.email}
                  </a>
                </div>
                {candidate.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${candidate.phone}`} className="text-foreground hover:text-primary">
                      {candidate.phone}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {candidate.experience_years} {candidate.experience_years === 1 ? 'year' : 'years'} of experience
                  </span>
                </div>
              </div>
            </section>

            <Separator />

            {/* AI Match Analysis */}
            {analysis && (
              <>
                <section>
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    AI Match Analysis
                  </h3>
                  {analysis.summary && (
                    <p className="text-sm text-muted-foreground mb-4">{analysis.summary}</p>
                  )}
                  
                  {analysis.strengths && analysis.strengths.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-xs font-medium text-foreground mb-2">Strengths</h4>
                      <ul className="space-y-1">
                        {analysis.strengths.map((strength, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-green-500 mt-1">•</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.weaknesses && analysis.weaknesses.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-xs font-medium text-foreground mb-2">Areas for Consideration</h4>
                      <ul className="space-y-1">
                        {analysis.weaknesses.map((weakness, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-yellow-500 mt-1">•</span>
                            <span>{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.recommendation && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <h4 className="text-xs font-medium text-foreground mb-1">Recommendation</h4>
                      <p className="text-sm text-muted-foreground">{analysis.recommendation}</p>
                    </div>
                  )}
                </section>

                <Separator />
              </>
            )}

            {/* Resume */}
            {(candidate.resume_text || candidate.resume_url) && (
              <>
                <section>
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    Resume
                  </h3>
                  {candidate.resume_url && (
                    <a
                      href={candidate.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-3"
                    >
                      <FileText className="h-4 w-4" />
                      View Resume Document
                    </a>
                  )}
                  {candidate.resume_text && (
                    <div className="bg-muted/30 rounded-lg p-4 text-sm text-muted-foreground whitespace-pre-wrap max-h-96 overflow-y-auto">
                      {candidate.resume_text}
                    </div>
                  )}
                </section>

                <Separator />
              </>
            )}

            {/* Activity History */}
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Activity History
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-sm">
                  <div className="mt-1">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground font-medium">Current Stage: {getStatusLabel(candidate.status)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Last updated {format(new Date(candidate.updated_at), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-sm">
                  <div className="mt-1">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground font-medium">Application Submitted</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      {format(new Date(candidate.created_at), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default CandidateDetailDrawer;
