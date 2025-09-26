import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, Plus, Search, Upload, Download, Share } from "lucide-react";

export default function Egnyte() {
  const [searchQuery, setSearchQuery] = useState("");

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
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            New Folder
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>File Browser</CardTitle>
          <CardDescription>
            Browse and manage your Egnyte files
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
    </div>
  );
}