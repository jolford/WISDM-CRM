import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Facebook, Linkedin, Twitter, Instagram } from "lucide-react";

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
];

export const ConnectSocialAccountDialog = ({ open, onOpenChange, onAccountAdded }: ConnectSocialAccountDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    platform: "",
    account_name: "",
    account_handle: "",
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
          is_active: true,
        }]);

      if (error) throw error;

      toast({
        title: "Account Connected",
        description: `Successfully connected ${formData.platform} account`,
      });

      setFormData({ platform: "", account_name: "", account_handle: "" });
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
            <Label htmlFor="account_handle">Account Handle *</Label>
            <div className="flex items-center">
              <span className="text-muted-foreground mr-1">@</span>
              <Input
                id="account_handle"
                placeholder="username"
                value={formData.account_handle}
                onChange={(e) => setFormData({ ...formData, account_handle: e.target.value })}
              />
            </div>
          </div>

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