import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { 
  Trophy,
  TrendingUp,
  Target,
  Users,
  Award,
  Calendar,
  DollarSign,
  BarChart3,
  Download
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter
} from 'recharts';

interface SalesRep {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
}

interface RepPerformance {
  rep: SalesRep;
  dealsWon: number;
  dealsClosed: number;
  totalRevenue: number;
  avgDealSize: number;
  conversionRate: number;
  quota: number;
  quotaAttainment: number;
  salesVelocity: number;
  activities: number;
  rank: number;
  trend: 'up' | 'down' | 'stable';
  score: number;
}

interface TeamMetrics {
  totalRevenue: number;
  totalQuota: number;
  avgQuotaAttainment: number;
  topPerformer: string;
  bottomPerformer: string;
  teamSize: number;
}

interface ActivityData {
  rep: string;
  calls: number;
  emails: number;
  meetings: number;
  demos: number;
}

export default function SalesPerformanceReports() {
  const [repPerformances, setRepPerformances] = useState<RepPerformance[]>([]);
  const [teamMetrics, setTeamMetrics] = useState<TeamMetrics | null>(null);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('quarter');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  useEffect(() => {
    loadPerformanceData();
  }, [selectedPeriod]);

  const loadPerformanceData = async () => {
    setLoading(true);
    try {
      // Get date range based on selected period
      const endDate = new Date();
      const startDate = new Date();
      
      switch (selectedPeriod) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      // Load sales reps
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'sales_rep');

      // Load deals for the period
      const { data: deals } = await supabase
        .from('deals')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (profiles && deals) {
        await calculateRepPerformances(profiles, deals);
        calculateTeamMetrics(profiles, deals);
        generateActivityData(profiles);
      }
    } catch (error) {
      console.error('Error loading performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRepPerformances = async (reps: any[], deals: any[]) => {
    const performances: RepPerformance[] = [];

    for (const rep of reps) {
      const repDeals = deals.filter(d => d.deal_owner === rep.email);
      const closedDeals = repDeals.filter(d => d.stage === 'closed');
      const wonDeals = repDeals.filter(d => d.stage === 'closed' && d.value > 0);
      
      const totalRevenue = wonDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
      const avgDealSize = wonDeals.length > 0 ? totalRevenue / wonDeals.length : 0;
      const conversionRate = repDeals.length > 0 ? (wonDeals.length / repDeals.length) * 100 : 0;
      
      // Calculate sales velocity (avg days to close)
      const velocityDays = wonDeals.length > 0 
        ? wonDeals.reduce((sum, deal) => {
            const days = Math.abs(new Date(deal.close_date).getTime() - new Date(deal.created_at).getTime()) / (1000 * 60 * 60 * 24);
            return sum + days;
          }, 0) / wonDeals.length
        : 0;

      // Mock quota data (in real app, this would come from a quotas table)
      const quota = getQuotaForPeriod(selectedPeriod);
      const quotaAttainment = quota > 0 ? (totalRevenue / quota) * 100 : 0;

      // Calculate performance score
      const score = calculatePerformanceScore({
        quotaAttainment,
        conversionRate,
        avgDealSize,
        salesVelocity: velocityDays
      });

      performances.push({
        rep: {
          id: rep.id,
          name: `${rep.first_name} ${rep.last_name}`,
          email: rep.email,
          avatar_url: rep.avatar_url
        },
        dealsWon: wonDeals.length,
        dealsClosed: closedDeals.length,
        totalRevenue,
        avgDealSize,
        conversionRate,
        quota,
        quotaAttainment,
        salesVelocity: velocityDays,
        activities: Math.floor(Math.random() * 100) + 50, // Mock data
        rank: 0, // Will be set after sorting
        trend: quotaAttainment > 90 ? 'up' : quotaAttainment > 70 ? 'stable' : 'down',
        score
      });
    }

    // Sort by performance score and assign ranks
    performances.sort((a, b) => b.score - a.score);
    performances.forEach((perf, index) => {
      perf.rank = index + 1;
    });

    setRepPerformances(performances);
  };

  const calculateTeamMetrics = (reps: any[], deals: any[]) => {
    const totalQuota = reps.length * getQuotaForPeriod(selectedPeriod);
    const totalRevenue = deals
      .filter(d => d.stage === 'closed' && d.value > 0)
      .reduce((sum, deal) => sum + (deal.value || 0), 0);
    
    const avgQuotaAttainment = totalQuota > 0 ? (totalRevenue / totalQuota) * 100 : 0;
    
    const topPerformer = repPerformances.length > 0 ? repPerformances[0].rep.name : 'N/A';
    const bottomPerformer = repPerformances.length > 0 
      ? repPerformances[repPerformances.length - 1].rep.name 
      : 'N/A';

    setTeamMetrics({
      totalRevenue,
      totalQuota,
      avgQuotaAttainment,
      topPerformer,
      bottomPerformer,
      teamSize: reps.length
    });
  };

  const generateActivityData = (reps: any[]) => {
    const activities: ActivityData[] = reps.map(rep => ({
      rep: `${rep.first_name} ${rep.last_name}`,
      calls: Math.floor(Math.random() * 50) + 20,
      emails: Math.floor(Math.random() * 100) + 50,
      meetings: Math.floor(Math.random() * 20) + 5,
      demos: Math.floor(Math.random() * 10) + 2
    }));
    setActivityData(activities);
  };

  const getQuotaForPeriod = (period: string): number => {
    switch (period) {
      case 'week': return 25000;
      case 'month': return 100000;
      case 'quarter': return 300000;
      case 'year': return 1200000;
      default: return 300000;
    }
  };

  const calculatePerformanceScore = (metrics: {
    quotaAttainment: number;
    conversionRate: number;
    avgDealSize: number;
    salesVelocity: number;
  }): number => {
    // Weighted scoring algorithm
    const quotaWeight = 0.4;
    const conversionWeight = 0.3;
    const dealSizeWeight = 0.2;
    const velocityWeight = 0.1;

    const quotaScore = Math.min(metrics.quotaAttainment, 150); // Cap at 150%
    const conversionScore = Math.min(metrics.conversionRate * 2, 100); // Scale conversion rate
    const dealSizeScore = Math.min(metrics.avgDealSize / 1000, 100); // Scale deal size
    const velocityScore = Math.max(100 - metrics.salesVelocity, 0); // Lower velocity = higher score

    return (
      quotaScore * quotaWeight +
      conversionScore * conversionWeight +
      dealSizeScore * dealSizeWeight +
      velocityScore * velocityWeight
    );
  };

  const getPerformanceBadge = (quotaAttainment: number) => {
    if (quotaAttainment >= 120) return { label: 'Overachiever', color: 'bg-purple-500' };
    if (quotaAttainment >= 100) return { label: 'Goal Met', color: 'bg-green-500' };
    if (quotaAttainment >= 80) return { label: 'On Track', color: 'bg-blue-500' };
    if (quotaAttainment >= 60) return { label: 'Behind', color: 'bg-yellow-500' };
    return { label: 'At Risk', color: 'bg-red-500' };
  };

  const exportToCSV = () => {
    const csvData = repPerformances.map(perf => ({
      Name: perf.rep.name,
      Email: perf.rep.email,
      Rank: perf.rank,
      'Total Revenue': perf.totalRevenue,
      'Deals Won': perf.dealsWon,
      'Quota Attainment': `${perf.quotaAttainment.toFixed(1)}%`,
      'Conversion Rate': `${perf.conversionRate.toFixed(1)}%`,
      'Avg Deal Size': perf.avgDealSize,
      'Sales Velocity': `${perf.salesVelocity.toFixed(0)} days`,
      'Performance Score': perf.score.toFixed(1)
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-performance-${selectedPeriod}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-24 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold">Sales Performance Reports</h2>
          <p className="text-muted-foreground">Individual and team performance analytics</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportToCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Team Summary */}
      {teamMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Team Revenue</p>
                  <p className="text-2xl font-bold">${teamMetrics.totalRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Quota Attainment</p>
                  <p className="text-2xl font-bold">{teamMetrics.avgQuotaAttainment.toFixed(1)}%</p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Top Performer</p>
                  <p className="text-lg font-semibold">{teamMetrics.topPerformer}</p>
                </div>
                <Trophy className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Team Size</p>
                  <p className="text-2xl font-bold">{teamMetrics.teamSize}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="leaderboard" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="detailed">Detailed View</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>

        {/* Leaderboard */}
        <TabsContent value="leaderboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {repPerformances.slice(0, 3).map((perf, index) => {
              const badge = getPerformanceBadge(perf.quotaAttainment);
              const medals = ['🥇', '🥈', '🥉'];
              return (
                <Card key={perf.rep.id} className={`${index === 0 ? 'ring-2 ring-yellow-400' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="text-4xl">{medals[index]}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{perf.rep.name}</h3>
                          <Badge className={`${badge.color} text-white`}>
                            {badge.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{perf.rep.email}</p>
                        <div className="mt-3 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Revenue</span>
                            <span className="font-semibold">${perf.totalRevenue.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Quota</span>
                            <span className="font-semibold">{perf.quotaAttainment.toFixed(1)}%</span>
                          </div>
                          <Progress value={Math.min(perf.quotaAttainment, 100)} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Detailed View */}
        <TabsContent value="detailed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Sales Rep</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Quota %</TableHead>
                    <TableHead>Deals Won</TableHead>
                    <TableHead>Conversion %</TableHead>
                    <TableHead>Avg Deal Size</TableHead>
                    <TableHead>Velocity</TableHead>
                    <TableHead>Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {repPerformances.map((perf) => (
                    <TableRow key={perf.rep.id}>
                      <TableCell className="font-medium">#{perf.rank}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{perf.rep.name}</div>
                          <div className="text-sm text-muted-foreground">{perf.rep.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>${perf.totalRevenue.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>{perf.quotaAttainment.toFixed(1)}%</span>
                          {perf.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-600" />}
                        </div>
                      </TableCell>
                      <TableCell>{perf.dealsWon}</TableCell>
                      <TableCell>{perf.conversionRate.toFixed(1)}%</TableCell>
                      <TableCell>${perf.avgDealSize.toLocaleString()}</TableCell>
                      <TableCell>{perf.salesVelocity.toFixed(0)} days</TableCell>
                      <TableCell>
                        <Badge variant="outline">{perf.score.toFixed(1)}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activities */}
        <TabsContent value="activities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sales Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="rep" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="calls" fill="hsl(var(--chart-1))" name="Calls" />
                  <Bar dataKey="emails" fill="hsl(var(--chart-2))" name="Emails" />
                  <Bar dataKey="meetings" fill="hsl(var(--chart-3))" name="Meetings" />
                  <Bar dataKey="demos" fill="hsl(var(--chart-4))" name="Demos" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comparison */}
        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart data={repPerformances}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quotaAttainment" name="Quota Attainment %" />
                  <YAxis dataKey="conversionRate" name="Conversion Rate %" />
                  <Tooltip 
                    formatter={(value, name) => [value, name]}
                    labelFormatter={(label) => `Rep: ${repPerformances.find(p => p.quotaAttainment === label)?.rep.name}`}
                  />
                  <Scatter dataKey="quotaAttainment" fill="hsl(var(--primary))" />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}