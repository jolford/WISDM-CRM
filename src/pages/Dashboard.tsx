import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Users, DollarSign, Target, Calendar, ArrowUpRight, CheckSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [deals, setDeals] = useState([])
  const [tasks, setTasks] = useState([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalDeals, setTotalDeals] = useState(0)
  const { toast } = useToast()
  const navigate = useNavigate()

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
            <Card key={i} className="card-spectacular">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="skeleton h-4 rounded w-3/4"></div>
                  <div className="skeleton h-8 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="card-spectacular">
            <CardHeader>
              <div className="skeleton h-6 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="skeleton h-64 rounded"></div>
            </CardContent>
          </Card>
          <Card className="card-spectacular">
            <CardHeader>
              <div className="skeleton h-6 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton h-16 rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
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
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-aurora p-8 text-white shadow-aurora perspective-1000">
        <div className="absolute inset-0 bg-noise opacity-20"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/20 rounded-full blur-xl animate-float"></div>
          <div className="absolute top-20 right-20 w-16 h-16 bg-blue-300/30 rounded-full blur-lg animate-float" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-purple-300/25 rounded-full blur-2xl animate-float" style={{animationDelay: '2s'}}></div>
        </div>
        <div className="relative z-10 flex items-center justify-between transform-3d">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-holographic glow-text">
              Dashboard
            </h1>
            <p className="text-white/90 text-lg max-w-2xl font-medium">
              Welcome back! Here's your spectacular overview of sales performance and business insights.
            </p>
            <div className="flex gap-3">
              <Button variant="glass" size="lg" className="hover-lift btn-glass">
                <Calendar className="h-5 w-5 mr-2" />
                This Week
              </Button>
              <Button variant="spectacular" size="lg" onClick={() => navigate('/sales-reporting')} className="hover-lift btn-spectacular">
                <TrendingUp className="h-5 w-5 mr-2" />
                View Reports
              </Button>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="float-animation perspective-1000">
              <div className="w-32 h-32 bg-white/10 rounded-full backdrop-blur-sm flex items-center justify-center transform-3d hover:rotate-y-12 transition-transform duration-500 shadow-aurora">
                <TrendingUp className="h-16 w-16 text-white/80 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spectacular Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-aurora hover-lift group perspective-1000">
          <div className="absolute inset-0 bg-gradient-aurora/20 rounded-lg blur-sm"></div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300 animate-pulse"></div>
          <CardContent className="relative p-6 transform-3d group-hover:rotateY-3 transition-transform duration-500">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-aurora rounded-xl shadow-aurora relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
                    <DollarSign className="h-6 w-6 text-white relative z-10" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/80">Pipeline Value</p>
                    <p className="text-3xl font-bold text-holographic">{formatCurrency(totalRevenue)}</p>
                  </div>
                </div>
                <p className="text-sm text-white/90 flex items-center font-medium">
                  <TrendingUp className="h-4 w-4 mr-1" />
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

        <Card className="card-spectacular hover-lift group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-chart-3/20 to-chart-3/5 rounded-xl"></div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-chart-3/30 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000"></div>
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-chart-3 to-chart-3/80 rounded-xl shadow-neon relative">
                    <TrendingUp className="h-6 w-6 text-white animate-pulse" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                    <p className="text-3xl font-bold text-gradient-aurora">23.5%</p>
                  </div>
                </div>
                <p className="text-sm text-success flex items-center font-medium">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  +2.3% from last month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Spectacular Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-spectacular hover-lift relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-1/5"></div>
          <CardHeader className="pb-4 relative">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl text-holographic">Recent Deals</CardTitle>
                <CardDescription className="text-muted-foreground/80">Latest deals from your pipeline</CardDescription>
              </div>
              <Button variant="glass" size="sm" onClick={() => navigate('/deals')} className="hover-scale btn-glass shadow-soft">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deals.length > 0 ? deals.map((deal, index) => (
                <div 
                  key={deal.id || index} 
                  className="group flex items-center justify-between p-4 bg-gradient-card rounded-xl border border-border/50 hover:shadow-medium transition-all duration-300 cursor-pointer hover-lift"
                  onClick={() => navigate('/deals')}
                >
                  <div className="flex-1">
                    <p className="font-semibold text-lg group-hover:text-gradient transition-colors">{deal.name || 'Unnamed Deal'}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 shadow-soft">
                        {deal.stage || 'Unknown'}
                      </Badge>
                      <span className="text-sm text-muted-foreground flex items-center">
                        <Target className="h-3 w-3 mr-1" />
                        {deal.probability || 0}% probability
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl text-gradient">{formatCurrency(Number(deal.value) || 0)}</p>
                    <p className="text-xs text-muted-foreground">Deal Value</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12 bg-accent/30 rounded-lg border-2 border-dashed border-accent">
                  <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground font-medium">No deals found</p>
                  <p className="text-sm text-muted-foreground mt-1">Create or import deals to see them here</p>
                  <Button size="sm" className="mt-3" onClick={() => navigate('/deals')}>Add First Deal</Button>
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
              <Button variant="ghost" size="sm" onClick={() => navigate('/tasks')}>View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks.length > 0 ? tasks.map((task, index) => {
                const isOverdue = new Date(task.due_date) < new Date();
                return (
                  <div 
                    key={task.id || index} 
                    className={`flex items-center justify-between p-4 rounded-lg border-l-4 transition-colors cursor-pointer ${
                      isOverdue ? 'bg-red-50 border-red-400 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30' : 'bg-accent/50 border-blue-400 hover:bg-accent/70'
                    }`}
                    onClick={() => navigate('/tasks')}
                  >
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
                  <Button size="sm" className="mt-3" onClick={() => navigate('/tasks')}>Add First Task</Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}