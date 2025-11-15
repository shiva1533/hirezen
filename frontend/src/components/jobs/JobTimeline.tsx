import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

const timelineEvents = [
  {
    id: 1,
    time: "10:52 AM",
    date: "Today",
    user: "Admin",
    userInitials: "AD",
    candidate: "Dimple Budhwani",
    action: "Candidate moved to Upper Management Approval",
  },
  {
    id: 2,
    time: "10:30 AM",
    date: "Today",
    user: "HOD",
    userInitials: "HD",
    candidate: "Dimple Budhwani",
    action: "Completed Panel Interview successfully",
  },
  {
    id: 3,
    time: "09:15 AM",
    date: "Today",
    user: "HR Manager",
    userInitials: "HR",
    candidate: "Jayakumar R",
    action: "Added to Talent Pool for future opportunities",
  },
  {
    id: 4,
    time: "04:20 PM",
    date: "Yesterday",
    user: "Principal",
    userInitials: "PR",
    candidate: "Priya Sharma",
    action: "Scheduled for Screening Test on Nov 12",
  },
  {
    id: 5,
    time: "02:10 PM",
    date: "Yesterday",
    user: "Admin",
    userInitials: "AD",
    candidate: "Rahul Mehta",
    action: "Application received and under review",
  },
];

const JobTimeline = () => {
  return (
    <div className="w-80 bg-card rounded-[16px] p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-foreground mb-4">Timeline</h3>
      
      <ScrollArea className="h-[600px] pr-4">
        <div className="relative">
          <div className="absolute left-5 top-2 bottom-2 w-px bg-border" />
          
          <div className="space-y-6">
            {timelineEvents.map((event) => (
              <div key={event.id} className="relative pl-12 pb-4 hover:bg-muted/30 -ml-3 p-3 rounded-lg transition-colors">
                <Avatar className="absolute left-0 top-0 h-10 w-10 border-2 border-background">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {event.userInitials}
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{event.time}</span>
                    <span>•</span>
                    <span>{event.date}</span>
                  </div>
                  
                  <div className="text-sm">
                    <span className="font-semibold text-foreground">
                      {event.candidate}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {event.action}
                  </p>
                  
                  <div className="text-xs text-muted-foreground mt-1">
                    by {event.user}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default JobTimeline;
