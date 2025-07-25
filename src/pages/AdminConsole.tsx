import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Building2, Target, CheckSquare, BarChart3, Settings, Shield, Database, Monitor } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MaintenanceTracking from "@/components/MaintenanceTracking";

export default function AdminConsole() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Check if user has admin access
  if (profile?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-destructive">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access the admin console.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const adminActions = [
    {
      title: "User Management",
      description: "Manage user accounts, roles, and permissions",
      icon: Users,
      action: () => toast({ title: "User Management", description: "Opening user management..." }),
      badge: "Core"
    },
    {
      title: "System Settings",
      description: "Configure system-wide settings and preferences",
      icon: Settings,
      action: () => toast({ title: "System Settings", description: "Opening system settings..." }),
      badge: "Config"
    },
    {
      title: "Database Management",
      description: "View database statistics and perform maintenance",
      icon: Database,
      action: () => toast({ title: "Database", description: "Opening database management..." }),
      badge: "Data"
    },
    {
      title: "Security Audit",
      description: "Review security logs and access patterns",
      icon: Shield,
      action: () => toast({ title: "Security Audit", description: "Opening security audit..." }),
      badge: "Security"
    },
    {
      title: "Analytics Dashboard",
      description: "View system analytics and performance metrics",
      icon: BarChart3,
      action: () => toast({ title: "Analytics", description: "Opening analytics dashboard..." }),
      badge: "Analytics"
    },
    {
      title: "Import/Export",
      description: "Manage data imports and exports",
      icon: Target,
      action: () => window.location.href = '/data-migration',
      badge: "Data"
    }
  ];

  const stats = [
    { label: "Total Users", value: "12", change: "+2 this week" },
    { label: "Active Deals", value: "45", change: "+8 this month" },
    { label: "Total Companies", value: "230", change: "+15 this month" },
    { label: "Pending Tasks", value: "18", change: "-3 today" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Console</h1>
          <p className="text-muted-foreground mt-2">
            Manage system settings, users, and monitor platform health
          </p>
        </div>
        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
          <Shield className="w-3 h-3 mr-1" />
          Admin Access
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="maintenance">
            <Monitor className="w-4 h-4 mr-2" />
            Maintenance Tracking
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardDescription>{stat.label}</CardDescription>
                  <CardTitle className="text-2xl">{stat.value}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">{stat.change}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Admin Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminActions.map((action, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer" onClick={action.action}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <action.icon className="h-6 w-6 text-primary" />
                    <Badge variant="secondary">{action.badge}</Badge>
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Open
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent System Activity</CardTitle>
              <CardDescription>Latest administrative actions and system events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">New user registration</p>
                    <p className="text-sm text-muted-foreground">john.doe@example.com joined the platform</p>
                  </div>
                  <span className="text-xs text-muted-foreground">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Data import completed</p>
                    <p className="text-sm text-muted-foreground">250 contacts imported successfully</p>
                  </div>
                  <span className="text-xs text-muted-foreground">5 hours ago</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">System backup completed</p>
                    <p className="text-sm text-muted-foreground">Automated daily backup finished</p>
                  </div>
                  <span className="text-xs text-muted-foreground">1 day ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance">
          <MaintenanceTracking />
        </TabsContent>
      </Tabs>
    </div>
  );
}