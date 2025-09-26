import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Calendar, Building, Package, Clock, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface MaintenanceRecord {
  id: string;
  product_name: string;
  product_type: string;
  vendor_name: string | null;
  end_date: string;
  status: string;
  account_id: string | null;
  account_name: string | null;
  cost: number | null;
  daysUntilExpiry: number;
}

interface ExpirationGroup {
  title: string;
  period: string;
  records: MaintenanceRecord[];
  badgeVariant: "default" | "secondary" | "destructive" | "outline";
  icon: React.ReactNode;
}

const MaintenanceExpirationReport: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [maintenanceData, setMaintenanceData] = useState<MaintenanceRecord[]>([]);
  const [expirationGroups, setExpirationGroups] = useState<ExpirationGroup[]>([]);
  const [activeTab, setActiveTab] = useState("30-days");

  useEffect(() => {
    if (user) {
      fetchMaintenanceData();
    }
  }, [user]);

  const fetchMaintenanceData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('maintenance_records')
        .select(`
          id,
          product_name,
          product_type,
          vendor_name,
          end_date,
          status,
          account_id,
          cost,
          accounts (
            name
          )
        `)
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .not('end_date', 'is', null)
        .order('end_date', { ascending: true });

      if (error) throw error;

      const today = new Date();
      const processedData: MaintenanceRecord[] = (data || []).map(record => {
        const endDate = new Date(record.end_date);
        const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          ...record,
          account_name: record.accounts?.name || null,
          daysUntilExpiry
        };
      });

      setMaintenanceData(processedData);
      groupByExpiration(processedData);
    } catch (error) {
      console.error('Error fetching maintenance data:', error);
      toast({
        title: "Error",
        description: "Failed to load maintenance data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const groupByExpiration = (data: MaintenanceRecord[]) => {
    const groups: ExpirationGroup[] = [
      {
        title: "Expired",
        period: "overdue",
        records: data.filter(r => r.daysUntilExpiry < 0),
        badgeVariant: "destructive",
        icon: <AlertTriangle className="h-4 w-4" />
      },
      {
        title: "Expiring in 30 Days",
        period: "30-days",
        records: data.filter(r => r.daysUntilExpiry >= 0 && r.daysUntilExpiry <= 30),
        badgeVariant: "destructive",
        icon: <Clock className="h-4 w-4" />
      },
      {
        title: "Expiring in 60 Days",
        period: "60-days",
        records: data.filter(r => r.daysUntilExpiry > 30 && r.daysUntilExpiry <= 60),
        badgeVariant: "secondary",
        icon: <Calendar className="h-4 w-4" />
      },
      {
        title: "Expiring in 90 Days",
        period: "90-days",
        records: data.filter(r => r.daysUntilExpiry > 60 && r.daysUntilExpiry <= 90),
        badgeVariant: "outline",
        icon: <Calendar className="h-4 w-4" />
      },
      {
        title: "Future Expirations",
        period: "future",
        records: data.filter(r => r.daysUntilExpiry > 90),
        badgeVariant: "default",
        icon: <Calendar className="h-4 w-4" />
      }
    ];

    setExpirationGroups(groups);
  };

  const exportToCSV = () => {
    const csvData = maintenanceData.map(record => ({
      'Product Name': record.product_name,
      'Product Type': record.product_type,
      'Vendor': record.vendor_name || 'N/A',
      'Account': record.account_name || 'N/A',
      'Expiration Date': new Date(record.end_date).toLocaleDateString(),
      'Days Until Expiry': record.daysUntilExpiry,
      'Cost': record.cost ? `$${record.cost.toLocaleString()}` : 'N/A',
      'Status': record.status
    }));

    const csvContent = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).map(value => `"${value}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `maintenance-expiration-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getExpirationBadge = (days: number) => {
    if (days < 0) return <Badge variant="destructive">Expired</Badge>;
    if (days <= 30) return <Badge variant="destructive">{days} days</Badge>;
    if (days <= 60) return <Badge variant="secondary">{days} days</Badge>;
    if (days <= 90) return <Badge variant="outline">{days} days</Badge>;
    return <Badge variant="default">{days} days</Badge>;
  };

  const formatCurrency = (amount: number | null) => {
    return amount ? `$${amount.toLocaleString()}` : 'N/A';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading maintenance expiration report...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Maintenance Expiration Report</h2>
          <p className="text-muted-foreground">Track upcoming maintenance renewals and expirations</p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {expirationGroups.map((group) => (
          <Card 
            key={group.period} 
            className="relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/20"
            onClick={() => setActiveTab(group.period)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                {group.icon}
                <CardTitle className="text-sm font-medium">{group.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{group.records.length}</div>
              <Badge variant={group.badgeVariant} className="mt-1">
                {group.records.length === 1 ? '1 item' : `${group.records.length} items`}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {expirationGroups.map((group) => (
            <TabsTrigger key={group.period} value={group.period}>
              {group.title} ({group.records.length})
            </TabsTrigger>
          ))}
        </TabsList>

        {expirationGroups.map((group) => (
          <TabsContent key={group.period} value={group.period} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {group.icon}
                  {group.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {group.records.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No maintenance records in this category
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Account</TableHead>
                        <TableHead>Expiration</TableHead>
                        <TableHead>Days</TableHead>
                        <TableHead>Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.records.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4" />
                              {record.product_name}
                            </div>
                          </TableCell>
                          <TableCell>{record.product_type}</TableCell>
                          <TableCell>{record.vendor_name || 'N/A'}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4" />
                              {record.account_name || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(record.end_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {getExpirationBadge(record.daysUntilExpiry)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(record.cost)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Summary Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">
                {expirationGroups[0]?.records.length + expirationGroups[1]?.records.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Critical (Expired + 30 days)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {maintenanceData.reduce((sum, record) => sum + (record.cost || 0), 0).toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0
                })}
              </div>
              <div className="text-sm text-muted-foreground">Total Annual Cost</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {new Set(maintenanceData.map(r => r.account_name).filter(Boolean)).size}
              </div>
              <div className="text-sm text-muted-foreground">Accounts Affected</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenanceExpirationReport;