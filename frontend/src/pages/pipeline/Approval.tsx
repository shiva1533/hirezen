import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, UserCheck, Clock, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import TopNavBar from "@/components/layout/TopNavBar";
import Sidebar from "@/components/layout/Sidebar";
import { CandidateStageList } from "@/components/pipeline/CandidateStageList";

const Approval = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopNavBar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="ml-0 lg:ml-56 flex-1 p-4 lg:p-8 bg-slate-50 dark:bg-slate-950">
          <div className="container mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Approval</h1>
                <p className="text-muted-foreground mt-1">Final approval stage before offer letters</p>
              </div>
              <Button>
                <CheckCircle className="h-4 w-4 mr-2" />
                Grant Approval
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Pending Approval
                  </CardTitle>
                  <CardDescription>Awaiting decision</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-amber-600">0</div>
                  <p className="text-sm text-muted-foreground mt-1">candidates pending</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-primary" />
                    Approved
                  </CardTitle>
                  <CardDescription>Ready for offer</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">0</div>
                  <p className="text-sm text-muted-foreground mt-1">approvals granted</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-primary" />
                    Rejected
                  </CardTitle>
                  <CardDescription>Not approved</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">0</div>
                  <p className="text-sm text-muted-foreground mt-1">applications rejected</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Approval Queue</CardTitle>
                <CardDescription>Candidates awaiting final approval</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  No pending approvals
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Approval Workflow</CardTitle>
                <CardDescription>Multi-level approval process</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">1</div>
                    <div>
                      <p className="font-medium">HR Manager Approval</p>
                      <p className="text-sm text-muted-foreground">Initial approval by HR team</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">2</div>
                    <div>
                      <p className="font-medium">Department Head Approval</p>
                      <p className="text-sm text-muted-foreground">Approval by hiring department</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">3</div>
                    <div>
                      <p className="font-medium">Final Approval</p>
                      <p className="text-sm text-muted-foreground">Executive/Management approval</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <CandidateStageList stage="approval" stageLabel="Approval" />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Approval;
