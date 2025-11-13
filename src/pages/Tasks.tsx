import { useState } from "react";
import TopNavBar from "@/components/layout/TopNavBar";
import Sidebar from "@/components/layout/Sidebar";
import ProfilesFilterBar, { ProfileFilters } from "@/components/profiles/ProfilesFilterBar";
import ProfilesTable from "@/components/profiles/ProfilesTable";
import UploadResumeModal from "@/components/profiles/UploadResumeModal";
import { useCandidates } from "@/hooks/useCandidates";

const initialFilters: ProfileFilters = {
  experienceRange: "all",
  skills: "",
  location: "all",
  jobType: "all",
  search: "",
  createdBy: "all",
  sortBy: "recent",
};

const Tasks = () => {
  const [filters, setFilters] = useState<ProfileFilters>(initialFilters);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const { data: candidates = [], isLoading } = useCandidates(filters);

  const handleReset = () => {
    setFilters(initialFilters);
  };

  const handleUpload = () => {
    setUploadModalOpen(true);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopNavBar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="ml-0 lg:ml-56 flex-1 p-4 lg:p-8">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Candidate Profiles ({candidates.length})
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                All profiles uploaded and matched from hiring pipelines.
              </p>
            </div>
          </div>
          
          <ProfilesFilterBar 
            filters={filters}
            onFilterChange={setFilters}
            onReset={handleReset} 
            onUpload={handleUpload} 
          />
          
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-foreground">Candidate Profiles</h2>
          </div>
          
          <ProfilesTable candidates={candidates} isLoading={isLoading} />
        </main>
      </div>
      
      <UploadResumeModal open={uploadModalOpen} onOpenChange={setUploadModalOpen} />
    </div>
  );
};

export default Tasks;
