import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import CandidateCard from "./CandidateCard";

interface Stage {
  id: string;
  label: string;
  color: string;
}

interface Candidate {
  id: string;
  full_name: string;
  email: string;
  experience_years: number;
  ai_match_score: number | null;
  status: string;
}

interface PipelineColumnProps {
  stage: Stage;
  candidates: Candidate[];
  onCandidateClick?: (candidate: Candidate) => void;
}

const PipelineColumn = ({ stage, candidates, onCandidateClick }: PipelineColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-80 bg-muted/30 rounded-[16px] p-4 transition-all ${
        isOver ? "ring-2 ring-primary bg-muted/50" : ""
      }`}
    >
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-foreground">{stage.label}</h3>
          <span className="text-sm text-muted-foreground">
            {candidates.length}
          </span>
        </div>
        <div className={`h-1 w-full rounded-full bg-gradient-to-r ${stage.color}`} />
      </div>

      <SortableContext
        items={candidates.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3 min-h-[200px]">
          {candidates.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-sm text-muted-foreground border-2 border-dashed border-border rounded-lg">
              Drop candidates here
            </div>
          ) : (
            candidates.map((candidate) => (
              <CandidateCard 
                key={candidate.id} 
                candidate={candidate} 
                onClick={onCandidateClick}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
};

export default PipelineColumn;
