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
        .order('last_accessed_at', { ascending: false })

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

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFolder = filterFolder === 'all' || report.folder_name === filterFolder

    return matchesSearch && matchesFolder
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">All Reports</h1>
        </div>
        <Button onClick={onCreateNew} className="bg-blue-600 hover:bg-blue-700">
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
                <TableRow className="bg-gray-50">
                  <TableHead className="font-medium text-gray-700">Report Name</TableHead>
                  <TableHead className="font-medium text-gray-700">Description</TableHead>
                  <TableHead className="font-medium text-gray-700">Folder</TableHead>
                  <TableHead className="font-medium text-gray-700">Last Accessed Date</TableHead>
                  <TableHead className="font-medium text-gray-700">Created By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow 
                    key={report.id} 
                    className="hover:bg-gray-50 cursor-pointer border-b"
                    onClick={() => handleViewReport(report.id)}
                  >
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="text-blue-600 hover:text-blue-800 font-medium">
                          {report.name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-gray-600">
                      {report.description || '-'}
                    </TableCell>
                    <TableCell className="py-4 text-gray-600">
                      {report.folder_name}
                    </TableCell>
                    <TableCell className="py-4 text-gray-600">
                      {formatDate(report.last_accessed_at)}
                    </TableCell>
                    <TableCell className="py-4 text-gray-600">
                      {report.created_by_name}
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