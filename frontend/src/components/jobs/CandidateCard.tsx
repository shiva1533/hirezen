import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Star, Mail, Briefcase } from "lucide-react";

interface Candidate {
  id: string;
  full_name: string;
  email: string;
  experience_years: number;
  ai_match_score: number | null;
  status: string;
}

interface CandidateCardProps {
  candidate: Candidate;
  isDragging?: boolean;
  onClick?: (candidate: Candidate) => void;
}

const CandidateCard = ({ candidate, isDragging = false, onClick }: CandidateCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: candidate.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-50 text-green-700 border-green-200";
    if (score >= 60) return "bg-blue-50 text-blue-700 border-blue-200";
    if (score >= 40) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-red-50 text-red-700 border-red-200";
  };

  const handleClick = (e: React.MouseEvent) => {
    // Don't trigger click when dragging
    if (isDragging || isSortableDragging) return;
    onClick?.(candidate);
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${
        isDragging ? "shadow-xl" : ""
      }`}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            {...attributes}
            {...listeners}
            className="mt-1 cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="font-semibold text-foreground truncate">
                {candidate.full_name}
              </h4>
              {candidate.ai_match_score !== null && (
                <Badge
                  variant="outline"
                  className={`${getScoreColor(candidate.ai_match_score)} flex-shrink-0`}
                >
                  <Star className="h-3 w-3 mr-1" />
                  {candidate.ai_match_score}
                </Badge>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{candidate.email}</span>
              </div>

              {candidate.experience_years && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Briefcase className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{candidate.experience_years} years exp</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CandidateCard;
