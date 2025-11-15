import TopNavBar from "@/components/layout/TopNavBar";
import Sidebar from "@/components/layout/Sidebar";
import MetricCard from "@/components/dashboard/MetricCard";
import RequisitionsChart from "@/components/dashboard/RequisitionsChart";
import DepartmentJobsCard from "@/components/dashboard/DepartmentJobsCard";
import TimelineCard from "@/components/dashboard/TimelineCard";
import SMMStatusCard from "@/components/dashboard/SMMStatusCard";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Briefcase,
  UserCheck,
  Share2,
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  
  const metrics = [
    { icon: FileText, value: 8, label: "Total Requisitions", iconBgColor: "bg-blue-100 dark:bg-blue-950", onClick: () => navigate("/requests") },
    { icon: Briefcase, value: 12, label: "Active Job Openings", iconBgColor: "bg-purple-100 dark:bg-purple-950", onClick: () => navigate("/jobs") },
    { icon: UserCheck, value: 24, label: "Recent Applications", iconBgColor: "bg-teal-100 dark:bg-teal-950", onClick: () => navigate("/applications") },
    { icon: Share2, value: 6, label: "SMM Posts This Week", iconBgColor: "bg-indigo-100 dark:bg-indigo-950", onClick: () => navigate("/smm") },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopNavBar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="ml-0 lg:ml-56 flex-1 p-4 lg:p-8 bg-slate-50 dark:bg-slate-950">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">HRMS Dashboard</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Welcome back! Here's your hiring and social media overview
            </p>
          </div>

          {/* Top Summary Cards */}
          <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {metrics.map((metric, index) => (
              <MetricCard
                key={index}
                icon={metric.icon}
                value={metric.value}
                label={metric.label}
                iconBgColor={metric.iconBgColor}
                onClick={metric.onClick}
              />
            ))}
          </div>

          {/* Analytics Section */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6">
            <DepartmentJobsCard />
            <SMMStatusCard />
          </div>

          {/* Timeline */}
          <div className="mb-6">
            <TimelineCard />
          </div>

          {/* Activity Track */}
          <div>
            <RequisitionsChart />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
