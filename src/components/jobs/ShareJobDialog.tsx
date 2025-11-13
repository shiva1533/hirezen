import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ShareJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  jobTitle: string;
}

const ShareJobDialog = ({ open, onOpenChange, jobId, jobTitle }: ShareJobDialogProps) => {
  const [copied, setCopied] = useState(false);
  
  const jobUrl = `${window.location.origin}/apply/${jobId}`;
  const careersUrl = `${window.location.origin}/careers`;

  const handleCopy = async (url: string, label: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success(`${label} copied to clipboard!`);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Job Position
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Job Title</Label>
            <p className="text-sm text-muted-foreground">{jobTitle}</p>
          </div>

          <div>
            <Label htmlFor="jobUrl" className="text-sm font-medium mb-2 block">
              Direct Application Link
            </Label>
            <div className="flex gap-2">
              <Input
                id="jobUrl"
                value={jobUrl}
                readOnly
                className="font-mono text-xs"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopy(jobUrl, "Application link")}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Share this link with candidates to apply directly
            </p>
          </div>

          <div>
            <Label htmlFor="careersUrl" className="text-sm font-medium mb-2 block">
              Careers Page
            </Label>
            <div className="flex gap-2">
              <Input
                id="careersUrl"
                value={careersUrl}
                readOnly
                className="font-mono text-xs"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopy(careersUrl, "Careers page link")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Candidates can browse all open positions
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareJobDialog;
