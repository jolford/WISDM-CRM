import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"

interface WidgetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface WidgetConfig {
  title: string
  description?: string
  metric?: string
  chartType?: string
  filters?: Record<string, any>
  aggregation?: string
  color?: string
  [key: string]: any
}

export function WidgetDialog({ open, onOpenChange, onSuccess }: WidgetDialogProps) {
  const [loading, setLoading] = useState(false)
  const [widgetType, setWidgetType] = useState("")
  const [dataSource, setDataSource] = useState("")
  const [config, setConfig] = useState<WidgetConfig>({
    title: "",
    description: "",
    metric: "",
    chartType: "bar",
    aggregation: "count",
    color: "#8b5cf6"
  })
  const { toast } = useToast()
  const { user } = useAuth()

  const resetForm = () => {
    setWidgetType("")
    setDataSource("")
    setConfig({
      title: "",
      description: "",
      metric: "",
      chartType: "bar",
      aggregation: "count",
      color: "#8b5cf6"
    })
  }

  const handleSubmit = async () => {
    if (!user?.id || !widgetType || !dataSource || !config.title) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      // Create a default dashboard report if none exists
      const { data: existingDashboard, error: dashboardError } = await supabase
        .from('reports')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_dashboard', true)
        .maybeSingle()

      let dashboardId = existingDashboard?.id

      if (!dashboardId) {
        const { data: newDashboard, error: createError } = await supabase
          .from('reports')
          .insert([{
            name: 'My Dashboard',
            description: 'Custom dashboard with widgets',
            user_id: user.id,
            is_dashboard: true,
            data_sources: [dataSource]
          }])
          .select('id')
          .single()

        if (createError) throw createError
        dashboardId = newDashboard.id
      }

      // Find next available position
      const { data: existingWidgets } = await supabase
        .from('dashboard_widgets')
        .select('position_x, position_y')
        .eq('dashboard_id', dashboardId)

      let nextX = 0
      let nextY = 0
      if (existingWidgets && existingWidgets.length > 0) {
        const maxX = Math.max(...existingWidgets.map(w => w.position_x + 4))
        nextX = maxX >= 12 ? 0 : maxX
        if (nextX === 0) {
          nextY = Math.max(...existingWidgets.map(w => w.position_y)) + 6
        }
      }

      const { error } = await supabase
        .from('dashboard_widgets')
        .insert([{
          dashboard_id: dashboardId,
          widget_type: widgetType,
          data_source: dataSource,
          widget_title: config.title,
          widget_config: config as Record<string, any>,
          position_x: nextX,
          position_y: nextY,
          width: 6,
          height: 4
        }])

      if (error) throw error

      toast({
        title: "Success",
        description: "Widget created successfully!"
      })

      resetForm()
      onOpenChange(false)
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error('Error creating widget:', error)
      toast({
        title: "Error",
        description: "Failed to create widget",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Custom Widget</DialogTitle>
          <DialogDescription>
            Add a new widget to your dashboard to track the metrics that matter most.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="widget_type">Widget Type</Label>
            <Select value={widgetType} onValueChange={setWidgetType}>
              <SelectTrigger>
                <SelectValue placeholder="Select widget type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="metric">KPI Metric</SelectItem>
                <SelectItem value="chart">Chart</SelectItem>
                <SelectItem value="table">Data Table</SelectItem>
                <SelectItem value="progress">Progress Bar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="data_source">Data Source</Label>
            <Select value={dataSource} onValueChange={setDataSource}>
              <SelectTrigger>
                <SelectValue placeholder="Select data source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="deals">Deals</SelectItem>
                <SelectItem value="contacts">Contacts</SelectItem>
                <SelectItem value="accounts">Accounts</SelectItem>
                <SelectItem value="tasks">Tasks</SelectItem>
                <SelectItem value="tickets">Support Tickets</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="title">Widget Title</Label>
            <Input
              id="title"
              value={config.title}
              onChange={(e) => setConfig(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Monthly Revenue"
            />
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={config.description || ""}
              onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of what this widget shows"
              rows={2}
            />
          </div>

          {widgetType === "metric" && (
            <div>
              <Label htmlFor="aggregation">Aggregation</Label>
              <Select 
                value={config.aggregation} 
                onValueChange={(value) => setConfig(prev => ({ ...prev, aggregation: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="count">Count</SelectItem>
                  <SelectItem value="sum">Sum</SelectItem>
                  <SelectItem value="avg">Average</SelectItem>
                  <SelectItem value="max">Maximum</SelectItem>
                  <SelectItem value="min">Minimum</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {widgetType === "chart" && (
            <div>
              <Label htmlFor="chart_type">Chart Type</Label>
              <Select 
                value={config.chartType} 
                onValueChange={(value) => setConfig(prev => ({ ...prev, chartType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="pie">Pie Chart</SelectItem>
                  <SelectItem value="area">Area Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="color">Widget Color</Label>
            <Input
              id="color"
              type="color"
              value={config.color}
              onChange={(e) => setConfig(prev => ({ ...prev, color: e.target.value }))}
              className="w-full h-10"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleSubmit}
            disabled={loading || !widgetType || !dataSource || !config.title}
            className="flex-1"
          >
            {loading ? "Creating..." : "Create Widget"}
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}