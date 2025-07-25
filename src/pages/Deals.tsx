import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { 
  Plus, 
  Target, 
  Building2, 
  User,
  Calendar,
  DollarSign,
  MoreHorizontal,
  Edit,
  Trash2,
  Loader2
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Deal {
  id: string
  name: string
  value: number | null
  stage: string
  probability: number | null
  close_date: string | null
  created_at: string
  company_id: string | null
  contact_id: string | null
}

interface Company {
  id: string
  name: string
}

interface Contact {
  id: string
  first_name: string
  last_name: string
}

export default function Deals() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const stages = ["prospect", "qualified", "proposal", "negotiation", "closed"]
  
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch all data in parallel
      const [dealsResult, companiesResult, contactsResult] = await Promise.all([
        supabase.from('deals').select('*').order('created_at', { ascending: false }),
        supabase.from('companies').select('id, name'),
        supabase.from('contacts').select('id, first_name, last_name')
      ])

      if (dealsResult.error) throw dealsResult.error
      if (companiesResult.error) throw companiesResult.error
      if (contactsResult.error) throw contactsResult.error

      setDeals(dealsResult.data || [])
      setCompanies(companiesResult.data || [])
      setContacts(contactsResult.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: "Error",
        description: "Failed to load deals data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "prospect": return "bg-gray-100 text-gray-800"
      case "qualified": return "bg-blue-100 text-blue-800"
      case "proposal": return "bg-yellow-100 text-yellow-800"
      case "negotiation": return "bg-orange-100 text-orange-800"
      case "closed": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStageDisplayName = (stage: string) => {
    return stage.charAt(0).toUpperCase() + stage.slice(1)
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "$0"
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No date set"
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getCompanyName = (companyId: string | null) => {
    if (!companyId) return "No company"
    const company = companies.find(c => c.id === companyId)
    return company?.name || "Unknown company"
  }

  const getContactName = (contactId: string | null) => {
    if (!contactId) return "No contact"
    const contact = contacts.find(c => c.id === contactId)
    return contact ? `${contact.first_name} ${contact.last_name}` : "Unknown contact"
  }

  const getContactInitials = (contactId: string | null) => {
    if (!contactId) return "NC"
    const contact = contacts.find(c => c.id === contactId)
    if (!contact) return "UK"
    return `${contact.first_name?.[0] || ''}${contact.last_name?.[0] || ''}`.toUpperCase()
  }

  const deleteDeal = async (dealId: string) => {
    try {
      const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', dealId)

      if (error) throw error

      setDeals(prev => prev.filter(d => d.id !== dealId))
      toast({
        title: "Success",
        description: "Deal deleted successfully"
      })
    } catch (error) {
      console.error('Error deleting deal:', error)
      toast({
        title: "Error",
        description: "Failed to delete deal",
        variant: "destructive"
      })
    }
  }

  const dealsByStage = stages.map(stage => ({
    stage,
    deals: deals.filter(deal => deal.stage === stage),
    totalValue: deals
      .filter(deal => deal.stage === stage)
      .reduce((sum, deal) => sum + (deal.value || 0), 0)
  }))

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Deals Pipeline</h1>
            <p className="text-muted-foreground">Track your sales opportunities</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Deals Pipeline</h1>
          <p className="text-muted-foreground">Track your sales opportunities from your imported data</p>
        </div>
        <Button onClick={() => alert('Create Deal functionality would open a modal/form here')}>
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
                <CardTitle className="text-sm font-medium">{getStageDisplayName(column.stage)}</CardTitle>
                <Badge variant="secondary">{column.deals.length}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(column.totalValue)}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {column.deals.length > 0 ? (
                column.deals.map((deal) => (
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
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => deleteDeal(deal.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {getCompanyName(deal.company_id)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Avatar className="h-4 w-4">
                            <AvatarFallback className="text-xs">
                              {getContactInitials(deal.contact_id)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            {getContactName(deal.contact_id)}
                          </span>
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
                            {formatDate(deal.close_date)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Probability</span>
                          <span className="text-xs font-medium">{deal.probability || 0}%</span>
                        </div>
                        <Progress value={deal.probability || 0} className="h-1" />
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">No deals in this stage</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No data state */}
      {deals.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No deals found</h3>
            <p className="text-muted-foreground mb-4">
              Import some deals or create your first deal to get started
            </p>
            <Button onClick={() => alert('Create Deal functionality would open a modal/form here')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Deal
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}