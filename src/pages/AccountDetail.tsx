import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Edit, Phone, Mail, Globe, MapPin } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

const AccountDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [account, setAccount] = useState<any>(null)
  const [contacts, setContacts] = useState<any[]>([])
  const [deals, setDeals] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [tickets, setTickets] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchAccount()
    }
  }, [id])

  const fetchAccount = async () => {
    try {
      setLoading(true)
      // Fetch account details
      const { data: accountData, error: accountError } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (accountError) {
        console.error('Error fetching account:', accountError)
        toast({
          title: "Error",
          description: "Failed to load account details",
          variant: "destructive",
        })
        return
      }

      if (!accountData) {
        toast({
          title: "Not Found",
          description: "Account not found",
          variant: "destructive",
        })
        navigate('/accounts')
        return
      }

      setAccount(accountData)

      // Fetch related data in parallel
      const [contactsRes, dealsRes, projectsRes, ticketsRes, campaignsRes] = await Promise.all([
        supabase.from('contacts').select('*').eq('account_id', id),
        supabase.from('deals').select('*').eq('account_id', id),
        supabase.from('projects').select('*').eq('account_id', id),
        supabase.from('tickets').select('*').eq('account_id', id),
        supabase.from('campaigns').select('*').eq('account_id', id),
      ])

      setContacts(contactsRes.data || [])
      setDeals(dealsRes.data || [])
      setProjects(projectsRes.data || [])
      setTickets(ticketsRes.data || [])
      setCampaigns(campaignsRes.data || [])

    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!account) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Account Not Found</h2>
          <Button onClick={() => navigate('/accounts')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Accounts
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/accounts')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{account.name}</h1>
            <p className="text-muted-foreground">{account.industry}</p>
          </div>
        </div>
        <Button>
          <Edit className="h-4 w-4 mr-2" />
          Edit Account
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="contacts">Contacts ({contacts.length})</TabsTrigger>
              <TabsTrigger value="deals">Deals ({deals.length})</TabsTrigger>
              <TabsTrigger value="projects">Projects ({projects.length})</TabsTrigger>
              <TabsTrigger value="tickets">Support ({tickets.length})</TabsTrigger>
              <TabsTrigger value="campaigns">Campaigns ({campaigns.length})</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {account.address && (
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Address</p>
                        <p className="text-sm text-muted-foreground">
                          {account.address}
                          {account.city && `, ${account.city}`}
                          {account.state && `, ${account.state}`}
                          {account.zip_code && ` ${account.zip_code}`}
                          {account.country && `, ${account.country}`}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {account.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Phone</p>
                        <p className="text-sm text-muted-foreground">{account.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  {account.email && (
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">{account.email}</p>
                      </div>
                    </div>
                  )}
                  
                  {account.website && (
                    <div className="flex items-center space-x-3">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Website</p>
                        <p className="text-sm text-muted-foreground">{account.website}</p>
                      </div>
                    </div>
                  )}
                  
                  {account.notes && (
                    <div>
                      <p className="font-medium mb-2">Notes</p>
                      <p className="text-sm text-muted-foreground">{account.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="contacts">
              <Card>
                <CardHeader>
                  <CardTitle>Related Contacts ({contacts.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {contacts.length > 0 ? (
                    <div className="space-y-4">
                      {contacts.map((contact) => (
                        <div key={contact.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{contact.first_name} {contact.last_name}</h3>
                              {contact.title && <p className="text-sm text-muted-foreground">{contact.title}</p>}
                              {contact.email && <p className="text-sm text-muted-foreground">{contact.email}</p>}
                              {contact.phone && <p className="text-sm text-muted-foreground">{contact.phone}</p>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No contacts found for this account.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="deals">
              <Card>
                <CardHeader>
                  <CardTitle>Related Deals ({deals.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {deals.length > 0 ? (
                    <div className="space-y-4">
                      {deals.map((deal) => (
                        <div key={deal.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{deal.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                Stage: {deal.stage} • Value: ${deal.value?.toLocaleString() || 'N/A'}
                              </p>
                              {deal.close_date && (
                                <p className="text-sm text-muted-foreground">
                                  Close Date: {new Date(deal.close_date).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <Badge variant={deal.stage === 'won' ? 'default' : 'secondary'}>
                              {deal.stage}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No deals found for this account.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="projects">
              <Card>
                <CardHeader>
                  <CardTitle>Related Projects ({projects.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {projects.length > 0 ? (
                    <div className="space-y-4">
                      {projects.map((project) => (
                        <div key={project.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{project.name}</h3>
                              <p className="text-sm text-muted-foreground">{project.description}</p>
                              <p className="text-sm text-muted-foreground">
                                Status: {project.status} • Budget: ${project.budget?.toLocaleString() || 'N/A'}
                              </p>
                              {project.start_date && (
                                <p className="text-sm text-muted-foreground">
                                  Start: {new Date(project.start_date).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <Badge variant={project.status === 'completed' ? 'default' : 'secondary'}>
                              {project.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No projects found for this account.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="tickets">
              <Card>
                <CardHeader>
                  <CardTitle>Support Tickets ({tickets.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {tickets.length > 0 ? (
                    <div className="space-y-4">
                      {tickets.map((ticket) => (
                        <div key={ticket.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{ticket.subject}</h3>
                              <p className="text-sm text-muted-foreground">{ticket.description}</p>
                              <p className="text-sm text-muted-foreground">
                                Customer: {ticket.customer_name || ticket.email}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Created: {new Date(ticket.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge variant={ticket.status === 'open' ? 'destructive' : 'secondary'}>
                                {ticket.status}
                              </Badge>
                              {ticket.priority && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  Priority: {ticket.priority}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No support tickets found for this account.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="campaigns">
              <Card>
                <CardHeader>
                  <CardTitle>Marketing Campaigns ({campaigns.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {campaigns.length > 0 ? (
                    <div className="space-y-4">
                      {campaigns.map((campaign) => (
                        <div key={campaign.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{campaign.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                Type: {campaign.type} • Target: {campaign.target_audience}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Budget: ${campaign.budget?.toLocaleString() || 'N/A'} • 
                                Leads: {campaign.leads || 0} • 
                                Conversions: {campaign.conversions || 0}
                              </p>
                              {campaign.start_date && (
                                <p className="text-sm text-muted-foreground">
                                  Duration: {new Date(campaign.start_date).toLocaleDateString()} - {
                                    campaign.end_date ? new Date(campaign.end_date).toLocaleDateString() : 'Ongoing'
                                  }
                                </p>
                              )}
                            </div>
                            <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                              {campaign.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No campaigns found for this account.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">No recent activity.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Contacts</span>
                <Badge variant="secondary">{contacts.length}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Active Deals</span>
                <Badge variant="secondary">{deals.filter(d => d.stage !== 'won' && d.stage !== 'lost').length}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Projects</span>
                <Badge variant="secondary">{projects.length}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Open Tickets</span>
                <Badge variant="secondary">{tickets.filter(t => t.status === 'open').length}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Campaigns</span>
                <Badge variant="secondary">{campaigns.length}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Company Size</span>
                <Badge variant="secondary">{account.size || 'Unknown'}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Revenue</span>
                <Badge variant="secondary">{account.revenue || 'Unknown'}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Industry</span>
                <Badge variant="secondary">{account.industry || 'Unknown'}</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{new Date(account.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated</span>
                <span>{new Date(account.updated_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default AccountDetail