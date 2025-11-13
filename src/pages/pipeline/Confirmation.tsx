import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare, UserCheck, FileCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import TopNavBar from "@/components/layout/TopNavBar";
import Sidebar from "@/components/layout/Sidebar";
import { CandidateStageList } from "@/components/pipeline/CandidateStageList";

const Confirmation = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopNavBar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="ml-0 lg:ml-56 flex-1 p-4 lg:p-8 bg-slate-50 dark:bg-slate-950">
          <div className="container mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Confirmation</h1>
                <p className="text-muted-foreground mt-1">Confirm candidate acceptance and process final checks</p>
              </div>
              <Button>
                <CheckSquare className="h-4 w-4 mr-2" />
                Send Confirmation
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Pending Confirmation
                  </CardTitle>
                  <CardDescription>Awaiting candidate response</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-amber-600">0</div>
                  <p className="text-sm text-muted-foreground mt-1">pending responses</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-primary" />
                    Confirmed
                  </CardTitle>
                  <CardDescription>Accepted candidates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">0</div>
                  <p className="text-sm text-muted-foreground mt-1">confirmations received</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-primary" />
                    Declined
                  </CardTitle>
                  <CardDescription>Candidates who declined</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">0</div>
                  <p className="text-sm text-muted-foreground mt-1">declined offers</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Confirmation Status</CardTitle>
                <CardDescription>Track all candidate confirmations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  No confirmations pending
                </div>
              </CardContent>
            </Card>

            <CandidateStageList stage="confirmation" stageLabel="Confirmation" />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Confirmation;
