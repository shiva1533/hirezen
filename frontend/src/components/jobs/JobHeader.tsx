import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, Edit, Share2, Download, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import jsPDF from "jspdf";
import EditJobModal from "./EditJobModal";
import ShareJobDialog from "./ShareJobDialog";
import { validateStringArray } from "@/lib/utils";

interface JobHeaderProps {
  jobId?: string;
  onShowQRCode?: (title: string) => void;
}

const JobHeader = ({ jobId, onShowQRCode }: JobHeaderProps) => {
  const [job, setJob] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);

  useEffect(() => {
    if (jobId) {
      loadJobData();
    }
  }, [jobId]);

  const loadJobData = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error) throw error;
      setJob(data);
    } catch (error) {
      console.error('Error loading job:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVacancyClick = () => {
    if (onShowQRCode && job) {
      onShowQRCode(job.position);
    }
  };

  const handleDownloadJD = async () => {
    if (!job) return;

    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = 20;

      // Company Branding Header with colored background
      pdf.setFillColor(59, 130, 246); // Primary blue color
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      // Company Name
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont("helvetica", "bold");
      pdf.text("Your Company Name", margin, 25);
      
      // Reset text color
      pdf.setTextColor(0, 0, 0);
      yPosition = 55;

      // Job Description Title
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text("Job Description", margin, yPosition);
      yPosition += 3;
      
      // Underline
      pdf.setDrawColor(59, 130, 246);
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPosition, margin + 50, yPosition);
      yPosition += 15;

      // Job Title Section
      pdf.setFillColor(245, 247, 250);
      pdf.rect(margin - 5, yPosition - 7, pageWidth - (margin * 2) + 10, 12, 'F');
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(30, 58, 138);
      pdf.text(job.position || "N/A", margin, yPosition);
      pdf.setTextColor(0, 0, 0);
      yPosition += 15;

      // Job Details Section
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.text("Job Details", margin, yPosition);
      yPosition += 7;
      
      pdf.setFont("helvetica", "normal");
      const details = [];
      
      if (job.department) details.push(`Department: ${job.department}`);
      if (job.experience) details.push(`Experience Required: ${job.experience}`);
      if (job.role_experience) details.push(`Role Experience: ${job.role_experience}`);
      details.push(`Vacancies: ${job.vacancies || 1}`);
      if (job.job_type) details.push(`Job Type: ${job.job_type}`);
      if (job.mode_of_work) details.push(`Work Mode: ${job.mode_of_work}`);
      
      if (job.primary_locations) {
        const locations = validateStringArray(job.primary_locations);
        if (locations.length > 0) {
          details.push(`Location: ${locations.join(', ')}`);
        }
      }

      details.forEach(detail => {
        pdf.text(`• ${detail}`, margin + 5, yPosition);
        yPosition += 6;
      });

      yPosition += 8;

      // Qualifications/Skills Section
      if (job.expected_qualification) {
        // Check if we need a new page
        if (yPosition > pageHeight - 60) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(59, 130, 246);
        pdf.text("Required Qualifications & Skills", margin, yPosition);
        pdf.setTextColor(0, 0, 0);
        yPosition += 7;
        
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        const qualLines = pdf.splitTextToSize(job.expected_qualification, pageWidth - (margin * 2));
        
        qualLines.forEach((line: string) => {
          if (yPosition > pageHeight - 20) {
            pdf.addPage();
            yPosition = 20;
          }
          pdf.text(line, margin + 5, yPosition);
          yPosition += 6;
        });

        yPosition += 8;
      }

      // Responsibilities Section
      if (job.job_description) {
        // Check if we need a new page
        if (yPosition > pageHeight - 60) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(59, 130, 246);
        pdf.text("Key Responsibilities", margin, yPosition);
        pdf.setTextColor(0, 0, 0);
        yPosition += 7;
        
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        const descLines = pdf.splitTextToSize(job.job_description, pageWidth - (margin * 2));
        
        descLines.forEach((line: string) => {
          if (yPosition > pageHeight - 20) {
            pdf.addPage();
            yPosition = 20;
          }
          pdf.text(line, margin + 5, yPosition);
          yPosition += 6;
        });

        yPosition += 8;
      }

      // Compensation Section
      if (job.salary_min || job.salary_max || job.billing_rate) {
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(59, 130, 246);
        pdf.text("Compensation", margin, yPosition);
        pdf.setTextColor(0, 0, 0);
        yPosition += 7;
        
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        
        if (job.salary_min || job.salary_max) {
          const salaryRange = job.salary_min && job.salary_max 
            ? `${job.salary_min} - ${job.salary_max}` 
            : job.salary_min || job.salary_max;
          pdf.text(`• Salary Range: ${salaryRange} ${job.currency || 'INR'}`, margin + 5, yPosition);
          yPosition += 6;
        }
        
        if (job.billing_rate) {
          pdf.text(`• Billing Rate: ${job.billing_rate}`, margin + 5, yPosition);
          yPosition += 6;
        }

        yPosition += 8;
      }

      // Additional Information Section
      if (job.sector || job.segments || job.closing_date) {
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(59, 130, 246);
        pdf.text("Additional Information", margin, yPosition);
        pdf.setTextColor(0, 0, 0);
        yPosition += 7;
        
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        
        if (job.sector) {
          pdf.text(`• Sector: ${job.sector}`, margin + 5, yPosition);
          yPosition += 6;
        }
        
        if (job.segments) {
          pdf.text(`• Segments: ${job.segments}`, margin + 5, yPosition);
          yPosition += 6;
        }
        
        if (job.closing_date) {
          const closingDate = new Date(job.closing_date).toLocaleDateString();
          pdf.text(`• Application Deadline: ${closingDate}`, margin + 5, yPosition);
          yPosition += 6;
        }
      }

      // Footer on last page
      const currentPage = pdf.getCurrentPageInfo().pageNumber;
      pdf.setPage(currentPage);
      
      // Add a separator line before footer
      yPosition = pageHeight - 45;
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.3);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 5;

      // Company Contact Information
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(30, 58, 138);
      pdf.text("Contact Information", margin, yPosition);
      yPosition += 5;
      
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(0, 0, 0);
      pdf.text("Email: hr@yourcompany.com | Phone: +1 (555) 123-4567 | Website: www.yourcompany.com", margin, yPosition);
      yPosition += 5;

      // Application Instructions
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(30, 58, 138);
      pdf.text("How to Apply", margin, yPosition);
      yPosition += 5;
      
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(0, 0, 0);
      pdf.text("Please submit your resume and cover letter through our careers portal or email to hr@yourcompany.com", margin, yPosition);
      yPosition += 6;

      // Generation info
      pdf.setFontSize(7);
      pdf.setTextColor(128, 128, 128);
      pdf.text(
        `Generated on ${new Date().toLocaleDateString()} | Job Reference: ${job.reference_no || job.id.substring(0, 8)}`,
        margin,
        pageHeight - 10
      );

      // Save PDF
      const fileName = `${job.position.replace(/[^a-z0-9]/gi, '_')}_JD.pdf`;
      pdf.save(fileName);
      toast.success("Job description downloaded successfully!");
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error("Failed to download job description");
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-[16px] p-6 shadow-sm mb-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-2/3 mb-3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-[16px] p-6 shadow-sm mb-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-2xl font-bold text-foreground">
              {job?.position || "Loading..."}
            </h1>
            <Badge className="bg-primary/10 text-primary border-primary/20">
              {job?.status === 'active' ? 'Active' : 'Draft'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">Job ID:</span>
              <span>#{jobId?.substring(0, 8) || "N/A"}</span>
            </div>
            {job?.experience && (
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <span>{job.experience}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">Vacancy:</span>
              <span>{job?.vacancies || 1} Position{(job?.vacancies || 1) > 1 ? 's' : ''}</span>
            </div>
            {job?.primary_locations && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>
                  {validateStringArray(job.primary_locations).join(', ') || 'Not specified'}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleVacancyClick}
          >
            <Building2 className="h-4 w-4" />
            {job?.vacancies || 1} Vacancy
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => window.open(`/interview-quiz/${jobId}`, '_blank')}
          >
            Quiz
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setShowEditModal(true)}
          >
            <Edit className="h-4 w-4" />
            Edit Job
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setShowShareDialog(true)}
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleDownloadJD}
          >
            <Download className="h-4 w-4" />
            Download JD
          </Button>
        </div>
      </div>

      {jobId && (
        <>
          <EditJobModal
            open={showEditModal}
            onOpenChange={setShowEditModal}
            jobId={jobId}
            onJobUpdated={loadJobData}
          />
          <ShareJobDialog
            open={showShareDialog}
            onOpenChange={setShowShareDialog}
            jobId={jobId}
            jobTitle={job?.position || ""}
          />
        </>
      )}
    </div>
  );
};

export default JobHeader;
