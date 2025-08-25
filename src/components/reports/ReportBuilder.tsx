import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import {
  Plus,
  X,
  Save,
  Play,
  Settings,
  Filter,
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp,
  Table,
  Calendar,
  Users,
  Building,
  DollarSign,
  Target,
  Eye,
  EyeOff,
  Copy,
  Download,
  Share,
  Clock
} from 'lucide-react'

interface Field {
  name: string
  label: string
  type: 'text' | 'number' | 'date' | 'boolean' | 'enum'
  enumValues?: string[]
}

interface DataSource {
  name: string
  label: string
  fields: Field[]
}

interface FilterRule {
  id: string
  field: string
  operator: string
  value: any
  logicalOperator: 'AND' | 'OR'
  group: number
}

interface ChartConfig {
  type: string
  title: string
  xField: string
  yField: string
  aggregateFunction: string
}

interface ReportConfig {
  name: string
  description: string
  dataSources: string[]
  selectedFields: string[]
  filters: FilterRule[]
  groupBy: string[]
  sortBy: { field: string; direction: 'asc' | 'desc' }[]
  aggregations: { field: string; function: string }[]
  charts: ChartConfig[]
  isPublic: boolean
}

const dataSources: DataSource[] = [
  {
    name: 'deals',
    label: 'Deals',
    fields: [
      { name: 'name', label: 'Deal Name', type: 'text' },
      { name: 'value', label: 'Deal Value', type: 'number' },
      { name: 'stage', label: 'Stage', type: 'enum', enumValues: ['prospect', 'qualified', 'proposal', 'negotiation', 'closed'] },
      { name: 'probability', label: 'Probability', type: 'number' },
      { name: 'close_date', label: 'Close Date', type: 'date' },
      { name: 'created_at', label: 'Created Date', type: 'date' },
      { name: 'updated_at', label: 'Last Modified', type: 'date' },
    ]
  },
  {
    name: 'contacts',
    label: 'Contacts',
    fields: [
      { name: 'first_name', label: 'First Name', type: 'text' },
      { name: 'last_name', label: 'Last Name', type: 'text' },
      { name: 'email', label: 'Email', type: 'text' },
      { name: 'title', label: 'Job Title', type: 'text' },
      { name: 'department', label: 'Department', type: 'text' },
      { name: 'phone', label: 'Phone', type: 'text' },
      { name: 'created_at', label: 'Created Date', type: 'date' },
    ]
  },
  {
    name: 'accounts',
    label: 'Accounts',
    fields: [
      { name: 'name', label: 'Account Name', type: 'text' },
      { name: 'industry', label: 'Industry', type: 'text' },
      { name: 'size', label: 'Account Size', type: 'text' },
      { name: 'revenue', label: 'Annual Revenue', type: 'text' },
      { name: 'website', label: 'Website', type: 'text' },
      { name: 'phone', label: 'Phone', type: 'text' },
      { name: 'created_at', label: 'Created Date', type: 'date' },
    ]
  }
]

const operators = {
  text: [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'starts_with', label: 'Starts With' },
    { value: 'ends_with', label: 'Ends With' },
    { value: 'is_empty', label: 'Is Empty' },
    { value: 'is_not_empty', label: 'Is Not Empty' }
  ],
  number: [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
    { value: 'between', label: 'Between' },
    { value: 'is_empty', label: 'Is Empty' },
    { value: 'is_not_empty', label: 'Is Not Empty' }
  ],
  date: [
    { value: 'equals', label: 'On' },
    { value: 'greater_than', label: 'After' },
    { value: 'less_than', label: 'Before' },
    { value: 'between', label: 'Between' },
    { value: 'last_7_days', label: 'Last 7 Days' },
    { value: 'last_30_days', label: 'Last 30 Days' },
    { value: 'this_month', label: 'This Month' },
    { value: 'this_year', label: 'This Year' }
  ],
  enum: [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'in', label: 'In' },
    { value: 'not_in', label: 'Not In' }
  ]
}

const chartTypes = [
  { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
  { value: 'line', label: 'Line Chart', icon: LineChart },
  { value: 'pie', label: 'Pie Chart', icon: PieChart },
  { value: 'area', label: 'Area Chart', icon: TrendingUp },
  { value: 'column', label: 'Column Chart', icon: BarChart3 },
]

const aggregateFunctions = [
  { value: 'sum', label: 'Sum' },
  { value: 'count', label: 'Count' },
  { value: 'avg', label: 'Average' },
  { value: 'min', label: 'Minimum' },
  { value: 'max', label: 'Maximum' }
]

interface ReportBuilderProps {
  reportId?: string
  onSave?: (report: any) => void
  onCancel?: () => void
}

export default function ReportBuilder({ reportId, onSave, onCancel }: ReportBuilderProps) {
  const [config, setConfig] = useState<ReportConfig>({
    name: '',
    description: '',
    dataSources: ['deals'],
    selectedFields: [],
    filters: [],
    groupBy: [],
    sortBy: [],
    aggregations: [],
    charts: [],
    isPublic: false
  })
  
  const [previewData, setPreviewData] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (reportId) {
      loadReport(reportId)
    }
  }, [reportId])

  const loadReport = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      if (data) {
        setConfig({
          name: data.name,
          description: data.description || '',
          dataSources: Array.isArray(data.data_sources) ? data.data_sources : ['deals'],
          selectedFields: Array.isArray(data.selected_fields) ? data.selected_fields.map(String) : [],
          filters: [], // Load from report_filters table
          groupBy: Array.isArray(data.group_by_fields) ? data.group_by_fields.map(String) : [],
          sortBy: [],
          aggregations: Object.entries(data.aggregate_functions || {}).map(([field, func]) => ({
            field,
            function: func as string
          })),
          charts: [], // Load from report_charts table
          isPublic: data.is_public || false
        })
      }
    } catch (error) {
      console.error('Error loading report:', error)
      toast({
        title: "Error",
        description: "Failed to load report",
        variant: "destructive"
      })
    }
  }

  const getAvailableFields = () => {
    return dataSources
      .filter(ds => config.dataSources.includes(ds.name))
      .flatMap(ds => ds.fields.map(field => ({
        ...field,
        fullName: `${ds.name}.${field.name}`,
        sourceName: ds.label
      })))
  }

  const addFilter = () => {
    const newFilter: FilterRule = {
      id: Date.now().toString(),
      field: '',
      operator: 'equals',
      value: '',
      logicalOperator: 'AND',
      group: 1
    }
    setConfig(prev => ({
      ...prev,
      filters: [...prev.filters, newFilter]
    }))
  }

  const updateFilter = (id: string, updates: Partial<FilterRule>) => {
    setConfig(prev => ({
      ...prev,
      filters: prev.filters.map(filter => 
        filter.id === id ? { ...filter, ...updates } : filter
      )
    }))
  }

  const removeFilter = (id: string) => {
    setConfig(prev => ({
      ...prev,
      filters: prev.filters.filter(filter => filter.id !== id)
    }))
  }

  const addChart = () => {
    const newChart: ChartConfig = {
      type: 'bar',
      title: 'New Chart',
      xField: '',
      yField: '',
      aggregateFunction: 'sum'
    }
    setConfig(prev => ({
      ...prev,
      charts: [...prev.charts, newChart]
    }))
  }

  const updateChart = (index: number, updates: Partial<ChartConfig>) => {
    setConfig(prev => ({
      ...prev,
      charts: prev.charts.map((chart, i) => 
        i === index ? { ...chart, ...updates } : chart
      )
    }))
  }

  const removeChart = (index: number) => {
    setConfig(prev => ({
      ...prev,
      charts: prev.charts.filter((_, i) => i !== index)
    }))
  }

  const runPreview = async () => {
    setLoading(true)
    try {
      // Build query based on selected data sources and fields
      if (config.dataSources.length === 0) {
        throw new Error('Please select at least one data source')
      }

      // For now, fetch sample data from the first data source
      const tableName = config.dataSources[0] as 'deals' | 'contacts' | 'accounts'
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(10)

      if (error) throw error

      setPreviewData(data || [])
      toast({
        title: "Preview Generated",
        description: `Showing ${data?.length || 0} sample records from ${tableName}`
      })
    } catch (error) {
      console.error('Preview error:', error)
      toast({
        title: "Preview Failed",
        description: error instanceof Error ? error.message : "Failed to generate report preview",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const saveReport = async () => {
    if (!config.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Report name is required",
        variant: "destructive"
      })
      return
    }

    setSaving(true)
    try {
      const reportData = {
        name: config.name,
        description: config.description,
        data_sources: config.dataSources,
        selected_fields: config.selectedFields,
        group_by_fields: config.groupBy,
        aggregate_functions: Object.fromEntries(
          config.aggregations.map(agg => [agg.field, agg.function])
        ),
        sort_fields: config.sortBy,
        is_public: config.isPublic,
        user_id: (await supabase.auth.getUser()).data.user?.id
      }

      const { data, error } = reportId 
        ? await supabase.from('reports').update(reportData).eq('id', reportId).select().single()
        : await supabase.from('reports').insert(reportData).select().single()

      if (error) throw error

      toast({
        title: "Success",
        description: `Report ${reportId ? 'updated' : 'created'} successfully`
      })

      onSave?.(data)
    } catch (error) {
      console.error('Error saving report:', error)
      toast({
        title: "Error",
        description: `Failed to ${reportId ? 'update' : 'create'} report`,
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Report Builder</h2>
          <p className="text-muted-foreground">Create custom reports with advanced filtering and visualization</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={runPreview} disabled={loading}>
            <Play className="h-4 w-4 mr-2" />
            {loading ? 'Running...' : 'Preview'}
          </Button>
          <Button onClick={saveReport} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Report'}
          </Button>
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="fields">Fields</TabsTrigger>
              <TabsTrigger value="filters">Filters</TabsTrigger>
              <TabsTrigger value="grouping">Grouping</TabsTrigger>
              <TabsTrigger value="charts">Charts</TabsTrigger>
            </TabsList>

            {/* Basic Configuration */}
            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="report-name">Report Name *</Label>
                    <Input
                      id="report-name"
                      value={config.name}
                      onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter report name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="report-description">Description</Label>
                    <Input
                      id="report-description"
                      value={config.description}
                      onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter report description"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Data Sources</Label>
                    <div className="space-y-2">
                      {dataSources.map(source => (
                        <div key={source.name} className="flex items-center space-x-2">
                          <Checkbox
                            id={source.name}
                            checked={config.dataSources.includes(source.name)}
                            onCheckedChange={(checked) => {
                              setConfig(prev => ({
                                ...prev,
                                dataSources: checked 
                                  ? [...prev.dataSources, source.name]
                                  : prev.dataSources.filter(ds => ds !== source.name)
                              }))
                            }}
                          />
                          <Label htmlFor={source.name}>{source.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is-public"
                      checked={config.isPublic}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, isPublic: !!checked }))}
                    />
                    <Label htmlFor="is-public">Make this report public</Label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Fields Selection */}
            <TabsContent value="fields" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Select Fields</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {dataSources
                        .filter(ds => config.dataSources.includes(ds.name))
                        .map(source => (
                          <div key={source.name}>
                            <h4 className="font-medium mb-2">{source.label}</h4>
                            <div className="space-y-2 ml-4">
                              {source.fields.map(field => {
                                const fullName = `${source.name}.${field.name}`
                                return (
                                  <div key={fullName} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={fullName}
                                      checked={config.selectedFields.includes(fullName)}
                                      onCheckedChange={(checked) => {
                                        setConfig(prev => ({
                                          ...prev,
                                          selectedFields: checked 
                                            ? [...prev.selectedFields, fullName]
                                            : prev.selectedFields.filter(f => f !== fullName)
                                        }))
                                      }}
                                    />
                                    <Label htmlFor={fullName}>{field.label}</Label>
                                    <Badge variant="outline" className="text-xs">
                                      {field.type}
                                    </Badge>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Filters */}
            <TabsContent value="filters" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Advanced Filters
                    <Button size="sm" onClick={addFilter}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Filter
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {config.filters.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No filters added. Click "Add Filter" to create your first filter.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {config.filters.map((filter, index) => (
                        <div key={filter.id} className="border rounded-lg p-4 space-y-3">
                          {index > 0 && (
                            <Select
                              value={filter.logicalOperator}
                              onValueChange={(value: 'AND' | 'OR') => 
                                updateFilter(filter.id, { logicalOperator: value })
                              }
                            >
                              <SelectTrigger className="w-20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="AND">AND</SelectItem>
                                <SelectItem value="OR">OR</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                          <div className="flex items-center gap-2">
                            <Select
                              value={filter.field}
                              onValueChange={(value) => updateFilter(filter.id, { field: value })}
                            >
                              <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Select field" />
                              </SelectTrigger>
                              <SelectContent>
                                {getAvailableFields().map(field => (
                                  <SelectItem key={field.fullName} value={field.fullName}>
                                    {field.sourceName} - {field.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select
                              value={filter.operator}
                              onValueChange={(value) => updateFilter(filter.id, { operator: value })}
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue placeholder="Operator" />
                              </SelectTrigger>
                              <SelectContent>
                                {(operators.text || []).map(op => (
                                  <SelectItem key={op.value} value={op.value}>
                                    {op.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input
                              value={filter.value}
                              onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                              placeholder="Value"
                              className="flex-1"
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFilter(filter.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Grouping & Aggregation */}
            <TabsContent value="grouping" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Grouping & Aggregation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Group By Fields</Label>
                    <Select
                      onValueChange={(value) => {
                        if (!config.groupBy.includes(value)) {
                          setConfig(prev => ({
                            ...prev,
                            groupBy: [...prev.groupBy, value]
                          }))
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Add group by field" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableFields()
                          .filter(field => !config.groupBy.includes(field.fullName))
                          .map(field => (
                            <SelectItem key={field.fullName} value={field.fullName}>
                              {field.sourceName} - {field.label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-2">
                      {config.groupBy.map(field => (
                        <Badge key={field} variant="secondary">
                          {field}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-4 w-4 p-0 ml-2"
                            onClick={() => setConfig(prev => ({
                              ...prev,
                              groupBy: prev.groupBy.filter(f => f !== field)
                            }))}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Aggregations</Label>
                    <div className="space-y-3">
                      {config.aggregations.map((agg, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Select
                            value={agg.function}
                            onValueChange={(value) => {
                              const newAggs = [...config.aggregations]
                              newAggs[index] = { ...agg, function: value }
                              setConfig(prev => ({ ...prev, aggregations: newAggs }))
                            }}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {aggregateFunctions.map(func => (
                                <SelectItem key={func.value} value={func.value}>
                                  {func.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select
                            value={agg.field}
                            onValueChange={(value) => {
                              const newAggs = [...config.aggregations]
                              newAggs[index] = { ...agg, field: value }
                              setConfig(prev => ({ ...prev, aggregations: newAggs }))
                            }}
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Select field" />
                            </SelectTrigger>
                            <SelectContent>
                              {getAvailableFields()
                                .filter(field => field.type === 'number')
                                .map(field => (
                                  <SelectItem key={field.fullName} value={field.fullName}>
                                    {field.sourceName} - {field.label}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setConfig(prev => ({
                              ...prev,
                              aggregations: prev.aggregations.filter((_, i) => i !== index)
                            }))}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setConfig(prev => ({
                          ...prev,
                          aggregations: [...prev.aggregations, { field: '', function: 'sum' }]
                        }))}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Aggregation
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Charts */}
            <TabsContent value="charts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Chart Configuration
                    <Button size="sm" onClick={addChart}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Chart
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {config.charts.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No charts configured. Click "Add Chart" to create your first visualization.
                    </p>
                  ) : (
                    <div className="space-y-6">
                      {config.charts.map((chart, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <Input
                              value={chart.title}
                              onChange={(e) => updateChart(index, { title: e.target.value })}
                              placeholder="Chart title"
                              className="font-medium"
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeChart(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Chart Type</Label>
                              <Select
                                value={chart.type}
                                onValueChange={(value) => updateChart(index, { type: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {chartTypes.map(type => (
                                    <SelectItem key={type.value} value={type.value}>
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Aggregate Function</Label>
                              <Select
                                value={chart.aggregateFunction}
                                onValueChange={(value) => updateChart(index, { aggregateFunction: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {aggregateFunctions.map(func => (
                                    <SelectItem key={func.value} value={func.value}>
                                      {func.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>X-Axis Field</Label>
                              <Select
                                value={chart.xField}
                                onValueChange={(value) => updateChart(index, { xField: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select X field" />
                                </SelectTrigger>
                                <SelectContent>
                                  {getAvailableFields().map(field => (
                                    <SelectItem key={field.fullName} value={field.fullName}>
                                      {field.sourceName} - {field.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Y-Axis Field</Label>
                              <Select
                                value={chart.yField}
                                onValueChange={(value) => updateChart(index, { yField: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Y field" />
                                </SelectTrigger>
                                <SelectContent>
                                  {getAvailableFields()
                                    .filter(field => field.type === 'number')
                                    .map(field => (
                                      <SelectItem key={field.fullName} value={field.fullName}>
                                        {field.sourceName} - {field.label}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {previewData.length > 0 ? (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {previewData.length} records
                  </div>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {previewData.map((row, index) => (
                        <div key={index} className="p-2 border rounded text-xs">
                          {JSON.stringify(row, null, 2)}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Table className="h-12 w-12 mx-auto mb-4" />
                  <p>No preview data available</p>
                  <p className="text-xs">Click "Preview" to see results</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => alert('Export functionality coming soon!')}>
                <Download className="h-4 w-4 mr-2" />
                Export to Excel
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => alert('Share functionality coming soon!')}>
                <Share className="h-4 w-4 mr-2" />
                Share Report
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => alert('Schedule functionality coming soon!')}>
                <Clock className="h-4 w-4 mr-2" />
                Schedule Report
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => alert('Duplicate functionality coming soon!')}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}