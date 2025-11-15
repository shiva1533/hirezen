import TopNavBar from "@/components/layout/TopNavBar";
import Sidebar from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Plus, User, Edit, QrCode, X, Upload } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import CreateJobModal from "@/components/jobs/CreateJobModal";
import CreateJobFromPDFModal from "@/components/jobs/CreateJobFromPDFModal";
import JobQRCode from "@/components/jobs/JobQRCode";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface Job {
  id: string;
  title: string;
  vacancies: number;
  experience: string;
  location: string;
  skills: string[];
  stats: {
    all: number;
    pipeline: number;
    placement: number;
    placed: number;
  };
  createdBy: string;
  timeAgo: string;
}

const Jobs = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | undefined>(undefined);
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showQRCode, setShowQRCode] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [isCreateFromPDFOpen, setIsCreateFromPDFOpen] = useState(false);

  useEffect(() => {
    loadJobs();
    
    // Check for department filter in URL params
    const deptParam = searchParams.get('department');
    if (deptParam) {
      setDepartmentFilter(deptParam);
    }
  }, [searchParams]);

  const handleCreateJob = () => {
    setEditingJobId(undefined);
    setIsCreateJobOpen(true);
  };

  const handleEditJob = (jobId: string) => {
    setEditingJobId(jobId);
    setIsCreateJobOpen(true);
  };

  const loadJobs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = (open: boolean) => {
    setIsCreateJobOpen(open);
    if (!open) {
      setEditingJobId(undefined);
    }
  };

  const handleShowQRCode = () => {
    setShowQRCode(true);
  };

  // Get unique departments from jobs
  const departments = Array.from(new Set(jobs.map(job => job.department).filter(Boolean)));

  // Filter jobs based on search, status, and department
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = searchQuery === "" || 
      job.position?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.department?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    const matchesDepartment = departmentFilter === "all" || (job.department && departmentFilter && job.department.toLowerCase() === departmentFilter.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const activeFiltersCount = (statusFilter !== "all" ? 1 : 0) + (departmentFilter !== "all" ? 1 : 0);

  const clearAllFilters = () => {
    setStatusFilter("all");
    setDepartmentFilter("all");
  };

  const mockJobs: Job[] = [
    {
      id: "JOB-001",
      title: "Senior Mathematics Teacher",
      vacancies: 2,
      experience: "5-8 years",
      location: "New York, NY",
      skills: ["Curriculum Development", "Classroom Management", "Educational Technology"],
      stats: { all: 45, pipeline: 12, placement: 8, placed: 3 },
      createdBy: "Admin",
      timeAgo: "2 days ago",
    },
    {
      id: "JOB-002",
      title: "English Language Instructor",
      vacancies: 3,
      experience: "3-5 years",
      location: "Los Angeles, CA",
      skills: ["Literature", "Creative Writing", "ESL"],
      stats: { all: 38, pipeline: 15, placement: 10, placed: 5 },
      createdBy: "HR Manager",
      timeAgo: "5 days ago",
    },
    {
      id: "JOB-003",
      title: "Science Lab Coordinator",
      vacancies: 1,
      experience: "4-6 years",
      location: "Chicago, IL",
      skills: ["Laboratory Management", "Safety Protocols", "Research"],
      stats: { all: 22, pipeline: 8, placement: 4, placed: 2 },
      createdBy: "Admin",
      timeAgo: "1 week ago",
    },
    {
      id: "JOB-004",
      title: "Physical Education Teacher",
      vacancies: 2,
      experience: "2-4 years",
      location: "Houston, TX",
      skills: ["Sports Training", "Health Education", "Team Building"],
      stats: { all: 31, pipeline: 10, placement: 6, placed: 4 },
      createdBy: "HR Manager",
      timeAgo: "1 week ago",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopNavBar 
        customActions={
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleShowQRCode}
          >
            <QrCode className="h-4 w-4" />
            <span className="hidden sm:inline">All Jobs QR</span>
          </Button>
        }
      />
      <div className="flex flex-1">
        <Sidebar />
        <main className="ml-0 lg:ml-56 flex-1 p-4 lg:p-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-foreground">Jobs</h1>
              <div className="flex items-center gap-3">
                {/* Status Filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="default" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Status
                      {statusFilter !== "all" && (
                        <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                          1
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() => setStatusFilter("all")}
                      className={statusFilter === "all" ? "bg-accent" : ""}
                    >
                      All Statuses
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setStatusFilter("active")}
                      className={statusFilter === "active" ? "bg-accent" : ""}
                    >
                      Active
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setStatusFilter("draft")}
                      className={statusFilter === "draft" ? "bg-accent" : ""}
                    >
                      Draft
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Department Filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="default" className="gap-2">
                      Department
                      {departmentFilter !== "all" && (
                        <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                          1
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 max-h-80 overflow-y-auto">
                    <DropdownMenuItem
                      onClick={() => setDepartmentFilter("all")}
                      className={departmentFilter === "all" ? "bg-accent" : ""}
                    >
                      All Departments
                    </DropdownMenuItem>
                    {departments.length > 0 && <DropdownMenuSeparator />}
                    {departments.map((dept) => (
                      <DropdownMenuItem
                        key={dept}
                        onClick={() => setDepartmentFilter(dept)}
                        className={departmentFilter === dept ? "bg-accent" : ""}
                      >
                        {dept}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button 
                  variant="outline" 
                  size="default" 
                  className="gap-2" 
                  onClick={() => setIsCreateFromPDFOpen(true)}
                >
                  <Upload className="h-4 w-4" />
                  From PDF
                </Button>
                <Button size="default" className="gap-2" onClick={handleCreateJob}>
                  <Plus className="h-4 w-4" />
                  Create Job
                </Button>
                <CreateJobModal 
                  open={isCreateJobOpen} 
                  onOpenChange={handleModalClose}
                  jobId={editingJobId}
                  onJobSaved={loadJobs}
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-2xl">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Job Title, Job ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Active Filters */}
              {activeFiltersCount > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Active filters:</span>
                  {statusFilter !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                      Status: {statusFilter}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-foreground"
                        onClick={() => setStatusFilter("all")}
                      />
                    </Badge>
                  )}
                  {departmentFilter !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                      Dept: {departmentFilter}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-foreground"
                        onClick={() => setDepartmentFilter("all")}
                      />
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-7 text-xs"
                  >
                    Clear all
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                  <p className="text-sm text-muted-foreground">Loading jobs...</p>
                </div>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {jobs.length === 0 
                    ? "No jobs found. Create your first job posting!" 
                    : "No jobs match the selected filters."
                  }
                </p>
                {jobs.length > 0 && activeFiltersCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllFilters}
                    className="mt-4"
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {filteredJobs.length} of {jobs.length} jobs
                  </p>
                </div>
                {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md cursor-pointer"
                  onClick={() => navigate(`/jobs/${job.id}`)}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold text-foreground">{job.position}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              job.status === 'active' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {job.status}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {job.department && `${job.department}`}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/interview-quiz/${job.id}`);
                            }}
                            className="gap-2"
                          >
                            Quiz
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditJob(job.id);
                            }}
                            className="gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                        </div>
                      </div>

                      <div className="mb-3 flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          <span className="font-medium text-foreground">{job.vacancies}</span> Vacancies
                        </span>
                        {job.experience && (
                          <>
                            <span>•</span>
                            <span>{job.experience}</span>
                          </>
                        )}
                        {job.role_experience && (
                          <>
                            <span>•</span>
                            <span>{job.role_experience} years relevant exp</span>
                          </>
                        )}
                      </div>

                      {job.job_description && (
                        <div className="mb-3 text-sm text-muted-foreground line-clamp-2">
                          {job.job_description}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 mb-3">
                        {job.pipeline_template && (
                          <span className="rounded-md bg-blue-50 text-blue-700 px-3 py-1 text-xs font-medium">
                            {job.pipeline_template}
                          </span>
                        )}
                        {job.placement_template && (
                          <span className="rounded-md bg-purple-50 text-purple-700 px-3 py-1 text-xs font-medium">
                            {job.placement_template}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>
                          Created {new Date(job.created_at).toLocaleDateString()}
                        </span>
                        {job.updated_at !== job.created_at && (
                          <>
                            <span>•</span>
                            <span>Updated {new Date(job.updated_at).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
              }
              </>
            )}
          </div>
        </main>
      </div>
      <JobQRCode
        jobId="all"
        jobTitle="All Job Openings"
        open={showQRCode}
        onOpenChange={setShowQRCode}
      />
      <CreateJobFromPDFModal
        open={isCreateFromPDFOpen}
        onOpenChange={setIsCreateFromPDFOpen}
        onJobCreated={loadJobs}
      />
    </div>
  );
};

export default Jobs;
