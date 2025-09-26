import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Facebook, Linkedin, Twitter, Instagram, Globe } from "lucide-react";

interface ConnectSocialAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccountAdded: () => void;
  editingAccount?: any;
}

const platforms = [
  { value: "facebook", label: "Facebook", icon: Facebook },
  { value: "linkedin", label: "LinkedIn", icon: Linkedin },
  { value: "twitter", label: "Twitter", icon: Twitter },
  { value: "instagram", label: "Instagram", icon: Instagram },
  { value: "wordpress", label: "WordPress", icon: Globe },
  { value: "teams", label: "Microsoft Teams", icon: Globe },
  { value: "office365", label: "Office 365", icon: Globe },
  { value: "egnyte", label: "Egnyte", icon: Globe },
];

export const ConnectSocialAccountDialog = ({ open, onOpenChange, onAccountAdded, editingAccount }: ConnectSocialAccountDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    platform: "",
    account_name: "",
    account_handle: "",
    site_url: "",
    connection_type: "",
    username: "",
    api_key: "",
    tenant_id: "",
    client_id: "",
    webhook_url: "",
    scopes: "",
    domain: "",
    api_token: "",
  });

  useEffect(() => {
    if (editingAccount) {
      setFormData({
        platform: editingAccount.platform || "",
        account_name: editingAccount.account_name || "",
        account_handle: editingAccount.account_handle || "",
        site_url: editingAccount.account_id_external || "",
        connection_type: "", // We don't store this separately, so leave empty
        username: "", // We don't store this separately, so leave empty
        api_key: "", // Don't pre-fill sensitive data
        tenant_id: "",
        client_id: "",
        webhook_url: "",
        scopes: "",
        domain: "",
        api_token: "",
      });
    } else {
      setFormData({
        platform: "",
        account_name: "",
        account_handle: "",
        site_url: "",
        connection_type: "",
        username: "",
        api_key: "",
        tenant_id: "",
        client_id: "",
        webhook_url: "",
        scopes: "",
        domain: "",
        api_token: "",
      });
    }
  }, [editingAccount, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Platform-specific validation
    const requiredFields = {
      wordpress: ["account_name", "account_handle", "connection_type", "site_url"],
      teams: ["account_name", "tenant_id", "client_id"],
      office365: ["account_name", "tenant_id", "client_id", "scopes"],
      egnyte: ["account_name", "domain", "client_id", "api_token"],
      default: ["account_name", "account_handle"]
    };

    const fields = requiredFields[formData.platform as keyof typeof requiredFields] || requiredFields.default;
    const missingFields = fields.filter(field => !formData[field as keyof typeof formData]);

    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: `Please fill in all required fields: ${missingFields.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      if (editingAccount) {
        // Update existing account
        const { error } = await supabase
          .from('social_accounts')
          .update({
            platform: formData.platform,
            account_name: formData.account_name,
            account_handle: formData.account_handle,
            account_id_external: formData.site_url || null,
            access_token_ref: formData.api_key || editingAccount.access_token_ref,
          })
          .eq('id', editingAccount.id);

        if (error) throw error;

        toast({
          title: "Account Updated",
          description: `Successfully updated ${formData.platform} account`,
        });
      } else {
        // Create new account
        const { error } = await supabase
          .from('social_accounts')
          .insert([{
            user_id: user.id,
            platform: formData.platform,
            account_name: formData.account_name,
            account_handle: formData.account_handle,
            account_id_external: formData.site_url || null,
            access_token_ref: formData.api_key || null,
            is_active: true,
          }]);

        if (error) throw error;

        toast({
          title: "Account Connected",
          description: `Successfully connected ${formData.platform} account`,
        });
      }

      setFormData({ 
        platform: "", 
        account_name: "", 
        account_handle: "", 
        site_url: "", 
        connection_type: "", 
        username: "", 
        api_key: "",
        tenant_id: "",
        client_id: "",
        webhook_url: "",
        scopes: "",
        domain: "",
        api_token: "",
      });
      onAccountAdded();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving social account:', error);
      toast({
        title: "Error",
        description: `Failed to ${editingAccount ? 'update' : 'connect'} social media account`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedPlatform = platforms.find(p => p.value === formData.platform);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingAccount ? 'Edit' : 'Connect'} Social Media Account</DialogTitle>
          <DialogDescription>
            {editingAccount ? 'Update your' : 'Add a'} social media account to manage posts and content.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="platform">Platform *</Label>
            <Select
              value={formData.platform}
              onValueChange={(value) => setFormData({ ...formData, platform: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a platform" />
              </SelectTrigger>
              <SelectContent>
                {platforms.map((platform) => {
                  const Icon = platform.icon;
                  return (
                    <SelectItem key={platform.value} value={platform.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {platform.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="account_name">Account Name *</Label>
            <Input
              id="account_name"
              placeholder="e.g., My Company Page"
              value={formData.account_name}
              onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="account_handle">
              {formData.platform === 'wordpress' ? 'Site Domain' : 'Account Handle'} *
            </Label>
            <div className="flex items-center">
              {formData.platform !== 'wordpress' && <span className="text-muted-foreground mr-1">@</span>}
              <Input
                id="account_handle"
                placeholder={formData.platform === 'wordpress' ? 'mycompany.com' : 'username'}
                value={formData.account_handle}
                onChange={(e) => setFormData({ ...formData, account_handle: e.target.value })}
              />
            </div>
          </div>

          {formData.platform === 'wordpress' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="connection_type">Connection Type *</Label>
                <Select
                  value={formData.connection_type}
                  onValueChange={(value) => setFormData({ ...formData, connection_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select connection type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wordpress_com">WordPress.com</SelectItem>
                    <SelectItem value="self_hosted">Self-hosted WordPress</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="site_url">WordPress Site URL *</Label>
                <Input
                  id="site_url"
                  placeholder="https://yoursite.com"
                  value={formData.site_url}
                  onChange={(e) => setFormData({ ...formData, site_url: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">WordPress Username</Label>
                <Input
                  id="username"
                  placeholder="Your WordPress username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="api_key">
                  {formData.connection_type === 'wordpress_com' ? 'OAuth Token' : 'Application Password'}
                </Label>
                <Input
                  id="api_key"
                  type="password"
                  placeholder={
                    formData.connection_type === 'wordpress_com' 
                      ? 'OAuth access token' 
                      : 'Application password from WordPress admin'
                  }
                  value={formData.api_key}
                  onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.connection_type === 'wordpress_com' 
                    ? 'Get this from WordPress.com Developer Console' 
                    : 'Generate in WordPress Admin > Users > Application Passwords'
                  }
                </p>
              </div>
              </>
            )}

            {formData.platform === 'teams' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="tenant_id">Tenant ID *</Label>
                  <Input
                    id="tenant_id"
                    placeholder="Microsoft 365 Tenant ID"
                    value={formData.tenant_id}
                    onChange={(e) => setFormData({ ...formData, tenant_id: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client_id">Client ID *</Label>
                  <Input
                    id="client_id"
                    placeholder="Application Client ID"
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="webhook_url">Webhook URL</Label>
                  <Input
                    id="webhook_url"
                    placeholder="Teams webhook URL (optional)"
                    value={formData.webhook_url}
                    onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
                  />
                </div>
              </>
            )}

            {formData.platform === 'office365' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="tenant_id">Tenant ID *</Label>
                  <Input
                    id="tenant_id"
                    placeholder="Microsoft 365 Tenant ID"
                    value={formData.tenant_id}
                    onChange={(e) => setFormData({ ...formData, tenant_id: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client_id">Client ID *</Label>
                  <Input
                    id="client_id"
                    placeholder="Application Client ID"
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scopes">Scopes *</Label>
                  <Input
                    id="scopes"
                    placeholder="e.g., Mail.Read, Calendars.ReadWrite"
                    value={formData.scopes}
                    onChange={(e) => setFormData({ ...formData, scopes: e.target.value })}
                  />
                </div>
              </>
            )}

            {formData.platform === 'egnyte' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="domain">Egnyte Domain *</Label>
                  <Input
                    id="domain"
                    placeholder="yourcompany.egnyte.com"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client_id">Client ID *</Label>
                  <Input
                    id="client_id"
                    placeholder="Egnyte API Client ID"
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="api_token">API Token *</Label>
                  <Input
                    id="api_token"
                    type="password"
                    placeholder="Egnyte API token"
                    value={formData.api_token}
                    onChange={(e) => setFormData({ ...formData, api_token: e.target.value })}
                  />
                </div>
              </>
            )}

            <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? `${editingAccount ? 'Updating' : 'Connecting'}...` : `${editingAccount ? 'Update' : 'Connect'} Account`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};