import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Loader2, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const TimelineCard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: candidates = [], isLoading } = useQuery({
    queryKey: ["recent-candidates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("candidates")
        .select(`
          id,
          full_name,
          email,
          created_at,
          ai_match_score,
          job_id,
          jobs (
            position
          )
        `)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  const filteredCandidates = candidates.filter((candidate) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      candidate.full_name?.toLowerCase().includes(search) ||
      candidate.email?.toLowerCase().includes(search) ||
      candidate.jobs?.position?.toLowerCase().includes(search)
    );
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return "bg-gray-500/10 text-gray-700";
    if (score >= 80) return "bg-green-500/10 text-green-700";
    if (score >= 60) return "bg-blue-500/10 text-blue-700";
    if (score >= 40) return "bg-amber-500/10 text-amber-700";
    return "bg-red-500/10 text-red-700";
  };

  // Set up realtime subscription for new candidates
  useEffect(() => {
    const channel = supabase
      .channel('candidates-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'candidates'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["recent-candidates"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return (
    <Card className="transition-shadow hover:shadow-md bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">New Candidate Profiles</CardTitle>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search candidates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery ? "No candidates found matching your search" : "No candidate profiles yet"}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredCandidates.map((candidate) => (
              <div
                key={candidate.id}
                className="flex items-center gap-4 p-4 rounded-lg transition-all duration-200 hover:bg-muted/50 group cursor-pointer border border-transparent hover:border-border"
                onClick={() => navigate(`/pipeline/${candidate.id}`)}
              >
                {/* Avatar */}
                <Avatar className="h-11 w-11 border-2 border-background shadow-sm">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                    {getInitials(candidate.full_name)}
                  </AvatarFallback>
                </Avatar>

                {/* Candidate Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold text-foreground truncate">
                      {candidate.full_name}
                    </h4>
                    {candidate.ai_match_score && (
                      <Badge variant="outline" className={`${getScoreColor(candidate.ai_match_score)} flex items-center gap-1`}>
                        <Star className="h-3 w-3 fill-current" />
                        {candidate.ai_match_score}%
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {candidate.jobs?.position || "No position assigned"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {candidate.email}
                  </p>
                </div>

                {/* Upload Date */}
                <div className="flex-shrink-0 text-right">
                  <p className="text-xs font-medium text-foreground">
                    {formatDistanceToNow(new Date(candidate.created_at), { addSuffix: true })}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(candidate.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TimelineCard;
