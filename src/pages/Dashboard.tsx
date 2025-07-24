import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  Building2, 
  Target, 
  TrendingUp, 
  Calendar,
  Phone,
  Mail,
  Plus
} from "lucide-react"

export default function Dashboard() {
  const stats = [
    { title: "Total Contacts", value: "2,847", change: "+12%", icon: Users, color: "text-blue-600" },
    { title: "Active Deals", value: "124", change: "+8%", icon: Target, color: "text-green-600" },
    { title: "Companies", value: "856", change: "+5%", icon: Building2, color: "text-purple-600" },
    { title: "Revenue", value: "$1.2M", change: "+15%", icon: TrendingUp, color: "text-orange-600" },
  ]

  const recentDeals = [
    { name: "Acme Corp - Enterprise Plan", value: "$50,000", stage: "Proposal", probability: 75 },
    { name: "TechStart Inc - Premium", value: "$25,000", stage: "Negotiation", probability: 90 },
    { name: "Global Solutions - Basic", value: "$12,000", stage: "Qualified", probability: 60 },
    { name: "Innovation Labs - Custom", value: "$75,000", stage: "Discovery", probability: 30 },
  ]

  const todayTasks = [
    { task: "Follow up with Acme Corp", type: "call", time: "10:00 AM" },
    { task: "Send proposal to TechStart", type: "email", time: "2:00 PM" },
    { task: "Demo with Global Solutions", type: "meeting", time: "4:00 PM" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Deal
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stat.change}</span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Deals */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Deals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentDeals.map((deal, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{deal.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">{deal.stage}</Badge>
                    <span className="text-sm text-muted-foreground">{deal.probability}% probability</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">{deal.value}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Today's Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {todayTasks.map((task, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="flex-shrink-0">
                  {task.type === 'call' && <Phone className="h-4 w-4 text-blue-600" />}
                  {task.type === 'email' && <Mail className="h-4 w-4 text-green-600" />}
                  {task.type === 'meeting' && <Calendar className="h-4 w-4 text-purple-600" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{task.task}</p>
                  <p className="text-sm text-muted-foreground">{task.time}</p>
                </div>
                <Button variant="outline" size="sm">Complete</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}