import TopNavBar from "@/components/layout/TopNavBar";
import Sidebar from "@/components/layout/Sidebar";

const Attendance = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopNavBar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="ml-0 lg:ml-56 flex-1 p-4 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Attendance</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Track employee attendance and time
            </p>
          </div>
          <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-border">
            <p className="text-muted-foreground">Attendance module coming soon</p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Attendance;
