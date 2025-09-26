import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const egnyteSchema = z.object({
  connectionName: z.string().trim().min(1, "Connection name is required").max(100),
  domainName: z.string().trim().min(1, "Domain name is required")
    .regex(/^[a-zA-Z0-9-]+\.egnyte\.com$/, "Must be a valid Egnyte domain (e.g., yourcompany.egnyte.com)"),
  username: z.string().trim().min(1, "Username is required").max(100),
  apiToken: z.string().trim().optional(),
});

interface ConnectEgnyteDialogProps {
  children: React.ReactNode;
  editingConnection?: any;
  onConnectionChange?: () => void;
}

export function ConnectEgnyteDialog({ 
  children, 
  editingConnection, 
  onConnectionChange 
}: ConnectEgnyteDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    connectionName: editingConnection?.connection_name || "",
    domainName: editingConnection?.domain_name || "",
    username: editingConnection?.username || "",
    apiToken: editingConnection?.api_token || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    try {
      egnyteSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to connect your Egnyte account.",
          variant: "destructive"
        });
        return;
      }

      const connectionData = {
        user_id: user.id,
        connection_name: formData.connectionName.trim(),
        domain_name: formData.domainName.trim(),
        username: formData.username.trim(),
        api_token: formData.apiToken.trim() || null,
      };

      let result;
      if (editingConnection) {
        result = await supabase
          .from('egnyte_connections')
          .update(connectionData)
          .eq('id', editingConnection.id);
      } else {
        result = await supabase
          .from('egnyte_connections')
          .insert([connectionData]);
      }

      if (result.error) {
        throw result.error;
      }

      toast({
        title: "Success",
        description: `Egnyte connection ${editingConnection ? 'updated' : 'created'} successfully!`
      });
      
      setOpen(false);
      setFormData({
        connectionName: "",
        domainName: "",
        username: "",
        apiToken: "",
      });
      onConnectionChange?.();
    } catch (error: any) {
      console.error('Error saving Egnyte connection:', error);
      toast({
        title: "Error",
        description: error.message || `Failed to ${editingConnection ? 'update' : 'create'} Egnyte connection`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingConnection ? 'Edit' : 'Connect'} Egnyte Account
          </DialogTitle>
          <DialogDescription>
            {editingConnection 
              ? 'Update your Egnyte connection settings.'
              : 'Connect your Egnyte site to access and manage files.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="connectionName">Connection Name</Label>
            <Input
              id="connectionName"
              value={formData.connectionName}
              onChange={(e) => setFormData(prev => ({ ...prev, connectionName: e.target.value }))}
              placeholder="My Egnyte Site"
              className={errors.connectionName ? "border-destructive" : ""}
            />
            {errors.connectionName && (
              <p className="text-sm text-destructive">{errors.connectionName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="domainName">Egnyte Domain</Label>
            <Input
              id="domainName"
              value={formData.domainName}
              onChange={(e) => setFormData(prev => ({ ...prev, domainName: e.target.value }))}
              placeholder="yourcompany.egnyte.com"
              className={errors.domainName ? "border-destructive" : ""}
            />
            {errors.domainName && (
              <p className="text-sm text-destructive">{errors.domainName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              placeholder="your.email@company.com"
              className={errors.username ? "border-destructive" : ""}
            />
            {errors.username && (
              <p className="text-sm text-destructive">{errors.username}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiToken">API Token (Optional)</Label>
            <Input
              id="apiToken"
              type="password"
              value={formData.apiToken}
              onChange={(e) => setFormData(prev => ({ ...prev, apiToken: e.target.value }))}
              placeholder="Enter your Egnyte API token"
            />
            <p className="text-xs text-muted-foreground">
              API token is optional but recommended for enhanced functionality
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Connecting..." : editingConnection ? "Update" : "Connect"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}