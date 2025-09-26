import { useState } from "react";
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
}

const platforms = [
  { value: "facebook", label: "Facebook", icon: Facebook },
  { value: "linkedin", label: "LinkedIn", icon: Linkedin },
  { value: "twitter", label: "Twitter", icon: Twitter },
  { value: "instagram", label: "Instagram", icon: Instagram },
  { value: "wordpress", label: "WordPress", icon: Globe },
];

export const ConnectSocialAccountDialog = ({ open, onOpenChange, onAccountAdded }: ConnectSocialAccountDialogProps) => {
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
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.platform || !formData.account_name || !formData.account_handle) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // WordPress-specific validation
    if (formData.platform === 'wordpress' && (!formData.connection_type || !formData.site_url)) {
      toast({
        title: "Missing WordPress Information",
        description: "Please fill in connection type and site URL for WordPress",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

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

      setFormData({ platform: "", account_name: "", account_handle: "", site_url: "", connection_type: "", username: "", api_key: "" });
      onAccountAdded();
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding social account:', error);
      toast({
        title: "Error",
        description: "Failed to connect social media account",
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
          <DialogTitle>Connect Social Media Account</DialogTitle>
          <DialogDescription>
            Add a social media account to manage posts and content.
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
              {loading ? "Connecting..." : "Connect Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};