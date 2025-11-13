import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Users, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import TopNavBar from "@/components/layout/TopNavBar";
import Sidebar from "@/components/layout/Sidebar";
import { CandidateStageList } from "@/components/pipeline/CandidateStageList";

const Interaction = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopNavBar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="ml-0 lg:ml-56 flex-1 p-4 lg:p-8 bg-slate-50 dark:bg-slate-950">
          <div className="container mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Interaction</h1>
                <p className="text-muted-foreground mt-1">Track all candidate interactions and communications</p>
              </div>
              <Button>
                <MessageCircle className="h-4 w-4 mr-2" />
                Log Interaction
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-primary" />
                    Phone Calls
                  </CardTitle>
                  <CardDescription>Call history and logs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">0</div>
                  <p className="text-sm text-muted-foreground mt-1">total calls</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    Emails
                  </CardTitle>
                  <CardDescription>Email correspondence</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">0</div>
                  <p className="text-sm text-muted-foreground mt-1">emails sent</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Meetings
                  </CardTitle>
                  <CardDescription>In-person meetings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">0</div>
                  <p className="text-sm text-muted-foreground mt-1">meetings held</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Interaction Timeline</CardTitle>
                <CardDescription>Chronological history of all interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  No interactions logged yet
                </div>
              </CardContent>
            </Card>

            <CandidateStageList stage="interaction" stageLabel="Interaction" />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Interaction;
