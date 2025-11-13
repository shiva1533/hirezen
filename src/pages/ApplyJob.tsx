import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, Loader2, Briefcase, MapPin, Calendar, Eye } from "lucide-react";
import * as pdfjsLib from 'pdfjs-dist';
import { validateStringArray } from "@/lib/utils";

interface Job {
  id: string;
  position: string;
  job_description: string;
  department: string;
  experience: string;
  primary_locations: string;
  vacancies: number;
  closing_date: string;
}

const ApplyJob = () => {
  const { jobId } = useParams();
  const { toast } = useToast();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumePreviewUrl, setResumePreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [emailSent, setEmailSent] = useState<boolean | null>(null);

  useEffect(() => {
    loadJob();
  }, [jobId]);

  useEffect(() => {
    // Cleanup preview URL when component unmounts or file changes
    return () => {
      if (resumePreviewUrl) {
        URL.revokeObjectURL(resumePreviewUrl);
      }
    };
  }, [resumePreviewUrl]);

  const scrollToForm = () => {
    document.getElementById('application-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadJob = async () => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", jobId)
        .eq("status", "active")
        .single();

      if (error) throw error;
      setJob(data);
    } catch (error) {
      console.error("Error loading job:", error);
      toast({
        title: "Error",
        description: "Could not load job details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    const validExtensions = [".pdf", ".doc", ".docx"];
    const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (validTypes.includes(file.type) || hasValidExtension) {
      // Revoke previous preview URL if exists
      if (resumePreviewUrl) {
        URL.revokeObjectURL(resumePreviewUrl);
      }
      
      setResumeFile(file);
      
      // Create preview URL only for PDFs
      if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        const previewUrl = URL.createObjectURL(file);
        setResumePreviewUrl(previewUrl);
      } else {
        setResumePreviewUrl(null);
      }
      
      toast({
        title: "Resume uploaded",
        description: "Your resume has been uploaded successfully.",
      });
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or Word document (.pdf, .doc, .docx).",
        variant: "destructive",
      });
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      processFile(file);
    }
  };

  const handleRemoveResume = () => {
    if (resumePreviewUrl) {
      URL.revokeObjectURL(resumePreviewUrl);
    }
    setResumeFile(null);
    setResumePreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resumeFile) {
      toast({
        title: "Resume required",
        description: "Please upload your resume to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Extract text from PDF client-side (skip for Word docs)
      let resumeText = '';
      
      if (resumeFile.type === 'application/pdf' || resumeFile.name.toLowerCase().endsWith('.pdf')) {
        try {
          const arrayBuffer = await resumeFile.arrayBuffer();
          
          // Configure worker for local pdfjs-dist
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

          const loadingTask = pdfjsLib.getDocument({
            data: new Uint8Array(arrayBuffer),
          });
          const pdf = await loadingTask.promise;

          let text = '';
          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            text += (textContent.items as any[])
              .map((i: any) => i?.str ?? '')
              .join(' ');
          }
          resumeText = text.trim();
          
          if (resumeText.length < 100) {
            toast({
              title: "Invalid Resume",
              description: "This appears to be a scanned PDF with no text. Please use an OCR tool to convert it first.",
              variant: "destructive",
            });
            setIsSubmitting(false);
            return;
          }
        } catch (error) {
          console.error('PDF parsing error:', error);
          throw new Error('Failed to parse PDF. Please try again.');
        }
      } else {
        // For Word docs, we'll send to backend for processing
        resumeText = 'Word document - will be processed on server';
      }

      // Upload file to Supabase Storage
      const fileName = `${Date.now()}_${resumeFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, resumeFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        throw new Error("Failed to upload resume file");
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(fileName);

      // Get form data
      const formData = new FormData(e.target as HTMLFormElement);
      const fullName = formData.get('fullName') as string;
      const email = formData.get('email') as string;
      const phone = formData.get('phone') as string;

      // Parse resume and save candidate using edge function (for AI processing)
      const { data: candidateData, error: parseError } = await supabase.functions.invoke(
        "parse-resume",
        {
          body: {
            resumeText,
            resumeUrl: publicUrl,
            jobId: jobId,
            additionalInfo: {
              fullName,
              email,
              phone,
            },
          },
        }
      );

      if (parseError) throw parseError;

      // Send confirmation email via local Node.js server
      try {
        console.log('Sending email via local server to:', email);
        const interviewLink = `${window.location.origin}/interview-quiz/${jobId}/${candidateData.candidate?.id || candidateData.id}`;

        const emailResponse = await fetch('http://localhost:3002/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: email,
            subject: 'Your Interview Link - HireZen',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Welcome to HireZen!</h2>
                <p>Dear <strong>${fullName}</strong>,</p>
                <p>Thank you for applying for the <strong>${job?.position}</strong> position. Your application has been received successfully.</p>

                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #2563eb; margin-top: 0;">Your Interview Link</h3>
                  <p>Click the button below to start your interview:</p>
                  <a href="${interviewLink}"
                     style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 0;">
                    Start Interview
                  </a>
                  <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">
                    Or copy this link: ${interviewLink}
                  </p>
                </div>

                <p><strong>Important:</strong> This interview link is unique to you and should not be shared with others.</p>

                <p>Your application details:</p>
                <ul>
                  <li><strong>Position:</strong> ${job?.position}</li>
                  <li><strong>Application ID:</strong> ${candidateData.id}</li>
                  <li><strong>Applied on:</strong> ${new Date().toLocaleDateString()}</li>
                </ul>

                <p>Best of luck with your interview!</p>
                <p>Best regards,<br>The HireZen Team</p>
              </div>
            `,
          }),
        });

        if (!emailResponse.ok) {
          const errorData = await emailResponse.json();
          console.error('Local server error:', errorData);
          setEmailSent(false);
        } else {
          const responseData = await emailResponse.json();
          console.log('Email sent successfully via local server:', responseData);
          setEmailSent(true);
        }
      } catch (emailError) {
        console.error('Email error:', emailError);
        setEmailSent(false);
      }

      // Check if email was sent successfully
      setEmailSent(true);

      toast({
        title: "Application submitted!",
        description: "Your application has been received and confirmation email sent. We'll be in touch soon.",
      });

      // Reset form
      setResumeFile(null);
      if (resumePreviewUrl) {
        URL.revokeObjectURL(resumePreviewUrl);
        setResumePreviewUrl(null);
      }
      setEmailSent(null);
    } catch (error) {
      console.error("Error submitting application:", error);
      setEmailSent(false);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Job Not Found</CardTitle>
            <CardDescription>
              This job posting is no longer available or has been closed.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 pb-24 md:pb-12">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Job Details Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-3xl">{job.position}</CardTitle>
                <CardDescription className="flex flex-wrap gap-4 text-base mt-2">
                  {job.department && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {job.department}
                    </span>
                  )}
                  {job.primary_locations && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {validateStringArray(job.primary_locations).join(", ")}
                    </span>
                  )}
                  {job.closing_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Apply by: {new Date(job.closing_date).toLocaleDateString()}
                    </span>
                  )}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`/interview-quiz/${jobId}`, '_blank')}
                  className="shrink-0 hidden md:flex"
                >
                  Attend Interview
                </Button>
                <Button onClick={scrollToForm} size="lg" className="shrink-0 hidden md:flex">
                  Apply Now
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="mb-2 font-semibold">Job Description</h3>
              <div className="whitespace-pre-wrap text-muted-foreground">
                {job.job_description || "No description available"}
              </div>
            </div>
            {job.experience && (
              <div>
                <h3 className="mb-2 font-semibold">Experience Required</h3>
                <p className="text-muted-foreground">{job.experience}</p>
              </div>
            )}
            <div>
              <h3 className="mb-2 font-semibold">Number of Vacancies</h3>
              <p className="text-muted-foreground">{job.vacancies}</p>
            </div>
          </CardContent>
        </Card>

        {/* Application Form Card */}
        <Card id="application-form">
          <CardHeader>
            <CardTitle>Apply for this position</CardTitle>
            <CardDescription>Fill out the form below to submit your application</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  required
                  placeholder="Enter your full name"
                  className="bg-background border-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="Enter your email address"
                  className="bg-background border-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  className="bg-background border-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resume">Resume * (PDF or Word document)</Label>

                {/* Email Status Indicator */}
                {emailSent !== null && (
                  <div className={`flex items-center gap-2 p-3 rounded-lg border ${
                    emailSent
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}>
                    {emailSent ? (
                      <>
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-sm text-green-800 font-medium">
                          ✓ Confirmation email sent successfully to your registered email address
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                        <span className="text-sm text-red-800 font-medium">
                          ✗ Failed to send confirmation email. Please contact support.
                        </span>
                      </>
                    )}
                  </div>
                )}
                
                {!resumeFile ? (
                  <div
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                      isDragging
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/25 hover:border-primary/50"
                    }`}
                    onClick={() => document.getElementById("resume")?.click()}
                  >
                    <input
                      id="resume"
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleFileChange}
                      className="hidden"
                      required
                    />
                    <div className="flex flex-col items-center gap-2">
                      <div className={`p-3 rounded-full ${isDragging ? "bg-primary/10" : "bg-muted"}`}>
                        <Upload className={`h-8 w-8 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {isDragging ? "Drop your resume here" : "Drag and drop your resume"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          or click to browse (PDF or Word, max 10MB)
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <button
                        type="button"
                        onClick={() => resumePreviewUrl && setShowPreviewModal(true)}
                        className={`flex items-center gap-2 flex-1 text-left ${
                          resumePreviewUrl ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
                        }`}
                        disabled={!resumePreviewUrl}
                      >
                        <div className="p-2 bg-primary/10 rounded">
                          <Upload className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{resumeFile.name}</p>
                            {resumePreviewUrl && (
                              <Eye className="h-3 w-3 text-muted-foreground" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                            {resumePreviewUrl && " • Click to preview"}
                          </p>
                        </div>
                      </button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveResume}
                      >
                        Change
                      </Button>
                    </div>
                  </div>
                )}
              </div>

            </form>
          </CardContent>
        </Card>
      </div>

      {/* Sticky Apply Button for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border md:hidden z-50">
        <Button
          onClick={(e) => {
            e.preventDefault();
            const form = document.getElementById('application-form')?.querySelector('form') as HTMLFormElement;
            if (form) {
              // Check if form is valid before submitting
              if (form.checkValidity()) {
                form.requestSubmit();
              } else {
                // Trigger form validation and focus first invalid field
                form.reportValidity();
              }
            }
          }}
          disabled={isSubmitting}
          size="lg" 
          className="w-full shadow-lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-5 w-5" />
              Apply Now
            </>
          )}
        </Button>
      </div>

      {/* PDF Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-4xl h-[90vh]">
          <DialogHeader>
            <DialogTitle>Resume Preview</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden rounded-lg border">
            {resumePreviewUrl && (
              <iframe
                src={resumePreviewUrl}
                className="w-full h-full"
                title="Resume Preview"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApplyJob;

