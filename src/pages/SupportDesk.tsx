import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  Plus, 
  Search, 
  Filter, 
  MessageSquare,
  Clock,
  User,
  Building2,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  XCircle
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

export default function SupportDesk() {
  const [searchQuery, setSearchQuery] = useState("")

  const tickets = [
    {
      id: "TKT-001",
      title: "Login authentication issues",
      description: "Customer unable to access their dashboard after password reset",
      customer: "Sarah Johnson",
      company: "Acme Corp",
      email: "sarah.johnson@acmecorp.com",
      priority: "high",
      status: "open",
      assignee: "John Smith",
      createdAt: "2024-01-24T10:30:00",
      updatedAt: "2024-01-25T14:20:00",
      responses: 3,
      customerInitials: "SJ",
      assigneeInitials: "JS"
    },
    {
      id: "TKT-002", 
      title: "Feature request: Bulk data export",
      description: "Request to add bulk export functionality for contact lists",
      customer: "Michael Chen",
      company: "TechStart Inc",
      email: "m.chen@techstart.io",
      priority: "medium",
      status: "in-progress",
      assignee: "Emma Wilson",
      createdAt: "2024-01-23T09:15:00",
      updatedAt: "2024-01-25T11:45:00",
      responses: 5,
      customerInitials: "MC",
      assigneeInitials: "EW"
    },
    {
      id: "TKT-003",
      title: "Integration setup assistance",
      description: "Need help configuring API integration with existing CRM system",
      customer: "Emma Davis",
      company: "Global Solutions",
      email: "emma.davis@globalsol.com",
      priority: "medium",
      status: "resolved",
      assignee: "David Brown",
      createdAt: "2024-01-22T16:00:00",
      updatedAt: "2024-01-24T13:30:00",
      responses: 8,
      customerInitials: "ED",
      assigneeInitials: "DB"
    },
    {
      id: "TKT-004",
      title: "Performance issues with dashboard",
      description: "Dashboard loading slowly, particularly the analytics section",
      customer: "Robert Kim",
      company: "Innovation Labs",
      email: "robert.kim@innovlabs.com",
      priority: "critical",
      status: "open",
      assignee: "Sarah Tech",
      createdAt: "2024-01-25T08:45:00",
      updatedAt: "2024-01-25T15:10:00",
      responses: 1,
      customerInitials: "RK",
      assigneeInitials: "ST"
    },
    {
      id: "TKT-005",
      title: "Training session request",
      description: "Request for team training on advanced CRM features",
      customer: "Lisa Anderson",
      company: "FutureTech",
      email: "l.anderson@futuretech.com",
      priority: "low",
      status: "closed",
      assignee: "Mike Johnson",
      createdAt: "2024-01-20T14:20:00",
      updatedAt: "2024-01-23T16:45:00",
      responses: 12,
      customerInitials: "LA",
      assigneeInitials: "MJ"
    }
  ]

  const filteredTickets = tickets.filter(ticket =>
    ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-100 text-red-800 border-red-200"
      case "high": return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low": return "bg-green-100 text-green-800 border-green-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-blue-100 text-blue-800"
      case "in-progress": return "bg-purple-100 text-purple-800"
      case "resolved": return "bg-green-100 text-green-800"
      case "closed": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open": return <AlertCircle className="h-4 w-4" />
      case "in-progress": return <Clock className="h-4 w-4" />
      case "resolved": return <CheckCircle className="h-4 w-4" />
      case "closed": return <XCircle className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTicketsByStatus = (status: string) => {
    if (status === "active") {
      return filteredTickets.filter(ticket => ticket.status === "open" || ticket.status === "in-progress")
    }
    return filteredTickets.filter(ticket => ticket.status === status)
  }

  const activeTickets = getTicketsByStatus("active")
  const resolvedTickets = getTicketsByStatus("resolved")
  const closedTickets = getTicketsByStatus("closed")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Support Desk</h1>
          <p className="text-muted-foreground">Manage customer support tickets and inquiries</p>
        </div>
        <Button onClick={() => alert('Create Ticket functionality would open a modal/form here')}>
          <Plus className="h-4 w-4 mr-2" />
          New Ticket
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{activeTickets.length}</div>
            <p className="text-xs text-muted-foreground">Active Tickets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {filteredTickets.filter(t => t.priority === "critical" || t.priority === "high").length}
            </div>
            <p className="text-xs text-muted-foreground">High Priority</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{resolvedTickets.length}</div>
            <p className="text-xs text-muted-foreground">Resolved Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">95%</div>
            <p className="text-xs text-muted-foreground">Satisfaction Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search tickets..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active ({activeTickets.length})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({resolvedTickets.length})</TabsTrigger>
          <TabsTrigger value="closed">Closed ({closedTickets.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeTickets.map((ticket) => (
            <Card key={ticket.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                          {ticket.id}
                        </Badge>
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority} priority
                        </Badge>
                        <Badge className={getStatusColor(ticket.status)}>
                          {getStatusIcon(ticket.status)}
                          <span className="ml-1 capitalize">{ticket.status.replace("-", " ")}</span>
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-lg">{ticket.title}</h3>
                      <p className="text-muted-foreground">{ticket.description}</p>
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
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Resolved
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Customer</p>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-blue-100 text-blue-800">
                            {ticket.customerInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{ticket.customer}</p>
                          <div className="flex items-center gap-1">
                            <Building2 className="h-3 w-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">{ticket.company}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Assigned to</p>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-green-100 text-green-800">
                            {ticket.assigneeInitials}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-sm">{ticket.assignee}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Activity</p>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{ticket.responses} responses</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Updated {formatDate(ticket.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4">
          {resolvedTickets.map((ticket) => (
            <Card key={ticket.id} className="opacity-90">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                          {ticket.id}
                        </Badge>
                        <Badge className={getStatusColor(ticket.status)}>
                          {getStatusIcon(ticket.status)}
                          <span className="ml-1 capitalize">{ticket.status}</span>
                        </Badge>
                      </div>
                      <h3 className="font-semibold">{ticket.title}</h3>
                      <p className="text-sm text-muted-foreground">{ticket.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-blue-100 text-blue-800 text-xs">
                            {ticket.customerInitials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{ticket.customer}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{ticket.company}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Resolved {formatDate(ticket.updatedAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="closed" className="space-y-4">
          {closedTickets.map((ticket) => (
            <Card key={ticket.id} className="opacity-75">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                          {ticket.id}
                        </Badge>
                        <Badge className={getStatusColor(ticket.status)}>
                          {getStatusIcon(ticket.status)}
                          <span className="ml-1 capitalize">{ticket.status}</span>
                        </Badge>
                      </div>
                      <h3 className="font-semibold line-through text-muted-foreground">{ticket.title}</h3>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-gray-100 text-gray-800 text-xs">
                            {ticket.customerInitials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">{ticket.customer}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Closed {formatDate(ticket.updatedAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}