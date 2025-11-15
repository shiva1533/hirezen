import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload, FileText } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Question {
  question: string;
  category: string;
  expectedAnswer: string;
  type?: 'mcq' | 'written';
  options?: string[];
}

interface UploadQuestionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuestionsExtracted: (questions: Question[]) => void;
}

export function UploadQuestionsModal({
  open,
  onOpenChange,
  onQuestionsExtracted,
}: UploadQuestionsModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const fileType = selectedFile.name.toLowerCase();
      
      if (fileType.endsWith('.zip') || fileType.endsWith('.pdf') || fileType.endsWith('.txt') || fileType.endsWith('.md')) {
        setFile(selectedFile);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF, ZIP, or text file containing interview questions.",
          variant: "destructive",
        });
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create FormData with the file
      const formData = new FormData();
      formData.append('file', file);

      // Call edge function to parse questions from ZIP
      const { data, error } = await supabase.functions.invoke('parse-interview-questions', {
        body: formData,
      });

      if (error) throw error;

      if (data.questions && data.questions.length > 0) {
        onQuestionsExtracted(data.questions);
        toast({
          title: "Questions Extracted",
          description: `Successfully extracted ${data.questions.length} questions from the document.`,
        });
        onOpenChange(false);
        setFile(null);
      } else {
        toast({
          title: "No Questions Found",
          description: "Could not extract questions from the ZIP file. Please check the format.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error processing document:', error);
      toast({
        title: "Error Processing Document",
        description: error.message || "Failed to extract questions from the document.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Interview Questions</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              Upload a PDF, ZIP file (containing text/markdown files), or a single text file with interview questions. The system will automatically extract and parse them.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <label className="text-sm font-medium">Questions File</label>
            <Input
              type="file"
              accept=".pdf,.zip,.txt,.md"
              onChange={handleFileChange}
              disabled={isProcessing}
            />
            {file && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {file.name}
              </p>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload & Parse
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
