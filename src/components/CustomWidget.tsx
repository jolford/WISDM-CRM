import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { MoreHorizontal, Trash2, Edit, TrendingUp, Users, Building2, Target, Ticket } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts'
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface WidgetData {
  id: string
  widget_type: string
  data_source: string
  widget_title: string
  widget_config: any
  position_x: number
  position_y: number
  width: number
  height: number
}

interface CustomWidgetProps {
  widget: WidgetData
  onDelete?: (id: string) => void
  onEdit?: (widget: WidgetData) => void
}

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export function CustomWidget({ widget, onDelete, onEdit }: CustomWidgetProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [metricValue, setMetricValue] = useState<number | string>(0)
  const { toast } = useToast()

  useEffect(() => {
    fetchWidgetData()
  }, [widget])

  const fetchWidgetData = async () => {
    try {
      setLoading(true)
      let query = supabase.from(widget.data_source as 'deals' | 'contacts' | 'accounts' | 'tasks' | 'tickets').select('*')

      const { data: result, error } = await query.limit(100)
      
      if (error) throw error

      setData(result || [])
      calculateMetric(result || [])
    } catch (error) {
      console.error('Error fetching widget data:', error)
      toast({
        title: "Error",
        description: `Failed to load ${widget.widget_title} data`,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateMetric = (data: any[]) => {
    const config = widget.widget_config
    
    switch (config.aggregation) {
      case 'count':
        setMetricValue(data.length)
        break
      case 'sum':
        if (config.metric && data.length > 0) {
          const sum = data.reduce((acc, item) => acc + (Number(item[config.metric]) || 0), 0)
          setMetricValue(sum)
        } else {
          setMetricValue(data.length)
        }
        break
      case 'avg':
        if (config.metric && data.length > 0) {
          const sum = data.reduce((acc, item) => acc + (Number(item[config.metric]) || 0), 0)
          setMetricValue(Math.round(sum / data.length))
        } else {
          setMetricValue(0)
        }
        break
      case 'max':
        if (config.metric && data.length > 0) {
          const max = Math.max(...data.map(item => Number(item[config.metric]) || 0))
          setMetricValue(max)
        } else {
          setMetricValue(0)
        }
        break
      case 'min':
        if (config.metric && data.length > 0) {
          const min = Math.min(...data.map(item => Number(item[config.metric]) || 0))
          setMetricValue(min)
        } else {
          setMetricValue(0)
        }
        break
      default:
        setMetricValue(data.length)
    }
  }

  const getDataSourceIcon = () => {
    switch (widget.data_source) {
      case 'deals': return <Target className="h-4 w-4" />
      case 'contacts': return <Users className="h-4 w-4" />
      case 'accounts': return <Building2 className="h-4 w-4" />
      case 'tickets': return <Ticket className="h-4 w-4" />
      default: return <TrendingUp className="h-4 w-4" />
    }
  }

  const formatValue = (value: number | string) => {
    if (typeof value === 'number') {
      if (widget.data_source === 'deals' && widget.widget_config.aggregation === 'sum') {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(value)
      }
      return value.toLocaleString()
    }
    return value
  }

  const renderMetricWidget = () => (
    <Card className="card-spectacular hover-lift group">
      <div className="absolute inset-0 bg-gradient-primary/10 rounded-lg blur-sm"></div>
      <CardContent className="relative p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div 
                className="p-3 rounded-xl shadow-medium"
                style={{ backgroundColor: widget.widget_config.color }}
              >
                {getDataSourceIcon()}
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{widget.widget_title}</p>
                <p className="text-3xl font-bold text-gradient">
                  {loading ? "..." : formatValue(metricValue)}
                </p>
              </div>
            </div>
            {widget.widget_config.description && (
              <p className="text-xs text-muted-foreground">
                {widget.widget_config.description}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(widget)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => onDelete?.(widget.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )

  const renderChartWidget = () => {
    // Prepare chart data based on data source
    let chartData: any[] = []
    
    if (widget.data_source === 'deals') {
      // Group by stage
      const stageCount = data.reduce((acc, deal) => {
        acc[deal.stage] = (acc[deal.stage] || 0) + 1
        return acc
      }, {})
      chartData = Object.entries(stageCount).map(([stage, count]) => ({
        name: stage.charAt(0).toUpperCase() + stage.slice(1),
        value: count
      }))
    } else {
      // Simple count by month for other data sources
      const monthCount = data.reduce((acc, item) => {
        const month = new Date(item.created_at).toLocaleDateString('en-US', { month: 'short' })
        acc[month] = (acc[month] || 0) + 1
        return acc
      }, {})
      chartData = Object.entries(monthCount).map(([month, count]) => ({
        name: month,
        value: count
      }))
    }

    return (
      <Card className="card-spectacular hover-lift">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {getDataSourceIcon()}
                {widget.widget_title}
              </CardTitle>
              {widget.widget_config.description && (
                <CardDescription>{widget.widget_config.description}</CardDescription>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(widget)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={() => onDelete?.(widget.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            {widget.widget_config.chartType === 'pie' ? (
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            ) : widget.widget_config.chartType === 'line' ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke={widget.widget_config.color} strokeWidth={2} />
              </LineChart>
            ) : widget.widget_config.chartType === 'area' ? (
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke={widget.widget_config.color} fill={widget.widget_config.color} fillOpacity={0.3} />
              </AreaChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill={widget.widget_config.color} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>
    )
  }

  const renderTableWidget = () => (
    <Card className="card-spectacular hover-lift">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {getDataSourceIcon()}
              {widget.widget_title}
            </CardTitle>
            {widget.widget_config.description && (
              <CardDescription>{widget.widget_config.description}</CardDescription>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(widget)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => onDelete?.(widget.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {data.length > 0 && Object.keys(data[0]).slice(0, 3).map((key) => (
                <TableHead key={key} className="text-xs">
                  {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.slice(0, 5).map((item, index) => (
              <TableRow key={index}>
                {Object.values(item).slice(0, 3).map((value: any, i) => (
                  <TableCell key={i} className="text-xs">
                    {typeof value === 'string' && value.length > 30 
                      ? value.substring(0, 30) + '...'
                      : String(value)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {data.length > 5 && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Showing 5 of {data.length} records
          </p>
        )}
      </CardContent>
    </Card>
  )

  const renderProgressWidget = () => (
    <Card className="card-spectacular hover-lift group">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="p-2 rounded-lg"
                style={{ backgroundColor: widget.widget_config.color }}
              >
                {getDataSourceIcon()}
              </div>
              <div>
                <p className="text-sm font-medium">{widget.widget_title}</p>
                <p className="text-xs text-muted-foreground">{widget.widget_config.description}</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(widget)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={() => onDelete?.(widget.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{loading ? "..." : formatValue(metricValue)}</span>
            </div>
            <Progress 
              value={typeof metricValue === 'number' ? Math.min(metricValue, 100) : 0} 
              className="h-2"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderWidget = () => {
    switch (widget.widget_type) {
      case 'metric':
        return renderMetricWidget()
      case 'chart':
        return renderChartWidget()
      case 'table':
        return renderTableWidget()
      case 'progress':
        return renderProgressWidget()
      default:
        return renderMetricWidget()
    }
  }

  return renderWidget()
}