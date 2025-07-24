import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  Plus, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  Building2,
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

export default function Contacts() {
  const [searchQuery, setSearchQuery] = useState("")
  const [allContacts, setAllContacts] = useState<any[]>([])

  // Default sample contacts
  const defaultContacts = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.johnson@acmecorp.com",
      phone: "+1 (555) 123-4567",
      company: "Acme Corp",
      position: "VP of Sales",
      status: "Active",
      initials: "SJ",
      source: "default"
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "m.chen@techstart.io",
      phone: "+1 (555) 234-5678",
      company: "TechStart Inc",
      position: "CTO",
      status: "Lead",
      initials: "MC",
      source: "default"
    },
    {
      id: 3,
      name: "Emma Davis",
      email: "emma.davis@globalsol.com",
      phone: "+1 (555) 345-6789",
      company: "Global Solutions",
      position: "Marketing Director",
      status: "Active",
      initials: "ED",
      source: "default"
    },
    {
      id: 4,
      name: "Robert Kim",
      email: "robert.kim@innovlabs.com",
      phone: "+1 (555) 456-7890",
      company: "Innovation Labs",
      position: "CEO",
      status: "Prospect",
      initials: "RK",
      source: "default"
    },
    {
      id: 5,
      name: "Lisa Anderson",
      email: "l.anderson@futuretech.com",
      phone: "+1 (555) 567-8901",
      company: "FutureTech",
      position: "Product Manager",
      status: "Active",
      initials: "LA",
      source: "default"
    }
  ]

  // Load imported contacts from localStorage
  useEffect(() => {
    const importedData = localStorage.getItem('wisdm_contacts')
    let importedContacts = []
    
    if (importedData) {
      try {
        const rawContacts = JSON.parse(importedData)
        console.log('Found imported contacts:', rawContacts.length)
        
        // Transform imported data to match our contact format
        importedContacts = rawContacts.map((contact: any, index: number) => {
          const firstName = contact['First Name'] || contact['firstName'] || ''
          const lastName = contact['Last Name'] || contact['lastName'] || ''
          const fullName = `${firstName} ${lastName}`.trim() || contact['Full Name'] || contact['name'] || `Contact ${index + 1}`
          
          return {
            id: `imported-${index}`,
            name: fullName,
            email: contact['Email'] || contact['email'] || '',
            phone: contact['Phone'] || contact['phone'] || contact['Mobile'] || '',
            company: contact['Account Name'] || contact['company'] || contact['Company'] || '',
            position: contact['Title'] || contact['position'] || contact['Job Title'] || '',
            status: "Imported",
            initials: fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'IC',
            source: "imported"
          }
        })
        
        console.log('Transformed imported contacts:', importedContacts.slice(0, 3))
      } catch (error) {
        console.error('Error parsing imported contacts:', error)
      }
    }
    
    // Combine default and imported contacts
    setAllContacts([...defaultContacts, ...importedContacts])
  }, [])

  const filteredContacts = allContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.company.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800"
      case "Lead": return "bg-blue-100 text-blue-800"
      case "Prospect": return "bg-yellow-100 text-yellow-800"
      case "Imported": return "bg-purple-100 text-purple-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contacts</h1>
          <p className="text-muted-foreground">Manage your customer relationships</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search contacts..." 
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

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContacts.map((contact) => (
          <Card key={contact.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {contact.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{contact.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{contact.position}</p>
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
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{contact.company}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{contact.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{contact.phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(contact.status)}>
                  {contact.status}
                </Badge>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon">
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Phone className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}