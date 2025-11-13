import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface MetricCardProps {
  icon: LucideIcon;
  value: number;
  label: string;
  iconBgColor?: string;
  onClick?: () => void;
}

const MetricCard = ({ icon: Icon, value, label, iconBgColor = "bg-primary/10", onClick }: MetricCardProps) => {
  return (
    <Card 
      className={`group relative overflow-hidden rounded-[12px] p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-12 translate-x-12 transition-transform group-hover:scale-150" />
      <div className="relative z-10">
        <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${iconBgColor} mb-2 transition-transform group-hover:scale-110`}>
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="mt-1">
          <div className="text-2xl font-bold text-foreground">{value}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
        </div>
      </div>
    </Card>
  );
};

export default MetricCard;
