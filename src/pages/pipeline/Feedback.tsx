import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Star, TrendingUp, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import TopNavBar from "@/components/layout/TopNavBar";
import Sidebar from "@/components/layout/Sidebar";
import { CandidateStageList } from "@/components/pipeline/CandidateStageList";

const Feedback = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopNavBar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="ml-0 lg:ml-56 flex-1 p-4 lg:p-8 bg-slate-50 dark:bg-slate-950">
          <div className="container mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Feedback/Result</h1>
                <p className="text-muted-foreground mt-1">Collect and review candidate feedback and results</p>
              </div>
              <Button>
                <MessageSquare className="h-4 w-4 mr-2" />
                Add Feedback
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground mt-1">awaiting feedback</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Positive</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">0</div>
                  <p className="text-xs text-muted-foreground mt-1">positive results</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Need Review</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-600">0</div>
                  <p className="text-xs text-muted-foreground mt-1">requires review</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Avg Rating</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0.0</div>
                  <p className="text-xs text-muted-foreground mt-1">out of 5.0</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    Performance Ratings
                  </CardTitle>
                  <CardDescription>Candidate performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4 text-muted-foreground">
                    No ratings available
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Results Summary
                  </CardTitle>
                  <CardDescription>Overall performance overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4 text-muted-foreground">
                    No results to display
                  </div>
                </CardContent>
              </Card>
            </div>

            <CandidateStageList stage="feedback" stageLabel="Feedback/Result" />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Feedback;
