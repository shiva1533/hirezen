import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import TopNavBar from "@/components/layout/TopNavBar";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Loader2, Calendar as CalendarIcon, Video, TrendingUp, Filter, Eye, Download, FileText, FileSpreadsheet, Archive, Trash2, CheckSquare } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function AIInterviewReview() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [scoreFilter, setScoreFilter] = useState<string>("all");
  const [positionFilter, setPositionFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [isExporting, setIsExporting] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [selectedInterviews, setSelectedInterviews] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);

  const { data: interviews, isLoading } = useQuery({
    queryKey: ["ai-interviews", scoreFilter, positionFilter, statusFilter, dateFrom, dateTo, searchQuery, showArchived],
    queryFn: async () => {
      let query = supabase
        .from("ai_interviews")
        .select(`
          *,
          candidates (
            id,
            full_name,
            email,
            jobs (
              position,
              department
            )
          )
        `)
        .eq("archived", showArchived)
        .order("created_at", { ascending: false });

      // Apply filters
      if (scoreFilter !== "all") {
        if (scoreFilter === "high") {
          query = query.gte("score", 80);
        } else if (scoreFilter === "medium") {
          query = query.gte("score", 60).lt("score", 80);
        } else if (scoreFilter === "low") {
          query = query.lt("score", 60);
        }
      }

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      if (dateFrom) {
        query = query.gte("created_at", dateFrom.toISOString());
      }

      if (dateTo) {
        query = query.lte("created_at", dateTo.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;

      // Filter by position and search query on client side
      let filtered = data || [];

      if (positionFilter !== "all") {
        filtered = filtered.filter((interview: any) => {
          const position = interview.candidates?.jobs?.position;
          return position?.toLowerCase().includes(positionFilter.toLowerCase());
        });
      }

      if (searchQuery) {
        filtered = filtered.filter((interview: any) => {
          const candidateName = interview.candidates?.full_name?.toLowerCase() || "";
          const candidateEmail = interview.candidates?.email?.toLowerCase() || "";
          const position = interview.candidates?.jobs?.position?.toLowerCase() || "";
          const search = searchQuery.toLowerCase();
          return candidateName.includes(search) || candidateEmail.includes(search) || position.includes(search);
        });
      }

      return filtered;
    },
  });

  // Get unique positions for filter
  const positions = Array.from(
    new Set(
      interviews
        ?.map((i: any) => i.candidates?.jobs?.position)
        .filter(Boolean)
    )
  );

  // Calculate statistics
  const stats = {
    total: interviews?.length || 0,
    completed: interviews?.filter((i: any) => i.status === "completed").length || 0,
    pending: interviews?.filter((i: any) => i.status === "pending").length || 0,
    inProgress: interviews?.filter((i: any) => i.status === "in_progress").length || 0,
    averageScore: interviews?.length
      ? Math.round(
          interviews
            .filter((i: any) => i.score)
            .reduce((sum: number, i: any) => sum + (i.score || 0), 0) / 
          interviews.filter((i: any) => i.score).length
        )
      : 0,
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  const getStatusBadgeVariant = (status: string) => {
    if (status === "completed") return "default";
    if (status === "in_progress") return "secondary";
    return "outline";
  };

  const exportToCSV = () => {
    if (!interviews || interviews.length === 0) return;

    setIsExporting(true);

    // Prepare CSV data
    const headers = [
      "Candidate Name",
      "Email",
      "Position",
      "Department",
      "Status",
      "Score (%)",
      "Date Created",
      "Date Completed",
      "Summary"
    ];

    const rows = interviews.map((interview: any) => {
      const candidate = interview.candidates;
      const job = candidate?.jobs;
      
      return [
        candidate?.full_name || "",
        candidate?.email || "",
        job?.position || "",
        job?.department || "",
        interview.status.replace("_", " "),
        interview.score || "",
        format(new Date(interview.created_at), "PPP"),
        interview.completed_at ? format(new Date(interview.completed_at), "PPP") : "",
        interview.evaluation?.summary || ""
      ];
    });

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map(row => 
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
    ].join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `ai-interview-results-${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsExporting(false);
  };

  const exportToPDF = () => {
    if (!interviews || interviews.length === 0) return;

    setIsExporting(true);

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text("AI Interview Results Report", 14, 20);
    
    // Add summary statistics
    doc.setFontSize(12);
    doc.text(`Generated: ${format(new Date(), "PPP")}`, 14, 30);
    doc.text(`Total Interviews: ${stats.total}`, 14, 38);
    doc.text(`Completed: ${stats.completed} | In Progress: ${stats.inProgress} | Pending: ${stats.pending}`, 14, 46);
    doc.text(`Average Score: ${stats.averageScore}%`, 14, 54);

    // Add filters info if any are active
    let yPos = 62;
    if (scoreFilter !== "all" || positionFilter !== "all" || statusFilter !== "all" || searchQuery || dateFrom || dateTo) {
      doc.setFontSize(10);
      doc.text("Active Filters:", 14, yPos);
      yPos += 6;
      if (scoreFilter !== "all") {
        doc.text(`• Score: ${scoreFilter}`, 16, yPos);
        yPos += 5;
      }
      if (statusFilter !== "all") {
        doc.text(`• Status: ${statusFilter}`, 16, yPos);
        yPos += 5;
      }
      if (positionFilter !== "all") {
        doc.text(`• Position: ${positionFilter}`, 16, yPos);
        yPos += 5;
      }
      if (searchQuery) {
        doc.text(`• Search: ${searchQuery}`, 16, yPos);
        yPos += 5;
      }
      if (dateFrom) {
        doc.text(`• From: ${format(dateFrom, "PPP")}`, 16, yPos);
        yPos += 5;
      }
      if (dateTo) {
        doc.text(`• To: ${format(dateTo, "PPP")}`, 16, yPos);
        yPos += 5;
      }
      yPos += 4;
    }

    // Prepare table data
    const tableData = interviews.map((interview: any) => {
      const candidate = interview.candidates;
      const job = candidate?.jobs;
      
      return [
        candidate?.full_name || "",
        job?.position || "",
        interview.status.replace("_", " "),
        interview.score ? `${interview.score}%` : "N/A",
        format(new Date(interview.created_at), "PP"),
        interview.completed_at ? format(new Date(interview.completed_at), "PP") : "N/A"
      ];
    });

    // Add table
    autoTable(doc, {
      startY: yPos,
      head: [["Candidate", "Position", "Status", "Score", "Created", "Completed"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [102, 126, 234] },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 35 },
        2: { cellWidth: 25 },
        3: { cellWidth: 20 },
        4: { cellWidth: 30 },
        5: { cellWidth: 30 }
      }
    });

    // Add detailed results on new pages if there's evaluation data
    const completedInterviews = interviews.filter((i: any) => i.status === "completed" && i.evaluation);
    
    if (completedInterviews.length > 0) {
      completedInterviews.forEach((interview: any, index: number) => {
        const candidate = interview.candidates;
        const job = candidate?.jobs;
        
        doc.addPage();
        doc.setFontSize(14);
        doc.text(`Interview Details: ${candidate?.full_name}`, 14, 20);
        
        doc.setFontSize(10);
        let detailY = 30;
        
        doc.text(`Position: ${job?.position || "N/A"}`, 14, detailY);
        detailY += 6;
        doc.text(`Score: ${interview.score}%`, 14, detailY);
        detailY += 6;
        doc.text(`Completed: ${format(new Date(interview.completed_at), "PPP")}`, 14, detailY);
        detailY += 10;

        // Summary
        if (interview.evaluation?.summary) {
          doc.setFontSize(11);
          doc.text("Summary:", 14, detailY);
          detailY += 6;
          doc.setFontSize(9);
          const summaryLines = doc.splitTextToSize(interview.evaluation.summary, 180);
          doc.text(summaryLines, 14, detailY);
          detailY += summaryLines.length * 5 + 8;
        }

        // Strengths
        if (interview.evaluation?.strengths?.length > 0) {
          doc.setFontSize(11);
          doc.text("Strengths:", 14, detailY);
          detailY += 6;
          doc.setFontSize(9);
          interview.evaluation.strengths.forEach((strength: string) => {
            const lines = doc.splitTextToSize(`• ${strength}`, 180);
            doc.text(lines, 14, detailY);
            detailY += lines.length * 5;
          });
          detailY += 4;
        }

        // Areas for Improvement
        if (interview.evaluation?.weaknesses?.length > 0) {
          doc.setFontSize(11);
          doc.text("Areas for Improvement:", 14, detailY);
          detailY += 6;
          doc.setFontSize(9);
          interview.evaluation.weaknesses.forEach((weakness: string) => {
            const lines = doc.splitTextToSize(`• ${weakness}`, 180);
            doc.text(lines, 14, detailY);
            detailY += lines.length * 5;
          });
        }
      });
    }

    // Save PDF
    doc.save(`ai-interview-results-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    setIsExporting(false);
  };

  // Bulk archive mutation
  const archiveMutation = useMutation({
    mutationFn: async (interviewIds: string[]) => {
      const { error } = await supabase
        .from("ai_interviews")
        .update({ archived: true })
        .in("id", interviewIds);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["ai-interviews"] });
      setSelectedInterviews([]);
      setShowArchiveDialog(false);
      toast({
        title: "Success",
        description: `${variables.length} interview(s) archived successfully.`,
      });
    },
    onError: (error) => {
      console.error("Error archiving interviews:", error);
      toast({
        title: "Error",
        description: "Failed to archive interviews. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Bulk delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (interviewIds: string[]) => {
      const { error } = await supabase
        .from("ai_interviews")
        .delete()
        .in("id", interviewIds);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["ai-interviews"] });
      setSelectedInterviews([]);
      setShowDeleteDialog(false);
      toast({
        title: "Success",
        description: `${variables.length} interview(s) deleted successfully.`,
      });
    },
    onError: (error) => {
      console.error("Error deleting interviews:", error);
      toast({
        title: "Error",
        description: "Failed to delete interviews. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSelectAll = () => {
    if (selectedInterviews.length === interviews?.length) {
      setSelectedInterviews([]);
    } else {
      setSelectedInterviews(interviews?.map((i: any) => i.id) || []);
    }
  };

  const handleSelectInterview = (interviewId: string) => {
    setSelectedInterviews((prev) =>
      prev.includes(interviewId)
        ? prev.filter((id) => id !== interviewId)
        : [...prev, interviewId]
    );
  };

  const handleBulkArchive = () => {
    if (selectedInterviews.length === 0) return;
    setShowArchiveDialog(true);
  };

  const handleBulkDelete = () => {
    if (selectedInterviews.length === 0) return;
    setShowDeleteDialog(true);
  };

  const confirmArchive = () => {
    archiveMutation.mutate(selectedInterviews);
  };

  const confirmDelete = () => {
    deleteMutation.mutate(selectedInterviews);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavBar />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">AI Interview Reviews</h1>
            <p className="text-muted-foreground">
              Review and analyze candidate AI interview performance
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Interviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  In Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center gap-2">
                  {stats.averageScore}%
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filters
                  </CardTitle>
                  <CardDescription>Filter interviews by various criteria</CardDescription>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
                    <Checkbox
                      id="show-archived"
                      checked={showArchived}
                      onCheckedChange={(checked) => {
                        setShowArchived(checked as boolean);
                        setSelectedInterviews([]);
                      }}
                    />
                    <label
                      htmlFor="show-archived"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Show Archived
                    </label>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportToCSV}
                    disabled={!interviews || interviews.length === 0 || isExporting}
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportToPDF}
                    disabled={!interviews || interviews.length === 0 || isExporting}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <Input
                    placeholder="Name, email, position..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Score Range</label>
                  <Select value={scoreFilter} onValueChange={setScoreFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Scores</SelectItem>
                      <SelectItem value="high">High (80%+)</SelectItem>
                      <SelectItem value="medium">Medium (60-79%)</SelectItem>
                      <SelectItem value="low">Low (&lt;60%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Position</label>
                  <Select value={positionFilter} onValueChange={setPositionFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Positions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Positions</SelectItem>
                      {positions.map((position: any) => (
                        <SelectItem key={position} value={position}>
                          {position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Date From</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateFrom && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFrom ? format(dateFrom, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateFrom}
                        onSelect={setDateFrom}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Date To</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateTo && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateTo ? format(dateTo, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateTo}
                        onSelect={setDateTo}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setScoreFilter("all");
                    setPositionFilter("all");
                    setStatusFilter("all");
                    setSearchQuery("");
                    setDateFrom(undefined);
                    setDateTo(undefined);
                  }}
                >
                  Clear All Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Interview Results */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle>Interview Results</CardTitle>
                  <CardDescription>
                    {interviews?.length || 0} interview(s) found
                  </CardDescription>
                </div>
                {interviews && interviews.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="select-all"
                      checked={selectedInterviews.length === interviews.length}
                      onCheckedChange={handleSelectAll}
                    />
                    <label
                      htmlFor="select-all"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Select All
                    </label>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {selectedInterviews.length > 0 && (
                <div className="mb-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <CheckSquare className="h-4 w-4" />
                      {selectedInterviews.length} selected
                    </div>
                    <div className="flex gap-2">
                      {!showArchived && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleBulkArchive}
                          disabled={archiveMutation.isPending}
                        >
                          {archiveMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Archiving...
                            </>
                          ) : (
                            <>
                              <Archive className="h-4 w-4 mr-2" />
                              Archive Selected
                            </>
                          )}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleBulkDelete}
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Selected
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : interviews && interviews.length > 0 ? (
                <div className="space-y-4">
                  {interviews.map((interview: any) => {
                    const candidate = interview.candidates;
                    const job = candidate?.jobs;
                    const isSelected = selectedInterviews.includes(interview.id);

                    return (
                      <Card key={interview.id} className="hover:bg-accent/50 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleSelectInterview(interview.id)}
                              className="mt-1"
                            />
                            <div className="flex-1 space-y-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-semibold text-lg">
                                    {candidate?.full_name}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    {candidate?.email}
                                  </p>
                                  {job && (
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge variant="outline">{job.position}</Badge>
                                      {job.department && (
                                        <Badge variant="outline">{job.department}</Badge>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  <Badge variant={getStatusBadgeVariant(interview.status)}>
                                    {interview.status.replace("_", " ")}
                                  </Badge>
                                  {interview.score && (
                                    <Badge variant={getScoreBadgeVariant(interview.score)}>
                                      {interview.score}% Score
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              {interview.score && (
                                <div className="space-y-1">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Performance</span>
                                    <span className="font-medium">{interview.score}%</span>
                                  </div>
                                  <Progress value={interview.score} />
                                </div>
                              )}

                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <CalendarIcon className="h-4 w-4" />
                                  {format(new Date(interview.created_at), "PPP")}
                                </div>
                                {interview.completed_at && (
                                  <div className="flex items-center gap-1">
                                    <Video className="h-4 w-4" />
                                    Completed {format(new Date(interview.completed_at), "PPP")}
                                  </div>
                                )}
                              </div>

                              {interview.status === "completed" && interview.evaluation && (
                                <div className="pt-3 border-t">
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {interview.evaluation.summary}
                                  </p>
                                </div>
                              )}

                              <div className="flex gap-2 pt-2">
                                {interview.status === "completed" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate(`/ai-interview-results/${interview.interview_token}`)}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Full Results
                                  </Button>
                                )}
                                {interview.video_url && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(interview.video_url, "_blank")}
                                  >
                                    <Video className="h-4 w-4 mr-2" />
                                    Watch Recording
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No interviews found matching your filters
                </div>
              )}
            </CardContent>
          </Card>

          {/* Archive Confirmation Dialog */}
          <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Archive Interviews?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to archive {selectedInterviews.length} interview(s)? 
                  Archived interviews can be restored later by toggling "Show Archived".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmArchive}>
                  Archive
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Interviews?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to permanently delete {selectedInterviews.length} interview(s)? 
                  This action cannot be undone and all associated data including video recordings will be lost.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={confirmDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete Permanently
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </main>
      </div>
    </div>
  );
}
