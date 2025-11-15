import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#f59e0b", "#10b981", "#ec4899", "#6366f1", "#f97316"];

interface DepartmentData {
  name: string;
  openings: number;
  color: string;
}

const DepartmentJobsCard = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All Time");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [departmentData, setDepartmentData] = useState<DepartmentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDepartmentJobs();

    // Set up real-time subscription
    const channel = supabase
      .channel('department-jobs-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'jobs'
        },
        (payload) => {
          console.log('Job change detected:', payload);
          // Reload department jobs when any job changes
          loadDepartmentJobs();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadDepartmentJobs = async () => {
    setIsLoading(true);
    try {
      // Fetch only active jobs
      const { data: jobs, error } = await supabase
        .from("jobs")
        .select("department, status")
        .in("status", ["active", "published"]);

      if (error) throw error;

      // Group by department and count
      const departmentCounts: { [key: string]: number } = {};
      
      jobs?.forEach((job) => {
        const dept = job.department || "Other";
        departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
      });

      // Convert to array and add colors
      const formattedData: DepartmentData[] = Object.entries(departmentCounts)
        .map(([name, openings], index) => ({
          name,
          openings,
          color: COLORS[index % COLORS.length],
        }))
        .sort((a, b) => b.openings - a.openings); // Sort by openings descending

      setDepartmentData(formattedData);
    } catch (error) {
      console.error("Error loading department jobs:", error);
      setDepartmentData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const totalOpenings = departmentData.reduce((sum, dept) => sum + dept.openings, 0);

  const handleDepartmentClick = (departmentName: string) => {
    navigate(`/jobs?department=${encodeURIComponent(departmentName)}`);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg shadow-lg px-4 py-3">
          <p className="text-sm font-semibold text-foreground">{payload[0].name}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {payload[0].value} {payload[0].value === 1 ? 'Opening' : 'Openings'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="transition-all duration-300 hover:shadow-lg bg-card rounded-[20px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg font-bold text-foreground">Department Wise Jobs</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Active job openings by department</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 rounded-full px-4 hover:bg-muted/80 transition-colors text-xs"
        >
          {filter}
          <ChevronDown className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-[280px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
              <p className="text-sm text-muted-foreground">Loading departments...</p>
            </div>
          </div>
        ) : departmentData.length === 0 ? (
          <div className="flex items-center justify-center h-[280px]">
            <p className="text-sm text-muted-foreground">No active jobs found</p>
          </div>
        ) : (
          <>
            <div className="relative">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={departmentData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={110}
                paddingAngle={3}
                dataKey="openings"
                animationBegin={0}
                animationDuration={800}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                onClick={(data) => handleDepartmentClick(data.name)}
              >
                {departmentData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                    opacity={activeIndex === null || activeIndex === index ? 1 : 0.6}
                    style={{ 
                      filter: activeIndex === index ? 'brightness(1.1)' : 'none',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center Total */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <div className="text-4xl font-bold text-foreground">{totalOpenings}</div>
            <div className="text-sm text-muted-foreground mt-1">Total Jobs</div>
          </div>
          </div>
          
          {/* Legend */}
          <div className="mt-8 grid grid-cols-2 gap-3">
            {departmentData.map((dept, index) => (
              <div 
                key={index} 
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                onClick={() => handleDepartmentClick(dept.name)}
              >
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0 transition-transform group-hover:scale-125" 
                  style={{ backgroundColor: dept.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{dept.name}</p>
                  <p className="text-xs text-muted-foreground">{dept.openings} {dept.openings === 1 ? 'opening' : 'openings'}</p>
                </div>
              </div>
            ))}
          </div>
        </>
        )}
      </CardContent>
    </Card>
  );
};

export default DepartmentJobsCard;
