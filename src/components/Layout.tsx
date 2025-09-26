import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Bell, Search, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import ProtectedRoute from "./ProtectedRoute";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { signOut, profile } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
  };

  const isAdmin = profile?.role === "admin";

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />

          <div className="flex-1 flex flex-col">
            {/* Header */}
            <header className="h-16 border-b bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 shadow-soft">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-chart-1/5"></div>
              <div className="relative flex items-center justify-between h-full px-6">
                <div className="flex items-center gap-4">
                  <SidebarTrigger />
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search contacts, accounts, deals..."
                      className="pl-10 w-80"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      toast({
                        title: "Notifications",
                        description: "No new notifications",
                      })
                    }
                  >
                    <Bell className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">
                      {profile?.first_name} {profile?.last_name}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        profile?.role === "admin"
                          ? "bg-red-100 text-red-800"
                          : profile?.role === "manager"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {profile?.role?.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => (window.location.href = "/settings")}
                  >
                    <User className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-6">{children}</main>

            {/* Footer */}
            <footer className="relative text-center text-sm py-6 border-t border-border/50 bg-gradient-to-r from-background/50 via-background to-background/50 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-chart-3/5 opacity-30"></div>
              <div className="relative">
                <p className="text-gradient font-medium">
                  Developed by <span className="text-holographic font-bold">Jeremy Olford</span> © 2025
                </p>
                <div className="mt-2 flex justify-center space-x-2">
                  <div className="w-1 h-1 bg-primary rounded-full animate-pulse"></div>
                  <div className="w-1 h-1 bg-chart-1 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                  <div className="w-1 h-1 bg-chart-3 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
