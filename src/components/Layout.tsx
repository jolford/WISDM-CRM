import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { Bell, Search, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import ProtectedRoute from "./ProtectedRoute"

interface LayoutProps {
  children: React.ReactNode
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

  // Check if user is admin
  const isAdmin = profile?.role === 'admin';

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
              <div className="flex items-center justify-between h-full px-6">
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
                    onClick={() => toast({ title: "Notifications", description: "No new notifications" })}
                  >
                    <Bell className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">
                      {profile?.first_name} {profile?.last_name}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      profile?.role === 'admin' ? 'bg-red-100 text-red-800' :
                      profile?.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {profile?.role?.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => window.location.href = '/settings'}
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
            <main className="flex-1 p-6">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  )
}