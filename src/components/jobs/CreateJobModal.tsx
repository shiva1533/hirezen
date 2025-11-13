import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Calendar as CalendarIcon, QrCode, X } from "lucide-react";
import JobQRCode from "./JobQRCode";
import { SegmentSelector } from "./SegmentSelector";
import { indiaStates, getZonesForState, getBranchesForZone, educationSegments } from "@/data/locationData";
import { z } from "zod";
import {
  validateStringArray,
  validateInterviewQuestions,
  toJSONString,
} from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wand2, Upload, FileText } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface CreateJobModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId?: string;
  templateId?: string;
  editTemplateId?: string;
  onJobSaved?: () => void;
}

// Validation schema for job data
const jobDataSchema = z.object({
  position: z.string().trim().min(1, "Position is required").max(200, "Position must be less than 200 characters"),
  vacancies: z.number().int().positive("Vacancies must be a positive number").max(1000, "Vacancies must be less than 1000"),
  experience: z.string().max(100, "Experience must be less than 100 characters").optional().nullable(),
  role_experience: z.string().max(200, "Role experience must be less than 200 characters").optional().nullable(),
  department: z.string().max(100, "Department must be less than 100 characters").optional().nullable(),
  job_description: z.string().min(1, "Job description is required").max(50000, "Job description is too long"),
  primary_locations: z.string().nullable(),
  secondary_locations: z.string().nullable(),
  expected_qualification: z.string().nullable(),
  interview_questions: z.any().nullable(),
  email: z.string().email("Invalid email").optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  zone: z.string().max(100).optional().nullable(),
  branch: z.string().max(100).optional().nullable(),
  sector: z.string().max(100).optional().nullable(),
  segments: z.string().max(100).optional().nullable(),
  reference_no: z.string().max(50).optional().nullable(),
  priority_level: z.string().max(50).optional().nullable(),
  billing_rate: z.string().max(50).optional().nullable(),
  currency: z.string().max(10).optional().nullable(),
  salary_min: z.string().max(20).optional().nullable(),
  salary_max: z.string().max(20).optional().nullable(),
  job_type: z.string().max(50).optional().nullable(),
  mode_of_work: z.string().max(50).optional().nullable(),
});

// Validation schema for template data
const templateDataSchema = z.object({
  template_name: z.string().trim().min(1, "Template name is required").max(200, "Template name must be less than 200 characters"),
  position: z.string().trim().min(1, "Position is required").max(200, "Position must be less than 200 characters"),
  experience: z.string().max(100).optional().nullable(),
  role_experience: z.string().max(200).optional().nullable(),
  department: z.string().max(100).optional().nullable(),
  job_description: z.string().max(50000).optional().nullable(),
  expected_qualification: z.string().nullable(),
  sector: z.string().max(100).optional().nullable(),
  segments: z.string().max(100).optional().nullable(),
  priority_level: z.string().max(50).optional().nullable(),
  billing_rate: z.string().max(50).optional().nullable(),
  currency: z.string().max(10).optional().nullable(),
  salary_min: z.string().max(20).optional().nullable(),
  salary_max: z.string().max(20).optional().nullable(),
  job_type: z.string().max(50).optional().nullable(),
  mode_of_work: z.string().max(50).optional().nullable(),
});

const CreateJobModal = ({ open, onOpenChange, jobId, templateId, editTemplateId, onJobSaved }: CreateJobModalProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [createdJobId, setCreatedJobId] = useState<string>("");
  
  // Location hierarchy state
  const [state, setState] = useState("");
  const [zone, setZone] = useState("");
  const [branch, setBranch] = useState("");
  const [availableZones, setAvailableZones] = useState<string[]>([]);
  const [availableBranches, setAvailableBranches] = useState<string[]>([]);
  
  const [position, setPosition] = useState("");
  const [vacancies, setVacancies] = useState("1");
  const [experience, setExperience] = useState("");
  const [roleExperience, setRoleExperience] = useState("");
  const [department, setDepartment] = useState("");
  const [pipelineTemplate, setPipelineTemplate] = useState("");
  const [placementTemplate, setPlacementTemplate] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [language, setLanguage] = useState("english");
  const [descriptionMode, setDescriptionMode] = useState("description");
  const [documentTemplate, setDocumentTemplate] = useState("");
  const [hodApprovers, setHodApprovers] = useState("");
  const [managementApprovers, setManagementApprovers] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [interviewQuestionsFile, setInterviewQuestionsFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingQuestions, setIsDraggingQuestions] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sector, setSector] = useState("");
  const [primaryLocations, setPrimaryLocations] = useState<string[]>([]);
  const [secondaryLocations, setSecondaryLocations] = useState<string[]>([]);
  const [referenceNo, setReferenceNo] = useState("");
  const [closingDate, setClosingDate] = useState<Date>();
  const [closingTime, setClosingTime] = useState("23:59");
  const [includeOtherLocations, setIncludeOtherLocations] = useState(false);
  const [segments, setSegments] = useState<string>("");
  const [priorityLevel, setPriorityLevel] = useState("");
  const [billingRate, setBillingRate] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [expectedQualification, setExpectedQualification] = useState<string[]>([]);
  const [jobType, setJobType] = useState("");
  const [modeOfWork, setModeOfWork] = useState("");
  const [isSavingAsTemplate, setIsSavingAsTemplate] = useState(false);

  // Handle state change - update available zones
  useEffect(() => {
    if (state) {
      const zones = getZonesForState(state);
      setAvailableZones(zones);
      setZone(""); // Reset zone when state changes
      setBranch(""); // Reset branch when state changes
      setAvailableBranches([]);
    } else {
      setAvailableZones([]);
      setZone("");
      setBranch("");
      setAvailableBranches([]);
    }
  }, [state]);

  // Handle zone change - update available branches
  useEffect(() => {
    if (zone) {
      const branches = getBranchesForZone(zone);
      setAvailableBranches(branches);
      setBranch(""); // Reset branch when zone changes
    } else {
      setAvailableBranches([]);
      setBranch("");
    }
  }, [zone]);

  // Load job or template data when editing or using template
  useEffect(() => {
    if (open) {
      if (jobId) {
        loadJobData();
      } else if (editTemplateId) {
        loadTemplateData(editTemplateId);
      } else if (templateId) {
        loadTemplateData(templateId);
      } else {
        // Reset form when opening for new job
        setState("");
        setZone("");
        setBranch("");
        setPosition("");
        setVacancies("1");
        setExperience("");
        setRoleExperience("");
        setDepartment("");
        setPipelineTemplate("");
        setPlacementTemplate("");
        setJobDescription("");
        setLanguage("english");
        setDescriptionMode("description");
        setDocumentTemplate("");
        setHodApprovers("");
        setManagementApprovers("");
        setUploadedFile(null);
        setInterviewQuestionsFile(null);
        setSector("");
        setPrimaryLocations([]);
        setSecondaryLocations([]);
        setReferenceNo("");
        setClosingDate(undefined);
        setClosingTime("23:59");
        setIncludeOtherLocations(false);
        setSegments("");
        setPriorityLevel("");
        setBillingRate("");
        setCurrency("INR");
        setSalaryMin("");
        setSalaryMax("");
        setExpectedQualification([]);
        setJobType("");
        setModeOfWork("");
      }
    }
  }, [open, jobId, templateId, editTemplateId]);

  const loadJobData = async () => {
    if (!jobId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error) throw error;

      if (data) {
        setState((data as any).state || "");
        setZone((data as any).zone || "");
        setBranch((data as any).branch || "");
        setPosition(data.position || "");
        setVacancies(data.vacancies?.toString() || "1");
        setExperience(data.experience || "");
        setRoleExperience(data.role_experience || "");
        setDepartment(data.department || "");
        setPipelineTemplate(data.pipeline_template || "");
        setPlacementTemplate(data.placement_template || "");
        setJobDescription(data.job_description || "");
        setLanguage(data.language || "english");
        setDocumentTemplate(data.document_template || "");
        setHodApprovers(data.hod_approvers || "");
        setManagementApprovers(data.management_approvers || "");
        setSector((data as any).sector || "");
        
        // Parse locations and qualifications using utility functions
        setPrimaryLocations(validateStringArray((data as any).primary_locations));
        setSecondaryLocations(validateStringArray((data as any).secondary_locations));
        setExpectedQualification(validateStringArray((data as any).expected_qualification));
        
        setReferenceNo((data as any).reference_no || "");
        if ((data as any).closing_date) {
          setClosingDate(new Date((data as any).closing_date));
        }
        if ((data as any).closing_time) {
          setClosingTime((data as any).closing_time);
        }
        setIncludeOtherLocations((data as any).include_other_locations || false);
        setSegments((data as any).segments || "");
        setPriorityLevel((data as any).priority_level || "");
        setBillingRate((data as any).billing_rate || "");
        setCurrency((data as any).currency || "INR");
        setSalaryMin((data as any).salary_min || "");
        setSalaryMax((data as any).salary_max || "");
        
        setJobType((data as any).job_type || "");
        setModeOfWork((data as any).mode_of_work || "");
      }
    } catch (error) {
      console.error('Error loading job:', error);
      toast({
        title: "Load Failed",
        description: "Failed to load job data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplateData = async (templateIdToLoad: string) => {
    if (!templateIdToLoad) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('job_templates')
        .select('*')
        .eq('id', templateIdToLoad)
        .single();

      if (error) throw error;

      if (data) {
        setPosition(data.position || "");
        setExperience(data.experience || "");
        setRoleExperience(data.role_experience || "");
        setDepartment(data.department || "");
        setPipelineTemplate(data.pipeline_template || "");
        setPlacementTemplate(data.placement_template || "");
        setJobDescription(data.job_description || "");
        setLanguage(data.language || "english");
        setDocumentTemplate(data.document_template || "");
        setSector(data.sector || "");
        setSegments(data.segments || "");
        setPriorityLevel(data.priority_level || "");
        setBillingRate(data.billing_rate || "");
        setCurrency(data.currency || "INR");
        setSalaryMin(data.salary_min || "");
        setSalaryMax(data.salary_max || "");
        
        // Parse expected qualification using utility function
        setExpectedQualification(validateStringArray(data.expected_qualification));
        
        setJobType(data.job_type || "");
        setModeOfWork(data.mode_of_work || "");
      }
    } catch (error) {
      console.error('Error loading template:', error);
      toast({
        title: "Load Failed",
        description: "Failed to load template data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAsTemplate = async () => {
    if (!position) {
      toast({
        title: "Position Required",
        description: "Please enter a position title before saving as template.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingAsTemplate(true);
    try {
      const templateData = {
        template_name: editTemplateId ? position : (window.prompt("Enter a name for this template:", position) || position),
        position,
        experience,
        role_experience: roleExperience,
        department,
        pipeline_template: pipelineTemplate,
        placement_template: placementTemplate,
        job_description: jobDescription,
        language,
        document_template: documentTemplate,
        sector: sector,
        segments: segments || null,
        priority_level: priorityLevel,
        billing_rate: billingRate,
        currency: currency,
        salary_min: salaryMin,
        salary_max: salaryMax,
        expected_qualification: toJSONString(expectedQualification),
        job_type: jobType,
        mode_of_work: modeOfWork,
      };

      // Validate template data
      try {
        templateDataSchema.parse(templateData);
        console.log('Template data validation passed');
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
          console.error('Validation errors:', errorMessages);
          toast({
            title: "Validation Error",
            description: errorMessages,
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      if (editTemplateId) {
        // Update existing template
        const { error } = await supabase
          .from('job_templates')
          .update(templateData)
          .eq('id', editTemplateId);

        if (error) throw error;

        toast({
          title: "Template Updated",
          description: "Job template has been updated successfully.",
        });
        
        if (onJobSaved) onJobSaved();
        handleReset();
        onOpenChange(false);
      } else {
        // Create new template
        if (!templateData.template_name) return;

        const { error } = await supabase
          .from('job_templates')
          .insert(templateData);

        if (error) throw error;

        toast({
          title: "Template Saved",
          description: "Job template has been saved successfully.",
        });
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save job template. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingAsTemplate(false);
    }
  };

  const handleReset = () => {
    setState("");
    setZone("");
    setBranch("");
    setPosition("");
    setVacancies("1");
    setExperience("");
    setRoleExperience("");
    setDepartment("");
    setPipelineTemplate("");
    setPlacementTemplate("");
    setJobDescription("");
    setLanguage("english");
    setDescriptionMode("description");
    setDocumentTemplate("");
    setHodApprovers("");
    setManagementApprovers("");
    setUploadedFile(null);
    setInterviewQuestionsFile(null);
    setSector("");
    setPrimaryLocations([]);
    setSecondaryLocations([]);
    setReferenceNo("");
    setClosingDate(undefined);
    setClosingTime("23:59");
    setIncludeOtherLocations(false);
    setSegments("");
    setPriorityLevel("");
    setBillingRate("");
    setCurrency("INR");
    setSalaryMin("");
    setSalaryMax("");
    setExpectedQualification([]);
    setJobType("");
    setModeOfWork("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleSaveDraft = async () => {
    if (!position) {
      toast({
        title: "Position Required",
        description: "Please enter a position title before saving.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const jobData = {
        state,
        zone,
        branch,
        position,
        vacancies: parseInt(vacancies) || 1,
        experience,
        role_experience: roleExperience,
        department,
        pipeline_template: pipelineTemplate,
        placement_template: placementTemplate,
        job_description: jobDescription,
        language,
        document_template: documentTemplate,
        hod_approvers: hodApprovers,
        management_approvers: managementApprovers,
        status: 'draft',
        sector: sector,
        primary_locations: toJSONString(primaryLocations),
        secondary_locations: toJSONString(secondaryLocations),
        reference_no: referenceNo,
        closing_date: closingDate?.toISOString(),
        closing_time: closingTime,
        include_other_locations: includeOtherLocations,
        segments: segments || null,
        priority_level: priorityLevel,
        billing_rate: billingRate,
        currency: currency,
        salary_min: salaryMin,
        salary_max: salaryMax,
        expected_qualification: toJSONString(expectedQualification),
        job_type: jobType,
        mode_of_work: modeOfWork,
      };

      let error;
      if (jobId) {
        // Update existing job
        const result = await supabase
          .from('jobs')
          .update(jobData)
          .eq('id', jobId);
        error = result.error;
      } else {
        // Insert new job
        const result = await supabase.from('jobs').insert(jobData);
        error = result.error;
      }

      if (error) throw error;

      toast({
        title: jobId ? "Job Updated" : "Draft Saved",
        description: jobId ? "Job has been updated successfully." : "Job draft has been saved successfully.",
      });
      
      if (onJobSaved) onJobSaved();
      handleReset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save job draft. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateJD = async () => {
    if (!position) {
      toast({
        title: "Position Required",
        description: "Please enter a position title before generating a job description.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-job-description', {
        body: {
          position,
          department,
          experience,
          roleExperience,
          language,
        },
      });

      if (error) {
        console.error('Error generating job description:', error);
        throw error;
      }

      if (data?.jobDescription) {
        setJobDescription(data.jobDescription);
        toast({
          title: "Job Description Generated",
          description: "AI has successfully created a professional job description.",
        });
      } else {
        throw new Error('No job description returned');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate job description. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateJob = async () => {
    console.log('Create Job clicked - Position:', position, 'Description:', jobDescription);
    
    if (!position || position.trim() === "") {
      toast({
        title: "Position Required",
        description: "Please enter a position title before creating the job.",
        variant: "destructive",
      });
      return;
    }

    if (!jobDescription || jobDescription.trim() === "") {
      toast({
        title: "Job Description Required",
        description: "Please add a job description before creating the job.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    console.log('Starting job creation/update...');
    
    try {
      let interviewQuestions = null;
      
      // If interview questions file is uploaded, parse it first
      if (interviewQuestionsFile) {
        console.log('Parsing interview questions file...');
        const questionsFormData = new FormData();
        questionsFormData.append('file', interviewQuestionsFile);
        
        const { data: questionsData, error: questionsError } = await supabase.functions.invoke(
          'parse-interview-questions',
          {
            body: questionsFormData,
          }
        );
        
        if (questionsError) {
          console.error('Error parsing questions:', questionsError);
          throw new Error('Failed to parse interview questions file');
        }
        
        if (questionsData?.questions) {
          interviewQuestions = questionsData.questions;
          console.log('Questions parsed successfully:', interviewQuestions.length);
        }
      }
      
      const jobData = {
        state,
        zone,
        branch,
        position,
        vacancies: parseInt(vacancies) || 1,
        experience,
        role_experience: roleExperience,
        department,
        pipeline_template: pipelineTemplate,
        placement_template: placementTemplate,
        job_description: jobDescription,
        language,
        document_template: documentTemplate,
        hod_approvers: hodApprovers,
        management_approvers: managementApprovers,
        status: 'active',
        sector: sector,
        primary_locations: toJSONString(primaryLocations),
        secondary_locations: toJSONString(secondaryLocations),
        reference_no: referenceNo,
        closing_date: closingDate?.toISOString(),
        closing_time: closingTime,
        include_other_locations: includeOtherLocations,
        segments: segments || null,
        priority_level: priorityLevel,
        billing_rate: billingRate,
        currency: currency,
        salary_min: salaryMin,
        salary_max: salaryMax,
        expected_qualification: toJSONString(expectedQualification),
        job_type: jobType,
        mode_of_work: modeOfWork,
        interview_questions: interviewQuestions,
      };

      console.log('Job data prepared:', jobData);

      // Validate job data
      try {
        jobDataSchema.parse(jobData);
        console.log('Job data validation passed');
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
          console.error('Validation errors:', errorMessages);
          toast({
            title: "Validation Error",
            description: errorMessages,
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      let result;
      if (jobId) {
        console.log('Updating job with ID:', jobId);
        result = await supabase
          .from('jobs')
          .update(jobData)
          .eq('id', jobId)
          .select();
      } else {
        console.log('Inserting new job');
        result = await supabase
          .from('jobs')
          .insert(jobData)
          .select();
      }

      console.log('Supabase result:', result);

      if (result.error) {
        console.error('Supabase error:', result.error);
        throw result.error;
      }

      const newJobId = result.data?.[0]?.id || jobId;
      
      toast({
        title: jobId ? "Job Updated" : "Job Created",
        description: jobId ? "Job has been updated successfully." : "Job posting has been created successfully.",
      });
      
      console.log('Job saved successfully, calling onJobSaved callback');
      if (onJobSaved) onJobSaved();
      handleReset();
      onOpenChange(false);
      
      // Show QR code for the created job
      if (newJobId && !jobId) {
        setCreatedJobId(newJobId);
        setShowQRCode(true);
      }
    } catch (error) {
      console.error('Error creating/updating job:', error);
      toast({
        title: jobId ? "Update Failed" : "Creation Failed",
        description: error instanceof Error ? error.message : `Failed to ${jobId ? 'update' : 'create'} job. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
      console.log('Job creation/update process completed');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 bg-background border-border shadow-lg rounded-[20px]">
        <div className="sticky top-0 z-10 bg-background border-b border-border px-8 py-6 rounded-t-[20px]">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-2xl font-semibold text-foreground">
                  {editTemplateId ? "Edit Template" : jobId ? "Edit Job" : "Create Job"}
                </DialogTitle>
                <DialogDescription className="mt-2 text-sm text-muted-foreground">
                  {editTemplateId 
                    ? "Update template details and information." 
                    : jobId 
                    ? "Update job details and information." 
                    : "Enter job details, department information, and role description."}
                </DialogDescription>
              </div>
              <Button 
                variant="ghost" 
                onClick={() => onOpenChange(false)}
                className="h-9 w-9 p-0 hover:bg-muted rounded-lg transition-all -mt-1"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </DialogHeader>
        </div>

        <div className="px-8 py-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                <p className="text-sm text-muted-foreground">Loading job data...</p>
              </div>
            </div>
          ) : (
            <>
          {/* Location Hierarchy Section */}
          <div className="space-y-6 pb-6 border-b border-border/50">
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-foreground">Location & Segment Information</h3>
              
              {/* Location Breadcrumb */}
              {(state || zone || branch) && (
                <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 rounded-lg border border-border/50">
                  <span className="text-xs font-medium text-muted-foreground">Selected Path:</span>
                  <div className="flex items-center gap-1.5">
                    {state && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setZone("");
                            setBranch("");
                            setAvailableBranches([]);
                          }}
                          className="text-sm font-medium text-primary hover:text-primary/80 hover:underline transition-colors cursor-pointer"
                        >
                          {state}
                        </button>
                        {zone && <span className="text-muted-foreground">›</span>}
                      </>
                    )}
                    {zone && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setBranch("");
                          }}
                          className="text-sm font-medium text-primary hover:text-primary/80 hover:underline transition-colors cursor-pointer"
                        >
                          {zone}
                        </button>
                        {branch && <span className="text-muted-foreground">›</span>}
                      </>
                    )}
                    {branch && (
                      <span className="text-sm font-medium text-primary">{branch}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-4 gap-6">
              {/* State */}
              <div className="space-y-2">
                <Label htmlFor="state" className="text-sm font-medium text-foreground">
                  State <span className="text-destructive">*</span>
                </Label>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger className="bg-background border-input">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border z-50 max-h-[300px]" side="bottom">
                    {indiaStates.map((stateName) => (
                      <SelectItem key={stateName} value={stateName}>
                        {stateName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Zone */}
              <div className="space-y-2">
                <Label htmlFor="zone" className="text-sm font-medium text-foreground">
                  Zone (District) <span className="text-destructive">*</span>
                </Label>
                <Select value={zone} onValueChange={setZone} disabled={!state || availableZones.length === 0}>
                  <SelectTrigger className="bg-background border-input disabled:opacity-50">
                    <SelectValue placeholder={state ? "Select zone" : "Select state first"} />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border z-50 max-h-[300px]" side="bottom">
                    {availableZones.map((zoneName) => (
                      <SelectItem key={zoneName} value={zoneName}>
                        {zoneName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Branch */}
              <div className="space-y-2">
                <Label htmlFor="branch" className="text-sm font-medium text-foreground">
                  Branch (Village/Locality) <span className="text-destructive">*</span>
                </Label>
                <Select value={branch} onValueChange={setBranch} disabled={!zone || availableBranches.length === 0}>
                  <SelectTrigger className="bg-background border-input disabled:opacity-50">
                    <SelectValue placeholder={zone ? "Select branch" : "Select zone first"} />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border z-50 max-h-[300px]" side="bottom">
                    {availableBranches.map((branchName) => (
                      <SelectItem key={branchName} value={branchName}>
                        {branchName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Segment */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Segment (Education Level)
                </Label>
                <SegmentSelector
                  availableSegments={educationSegments}
                  selectedSegment={segments}
                  onSelectedChange={setSegments}
                />
              </div>
            </div>
          </div>

          {/* Basic Job Information */}
          <div className="space-y-6 pb-6 border-b border-border/50">
            <h3 className="text-base font-semibold text-foreground">Basic Job Information</h3>
            
            {/* Two-column grid for form fields */}
            <div className="grid grid-cols-2 gap-6">
              {/* Position */}
              <div className="space-y-2">
              <Label htmlFor="position" className="text-sm font-medium text-foreground">
                Position
              </Label>
              <Input
                id="position"
                placeholder="Assistant Professor, Lab Instructor, Administrative Officer..."
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="bg-background border-input"
              />
            </div>

            {/* Vacancies */}
            <div className="space-y-2">
              <Label htmlFor="vacancies" className="text-sm font-medium text-foreground">
                Vacancies
              </Label>
              <Input
                id="vacancies"
                type="number"
                min="1"
                value={vacancies}
                onChange={(e) => setVacancies(e.target.value)}
                className="bg-background border-input"
              />
            </div>

            {/* Experience */}
            <div className="space-y-2">
              <Label htmlFor="experience" className="text-sm font-medium text-foreground">
                Experience
              </Label>
              <Select value={experience} onValueChange={setExperience}>
                <SelectTrigger className="bg-background border-input">
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border z-50" side="top">
                  <SelectItem value="fresher">Fresher</SelectItem>
                  <SelectItem value="1-3">1–3 years</SelectItem>
                  <SelectItem value="3-5">3–5 years</SelectItem>
                  <SelectItem value="5+">5+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Role Relevant Experience */}
            <div className="space-y-2">
              <Label htmlFor="roleExperience" className="text-sm font-medium text-foreground">
                Role Relevant Experience
              </Label>
              <Input
                id="roleExperience"
                type="number"
                placeholder="Years of relevant experience"
                value={roleExperience}
                onChange={(e) => setRoleExperience(e.target.value)}
                className="bg-background border-input"
              />
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label htmlFor="department" className="text-sm font-medium text-foreground">
                Department
              </Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger className="bg-background border-input">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border z-50" side="top">
                  <SelectItem value="computer-science">Computer Science</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="mechanical">Mechanical Engineering</SelectItem>
                  <SelectItem value="civil">Civil Engineering</SelectItem>
                  <SelectItem value="mathematics">Mathematics</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="administration">Administration</SelectItem>
                  <SelectItem value="library">Library</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Pipeline Template */}
            <div className="space-y-2">
              <Label htmlFor="pipelineTemplate" className="text-sm font-medium text-foreground">
                Pipeline Template
              </Label>
              <Select value={pipelineTemplate} onValueChange={setPipelineTemplate}>
                <SelectTrigger className="bg-background border-input">
                  <SelectValue placeholder="Select pipeline template" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border z-50" side="top">
                  <SelectItem value="academic-docs">Academic Hiring With Docs</SelectItem>
                  <SelectItem value="faculty">Faculty Hiring</SelectItem>
                  <SelectItem value="non-teaching">Non-Teaching Staff Template</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Placement Template - Full width */}
          <div className="space-y-2">
            <Label htmlFor="placementTemplate" className="text-sm font-medium text-foreground">
              Placement Template
            </Label>
            <Select value={placementTemplate} onValueChange={setPlacementTemplate}>
              <SelectTrigger className="bg-background border-input">
                <SelectValue placeholder="Select Placement Criteria" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50" side="top">
                <SelectItem value="academic-review">Academic Review Flow</SelectItem>
                <SelectItem value="standard">Standard Placement</SelectItem>
                <SelectItem value="fast-track">Fast Track Hiring</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Job Description Section */}
          <div className="space-y-4">
            <Label className="text-sm font-medium text-foreground">Job Description</Label>
            
            {/* All Controls in Single Horizontal Row */}
            <div className="flex items-center justify-between gap-4 py-2">
              {/* Left Side: Description Mode Toggles */}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDescriptionMode("description")}
                  className={`text-xs h-9 px-4 rounded-lg border transition-all ${
                    descriptionMode === "description"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-input hover:bg-muted"
                  }`}
                >
                  Enter Job Description
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDescriptionMode("skills")}
                  className={`text-xs h-9 px-4 rounded-lg border transition-all ${
                    descriptionMode === "skills"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-input hover:bg-muted"
                  }`}
                >
                  Add as Skills
                </Button>
              </div>

              {/* Right Side: Language and Generate JD */}
              <div className="flex items-center gap-3">
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-36 h-9 bg-background border-input text-sm rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border z-50" side="top">
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="hindi">Hindi</SelectItem>
                    <SelectItem value="telugu">Telugu</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleGenerateJD}
                  disabled={isGenerating || !position}
                  className="gap-2 h-9 px-4 rounded-lg border-transparent bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Wand2 className={`h-3.5 w-3.5 text-blue-600 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-medium">
                    {isGenerating ? 'Generating...' : 'Generate JD'}
                  </span>
                </Button>
              </div>
            </div>

            {/* Job Description Text Area */}
            <Textarea
              placeholder={descriptionMode === "description" 
                ? "Enter or generate a job description for the selected position…" 
                : "Enter skills separated by commas (e.g., Python, Data Analysis, Machine Learning...)"}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="min-h-[200px] bg-background border-[#E5E7EB] rounded-xl p-4 resize-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:border-blue-300 transition-all text-sm"
            />
          </div>

          {/* Document and Approval Setup Section */}
          <div className="space-y-6 pt-6 border-t border-border/50">
            <h3 className="text-base font-semibold text-foreground">Document & Approval Setup</h3>
            
            {/* Two-column grid for document and approval fields */}
            <div className="grid grid-cols-2 gap-6">
              {/* Document Template */}
              <div className="space-y-2">
                <Label htmlFor="documentTemplate" className="text-sm font-medium text-foreground">
                  Document Template
                </Label>
                <Select value={documentTemplate} onValueChange={setDocumentTemplate}>
                  <SelectTrigger className="bg-background border-input">
                    <SelectValue placeholder="Select document template" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border z-50" side="top">
                    <SelectItem value="academic-documents">Academic-Documents</SelectItem>
                    <SelectItem value="staff-forms">Staff Forms</SelectItem>
                    <SelectItem value="research-related">Research-Related</SelectItem>
                    <SelectItem value="admin-paperwork">Admin Paperwork</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* HOD Approval */}
              <div className="space-y-2">
                <Label htmlFor="hodApprovers" className="text-sm font-medium text-foreground">
                  HOD Approval
                </Label>
                <Select value={hodApprovers} onValueChange={setHodApprovers}>
                  <SelectTrigger className="bg-background border-input">
                    <SelectValue placeholder="Select approver" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border z-50" side="top">
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Upper Management Approval */}
              <div className="space-y-2 col-span-2">
                <Label htmlFor="managementApprovers" className="text-sm font-medium text-foreground">
                  Upper Management Approval
                </Label>
                <Select value={managementApprovers} onValueChange={setManagementApprovers}>
                  <SelectTrigger className="bg-background border-input">
                    <SelectValue placeholder="Select approvers (Principal / Admin)" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border z-50" side="top">
                    <SelectItem value="mr-suresh-principal">Mr. Suresh — Principal</SelectItem>
                    <SelectItem value="mrs-latha-admin">Mrs. Latha — Admin Officer</SelectItem>
                    <SelectItem value="dr-anjali-dean">Dr. Anjali — Dean of Academics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* File Upload Section - Interview Questions */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                Upload Interview Questions (ZIP file with questions and answers)
              </Label>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingQuestions(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDraggingQuestions(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingQuestions(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    setInterviewQuestionsFile(e.dataTransfer.files[0]);
                  }
                }}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  isDraggingQuestions
                    ? "border-blue-400 bg-blue-50/50"
                    : "border-[#E5E7EB] bg-muted/20 hover:bg-muted/40"
                }`}
              >
                <input
                  type="file"
                  id="questionsUpload"
                  accept=".zip"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setInterviewQuestionsFile(e.target.files[0]);
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-3">
                  {interviewQuestionsFile ? (
                    <>
                      <FileText className="h-12 w-12 text-blue-500" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">{interviewQuestionsFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(interviewQuestionsFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInterviewQuestionsFile(null);
                        }}
                        className="mt-2 rounded-lg"
                      >
                        Remove File
                      </Button>
                    </>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 text-muted-foreground/60" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">
                          Drag and drop ZIP file or click here to upload
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ZIP file with questions and answers (First 10 MCQ, then written questions)
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Upload a ZIP file containing interview questions and expected answers. The system will automatically parse and use these for AI interviews.
              </p>
            </div>

            {/* File Upload Section - Reference Documents */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                Attach Reference Question Paper
              </Label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  isDragging
                    ? "border-blue-400 bg-blue-50/50"
                    : "border-[#E5E7EB] bg-muted/20 hover:bg-muted/40"
                }`}
              >
                <input
                  type="file"
                  id="fileUpload"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-3">
                  {uploadedFile ? (
                    <>
                      <FileText className="h-12 w-12 text-blue-500" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">{uploadedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(uploadedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadedFile(null);
                        }}
                        className="mt-2 rounded-lg"
                      >
                        Remove File
                      </Button>
                    </>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 text-muted-foreground/60" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">
                          Drag and drop the files or click here to open file explorer
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Accepts PDF / DOCX
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Attach question paper or evaluation form related to the job.
              </p>
            </div>

            {/* Additional Job Details Section */}
            <div className="space-y-6 pt-6 border-t border-border/50">
              <h3 className="text-base font-semibold text-foreground">Additional Details</h3>
              
              {/* Two-column grid for additional fields */}
              <div className="grid grid-cols-2 gap-6">
                {/* Sector */}
                <div className="space-y-2">
                  <Label htmlFor="sector" className="text-sm font-medium text-foreground">
                    Sector
                  </Label>
                  <Select value={sector} onValueChange={setSector}>
                    <SelectTrigger className="bg-background border-input">
                      <SelectValue placeholder="Select sector" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border z-50" side="top">
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="research">Research</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Primary Locations */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    Primary Locations
                  </Label>
                  <Select 
                    value={primaryLocations[0] || ""} 
                    onValueChange={(value) => {
                      if (value && !primaryLocations.includes(value)) {
                        setPrimaryLocations([...primaryLocations, value]);
                      }
                    }}
                  >
                    <SelectTrigger className="bg-background border-input">
                      <SelectValue placeholder="Select locations" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border z-50 max-h-[300px]" side="top">
                      <SelectItem value="all">All</SelectItem>
                      
                      {/* Telangana Districts */}
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Telangana</div>
                      <SelectItem value="hyderabad">Hyderabad</SelectItem>
                      <SelectItem value="secunderabad">Secunderabad</SelectItem>
                      <SelectItem value="warangal">Warangal</SelectItem>
                      <SelectItem value="nizamabad">Nizamabad</SelectItem>
                      <SelectItem value="karimnagar">Karimnagar</SelectItem>
                      <SelectItem value="kamareddy">Kamareddy</SelectItem>
                      <SelectItem value="khammam">Khammam</SelectItem>
                      <SelectItem value="nalgonda">Nalgonda</SelectItem>
                      <SelectItem value="mahbubnagar">Mahbubnagar</SelectItem>
                      <SelectItem value="rangareddy">Rangareddy</SelectItem>
                      <SelectItem value="medchal-malkajgiri">Medchal-Malkajgiri</SelectItem>
                      <SelectItem value="adilabad">Adilabad</SelectItem>
                      <SelectItem value="suryapet">Suryapet</SelectItem>
                      <SelectItem value="siddipet">Siddipet</SelectItem>
                      
                      {/* Andhra Pradesh Districts */}
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">Andhra Pradesh</div>
                      <SelectItem value="visakhapatnam">Visakhapatnam</SelectItem>
                      <SelectItem value="vijayawada">Vijayawada</SelectItem>
                      <SelectItem value="guntur">Guntur</SelectItem>
                      <SelectItem value="tirupati">Tirupati</SelectItem>
                      <SelectItem value="kakinada">Kakinada</SelectItem>
                      <SelectItem value="rajahmundry">Rajahmundry</SelectItem>
                      <SelectItem value="nellore">Nellore</SelectItem>
                      <SelectItem value="kurnool">Kurnool</SelectItem>
                      <SelectItem value="kadapa">Kadapa</SelectItem>
                      <SelectItem value="anantapur">Anantapur</SelectItem>
                      <SelectItem value="eluru">Eluru</SelectItem>
                      <SelectItem value="ongole">Ongole</SelectItem>
                      <SelectItem value="chittoor">Chittoor</SelectItem>
                      <SelectItem value="srikakulam">Srikakulam</SelectItem>
                      <SelectItem value="vizianagaram">Vizianagaram</SelectItem>
                    </SelectContent>
                  </Select>
                  {primaryLocations.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {primaryLocations.map((location) => (
                        <span
                          key={location}
                          className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs"
                        >
                          {location}
                          <button
                            type="button"
                            onClick={() => setPrimaryLocations(primaryLocations.filter(l => l !== location))}
                            className="hover:text-destructive"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Include Other Locations Checkbox */}
                  <div className="flex items-center space-x-2 mt-3">
                    <Checkbox 
                      id="includeOtherLocations" 
                      checked={includeOtherLocations}
                      onCheckedChange={(checked) => setIncludeOtherLocations(checked as boolean)}
                    />
                    <label
                      htmlFor="includeOtherLocations"
                      className="text-sm text-foreground cursor-pointer"
                    >
                      Include matches from other locations.
                    </label>
                  </div>
                </div>

                {/* Secondary Locations */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    Secondary Locations
                  </Label>
                  <Select 
                    value={secondaryLocations[0] || ""} 
                    onValueChange={(value) => {
                      if (value && !secondaryLocations.includes(value)) {
                        setSecondaryLocations([...secondaryLocations, value]);
                      }
                    }}
                  >
                    <SelectTrigger className="bg-background border-input">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border z-50" side="top">
                      <SelectItem value="library">Library</SelectItem>
                      <SelectItem value="lab-building">Lab Building</SelectItem>
                      <SelectItem value="admin-block">Admin Block</SelectItem>
                      <SelectItem value="sports-complex">Sports Complex</SelectItem>
                    </SelectContent>
                  </Select>
                  {secondaryLocations.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {secondaryLocations.map((location) => (
                        <span
                          key={location}
                          className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs"
                        >
                          {location}
                          <button
                            type="button"
                            onClick={() => setSecondaryLocations(secondaryLocations.filter(l => l !== location))}
                            className="hover:text-destructive"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reference No */}
                <div className="space-y-2">
                  <Label htmlFor="referenceNo" className="text-sm font-medium text-foreground">
                    Reference No
                  </Label>
                  <Input
                    id="referenceNo"
                    placeholder="Enter reference number"
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    className="bg-background border-input"
                  />
                </div>
              </div>

              {/* Closing Date and Time */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Closing Date {closingDate && <span className="text-xs text-muted-foreground">— Ends in {Math.ceil((closingDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days</span>}
                </Label>
                <div className="flex gap-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "flex-1 justify-start text-left font-normal bg-background border-input",
                          !closingDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {closingDate ? format(closingDate, "MMM dd yyyy") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-popover" align="start" side="top">
                      <Calendar
                        mode="single"
                        selected={closingDate}
                        onSelect={setClosingDate}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Select value={closingTime} onValueChange={setClosingTime}>
                    <SelectTrigger className="w-40 bg-background border-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border z-50" side="top">
                      <SelectItem value="00:00">12:00 AM</SelectItem>
                      <SelectItem value="06:00">6:00 AM</SelectItem>
                      <SelectItem value="12:00">12:00 PM</SelectItem>
                      <SelectItem value="18:00">6:00 PM</SelectItem>
                      <SelectItem value="23:59">11:59 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Other Information Section */}
            <div className="space-y-6 pt-6 border-t border-border/50">
              <h3 className="text-base font-semibold text-foreground">Other Information</h3>
              
              {/* First Row: Segments */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Segments
                </Label>
                <Select 
                  value={segments} 
                  onValueChange={setSegments}
                >
                  <SelectTrigger className="bg-background border-input">
                    <SelectValue placeholder="Select segment" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border z-50" side="top">
                    <SelectItem value="Pre Primary">Pre Primary</SelectItem>
                    <SelectItem value="Primary">Primary</SelectItem>
                    <SelectItem value="High School">High School</SelectItem>
                    <SelectItem value="Higher Secondary">Higher Secondary</SelectItem>
                    <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                    <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                    <SelectItem value="Research">Research</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Two-column grid for other information fields */}
              <div className="grid grid-cols-2 gap-6">
                {/* Priority Level */}
                <div className="space-y-2">
                  <Label htmlFor="priorityLevel" className="text-sm font-medium text-foreground">
                    Priority Level
                  </Label>
                  <Select value={priorityLevel} onValueChange={setPriorityLevel}>
                    <SelectTrigger className="bg-background border-input">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border z-50" side="top">
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Billing Rate */}
                <div className="space-y-2">
                  <Label htmlFor="billingRate" className="text-sm font-medium text-foreground">
                    Billing Rate
                  </Label>
                  <Select value={billingRate} onValueChange={setBillingRate}>
                    <SelectTrigger className="bg-background border-input">
                      <SelectValue placeholder="Select billing rate" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border z-50" side="top">
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Currency */}
                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-sm font-medium text-foreground">
                    Currency
                  </Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="bg-background border-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border z-50" side="top">
                      <SelectItem value="INR">INR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Salary Min */}
                <div className="space-y-2">
                  <Label htmlFor="salaryMin" className="text-sm font-medium text-foreground">
                    Salary Min
                  </Label>
                  <Input
                    id="salaryMin"
                    type="number"
                    placeholder="300000"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    className="bg-background border-input"
                  />
                </div>

                {/* Salary Max */}
                <div className="space-y-2">
                  <Label htmlFor="salaryMax" className="text-sm font-medium text-foreground">
                    Salary Max
                  </Label>
                  <Input
                    id="salaryMax"
                    type="number"
                    placeholder="500000"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    className="bg-background border-input"
                  />
                </div>

                {/* Job Type */}
                <div className="space-y-2">
                  <Label htmlFor="jobType" className="text-sm font-medium text-foreground">
                    Job Type
                  </Label>
                  <Select value={jobType} onValueChange={setJobType}>
                    <SelectTrigger className="bg-background border-input">
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border z-50" side="top">
                      <SelectItem value="full-time">Full Time</SelectItem>
                      <SelectItem value="part-time">Part Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="temporary">Temporary</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Mode Of Work */}
                <div className="space-y-2">
                  <Label htmlFor="modeOfWork" className="text-sm font-medium text-foreground">
                    Mode Of Work
                  </Label>
                  <Select value={modeOfWork} onValueChange={setModeOfWork}>
                    <SelectTrigger className="bg-background border-input">
                      <SelectValue placeholder="Select work mode" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border z-50" side="top">
                      <SelectItem value="office">Office</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Expected Qualification - Full width */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Expected Qualification
                </Label>
                <Select 
                  value={expectedQualification[0] || ""} 
                  onValueChange={(value) => {
                    if (value && !expectedQualification.includes(value)) {
                      setExpectedQualification([...expectedQualification, value]);
                    }
                  }}
                >
                  <SelectTrigger className="bg-background border-input">
                    <SelectValue placeholder="Select qualifications" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border z-50" side="top">
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="high-school">High School</SelectItem>
                    <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                    <SelectItem value="masters">Master's Degree</SelectItem>
                    <SelectItem value="phd">PhD</SelectItem>
                    <SelectItem value="diploma">Diploma</SelectItem>
                    <SelectItem value="certification">Professional Certification</SelectItem>
                  </SelectContent>
                </Select>
                {expectedQualification.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {expectedQualification.map((qual) => (
                      <span
                        key={qual}
                        className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs"
                      >
                        {qual}
                        <button
                          type="button"
                          onClick={() => setExpectedQualification(expectedQualification.filter(q => q !== qual))}
                          className="hover:text-destructive"
                        >
                        ×
                        </button>
                      </span>
                     ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          </div>
            </>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="sticky bottom-0 bg-background border-t border-border/50 px-8 py-4 flex items-center justify-between rounded-b-[20px]">
          {editTemplateId ? (
            <>
              <div />
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleReset}
                  className="h-10 px-5 border-[#E5E7EB] hover:bg-muted rounded-lg transition-all"
                >
                  Reset
                </Button>
                <Button 
                  onClick={handleSaveAsTemplate}
                  disabled={isSavingAsTemplate || !position}
                  className="h-10 px-5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg shadow-sm transition-all disabled:opacity-50"
                >
                  {isSavingAsTemplate ? 'Updating...' : 'Update Template'}
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button 
                variant="ghost" 
                onClick={handleSaveAsTemplate}
                disabled={isSavingAsTemplate || !position}
                className="h-10 px-5 text-muted-foreground hover:text-foreground rounded-lg transition-all"
              >
                {isSavingAsTemplate ? 'Saving Template...' : 'Save as Template'}
              </Button>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleReset}
                  className="h-10 px-5 border-[#E5E7EB] hover:bg-muted rounded-lg transition-all"
                >
                  Reset
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={handleSaveDraft}
                  disabled={isSaving}
                  className="h-10 px-5 bg-secondary hover:bg-secondary/80 rounded-lg transition-all disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save as Draft'}
                </Button>
                <Button 
                  onClick={handleCreateJob}
                  disabled={isSaving}
                  className="h-10 px-5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg shadow-sm transition-all disabled:opacity-50"
                >
                  {isSaving ? (jobId ? 'Updating...' : 'Creating...') : (jobId ? 'Update Job' : 'Create Job')}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
      <JobQRCode 
        jobId={createdJobId} 
        jobTitle={position} 
        open={showQRCode} 
        onOpenChange={setShowQRCode} 
      />
    </Dialog>
  );
};

export default CreateJobModal;
