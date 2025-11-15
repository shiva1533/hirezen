import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Mail, Phone, MapPin, User, Loader2 } from "lucide-react";
import { Candidate } from "@/hooks/useCandidates";
import { formatDistanceToNow } from "date-fns";
import ProfileDetailDrawer from "./ProfileDetailDrawer";

interface ProfilesTableProps {
  candidates: Candidate[];
  isLoading: boolean;
}

const ProfilesTable = ({ candidates, isLoading }: ProfilesTableProps) => {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const navigate = useNavigate();
  
  const formatExperience = (years: number | null) => {
    if (!years) return "0Y";
    // Format with one decimal place
    return `${years.toFixed(1)}Y`;
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "Recently";
    }
  };

  const extractSkills = (skillsString: string | null, resumeText: string | null): string[] => {
    // First try to use AI-extracted skills from database
    if (skillsString) {
      const skillsArray = skillsString.split(',').map(s => s.trim()).filter(Boolean);
      if (skillsArray.length > 0) return skillsArray;
    }
    
    // Fallback to basic extraction from resume text
    if (!resumeText) return ["View resume for details"];
    
    const commonSkills = [
      "React.js", "Next.js", "React Native", "Redux", "Redux-Saga",
      "TypeScript", "JavaScript", "Python", "Java", "C++",
      "Node.js", "Express", "MongoDB", "PostgreSQL", "MySQL", "AWS", "Docker",
      "Kubernetes", "Tailwind CSS", "Styled Components", "CSS", "HTML", "Git",
      "Communication Skills", "Staff Development", "Leadership",
      "Educational Technology", "Curriculum Development",
      "Clerical Skills", "Teamwork", "Computer Proficiency",
      "Basic Knowledge of Computer", "Clerk"
    ];
    
    const foundSkills = commonSkills.filter(skill => 
      resumeText.toLowerCase().includes(skill.toLowerCase())
    );
    
    return foundSkills.length > 0 ? foundSkills : ["View resume for details"];
  };

  const truncateSkills = (skills: string[], maxLength: number = 80): string => {
    const joined = skills.join(", ");
    if (joined.length <= maxLength) return joined;
    
    let result = "";
    let currentLength = 0;
    
    for (let i = 0; i < skills.length; i++) {
      const skill = skills[i];
      const addition = i === 0 ? skill : `, ${skill}`;
      
      if (currentLength + addition.length > maxLength - 3) {
        result += "...";
        break;
      }
      
      result += addition;
      currentLength += addition.length;
    }
    
    return result || joined.substring(0, maxLength - 3) + "...";
  };

  if (isLoading) {
    return (
      <Card className="rounded-2xl border-border shadow-sm p-12">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading candidate profiles...</p>
        </div>
      </Card>
    );
  }

  if (candidates.length === 0) {
    return (
      <Card className="rounded-2xl border-border shadow-sm p-12">
        <div className="text-center">
          <p className="text-muted-foreground">No candidate profiles found.</p>
          <p className="text-sm text-muted-foreground mt-2">Upload resumes to get started.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border">
              <TableHead className="text-foreground font-semibold py-4 text-base">Candidate</TableHead>
              <TableHead className="text-foreground font-semibold text-base">Contact</TableHead>
              <TableHead className="text-foreground font-semibold text-base">Skills</TableHead>
              <TableHead className="text-foreground font-semibold text-base">Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidates.map((candidate) => {
              const skills = extractSkills(candidate.skills, candidate.resume_text);
              
              return (
                <TableRow 
                  key={candidate.id} 
                  className="hover:bg-muted/30 border-b border-border transition-colors cursor-pointer"
                  onClick={() => navigate(`/profiles/${candidate.id}`)}
                >
                  <TableCell className="py-5">
                    <div className="space-y-2">
                      <div>
                        <h3 className="font-medium text-foreground text-base">
                          {candidate.full_name}{" "}
                          <span className="text-muted-foreground font-normal">
                            ({formatExperience(candidate.experience_years)})
                          </span>
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {candidate.jobs 
                            ? `${candidate.jobs.position} | ${candidate.jobs.department || 'Department not specified'}`
                            : 'Position not specified'}
                        </p>
                      </div>
                      <div className="flex gap-4 text-sm">
                        {candidate.resume_url && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(candidate.resume_url!, "_blank");
                            }}
                            className="text-foreground hover:text-primary underline decoration-foreground hover:decoration-primary transition-colors"
                          >
                            Download Resume
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          className="text-foreground hover:text-primary underline decoration-foreground hover:decoration-primary transition-colors"
                        >
                          Download Profile
                        </button>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell className="py-5">
                    <div className="space-y-2.5 text-sm">
                      <div className="flex items-center gap-2.5">
                        <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-foreground">{candidate.email}</span>
                      </div>
                      {candidate.phone && (
                        <div className="flex items-center gap-2.5">
                          <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-foreground">{candidate.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2.5">
                        <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-foreground">Location not specified</span>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell className="py-5">
                    <div className="max-w-md">
                      <p className="text-sm text-foreground leading-relaxed">
                        {truncateSkills(skills)}
                      </p>
                    </div>
                  </TableCell>
                  
                  <TableCell className="py-5">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground font-medium">
                          {candidate.ai_match_score && candidate.ai_match_score >= 70 
                            ? 'Udutha Srinivas' 
                            : 'Admin'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground pl-6">
                        {formatDate(candidate.updated_at)}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      
      <ProfileDetailDrawer
        open={!!selectedCandidate}
        onOpenChange={(open) => !open && setSelectedCandidate(null)}
        candidate={selectedCandidate}
      />
    </Card>
  );
};

export default ProfilesTable;
