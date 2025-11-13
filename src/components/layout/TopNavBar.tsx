import { Bell, ChevronDown, User, LogOut, UserCog, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useMobileSidebar } from "@/hooks/useMobileSidebar";
import hirezenLogo from "@/assets/hirezen-logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import JobQRCode from "@/components/jobs/JobQRCode";

interface TopNavBarProps {
  customActions?: React.ReactNode;
}

const TopNavBar = ({ customActions }: TopNavBarProps) => {
  const navigate = useNavigate();
  const { toggle } = useMobileSidebar();
  const [showQRDialog, setShowQRDialog] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left section - Logo with Hamburger */}
        <div className="flex items-center gap-3">
          {/* Hamburger Menu Button - Only visible on mobile/tablet */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={toggle}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <img 
            src={hirezenLogo} 
            alt="Hirezen - Job Placement Platform" 
            className="h-10 w-auto object-contain"
          />
          <div className="hidden sm:block">
            <h1 className="text-base lg:text-lg font-semibold text-foreground">Hirezen</h1>
            <p className="text-xs text-muted-foreground">Placement Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
          {customActions}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 hidden sm:flex">
                <span className="text-sm">Today</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover">
              <DropdownMenuItem>Today</DropdownMenuItem>
              <DropdownMenuItem>This Week</DropdownMenuItem>
              <DropdownMenuItem>This Month</DropdownMenuItem>
              <DropdownMenuItem>Custom Range</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 hidden sm:flex"
            onClick={() => setShowQRDialog(true)}
          >
            <QrCode className="h-4 w-4" />
            <span className="text-sm">All Jobs QR</span>
          </Button>

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              3
            </span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover w-48">
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <User className="mr-2 h-4 w-4" />
                <span>My Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <UserCog className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <JobQRCode 
        jobId="all-jobs"
        jobTitle="All Available Positions"
        open={showQRDialog}
        onOpenChange={setShowQRDialog}
      />
    </header>
  );
};

export default TopNavBar;
