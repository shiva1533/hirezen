import { useState, useEffect } from "react";
import TopNavBar from "@/components/layout/TopNavBar";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Upload, X, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const Communication = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    title: "",
    type: "",
    description: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch suggestions from Supabase
  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ["suggestions", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("suggestions")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Submit suggestion mutation
  const submitSuggestion = useMutation({
    mutationFn: async (data: {
      name: string;
      department: string;
      title: string;
      type: string;
      description: string;
      attachment_url?: string;
    }) => {
      const { data: result, error } = await supabase
        .from("suggestions")
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suggestions"] });
      toast({
        title: "Success!",
        description: "Thank you! Your suggestion has been submitted for review.",
        className: "bg-green-50 border-green-200",
      });
      
      // Reset form
      setFormData({
        name: "",
        department: "",
        title: "",
        type: "",
        description: "",
      });
      setSelectedFile(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit suggestion. Please try again.",
        variant: "destructive",
      });
      console.error("Error submitting suggestion:", error);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let attachment_url = undefined;

      // Upload file if selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("resumes")
          .upload(filePath, selectedFile);

        if (uploadError) {
          throw uploadError;
        }

        const { data: urlData } = supabase.storage
          .from("resumes")
          .getPublicUrl(filePath);

        attachment_url = urlData.publicUrl;
      }

      // Submit the suggestion
      await submitSuggestion.mutateAsync({
        ...formData,
        attachment_url,
      });
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast({
        title: "Error",
        description: "Failed to submit suggestion. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      department: "",
      title: "",
      type: "",
      description: "",
    });
    setSelectedFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "reviewed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "implemented":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F9FAFB]">
      <TopNavBar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="ml-0 lg:ml-56 flex-1 p-4 lg:p-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Lightbulb className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Suggestions</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Share your feedback and ideas to improve our HRMS experience.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Side - Suggestion Form */}
            <Card className="shadow-md border-border/50" style={{ borderRadius: "16px" }}>
              <CardHeader>
                <CardTitle>Submit a Suggestion</CardTitle>
                <CardDescription>
                  Help us improve by sharing your ideas and feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department / Role</Label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) => setFormData({ ...formData, department: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="teaching">Teaching Staff</SelectItem>
                        <SelectItem value="admin">Admin / HR</SelectItem>
                        <SelectItem value="management">Management</SelectItem>
                        <SelectItem value="student-support">Student Support</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Suggestion Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Brief title for your suggestion"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Suggestion Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select suggestion type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ui">UI / Design</SelectItem>
                        <SelectItem value="functionality">Functionality</SelectItem>
                        <SelectItem value="performance">Performance</SelectItem>
                        <SelectItem value="feature">New Feature</SelectItem>
                        <SelectItem value="bug">Bug / Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Suggestion Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe your suggestion or improvement idea in detail..."
                      rows={6}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="attachment">Attachment (Optional)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="attachment"
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("attachment")?.click()}
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {selectedFile ? selectedFile.name : "Upload File"}
                      </Button>
                      {selectedFile && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedFile(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Accepts: Images, PDFs, Word documents
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button 
                      type="submit" 
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Suggestion"
                      )}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleReset} disabled={isSubmitting}>
                      Reset
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Right Side - Submitted Suggestions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Recent Suggestions</h2>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="implemented">Implemented</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : suggestions.length === 0 ? (
                <Card className="shadow-sm border-border/50" style={{ borderRadius: "16px" }}>
                  <CardContent className="py-12 text-center">
                    <Lightbulb className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No suggestions found</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Be the first to share your ideas!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {suggestions.map((suggestion) => (
                    <Card key={suggestion.id} className="shadow-sm border-border/50" style={{ borderRadius: "16px" }}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                          <Badge className={getStatusColor(suggestion.status)} variant="outline">
                            {suggestion.status.charAt(0).toUpperCase() + suggestion.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                          <span>{suggestion.name}</span>
                          <span>•</span>
                          <span>{suggestion.department}</span>
                        </div>
                        <Badge variant="secondary" className="w-fit text-xs">
                          {suggestion.type}
                        </Badge>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {suggestion.description.length > 150
                            ? `${suggestion.description.substring(0, 150)}...`
                            : suggestion.description}
                        </p>
                        {suggestion.attachment_url && (
                          <Button
                            variant="link"
                            className="px-0 mt-2 h-auto text-primary"
                            onClick={() => window.open(suggestion.attachment_url, "_blank")}
                          >
                            View Attachment
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Communication;
