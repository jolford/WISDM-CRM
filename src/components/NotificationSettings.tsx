import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const NotificationSettings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    notification_email: '',
    enable_maintenance_notifications: true,
  });

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('notification_email, enable_maintenance_notifications, email')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      setSettings({
        notification_email: data.notification_email || data.email || '',
        enable_maintenance_notifications: data.enable_maintenance_notifications ?? true,
      });
    } catch (error) {
      console.error('Error fetching notification settings:', error);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          notification_email: settings.notification_email,
          enable_maintenance_notifications: settings.enable_maintenance_notifications,
        })
        .eq('id', user?.id);

      if (error) throw error;

      toast({
        title: "Settings saved",
        description: "Your notification preferences have been updated.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save notification settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="notification-email">Notification Email</Label>
          <Input
            id="notification-email"
            type="email"
            value={settings.notification_email}
            onChange={(e) => setSettings(prev => ({ ...prev, notification_email: e.target.value }))}
            placeholder="Enter email for maintenance notifications"
          />
          <p className="text-sm text-muted-foreground">
            Email address where maintenance expiration notifications will be sent
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="enable-notifications">Enable Maintenance Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive alerts 30, 60, and 90 days before maintenance expires
            </p>
          </div>
          <Switch
            id="enable-notifications"
            checked={settings.enable_maintenance_notifications}
            onCheckedChange={(checked) => 
              setSettings(prev => ({ ...prev, enable_maintenance_notifications: checked }))
            }
          />
        </div>

        <Button onClick={saveSettings} disabled={loading}>
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;