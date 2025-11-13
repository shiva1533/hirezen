import TopNavBar from "@/components/layout/TopNavBar";
import Sidebar from "@/components/layout/Sidebar";

const Applications = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopNavBar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="ml-0 lg:ml-56 flex-1 p-4 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Applications</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Review candidate applications
            </p>
          </div>
          <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-border">
            <p className="text-muted-foreground">Applications module coming soon</p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Applications;
