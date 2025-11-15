import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Loader2, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import * as pdfjsLib from 'pdfjs-dist';

interface UploadResumeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ExtractedData {
  full_name: string;
  email: string;
  phone?: string;
  experience_years?: number;
  position?: string;
  skills?: string;
  location?: string;
  education?: string;
  summary?: string;
}

interface FileUploadStatus {
  file: File;
  status: 'pending' | 'processing' | 'extracting' | 'extracted' | 'success' | 'error';
  progress: number;
  resumeText?: string;
  extractedData?: ExtractedData;
  candidateName?: string;
  error?: string;
  previewUrl?: string;
  isDuplicate?: boolean;
  duplicateId?: string;
}

const UploadResumeModal = ({ open, onOpenChange }: UploadResumeModalProps) => {
  const [files, setFiles] = useState<FileUploadStatus[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const ALLOWED_EXTENSIONS = ['.pdf', '.txt', '.doc', '.docx'];

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`;
    }
    
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return `Invalid file type. Only ${ALLOWED_EXTENSIONS.join(', ')} files are supported.`;
    }
    
    if (!ALLOWED_TYPES.includes(file.type) && file.type !== '') {
      return `Invalid file type. Only PDF, TXT, and DOCX files are supported.`;
    }
    
    return null;
  };

  const updateFileStatus = (index: number, updates: Partial<FileUploadStatus>) => {
    setFiles(prev => prev.map((f, i) => i === index ? { ...f, ...updates } : f));
  };

  const updateExtractedData = (index: number, field: keyof ExtractedData, value: string | number) => {
    setFiles(prev => prev.map((f, i) => {
      if (i === index && f.extractedData) {
        return {
          ...f,
          extractedData: {
            ...f.extractedData,
            [field]: value
          }
        };
      }
      return f;
    }));
  };

  const toggleEdit = (index: number) => {
    setEditingIndex(editingIndex === index ? null : index);
  };

  const processFile = async (file: File, index: number) => {
    const error = validateFile(file);
    if (error) {
      updateFileStatus(index, { status: 'error', error, progress: 0 });
      return;
    }

    updateFileStatus(index, { status: 'processing', progress: 10 });

    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      if (fileExtension === 'pdf') {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            updateFileStatus(index, { progress: 40 });
            const arrayBuffer = event.target?.result as ArrayBuffer;

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
              updateFileStatus(index, { progress: Math.min(95, Math.round((pageNum / pdf.numPages) * 90) + 5) });
            }

            const trimmedText = text.trim();
            
            // Check for scanned/image-only PDFs
            if (trimmedText.length < 100) {
              updateFileStatus(index, { 
                status: 'error', 
                error: '📄 Scanned PDF detected - No text found. Please use an OCR tool (like Adobe Acrobat, Smallpdf, or Google Drive) to convert this PDF to searchable text first, then retry.', 
                progress: 0 
              });
              return;
            }

            updateFileStatus(index, { status: 'success', progress: 100, resumeText: trimmedText });
            // Auto-extract candidate info after successful PDF parsing
            await extractCandidateInfo(trimmedText, index);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to parse PDF';
            updateFileStatus(index, { status: 'error', error: errorMessage, progress: 0 });
          }
        };
        reader.readAsArrayBuffer(file);
      } else if (['docx', 'doc'].includes(fileExtension || '')) {
        updateFileStatus(index, { 
          status: 'error', 
          error: 'DOCX/DOC not supported. Please convert to PDF or TXT.',
          progress: 0 
        });
      } else {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const text = event.target?.result as string;
          updateFileStatus(index, { status: 'success', resumeText: text, progress: 100 });
          // Auto-extract candidate info after successful text parsing
          await extractCandidateInfo(text, index);
        };
        reader.onerror = () => {
          updateFileStatus(index, { status: 'error', error: 'Failed to read file', progress: 0 });
        };
        reader.readAsText(file);
      }
    } catch (error) {
      updateFileStatus(index, { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error',
        progress: 0 
      });
    }
  };

  const extractCandidateInfo = async (resumeText: string, index: number) => {
    try {
      updateFileStatus(index, { status: 'extracting', progress: 50 });

      const { data, error } = await supabase.functions.invoke("extract-candidate-info", {
        body: { resumeText: resumeText.trim() },
      });

      if (error) {
        throw new Error(error.message || "Failed to extract candidate info");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (!data?.extractedData) {
        throw new Error("No data extracted from resume");
      }

      updateFileStatus(index, {
        status: 'extracted',
        progress: 100,
        extractedData: data.extractedData,
        candidateName: data.extractedData.full_name
      });

      // Check for duplicates after extraction
      await checkDuplicate(data.extractedData.email, index);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to extract info';
      updateFileStatus(index, { status: 'error', error: errorMessage, progress: 0 });
    }
  };

  const checkDuplicate = async (email: string, index: number) => {
    if (!email) return;

    try {
      const { data: existingCandidate, error } = await supabase
        .from("candidates")
        .select("id, full_name")
        .eq("email", email.toLowerCase())
        .maybeSingle();

      if (error) {
        console.error("Error checking for duplicates:", error);
        return;
      }

      if (existingCandidate) {
        updateFileStatus(index, {
          isDuplicate: true,
          duplicateId: existingCandidate.id
        });
      }
    } catch (error) {
      console.error("Duplicate check error:", error);
    }
  };

  const processAllFiles = async () => {
    setIsProcessing(true);
    
    for (let i = 0; i < files.length; i++) {
      if (files[i].status === 'pending') {
        await processFile(files[i].file, i);
      }
    }
    
    setIsProcessing(false);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;
    
    const newFiles: FileUploadStatus[] = Array.from(selectedFiles).map(file => ({
      file,
      status: 'pending',
      progress: 0
    }));
    
    const startIndex = files.length;
    setFiles(prev => [...prev, ...newFiles]);
    
    // Auto-process new files
    setIsProcessing(true);
    for (let i = 0; i < newFiles.length; i++) {
      await processFile(newFiles[i].file, startIndex + i);
    }
    setIsProcessing(false);
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

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      const newFiles: FileUploadStatus[] = Array.from(droppedFiles).map(file => ({
        file,
        status: 'pending',
        progress: 0
      }));
      
      const startIndex = files.length;
      setFiles(prev => [...prev, ...newFiles]);
      
      // Auto-process new files
      setIsProcessing(true);
      for (let i = 0; i < newFiles.length; i++) {
        await processFile(newFiles[i].file, startIndex + i);
      }
      setIsProcessing(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getStatusIcon = (status: FileUploadStatus['status']) => {
    switch (status) {
      case 'extracted':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'success':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case 'extracting':
        return <Loader2 className="h-5 w-5 animate-spin text-purple-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-destructive" />;
      case 'processing':
        return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: FileUploadStatus['status']) => {
    switch (status) {
      case 'extracted':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Ready</Badge>;
      case 'success':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Parsed</Badge>;
      case 'extracting':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Extracting...</Badge>;
      case 'error':
        return <Badge variant="destructive">Failed</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Processing</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const handleSubmitAll = async () => {
    const successfulFiles = files.filter(f => f.status === 'extracted' && f.extractedData);
    const duplicates = successfulFiles.filter(f => f.isDuplicate);
    
    if (successfulFiles.length === 0) {
      toast({
        title: "No Files Ready",
        description: "Please wait for AI extraction to complete or ensure at least one file was successfully processed.",
        variant: "destructive",
      });
      return;
    }

    // Warn about duplicates but allow submission
    if (duplicates.length > 0) {
      const confirmed = window.confirm(
        `⚠️ Warning: ${duplicates.length} candidate(s) with duplicate email addresses detected.\n\n` +
        `These candidates already exist in the database. Uploading will create duplicate entries.\n\n` +
        `Do you want to continue anyway?`
      );
      
      if (!confirmed) {
        return;
      }
    }

    setIsProcessing(true);
    let successCount = 0;
    let updatedCount = 0;
    let errorCount = 0;

    for (const fileStatus of successfulFiles) {
      try {
        // Upload file to Supabase Storage
        const fileName = `${Date.now()}_${fileStatus.file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(fileName, fileStatus.file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error("Storage upload error:", uploadError);
          errorCount++;
          continue;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('resumes')
          .getPublicUrl(fileName);

        // Prepare candidate data for batch upload
        const candidateData = {
          full_name: fileStatus.extractedData!.full_name,
          email: fileStatus.extractedData!.email,
          phone: fileStatus.extractedData!.phone || null,
          experience_years: fileStatus.extractedData!.experience_years || null,
          resume_text: fileStatus.resumeText!.trim(),
          resume_url: publicUrl,
          job_id: null,
          status: "pending",
          skills: fileStatus.extractedData!.skills || null,
        };

        // Use edge function with service role to insert candidate securely
        const { data: batchResult, error: batchError } = await supabase.functions.invoke(
          "batch-upload-resumes",
          {
            body: { candidates: [candidateData] },
          }
        );

        if (batchError || !batchResult?.success) {
          console.error("Batch upload error:", batchError || batchResult);
          errorCount++;
          continue;
        }

        if (batchResult.results.failedCount > 0) {
          const fail = batchResult.results.failedCandidates[0];
          console.error("Candidate insert failed:", fail);
          errorCount++;
          continue;
        }

        const successItem = batchResult.results.successfulCandidates?.[0];
        if (successItem?.updated) {
          updatedCount++;
        } else {
          successCount++;
        }
      } catch (error) {
        console.error("Upload error:", error);
        errorCount++;
      }
    }

    queryClient.invalidateQueries({ queryKey: ["candidates"] });

    toast({
      title: "Batch Upload Complete",
      description: `Uploaded ${successCount} | Updated ${updatedCount}${errorCount > 0 ? ` | Failed ${errorCount}` : ''}`,
      variant: errorCount > 0 ? "destructive" : "default",
    });

    setIsProcessing(false);
    
    // Close modal and reset after successful batch
    if (successCount > 0) {
      setTimeout(() => {
        onOpenChange(false);
        setFiles([]);
      }, 2000);
    }
  };

  const extractedCount = files.filter(f => f.status === 'extracted').length;
  const duplicateCount = files.filter(f => f.isDuplicate).length;
  const errorCount = files.filter(f => f.status === 'error').length;
  const processingCount = files.filter(f => f.status === 'processing' || f.status === 'extracting' || f.status === 'success').length;
  const pendingCount = files.filter(f => f.status === 'pending').length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            Batch Resume Upload
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Upload multiple resume files at once. Supports PDF and TXT files up to 10MB each.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Drag and Drop Zone */}
          <div 
            className={`border-2 border-dashed rounded-xl p-8 transition-all ${
              isDragging 
                ? 'border-primary bg-primary/5 scale-[1.02]' 
                : 'border-border hover:border-primary/50'
            }`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <label htmlFor="resume-files" className="cursor-pointer block">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-foreground text-lg">
                    {isDragging ? 'Drop files here' : 'Drag & drop resume files'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    or click to browse (multiple files supported)
                  </p>
                  <div className="mt-4 space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Supported formats: PDF, TXT
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Maximum size: 10MB per file
                    </p>
                  </div>
                </div>
              </div>
              <input
                id="resume-files"
                type="file"
                accept=".txt,.pdf"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>


          {/* Files List */}
          {files.length > 0 && (
            <div className="border border-border rounded-lg">
              <div className="p-3 bg-muted/50 border-b border-border">
                <h3 className="font-semibold text-sm text-foreground">Uploaded Files</h3>
              </div>
              <ScrollArea className="max-h-[500px]">
                <div className="divide-y divide-border">
                  {files.map((fileStatus, index) => (
                    <div key={index} className="p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-start gap-3">
                        {getStatusIcon(fileStatus.status)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm text-foreground truncate">
                              {fileStatus.file.name}
                            </p>
                            {getStatusBadge(fileStatus.status)}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {(fileStatus.file.size / 1024).toFixed(2)} KB
                          </p>
                          {fileStatus.extractedData && (
                            <div className={`mt-2 p-3 border rounded space-y-2 ${
                              fileStatus.isDuplicate 
                                ? 'bg-yellow-50 border-yellow-300' 
                                : 'bg-green-50 border-green-200'
                            }`}>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <p className={`font-semibold text-xs ${
                                    fileStatus.isDuplicate ? 'text-yellow-800' : 'text-green-800'
                                  }`}>
                                    {fileStatus.isDuplicate ? '⚠️ Duplicate Detected' : '📋 AI Extracted Info'}
                                  </p>
                                  {fileStatus.isDuplicate && (
                                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 text-[10px] px-1.5 py-0">
                                      Already in DB
                                    </Badge>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`h-6 px-2 text-xs hover:bg-opacity-20 ${
                                    fileStatus.isDuplicate 
                                      ? 'text-yellow-700 hover:text-yellow-900 hover:bg-yellow-100' 
                                      : 'text-green-700 hover:text-green-900 hover:bg-green-100'
                                  }`}
                                  onClick={() => toggleEdit(index)}
                                >
                                  {editingIndex === index ? "Save" : "Edit"}
                                </Button>
                              </div>
                              
                              {fileStatus.isDuplicate && (
                                <Alert className="bg-yellow-100 border-yellow-300 py-2">
                                  <AlertDescription className="text-xs text-yellow-800">
                                    A candidate with email <span className="font-semibold">{fileStatus.extractedData.email}</span> already exists in the database.
                                  </AlertDescription>
                                </Alert>
                              )}
                              
                              {editingIndex === index ? (
                                <div className="space-y-2">
                                  <div>
                                    <Label htmlFor={`name-${index}`} className={`text-xs ${fileStatus.isDuplicate ? 'text-yellow-800' : 'text-green-800'}`}>Name *</Label>
                                    <Input
                                      id={`name-${index}`}
                                      value={fileStatus.extractedData.full_name}
                                      onChange={(e) => updateExtractedData(index, 'full_name', e.target.value)}
                                      className="h-7 text-xs mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`email-${index}`} className={`text-xs ${fileStatus.isDuplicate ? 'text-yellow-800' : 'text-green-800'}`}>Email *</Label>
                                    <Input
                                      id={`email-${index}`}
                                      type="email"
                                      value={fileStatus.extractedData.email}
                                      onChange={async (e) => {
                                        updateExtractedData(index, 'email', e.target.value);
                                        // Re-check for duplicates when email changes
                                        await checkDuplicate(e.target.value, index);
                                      }}
                                      className="h-7 text-xs mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`phone-${index}`} className={`text-xs ${fileStatus.isDuplicate ? 'text-yellow-800' : 'text-green-800'}`}>Phone</Label>
                                    <Input
                                      id={`phone-${index}`}
                                      value={fileStatus.extractedData.phone || ''}
                                      onChange={(e) => updateExtractedData(index, 'phone', e.target.value)}
                                      className="h-7 text-xs mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`skills-${index}`} className={`text-xs ${fileStatus.isDuplicate ? 'text-yellow-800' : 'text-green-800'}`}>Skills</Label>
                                    <Textarea
                                      id={`skills-${index}`}
                                      value={fileStatus.extractedData.skills || ''}
                                      onChange={(e) => updateExtractedData(index, 'skills', e.target.value)}
                                      className="min-h-[60px] text-xs mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`experience-${index}`} className={`text-xs ${fileStatus.isDuplicate ? 'text-yellow-800' : 'text-green-800'}`}>Experience (years)</Label>
                                    <Input
                                      id={`experience-${index}`}
                                      type="number"
                                      value={fileStatus.extractedData.experience_years || ''}
                                      onChange={(e) => updateExtractedData(index, 'experience_years', parseInt(e.target.value) || 0)}
                                      className="h-7 text-xs mt-1"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-1 text-xs">
                                  <p className={fileStatus.isDuplicate ? 'text-yellow-700' : 'text-green-700'}>
                                    <span className="font-medium">Name:</span> {fileStatus.extractedData.full_name}
                                  </p>
                                  <p className={fileStatus.isDuplicate ? 'text-yellow-700' : 'text-green-700'}>
                                    <span className="font-medium">Email:</span> {fileStatus.extractedData.email}
                                  </p>
                                  {fileStatus.extractedData.phone && (
                                    <p className={fileStatus.isDuplicate ? 'text-yellow-700' : 'text-green-700'}>
                                      <span className="font-medium">Phone:</span> {fileStatus.extractedData.phone}
                                    </p>
                                  )}
                                  {fileStatus.extractedData.skills && (
                                    <p className={fileStatus.isDuplicate ? 'text-yellow-700' : 'text-green-700'}>
                                      <span className="font-medium">Skills:</span> {fileStatus.extractedData.skills}
                                    </p>
                                  )}
                                  {fileStatus.extractedData.experience_years && (
                                    <p className={fileStatus.isDuplicate ? 'text-yellow-700' : 'text-green-700'}>
                                      <span className="font-medium">Experience:</span> {fileStatus.extractedData.experience_years} years
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                          {fileStatus.error && (
                            <p className="text-xs text-destructive mt-1">
                              {fileStatus.error}
                            </p>
                          )}
                          {fileStatus.status === 'processing' && (
                            <div className="w-full bg-secondary rounded-full h-1.5 mt-2">
                              <div 
                                className="bg-primary h-full transition-all duration-300"
                                style={{ width: `${fileStatus.progress}%` }}
                              />
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          disabled={fileStatus.status === 'processing'}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                        {fileStatus.status === 'error' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => processFile(fileStatus.file, index)}
                            className="ml-2"
                          >
                            Retry
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Actions - Fixed Footer */}
        <div className="flex justify-between items-center gap-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setFiles([]);
            }}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitAll}
            disabled={isProcessing || extractedCount === 0}
            className={duplicateCount > 0 
              ? "bg-yellow-600 text-white hover:bg-yellow-700" 
              : "bg-primary text-primary-foreground hover:bg-primary/90"
            }
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                {duplicateCount > 0 
                  ? `Upload Anyway (${extractedCount}, ${duplicateCount} duplicates)`
                  : `Upload to Database (${extractedCount})`
                }
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadResumeModal;
