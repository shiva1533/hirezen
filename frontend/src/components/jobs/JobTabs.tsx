import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface JobTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const JobTabs = ({ activeTab, onTabChange }: JobTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="bg-muted/50 p-1 h-12">
        <TabsTrigger value="dashboard" className="data-[state=active]:bg-background">
          Dashboard
        </TabsTrigger>
        <TabsTrigger value="ai-matches" className="data-[state=active]:bg-background">
          AI Matches
        </TabsTrigger>
        <TabsTrigger value="pipeline" className="data-[state=active]:bg-background">
          Pipeline
        </TabsTrigger>
        <TabsTrigger value="placement" className="data-[state=active]:bg-background">
          Placement
        </TabsTrigger>
        <TabsTrigger value="documents" className="data-[state=active]:bg-background">
          Documents
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default JobTabs;
