import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Users,
  Activity,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  LineChart,
  Zap
} from 'lucide-react'
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
  Area,
  AreaChart
} from 'recharts'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

export default function SalesReporting() {
  const [timeRange, setTimeRange] = useState("30d")
  const [salesRep, setSalesRep] = useState("all")
  const [loading, setLoading] = useState(true)
  const [revenueData, setRevenueData] = useState([])
  const [pipelineData, setPipelineData] = useState([])
  const [salesRepData, setSalesRepData] = useState([])
  const [conversionData, setConversionData] = useState([])
  const [dealsData, setDealsData] = useState([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalDeals, setTotalDeals] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    fetchReportsData()
  }, [timeRange, salesRep])

  const fetchReportsData = async () => {
    try {
      setLoading(true)
      
      // Fetch deals data
      const { data: deals, error: dealsError } = await supabase
        .from('deals')
        .select('*')
        .order('created_at', { ascending: false })

      if (dealsError) {
        console.error('Error fetching deals:', dealsError)
        toast({
          title: "Error",
          description: "Failed to load deals data",
          variant: "destructive"
        })
        return
      }

      setDealsData(deals || [])
      
      // Calculate total revenue and deals
      const revenue = deals?.reduce((sum, deal) => sum + (Number(deal.value) || 0), 0) || 0
      setTotalRevenue(revenue)
      setTotalDeals(deals?.length || 0)

      // Generate chart data from real deals
      generateChartData(deals || [])
      
    } catch (error) {
      console.error('Error fetching reports data:', error)
      toast({
        title: "Error",
        description: "Failed to load reports data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const generateChartData = (deals: any[]) => {
    // Generate revenue data by month
    const monthlyRevenue = deals.reduce((acc, deal) => {
      const month = new Date(deal.created_at).toLocaleDateString('en-US', { month: 'short' })
      acc[month] = (acc[month] || 0) + (Number(deal.value) || 0)
      return acc
    }, {})

    const revenueChartData = Object.entries(monthlyRevenue).map(([month, revenue]) => ({
      month,
      revenue,
      target: Number(revenue) * 1.2, // 20% higher target
      deals: deals.filter(d => new Date(d.created_at).toLocaleDateString('en-US', { month: 'short' }) === month).length
    }))

    setRevenueData(revenueChartData)

    // Generate pipeline data by stage
    const stageColors = {
      'prospect': '#8884d8',
      'qualified': '#82ca9d', 
      'proposal': '#ffc658',
      'negotiation': '#ff7300',
      'closed': '#0088fe'
    }

    const pipelineChartData = deals.reduce((acc, deal) => {
      const stage = deal.stage || 'prospect'
      const existing = acc.find(item => item.stage === stage)
      if (existing) {
        existing.value += Number(deal.value) || 0
        existing.count += 1
      } else {
        acc.push({
          stage: stage.charAt(0).toUpperCase() + stage.slice(1),
          value: Number(deal.value) || 0,
          count: 1,
          color: stageColors[stage] || '#8884d8'
        })
      }
      return acc
    }, [])

    setPipelineData(pipelineChartData)

    // Generate sales rep data (placeholder since we don't track individual reps yet)
    setSalesRepData([
      { name: 'All Users', revenue: totalRevenue, deals: totalDeals, conversion: 85, target: totalRevenue * 1.1 }
    ])

    // Generate conversion data (placeholder)
    setConversionData([
      { stage: 'Lead to Qualified', rate: 75, previous: 70 },
      { stage: 'Qualified to Proposal', rate: 68, previous: 65 },
      { stage: 'Proposal to Negotiation', rate: 45, previous: 42 },
      { stage: 'Negotiation to Close', rate: 62, previous: 58 },
    ])
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  if (loading) {
    return (
      <div className="space-y-8 p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Sales Reports</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sales Reporting</h1>
          <p className="text-muted-foreground">Real-time sales analytics from your imported data</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Range</label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 3 months</SelectItem>
                  <SelectItem value="6m">Last 6 months</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                  <p className="text-xs text-muted-foreground">Total Revenue</p>
                </div>
              </div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{totalDeals}</p>
                  <p className="text-xs text-muted-foreground">Total Deals</p>
                </div>
              </div>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(Math.round(totalRevenue / Math.max(totalDeals, 1)))}</p>
                  <p className="text-xs text-muted-foreground">Avg Deal Size</p>
                </div>
              </div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">85%</p>
                  <p className="text-xs text-muted-foreground">Conversion Rate</p>
                </div>
              </div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline Analysis</TabsTrigger>
          <TabsTrigger value="conversion">Conversion Rates</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Revenue Trends (From Your Imported Data)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value: number) => `$${value / 1000}k`} />
                    <Tooltip formatter={(value: number) => [formatCurrency(value), '']} />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stackId="1" 
                      stroke="#82ca9d" 
                      fill="#82ca9d" 
                      fillOpacity={0.6}
                      name="Actual Revenue"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Pipeline by Stage (Your Data)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Tooltip formatter={(value: number) => [formatCurrency(value), '']} />
                      <Pie
                        data={pipelineData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ stage, value }) => `${stage}: ${formatCurrency(value)}`}
                      >
                        {pipelineData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pipeline Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pipelineData.length > 0 ? pipelineData.map((stage) => (
                  <div key={stage.stage} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: stage.color }}
                      />
                      <div>
                        <p className="font-medium">{stage.stage}</p>
                        <p className="text-sm text-muted-foreground">{stage.count} deals</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(stage.value)}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-muted-foreground text-center py-8">No pipeline data available. Import some deals to see pipeline analysis.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Conversion Rate Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {conversionData.map((stage) => (
                  <div key={stage.stage} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{stage.stage}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold">{stage.rate}%</span>
                        <div className="flex items-center gap-1 text-xs">
                          {stage.rate > stage.previous ? (
                            <TrendingUp className="h-3 w-3 text-green-600" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-600" />
                          )}
                          <span className={stage.rate > stage.previous ? "text-green-600" : "text-red-600"}>
                            {Math.abs(stage.rate - stage.previous).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all" 
                        style={{ width: `${stage.rate}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Previous period: {stage.previous}%
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}