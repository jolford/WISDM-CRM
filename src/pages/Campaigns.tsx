import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Mail, Phone, Target, Calendar, Users, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CreateCampaignDialog } from "@/components/CreateCampaignDialog";
import { supabase } from "@/integrations/supabase/client";

const Campaigns = () => {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching campaigns:', error);
        toast({
          title: "Error",
          description: "Failed to load campaigns",
          variant: "destructive",
        });
        return;
      }

      setCampaigns(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "Draft":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "Completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Email":
        return <Mail className="h-4 w-4" />;
      case "Phone":
        return <Phone className="h-4 w-4" />;
      case "Multi-channel":
        return <Target className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const handleCampaignCreated = async (newCampaign: any) => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .insert([newCampaign])
        .select()
        .single();

      if (error) {
        console.error('Error creating campaign:', error);
        toast({
          title: "Error",
          description: "Failed to create campaign",
          variant: "destructive",
        });
        return;
      }

      setCampaigns(prev => [data, ...prev]);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground">Manage your marketing campaigns and track performance</p>
        </div>
        <CreateCampaignDialog onCampaignCreated={handleCampaignCreated} />
      </div>

      {/* Campaign Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Campaigns</p>
                <p className="text-2xl font-bold">{campaigns.length}</p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Campaigns</p>
                <p className="text-2xl font-bold">{campaigns.filter(c => c.status === "Active").length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold">{campaigns.reduce((sum, c) => sum + c.leads, 0)}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Conversion Rate</p>
                <p className="text-2xl font-bold">
                  {(campaigns.reduce((sum, c) => sum + c.conversionRate, 0) / campaigns.length).toFixed(1)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <div className="grid gap-6">
        {campaigns.map((campaign) => (
          <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getTypeIcon(campaign.type)}
                  <div>
                    <CardTitle className="text-xl">{campaign.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {campaign.targetAudience} • {campaign.type}
                    </CardDescription>
                  </div>
                </div>
                <Badge className={getStatusColor(campaign.status)}>
                  {campaign.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Duration
                  </div>
                  <div className="text-sm">
                    <div>{campaign.start_date ? new Date(campaign.start_date).toLocaleDateString() : 'Not set'}</div>
                    <div className="text-muted-foreground">to {campaign.end_date ? new Date(campaign.end_date).toLocaleDateString() : 'Not set'}</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Budget</div>
                  <div className="text-sm">
                    <div className="font-medium">${(campaign.spent || 0).toLocaleString()} / ${(campaign.budget || 0).toLocaleString()}</div>
                    <div className="text-muted-foreground">
                      {campaign.budget > 0 ? Math.round(((campaign.spent || 0) / campaign.budget) * 100) : 0}% spent
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Performance</div>
                  <div className="text-sm">
                    <div className="font-medium">{campaign.leads || 0} leads</div>
                    <div className="text-muted-foreground">{campaign.conversions || 0} conversions</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Conversion Rate</div>
                  <div className="text-lg font-bold text-primary">
                    {campaign.conversion_rate || 0}%
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t flex gap-2">
                <Button variant="outline" size="sm">
                  View Details
                </Button>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
                {campaign.status === "active" && (
                  <Button variant="outline" size="sm">
                    Pause
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Campaigns;