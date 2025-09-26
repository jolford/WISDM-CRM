import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, Plus, Search, Upload, Download, Share, Settings, ExternalLink, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ConnectEgnyteDialog } from "@/components/ConnectEgnyteDialog";

export default function Egnyte() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [connections, setConnections] = useState<any[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editingConnection, setEditingConnection] = useState<any>(null);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('egnyte_connections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setConnections(data || []);
      if (data && data.length > 0 && !selectedConnection) {
        setSelectedConnection(data[0]);
      }
    } catch (error: any) {
      console.error('Error fetching connections:', error);
      toast({
        title: "Error",
        description: "Failed to load Egnyte connections",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConnection = async (connectionId: string) => {
    if (!confirm("Are you sure you want to delete this Egnyte connection?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('egnyte_connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Egnyte connection deleted successfully"
      });

      await fetchConnections();
      if (selectedConnection?.id === connectionId) {
        setSelectedConnection(connections.length > 1 ? connections[0] : null);
      }
    } catch (error: any) {
      console.error('Error deleting connection:', error);
      toast({
        title: "Error",
        description: "Failed to delete Egnyte connection",
        variant: "destructive"
      });
    }
  };

  const openEgnyteSite = (connection: any) => {
    if (connection?.domain_name) {
      window.open(`https://${connection.domain_name}`, '_blank');
    }
  };

  const mockFiles = [
    { name: "Sales Presentation Q4.pptx", type: "presentation", size: "2.4 MB", modified: "2 hours ago" },
    { name: "Client Contract - ABC Corp.pdf", type: "document", size: "845 KB", modified: "1 day ago" },
    { name: "Marketing Materials", type: "folder", size: "-", modified: "3 days ago" },
    { name: "Financial Reports 2024", type: "folder", size: "-", modified: "1 week ago" },
    { name: "Product Images.zip", type: "archive", size: "15.2 MB", modified: "2 weeks ago" },
  ];

  const getFileIcon = (type: string) => {
    return <FolderOpen className="h-4 w-4" />;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "folder": return "bg-blue-100 text-blue-800";
      case "document": return "bg-green-100 text-green-800";
      case "presentation": return "bg-orange-100 text-orange-800";
      case "archive": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading Egnyte connections...</p>
        </div>
      </div>
    );
  }

  // If no connections exist, show connection setup
  if (connections.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Egnyte File Management</h1>
            <p className="text-muted-foreground">
              Access and manage your Egnyte files and folders
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FolderOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Egnyte Connections</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Connect your Egnyte site to start accessing and managing your files directly from here.
            </p>
            <ConnectEgnyteDialog onConnectionChange={fetchConnections}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Connect Egnyte Site
              </Button>
            </ConnectEgnyteDialog>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Egnyte File Management</h1>
          <p className="text-muted-foreground">
            Access and manage your Egnyte files and folders
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => openEgnyteSite(selectedConnection)}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Open Egnyte
          </Button>
          <ConnectEgnyteDialog onConnectionChange={fetchConnections}>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Connection
            </Button>
          </ConnectEgnyteDialog>
        </div>
      </div>

      {/* Connections Management */}
      <Card>
        <CardHeader>
          <CardTitle>Egnyte Connections</CardTitle>
          <CardDescription>
            Manage your connected Egnyte sites
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {connections.map((connection) => (
              <div key={connection.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${connection.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <div>
                    <p className="font-medium">{connection.connection_name}</p>
                    <p className="text-sm text-muted-foreground">{connection.domain_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Connected as: {connection.username}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={connection.is_active ? "default" : "secondary"}>
                    {connection.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEgnyteSite(connection)}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <ConnectEgnyteDialog 
                    editingConnection={connection} 
                    onConnectionChange={fetchConnections}
                  >
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </ConnectEgnyteDialog>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteConnection(connection.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedConnection && (
        <Card>
          <CardHeader>
            <CardTitle>File Browser - {selectedConnection.connection_name}</CardTitle>
            <CardDescription>
              Browse and manage files from {selectedConnection.domain_name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search files and folders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                New Folder
              </Button>
            </div>

            <div className="text-sm text-muted-foreground mb-4">
              <p>
                <strong>Note:</strong> File browsing functionality will be available once you provide 
                API access. Currently showing sample data.
              </p>
            </div>

            <div className="space-y-2">
              {mockFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent">
                  <div className="flex items-center gap-3">
                    {getFileIcon(file.type)}
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {file.size} • Modified {file.modified}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={getTypeColor(file.type)}>
                      {file.type}
                    </Badge>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}