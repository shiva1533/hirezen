import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, MapPin, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { validateStringArray } from "@/lib/utils";

interface Job {
  id: string;
  position: string;
  department: string;
  vacancies: number;
  experience: string;
  job_description: string;
  status: string;
  primary_locations: string | null;
}

interface JobVacanciesCardProps {
  onSelectJob?: (job: Job) => void;
}

const JobVacanciesCard = ({ onSelectJob }: JobVacanciesCardProps) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadActiveJobs();
  }, []);

  const loadActiveJobs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast({
        title: "Error",
        description: "Failed to load job vacancies",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromoteJob = (job: Job) => {
    if (onSelectJob) {
      onSelectJob(job);
    }
    toast({
      title: "Job Selected",
      description: "Job details have been added to the content creator",
    });
  };

  const getLocationText = (locations: string | null) => {
    if (!locations) return "Location not specified";
    const parsed = validateStringArray(locations);
    return parsed.length > 0 ? parsed.join(", ") : "Multiple locations";
  };

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Active Job Vacancies
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading jobs...</p>
            </div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-8">
            <Briefcase className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No active job vacancies</p>
            <p className="text-xs text-muted-foreground mt-1">Create jobs to promote them on social media</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="rounded-lg border bg-card p-4 transition-all hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-foreground">{job.position}</h4>
                        {job.department && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {job.department}
                          </p>
                        )}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Active
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{job.vacancies} {job.vacancies === 1 ? 'vacancy' : 'vacancies'}</span>
                      </div>
                      {job.experience && (
                        <div className="flex items-center gap-1">
                          <span>•</span>
                          <span>{job.experience} years exp</span>
                        </div>
                      )}
                      {job.primary_locations && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{getLocationText(job.primary_locations)}</span>
                        </div>
                      )}
                    </div>

                    {job.job_description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                        {job.job_description}
                      </p>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePromoteJob(job)}
                      className="w-full"
                    >
                      Promote on Social Media
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JobVacanciesCard;
