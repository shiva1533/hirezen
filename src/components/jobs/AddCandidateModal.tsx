import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface AddCandidateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const AddCandidateModal = ({ open, onOpenChange, onSuccess }: AddCandidateModalProps) => {
  const { id: jobId } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    experience_years: "",
    resume_text: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!jobId) {
      toast({
        title: "Error",
        description: "Job ID is missing",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("candidates").insert({
        job_id: jobId,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone || null,
        experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
        resume_text: formData.resume_text || null,
        status: "applied",
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Candidate added successfully",
      });

      setFormData({
        full_name: "",
        email: "",
        phone: "",
        experience_years: "",
        resume_text: "",
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error adding candidate:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add candidate",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Candidate</DialogTitle>
          <DialogDescription>
            Add a new candidate to this job position. AI matching will analyze their qualifications.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience_years">Years of Experience</Label>
            <Input
              id="experience_years"
              type="number"
              min="0"
              value={formData.experience_years}
              onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resume_text">Resume / Qualifications Summary</Label>
            <Textarea
              id="resume_text"
              value={formData.resume_text}
              onChange={(e) => setFormData({ ...formData, resume_text: e.target.value })}
              placeholder="Enter candidate's key qualifications, experience, and skills..."
              rows={6}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Candidate"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCandidateModal;
