import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, FileText, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface CreateJobFromPDFModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJobCreated: () => void;
}

interface ExtractedJobData {
  position: string;
  department?: string;
  sector?: string;
  experience?: string;
  role_experience?: string;
  expected_qualification?: string;
  job_type?: string;
  mode_of_work?: string;
  priority_level?: string;
  salary_min?: string;
  salary_max?: string;
  currency?: string;
  billing_rate?: string;
  job_description: string;
  segments?: string;
  language?: string;
  vacancies?: number;
  state?: string;
  zone?: string;
  branch?: string;
  primary_locations?: string;
  secondary_locations?: string;
}

type FileStatus = {
  file: File;
  status: 'pending' | 'processing' | 'success' | 'error';
  error?: string;
  jobTitle?: string;
};

const CreateJobFromPDFModal = ({
  open,
  onOpenChange,
  onJobCreated,
}: CreateJobFromPDFModalProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileStatus[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      const pdfFiles = files.filter(file => file.type === "application/pdf");
      
      if (pdfFiles.length === 0) {
        toast({
          title: "Invalid File Type",
          description: "Please upload PDF files only.",
          variant: "destructive",
        });
        return;
      }

      if (pdfFiles.length !== files.length) {
        toast({
          title: "Some Files Skipped",
          description: `${files.length - pdfFiles.length} non-PDF files were skipped.`,
        });
      }

      setSelectedFiles(prev => [...prev, ...pdfFiles.map(file => ({ file, status: 'pending' as const }))]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const pdfFiles = files.filter(file => file.type === "application/pdf");
      
      if (pdfFiles.length === 0) {
        toast({
          title: "Invalid File Type",
          description: "Please upload PDF files only.",
          variant: "destructive",
        });
        return;
      }

      setSelectedFiles(prev => [...prev, ...pdfFiles.map(file => ({ file, status: 'pending' as const }))]);
    }
  };

  const processSinglePDF = async (fileStatus: FileStatus, index: number): Promise<FileStatus> => {
    try {
      setSelectedFiles(prev => prev.map((f, i) => i === index ? { ...f, status: 'processing' as const } : f));

      // Convert file to base64
      const reader = new FileReader();
      const fileDataPromise = new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
      });
      reader.readAsDataURL(fileStatus.file);
      const fileData = await fileDataPromise;

      // Call edge function to extract job data and create job
      const { data, error } = await supabase.functions.invoke("extract-job-from-pdf", {
        body: {
          fileData,
          fileName: fileStatus.file.name,
        },
      });

      if (error) throw error;

      // Show OCR notification if used
      if (data?.usedOCR) {
        toast({
          title: "OCR Processing",
          description: `${fileStatus.file.name} was scanned - text extracted using OCR.`,
        });
      }

      if (!data?.success || !data?.jobData) {
        throw new Error(data?.error || "Failed to extract job data from PDF");
      }

      return {
        ...fileStatus,
        status: 'success',
        jobTitle: data.jobData.position,
      };
    } catch (error: any) {
      console.error(`Error processing ${fileStatus.file.name}:`, error);
      return {
        ...fileStatus,
        status: 'error',
        error: error.message || "Failed to process PDF",
      };
    }
  };

  const handleProcessPDFs = async () => {
    if (selectedFiles.length === 0) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      let successCount = 0;
      let errorCount = 0;

      // Process files sequentially to avoid overwhelming the server
      for (let i = 0; i < selectedFiles.length; i++) {
        const result = await processSinglePDF(selectedFiles[i], i);
        
        setSelectedFiles(prev => prev.map((f, idx) => idx === i ? result : f));
        setProgress(((i + 1) / selectedFiles.length) * 100);

        if (result.status === 'success') {
          successCount++;
        } else {
          errorCount++;
        }
      }

      // Show summary toast
      if (successCount > 0 && errorCount === 0) {
        toast({
          title: "All Jobs Created",
          description: `Successfully created ${successCount} job${successCount > 1 ? 's' : ''}.`,
        });
        onJobCreated();
        onOpenChange(false);
        setSelectedFiles([]);
      } else if (successCount > 0 && errorCount > 0) {
        toast({
          title: "Partial Success",
          description: `Created ${successCount} job${successCount > 1 ? 's' : ''}. ${errorCount} failed.`,
        });
        onJobCreated();
      } else {
        toast({
          title: "All Processing Failed",
          description: "Failed to create any jobs. Please check the errors and try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Jobs from PDFs (Batch Processing)</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? "border-primary bg-primary/5" : "border-border"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="space-y-2">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Drag and drop your job description PDFs here, or click to select multiple files
              </p>
              <input
                type="file"
                accept="application/pdf"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="job-pdf-upload"
                disabled={isProcessing}
              />
              <label htmlFor="job-pdf-upload">
                <Button variant="outline" size="sm" asChild>
                  <span>Select PDF Files</span>
                </Button>
              </label>
            </div>
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
                </p>
                {!isProcessing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFiles([])}
                  >
                    Clear All
                  </Button>
                )}
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedFiles.map((fileStatus, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                  >
                    {fileStatus.status === 'pending' && (
                      <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    )}
                    {fileStatus.status === 'processing' && (
                      <Loader2 className="h-5 w-5 text-primary animate-spin flex-shrink-0" />
                    )}
                    {fileStatus.status === 'success' && (
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    )}
                    {fileStatus.status === 'error' && (
                      <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {fileStatus.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(fileStatus.file.size / 1024 / 1024).toFixed(2)} MB
                        {fileStatus.status === 'success' && fileStatus.jobTitle && (
                          <> • {fileStatus.jobTitle}</>
                        )}
                        {fileStatus.status === 'error' && fileStatus.error && (
                          <> • {fileStatus.error}</>
                        )}
                      </p>
                    </div>

                    {!isProcessing && fileStatus.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Processing...</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                if (!isProcessing) {
                  setSelectedFiles([]);
                }
              }}
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? "Processing..." : "Cancel"}
            </Button>
            <Button
              onClick={handleProcessPDFs}
              disabled={selectedFiles.length === 0 || isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing {selectedFiles.filter(f => f.status === 'processing').length} of {selectedFiles.length}
                </>
              ) : (
                `Create ${selectedFiles.length} Job${selectedFiles.length > 1 ? 's' : ''}`
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            AI will analyze each PDF and automatically extract job information to create job postings. Scanned PDFs will be processed with OCR.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateJobFromPDFModal;
