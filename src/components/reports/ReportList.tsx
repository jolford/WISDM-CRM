import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Copy,
  Share,
  Download,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  Table,
  Globe,
  Lock,
  Grid3X3,
  List
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Table as TableComponent,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

interface Report {
  id: string
  name: string
  description: string
  report_type: string
  is_public: boolean
  is_dashboard: boolean
  created_at: string
  updated_at: string
  last_run: string
  data_sources: string[]
}

interface ReportListProps {
  onCreateNew: () => void
  onEditReport: (reportId: string) => void
  onViewReport: (reportId: string) => void
}

export default function ReportList({ onCreateNew, onEditReport, onViewReport }: ReportListProps) {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) throw error
      setReports(data || [])
    } catch (error) {
      console.error('Error loading reports:', error)
      toast({
        title: "Error",
        description: "Failed to load reports",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteReport = async (reportId: string) => {
    try {
      setDeletingId(reportId)
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId)

      if (error) throw error

      setReports(prev => prev.filter(r => r.id !== reportId))
      toast({
        title: "Success",
        description: "Report deleted successfully"
      })
    } catch (error) {
      console.error('Error deleting report:', error)
      toast({
        title: "Error",
        description: "Failed to delete report",
        variant: "destructive"
      })
    } finally {
      setDeletingId(null)
    }
  }

  const duplicateReport = async (report: Report) => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('reports')
        .insert({
          name: `${report.name} (Copy)`,
          description: report.description,
          report_type: report.report_type,
          is_public: false,
          is_dashboard: report.is_dashboard,
          data_sources: report.data_sources,
          user_id: userData.user?.id
        })
        .select()
        .single()

      if (error) throw error

      setReports(prev => [data, ...prev])
      toast({
        title: "Success",
        description: "Report duplicated successfully"
      })
    } catch (error) {
      console.error('Error duplicating report:', error)
      toast({
        title: "Error",
        description: "Failed to duplicate report",
        variant: "destructive"
      })
    }
  }

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'dashboards' && report.is_dashboard) ||
                         (filterType === 'reports' && !report.is_dashboard) ||
                         (filterType === 'public' && report.is_public) ||
                         (filterType === 'private' && !report.is_public)

    return matchesSearch && matchesFilter
  })

  const getReportIcon = (report: Report) => {
    if (report.is_dashboard) return Table
    return BarChart3
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">My Reports</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded w-full"></div>
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
          <h2 className="text-2xl font-bold">My Reports</h2>
          <p className="text-muted-foreground">Manage and create custom reports and dashboards</p>
        </div>
        <Button onClick={onCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Report
        </Button>
      </div>

      {/* Filters and View Toggle */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reports</SelectItem>
              <SelectItem value="reports">Reports Only</SelectItem>
              <SelectItem value="dashboards">Dashboards Only</SelectItem>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as 'grid' | 'list')}>
          <ToggleGroupItem value="grid" aria-label="Grid view">
            <Grid3X3 className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="List view">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Reports Grid */}
      {filteredReports.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No reports found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterType !== 'all' 
                ? "Try adjusting your search or filter criteria"
                : "Get started by creating your first custom report"}
            </p>
            {!searchTerm && filterType === 'all' && (
              <Button onClick={onCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Report
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => {
            const IconComponent = getReportIcon(report)
            return (
              <Card key={report.id} className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary/20 hover:border-l-primary">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex items-center gap-2">
                        {report.is_public ? (
                          <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-full">
                            <Globe className="h-3 w-3 text-green-600" />
                            <span className="text-xs text-green-700 font-medium">Public</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-full">
                            <Lock className="h-3 w-3 text-gray-600" />
                            <span className="text-xs text-gray-700 font-medium">Private</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-background border shadow-md">
                        <DropdownMenuItem onClick={() => onViewReport(report.id)} className="cursor-pointer">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditReport(report.id)} className="cursor-pointer">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => duplicateReport(report)} className="cursor-pointer">
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer">
                          <Share className="h-4 w-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive cursor-pointer"
                              onSelect={(e) => e.preventDefault()}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Report</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{report.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteReport(report.id)}
                                disabled={deletingId === report.id}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {deletingId === report.id ? 'Deleting...' : 'Delete'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                      {report.name}
                    </CardTitle>
                    {report.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {report.description}
                      </p>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-1.5">
                      {Array.isArray(report.data_sources) && report.data_sources.map(source => (
                        <Badge key={source} variant="secondary" className="text-xs font-medium px-2 py-1">
                          {source}
                        </Badge>
                      ))}
                      {report.is_dashboard && (
                        <Badge variant="outline" className="text-xs font-medium px-2 py-1 border-primary/20 text-primary">
                          Dashboard
                        </Badge>
                      )}
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div className="flex justify-between">
                          <span>Created:</span>
                          <span className="font-medium">{formatDate(report.created_at)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Updated:</span>
                          <span className="font-medium">{formatDate(report.updated_at)}</span>
                        </div>
                        {report.last_run && (
                          <div className="flex justify-between">
                            <span>Last run:</span>
                            <span className="font-medium">{formatDate(report.last_run)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        className="flex-1 font-medium"
                        onClick={() => onViewReport(report.id)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 font-medium hover:bg-primary hover:text-primary-foreground"
                        onClick={() => onEditReport(report.id)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <TableComponent>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Data Sources</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => {
                  const IconComponent = getReportIcon(report)
                  return (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4 text-primary" />
                          <div>
                            <div className="font-medium">{report.name}</div>
                            {report.description && (
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {report.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {report.is_dashboard && (
                            <Badge variant="outline" className="text-xs">
                              Dashboard
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            {report.report_type}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(report.data_sources) && report.data_sources.map(source => (
                            <Badge key={source} variant="outline" className="text-xs">
                              {source}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {report.is_public ? (
                            <>
                              <Globe className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-green-600">Public</span>
                            </>
                          ) : (
                            <>
                              <Lock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">Private</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(report.updated_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => onViewReport(report.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => onEditReport(report.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => duplicateReport(report)}>
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Share className="h-4 w-4 mr-2" />
                                Share
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                Export
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Calendar className="h-4 w-4 mr-2" />
                                Schedule
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onSelect={(e) => e.preventDefault()}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Report</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{report.name}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteReport(report.id)}
                                      disabled={deletingId === report.id}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      {deletingId === report.id ? 'Deleting...' : 'Delete'}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </TableComponent>
          </CardContent>
        </Card>
      )}
    </div>
  )
}