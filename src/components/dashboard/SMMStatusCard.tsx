import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Facebook, Instagram, Linkedin, Twitter, CheckCircle2, AlertCircle } from "lucide-react";

const socialAccounts = [
  { name: "Facebook", icon: Facebook, connected: true, color: "#1877F2" },
  { name: "Instagram", icon: Instagram, connected: true, color: "#E4405F" },
  { name: "LinkedIn", icon: Linkedin, connected: true, color: "#0A66C2" },
  { name: "X (Twitter)", icon: Twitter, connected: false, color: "#000000" },
];

const postStats = [
  { status: "Published", count: 8, color: "#10b981" },
  { status: "Scheduled", count: 3, color: "#3b82f6" },
  { status: "Failed", count: 1, color: "#ef4444" },
];

const SMMStatusCard = () => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg shadow-lg px-4 py-3">
          <p className="text-sm font-semibold text-foreground">{payload[0].payload.status}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {payload[0].value} {payload[0].value === 1 ? 'post' : 'posts'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="transition-all duration-300 hover:shadow-lg bg-card rounded-[20px]">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-foreground">SMM Status</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">Social Media Activity</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connected Accounts */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-4">Connected Accounts</h4>
          <div className="grid grid-cols-2 gap-4">
            {socialAccounts.map((account, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-all group cursor-pointer"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ backgroundColor: account.connected ? `${account.color}15` : '#f3f4f6' }}
                >
                  <account.icon
                    className="h-5 w-5"
                    style={{ color: account.connected ? account.color : '#9ca3af' }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{account.name}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    {account.connected ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                        <span className="text-xs text-green-600">Connected</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 text-amber-600" />
                        <span className="text-xs text-amber-600">Not Connected</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border/50" />

        {/* Post Statistics */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-4">Post Statistics</h4>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={postStats} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} vertical={false} />
              <XAxis
                dataKey="status"
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]} animationDuration={800}>
                {postStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Stats Summary */}
          <div className="mt-4 flex justify-around">
            {postStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stat.color }} />
                  <span className="text-xs text-muted-foreground">{stat.status}</span>
                </div>
                <p className="text-lg font-bold text-foreground mt-1">{stat.count}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SMMStatusCard;
