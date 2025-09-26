import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { usePasswordChange } from "@/hooks/usePasswordChange"
import { supabase } from "@/integrations/supabase/client"
import { 
  User, 
  Bell, 
  Shield, 
  Database, 
  Palette, 
  Globe,
  Save,
  Eye,
  EyeOff,
  Download,
  Upload,
  Import,
  Moon,
  Sun,
  Key
} from "lucide-react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

export default function Settings() {
  const { toast } = useToast()
  const { user, profile } = useAuth()
  const { changePassword, loading: passwordLoading } = usePasswordChange()
  const [showPassword, setShowPassword] = useState(false)
  const [theme, setTheme] = useState("light")
  const [accentColor, setAccentColor] = useState("blue")
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    avatar_url: ''
  })
  const [notifications, setNotifications] = useState({
    email: true,
    desktop: false,
    mobile: true,
    marketing: false
  })

  const handlePasswordUpdate = async () => {
    const success = await changePassword(passwordData)
    if (success) {
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    }
  }

  useEffect(() => {
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light'
    const savedAccent = localStorage.getItem('accentColor') || 'blue'
    setTheme(savedTheme)
    setAccentColor(savedAccent)
    applyTheme(savedTheme, savedAccent)
    
    // Load profile data
    if (profile) {
      setProfileData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
        avatar_url: profile.avatar_url || ''
      })
    }
  }, [profile])

  const applyTheme = (newTheme: string, newAccent: string) => {
    const root = document.documentElement
    
    if (newTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // Apply accent color changes
    const accentColors = {
      blue: { primary: '220 100% 55%', primaryGlow: '220 100% 70%' },
      purple: { primary: '270 95% 60%', primaryGlow: '270 95% 75%' },
      green: { primary: '142 71% 45%', primaryGlow: '142 71% 60%' },
      orange: { primary: '24 95% 53%', primaryGlow: '24 95% 68%' },
      red: { primary: '0 84% 60%', primaryGlow: '0 84% 75%' }
    }

    const colors = accentColors[newAccent as keyof typeof accentColors]
    if (colors) {
      root.style.setProperty('--primary', colors.primary)
      root.style.setProperty('--primary-glow', colors.primaryGlow)
    }
  }

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme, accentColor)
    toast({
      title: "Theme Updated",
      description: `Switched to ${newTheme} theme`,
    })
  }

  const handleAccentChange = (newAccent: string) => {
    setAccentColor(newAccent)
    localStorage.setItem('accentColor', newAccent)
    applyTheme(theme, newAccent)
    toast({
      title: "Accent Color Updated",
      description: `Changed accent color to ${newAccent}`,
    })
  }

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }))
  }

  const handleProfileUpdate = async () => {
    console.log('handleProfileUpdate called');
    console.log('user:', user);
    console.log('profileData:', profileData);
    
    if (!user?.id) {
      console.error('No user ID found');
      toast({
        title: "Error",
        description: "User session not found. Please log in again.",
        variant: "destructive"
      });
      return;
    }

    // Validate required fields
    if (!profileData.first_name?.trim()) {
      toast({
        title: "Validation Error",
        description: "First name is required.",
        variant: "destructive"
      });
      return;
    }

    if (!profileData.last_name?.trim()) {
      toast({
        title: "Validation Error", 
        description: "Last name is required.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true)
    try {
      console.log('Attempting to update profile...');
      
      const updateData = {
        first_name: profileData.first_name.trim(),
        last_name: profileData.last_name.trim(),
        updated_at: new Date().toISOString()
      };
      
      console.log('Update data:', updateData);
      
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }

      console.log('Profile update successful');
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved successfully.",
      })
    } catch (error) {
      console.error('Profile update error:', error)
      toast({
        title: "Update Failed", 
        description: error instanceof Error ? error.message : "Failed to update profile. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user?.id) return

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file (JPG, PNG, or GIF).",
        variant: "destructive"
      })
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 2MB.",
        variant: "destructive"
      })
      return
    }

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/avatar.${fileExt}`

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const { data } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName)

      // Update profile with avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: data.publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      setProfileData(prev => ({ ...prev, avatar_url: data.publicUrl }))
      
      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated successfully.",
      })
    } catch (error) {
      console.error('Avatar upload error:', error)
      toast({
        title: "Upload Failed",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account and application preferences</p>
        </div>
        <Button 
          onClick={() => {
            console.log('Save button clicked');
            handleProfileUpdate();
          }} 
          disabled={loading}
        >
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  {profileData.avatar_url ? (
                    <AvatarImage src={profileData.avatar_url} alt="Profile picture" />
                  ) : (
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                      {profileData.first_name?.[0]?.toUpperCase()}{profileData.last_name?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <Button variant="outline" asChild disabled={uploading}>
                    <label htmlFor="avatar-upload" className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      {uploading ? 'Uploading...' : 'Upload Photo'}
                    </label>
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    JPG, PNG or GIF. Max size 2MB.
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName" 
                    value={profileData.first_name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, first_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    value={profileData.last_name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, last_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={profileData.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed here. Contact support if you need to update your email.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input 
                    id="role" 
                    value={profile?.role?.replace('_', ' ').toUpperCase() || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Role is managed by administrators.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.email}
                    onCheckedChange={(value) => handleNotificationChange('email', value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">Desktop Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Show browser notifications
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.desktop}
                    onCheckedChange={(value) => handleNotificationChange('desktop', value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">Mobile Push</p>
                    <p className="text-sm text-muted-foreground">
                      Receive push notifications on mobile
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.mobile}
                    onCheckedChange={(value) => handleNotificationChange('mobile', value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">Marketing Updates</p>
                    <p className="text-sm text-muted-foreground">
                      Receive product updates and marketing emails
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.marketing}
                    onCheckedChange={(value) => handleNotificationChange('marketing', value)}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h4 className="font-medium">Notification Types</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">New leads assigned</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Deal stage changes</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Task reminders</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Support ticket updates</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Weekly reports</span>
                    <Switch />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                 <div className="space-y-2">
                   <Label htmlFor="currentPassword">Current Password</Label>
                   <div className="relative">
                     <Input 
                       id="currentPassword" 
                       type={showPassword ? "text" : "password"} 
                       placeholder="Enter current password"
                       value={passwordData.currentPassword}
                       onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                     />
                     <Button
                       type="button"
                       variant="ghost"
                       size="icon"
                       className="absolute right-2 top-1/2 -translate-y-1/2"
                       onClick={() => setShowPassword(!showPassword)}
                     >
                       {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                     </Button>
                   </div>
                 </div>
                 
                 <div className="space-y-2">
                   <Label htmlFor="newPassword">New Password</Label>
                   <Input 
                     id="newPassword" 
                     type="password" 
                     placeholder="Enter new password"
                     value={passwordData.newPassword}
                     onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                   />
                   <p className="text-xs text-muted-foreground">
                     Password must be at least 8 characters with uppercase, lowercase, numbers, and special characters.
                   </p>
                 </div>
                 
                 <div className="space-y-2">
                   <Label htmlFor="confirmPassword">Confirm New Password</Label>
                   <Input 
                     id="confirmPassword" 
                     type="password" 
                     placeholder="Confirm new password"
                     value={passwordData.confirmPassword}
                     onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                   />
                 </div>
                 
                 <Button onClick={handlePasswordUpdate} disabled={passwordLoading}>
                   <Key className="h-4 w-4 mr-2" />
                   {passwordLoading ? 'Updating...' : 'Update Password'}
                 </Button>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h4 className="font-medium">Two-Factor Authentication</h4>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Enable 2FA</p>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Badge variant="outline">Not Enabled</Badge>
                </div>
                <Button variant="outline">Setup Two-Factor Authentication</Button>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h4 className="font-medium">Active Sessions</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Current Session</p>
                      <p className="text-xs text-muted-foreground">Chrome on Windows • San Francisco, CA</p>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Mobile App</p>
                      <p className="text-xs text-muted-foreground">iOS App • Last active 2 hours ago</p>
                    </div>
                    <Button variant="outline" size="sm">Revoke</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Settings */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Connected Integrations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Globe className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Email Integration</p>
                      <p className="text-sm text-muted-foreground">Gmail, Outlook</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800">Connected</Badge>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Database className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Slack Integration</p>
                      <p className="text-sm text-muted-foreground">Team notifications</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Not Connected</Badge>
                    <Button size="sm">Connect</Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Globe className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium">Zapier Integration</p>
                      <p className="text-sm text-muted-foreground">Workflow automation</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Not Connected</Badge>
                    <Button size="sm">Connect</Button>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h4 className="font-medium">Data Management</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Data
                  </Button>
                  <Button variant="outline" className="justify-start" onClick={() => window.location.href = '/data-migration'}>
                    <Import className="h-4 w-4 mr-2" />
                    Zoho Migration
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select value={theme} onValueChange={handleThemeChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center gap-2">
                          <Sun className="h-4 w-4" />
                          Light
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center gap-2">
                          <Moon className="h-4 w-4" />
                          Dark
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Accent Color</Label>
                  <Select value={accentColor} onValueChange={handleAccentChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          Blue
                        </div>
                      </SelectItem>
                      <SelectItem value="purple">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                          Purple
                        </div>
                      </SelectItem>
                      <SelectItem value="green">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          Green
                        </div>
                      </SelectItem>
                      <SelectItem value="orange">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                          Orange
                        </div>
                      </SelectItem>
                      <SelectItem value="red">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          Red
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select defaultValue="utc-8">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utc-8">Pacific Time (UTC-8)</SelectItem>
                      <SelectItem value="utc-5">Eastern Time (UTC-5)</SelectItem>
                      <SelectItem value="utc+0">UTC</SelectItem>
                      <SelectItem value="utc+1">Central European Time (UTC+1)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h4 className="font-medium">Display Preferences</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Compact sidebar</span>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Show animations</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">High contrast mode</span>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Reduced motion</span>
                    <Switch />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}