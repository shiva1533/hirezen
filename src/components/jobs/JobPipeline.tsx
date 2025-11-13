import { Users, Clock, XCircle, CheckCircle2, Award } from "lucide-react";
import { useJobCandidates, calculateJobMetrics } from "@/hooks/useJobCandidates";

interface JobPipelineProps {
  detailed?: boolean;
  jobId?: string;
}

const JobPipeline = ({ detailed = false, jobId }: JobPipelineProps) => {
  const { data: candidates = [] } = useJobCandidates(jobId);
  const metrics = calculateJobMetrics(candidates);

  const pipelineStages = [
    {
      label: "Total",
      count: metrics.totalApplicants,
      icon: Users,
      gradient: "from-blue-400 to-blue-600",
    },
    {
      label: "In Progress",
      count: metrics.inProgress,
      icon: Clock,
      gradient: "from-amber-400 to-amber-600",
    },
    {
      label: "Rejected",
      count: metrics.rejected,
      icon: XCircle,
      gradient: "from-red-400 to-red-600",
    },
    {
      label: "Completed",
      count: metrics.completed,
      icon: CheckCircle2,
      gradient: "from-green-400 to-green-600",
    },
    {
      label: "Placed",
      count: metrics.placed,
      icon: Award,
      gradient: "from-purple-400 to-purple-600",
    },
  ];
  return (
    <div className="bg-card rounded-[16px] p-6 shadow-sm mb-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Pipeline Overview
      </h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {pipelineStages.map((stage) => {
          const Icon = stage.icon;
          return (
            <div
              key={stage.label}
              className="bg-background rounded-xl p-4 border border-border hover:shadow-md transition-all cursor-pointer group"
            >
              <div className={`inline-flex p-2.5 rounded-lg bg-gradient-to-br ${stage.gradient} mb-3 group-hover:scale-110 transition-transform`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">
                {stage.count}
              </div>
              <div className="text-sm text-muted-foreground">{stage.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JobPipeline;
