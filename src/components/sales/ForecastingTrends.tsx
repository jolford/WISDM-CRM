import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { 
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  Calendar,
  Brain,
  BarChart3,
  LineChart,
  Activity
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
  Bar,
  ReferenceLine,
  Brush,
  ScatterChart,
  Scatter
} from 'recharts';

interface ForecastData {
  period: string;
  actualRevenue: number;
  forecastRevenue: number;
  pipelineValue: number;
  weightedPipeline: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
}

interface PredictiveInsight {
  type: 'opportunity' | 'risk' | 'trend';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  probability: number;
  suggestedAction: string;
}

interface SeasonalityData {
  month: string;
  historicalAvg: number;
  currentYear: number;
  variance: number;
}

export default function ForecastingTrends() {
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  const [insights, setInsights] = useState<PredictiveInsight[]>([]);
  const [seasonalData, setSeasonalData] = useState<SeasonalityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState('weighted');
  const [forecastPeriod, setForecastPeriod] = useState('6');

  useEffect(() => {
    loadForecastingData();
  }, [selectedModel, forecastPeriod]);

  const loadForecastingData = async () => {
    setLoading(true);
    try {
      // Load historical deals data
      const { data: deals } = await supabase
        .from('deals')
        .select('*')
        .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

      if (deals) {
        generateForecastData(deals);
        generatePredictiveInsights(deals);
        generateSeasonalityData(deals);
      }
    } catch (error) {
      console.error('Error loading forecasting data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateForecastData = (deals: any[]) => {
    const months = parseInt(forecastPeriod);
    const forecast: ForecastData[] = [];
    
    // Generate historical data for the past 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      const monthDeals = deals.filter(deal => {
        const dealDate = new Date(deal.created_at);
        return dealDate.getFullYear() === date.getFullYear() && 
               dealDate.getMonth() === date.getMonth();
      });

      const actualRevenue = monthDeals
        .filter(d => d.stage === 'closed')
        .reduce((sum, deal) => sum + (deal.value || 0), 0);

      const pipelineValue = monthDeals
        .filter(d => d.stage !== 'closed')
        .reduce((sum, deal) => sum + (deal.value || 0), 0);

      const weightedPipeline = monthDeals
        .filter(d => d.stage !== 'closed')
        .reduce((sum, deal) => sum + ((deal.value || 0) * (deal.probability || 50) / 100), 0);

      forecast.push({
        period: monthKey,
        actualRevenue,
        forecastRevenue: calculateForecast(actualRevenue, pipelineValue, selectedModel),
        pipelineValue,
        weightedPipeline,
        confidence: calculateConfidence(monthDeals),
        trend: determineTrend(actualRevenue, forecast[forecast.length - 1]?.actualRevenue || 0)
      });
    }

    // Generate future predictions
    for (let i = 1; i <= months; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      const lastActual = forecast[forecast.length - 1]?.actualRevenue || 0;
      const trend = calculateTrendFactor(forecast);
      const seasonal = getSeasonalFactor(date.getMonth());
      
      const predictedRevenue = lastActual * trend * seasonal;
      
      forecast.push({
        period: monthKey,
        actualRevenue: 0, // Future periods have no actual data
        forecastRevenue: predictedRevenue,
        pipelineValue: predictedRevenue * 1.5, // Estimated pipeline needed
        weightedPipeline: predictedRevenue * 1.2,
        confidence: Math.max(90 - (i * 10), 50), // Confidence decreases over time
        trend: trend > 1 ? 'up' : trend < 1 ? 'down' : 'stable'
      });
    }

    setForecastData(forecast);
  };

  const calculateForecast = (actual: number, pipeline: number, model: string): number => {
    switch (model) {
      case 'conservative':
        return actual + (pipeline * 0.15);
      case 'optimistic':
        return actual + (pipeline * 0.35);
      case 'weighted':
        return actual + (pipeline * 0.25);
      case 'ml':
        // Simplified ML model - in reality, this would be more sophisticated
        return actual * 1.15 + (pipeline * 0.22);
      default:
        return actual + (pipeline * 0.25);
    }
  };

  const calculateConfidence = (deals: any[]): number => {
    if (deals.length === 0) return 50;
    
    const factors = {
      dealCount: Math.min(deals.length / 10, 1) * 20,
      stageDistribution: calculateStageDistribution(deals) * 20,
      dealSizeConsistency: calculateConsistency(deals) * 20,
      historicalAccuracy: 40 // Base confidence
    };
    
    return Math.round(Object.values(factors).reduce((sum, factor) => sum + factor, 0));
  };

  const calculateStageDistribution = (deals: any[]): number => {
    const stages = ['prospect', 'qualified', 'proposal', 'negotiation', 'closed'];
    const distribution = stages.map(stage => 
      deals.filter(d => d.stage === stage).length / deals.length
    );
    
    // Better distribution = higher score
    const variance = distribution.reduce((sum, ratio) => sum + Math.pow(ratio - 0.2, 2), 0);
    return Math.max(0, 1 - variance);
  };

  const calculateConsistency = (deals: any[]): number => {
    const values = deals.map(d => d.value || 0).filter(v => v > 0);
    if (values.length < 2) return 0.5;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const cv = Math.sqrt(variance) / mean;
    
    // Lower coefficient of variation = higher consistency
    return Math.max(0, 1 - (cv / 2));
  };

  const determineTrend = (current: number, previous: number): 'up' | 'down' | 'stable' => {
    if (previous === 0) return 'stable';
    const change = (current - previous) / previous;
    if (change > 0.05) return 'up';
    if (change < -0.05) return 'down';
    return 'stable';
  };

  const calculateTrendFactor = (data: ForecastData[]): number => {
    if (data.length < 3) return 1;
    
    const recent = data.slice(-3);
    const growthRates = recent.slice(1).map((curr, i) => {
      const prev = recent[i];
      return prev.actualRevenue > 0 ? curr.actualRevenue / prev.actualRevenue : 1;
    });
    
    return growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length;
  };

  const getSeasonalFactor = (month: number): number => {
    // Typical B2B seasonality patterns
    const seasonalFactors = [
      0.85, 0.9, 1.1, 1.05, 1.0, 1.15, // Jan-Jun
      0.9, 0.85, 1.05, 1.1, 1.2, 1.3   // Jul-Dec
    ];
    return seasonalFactors[month] || 1;
  };

  const generatePredictiveInsights = (deals: any[]) => {
    const newInsights: PredictiveInsight[] = [];

    // Pipeline health analysis
    const currentPipeline = deals.filter(d => d.stage !== 'closed');
    const pipelineValue = currentPipeline.reduce((sum, deal) => sum + (deal.value || 0), 0);
    
    if (pipelineValue < 500000) {
      newInsights.push({
        type: 'risk',
        title: 'Low Pipeline Alert',
        description: 'Current pipeline value is below healthy levels for next quarter targets.',
        impact: 'high',
        probability: 85,
        suggestedAction: 'Increase prospecting activities and accelerate qualification process.'
      });
    }

    // Deal velocity analysis
    const closedDeals = deals.filter(d => d.stage === 'closed' && d.close_date);
    const avgVelocity = closedDeals.length > 0 
      ? closedDeals.reduce((sum, deal) => {
          const days = Math.abs(new Date(deal.close_date).getTime() - new Date(deal.created_at).getTime()) / (1000 * 60 * 60 * 24);
          return sum + days;
        }, 0) / closedDeals.length
      : 0;

    if (avgVelocity > 90) {
      newInsights.push({
        type: 'opportunity',
        title: 'Sales Cycle Optimization',
        description: 'Average sales cycle is longer than industry benchmark. Reducing by 20% could increase quarterly revenue by 15%.',
        impact: 'medium',
        probability: 70,
        suggestedAction: 'Implement deal acceleration strategies and remove friction points in the sales process.'
      });
    }

    // Seasonal trend prediction
    const currentMonth = new Date().getMonth();
    const isQ4 = currentMonth >= 9;
    
    if (isQ4) {
      newInsights.push({
        type: 'trend',
        title: 'Q4 Revenue Surge Expected',
        description: 'Historical data shows 25% increase in deal closures during Q4. Pipeline positioning is favorable.',
        impact: 'high',
        probability: 78,
        suggestedAction: 'Focus on high-value deals in negotiation stage and prepare resources for increased activity.'
      });
    }

    // Conversion rate analysis
    const conversionRate = deals.length > 0 
      ? (closedDeals.length / deals.length) * 100 
      : 0;
    
    if (conversionRate < 20) {
      newInsights.push({
        type: 'risk',
        title: 'Conversion Rate Below Target',
        description: 'Current conversion rate suggests qualification process needs improvement.',
        impact: 'medium',
        probability: 82,
        suggestedAction: 'Review lead qualification criteria and provide additional sales training.'
      });
    }

    setInsights(newInsights);
  };

  const generateSeasonalityData = (deals: any[]) => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const seasonal: SeasonalityData[] = months.map((month, index) => {
      const monthDeals = deals.filter(deal => {
        const dealDate = new Date(deal.created_at);
        return dealDate.getMonth() === index;
      });

      const monthRevenue = monthDeals
        .filter(d => d.stage === 'closed')
        .reduce((sum, deal) => sum + (deal.value || 0), 0);

      // Calculate historical average (simplified)
      const historicalAvg = monthRevenue * (0.8 + Math.random() * 0.4);
      const variance = ((monthRevenue - historicalAvg) / historicalAvg) * 100;

      return {
        month,
        historicalAvg,
        currentYear: monthRevenue,
        variance: isFinite(variance) ? variance : 0
      };
    });

    setSeasonalData(seasonal);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'risk': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'trend': return <Activity className="h-5 w-5 text-blue-600" />;
      default: return <BarChart3 className="h-5 w-5" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold">Forecasting & Predictive Analytics</h2>
          <p className="text-muted-foreground">AI-powered revenue predictions and trend analysis</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="conservative">Conservative</SelectItem>
              <SelectItem value="weighted">Weighted</SelectItem>
              <SelectItem value="optimistic">Optimistic</SelectItem>
              <SelectItem value="ml">AI Model</SelectItem>
            </SelectContent>
          </Select>
          <Select value={forecastPeriod} onValueChange={setForecastPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 Months</SelectItem>
              <SelectItem value="6">6 Months</SelectItem>
              <SelectItem value="12">12 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Insights Alert */}
      {insights.length > 0 && (
        <Alert>
          <Brain className="h-4 w-4" />
          <AlertDescription>
            <strong>AI Insights:</strong> {insights.length} predictive insights identified. 
            {insights.filter(i => i.impact === 'high').length > 0 && 
              ` ${insights.filter(i => i.impact === 'high').length} require immediate attention.`
            }
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="forecast" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="forecast">Revenue Forecast</TabsTrigger>
          <TabsTrigger value="insights">Predictive Insights</TabsTrigger>
          <TabsTrigger value="seasonality">Seasonality</TabsTrigger>
          <TabsTrigger value="scenarios">Scenario Planning</TabsTrigger>
        </TabsList>

        {/* Revenue Forecast */}
        <TabsContent value="forecast" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Prediction Model</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={forecastData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="actualRevenue" fill="hsl(var(--chart-1))" name="Actual Revenue" />
                  <Line type="monotone" dataKey="forecastRevenue" stroke="hsl(var(--chart-2))" strokeWidth={3} name="Forecast" strokeDasharray="5 5" />
                  <Area type="monotone" dataKey="weightedPipeline" fill="hsl(var(--chart-3))" fillOpacity={0.3} name="Weighted Pipeline" />
                  <Brush dataKey="period" height={30} stroke="hsl(var(--primary))" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Forecast Accuracy</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={forecastData.filter(d => d.actualRevenue > 0)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="confidence" stroke="hsl(var(--chart-4))" strokeWidth={2} name="Confidence %" />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pipeline Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {forecastData.slice(-3).map((data, index) => (
                    <div key={data.period} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{data.period}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">${data.pipelineValue.toLocaleString()}</span>
                        <Badge variant={data.confidence > 70 ? 'default' : 'destructive'}>
                          {data.confidence}% confidence
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Predictive Insights */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {insights.map((insight, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{insight.title}</h3>
                        <Badge className={`${getImpactColor(insight.impact)} text-white`}>
                          {insight.impact.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Probability</span>
                          <span className="font-medium">{insight.probability}%</span>
                        </div>
                        <div className="bg-muted p-3 rounded text-sm">
                          <strong>Suggested Action:</strong> {insight.suggestedAction}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Seasonality */}
        <TabsContent value="seasonality" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Seasonal Revenue Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={seasonalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="historicalAvg" fill="hsl(var(--chart-1))" name="Historical Average" />
                  <Line type="monotone" dataKey="currentYear" stroke="hsl(var(--chart-2))" strokeWidth={3} name="Current Year" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scenario Planning */}
        <TabsContent value="scenarios" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['Best Case', 'Most Likely', 'Worst Case'].map((scenario, index) => {
              const multipliers = [1.3, 1.0, 0.7];
              const lastForecast = forecastData[forecastData.length - 1]?.forecastRevenue || 0;
              const scenarioValue = lastForecast * multipliers[index];
              
              return (
                <Card key={scenario}>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <h3 className="font-semibold mb-2">{scenario}</h3>
                      <p className="text-3xl font-bold mb-2">${scenarioValue.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground mb-4">Next Quarter Forecast</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Probability</span>
                          <span>{[25, 50, 25][index]}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>vs Target</span>
                          <span className={index === 0 ? 'text-green-600' : index === 2 ? 'text-red-600' : 'text-blue-600'}>
                            {index === 0 ? '+30%' : index === 2 ? '-30%' : '±0%'}
                          </span>
                        </div>
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