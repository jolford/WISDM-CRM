import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Users, 
  Clock,
  Calendar,
  Trophy,
  Zap,
  BarChart3
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface KPIMetric {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  target?: number;
  icon: any;
  color: string;
}

interface SalesData {
  period: string;
  revenue: number;
  deals: number;
  forecast: number;
  conversion: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export default function SalesKPIDashboard() {
  const [kpis, setKpis] = useState<KPIMetric[]>([]);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load deals data for KPI calculations
      const { data: deals } = await supabase
        .from('deals')
        .select('*')
        .gte('created_at', new Date(Date.now() - parseInt(timeRange) * 24 * 60 * 60 * 1000).toISOString());

      if (deals) {
        calculateKPIs(deals);
        generateSalesData(deals);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateKPIs = (deals: any[]) => {
    const totalRevenue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0);
    const closedDeals = deals.filter(d => d.stage === 'closed').length;
    const totalDeals = deals.length;
    const conversionRate = totalDeals > 0 ? (closedDeals / totalDeals) * 100 : 0;
    const avgDealSize = totalDeals > 0 ? totalRevenue / totalDeals : 0;
    
    // Calculate pipeline velocity (avg days to close)
    const closedDealsWithDates = deals.filter(d => d.stage === 'closed' && d.close_date && d.created_at);
    const avgVelocity = closedDealsWithDates.length > 0 
      ? closedDealsWithDates.reduce((sum, deal) => {
          const days = Math.abs(new Date(deal.close_date).getTime() - new Date(deal.created_at).getTime()) / (1000 * 60 * 60 * 24);
          return sum + days;
        }, 0) / closedDealsWithDates.length
      : 0;

    const quarterlyTarget = 1000000; // Example target
    const targetProgress = (totalRevenue / quarterlyTarget) * 100;

    setKpis([
      {
        title: 'Total Revenue',
        value: `$${totalRevenue.toLocaleString()}`,
        change: 12.5,
        trend: 'up',
        target: quarterlyTarget,
        icon: DollarSign,
        color: 'text-green-600'
      },
      {
        title: 'Deals Won',
        value: closedDeals,
        change: 8.2,
        trend: 'up',
        icon: Trophy,
        color: 'text-blue-600'
      },
      {
        title: 'Conversion Rate',
        value: `${conversionRate.toFixed(1)}%`,
        change: -2.1,
        trend: 'down',
        target: 25,
        icon: Target,
        color: 'text-orange-600'
      },
      {
        title: 'Avg Deal Size',
        value: `$${avgDealSize.toLocaleString()}`,
        change: 15.7,
        trend: 'up',
        icon: BarChart3,
        color: 'text-purple-600'
      },
      {
        title: 'Sales Velocity',
        value: `${avgVelocity.toFixed(0)} days`,
        change: -5.3,
        trend: 'up',
        icon: Zap,
        color: 'text-indigo-600'
      },
      {
        title: 'Quota Progress',
        value: `${targetProgress.toFixed(1)}%`,
        change: 18.9,
        trend: 'up',
        target: 100,
        icon: Calendar,
        color: 'text-pink-600'
      }
    ]);
  };

  const generateSalesData = (deals: any[]) => {
    // Group deals by week/month based on time range
    const groupBy = parseInt(timeRange) > 30 ? 'month' : 'week';
    const grouped = deals.reduce((acc, deal) => {
      const date = new Date(deal.created_at);
      const key = groupBy === 'month' 
        ? `${date.getFullYear()}-${date.getMonth() + 1}`
        : `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;
      
      if (!acc[key]) {
        acc[key] = { deals: [], revenue: 0, forecast: 0 };
      }
      acc[key].deals.push(deal);
      acc[key].revenue += deal.stage === 'closed' ? (deal.value || 0) : 0;
      acc[key].forecast += (deal.value || 0) * (deal.probability || 0) / 100;
      return acc;
    }, {} as any);

    const chartData = Object.entries(grouped).map(([period, data]: [string, any]) => ({
      period,
      revenue: data.revenue,
      deals: data.deals.length,
      forecast: data.forecast,
      conversion: data.deals.filter((d: any) => d.stage === 'closed').length / data.deals.length * 100
    }));

    setSalesData(chartData.sort((a, b) => a.period.localeCompare(b.period)));
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
  };

  const getTrendColor = (trend: string) => {
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
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
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Sales Performance Dashboard</h2>
        <Tabs value={timeRange} onValueChange={setTimeRange}>
          <TabsList>
            <TabsTrigger value="7">7 Days</TabsTrigger>
            <TabsTrigger value="30">30 Days</TabsTrigger>
            <TabsTrigger value="90">90 Days</TabsTrigger>
            <TabsTrigger value="365">1 Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                    <p className="text-2xl font-bold">{kpi.value}</p>
                    <div className="flex items-center space-x-2">
                      <span className={`flex items-center text-sm ${getTrendColor(kpi.trend)}`}>
                        {getTrendIcon(kpi.trend)}
                        <span className="ml-1">{Math.abs(kpi.change)}%</span>
                      </span>
                      <span className="text-xs text-muted-foreground">vs last period</span>
                    </div>
                    {kpi.target && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Progress to target</span>
                          <span>{((parseFloat(kpi.value.toString().replace(/[^0-9.]/g, '')) / kpi.target) * 100).toFixed(0)}%</span>
                        </div>
                        <Progress 
                          value={(parseFloat(kpi.value.toString().replace(/[^0-9.]/g, '')) / kpi.target) * 100} 
                          className="h-2"
                        />
                      </div>
                    )}
                  </div>
                  <div className={`p-3 rounded-full bg-background ${kpi.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue & Forecast Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value, name) => [`$${value.toLocaleString()}`, name]} />
                <Area type="monotone" dataKey="revenue" stackId="1" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.6} />
                <Area type="monotone" dataKey="forecast" stackId="2" stroke={COLORS[1]} fill={COLORS[1]} fillOpacity={0.4} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Deals & Conversion */}
        <Card>
          <CardHeader>
            <CardTitle>Deals & Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Bar yAxisId="left" dataKey="deals" fill={COLORS[2]} />
                <Line yAxisId="right" type="monotone" dataKey="conversion" stroke={COLORS[3]} strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}