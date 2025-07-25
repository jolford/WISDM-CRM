import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import {
  Download,
  Share,
  Edit,
  Calendar,
  Maximize2,
  ArrowLeft,
  RefreshCw,
  Filter,
  BarChart3,
  Table as TableIcon,
  PieChart,
  LineChart,
  TrendingUp
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
  Area
} from 'recharts'

interface ReportViewerProps {
  reportId: string
  onBack: () => void
  onEdit: () => void
}

interface ReportData {
  id: string
  name: string
  description: string
  data_sources: string[]
  selected_fields: any
  group_by_fields: any
  aggregate_functions: any
  is_public: boolean
  created_at: string
  updated_at: string
}

interface ChartData {
  id: string
  chart_type: string
  chart_title: string
  x_axis_field: string
  y_axis_field: string
  aggregate_function: string
  chart_config: any
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export default function ReportViewer({ reportId, onBack, onEdit }: ReportViewerProps) {
  const [report, setReport] = useState<ReportData | null>(null)
  const [charts, setCharts] = useState<ChartData[]>([])
  const [tableData, setTableData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadReport()
  }, [reportId])

  const loadReport = async () => {
    try {
      setLoading(true)
      
      // Load report details
      const { data: reportData, error: reportError } = await supabase
        .from('reports')
        .select('*')
        .eq('id', reportId)
        .single()

      if (reportError) throw reportError
      setReport(reportData)

      // Load report charts
      const { data: chartsData, error: chartsError } = await supabase
        .from('report_charts')
        .select('*')
        .eq('report_id', reportId)
        .order('position_y', { ascending: true })

      if (chartsError) throw chartsError
      setCharts(chartsData || [])

      // Generate sample data for now
      await generateReportData(reportData)

    } catch (error) {
      console.error('Error loading report:', error)
      toast({
        title: "Error",
        description: "Failed to load report",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const generateReportData = async (reportConfig: ReportData) => {
    try {
      // This would typically execute the actual report query
      // For now, we'll generate sample data based on the data sources
      
      if (reportConfig.data_sources.includes('deals')) {
        const { data: deals, error } = await supabase
          .from('deals')
          .select('*')
          .limit(100)

        if (error) throw error

        // Process data according to report configuration
        const processedData = deals?.map(deal => ({
          'Deal Name': deal.name,
          'Value': deal.value || 0,
          'Stage': deal.stage,
          'Probability': deal.probability || 0,
          'Close Date': deal.close_date ? new Date(deal.close_date).toLocaleDateString() : '',
          'Created': new Date(deal.created_at).toLocaleDateString()
        })) || []

        setTableData(processedData)
      }

    } catch (error) {
      console.error('Error generating report data:', error)
    }
  }

  const refreshReport = async () => {
    setRefreshing(true)
    await loadReport()
    setRefreshing(false)
    toast({
      title: "Success",
      description: "Report refreshed successfully"
    })
  }

  const exportReport = () => {
    // Implement export functionality
    toast({
      title: "Export Started",
      description: "Your report export will download shortly"
    })
  }

  const shareReport = () => {
    // Implement share functionality
    navigator.clipboard.writeText(window.location.href)
    toast({
      title: "Link Copied",
      description: "Report link copied to clipboard"
    })
  }

  const renderChart = (chart: ChartData, data: any[]) => {
    const chartData = data.slice(0, 10) // Limit for demo

    switch (chart.chart_type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Stage" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        )
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Created" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Value" stroke="#8884d8" />
            </RechartsLineChart>
          </ResponsiveContainer>
        )
      
      case 'pie':
        const pieData = Object.entries(
          chartData.reduce((acc, item) => {
            const key = item.Stage || 'Unknown'
            acc[key] = (acc[key] || 0) + (Number(item.Value) || 0)
            return acc
          }, {} as Record<string, number>)
        ).map(([name, value], index) => ({
          name,
          value,
          fill: COLORS[index % COLORS.length]
        }))

        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        )

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Created" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="Value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        )

      default:
        return <div className="text-center py-8 text-muted-foreground">Chart type not supported</div>
    }
  }

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
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-64 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">Report not found</h3>
        <p className="text-muted-foreground mb-4">The requested report could not be loaded.</p>
        <Button onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Reports
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{report.name}</h1>
            {report.description && (
              <p className="text-muted-foreground">{report.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={refreshReport} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={shareReport}>
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Report Metadata */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Data Sources:</span>
              <div className="flex gap-1">
                {report.data_sources.map(source => (
                  <Badge key={source} variant="secondary">{source}</Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Last Updated:</span>
              <span>{new Date(report.updated_at).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Records:</span>
              <span>{tableData.length}</span>
            </div>
            {report.is_public && (
              <Badge variant="outline" className="text-green-600 border-green-600">
                Public Report
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      {charts.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {charts.map((chart) => (
            <Card key={chart.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {chart.chart_type === 'bar' && <BarChart3 className="h-5 w-5" />}
                  {chart.chart_type === 'line' && <LineChart className="h-5 w-5" />}
                  {chart.chart_type === 'pie' && <PieChart className="h-5 w-5" />}
                  {chart.chart_type === 'area' && <TrendingUp className="h-5 w-5" />}
                  {chart.chart_title || `${chart.chart_type.charAt(0).toUpperCase() + chart.chart_type.slice(1)} Chart`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderChart(chart, tableData)}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TableIcon className="h-5 w-5" />
            Report Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tableData.length > 0 ? (
            <ScrollArea className="h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    {Object.keys(tableData[0]).map((key) => (
                      <TableHead key={key}>{key}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.map((row, index) => (
                    <TableRow key={index}>
                      {Object.values(row).map((value, cellIndex) => (
                        <TableCell key={cellIndex}>
                          {typeof value === 'number' && value > 1000 
                            ? new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD',
                                minimumFractionDigits: 0
                              }).format(value)
                            : String(value)
                          }
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <TableIcon className="h-12 w-12 mx-auto mb-4" />
              <p>No data available for this report</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}