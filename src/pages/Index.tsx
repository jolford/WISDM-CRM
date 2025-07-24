import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Layout from "@/components/Layout"
import Dashboard from "./Dashboard"

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Welcome to WISDM Sales and Support Management</h1>
            <p className="text-lg text-muted-foreground">
              Manage your contacts, deals, and grow your business
            </p>
          </div>
          <Button asChild size="lg">
            <Link to="/auth">Get Started</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <Dashboard />
    </Layout>
  );
};

export default Index;
