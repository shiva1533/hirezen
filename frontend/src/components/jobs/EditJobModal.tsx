import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EditJobModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  onJobUpdated: () => void;
}

const EditJobModal = ({ open, onOpenChange, jobId, onJobUpdated }: EditJobModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    position: "",
    department: "",
    experience: "",
    vacancies: 1,
    primary_locations: "[]",
    status: "active"
  });

  useEffect(() => {
    if (open && jobId) {
      loadJobData();
    }
  }, [open, jobId]);

  const loadJobData = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error) throw error;
      
      setFormData({
        position: data.position || "",
        department: data.department || "",
        experience: data.experience || "",
        vacancies: data.vacancies || 1,
        primary_locations: data.primary_locations || "[]",
        status: data.status || "active"
      });
    } catch (error) {
      console.error('Error loading job:', error);
      toast.error("Failed to load job details");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('jobs')
        .update(formData)
        .eq('id', jobId);

      if (error) throw error;

      toast.success("Job updated successfully!");
      onJobUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating job:', error);
      toast.error("Failed to update job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Job</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="position">Job Position *</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="experience">Experience</Label>
            <Input
              id="experience"
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              placeholder="e.g., 3-5 years"
            />
          </div>

          <div>
            <Label htmlFor="vacancies">Number of Vacancies</Label>
            <Input
              id="vacancies"
              type="number"
              min="1"
              value={formData.vacancies}
              onChange={(e) => setFormData({ ...formData, vacancies: parseInt(e.target.value) || 1 })}
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Job"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditJobModal;
