import { useState } from "react";
import { useParams } from "react-router-dom";
import TopNavBar from "@/components/layout/TopNavBar";
import Sidebar from "@/components/layout/Sidebar";
import JobHeader from "@/components/jobs/JobHeader";
import JobMetricsCards from "@/components/jobs/JobMetricsCards";
import JobTabs from "@/components/jobs/JobTabs";
import JobPipeline from "@/components/jobs/JobPipeline";
import CandidateList from "@/components/jobs/CandidateList";
import JobTimeline from "@/components/jobs/JobTimeline";
import AIMatchesTab from "@/components/jobs/AIMatchesTab";
import PipelineBoard from "@/components/jobs/PipelineBoard";
import JobQRCode from "@/components/jobs/JobQRCode";
import { useJobCandidates, calculateJobMetrics } from "@/hooks/useJobCandidates";

const JobDetails = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showQRCode, setShowQRCode] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  
  const { data: candidates = [] } = useJobCandidates(id);
  const metrics = calculateJobMetrics(candidates);

  const handleShowQRCode = (title: string) => {
    setJobTitle(title);
    setShowQRCode(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNavBar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-6 ml-0 lg:ml-56">
          <JobHeader jobId={id} onShowQRCode={handleShowQRCode} />
          
          <JobMetricsCards metrics={metrics} />
          
          <JobTabs activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="flex gap-6 mt-6">
            <div className="flex-1">
              {activeTab === "dashboard" && (
                <>
                  <JobPipeline jobId={id} />
                  <CandidateList />
                </>
              )}
              {activeTab === "ai-matches" && <AIMatchesTab />}
              {activeTab === "pipeline" && <PipelineBoard />}
              {activeTab === "placement" && (
                <div className="bg-card rounded-[16px] p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Placement</h3>
                  <p className="text-muted-foreground">Placement tracking coming soon...</p>
                </div>
              )}
              {activeTab === "documents" && (
                <div className="bg-card rounded-[16px] p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Documents</h3>
                  <p className="text-muted-foreground">Document management coming soon...</p>
                </div>
              )}
            </div>

            <JobTimeline />
          </div>
        </main>
      </div>
      {id && (
        <JobQRCode
          jobId={id}
          jobTitle={jobTitle}
          open={showQRCode}
          onOpenChange={setShowQRCode}
        />
      )}
    </div>
  );
};

export default JobDetails;
