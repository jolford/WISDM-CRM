import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  Plus, 
  Calendar, 
  Phone, 
  Mail, 
  Users,
  Building2,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2
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

export default function Tasks() {
  const [completedTasks, setCompletedTasks] = useState<number[]>([])

  const tasks = [
    {
      id: 1,
      title: "Follow up with Acme Corp on proposal",
      description: "Discuss implementation timeline and pricing details",
      type: "call",
      priority: "high",
      dueDate: "2024-01-25",
      contact: "Sarah Johnson",
      company: "Acme Corp",
      initials: "SJ",
      completed: false
    },
    {
      id: 2,
      title: "Send contract to TechStart Inc",
      description: "Email final contract with updated terms",
      type: "email",
      priority: "medium",
      dueDate: "2024-01-26",
      contact: "Michael Chen",
      company: "TechStart Inc",
      initials: "MC",
      completed: false
    },
    {
      id: 3,
      title: "Product demo for Global Solutions",
      description: "30-minute demo focusing on enterprise features",
      type: "meeting",
      priority: "high",
      dueDate: "2024-01-27",
      contact: "Emma Davis",
      company: "Global Solutions",
      initials: "ED",
      completed: false
    },
    {
      id: 4,
      title: "Prepare proposal for Innovation Labs",
      description: "Custom solution requirements analysis",
      type: "task",
      priority: "medium",
      dueDate: "2024-01-28",
      contact: "Robert Kim",
      company: "Innovation Labs",
      initials: "RK",
      completed: false
    },
    {
      id: 5,
      title: "Check in with FutureTech progress",
      description: "Weekly status call on implementation",
      type: "call",
      priority: "low",
      dueDate: "2024-01-29",
      contact: "Lisa Anderson",
      company: "FutureTech",
      initials: "LA",
      completed: true
    }
  ]

  const handleTaskComplete = (taskId: number) => {
    setCompletedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    )
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800"
      case "medium": return "bg-yellow-100 text-yellow-800"
      case "low": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "call": return <Phone className="h-4 w-4" />
      case "email": return <Mail className="h-4 w-4" />
      case "meeting": return <Calendar className="h-4 w-4" />
      default: return <Users className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "call": return "text-blue-600"
      case "email": return "text-green-600"
      case "meeting": return "text-purple-600"
      default: return "text-gray-600"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const activeTasks = tasks.filter(task => !task.completed && !completedTasks.includes(task.id))
  const doneTasks = [...tasks.filter(task => task.completed), ...tasks.filter(task => completedTasks.includes(task.id))]
  
  const overdueTasks = activeTasks.filter(task => new Date(task.dueDate) < new Date())
  const todayTasks = activeTasks.filter(task => {
    const today = new Date().toDateString()
    return new Date(task.dueDate).toDateString() === today
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">Manage your follow-ups and activities</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{activeTasks.length}</div>
            <p className="text-xs text-muted-foreground">Active Tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{overdueTasks.length}</div>
            <p className="text-xs text-muted-foreground">Overdue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{todayTasks.length}</div>
            <p className="text-xs text-muted-foreground">Due Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{doneTasks.length}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Tasks Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active ({activeTasks.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({doneTasks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeTasks.map((task) => (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Checkbox 
                    checked={completedTasks.includes(task.id)}
                    onCheckedChange={() => handleTaskComplete(task.id)}
                    className="mt-1"
                  />
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-medium">{task.title}</h3>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
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
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center gap-1 ${getTypeColor(task.type)}`}>
                        {getTypeIcon(task.type)}
                        <span className="text-sm capitalize">{task.type}</span>
                      </div>
                      
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority} priority
                      </Badge>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {formatDate(task.dueDate)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">{task.initials}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{task.contact}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{task.company}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {doneTasks.map((task) => (
            <Card key={task.id} className="opacity-75">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Checkbox checked={true} disabled />
                  
                  <div className="flex-1 space-y-3">
                    <div className="space-y-1">
                      <h3 className="font-medium line-through text-muted-foreground">{task.title}</h3>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center gap-1 ${getTypeColor(task.type)}`}>
                        {getTypeIcon(task.type)}
                        <span className="text-sm capitalize">{task.type}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">{task.initials}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{task.contact}</span>
                      </div>
                    </div>
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