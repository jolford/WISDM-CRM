import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const egnyteSchema = z.object({
  connectionName: z.string().trim().min(1, "Connection name is required").max(100),
  domainName: z.string().trim().min(1, "Domain name is required").regex(
    /^[a-zA-Z0-9-]+\.egnyte\.com$/,
    "Domain must be in format: yourcompany.egnyte.com"
  ),
  username: z.string().trim().min(1, "Username is required").max(100),
  apiToken: z.string().trim().min(1, "API token is required").max(500),
});

interface ConnectEgnyteDialogProps {
  children: React.ReactNode;
  connection?: any;
  onConnectionUpdate?: () => void;
}

export function ConnectEgnyteDialog({ 
  children, 
  connection, 
  onConnectionUpdate 
}: ConnectEgnyteDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    connectionName: connection?.connection_name || "",
    domainName: connection?.domain_name || "",
    username: connection?.username || "",
    apiToken: connection?.api_token || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Validate form data
      const validatedData = egnyteSchema.parse(formData);
      
      const connectionData = {
        connection_name: validatedData.connectionName,
        domain_name: validatedData.domainName,
        username: validatedData.username,
        api_token: validatedData.apiToken,
        user_id: (await supabase.auth.getUser()).data.user?.id,
      };

      if (connection) {
        // Update existing connection
        const { error } = await supabase
          .from('egnyte_connections')
          .update(connectionData)
          .eq('id', connection.id);

        if (error) throw error;

        toast({
          title: "Connection updated",
          description: "Egnyte connection has been updated successfully.",
        });
      } else {
        // Create new connection
        const { error } = await supabase
          .from('egnyte_connections')
          .insert([connectionData]);

        if (error) throw error;

        toast({
          title: "Connection created",
          description: "Egnyte connection has been created successfully.",
        });
      }

      setOpen(false);
      onConnectionUpdate?.();
      
      // Reset form if creating new connection
      if (!connection) {
        setFormData({
          connectionName: "",
          domainName: "",
          username: "",
          apiToken: "",
        });
      }
      
    } catch (error: any) {
      console.error('Connection error:', error);
      if (error instanceof z.ZodError) {
        const firstError = error.issues[0];
        toast({
          title: "Validation Error",
          description: firstError.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to save Egnyte connection",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div onClick={() => setOpen(true)}>
        {children}
      </div>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {connection ? "Edit Egnyte Connection" : "Connect to Egnyte"}
          </DialogTitle>
          <DialogDescription>
            Connect your Egnyte account to manage files directly from the CRM.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="connectionName">Connection Name</Label>
              <Input
                id="connectionName"
                placeholder="Main Egnyte Account"
                value={formData.connectionName}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  connectionName: e.target.value
                }))}
                required
                maxLength={100}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="domainName">Egnyte Domain</Label>
              <Input
                id="domainName"
                placeholder="yourcompany.egnyte.com"
                value={formData.domainName}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  domainName: e.target.value
                }))}
                required
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">
                Your Egnyte domain (e.g., yourcompany.egnyte.com)
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="your.email@company.com"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  username: e.target.value
                }))}
                required
                maxLength={100}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="apiToken">API Token</Label>
              <Input
                id="apiToken"
                type="password"
                placeholder="Your Egnyte API token"
                value={formData.apiToken}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  apiToken: e.target.value
                }))}
                required
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                Generate an API token from your Egnyte admin panel
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Connecting..." : connection ? "Update Connection" : "Connect"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}