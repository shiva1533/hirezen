import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import PipelineColumn from "./PipelineColumn";
import CandidateCard from "./CandidateCard";
import PipelineBoardFilters from "./PipelineBoardFilters";
import CandidateDetailDrawer from "./CandidateDetailDrawer";

const PIPELINE_STAGES = [
  { id: "in_progress", label: "In Progress", color: "from-amber-400 to-amber-600" },
  { id: "rejected", label: "Rejected", color: "from-red-400 to-red-600" },
  { id: "completed", label: "Completed", color: "from-green-400 to-green-600" },
  { id: "placed", label: "Placed", color: "from-purple-400 to-purple-600" },
];

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

const PipelineBoard = () => {
  const { id: jobId } = useParams();
  const [candidates, setCandidates] = useState<Record<string, Candidate[]>>({});
  const [activeCandidate, setActiveCandidate] = useState<Candidate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState("match-desc");
  const [filterExperience, setFilterExperience] = useState("all");
  const [filterMatchScore, setFilterMatchScore] = useState("all");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadCandidates();
  }, [jobId]);

  const loadCandidates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("candidates")
        .select("*")
        .eq("job_id", jobId);

      if (error) throw error;

      // Group candidates by stage
      const grouped = PIPELINE_STAGES.reduce((acc, stage) => {
        acc[stage.id] = (data || []).filter((c) => c.status === stage.id);
        return acc;
      }, {} as Record<string, Candidate[]>);

      setCandidates(grouped);
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

  const filterAndSortCandidates = (candidateList: Candidate[]) => {
    let filtered = [...candidateList];

    // Apply experience filter
    if (filterExperience !== "all") {
      filtered = filtered.filter((c) => {
        const exp = c.experience_years || 0;
        switch (filterExperience) {
          case "0-2":
            return exp >= 0 && exp <= 2;
          case "3-5":
            return exp >= 3 && exp <= 5;
          case "6-10":
            return exp >= 6 && exp <= 10;
          case "10+":
            return exp > 10;
          default:
            return true;
        }
      });
    }

    // Apply match score filter
    if (filterMatchScore !== "all") {
      filtered = filtered.filter((c) => {
        const score = c.ai_match_score || 0;
        switch (filterMatchScore) {
          case "80+":
            return score >= 80;
          case "60-79":
            return score >= 60 && score < 80;
          case "40-59":
            return score >= 40 && score < 60;
          case "0-39":
            return score < 40;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "match-desc":
          return (b.ai_match_score || 0) - (a.ai_match_score || 0);
        case "match-asc":
          return (a.ai_match_score || 0) - (b.ai_match_score || 0);
        case "date-desc":
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        case "date-asc":
          return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
        case "experience-desc":
          return (b.experience_years || 0) - (a.experience_years || 0);
        case "experience-asc":
          return (a.experience_years || 0) - (b.experience_years || 0);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const filteredCandidates = useMemo(() => {
    return Object.keys(candidates).reduce((acc, stageId) => {
      acc[stageId] = filterAndSortCandidates(candidates[stageId] || []);
      return acc;
    }, {} as Record<string, Candidate[]>);
  }, [candidates, sortBy, filterExperience, filterMatchScore]);

  const handleCandidateClick = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setDrawerOpen(true);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const candidateId = active.id as string;

    // Find the candidate being dragged
    for (const stage of PIPELINE_STAGES) {
      const candidate = candidates[stage.id]?.find((c) => c.id === candidateId);
      if (candidate) {
        setActiveCandidate(candidate);
        break;
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find source and destination containers
    let activeContainer: string | null = null;
    let overContainer: string | null = null;

    // Check if overId is a container
    if (PIPELINE_STAGES.some((stage) => stage.id === overId)) {
      overContainer = overId;
    } else {
      // Find which container the over item belongs to
      for (const stage of PIPELINE_STAGES) {
        if (candidates[stage.id]?.some((c) => c.id === overId)) {
          overContainer = stage.id;
          break;
        }
      }
    }

    // Find which container the active item belongs to
    for (const stage of PIPELINE_STAGES) {
      if (candidates[stage.id]?.some((c) => c.id === activeId)) {
        activeContainer = stage.id;
        break;
      }
    }

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    // Move candidate between containers
    setCandidates((prev) => {
      const activeItems = [...(prev[activeContainer!] || [])];
      const overItems = [...(prev[overContainer!] || [])];

      const activeIndex = activeItems.findIndex((c) => c.id === activeId);
      const overIndex = overItems.findIndex((c) => c.id === overId);

      const [movedCandidate] = activeItems.splice(activeIndex, 1);

      if (overIndex >= 0) {
        overItems.splice(overIndex, 0, movedCandidate);
      } else {
        overItems.push(movedCandidate);
      }

      return {
        ...prev,
        [activeContainer!]: activeItems,
        [overContainer!]: overItems,
      };
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCandidate(null);

    if (!over) return;

    const candidateId = active.id as string;
    const overId = over.id as string;

    // Find the candidate and its old stage
    let oldStage: string | null = null;
    for (const stage of PIPELINE_STAGES) {
      if (candidates[stage.id]?.some((c) => c.id === candidateId)) {
        oldStage = stage.id;
        break;
      }
    }

    // Determine the new stage
    let newStage: string | null = null;

    // Check if dropped on a container
    if (PIPELINE_STAGES.some((stage) => stage.id === overId)) {
      newStage = overId;
    } else {
      // Find which container the over item belongs to
      for (const stage of PIPELINE_STAGES) {
        if (candidates[stage.id]?.some((c) => c.id === overId)) {
          newStage = stage.id;
          break;
        }
      }
    }

    if (!newStage || newStage === oldStage) return;

    // Update in database
    try {
      const { error } = await supabase
        .from("candidates")
        .update({ status: newStage })
        .eq("id", candidateId);

      if (error) throw error;

      // Send stage change email
      if (oldStage) {
        supabase.functions.invoke("send-candidate-email", {
          body: { 
            candidateId,
            type: "stage_change",
            oldStage,
            newStage
          },
        }).catch(err => console.error("Failed to send email:", err));
      }

      toast({
        title: "Success",
        description: "Candidate moved successfully. Email notification sent.",
      });
    } catch (error: any) {
      console.error("Error updating candidate:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update candidate",
        variant: "destructive",
      });
      // Reload to revert optimistic update
      loadCandidates();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
          <p className="text-sm text-muted-foreground">Loading pipeline...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PipelineBoardFilters
        sortBy={sortBy}
        onSortChange={setSortBy}
        filterExperience={filterExperience}
        onFilterExperienceChange={setFilterExperience}
        filterMatchScore={filterMatchScore}
        onFilterMatchScoreChange={setFilterMatchScore}
      />
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {PIPELINE_STAGES.map((stage) => (
            <PipelineColumn
              key={stage.id}
              stage={stage}
              candidates={filteredCandidates[stage.id] || []}
              onCandidateClick={handleCandidateClick}
            />
          ))}
        </div>

        <DragOverlay>
          {activeCandidate ? (
            <div className="rotate-3 opacity-80">
              <CandidateCard candidate={activeCandidate} isDragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <CandidateDetailDrawer
        candidate={selectedCandidate}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </>
  );
};

export default PipelineBoard;
