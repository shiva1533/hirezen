import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { useState } from "react";

interface SocialAccount {
  id: string;
  name: string;
  icon: React.ElementType;
  connected: boolean;
}

const ConnectedAccountsCard = () => {
  const [accounts, setAccounts] = useState<SocialAccount[]>([
    { id: "facebook", name: "Facebook", icon: Facebook, connected: true },
    { id: "instagram", name: "Instagram", icon: Instagram, connected: false },
    { id: "linkedin", name: "LinkedIn", icon: Linkedin, connected: false },
    { id: "twitter", name: "Twitter (X)", icon: Twitter, connected: true },
  ]);

  const toggleConnection = (id: string) => {
    setAccounts(
      accounts.map((account) =>
        account.id === id ? { ...account, connected: !account.connected } : account
      )
    );
  };

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Connected Accounts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {accounts.map((account) => {
            const Icon = account.icon;
            return (
              <div
                key={account.id}
                className={`flex items-center justify-between rounded-lg border p-4 transition-colors ${
                  account.connected ? "border-primary bg-primary/5" : "border-border bg-muted"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-8 w-8 text-foreground" />
                  <div>
                    <p className="font-medium text-foreground">{account.name}</p>
                    <Badge
                      variant={account.connected ? "outline" : "secondary"}
                      className="mt-1 text-xs text-muted-foreground"
                    >
                      {account.connected ? "Connected" : "Not Connected"}
                    </Badge>
                  </div>
                </div>
                  <Button
                    size="sm"
                    variant={account.connected ? "destructive" : "default"}
                    onClick={() => toggleConnection(account.id)}
                  >
                    {account.connected ? "Disconnect" : "Connect"}
                  </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectedAccountsCard;
