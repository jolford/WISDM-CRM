import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { 
  Filter,
  TrendingUp,
  Users,
  Clock,
  AlertTriangle,
  Target
} from 'lucide-react';
import {
  FunnelChart,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
  Sankey
} from 'recharts';

interface PipelineStage {
  stage: string;
  count: number;
  value: number;
  conversionRate: number;
  avgDaysInStage: number;
  dropoffRate: number;
}

interface FunnelData {
  name: string;
  value: number;
  count: number;
  fill: string;
}

interface VelocityData {
  stage: string;
  avgDays: number;
  dealCount: number;
}

const STAGE_COLORS = {
  'prospect': 'hsl(var(--chart-1))',
  'qualified': 'hsl(var(--chart-2))',
  'proposal': 'hsl(var(--chart-3))',
  'negotiation': 'hsl(var(--chart-4))',
  'closed': 'hsl(var(--chart-5))'
};

export default function PipelineAnalytics() {
  const [pipelineData, setPipelineData] = useState<PipelineStage[]>([]);
  const [funnelData, setFunnelData] = useState<FunnelData[]>([]);
  const [velocityData, setVelocityData] = useState<VelocityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedOwner, setSelectedOwner] = useState('all');
  const [owners, setOwners] = useState<any[]>([]);

  useEffect(() => {
    loadPipelineData();
    loadOwners();
  }, [selectedPeriod, selectedOwner]);

  const loadOwners = async () => {
    try {
      const { data } = await supabase
        .from('deals')
        .select('deal_owner_name')
        .not('deal_owner', 'is', null);
      
      if (data) {
        const uniqueOwners = [...new Set(data.map(d => d.deal_owner_name))];
        setOwners(uniqueOwners.map(owner => ({ id: owner, name: owner })));
      }
    } catch (error) {
      console.error('Error loading owners:', error);
    }
  };

  const loadPipelineData = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('deals')
        .select('*')
        .gte('created_at', new Date(Date.now() - parseInt(selectedPeriod) * 24 * 60 * 60 * 1000).toISOString());

      if (selectedOwner !== 'all') {
        query = query.eq('deal_owner_name', selectedOwner);
      }

      const { data: deals } = await query;

      if (deals) {
        analyzePipelineData(deals);
        generateFunnelData(deals);
        calculateVelocityData(deals);
      }
    } catch (error) {
      console.error('Error loading pipeline data:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzePipelineData = (deals: any[]) => {
    const stages = ['prospect', 'qualified', 'proposal', 'negotiation', 'closed'];
    const stageAnalysis: PipelineStage[] = [];

    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      const stageDeals = deals.filter(d => d.stage === stage);
      const nextStage = stages[i + 1];
      const nextStageDeals = deals.filter(d => d.stage === nextStage);
      
      const count = stageDeals.length;
      const value = stageDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
      const conversionRate = i < stages.length - 1 && count > 0 
        ? (nextStageDeals.length / count) * 100 
        : 0;
      
      // Calculate average days in stage
      const avgDaysInStage = stageDeals.length > 0
        ? stageDeals.reduce((sum, deal) => {
            const days = deal.updated_at 
              ? Math.abs(new Date(deal.updated_at).getTime() - new Date(deal.created_at).getTime()) / (1000 * 60 * 60 * 24)
              : 0;
            return sum + days;
          }, 0) / stageDeals.length
        : 0;

      const dropoffRate = i > 0 && stages[i - 1] 
        ? Math.max(0, 100 - conversionRate)
        : 0;

      stageAnalysis.push({
        stage,
        count,
        value,
        conversionRate,
        avgDaysInStage,
        dropoffRate
      });
    }

    setPipelineData(stageAnalysis);
  };

  const generateFunnelData = (deals: any[]) => {
    const stages = ['prospect', 'qualified', 'proposal', 'negotiation', 'closed'];
    const funnel: FunnelData[] = stages.map(stage => {
      const stageDeals = deals.filter(d => d.stage === stage);
      return {
        name: stage.charAt(0).toUpperCase() + stage.slice(1),
        value: stageDeals.reduce((sum, deal) => sum + (deal.value || 0), 0),
        count: stageDeals.length,
        fill: STAGE_COLORS[stage as keyof typeof STAGE_COLORS] || 'hsl(var(--primary))'
      };
    });

    setFunnelData(funnel);
  };

  const calculateVelocityData = (deals: any[]) => {
    const stages = ['prospect', 'qualified', 'proposal', 'negotiation', 'closed'];
    const velocity: VelocityData[] = stages.map(stage => {
      const stageDeals = deals.filter(d => d.stage === stage);
      const avgDays = stageDeals.length > 0
        ? stageDeals.reduce((sum, deal) => {
            const created = new Date(deal.created_at);
            const updated = new Date(deal.updated_at || deal.created_at);
            const days = Math.abs(updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
            return sum + days;
          }, 0) / stageDeals.length
        : 0;

      return {
        stage: stage.charAt(0).toUpperCase() + stage.slice(1),
        avgDays: Math.round(avgDays),
        dealCount: stageDeals.length
      };
    });

    setVelocityData(velocity);
  };

  const getStageHealth = (stage: PipelineStage) => {
    if (stage.conversionRate >= 80) return { status: 'Excellent', color: 'bg-green-500' };
    if (stage.conversionRate >= 60) return { status: 'Good', color: 'bg-blue-500' };
    if (stage.conversionRate >= 40) return { status: 'Average', color: 'bg-yellow-500' };
    return { status: 'Needs Attention', color: 'bg-red-500' };
  };

  const getTotalPipelineValue = () => {
    return pipelineData.reduce((sum, stage) => sum + stage.value, 0);
  };

  const getWeightedForecast = () => {
    return pipelineData.reduce((sum, stage) => {
      const weight = stage.stage === 'closed' ? 1 : stage.conversionRate / 100;
      return sum + (stage.value * weight);
    }, 0);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold">Pipeline Analytics</h2>
          <p className="text-muted-foreground">Deep dive into your sales funnel performance</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 Days</SelectItem>
              <SelectItem value="30">30 Days</SelectItem>
              <SelectItem value="90">90 Days</SelectItem>
              <SelectItem value="365">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedOwner} onValueChange={setSelectedOwner}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Owners" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Owners</SelectItem>
              {owners.map(owner => (
                <SelectItem key={owner.id} value={owner.id}>{owner.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Pipeline</p>
                <p className="text-2xl font-bold">${getTotalPipelineValue().toLocaleString()}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Weighted Forecast</p>
                <p className="text-2xl font-bold">${getWeightedForecast().toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Deals</p>
                <p className="text-2xl font-bold">{pipelineData.reduce((sum, stage) => sum + stage.count, 0)}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Cycle Time</p>
                <p className="text-2xl font-bold">
                  {Math.round(velocityData.reduce((sum, v) => sum + v.avgDays, 0) / velocityData.length)} days
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="funnel" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="funnel">Sales Funnel</TabsTrigger>
          <TabsTrigger value="conversion">Conversion Analysis</TabsTrigger>
          <TabsTrigger value="velocity">Stage Velocity</TabsTrigger>
          <TabsTrigger value="health">Pipeline Health</TabsTrigger>
        </TabsList>

        {/* Sales Funnel */}
        <TabsContent value="funnel" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Pipeline Funnel - Value</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={funnelData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Value']} />
                    <Bar dataKey="value" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Pipeline Funnel - Deal Count</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={funnelData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="hsl(var(--primary))"
                      dataKey="count"
                      label={({ name, count }) => `${name}: ${count}`}
                    >
                      {funnelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Conversion Analysis */}
        <TabsContent value="conversion" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stage-to-Stage Conversion Rates</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={pipelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stage" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${typeof value === 'number' ? value.toFixed(1) : value}%`, 'Conversion Rate']} />
                  <Bar dataKey="conversionRate" fill="hsl(var(--chart-2))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stage Velocity */}
        <TabsContent value="velocity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Average Days in Each Stage</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={velocityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stage" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} days`, 'Average Days']} />
                  <Area type="monotone" dataKey="avgDays" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3))" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pipeline Health */}
        <TabsContent value="health" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {pipelineData.map((stage, index) => {
              const health = getStageHealth(stage);
              return (
                <Card key={stage.stage}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold capitalize">{stage.stage}</h3>
                        <Badge className={`${health.color} text-white`}>
                          {health.status}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">${stage.value.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">{stage.count} deals</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Conversion Rate</p>
                        <p className="text-lg font-semibold">{stage.conversionRate.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Days in Stage</p>
                        <p className="text-lg font-semibold">{stage.avgDaysInStage.toFixed(0)} days</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Drop-off Rate</p>
                        <p className="text-lg font-semibold text-red-600">{stage.dropoffRate.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Deal Size</p>
                        <p className="text-lg font-semibold">
                          ${stage.count > 0 ? (stage.value / stage.count).toLocaleString() : '0'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}