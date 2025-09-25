import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Upload } from "lucide-react";

const CreateTicket: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    priority: "medium",
    product: "",
    company: "",
    customer_name: "",
    email: user?.email || ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("tickets")
        .insert([
          {
            ...formData,
            user_id: user?.id,
            status: "open"
          }
        ])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Ticket Created",
        description: "Your support ticket has been created successfully.",
      });

      navigate(`/support/ticket/${data.id}`);
    } catch (error: any) {
      console.error("Error creating ticket:", error);
      toast({
        title: "Error",
        description: "Failed to create ticket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/support")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Support
          </Button>
          <h1 className="text-3xl font-bold">Create Support Ticket</h1>
          <p className="text-muted-foreground mt-2">
            Describe your issue and we'll help you resolve it quickly.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>New Support Request</CardTitle>
            <CardDescription>
              Please provide as much detail as possible to help us assist you better.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer_name">Your Name</Label>
                  <Input
                    id="customer_name"
                    value={formData.customer_name}
                    onChange={(e) => handleChange("customer_name", e.target.value)}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="your.email@company.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleChange("company", e.target.value)}
                    placeholder="Your company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product">Product</Label>
                  <Select value={formData.product} onValueChange={(value) => handleChange("product", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="filebound">FileBound</SelectItem>
                      <SelectItem value="psigen">PSIGEN</SelectItem>
                      <SelectItem value="applicationxtender">ApplicationXtender</SelectItem>
                      <SelectItem value="tangent">Tangent</SelectItem>
                      <SelectItem value="fujitsu">Fujitsu</SelectItem>
                      <SelectItem value="kodak">Kodak</SelectItem>
                      <SelectItem value="parascript">Parascript</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => handleChange("priority", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - General inquiry</SelectItem>
                    <SelectItem value="medium">Medium - Standard support</SelectItem>
                    <SelectItem value="high">High - Business impact</SelectItem>
                    <SelectItem value="urgent">Urgent - Critical issue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => handleChange("subject", e.target.value)}
                  placeholder="Brief description of your issue"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Please provide detailed information about your issue, including steps to reproduce, error messages, and any relevant context."
                  className="min-h-[120px]"
                  required
                />
              </div>

              <Alert>
                <Upload className="h-4 w-4" />
                <AlertDescription>
                  Need to attach files? You can add attachments after creating the ticket in the ticket details page.
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Ticket"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/support")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateTicket;