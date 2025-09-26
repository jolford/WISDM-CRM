import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Download, FileText } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MaintenanceRecord {
  product_name: string;
  product_type: 'software' | 'hardware';
  vendor_name?: string;
  purchase_date?: string;
  start_date?: string;
  end_date?: string;
  cost?: number;
  license_key?: string;
  serial_number?: string;
  status: 'active' | 'expired' | 'cancelled';
  notes?: string;
}

export default function MaintenanceImport() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [csvData, setCsvData] = useState("");
  const [previewData, setPreviewData] = useState<MaintenanceRecord[]>([]);

  const sampleCsv = `Account Name,Purchase Date,Start Date,End Date,Products,Serial Number,Income,COGS,Profit,Margin %,Notes (Hardware Maintenance)
Acme Corp,2024-01-15,2024-01-15,2025-01-15,Microsoft Office 365,ABC123-DEF456,599.99,299.99,300.00,50.0%,Enterprise license
Tech Solutions,2023-06-01,2023-06-01,2026-06-01,Dell OptiPlex 7090,SN789XYZ,1599.99,1299.99,300.00,18.75%,3-year warranty
Creative Agency,2024-03-01,2024-03-01,2025-03-01,Adobe Creative Suite,CC2024-789,799.99,599.99,200.00,25.0%,Annual subscription`;

  const parseCsvData = (csvText: string): MaintenanceRecord[] => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const records: MaintenanceRecord[] = [];

    // Create header mapping
    const getHeaderIndex = (searchTerms: string[]) => {
      for (const term of searchTerms) {
        const index = headers.findIndex(h => h.includes(term.toLowerCase()));
        if (index !== -1) return index;
      }
      return -1;
    };

    const accountNameIndex = getHeaderIndex(['account name', 'account']);
    const purchaseDateIndex = getHeaderIndex(['purchase date', 'purchase']);
    const startDateIndex = getHeaderIndex(['start date', 'start']);
    const endDateIndex = getHeaderIndex(['end date', 'end']);
    const productsIndex = getHeaderIndex(['products', 'product name', 'product']);
    const serialNumberIndex = getHeaderIndex(['serial number', 'serial']);
    const incomeIndex = getHeaderIndex(['income', 'revenue']);
    const cogsIndex = getHeaderIndex(['cogs', 'cost']);
    const notesIndex = getHeaderIndex(['notes', 'notes (hardware maintenance)']);

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      
      // Skip empty rows
      if (values.every(v => !v || v === 'N/A')) continue;
      
      const productName = productsIndex >= 0 ? values[productsIndex] : '';
      if (!productName || productName === 'N/A') continue;

      // Determine product type based on product name
      const isHardware = productName.toLowerCase().includes('server') || 
                        productName.toLowerCase().includes('dell') ||
                        productName.toLowerCase().includes('hp') ||
                        productName.toLowerCase().includes('laptop') ||
                        productName.toLowerCase().includes('desktop') ||
                        productName.toLowerCase().includes('router') ||
                        productName.toLowerCase().includes('switch');

      const record: MaintenanceRecord = {
        product_name: productName,
        product_type: isHardware ? 'hardware' : 'software',
        vendor_name: accountNameIndex >= 0 ? values[accountNameIndex] : undefined,
        purchase_date: purchaseDateIndex >= 0 && values[purchaseDateIndex] && values[purchaseDateIndex] !== 'N/A' ? values[purchaseDateIndex] : undefined,
        start_date: startDateIndex >= 0 && values[startDateIndex] && values[startDateIndex] !== 'N/A' ? values[startDateIndex] : undefined,
        end_date: endDateIndex >= 0 && values[endDateIndex] && values[endDateIndex] !== 'N/A' ? values[endDateIndex] : undefined,
        cost: cogsIndex >= 0 && values[cogsIndex] && values[cogsIndex] !== 'N/A' ? parseFloat(values[cogsIndex].replace('$', '').replace(',', '')) : undefined,
        license_key: undefined, // Not provided in this format
        serial_number: serialNumberIndex >= 0 && values[serialNumberIndex] && values[serialNumberIndex] !== 'N/A' ? values[serialNumberIndex] : undefined,
        status: 'active', // Default to active
        notes: notesIndex >= 0 ? values[notesIndex] : undefined
      };

      records.push(record);
    }

    return records;
  };

  const handlePreview = () => {
    try {
      const parsed = parseCsvData(csvData);
      setPreviewData(parsed);
      toast({
        title: "CSV Parsed Successfully",
        description: `Found ${parsed.length} maintenance records`,
      });
    } catch (error) {
      toast({
        title: "Parse Error",
        description: "Failed to parse CSV data. Please check the format.",
        variant: "destructive",
      });
    }
  };

  const handleImport = async () => {
    if (previewData.length === 0) {
      toast({
        title: "No Data",
        description: "Please preview your data first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const recordsToInsert = previewData.map(record => ({
        ...record,
        user_id: user.id,
        renewal_reminder_days: 30
      }));

      const { error } = await supabase
        .from('maintenance_records')
        .insert(recordsToInsert);

      if (error) throw error;

      toast({
        title: "Import Successful",
        description: `Successfully imported ${recordsToInsert.length} maintenance records`,
      });

      setCsvData("");
      setPreviewData([]);
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: "Failed to import maintenance records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadSample = () => {
    const blob = new Blob([sampleCsv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'maintenance_sample.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Maintenance Records
          </CardTitle>
          <CardDescription>
            Import software licenses and hardware maintenance records from CSV
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button variant="outline" onClick={downloadSample} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download Sample CSV
            </Button>
          </div>

          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              <strong>Required CSV Format:</strong> Account Name, Purchase Date (YYYY-MM-DD), Start Date, End Date, Products, Serial Number, Income, COGS, Profit, Margin %, Notes (Hardware Maintenance)
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="csvData">Paste CSV Data</Label>
            <Textarea
              id="csvData"
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              placeholder="Paste your CSV data here..."
              className="min-h-[200px] font-mono text-sm"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handlePreview} disabled={!csvData.trim()}>
              Preview Data
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={previewData.length === 0 || loading}
              variant="default"
            >
              {loading ? "Importing..." : `Import ${previewData.length} Records`}
            </Button>
          </div>
        </CardContent>
      </Card>

      {previewData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Preview ({previewData.length} records)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-border p-2 text-left">Product</th>
                    <th className="border border-border p-2 text-left">Type</th>
                    <th className="border border-border p-2 text-left">Vendor</th>
                    <th className="border border-border p-2 text-left">End Date</th>
                    <th className="border border-border p-2 text-left">Cost</th>
                    <th className="border border-border p-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.slice(0, 10).map((record, index) => (
                    <tr key={index}>
                      <td className="border border-border p-2">{record.product_name}</td>
                      <td className="border border-border p-2">{record.product_type}</td>
                      <td className="border border-border p-2">{record.vendor_name || 'N/A'}</td>
                      <td className="border border-border p-2">{record.end_date || 'N/A'}</td>
                      <td className="border border-border p-2">{record.cost ? `$${record.cost}` : 'N/A'}</td>
                      <td className="border border-border p-2">{record.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {previewData.length > 10 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Showing first 10 records. {previewData.length - 10} more will be imported.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}