import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { logger } from "@/lib/logger"
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
  last_accessed_at: string
  folder_name: string
  created_by_name: string
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
  const [filterFolder, setFilterFolder] = useState('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [sortField, setSortField] = useState<string>('last_accessed_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const { toast } = useToast()

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      setLoading(true)
      logger.debug('Loading reports', undefined, { context: 'ReportList' })
      
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('last_accessed_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      logger.debug('Reports loaded successfully', { count: data?.length }, { context: 'ReportList' })
      
      // If no reports exist, create some sample reports
      if (!data || data.length === 0) {
        logger.info('Creating sample reports for new user', undefined, { context: 'ReportList' })
        await createSampleReports()
        return
      }

      // Process the reports to ensure they have names
      const processedReports = data.map(report => ({
        ...report,
        name: report.name || `Report ${report.id.substring(0, 8)}`,
        description: report.description || 'No description available',
        folder_name: report.folder_name || 'General Reports',
        created_by_name: report.created_by_name || 'System User',
        data_sources: report.data_sources || ['deals']
      }))
      
      logger.debug('Reports processed', { count: processedReports.length }, { context: 'ReportList' })
      setReports(processedReports)
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

  const createSampleReports = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData.user?.id
      
      if (!userId) {
        console.error('No user found')
        return
      }

      const sampleReports = [
        {
          name: 'Sales Pipeline Report',
          description: 'Overview of all deals in the sales pipeline',
          report_type: 'custom',
          folder_name: 'Sales Reports',
          created_by_name: 'System User',
          data_sources: ['deals'],
          user_id: userId
        },
        {
          name: 'Contact Activity Report',
          description: 'Recent contact interactions and activities',
          report_type: 'custom',
          folder_name: 'Contact Reports',
          created_by_name: 'System User',
          data_sources: ['contacts'],
          user_id: userId
        },
        {
          name: 'Account Summary Report',
          description: 'Summary of all account activities and revenue',
          report_type: 'custom',
          folder_name: 'Account Reports',
          created_by_name: 'System User',
          data_sources: ['accounts'],
          user_id: userId
        }
      ]

      const { data: insertedReports, error } = await supabase
        .from('reports')
        .insert(sampleReports)
        .select()

      if (error) {
        console.error('Error creating sample reports:', error)
        throw error
      }

      logger.info('Sample reports created successfully', { count: insertedReports?.length }, { context: 'ReportList' })
      
      // Reload reports after creating samples
      loadReports()
      
    } catch (error) {
      console.error('Error creating sample reports:', error)
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

  const updateLastAccessed = async (reportId: string) => {
    try {
      await supabase
        .from('reports')
        .update({ last_accessed_at: new Date().toISOString() })
        .eq('id', reportId)
    } catch (error) {
      console.error('Error updating last accessed:', error)
    }
  }

  const handleSort = (field: string) => {
    logger.debug('Sorting reports', { field }, { context: 'ReportList' })
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const filteredReports = reports.filter(report => {
    const matchesSearch = (report.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (report.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFolder = filterFolder === 'all' || report.folder_name === filterFolder

    return matchesSearch && matchesFolder
  }).sort((a, b) => {
    let aValue = a[sortField as keyof Report]
    let bValue = b[sortField as keyof Report]
    
    // Handle null/undefined values
    if (!aValue && !bValue) return 0
    if (!aValue) return sortDirection === 'asc' ? -1 : 1
    if (!bValue) return sortDirection === 'asc' ? 1 : -1
    
    // Convert to string for comparison
    const aStr = String(aValue).toLowerCase()
    const bStr = String(bValue).toLowerCase()
    
    const result = aStr.localeCompare(bStr)
    return sortDirection === 'asc' ? result : -result
  })

  const uniqueFolders = Array.from(new Set(reports.map(r => r.folder_name))).sort()

  const handleViewReport = (reportId: string) => {
    updateLastAccessed(reportId)
    onViewReport(reportId)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-8 bg-muted rounded w-full"></div>
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">All Reports</h1>
        </div>
        <Button onClick={onCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Create Report
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search All Reports"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterFolder} onValueChange={setFilterFolder}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Folders" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Folders</SelectItem>
            {uniqueFolders.map(folder => (
              <SelectItem key={folder} value={folder}>{folder}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Reports Table */}
      {filteredReports.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No reports found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterFolder !== 'all' 
                ? "Try adjusting your search or filter criteria"
                : "Get started by creating your first custom report"}
            </p>
            {!searchTerm && filterFolder === 'all' && (
              <Button onClick={onCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Report
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <TableComponent>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead 
                    className="font-medium cursor-pointer hover:bg-muted/70 select-none"
                    onClick={() => handleSort('name')}
                  >
                    Report Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="font-medium cursor-pointer hover:bg-muted/70 select-none"
                    onClick={() => handleSort('description')}
                  >
                    Description {sortField === 'description' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="font-medium cursor-pointer hover:bg-muted/70 select-none"
                    onClick={() => handleSort('folder_name')}
                  >
                    Folder {sortField === 'folder_name' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="font-medium cursor-pointer hover:bg-muted/70 select-none"
                    onClick={() => handleSort('last_accessed_at')}
                  >
                    Last Accessed Date {sortField === 'last_accessed_at' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="font-medium cursor-pointer hover:bg-muted/70 select-none"
                    onClick={() => handleSort('created_by_name')}
                  >
                    Created By {sortField === 'created_by_name' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="font-medium w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow 
                    key={report.id} 
                    className="hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleViewReport(report.id)}
                  >
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          className="rounded border-border"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="text-primary hover:text-primary/80 font-medium transition-colors">
                          {report.name || 'Unnamed Report'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-muted-foreground">
                      {report.description || '-'}
                    </TableCell>
                    <TableCell className="py-4 text-muted-foreground">
                      {report.folder_name || 'General Reports'}
                    </TableCell>
                    <TableCell className="py-4 text-muted-foreground">
                      {formatDate(report.last_accessed_at)}
                    </TableCell>
                     <TableCell className="py-4 text-muted-foreground">
                      {report.created_by_name || 'System User'}
                    </TableCell>
                    <TableCell className="py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            handleViewReport(report.id)
                          }}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            onEditReport(report.id)
                          }}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            duplicateReport(report)
                          }}>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                className="text-destructive"
                                onSelect={(e) => e.preventDefault()}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the report "{report.name}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteReport(report.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  disabled={deletingId === report.id}
                                >
                                  {deletingId === report.id ? 'Deleting...' : 'Delete'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </TableComponent>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
