import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Users, Building2, Target, CheckSquare } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"

interface QuickAddDialogProps {
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultTab?: string
  onSuccess?: () => void
}

export function QuickAddDialog({ children, open: externalOpen, onOpenChange, defaultTab = "contact", onSuccess }: QuickAddDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = externalOpen !== undefined
  const open = isControlled ? externalOpen : internalOpen
  const setOpen = isControlled ? (onOpenChange || (() => {})) : setInternalOpen
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  const [contactForm, setContactForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    account: ""
  })

  const [accountForm, setAccountForm] = useState({
    name: "",
    industry: "",
    website: "",
    phone: "",
    email: ""
  })

  const [dealForm, setDealForm] = useState({
    name: "",
    value: "",
    stage: "",
    probability: ""
  })

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    task_type: "",
    due_date: ""
  })

  const resetForms = () => {
    setContactForm({ first_name: "", last_name: "", email: "", phone: "", account: "" })
    setAccountForm({ name: "", industry: "", website: "", phone: "", email: "" })
    setDealForm({ name: "", value: "", stage: "", probability: "" })
    setTaskForm({ title: "", description: "", task_type: "", due_date: "" })
  }

  const handleSubmit = async (type: string) => {
    setLoading(true)
    try {
      let result;
      
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      switch (type) {
        case 'contact':
          result = await supabase.from('contacts').insert([{
            ...contactForm,
            user_id: user.id
          }])
          break
        case 'account':
          result = await supabase.from('accounts').insert([{
            ...accountForm,
            user_id: user.id
          }])
          break
        case 'deal':
          result = await supabase.from('deals').insert([{
            ...dealForm,
            value: parseFloat(dealForm.value) || 0,
            probability: parseInt(dealForm.probability) || 0,
            user_id: user.id,
            stage: dealForm.stage as any
          }])
          break
        case 'task':
          result = await supabase.from('tasks').insert([{
            ...taskForm,
            status: 'pending' as any,
            user_id: user.id,
            task_type: taskForm.task_type as any
          }])
          break
      }

      if (result?.error) {
        throw result.error
      }

      toast({
        title: "Success",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} created successfully!`,
      })
      
      resetForms()
      setOpen(false)
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error('Error creating item:', error)
      toast({
        title: "Error",
        description: `Failed to create ${type}. Please try again.`,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && (
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Quick Add
          </DialogTitle>
          <DialogDescription>
            Quickly add new contacts, accounts, deals, or tasks.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="contact" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              Contact
            </TabsTrigger>
            <TabsTrigger value="account" className="text-xs">
              <Building2 className="h-3 w-3 mr-1" />
              Account
            </TabsTrigger>
            <TabsTrigger value="deal" className="text-xs">
              <Target className="h-3 w-3 mr-1" />
              Deal
            </TabsTrigger>
            <TabsTrigger value="task" className="text-xs">
              <CheckSquare className="h-3 w-3 mr-1" />
              Task
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contact" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={contactForm.first_name}
                  onChange={(e) => setContactForm(prev => ({ ...prev, first_name: e.target.value }))}
                  placeholder="John"
                />
              </div>
              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={contactForm.last_name}
                  onChange={(e) => setContactForm(prev => ({ ...prev, last_name: e.target.value }))}
                  placeholder="Doe"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="john@example.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={contactForm.phone}
                onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <Button 
              onClick={() => handleSubmit('contact')} 
              disabled={loading || !contactForm.first_name || !contactForm.email}
              className="w-full"
            >
              {loading ? "Creating..." : "Create Contact"}
            </Button>
          </TabsContent>

          <TabsContent value="account" className="space-y-4">
            <div>
              <Label htmlFor="account_name">Account Name</Label>
              <Input
                id="account_name"
                value={accountForm.name}
                onChange={(e) => setAccountForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Acme Corp"
              />
            </div>
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={accountForm.industry}
                onChange={(e) => setAccountForm(prev => ({ ...prev, industry: e.target.value }))}
                placeholder="Technology"
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={accountForm.website}
                onChange={(e) => setAccountForm(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://acme.com"
              />
            </div>
            <Button 
              onClick={() => handleSubmit('account')} 
              disabled={loading || !accountForm.name}
              className="w-full"
            >
              {loading ? "Creating..." : "Create Account"}
            </Button>
          </TabsContent>

          <TabsContent value="deal" className="space-y-4">
            <div>
              <Label htmlFor="deal_name">Deal Name</Label>
              <Input
                id="deal_name"
                value={dealForm.name}
                onChange={(e) => setDealForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="New Partnership Deal"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="value">Value ($)</Label>
                <Input
                  id="value"
                  type="number"
                  value={dealForm.value}
                  onChange={(e) => setDealForm(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="50000"
                />
              </div>
              <div>
                <Label htmlFor="probability">Probability (%)</Label>
                <Input
                  id="probability"
                  type="number"
                  min="0"
                  max="100"
                  value={dealForm.probability}
                  onChange={(e) => setDealForm(prev => ({ ...prev, probability: e.target.value }))}
                  placeholder="75"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="stage">Stage</Label>
              <Select value={dealForm.stage} onValueChange={(value) => setDealForm(prev => ({ ...prev, stage: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prospect">Prospect</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                  <SelectItem value="negotiation">Negotiation</SelectItem>
                  <SelectItem value="closed_won">Closed Won</SelectItem>
                  <SelectItem value="closed_lost">Closed Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={() => handleSubmit('deal')} 
              disabled={loading || !dealForm.name || !dealForm.value}
              className="w-full"
            >
              {loading ? "Creating..." : "Create Deal"}
            </Button>
          </TabsContent>

          <TabsContent value="task" className="space-y-4">
            <div>
              <Label htmlFor="task_title">Task Title</Label>
              <Input
                id="task_title"
                value={taskForm.title}
                onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Follow up with client"
              />
            </div>
            <div>
              <Label htmlFor="task_type">Task Type</Label>
              <Select value={taskForm.task_type} onValueChange={(value) => setTaskForm(prev => ({ ...prev, task_type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="follow_up">Follow Up</SelectItem>
                  <SelectItem value="demo">Demo</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={taskForm.due_date}
                onChange={(e) => setTaskForm(prev => ({ ...prev, due_date: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={taskForm.description}
                onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Task details..."
                rows={3}
              />
            </div>
            <Button 
              onClick={() => handleSubmit('task')} 
              disabled={loading || !taskForm.title || !taskForm.task_type}
              className="w-full"
            >
              {loading ? "Creating..." : "Create Task"}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}