import TopNavBar from "@/components/layout/TopNavBar";
import Sidebar from "@/components/layout/Sidebar";
import ConnectedAccountsCard from "@/components/smm/ConnectedAccountsCard";
import UploadContentCard from "@/components/smm/UploadContentCard";
import JobVacanciesCard from "@/components/smm/JobVacanciesCard";
import { useState } from "react";
import { validateStringArray } from "@/lib/utils";

const SMM = () => {
  const [selectedJobCaption, setSelectedJobCaption] = useState<string>("");

  const handleJobSelect = (job: any) => {
    const locations = validateStringArray(job.primary_locations);
    const locationText = locations.length > 0 ? `\n📌 Location: ${locations.join(', ')}` : '';
    
    const caption = `🎯 We're Hiring: ${job.position}!

📍 Department: ${job.department || 'Not specified'}
👥 Vacancies: ${job.vacancies}
💼 Experience: ${job.experience ? `${job.experience} years` : 'As per requirement'}${locationText}

${job.job_description || ''}

Apply now and join our amazing team! 🚀

#Hiring #JobOpportunity #CareerGrowth #JoinOurTeam`;
    
    setSelectedJobCaption(caption);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopNavBar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="ml-0 lg:ml-56 flex-1 p-4 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Social Media Management (SMM)</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage your social media accounts and create engaging content
            </p>
          </div>

          <div className="space-y-6">
            <JobVacanciesCard onSelectJob={handleJobSelect} />
            
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ConnectedAccountsCard />
              <UploadContentCard selectedJobCaption={selectedJobCaption} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SMM;
