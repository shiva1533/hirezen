import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, Check } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

const weekData = [
  { day: "MON", value: 8 },
  { day: "TUE", value: 15 },
  { day: "WED", value: 12 },
  { day: "THU", value: 18 },
  { day: "FRI", value: 14 },
  { day: "SAT", value: 20 },
  { day: "SUN", value: 16 },
];

const monthData = [
  { day: "Week 1", value: 45 },
  { day: "Week 2", value: 52 },
  { day: "Week 3", value: 48 },
  { day: "Week 4", value: 61 },
];

const quarterData = [
  { day: "Month 1", value: 180 },
  { day: "Month 2", value: 195 },
  { day: "Month 3", value: 210 },
];

type FilterOption = "This Week" | "This Month" | "Last Quarter";

const RequisitionsChart = () => {
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>("This Week");

  const getChartData = () => {
    switch (selectedFilter) {
      case "This Week":
        return weekData;
      case "This Month":
        return monthData;
      case "Last Quarter":
        return quarterData;
      default:
        return weekData;
    }
  };

  const getSubtitle = () => {
    switch (selectedFilter) {
      case "This Week":
        return "Active hiring requisitions this week";
      case "This Month":
        return "Active hiring requisitions this month";
      case "Last Quarter":
        return "Active hiring requisitions last quarter";
      default:
        return "Active hiring requisitions this week";
    }
  };

  const data = getChartData();
  return (
    <Card className="transition-all duration-300 hover:shadow-lg border-border/50 bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg font-semibold text-foreground">Requisitions</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">{getSubtitle()}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              {selectedFilter}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-popover border-border z-50">
            {(["This Week", "This Month", "Last Quarter"] as FilterOption[]).map((filter) => (
              <DropdownMenuItem
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className="cursor-pointer hover:bg-muted focus:bg-muted transition-colors"
              >
                <span className="flex items-center justify-between w-full">
                  {filter}
                  {selectedFilter === filter && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="pt-2 pb-6">
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="0" 
              stroke="hsl(var(--border))" 
              opacity={0.3}
              vertical={false}
            />
            <XAxis
              dataKey="day"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dy={8}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dx={-5}
              domain={[0, 'auto']}
            />
            <Tooltip
              cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '5 5' }}
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "10px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                padding: "8px 12px",
              }}
              labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600, fontSize: "13px" }}
              itemStyle={{ color: "hsl(var(--primary))", fontSize: "12px" }}
            />
            <Area 
              type="monotone"
              dataKey="value" 
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              fill="url(#colorValue)"
              animationDuration={1200}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default RequisitionsChart;
