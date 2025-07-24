import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { 
  Plus, 
  Target, 
  Building2, 
  User,
  Calendar,
  DollarSign,
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

export default function Deals() {
  const stages = ["Discovery", "Qualified", "Proposal", "Negotiation", "Closed Won"]
  
  const deals = [
    {
      id: 1,
      name: "Enterprise Platform Upgrade",
      company: "Acme Corp",
      contact: "Sarah Johnson",
      value: 50000,
      stage: "Proposal",
      probability: 75,
      closeDate: "2024-02-15",
      initials: "SJ"
    },
    {
      id: 2,
      name: "Premium Package Implementation",
      company: "TechStart Inc",
      contact: "Michael Chen",
      value: 25000,
      stage: "Negotiation",
      probability: 90,
      closeDate: "2024-01-30",
      initials: "MC"
    },
    {
      id: 3,
      name: "Basic Plan Subscription",
      company: "Global Solutions",
      contact: "Emma Davis",
      value: 12000,
      stage: "Qualified",
      probability: 60,
      closeDate: "2024-03-10",
      initials: "ED"
    },
    {
      id: 4,
      name: "Custom Solution Development",
      company: "Innovation Labs",
      contact: "Robert Kim",
      value: 75000,
      stage: "Discovery",
      probability: 30,
      closeDate: "2024-04-20",
      initials: "RK"
    },
    {
      id: 5,
      name: "Multi-Year Contract",
      company: "FutureTech",
      contact: "Lisa Anderson",
      value: 120000,
      stage: "Proposal",
      probability: 80,
      closeDate: "2024-02-28",
      initials: "LA"
    }
  ]

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "Discovery": return "bg-gray-100 text-gray-800"
      case "Qualified": return "bg-blue-100 text-blue-800"
      case "Proposal": return "bg-yellow-100 text-yellow-800"
      case "Negotiation": return "bg-orange-100 text-orange-800"
      case "Closed Won": return "bg-green-100 text-green-800"
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

  const dealsByStage = stages.map(stage => ({
    stage,
    deals: deals.filter(deal => deal.stage === stage),
    totalValue: deals
      .filter(deal => deal.stage === stage)
      .reduce((sum, deal) => sum + deal.value, 0)
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Deals Pipeline</h1>
          <p className="text-muted-foreground">Track your sales opportunities</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Deal
        </Button>
      </div>

      {/* Pipeline Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {dealsByStage.map((column) => (
          <Card key={column.stage} className="min-h-[600px]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{column.stage}</CardTitle>
                <Badge variant="secondary">{column.deals.length}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(column.totalValue)}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {column.deals.map((deal) => (
                <Card key={deal.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-sm leading-tight">{deal.name}</h4>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MoreHorizontal className="h-3 w-3" />
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
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{deal.company}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Avatar className="h-4 w-4">
                          <AvatarFallback className="text-xs">{deal.initials}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">{deal.contact}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-3 w-3 text-green-600" />
                        <span className="text-sm font-semibold text-green-600">
                          {formatCurrency(deal.value)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {formatDate(deal.closeDate)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Probability</span>
                        <span className="text-xs font-medium">{deal.probability}%</span>
                      </div>
                      <Progress value={deal.probability} className="h-1" />
                    </div>
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}