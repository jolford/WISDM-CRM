import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Building2, Target, CheckSquare, BarChart3, Settings, Shield, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function AdminConsole() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState([
    { label: "Total Users", value: "0", change: "Loading..." },
    { label: "Active Deals", value: "0", change: "Loading..." },
    { label: "Total Accounts", value: "0", change: "Loading..." },
    { label: "Pending Tasks", value: "0", change: "Loading..." }
  ]);

  // Check if user is admin
  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin]);

  const fetchStats = async () => {
    try {
      // Fetch total users
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch active deals
      const { count: dealCount } = await supabase
        .from('deals')
        .select('*', { count: 'exact', head: true });

      // Fetch total accounts
      const { count: accountCount } = await supabase
        .from('accounts')
        .select('*', { count: 'exact', head: true });

      // Fetch pending tasks
      const { count: taskCount } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      setStats([
        { label: "Total Users", value: userCount?.toString() || "0", change: "" },
        { label: "Active Deals", value: dealCount?.toString() || "0", change: "" },
        { label: "Total Accounts", value: accountCount?.toString() || "0", change: "" },
        { label: "Pending Tasks", value: taskCount?.toString() || "0", change: "" }
      ]);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  if (!isAdmin) {
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
      action: () => navigate('/admin/users'),
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

    </div>
  );
}