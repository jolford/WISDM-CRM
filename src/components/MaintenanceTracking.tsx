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
  CheckCircle,
  ArrowUpDown
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

interface MaintenanceRecord {
  id: string;
  product_name: string;
  product_type: 'software' | 'hardware';
  purchase_date: string | null;
  start_date: string | null;
  end_date: string | null;
  vendor_name: string | null;
  license_key: string | null;
  serial_number: string | null;
  cost: number | null;
  income: number | null;
  profit: number | null;
  margin_percent: number | null;
  status: 'active' | 'expired' | 'cancelled';
  notes: string | null;
  renewal_reminder_days: number;
  created_at: string;
  updated_at: string;
  account_id: string | null;
  accounts?: {
    id: string;
    name: string;
  } | null;
}

export default function MaintenanceTracking() {
  const { toast } = useToast();
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [accounts, setAccounts] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<keyof MaintenanceRecord>('end_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null);
  const [formData, setFormData] = useState({
    product_name: '',
    product_type: 'software' as 'software' | 'hardware',
    purchase_date: '',
    start_date: '',
    end_date: '',
    vendor_name: '',
    account_id: '',
    license_key: '',
    serial_number: '',
    cost: '',
    status: 'active' as 'active' | 'expired' | 'cancelled',
    notes: '',
    renewal_reminder_days: 30
  });

  useEffect(() => {
    (async () => {
      await fetchRecords();
      await fetchAccounts();
    })();

    const onImported = () => {
      fetchRecords();
    };
    window.addEventListener('maintenance:imported', onImported);
    return () => window.removeEventListener('maintenance:imported', onImported);
  }, []);

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('maintenance_records')
        .select(`
          *,
          accounts (
            id,
            name
          )
        `)
        .order('end_date', { ascending: true, nullsFirst: false });

      if (error) throw error;
      const cleaned = (data || []) as MaintenanceRecord[];
      setRecords(cleaned);
    } catch (error) {
      console.error('Error fetching maintenance records:', error);
      toast({
        title: "Error",
        description: "Failed to fetch maintenance records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const submitData = {
        ...formData,
        user_id: user.id,
        cost: formData.cost ? parseFloat(formData.cost) : null,
        purchase_date: formData.purchase_date || null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        vendor_name: formData.vendor_name || null,
        account_id: formData.account_id === 'none' ? null : formData.account_id || null,
        license_key: formData.license_key || null,
        serial_number: formData.serial_number || null,
        notes: formData.notes || null,
      };

      if (editingRecord) {
        const { error } = await supabase
          .from('maintenance_records')
          .update(submitData)
          .eq('id', editingRecord.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Maintenance record updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('maintenance_records')
          .insert([submitData]);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Maintenance record created successfully",
        });
      }

      setIsDialogOpen(false);
      setEditingRecord(null);
      resetForm();
      fetchRecords();
    } catch (error) {
      console.error('Error saving maintenance record:', error);
      toast({
        title: "Error",
        description: "Failed to save maintenance record",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (record: MaintenanceRecord) => {
    setEditingRecord(record);
    setFormData({
      product_name: record.product_name,
      product_type: record.product_type,
      purchase_date: record.purchase_date || '',
      start_date: record.start_date || '',
      end_date: record.end_date || '',
      vendor_name: record.vendor_name || '',
      account_id: record.account_id || '',
      license_key: record.license_key || '',
      serial_number: record.serial_number || '',
      cost: record.cost?.toString() || '',
      status: record.status,
      notes: record.notes || '',
      renewal_reminder_days: record.renewal_reminder_days
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this maintenance record?')) return;

    try {
      const { error } = await supabase
        .from('maintenance_records')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Maintenance record deleted successfully",
      });
      
      fetchRecords();
    } catch (error) {
      console.error('Error deleting maintenance record:', error);
      toast({
        title: "Error",
        description: "Failed to delete maintenance record",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      product_name: '',
      product_type: 'software',
      purchase_date: '',
      start_date: '',
      end_date: '',
      vendor_name: '',
      account_id: '',
      license_key: '',
      serial_number: '',
      cost: '',
      status: 'active',
      notes: '',
      renewal_reminder_days: 30
    });
  };

  // Count of obviously bad records (placeholder name)
  const unknownCount = records.filter(r => r.product_name.toLowerCase() === 'unknown product').length;

  const handleBulkDeleteUnknown = async () => {
    if (unknownCount === 0) {
      toast({ title: 'Nothing to delete', description: 'No "Unknown Product" records found.' });
      return;
    }
    const confirmed = confirm(`Delete ${unknownCount} bad records (product_name = "Unknown Product")? This cannot be undone.`);
    if (!confirmed) return;
    try {
      const { data, error } = await supabase
        .from('maintenance_records')
        .delete()
        .eq('product_name', 'Unknown Product')
        .select('id');
      if (error) throw error;
      const deleted = data?.length ?? 0;
      toast({ title: 'Deleted', description: `Removed ${deleted} bad maintenance records.` });
      fetchRecords();
    } catch (err) {
      console.error('Bulk delete error:', err);
      toast({ title: 'Delete failed', description: 'Could not delete bad records.', variant: 'destructive' });
    }
  };

  const handleDeleteAllRecords = async () => {
    if (records.length === 0) {
      toast({ title: 'Nothing to delete', description: 'No maintenance records found.' });
      return;
    }
    const confirmed = confirm(`Delete ALL ${records.length} maintenance records? This cannot be undone.`);
    if (!confirmed) return;
    try {
      const { data, error } = await supabase
        .from('maintenance_records')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all user records
        .select('id');
      if (error) throw error;
      const deleted = data?.length ?? 0;
      toast({ title: 'All Records Deleted', description: `Removed all ${deleted} maintenance records.` });
      fetchRecords();
    } catch (err) {
      console.error('Bulk delete all error:', err);
      toast({ title: 'Delete failed', description: 'Could not delete all records.', variant: 'destructive' });
    }
  };
  const getStatusBadge = (status: string, endDate: string | null) => {
    const isExpiring = endDate && new Date(endDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    if (status === 'expired') {
      return <Badge variant="destructive">Expired</Badge>;
    }
    if (status === 'cancelled') {
      return <Badge variant="secondary">Cancelled</Badge>;
    }
    if (isExpiring) {
      return <Badge variant="outline" className="border-orange-500 text-orange-700">Expiring Soon</Badge>;
    }
    return <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleSort = (field: keyof MaintenanceRecord) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedRecords = [...records].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]
    
    if (aValue === null && bValue === null) return 0
    if (aValue === null) return 1
    if (bValue === null) return -1
    
    let comparison = 0
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      comparison = aValue.localeCompare(bValue)
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      comparison = aValue - bValue
    } else {
      comparison = String(aValue).localeCompare(String(bValue))
    }
    
    return sortDirection === 'asc' ? comparison : -comparison
  })

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Software & Hardware Maintenance</h2>
          <p className="text-muted-foreground">
            Track software licenses, hardware warranties, and maintenance schedules
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingRecord(null); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Record
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingRecord ? 'Edit Maintenance Record' : 'Add Maintenance Record'}
              </DialogTitle>
              <DialogDescription>
                Enter details for software licenses or hardware maintenance tracking
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="product_name">Product Name *</Label>
                  <Input
                    id="product_name"
                    value={formData.product_name}
                    onChange={(e) => setFormData({...formData, product_name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="product_type">Type *</Label>
                  <Select 
                    value={formData.product_type} 
                    onValueChange={(value: 'software' | 'hardware') => setFormData({...formData, product_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="software">Software</SelectItem>
                      <SelectItem value="hardware">Hardware</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vendor_name">Vendor/Supplier</Label>
                  <Input
                    id="vendor_name"
                    value={formData.vendor_name}
                    onChange={(e) => setFormData({...formData, vendor_name: e.target.value})}
                    placeholder="e.g., Microsoft, Dell, Adobe"
                  />
                </div>
                <div>
                  <Label htmlFor="account_id">Customer/Account</Label>
                  <Select 
                    value={formData.account_id} 
                    onValueChange={(value) => setFormData({...formData, account_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No customer selected</SelectItem>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cost">Cost</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData({...formData, cost: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value: 'active' | 'expired' | 'cancelled') => setFormData({...formData, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="purchase_date">Purchase Date</Label>
                  <Input
                    id="purchase_date"
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) => setFormData({...formData, purchase_date: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="license_key">License Key / Serial Number</Label>
                  <Input
                    id="license_key"
                    value={formData.product_type === 'software' ? formData.license_key : formData.serial_number}
                    onChange={(e) => setFormData({
                      ...formData, 
                      [formData.product_type === 'software' ? 'license_key' : 'serial_number']: e.target.value
                    })}
                    placeholder={formData.product_type === 'software' ? 'License key...' : 'Serial number...'}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingRecord ? 'Update' : 'Create'} Record
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Records</CardDescription>
            <CardTitle className="text-2xl">{records.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">All maintenance items</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {records.filter(r => r.status === 'active').length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Expiring Soon</CardDescription>
            <CardTitle className="text-2xl text-orange-600">
              {records.filter(r => 
                r.end_date && 
                r.status === 'active' && 
                new Date(r.end_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              ).length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Within 30 days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Cost</CardDescription>
            <CardTitle className="text-2xl">
              {formatCurrency(records.reduce((sum, r) => sum + (r.cost || 0), 0))}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Total investment</p>
          </CardContent>
        </Card>
      </div>

      {/* Records Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Maintenance Records</CardTitle>
          <div className="flex gap-2">
            <Button variant="destructive" onClick={handleBulkDeleteUnknown} disabled={unknownCount === 0}>
              <AlertTriangle className="h-4 w-4 mr-2" /> Delete "Unknown Product" ({unknownCount})
            </Button>
            <Button variant="destructive" onClick={handleDeleteAllRecords} disabled={records.length === 0}>
              <Trash2 className="h-4 w-4 mr-2" /> Delete All Records ({records.length})
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-48">Account Name</TableHead>
                <TableHead className="w-32">Purchase Date</TableHead>
                <TableHead className="w-32">Start Date</TableHead>
                <TableHead className="w-32">End Date</TableHead>
                <TableHead className="w-64">Products</TableHead>
                <TableHead className="w-40">Serial Number</TableHead>
                <TableHead className="w-24">Income</TableHead>
                <TableHead className="w-24">COGS</TableHead>
                <TableHead className="w-24">Profit</TableHead>
                <TableHead className="w-24">Margin %</TableHead>
                <TableHead className="w-64">Notes (Hardware Maintenance)</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.vendor_name || record.accounts?.name || 'N/A'}</TableCell>
                  <TableCell>{formatDate(record.purchase_date)}</TableCell>
                  <TableCell>{formatDate(record.start_date)}</TableCell>
                  <TableCell>{formatDate(record.end_date)}</TableCell>
                  <TableCell className="font-medium">{record.product_name}</TableCell>
                  <TableCell>{record.serial_number || 'N/A'}</TableCell>
                  <TableCell>{formatCurrency(record.income)}</TableCell>
                  <TableCell>{formatCurrency(record.cost)}</TableCell>
                  <TableCell>{formatCurrency(record.profit)}</TableCell>
                  <TableCell>{record.margin_percent != null ? `${record.margin_percent}%` : 'N/A'}</TableCell>
                  <TableCell>{record.notes || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit(record)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(record.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {records.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No maintenance records found. Add your first record to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}