import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Upload, Clock, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface UploadContentCardProps {
  selectedJobCaption?: string;
}

const UploadContentCard = ({ selectedJobCaption }: UploadContentCardProps) => {
  const [caption, setCaption] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedJobCaption) {
      setCaption(selectedJobCaption);
    }
  }, [selectedJobCaption]);

  const platforms = [
    { id: "facebook", label: "Facebook" },
    { id: "instagram", label: "Instagram" },
    { id: "linkedin", label: "LinkedIn" },
    { id: "twitter", label: "Twitter (X)" },
  ];

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((id) => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePostNow = () => {
    if (!caption.trim()) {
      toast({
        title: "Caption required",
        description: "Please enter a caption for your post",
        variant: "destructive",
      });
      return;
    }
    if (selectedPlatforms.length === 0) {
      toast({
        title: "Select platforms",
        description: "Please select at least one platform",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Post published!",
      description: `Your content has been posted to ${selectedPlatforms.length} platform(s)`,
    });
  };

  const handleSchedulePost = () => {
    if (!caption.trim() || selectedPlatforms.length === 0) {
      toast({
        title: "Missing information",
        description: "Please add caption and select platforms",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Post scheduled!",
      description: "Your post has been scheduled successfully",
    });
  };

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Create & Upload Content</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="caption">Content Caption / Description</Label>
          <Textarea
            id="caption"
            placeholder="Write your post caption here..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="min-h-[120px] resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label>Upload Image/Video</Label>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2" asChild>
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-4 w-4" />
                Choose File
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </Button>
            {imagePreview && <span className="text-sm text-muted-foreground">File uploaded</span>}
          </div>
          {imagePreview && (
            <div className="mt-3">
              <img
                src={imagePreview}
                alt="Preview"
                className="h-40 w-full rounded-lg object-cover"
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Select Platforms</Label>
          <div className="grid grid-cols-2 gap-3">
            {platforms.map((platform) => (
              <div key={platform.id} className="flex items-center space-x-2">
                <Checkbox
                  id={platform.id}
                  checked={selectedPlatforms.includes(platform.id)}
                  onCheckedChange={() => handlePlatformToggle(platform.id)}
                />
                <Label
                  htmlFor={platform.id}
                  className="cursor-pointer text-sm font-normal"
                >
                  {platform.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Date & Time Scheduler</Label>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Calendar className="h-4 w-4" />
              Select Date
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Clock className="h-4 w-4" />
              Select Time
            </Button>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button onClick={handlePostNow} className="gap-2">
            <Send className="h-4 w-4" />
            Post Now
          </Button>
          <Button onClick={handleSchedulePost} variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            Schedule Post
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UploadContentCard;
