import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  Clock,
  DollarSign,
  Users,
  Building2,
  MoreHorizontal,
  Edit,
  Trash2,
  Play,
  Pause,
  Square,
  FileText,
  Timer,
  Target,
  CheckCircle
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function ProjectManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [currentTimer, setCurrentTimer] = useState("00:00:00")

  const projects = [
    {
      id: "PRJ-001",
      name: "Website Redesign",
      client: "Acme Corp",
      clientInitials: "AC",
      status: "in-progress",
      priority: "high",
      progress: 65,
      startDate: "2024-01-15",
      endDate: "2024-03-15",
      budget: 50000,
      billableRate: 150,
      hoursLogged: 120,
      hoursEstimated: 200,
      teamMembers: ["Sarah J", "Mike C", "Emma W"],
      lastActivity: "2024-01-25T14:30:00",
      phase: "Development"
    },
    {
      id: "PRJ-002", 
      name: "CRM Implementation",
      client: "TechStart Inc",
      clientInitials: "TS",
      status: "planning",
      priority: "medium",
      progress: 15,
      startDate: "2024-02-01",
      endDate: "2024-05-01",
      budget: 75000,
      billableRate: 175,
      hoursLogged: 25,
      hoursEstimated: 300,
      teamMembers: ["David B", "Lisa A"],
      lastActivity: "2024-01-24T16:45:00",
      phase: "Planning"
    },
    {
      id: "PRJ-003",
      name: "Mobile App Development",
      client: "Global Solutions",
      clientInitials: "GS",
      status: "in-progress",
      priority: "high",
      progress: 40,
      startDate: "2024-01-01",
      endDate: "2024-04-30",
      budget: 120000,
      billableRate: 200,
      hoursLogged: 180,
      hoursEstimated: 400,
      teamMembers: ["Sarah J", "Emma W", "John D", "Mike C"],
      lastActivity: "2024-01-25T11:20:00",
      phase: "Development"
    },
    {
      id: "PRJ-004",
      name: "Data Migration",
      client: "Innovation Labs",
      clientInitials: "IL",
      status: "completed",
      priority: "medium",
      progress: 100,
      startDate: "2023-12-01",
      endDate: "2024-01-20",
      budget: 30000,
      billableRate: 125,
      hoursLogged: 95,
      hoursEstimated: 100,
      teamMembers: ["David B"],
      lastActivity: "2024-01-20T17:00:00",
      phase: "Completed"
    },
    {
      id: "PRJ-005",
      name: "Security Audit",
      client: "FutureTech",
      clientInitials: "FT",
      status: "on-hold",
      priority: "low",
      progress: 25,
      startDate: "2024-01-10",
      endDate: "2024-02-28",
      budget: 25000,
      billableRate: 180,
      hoursLogged: 15,
      hoursEstimated: 80,
      teamMembers: ["John D"],
      lastActivity: "2024-01-22T10:15:00",
      phase: "On Hold"
    }
  ]

  const timeEntries = [
    {
      id: "T001",
      project: "PRJ-001",
      projectName: "Website Redesign",
      date: "2024-01-25",
      hours: 6.5,
      description: "Frontend component development",
      billable: true,
      rate: 150,
      teamMember: "Sarah J"
    },
    {
      id: "T002",
      project: "PRJ-003",
      projectName: "Mobile App Development",
      date: "2024-01-25",
      hours: 8,
      description: "API integration testing",
      billable: true,
      rate: 200,
      teamMember: "Mike C"
    },
    {
      id: "T003",
      project: "PRJ-002",
      projectName: "CRM Implementation",
      date: "2024-01-24",
      hours: 4,
      description: "Requirements gathering session",
      billable: true,
      rate: 175,
      teamMember: "David B"
    }
  ]

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || project.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800"
      case "in-progress": return "bg-blue-100 text-blue-800"
      case "planning": return "bg-yellow-100 text-yellow-800"
      case "on-hold": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800"
      case "medium": return "bg-yellow-100 text-yellow-800"
      case "low": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const calculateProjectStats = () => {
    const totalProjects = projects.length
    const activeProjects = projects.filter(p => p.status === 'in-progress').length
    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0)
    const totalHours = projects.reduce((sum, p) => sum + p.hoursLogged, 0)
    const totalBillable = projects.reduce((sum, p) => sum + (p.hoursLogged * p.billableRate), 0)

    return { totalProjects, activeProjects, totalBudget, totalHours, totalBillable }
  }

  const stats = calculateProjectStats()

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Project Management</h1>
          <p className="text-muted-foreground">Track projects, time, and billable hours</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Timer className="h-4 w-4 mr-2" />
            Time Tracker
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">Total Projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{stats.activeProjects}</div>
            <p className="text-xs text-muted-foreground">Active Projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalBudget)}</div>
            <p className="text-xs text-muted-foreground">Total Budget</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.totalHours}h</div>
            <p className="text-xs text-muted-foreground">Hours Logged</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalBillable)}</div>
            <p className="text-xs text-muted-foreground">Total Billable</p>
          </CardContent>
        </Card>
      </div>

      {/* Time Tracker Widget */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Current Session</span>
              </div>
              <div className="text-2xl font-mono font-bold text-blue-600">
                {currentTimer}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select defaultValue="PRJ-001">
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.filter(p => p.status !== 'completed').map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant={isTimerRunning ? "destructive" : "default"}
                onClick={toggleTimer}
              >
                {isTimerRunning ? (
                  <>
                    <Square className="h-4 w-4 mr-2" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="timesheet">Time Tracking</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    placeholder="Search projects..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          {project.id}
                        </Badge>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status.replace("-", " ")}
                        </Badge>
                        <Badge className={getPriorityColor(project.priority)}>
                          {project.priority}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-blue-100 text-blue-800 text-xs">
                            {project.clientInitials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">{project.client}</span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Project
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="h-4 w-4 mr-2" />
                          Generate Invoice
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Budget</p>
                      <p className="font-semibold text-green-600">{formatCurrency(project.budget)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Hours</p>
                      <p className="font-semibold">{project.hoursLogged} / {project.hoursEstimated}h</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Rate</p>
                      <p className="font-semibold">${project.billableRate}/hr</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Phase</p>
                      <p className="font-semibold">{project.phase}</p>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {project.teamMembers.length} team members
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Due {formatDate(project.endDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="timesheet" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Time Entries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{entry.projectName}</p>
                      <p className="text-sm text-muted-foreground">{entry.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{entry.teamMember}</span>
                        <span>{formatDate(entry.date)}</span>
                        <Badge variant={entry.billable ? "default" : "secondary"}>
                          {entry.billable ? "Billable" : "Non-billable"}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">{entry.hours}h</p>
                      {entry.billable && (
                        <p className="text-sm text-green-600">
                          {formatCurrency(entry.hours * entry.rate)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Billing Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {projects.filter(p => p.status !== 'completed').map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{project.name}</p>
                      <p className="text-sm text-muted-foreground">{project.client}</p>
                      <p className="text-xs text-muted-foreground">
                        {project.hoursLogged}h @ ${project.billableRate}/hr
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        {formatCurrency(project.hoursLogged * project.billableRate)}
                      </p>
                      <Button variant="outline" size="sm" className="mt-1">
                        <FileText className="h-3 w-3 mr-1" />
                        Invoice
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Monthly Billables</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                    <p className="text-3xl font-bold text-green-600">
                      {formatCurrency(stats.totalBillable)}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Billable This Month</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-3 bg-muted/50 rounded">
                      <p className="font-semibold">{stats.totalHours}</p>
                      <p className="text-muted-foreground">Hours Logged</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded">
                      <p className="font-semibold">${Math.round(stats.totalBillable / stats.totalHours)}</p>
                      <p className="text-muted-foreground">Avg Rate</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}