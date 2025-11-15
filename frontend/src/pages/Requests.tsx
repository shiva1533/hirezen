import TopNavBar from "@/components/layout/TopNavBar";
import Sidebar from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";

const Requests = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopNavBar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="ml-0 lg:ml-56 flex-1 p-4 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">My Requests</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              View and manage your requests
            </p>
          </div>
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Test AI Interview</h2>
            <p className="text-muted-foreground mb-4">
              Click the button below to start the test AI interview
            </p>
            <Link to="/ai-interview/12345678-1234-1234-1234-123456789abc">
              <Button className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Open Test Interview
              </Button>
            </Link>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Requests;
