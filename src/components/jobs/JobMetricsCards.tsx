import { Users, Clock, XCircle, CheckCircle, Award } from "lucide-react";
import { JobMetrics } from "@/hooks/useJobCandidates";

interface JobMetricsCardsProps {
  metrics: JobMetrics;
}

const JobMetricsCards = ({ metrics: metricsData }: JobMetricsCardsProps) => {
  const metrics = [
    {
      label: "Total Applicants",
      value: metricsData.totalApplicants,
      icon: Users,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "In Progress",
      value: metricsData.inProgress,
      icon: Clock,
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      label: "Rejected",
      value: metricsData.rejected,
      icon: XCircle,
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
    },
    {
      label: "Completed",
      value: metricsData.completed,
      icon: CheckCircle,
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      label: "Placed",
      value: metricsData.placed,
      icon: Award,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <div
            key={metric.label}
            className="bg-card rounded-[12px] p-4 shadow-sm border border-border hover:shadow-md transition-shadow"
          >
            <div className={`inline-flex p-2 rounded-lg ${metric.bgColor} mb-2`}>
              <Icon className={`h-4 w-4 ${metric.iconColor}`} />
            </div>
            <div className="text-2xl font-bold text-foreground mb-0.5">
              {metric.value}
            </div>
            <div className="text-xs text-muted-foreground">{metric.label}</div>
          </div>
        );
      })}
    </div>
  );
};

export default JobMetricsCards;
