import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { SlidersHorizontal } from "lucide-react";

interface PipelineBoardFiltersProps {
  sortBy: string;
  onSortChange: (value: string) => void;
  filterExperience: string;
  onFilterExperienceChange: (value: string) => void;
  filterMatchScore: string;
  onFilterMatchScoreChange: (value: string) => void;
}

const PipelineBoardFilters = ({
  sortBy,
  onSortChange,
  filterExperience,
  onFilterExperienceChange,
  filterMatchScore,
  onFilterMatchScoreChange,
}: PipelineBoardFiltersProps) => {
  return (
    <div className="bg-card rounded-[16px] p-4 shadow-sm mb-4">
      <div className="flex items-center gap-2 mb-3">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">Filters & Sorting</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sort" className="text-xs text-muted-foreground">Sort By</Label>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger id="sort" className="h-9">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="match-desc">Match Score (High to Low)</SelectItem>
              <SelectItem value="match-asc">Match Score (Low to High)</SelectItem>
              <SelectItem value="date-desc">Date Applied (Newest)</SelectItem>
              <SelectItem value="date-asc">Date Applied (Oldest)</SelectItem>
              <SelectItem value="experience-desc">Experience (High to Low)</SelectItem>
              <SelectItem value="experience-asc">Experience (Low to High)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="experience" className="text-xs text-muted-foreground">Experience Level</Label>
          <Select value={filterExperience} onValueChange={onFilterExperienceChange}>
            <SelectTrigger id="experience" className="h-9">
              <SelectValue placeholder="All levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="0-2">Entry Level (0-2 years)</SelectItem>
              <SelectItem value="3-5">Mid Level (3-5 years)</SelectItem>
              <SelectItem value="6-10">Senior (6-10 years)</SelectItem>
              <SelectItem value="10+">Expert (10+ years)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="match" className="text-xs text-muted-foreground">Match Score</Label>
          <Select value={filterMatchScore} onValueChange={onFilterMatchScoreChange}>
            <SelectTrigger id="match" className="h-9">
              <SelectValue placeholder="All scores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Scores</SelectItem>
              <SelectItem value="80+">Excellent (80+)</SelectItem>
              <SelectItem value="60-79">Good (60-79)</SelectItem>
              <SelectItem value="40-59">Fair (40-59)</SelectItem>
              <SelectItem value="0-39">Poor (0-39)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default PipelineBoardFilters;
