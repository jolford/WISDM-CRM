import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Plus, 
  Calendar, 
  Monitor, 
  HardDrive, 
  AlertTriangle,
  Edit,
  Trash2,
  CheckCircle
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import MaintenanceTracking from "@/components/MaintenanceTracking";
import MaintenanceImport from "@/components/MaintenanceImport";
import NotificationSettings from "@/components/NotificationSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Maintenance() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Maintenance Management</h1>
          <p className="text-muted-foreground mt-2">
            Track software licenses, hardware warranties, and maintenance schedules
          </p>
        </div>
      </div>

      <Tabs defaultValue="records" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="records">Maintenance Records</TabsTrigger>
          <TabsTrigger value="import">Import Data</TabsTrigger>
          <TabsTrigger value="notifications">Notification Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="records" className="mt-6">
          <MaintenanceTracking />
        </TabsContent>
        
        <TabsContent value="import" className="mt-6">
          <MaintenanceImport />
        </TabsContent>
        
        <TabsContent value="notifications" className="mt-6">
          <NotificationSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}