import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X } from "lucide-react";
import { Card } from "@/components/ui/card";

export interface ProfileFilters {
  experienceRange: string;
  skills: string;
  location: string;
  jobType: string;
  search: string;
  createdBy: string;
  sortBy: string;
}

interface ProfilesFilterBarProps {
  filters: ProfileFilters;
  onFilterChange: (filters: ProfileFilters) => void;
  onReset: () => void;
  onUpload: () => void;
}

const ProfilesFilterBar = ({ filters, onFilterChange, onReset, onUpload }: ProfilesFilterBarProps) => {
  const updateFilter = (key: keyof ProfileFilters, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <Card className="p-6 mb-6 rounded-2xl border-border shadow-sm">
      <div className="space-y-4">
        {/* First Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Experience Range</label>
            <Select value={filters.experienceRange} onValueChange={(value) => updateFilter('experienceRange', value)}>
              <SelectTrigger className="bg-card border-border rounded-lg focus:ring-primary/20">
                <SelectValue placeholder="Select experience" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">All Experience</SelectItem>
                <SelectItem value="0-2">0-2 years</SelectItem>
                <SelectItem value="2-5">2-5 years</SelectItem>
                <SelectItem value="5-10">5-10 years</SelectItem>
                <SelectItem value="10+">10+ years</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Skills</label>
            <Input 
              value={filters.skills}
              onChange={(e) => updateFilter('skills', e.target.value)}
              placeholder="Search skills (e.g., HTML, CSS)" 
              className="bg-card border-border rounded-lg focus:ring-primary/20"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Locations</label>
            <Select value={filters.location} onValueChange={(value) => updateFilter('location', value)}>
              <SelectTrigger className="bg-card border-border rounded-lg focus:ring-primary/20">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="hyderabad">Hyderabad</SelectItem>
                <SelectItem value="chennai">Chennai</SelectItem>
                <SelectItem value="pan-india">Pan India</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Job Type</label>
            <Select value={filters.jobType} onValueChange={(value) => updateFilter('jobType', value)}>
              <SelectTrigger className="bg-card border-border rounded-lg focus:ring-primary/20">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="teaching">Teaching</SelectItem>
                <SelectItem value="non-teaching">Non-Teaching</SelectItem>
                <SelectItem value="administrative">Administrative</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Second Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Search</label>
            <Input 
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              placeholder="Name, Email, or Mobile Number" 
              className="bg-card border-border rounded-lg focus:ring-primary/20"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Created By</label>
            <Select value={filters.createdBy} onValueChange={(value) => updateFilter('createdBy', value)}>
              <SelectTrigger className="bg-card border-border rounded-lg focus:ring-primary/20">
                <SelectValue placeholder="Select creator" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="hod">HOD</SelectItem>
                <SelectItem value="principal">Principal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Sort By</label>
            <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
              <SelectTrigger className="bg-card border-border rounded-lg focus:ring-primary/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="recent">Recently Added</SelectItem>
                <SelectItem value="exp-high">Experience (High to Low)</SelectItem>
                <SelectItem value="exp-low">Experience (Low to High)</SelectItem>
                <SelectItem value="alphabetical">Alphabetical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="ghost"
            onClick={onReset}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button
            variant="outline"
            onClick={onUpload}
            className="border-primary text-primary hover:bg-accent"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Resumes
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProfilesFilterBar;
