import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, FileText } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const candidates = [
  {
    id: 1,
    name: "Dimple Budhwani",
    department: "English Dept.",
    experience: "3 years",
    status: "Moved to Upper Management Approval",
    statusColor: "bg-green-50 text-green-700 border-green-200",
  },
  {
    id: 2,
    name: "Jayakumar R",
    department: "Science Dept.",
    experience: "2 years",
    status: "Added to Talent Pool",
    statusColor: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    id: 3,
    name: "Priya Sharma",
    department: "Science Dept.",
    experience: "4 years",
    status: "Screening Test",
    statusColor: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    id: 4,
    name: "Rahul Mehta",
    department: "Science Dept.",
    experience: "5 years",
    status: "Final Approval",
    statusColor: "bg-purple-50 text-purple-700 border-purple-200",
  },
];

const CandidateList = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCandidates = candidates.filter(
    (candidate) =>
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-card rounded-[16px] p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Candidate List
        </h3>
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Name or Email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Candidate Name</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Experience</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCandidates.map((candidate) => (
            <TableRow key={candidate.id} className="hover:bg-muted/50">
              <TableCell className="font-medium">{candidate.name}</TableCell>
              <TableCell>{candidate.department}</TableCell>
              <TableCell>{candidate.experience}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={candidate.statusColor}
                >
                  {candidate.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm" className="gap-2">
                  <FileText className="h-4 w-4" />
                  View Resume
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CandidateList;
