import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import TopNavBar from "@/components/layout/TopNavBar";
import Sidebar from "@/components/layout/Sidebar";
import { CandidateStageList } from "@/components/pipeline/CandidateStageList";

const UploadDocuments = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopNavBar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="ml-0 lg:ml-56 flex-1 p-4 lg:p-8 bg-slate-50 dark:bg-slate-950">
          <div className="container mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Upload Documents</h1>
                <p className="text-muted-foreground mt-1">Collect and manage candidate documents</p>
              </div>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Request Documents
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pending Upload</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-600">0</div>
                  <p className="text-xs text-muted-foreground mt-1">documents pending</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Uploaded</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground mt-1">documents received</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Verified</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">0</div>
                  <p className="text-xs text-muted-foreground mt-1">documents verified</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">0</div>
                  <p className="text-xs text-muted-foreground mt-1">require attention</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Required Documents
                  </CardTitle>
                  <CardDescription>Standard documents needed</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      Resume/CV
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      Educational Certificates
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      Experience Letters
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      ID Proof
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      Address Proof
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    Recent Uploads
                  </CardTitle>
                  <CardDescription>Latest document submissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4 text-muted-foreground">
                    No recent uploads
                  </div>
                </CardContent>
              </Card>
            </div>

            <CandidateStageList stage="upload_documents" stageLabel="Upload Documents" />
          </div>
        </main>
      </div>
    </div>
  );
};

export default UploadDocuments;
