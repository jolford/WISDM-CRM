import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Facebook, 
  Linkedin, 
  Twitter, 
  Instagram, 
  Globe, 
  Calendar, 
  Eye, 
  Edit,
  Trash2,
  ExternalLink,
  BarChart3,
  Users,
  Heart,
  MessageCircle,
  Share2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ConnectSocialAccountDialog } from "@/components/ConnectSocialAccountDialog";

const Marketing = () => {
  const { toast } = useToast();
  const [socialAccounts, setSocialAccounts] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [socialPosts, setSocialPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);

  useEffect(() => {
    fetchMarketingData();
  }, []);

  const fetchMarketingData = async () => {
    try {
      setLoading(true);
      const [socialAccountsRes, blogPostsRes, socialPostsRes] = await Promise.all([
        supabase.from('social_accounts').select('*').order('created_at', { ascending: false }),
        supabase.from('blog_posts').select('*').order('created_at', { ascending: false }),
        supabase.from('social_posts').select('*, social_accounts(platform, account_name)').order('created_at', { ascending: false })
      ]);

      setSocialAccounts(socialAccountsRes.data || []);
      setBlogPosts(blogPostsRes.data || []);
      setSocialPosts(socialPostsRes.data || []);
    } catch (error) {
      console.error('Error fetching marketing data:', error);
      toast({
        title: "Error",
        description: "Failed to load marketing data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook': return <Facebook className="h-4 w-4 text-blue-600" />;
      case 'linkedin': return <Linkedin className="h-4 w-4 text-blue-700" />;
      case 'twitter': return <Twitter className="h-4 w-4 text-blue-400" />;
      case 'instagram': return <Instagram className="h-4 w-4 text-pink-600" />;
      case 'wordpress': return <Globe className="h-4 w-4 text-blue-500" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const handleDeleteAccount = async (accountId: string, accountName: string) => {
    if (!confirm(`Are you sure you want to delete the connection to ${accountName}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('social_accounts')
        .delete()
        .eq('id', accountId);

      if (error) throw error;

      toast({
        title: "Account Deleted",
        description: `Successfully removed ${accountName} connection`,
      });

      fetchMarketingData();
    } catch (error) {
      console.error('Error deleting social account:', error);
      toast({
        title: "Error",
        description: "Failed to delete social media account",
        variant: "destructive",
      });
    }
  };

  const handleEditAccount = (account: any) => {
    setEditingAccount(account);
    setShowConnectDialog(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Marketing Hub</h1>
          <p className="text-muted-foreground">Manage your social media accounts, blog posts, and content strategy</p>
        </div>
      </div>

      {/* Marketing Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Connected Accounts</p>
                <p className="text-2xl font-bold">{socialAccounts.filter(a => a.is_active).length}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Blog Posts</p>
                <p className="text-2xl font-bold">{blogPosts.length}</p>
              </div>
              <Globe className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Social Posts</p>
                <p className="text-2xl font-bold">{socialPosts.length}</p>
              </div>
              <Share2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Scheduled Posts</p>
                <p className="text-2xl font-bold">{socialPosts.filter(p => p.status === 'scheduled').length}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="accounts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="accounts">Social Accounts</TabsTrigger>
          <TabsTrigger value="posts">Social Posts</TabsTrigger>
          <TabsTrigger value="blog">Blog Posts</TabsTrigger>
          <TabsTrigger value="calendar">Content Calendar</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Connected Social Media Accounts</CardTitle>
                    <CardDescription>Manage your connected social media platforms</CardDescription>
                  </div>
                  <Button onClick={() => setShowConnectDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Connect Account
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {socialAccounts.length > 0 ? (
                  <div className="grid gap-4">
                    {socialAccounts.map((account) => (
                      <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getPlatformIcon(account.platform)}
                          <div>
                            <h3 className="font-medium">{account.account_name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {account.platform === 'wordpress' ? (
                                <>
                                  {account.account_handle} • {account.platform}
                                  {account.account_id_external && (
                                    <span className="block text-xs">
                                      Site: {account.account_id_external}
                                    </span>
                                  )}
                                </>
                              ) : (
                                <>@{account.account_handle} • {account.platform}</>
                              )}
                            </p>
                            {account.last_sync && (
                              <p className="text-xs text-muted-foreground">
                                Last synced: {new Date(account.last_sync).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={account.is_active ? "default" : "secondary"}>
                            {account.is_active ? "Active" : "Inactive"}
                          </Badge>
                          
                          {account.platform === 'wordpress' && account.account_id_external && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => window.open(account.account_id_external, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4 mr-1" />
                                View Site
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => window.open(`${account.account_id_external}/wp-admin`, '_blank')}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                WP Admin
                              </Button>
                            </>
                          )}
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditAccount(account)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteAccount(account.id, account.account_name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Social Accounts Connected</h3>
                    <p className="text-muted-foreground mb-4">Connect your social media accounts to start posting and managing content.</p>
                    <Button onClick={() => setShowConnectDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Connect Your First Account
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="posts">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Social Media Posts</CardTitle>
                    <CardDescription>Create and manage your social media content</CardDescription>
                  </div>
                  <Button onClick={() => {
                    toast({
                      title: "Coming Soon",
                      description: "Post creation feature will be available soon!",
                    });
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Post
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {socialPosts.length > 0 ? (
                  <div className="space-y-4">
                    {socialPosts.map((post) => (
                      <div key={post.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            {getPlatformIcon(post.platform)}
                            <span className="font-medium">{post.platform}</span>
                            {post.social_accounts && (
                              <span className="text-sm text-muted-foreground">
                                • {post.social_accounts.account_name}
                              </span>
                            )}
                          </div>
                          <Badge className={getStatusColor(post.status)}>
                            {post.status}
                          </Badge>
                        </div>
                        <p className="text-sm mb-3 line-clamp-3">{post.content}</p>
                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                          <div>
                            {post.scheduled_at && (
                              <span>Scheduled: {new Date(post.scheduled_at).toLocaleString()}</span>
                            )}
                            {post.published_at && (
                              <span>Published: {new Date(post.published_at).toLocaleString()}</span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {post.external_post_id && (
                              <Button variant="outline" size="sm">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Share2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Social Posts Yet</h3>
                    <p className="text-muted-foreground mb-4">Start creating content to engage with your audience across social platforms.</p>
                    <Button onClick={() => {
                      toast({
                        title: "Coming Soon",
                        description: "Post creation feature will be available soon!",
                      });
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Post
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="blog">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Blog Posts</CardTitle>
                    <CardDescription>Manage your website blog content</CardDescription>
                  </div>
                  <Button onClick={() => {
                    toast({
                      title: "Coming Soon",
                      description: "Blog post creation feature will be available soon!",
                    });
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Blog Post
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {blogPosts.length > 0 ? (
                  <div className="space-y-4">
                    {blogPosts.map((post) => (
                      <div key={post.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium text-lg">{post.title}</h3>
                            <p className="text-sm text-muted-foreground">/{post.slug}</p>
                          </div>
                          <Badge className={getStatusColor(post.status)}>
                            {post.status}
                          </Badge>
                        </div>
                        {post.excerpt && (
                          <p className="text-sm text-muted-foreground mb-3">{post.excerpt}</p>
                        )}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex gap-1 mb-3">
                            {post.tags.map((tag: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                          <div>
                            {post.published_at && (
                              <span>Published: {new Date(post.published_at).toLocaleDateString()}</span>
                            )}
                            {post.scheduled_at && (
                              <span>Scheduled: {new Date(post.scheduled_at).toLocaleDateString()}</span>
                            )}
                            {!post.published_at && !post.scheduled_at && (
                              <span>Created: {new Date(post.created_at).toLocaleDateString()}</span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Blog Posts Yet</h3>
                    <p className="text-muted-foreground mb-4">Start creating blog content to share your expertise and attract customers.</p>
                    <Button onClick={() => {
                      toast({
                        title: "Coming Soon",
                        description: "Blog post creation feature will be available soon!",
                      });
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Write Your First Post
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Content Calendar</CardTitle>
              <CardDescription>View and manage your scheduled content across all platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Content Calendar</h3>
                <p className="text-muted-foreground mb-4">Interactive calendar view coming soon!</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Analytics</CardTitle>
              <CardDescription>Track performance across all your social media platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Reach</p>
                        <p className="text-xl font-bold">12.4K</p>
                      </div>
                      <Users className="h-6 w-6 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Engagement</p>
                        <p className="text-xl font-bold">856</p>
                      </div>
                      <Heart className="h-6 w-6 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Comments</p>
                        <p className="text-xl font-bold">142</p>
                      </div>
                      <MessageCircle className="h-6 w-6 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Detailed analytics and reporting coming soon!</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ConnectSocialAccountDialog
        open={showConnectDialog}
        onOpenChange={(open) => {
          setShowConnectDialog(open);
          if (!open) setEditingAccount(null);
        }}
        onAccountAdded={fetchMarketingData}
        editingAccount={editingAccount}
      />
    </div>
  );
};

export default Marketing;