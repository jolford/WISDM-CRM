import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
  ExternalLink,
  Phone,
  ArrowUpDown
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Accounts() {
  const [searchQuery, setSearchQuery] = useState("")
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sortField, setSortField] = useState<string>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const { toast } = useToast()

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch accounts",
          variant: "destructive"
        })
        return
      }

      setAccounts(data || [])
    } catch (error) {
      console.error('Error fetching accounts:', error)
      toast({
        title: "Error",
        description: "Failed to fetch accounts",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (account: any) => {
    // TODO: Open edit modal/form with account data
    toast({
      title: "Edit Account",
      description: `Edit functionality for ${account.name} will be implemented here`,
    })
  }

  const handleDelete = async (accountId: string) => {
    if (!confirm('Are you sure you want to delete this account?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', accountId)

      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete account",
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Success",
        description: "Account deleted successfully"
      })
      
      // Refresh the accounts list
      fetchAccounts()
    } catch (error) {
      console.error('Error deleting account:', error)
      toast({
        title: "Error",
        description: "Failed to delete account",
        variant: "destructive"
      })
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const filteredAndSortedAccounts = accounts
    .filter(account =>
      account.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.industry?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      
      if (aValue === null && bValue === null) return 0
      if (aValue === null) return 1
      if (bValue === null) return -1
      
      let comparison = 0
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue)
      } else {
        comparison = String(aValue).localeCompare(String(bValue))
      }
      
      return sortDirection === 'asc' ? comparison : -comparison
    })

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "Customer": return "bg-green-100 text-green-800"
      case "Prospect": return "bg-blue-100 text-blue-800"
      case "Lead": return "bg-yellow-100 text-yellow-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Accounts</h1>
            <p className="text-muted-foreground">Manage your business accounts</p>
          </div>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading accounts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Accounts</h1>
          <p className="text-muted-foreground">Manage your business accounts</p>
        </div>
        <Button onClick={() => alert('Create Account functionality would open a modal/form here')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Account
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search accounts..." 
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

      {/* Accounts Table */}
      <Card>
        <CardContent className="p-0">
          {filteredAndSortedAccounts.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No accounts found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "No accounts found matching your search." : "No accounts yet. Import some accounts or add them manually."}
              </p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Account
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">
                    <Button 
                      variant="ghost" 
                      onClick={() => handleSort('name')}
                      className="font-semibold p-0 h-auto"
                    >
                      Account
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      onClick={() => handleSort('industry')}
                      className="font-semibold p-0 h-auto"
                    >
                      Industry
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      onClick={() => handleSort('phone')}
                      className="font-semibold p-0 h-auto"
                    >
                      Phone
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      onClick={() => handleSort('revenue')}
                      className="font-semibold p-0 h-auto"
                    >
                      Revenue
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      onClick={() => handleSort('size')}
                      className="font-semibold p-0 h-auto"
                    >
                      Size
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      onClick={() => handleSort('city')}
                      className="font-semibold p-0 h-auto"
                    >
                      Location
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedAccounts.map((account) => (
                  <TableRow key={account.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getInitials(account.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{account.name}</div>
                          {account.email && (
                            <div className="text-sm text-muted-foreground">{account.email}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {account.industry ? (
                        <Badge variant="outline" className="text-xs">
                          {account.industry}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {account.phone ? (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <a 
                            href={`tel:${account.phone}`}
                            className="text-sm hover:underline"
                          >
                            {account.phone}
                          </a>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {account.website ? (
                        <div className="flex items-center space-x-2">
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          <a 
                            href={account.website.startsWith('http') ? account.website : `https://${account.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm hover:underline"
                          >
                            {account.website.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {account.revenue ? (
                        <span className="text-sm font-medium text-green-600">
                          {account.revenue}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {account.size ? (
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{account.size}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {account.city && account.state ? (
                          `${account.city}, ${account.state}`
                        ) : account.city ? (
                          account.city
                        ) : account.state ? (
                          account.state
                        ) : account.country ? (
                          account.country
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(account.status)}>
                        {account.status || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(account)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          {account.website && (
                            <DropdownMenuItem onClick={() => window.open(account.website.startsWith('http') ? account.website : `https://${account.website}`, '_blank')}>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Visit Website
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDelete(account.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}