import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, RefreshCw } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Post {
  id: number;
  preview: string;
  caption: string;
  platforms: string[];
  status: "Published" | "Scheduled" | "Failed";
  datetime: string;
}

const RecentPostsCard = () => {
  const posts: Post[] = [
    {
      id: 1,
      preview: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=100&fit=crop",
      caption: "Exciting new job opportunities available...",
      platforms: ["Facebook", "LinkedIn"],
      status: "Published",
      datetime: "2024-01-15 10:30 AM",
    },
    {
      id: 2,
      preview: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&h=100&fit=crop",
      caption: "Join our team! We're hiring for multiple...",
      platforms: ["Instagram", "Twitter"],
      status: "Scheduled",
      datetime: "2024-01-16 02:00 PM",
    },
    {
      id: 3,
      preview: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=100&h=100&fit=crop",
      caption: "Employee spotlight: Meet our amazing HR team...",
      platforms: ["LinkedIn"],
      status: "Published",
      datetime: "2024-01-14 09:15 AM",
    },
    {
      id: 4,
      preview: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=100&h=100&fit=crop",
      caption: "Work culture matters! Check out our office...",
      platforms: ["Facebook", "Instagram"],
      status: "Failed",
      datetime: "2024-01-13 04:45 PM",
    },
  ];

  const getStatusColor = (status: Post["status"]) => {
    switch (status) {
      case "Published":
        return "default";
      case "Scheduled":
        return "secondary";
      case "Failed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Posts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Preview</TableHead>
                <TableHead>Caption</TableHead>
                <TableHead>Platforms</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <img
                      src={post.preview}
                      alt="Post preview"
                      className="h-12 w-12 rounded-md object-cover"
                    />
                  </TableCell>
                  <TableCell className="max-w-[250px] truncate font-medium">
                    {post.caption}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {post.platforms.map((platform) => (
                        <Badge key={platform} variant="outline" className="text-xs">
                          {platform}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(post.status)}>{post.status}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {post.datetime}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      {post.status === "Failed" && (
                        <Button variant="ghost" size="icon">
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentPostsCard;
