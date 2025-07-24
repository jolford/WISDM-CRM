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
  Building2, 
  Users, 
  Target,
  MoreHorizontal,
  Edit,
  Trash2,
  ExternalLink
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Companies() {
  const [searchQuery, setSearchQuery] = useState("")

  const companies = [
    {
      id: 1,
      name: "Acme Corp",
      industry: "Technology",
      size: "201-500",
      contacts: 12,
      deals: 3,
      revenue: "$150,000",
      status: "Customer",
      website: "acmecorp.com",
      initials: "AC"
    },
    {
      id: 2,
      name: "TechStart Inc",
      industry: "Software",
      size: "51-200",
      contacts: 8,
      deals: 2,
      revenue: "$75,000",
      status: "Prospect",
      website: "techstart.io",
      initials: "TS"
    },
    {
      id: 3,
      name: "Global Solutions",
      industry: "Consulting",
      size: "1001-5000",
      contacts: 25,
      deals: 5,
      revenue: "$300,000",
      status: "Customer",
      website: "globalsol.com",
      initials: "GS"
    },
    {
      id: 4,
      name: "Innovation Labs",
      industry: "Research",
      size: "11-50",
      contacts: 6,
      deals: 1,
      revenue: "$25,000",
      status: "Lead",
      website: "innovlabs.com",
      initials: "IL"
    }
  ]

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.industry.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Customer": return "bg-green-100 text-green-800"
      case "Prospect": return "bg-blue-100 text-blue-800"
      case "Lead": return "bg-yellow-100 text-yellow-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Companies</h1>
          <p className="text-muted-foreground">Manage your business accounts</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Company
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search companies..." 
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

      {/* Companies Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCompanies.map((company) => (
          <Card key={company.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      {company.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl">{company.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-muted-foreground">{company.industry}</p>
                      <span className="text-muted-foreground">•</span>
                      <p className="text-sm text-muted-foreground">{company.size} employees</p>
                    </div>
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
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visit Website
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
              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(company.status)}>
                  {company.status}
                </Badge>
                <span className="text-sm font-medium text-green-600">{company.revenue}</span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-semibold">{company.contacts}</p>
                  <p className="text-xs text-muted-foreground">Contacts</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-semibold">{company.deals}</p>
                  <p className="text-xs text-muted-foreground">Deals</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">{company.website}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}