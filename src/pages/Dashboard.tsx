import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Users, DollarSign, Target, Calendar, ArrowUpRight, CheckSquare } from 'lucide-react'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [deals, setDeals] = useState([])
  const [tasks, setTasks] = useState([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalDeals, setTotalDeals] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch deals
      const { data: dealsData, error: dealsError } = await supabase
        .from('deals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      if (dealsError) {
        console.error('Error fetching deals:', dealsError)
      } else {
        setDeals(dealsData || [])
        const revenue = dealsData?.reduce((sum, deal) => sum + (Number(deal.value) || 0), 0) || 0
        setTotalRevenue(revenue)
        setTotalDeals(dealsData?.length || 0)
      }

      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', 'pending')
        .order('due_date', { ascending: true })
        .limit(5)

      if (tasksError) {
        console.error('Error fetching tasks:', tasksError)
      } else {
        setTasks(tasksData || [])
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">Welcome back! Here's what's happening with your sales.</p>
        </div>
        <div className="flex gap-3">
          <Button size="sm" variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            This Week
          </Button>
          <Button size="sm">
            <TrendingUp className="h-4 w-4 mr-2" />
            View Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full -translate-y-10 translate-x-10"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Pipeline Value</p>
                </div>
                <p className="text-3xl font-bold">{formatCurrency(totalRevenue)}</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12% from last month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200/30 rounded-full -translate-y-10 translate-x-10"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900/50">
                    <Target className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Active Deals</p>
                </div>
                <p className="text-3xl font-bold">{totalDeals}</p>
                <p className="text-xs text-green-600 flex items-center">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +3 new this week
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/30">
          <div className="absolute top-0 right-0 w-20 h-20 bg-orange-200/30 rounded-full -translate-y-10 translate-x-10"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-orange-100 rounded-lg dark:bg-orange-900/50">
                    <Users className="h-5 w-5 text-orange-600" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Tasks</p>
                </div>
                <p className="text-3xl font-bold">{tasks.length}</p>
                <p className="text-xs text-red-600 flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {tasks.filter(t => new Date(t.due_date) < new Date()).length} overdue
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-200/30 rounded-full -translate-y-10 translate-x-10"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-green-100 rounded-lg dark:bg-green-900/50">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Deal Size</p>
                </div>
                <p className="text-3xl font-bold">{formatCurrency(Math.round(totalRevenue / Math.max(totalDeals, 1)))}</p>
                <p className="text-xs text-green-600 flex items-center">
                  <DollarSign className="h-3 w-3 mr-1" />
                  +8% improvement
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Recent Deals</CardTitle>
                <CardDescription>Latest deals from your pipeline</CardDescription>
              </div>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deals.length > 0 ? deals.map((deal, index) => (
                <div key={deal.id || index} className="flex items-center justify-between p-4 bg-accent/50 rounded-lg border-l-4 border-primary hover:bg-accent/70 transition-colors">
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{deal.name || 'Unnamed Deal'}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        {deal.stage || 'Unknown'}
                      </Badge>
                      <span className="text-sm text-muted-foreground flex items-center">
                        <Target className="h-3 w-3 mr-1" />
                        {deal.probability || 0}% probability
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl text-primary">{formatCurrency(Number(deal.value) || 0)}</p>
                    <p className="text-xs text-muted-foreground">Deal Value</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12 bg-accent/30 rounded-lg border-2 border-dashed border-accent">
                  <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground font-medium">No deals found</p>
                  <p className="text-sm text-muted-foreground mt-1">Create or import deals to see them here</p>
                  <Button size="sm" className="mt-3">Add First Deal</Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Today's Tasks</CardTitle>
                <CardDescription>Upcoming tasks and follow-ups</CardDescription>
              </div>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks.length > 0 ? tasks.map((task, index) => {
                const isOverdue = new Date(task.due_date) < new Date();
                return (
                  <div key={task.id || index} className={`flex items-center justify-between p-4 rounded-lg border-l-4 transition-colors ${
                    isOverdue ? 'bg-red-50 border-red-400 dark:bg-red-950/20' : 'bg-accent/50 border-blue-400 hover:bg-accent/70'
                  }`}>
                    <div className="flex-1">
                      <p className="font-semibold">{task.title}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                          {task.task_type}
                        </Badge>
                        {task.due_date && (
                          <span className={`text-sm flex items-center ${isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                            <Calendar className="h-3 w-3 mr-1" />
                            {isOverdue ? 'Overdue' : 'Due'}: {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-12 bg-accent/30 rounded-lg border-2 border-dashed border-accent">
                  <CheckSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground font-medium">No pending tasks</p>
                  <p className="text-sm text-muted-foreground mt-1">Create or import tasks to see them here</p>
                  <Button size="sm" className="mt-3">Add First Task</Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}