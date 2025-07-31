import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Send, Clock, AlertCircle, CheckCircle, TicketIcon, User } from "lucide-react";

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  product: string;
  customer_name: string;
  company: string;
  email: string;
  created_at: string;
  updated_at: string;
}

interface TicketMessage {
  id: number;
  message: string;
  user_id: string;
  created_at: string;
}

const SupportTicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (id) {
      loadTicket();
      loadMessages();
    }
  }, [id]);

  const loadTicket = async () => {
    try {
      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .eq("id", id)
        .eq("user_id", user?.id)
        .single();

      if (error) throw error;
      setTicket(data);
    } catch (error: any) {
      console.error("Error loading ticket:", error);
      toast({
        title: "Error",
        description: "Failed to load ticket details.",
        variant: "destructive",
      });
      navigate("/support");
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    // For now, we'll skip loading messages since the ticket_messages table needs proper setup
    // In a real implementation, you'd query messages related to this ticket
    setMessages([]);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      // For now, we'll skip inserting messages since the ticket_messages table needs proper setup
      // In a real implementation, you'd insert the message and relate it to this ticket
      
      setNewMessage("");
      
      toast({
        title: "Message Sent",
        description: "Your message has been added to the ticket. (Note: Message functionality will be fully implemented after proper table setup)",
      });
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const updateTicketStatus = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from("tickets")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user?.id);

      if (error) throw error;

      setTicket(prev => prev ? { ...prev, status: newStatus } : null);
      
      toast({
        title: "Status Updated",
        description: `Ticket status changed to ${newStatus.replace("_", " ")}.`,
      });
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update ticket status.",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open": return <AlertCircle className="h-4 w-4" />;
      case "in_progress": return <Clock className="h-4 w-4" />;
      case "resolved": return <CheckCircle className="h-4 w-4" />;
      case "closed": return <CheckCircle className="h-4 w-4" />;
      default: return <TicketIcon className="h-4 w-4" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "open": return "destructive";
      case "in_progress": return "default";
      case "resolved": return "secondary";
      case "closed": return "outline";
      default: return "outline";
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case "urgent": return "destructive";
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "outline";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Ticket not found or you don't have permission to view it.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/support")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Support
          </Button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">{ticket.subject}</h1>
              <div className="flex items-center space-x-4 text-muted-foreground">
                <span>Ticket #{ticket.id.slice(0, 8)}</span>
                <span>•</span>
                <span>Created {formatDate(ticket.created_at)}</span>
                <span>•</span>
                <span>Updated {formatDate(ticket.updated_at)}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant={getStatusBadgeVariant(ticket.status)}>
                {getStatusIcon(ticket.status)}
                <span className="ml-2">{ticket.status.replace("_", " ")}</span>
              </Badge>
              <Badge variant={getPriorityBadgeVariant(ticket.priority)}>
                {ticket.priority}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{ticket.description}</p>
              </CardContent>
            </Card>

            {/* Messages */}
            <Card>
              <CardHeader>
                <CardTitle>Conversation</CardTitle>
                <CardDescription>
                  Communicate with our support team about this ticket.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No messages yet. Start the conversation below.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div key={message.id} className="flex space-x-3">
                        <div className="bg-muted p-2 rounded-full">
                          <User className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium">
                              {message.user_id === user?.id ? "You" : "Support Team"}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(message.created_at)}
                            </span>
                          </div>
                          <p className="whitespace-pre-wrap">{message.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Message Input */}
                <div className="pt-4 border-t space-y-3">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <div className="flex justify-between">
                    <p className="text-sm text-muted-foreground">
                      Our support team will respond within 24 hours.
                    </p>
                    <Button 
                      onClick={sendMessage} 
                      disabled={!newMessage.trim() || sending}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {sending ? "Sending..." : "Send Message"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ticket Info */}
            <Card>
              <CardHeader>
                <CardTitle>Ticket Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Select value={ticket.status} onValueChange={updateTicketStatus}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Priority</Label>
                  <p className="mt-1 text-sm capitalize">{ticket.priority}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Product</Label>
                  <p className="mt-1 text-sm">{ticket.product || "General"}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Customer</Label>
                  <p className="mt-1 text-sm">{ticket.customer_name}</p>
                </div>

                {ticket.company && (
                  <div>
                    <Label className="text-sm font-medium">Company</Label>
                    <p className="mt-1 text-sm">{ticket.company}</p>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="mt-1 text-sm">{ticket.email}</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {ticket.status !== "resolved" && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => updateTicketStatus("resolved")}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Resolved
                  </Button>
                )}
                
                {ticket.status !== "closed" && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => updateTicketStatus("closed")}
                  >
                    <TicketIcon className="h-4 w-4 mr-2" />
                    Close Ticket
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate("/support/create")}
                >
                  Create New Ticket
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportTicketDetail;