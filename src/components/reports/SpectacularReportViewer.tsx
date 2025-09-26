import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import SpectacularExport from './SpectacularExport';
import {
  ArrowLeft,
  RefreshCw,
  Filter,
  Search,
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp,
  Table as TableIcon,
  Zap,
  Target,
  Calendar,
  Users,
  DollarSign,
  TrendingDown,
  Activity,
  Eye,
  Star,
  Award,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart,
  RadialBarChart,
  RadialBar,
  Treemap
} from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface SpectacularReportViewerProps {
  reportId: string;
  onBack: () => void;
  onEdit: () => void;
}

interface ReportData {
  id: string;
  name: string;
  description: string;
  data_sources: string[];
  selected_fields: any;
  group_by_fields: any;
  aggregate_functions: any;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

interface ChartData {
  id: string;
  chart_type: string;
  chart_title: string;
  x_axis_field: string;
  y_axis_field: string;
  aggregate_function: string;
  chart_config: any;
}

const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', 
  '#d084d0', '#87d068', '#ffa502', '#ff6b6b', '#4ecdc4'
];

const GRADIENT_COLORS = [
  ['#667eea', '#764ba2'],
  ['#f093fb', '#f5576c'],
  ['#4facfe', '#00f2fe'],
  ['#43e97b', '#38f9d7'],
  ['#ffecd2', '#fcb69f']
];

const SpectacularReportViewer: React.FC<SpectacularReportViewerProps> = ({
  reportId,
  onBack,
  onEdit
}) => {
  const [report, setReport] = useState<ReportData | null>(null);
  const [charts, setCharts] = useState<ChartData[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMetric, setSelectedMetric] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadReport();
  }, [reportId]);

  useEffect(() => {
    filterData();
  }, [tableData, searchTerm, selectedMetric]);

  const filterData = () => {
    let filtered = tableData;

    if (searchTerm) {
      filtered = filtered.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    setFilteredData(filtered);
  };

  const loadReport = async () => {
    try {
      setLoading(true);
      
      // Load report details
      const { data: reportData, error: reportError } = await supabase
        .from('reports')
        .select('*')
        .eq('id', reportId)
        .single();

      if (reportError) throw reportError;
      setReport(reportData);

      // Load report charts
      const { data: chartsData, error: chartsError } = await supabase
        .from('report_charts')
        .select('*')
        .eq('report_id', reportId)
        .order('position_y', { ascending: true });

      if (chartsError) throw chartsError;
      setCharts(chartsData || []);

      // Generate enhanced report data
      await generateSpectacularData(reportData);

    } catch (error) {
      console.error('Error loading report:', error);
      toast({
        title: "Error",
        description: "Failed to load report",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSpectacularData = async (reportConfig: ReportData) => {
    try {
      if (reportConfig.data_sources.includes('deals')) {
        const { data: deals, error } = await supabase
          .from('deals')
          .select('*')
          .limit(200);

        if (error) throw error;

        // Enhanced data processing with calculated metrics
        const processedData = deals?.map(deal => {
          const daysToClose = deal.close_date 
            ? Math.ceil((new Date(deal.close_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
            : null;
          
          const ageInDays = Math.ceil((new Date().getTime() - new Date(deal.created_at).getTime()) / (1000 * 60 * 60 * 24));
          
          return {
            'Deal Name': deal.name,
            'Value': deal.value || 0,
            'Stage': deal.stage,
            'Probability': deal.probability || 0,
            'Expected Value': (deal.value || 0) * (deal.probability || 0) / 100,
            'Close Date': deal.close_date ? new Date(deal.close_date).toLocaleDateString() : 'TBD',
            'Days to Close': daysToClose,
            'Deal Age': ageInDays,
            'Risk Level': calculateRiskLevel(deal),
            'Priority': calculatePriority(deal),
            'Created': new Date(deal.created_at).toLocaleDateString(),
            'Month': new Date(deal.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            'Quarter': `Q${Math.ceil((new Date(deal.created_at).getMonth() + 1) / 3)} ${new Date(deal.created_at).getFullYear()}`
          };
        }) || [];

        setTableData(processedData);
      }
    } catch (error) {
      console.error('Error generating report data:', error);
    }
  };

  const calculateRiskLevel = (deal: any) => {
    const ageInDays = Math.ceil((new Date().getTime() - new Date(deal.created_at).getTime()) / (1000 * 60 * 60 * 24));
    const probability = deal.probability || 0;
    
    if (ageInDays > 90 && probability < 30) return 'High Risk';
    if (ageInDays > 60 && probability < 50) return 'Medium Risk';
    if (probability > 80) return 'Low Risk';
    return 'Normal';
  };

  const calculatePriority = (deal: any) => {
    const value = deal.value || 0;
    const probability = deal.probability || 0;
    const expectedValue = value * probability / 100;
    
    if (expectedValue > 100000) return 'Critical';
    if (expectedValue > 50000) return 'High';
    if (expectedValue > 25000) return 'Medium';
    return 'Low';
  };

  const refreshReport = async () => {
    setRefreshing(true);
    await loadReport();
    setRefreshing(false);
    toast({
      title: "Success",
      description: "Report refreshed with latest data",
    });
  };

  const getKeyMetrics = () => {
    if (!filteredData.length) return {};
    
    const totalValue = filteredData.reduce((sum, item) => sum + (item.Value || 0), 0);
    const avgValue = totalValue / filteredData.length;
    const totalExpectedValue = filteredData.reduce((sum, item) => sum + (item['Expected Value'] || 0), 0);
    const highPriorityDeals = filteredData.filter(item => item.Priority === 'Critical' || item.Priority === 'High').length;
    const closingSoon = filteredData.filter(item => item['Days to Close'] && item['Days to Close'] <= 30).length;
    
    return {
      totalValue,
      avgValue,
      totalExpectedValue,
      highPriorityDeals,
      closingSoon,
      totalDeals: filteredData.length
    };
  };

  const renderSpectacularChart = (chart: ChartData, data: any[]) => {
    const chartData = data.slice(0, 20);

    // Enhanced chart rendering with gradients and animations
    switch (chart.chart_type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0.3}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="Stage" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: 'white'
                }} 
              />
              <Legend />
              <Bar dataKey="Value" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={350}>
            <RechartsLineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="Month" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: 'white'
                }} 
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="Value" 
                stroke="#82ca9d" 
                strokeWidth={3}
                dot={{ fill: '#82ca9d', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: '#82ca9d', strokeWidth: 2, fill: '#fff' }}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        const pieData = Object.entries(
          chartData.reduce((acc, item) => {
            const key = item.Stage || 'Unknown';
            acc[key] = (acc[key] || 0) + (Number(item.Value) || 0);
            return acc;
          }, {} as Record<string, number>)
        ).map(([name, value], index) => ({
          name,
          value,
          fill: COLORS[index % COLORS.length]
        }));

        return (
          <ResponsiveContainer width="100%" height={350}>
            <RechartsPieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                stroke="#fff"
                strokeWidth={2}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any) => [
                  new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0
                  }).format(value),
                  'Value'
                ]}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffc658" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ffc658" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="Month" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: 'white'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="Value" 
                stroke="#ffc658" 
                fill="url(#areaGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      default:
        return <div className="text-center py-8 text-muted-foreground">Chart type not supported</div>;
    }
  };

  const metrics = getKeyMetrics();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4"></div>
                  <div className="h-64 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <Sparkles className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-2">Report not found</h3>
        <p className="text-muted-foreground mb-4">The requested report could not be loaded.</p>
        <Button onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Reports
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Spectacular Header */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-6 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={onBack} className="text-white hover:bg-white/20">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={refreshReport} disabled={refreshing} className="text-white hover:bg-white/20">
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <SpectacularExport
                reportData={filteredData}
                charts={charts}
                reportTitle={report.name}
                reportDescription={report.description}
                onPreview={() => {}}
              />
              <Button onClick={onEdit} className="bg-white text-purple-600 hover:bg-white/90">
                <Sparkles className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-3 mb-2">
            <Star className="h-8 w-8" />
            <h1 className="text-3xl font-bold">{report.name}</h1>
          </div>
          
          {report.description && (
            <p className="text-white/90 text-lg">{report.description}</p>
          )}
          
          <div className="flex flex-wrap gap-2 mt-4">
            {report.data_sources.map(source => (
              <Badge key={source} variant="secondary" className="bg-white/20 text-white border-white/30">
                {source}
              </Badge>
            ))}
            {report.is_public && (
              <Badge className="bg-green-500/20 text-green-100 border-green-400/30">
                <Eye className="h-3 w-3 mr-1" />
                Public Report
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Key Metrics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold text-green-600">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0
                  }).format(metrics.totalValue || 0)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600/20" />
            </div>
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-green-500/10 to-transparent rounded-bl-full"></div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expected</p>
                <p className="text-2xl font-bold text-blue-600">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0
                  }).format(metrics.totalExpectedValue || 0)}
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-600/20" />
            </div>
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full"></div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Deals</p>
                <p className="text-2xl font-bold text-purple-600">{metrics.totalDeals || 0}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-600/20" />
            </div>
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-bl-full"></div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold text-orange-600">{metrics.highPriorityDeals || 0}</p>
              </div>
              <Award className="h-8 w-8 text-orange-600/20" />
            </div>
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-orange-500/10 to-transparent rounded-bl-full"></div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Closing Soon</p>
                <p className="text-2xl font-bold text-red-600">{metrics.closingSoon || 0}</p>
              </div>
              <Calendar className="h-8 w-8 text-red-600/20" />
            </div>
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-red-500/10 to-transparent rounded-bl-full"></div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Value</p>
                <p className="text-2xl font-bold text-teal-600">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0
                  }).format(metrics.avgValue || 0)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-teal-600/20" />
            </div>
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-teal-500/10 to-transparent rounded-bl-full"></div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search across all data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="outline" className="text-sm">
              {filteredData.length} of {tableData.length} records
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Visualizations */}
      <Tabs defaultValue="charts" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="charts" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Spectacular Charts
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <TableIcon className="h-4 w-4" />
            Enhanced Data View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-6">
          {charts.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {charts.map((chart) => (
                <Card key={chart.id} className="relative overflow-hidden shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
                    <CardTitle className="flex items-center gap-2">
                      {chart.chart_type === 'bar' && <BarChart3 className="h-5 w-5 text-blue-600" />}
                      {chart.chart_type === 'line' && <LineChart className="h-5 w-5 text-green-600" />}
                      {chart.chart_type === 'pie' && <PieChart className="h-5 w-5 text-purple-600" />}
                      {chart.chart_type === 'area' && <TrendingUp className="h-5 w-5 text-orange-600" />}
                      {chart.chart_title || `${chart.chart_type.charAt(0).toUpperCase() + chart.chart_type.slice(1)} Chart`}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {renderSpectacularChart(chart, filteredData)}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Sparkles className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Visualizations Yet</h3>
              <p className="text-muted-foreground mb-4">Add charts to make your data come alive!</p>
              <Button onClick={onEdit}>
                <Zap className="h-4 w-4 mr-2" />
                Add Charts
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TableIcon className="h-5 w-5" />
                Enhanced Data Table
                <Badge variant="secondary" className="ml-auto">
                  {filteredData.length} records
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredData.length > 0 ? (
                <ScrollArea className="h-96 rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {Object.keys(filteredData[0]).map((key) => (
                          <TableHead key={key} className="font-semibold bg-slate-50">
                            {key}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.map((row, index) => (
                        <TableRow key={index} className="hover:bg-slate-50/50">
                          {Object.entries(row).map(([key, value], cellIndex) => (
                            <TableCell key={cellIndex} className="font-medium">
                              {key === 'Priority' && (
                                <Badge 
                                  variant={
                                    value === 'Critical' ? 'destructive' :
                                    value === 'High' ? 'default' :
                                    value === 'Medium' ? 'secondary' : 'outline'
                                  }
                                >
                                  {String(value)}
                                </Badge>
                              )}
                              {key === 'Risk Level' && (
                                <Badge 
                                  variant={
                                    value === 'High Risk' ? 'destructive' :
                                    value === 'Medium Risk' ? 'secondary' : 'outline'
                                  }
                                >
                                  {String(value)}
                                </Badge>
                              )}
                              {(key === 'Value' || key === 'Expected Value') && typeof value === 'number' && value > 0 && (
                                <span className="font-semibold text-green-600">
                                  {new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                    minimumFractionDigits: 0
                                  }).format(value)}
                                </span>
                              )}
                              {!['Priority', 'Risk Level', 'Value', 'Expected Value'].includes(key) && (
                                String(value)
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              ) : (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No data matches your search criteria</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SpectacularReportViewer;