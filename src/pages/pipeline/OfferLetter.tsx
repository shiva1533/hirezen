import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Send, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import TopNavBar from "@/components/layout/TopNavBar";
import Sidebar from "@/components/layout/Sidebar";
import { CandidateStageList } from "@/components/pipeline/CandidateStageList";

const OfferLetter = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopNavBar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="ml-0 lg:ml-56 flex-1 p-4 lg:p-8 bg-slate-50 dark:bg-slate-950">
          <div className="container mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Offer Letter</h1>
          <p className="text-muted-foreground mt-1">Generate and send offer letters to candidates</p>
        </div>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Create Offer Letter
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Draft</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">in draft</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">0</div>
            <p className="text-xs text-muted-foreground mt-1">offers sent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Accepted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">0</div>
            <p className="text-xs text-muted-foreground mt-1">offers accepted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Declined</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">0</div>
            <p className="text-xs text-muted-foreground mt-1">offers declined</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Recent Offers
            </CardTitle>
            <CardDescription>Latest offer letters sent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4 text-muted-foreground">
              No offers sent yet
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Offer Templates
            </CardTitle>
            <CardDescription>Pre-configured letter templates</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                Full-Time Offer
              </li>
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                Part-Time Offer
              </li>
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                Contract Offer
              </li>
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                Internship Offer
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Offer Letter Components</CardTitle>
          <CardDescription>Standard sections included in offer letters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="font-medium">Compensation Package</p>
              <p className="text-sm text-muted-foreground">Salary, benefits, and bonuses</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="font-medium">Job Details</p>
              <p className="text-sm text-muted-foreground">Title, department, reporting structure</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="font-medium">Start Date</p>
              <p className="text-sm text-muted-foreground">Joining date and schedule</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="font-medium">Terms & Conditions</p>
              <p className="text-sm text-muted-foreground">Employment terms and policies</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <CandidateStageList stage="offer_letter" stageLabel="Offer Letter" />
          </div>
        </main>
      </div>
    </div>
  );
};

export default OfferLetter;
