import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import TopNavBar from "@/components/layout/TopNavBar";
import Sidebar from "@/components/layout/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, FileText, Edit, Search, X, Eye, Copy, Upload } from "lucide-react";
import CreateJobModal from "@/components/jobs/CreateJobModal";
import CreateTemplateFromPDFModal from "@/components/jobs/CreateTemplateFromPDFModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface JobTemplate {
  id: string;
  template_name: string;
  position: string;
  department: string | null;
  sector: string | null;
  experience: string | null;
  role_experience: string | null;
  expected_qualification: string | null;
  job_type: string | null;
  mode_of_work: string | null;
  priority_level: string | null;
  language: string | null;
  salary_min: string | null;
  salary_max: string | null;
  currency: string | null;
  billing_rate: string | null;
  segments: string | null;
  job_description: string | null;
  pipeline_template: string | null;
  placement_template: string | null;
  document_template: string | null;
  created_at: string;
}

const JobTemplates = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<JobTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>();
  const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null);
  const [editTemplateId, setEditTemplateId] = useState<string | undefined>();
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [sectorFilter, setSectorFilter] = useState<string>("all");
  const [previewTemplate, setPreviewTemplate] = useState<JobTemplate | null>(null);
  const [availableDepartments, setAvailableDepartments] = useState<string[]>([]);
  const [availableSectors, setAvailableSectors] = useState<string[]>([]);
  const [showPDFModal, setShowPDFModal] = useState(false);

  useEffect(() => {
    loadTemplates();
    loadFiltersFromJobs();
  }, []);

  const loadFiltersFromJobs = async () => {
    try {
      // Load unique departments from both jobs and templates
      const [jobsDeptData, templatesDeptData] = await Promise.all([
        supabase
          .from('jobs')
          .select('department')
          .not('department', 'is', null),
        supabase
          .from('job_templates')
          .select('department')
          .not('department', 'is', null)
      ]);
      
      // Load unique sectors from both jobs and templates
      const [jobsSectorData, templatesSectorData] = await Promise.all([
        supabase
          .from('jobs')
          .select('sector')
          .not('sector', 'is', null),
        supabase
          .from('job_templates')
          .select('sector')
          .not('sector', 'is', null)
      ]);

      // Combine and deduplicate departments
      const allDepts = [
        ...(jobsDeptData.data || []).map(j => j.department),
        ...(templatesDeptData.data || []).map(t => t.department)
      ].filter(Boolean);
      const uniqueDepts = Array.from(new Set(allDepts)).sort();
      setAvailableDepartments(uniqueDepts);

      // Combine and deduplicate sectors
      const allSectors = [
        ...(jobsSectorData.data || []).map(j => j.sector),
        ...(templatesSectorData.data || []).map(t => t.sector)
      ].filter(Boolean);
      const uniqueSectors = Array.from(new Set(allSectors)).sort();
      setAvailableSectors(uniqueSectors);
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('job_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: "Load Failed",
        description: "Failed to load job templates. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!deleteTemplateId) return;

    try {
      const { error } = await supabase
        .from('job_templates')
        .delete()
        .eq('id', deleteTemplateId);

      if (error) throw error;

      toast({
        title: "Template Deleted",
        description: "Job template has been deleted successfully.",
      });
      
      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete job template. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteTemplateId(null);
    }
  };

  const handleUseTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setShowCreateModal(true);
  };

  const handleEditTemplate = (templateId: string) => {
    setEditTemplateId(templateId);
    setShowEditModal(true);
  };

  const handleDuplicateTemplate = async (template: JobTemplate) => {
    try {
      const { id, created_at, ...templateData } = template;
      const duplicatedTemplate = {
        ...templateData,
        template_name: `${template.template_name} (Copy)`,
      };

      const { error } = await supabase
        .from('job_templates')
        .insert(duplicatedTemplate);

      if (error) throw error;

      toast({
        title: "Template Duplicated",
        description: "Template has been duplicated successfully.",
      });

      loadTemplates();
    } catch (error) {
      console.error('Error duplicating template:', error);
      toast({
        title: "Duplication Failed",
        description: "Failed to duplicate template. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Filter templates based on search and filters
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const matchesSearch = 
        template.template_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.position.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDepartment = 
        departmentFilter === "all" || template.department === departmentFilter;
      
      const matchesSector = 
        sectorFilter === "all" || template.sector === sectorFilter;

      return matchesSearch && matchesDepartment && matchesSector;
    });
  }, [templates, searchQuery, departmentFilter, sectorFilter]);

  const clearFilters = () => {
    setSearchQuery("");
    setDepartmentFilter("all");
    setSectorFilter("all");
  };

  const activeFiltersCount = 
    (searchQuery ? 1 : 0) + 
    (departmentFilter !== "all" ? 1 : 0) + 
    (sectorFilter !== "all" ? 1 : 0);

  return (
    <div className="min-h-screen bg-background">
      <TopNavBar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 lg:ml-56 mt-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Job Templates</h1>
                <p className="text-muted-foreground mt-1">
                  Create reusable job templates for faster posting
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowPDFModal(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Create from PDF
                </Button>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="mb-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search templates by name or position..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Department Filter */}
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-full sm:w-[200px] bg-background">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="all">All Departments</SelectItem>
                    {availableDepartments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Sector Filter */}
                <Select value={sectorFilter} onValueChange={setSectorFilter}>
                  <SelectTrigger className="w-full sm:w-[200px] bg-background">
                    <SelectValue placeholder="All Sectors" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="all">All Sectors</SelectItem>
                    {availableSectors.map((sector) => (
                      <SelectItem key={sector} value={sector}>
                        {sector}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Active Filters */}
              {activeFiltersCount > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-muted-foreground">Active filters:</span>
                  {searchQuery && (
                    <Badge variant="secondary" className="gap-1">
                      Search: {searchQuery}
                      <button onClick={() => setSearchQuery("")} className="hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {departmentFilter !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                      Department: {departmentFilter}
                      <button onClick={() => setDepartmentFilter("all")} className="hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {sectorFilter !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                      Sector: {sectorFilter}
                      <button onClick={() => setSectorFilter("all")} className="hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-6 text-xs"
                  >
                    Clear all
                  </Button>
                </div>
              )}

              {/* Results Count */}
              <p className="text-sm text-muted-foreground">
                Showing {filteredTemplates.length} of {templates.length} templates
              </p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <Card className="p-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                {templates.length === 0 ? (
                  <>
                    <h3 className="text-lg font-semibold mb-2">No Templates Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first job template to streamline your hiring process
                    </p>
                    <Button onClick={() => setShowCreateModal(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Template
                    </Button>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold mb-2">No Templates Found</h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your search or filters
                    </p>
                    <Button onClick={clearFilters} variant="outline">
                      Clear Filters
                    </Button>
                  </>
                )}
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredTemplates.map((template) => (
                  <Card key={template.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-lg">{template.template_name}</h3>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setPreviewTemplate(template)}
                          title="Preview template"
                        >
                          <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDuplicateTemplate(template)}
                          title="Duplicate template"
                        >
                          <Copy className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditTemplate(template.id)}
                          title="Edit template"
                        >
                          <Edit className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTemplateId(template.id)}
                          title="Delete template"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      {template.position}
                    </p>
                    <div className="space-y-1 mb-4">
                      {template.department && (
                        <p className="text-sm text-muted-foreground">
                          Department: {template.department}
                        </p>
                      )}
                      {template.sector && (
                        <p className="text-sm text-muted-foreground">
                          Sector: {template.sector}
                        </p>
                      )}
                      {template.experience && (
                        <p className="text-sm text-muted-foreground">
                          Experience: {template.experience}
                        </p>
                      )}
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={() => handleUseTemplate(template.id)}
                    >
                      Use Template
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <CreateJobModal
        open={showCreateModal}
        onOpenChange={(open) => {
          setShowCreateModal(open);
          if (!open) setSelectedTemplateId(undefined);
        }}
        templateId={selectedTemplateId}
        onJobSaved={() => {
          setShowCreateModal(false);
          setSelectedTemplateId(undefined);
        }}
      />

      <CreateJobModal
        open={showEditModal}
        onOpenChange={(open) => {
          setShowEditModal(open);
          if (!open) setEditTemplateId(undefined);
        }}
        editTemplateId={editTemplateId}
        onJobSaved={() => {
          setShowEditModal(false);
          setEditTemplateId(undefined);
          loadTemplates();
        }}
      />

      <AlertDialog open={!!deleteTemplateId} onOpenChange={() => setDeleteTemplateId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the job template.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTemplate}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview Modal */}
      {previewTemplate && (
        <AlertDialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
          <AlertDialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl">{previewTemplate.template_name}</AlertDialogTitle>
              <AlertDialogDescription className="text-base">
                Complete template details
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold text-foreground">Position</p>
                  <p className="text-muted-foreground">{previewTemplate.position}</p>
                </div>
                {previewTemplate.department && (
                  <div>
                    <p className="font-semibold text-foreground">Department</p>
                    <p className="text-muted-foreground">{previewTemplate.department}</p>
                  </div>
                )}
                {previewTemplate.sector && (
                  <div>
                    <p className="font-semibold text-foreground">Sector</p>
                    <p className="text-muted-foreground">{previewTemplate.sector}</p>
                  </div>
                )}
                {previewTemplate.experience && (
                  <div>
                    <p className="font-semibold text-foreground">Experience Required</p>
                    <p className="text-muted-foreground">{previewTemplate.experience}</p>
                  </div>
                )}
                {previewTemplate.role_experience && (
                  <div>
                    <p className="font-semibold text-foreground">Role Experience</p>
                    <p className="text-muted-foreground">{previewTemplate.role_experience}</p>
                  </div>
                )}
                {previewTemplate.expected_qualification && (
                  <div>
                    <p className="font-semibold text-foreground">Expected Qualification</p>
                    <p className="text-muted-foreground">{previewTemplate.expected_qualification}</p>
                  </div>
                )}
                {previewTemplate.job_type && (
                  <div>
                    <p className="font-semibold text-foreground">Job Type</p>
                    <p className="text-muted-foreground">{previewTemplate.job_type}</p>
                  </div>
                )}
                {previewTemplate.mode_of_work && (
                  <div>
                    <p className="font-semibold text-foreground">Mode of Work</p>
                    <p className="text-muted-foreground">{previewTemplate.mode_of_work}</p>
                  </div>
                )}
                {previewTemplate.priority_level && (
                  <div>
                    <p className="font-semibold text-foreground">Priority Level</p>
                    <p className="text-muted-foreground">{previewTemplate.priority_level}</p>
                  </div>
                )}
                {previewTemplate.language && (
                  <div>
                    <p className="font-semibold text-foreground">Language</p>
                    <p className="text-muted-foreground">{previewTemplate.language}</p>
                  </div>
                )}
                {(previewTemplate.salary_min || previewTemplate.salary_max) && (
                  <div>
                    <p className="font-semibold text-foreground">Salary Range</p>
                    <p className="text-muted-foreground">
                      {previewTemplate.currency} {previewTemplate.salary_min} - {previewTemplate.salary_max}
                    </p>
                  </div>
                )}
                {previewTemplate.billing_rate && (
                  <div>
                    <p className="font-semibold text-foreground">Billing Rate</p>
                    <p className="text-muted-foreground">{previewTemplate.billing_rate}</p>
                  </div>
                )}
                {previewTemplate.segments && (
                  <div>
                    <p className="font-semibold text-foreground">Segments</p>
                    <p className="text-muted-foreground">{previewTemplate.segments}</p>
                  </div>
                )}
              </div>

              {previewTemplate.job_description && (
                <div>
                  <p className="font-semibold text-foreground mb-2">Job Description</p>
                  <div className="text-muted-foreground whitespace-pre-wrap bg-muted p-4 rounded-md">
                    {previewTemplate.job_description}
                  </div>
                </div>
              )}

              {previewTemplate.pipeline_template && (
                <div>
                  <p className="font-semibold text-foreground">Pipeline Template</p>
                  <p className="text-muted-foreground">{previewTemplate.pipeline_template}</p>
                </div>
              )}

              {previewTemplate.placement_template && (
                <div>
                  <p className="font-semibold text-foreground">Placement Template</p>
                  <p className="text-muted-foreground">{previewTemplate.placement_template}</p>
                </div>
              )}

              {previewTemplate.document_template && (
                <div>
                  <p className="font-semibold text-foreground">Document Template</p>
                  <p className="text-muted-foreground">{previewTemplate.document_template}</p>
                </div>
              )}
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel>Close</AlertDialogCancel>
              <Button onClick={() => {
                setPreviewTemplate(null);
                handleUseTemplate(previewTemplate.id);
              }}>
                Use Template
              </Button>
              <Button variant="outline" onClick={() => {
                setPreviewTemplate(null);
                handleEditTemplate(previewTemplate.id);
              }}>
                Edit Template
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <CreateTemplateFromPDFModal
        open={showPDFModal}
        onOpenChange={setShowPDFModal}
        onTemplateCreated={() => {
          loadTemplates();
          loadFiltersFromJobs();
        }}
      />
    </div>
  );
};

export default JobTemplates;
