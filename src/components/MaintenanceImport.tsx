import { useState, ChangeEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Download, FileText } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Papa from "papaparse";

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
    // Strip BOM and split lines
    const raw = csvText.replace(/^\uFEFF/, '');
    const lines = raw.split(/\r?\n/);

    // Find the real header row (skip preface blank/comma-only rows)
    let headerIndex = lines.findIndex((line) => {
      const l = line.replace(/^\uFEFF/, '').trim().toLowerCase();
      return l.includes('account name') && l.includes('products') && l.includes('serial number');
    });
    if (headerIndex === -1) {
      headerIndex = lines.findIndex((line) => /account\s*name/i.test(line) && /products?/i.test(line));
      if (headerIndex === -1) headerIndex = 0;
    }

    const headerLine = lines[headerIndex] || '';
    const detectedDelimiter = headerLine.includes('\t') ? '\t' : (headerLine.includes(';') && !headerLine.includes(',')) ? ';' : ',';

    const textToParse = lines.slice(headerIndex).join('\n');

    const result = Papa.parse<Record<string, string>>(textToParse, {
      header: true,
      skipEmptyLines: true,
      delimiter: detectedDelimiter,
      transformHeader: (h: string) => h.replace(/\uFEFF/g, '').trim().replace(/\s+/g, ' ').toLowerCase(),
    });

    const rows = (result.data || []) as Record<string, string>[];

    const norm = (s?: string) => (s ? s.trim() : undefined);

    const normalizeDate = (val?: string) => {
      const v = norm(val);
      if (!v || v.toUpperCase() === 'N/A') return undefined;
      const d = new Date(v);
      if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
      const parts = v.replace(/\./g, '/').replace(/-/g, '/').split('/');
      if (parts.length === 3) {
        let [a, b, c] = parts.map((s) => s.trim());
        if (c.length === 2) c = `20${c}`;
        if (parseInt(a, 10) > 12) { const t = a; a = b; b = t; }
        const dd = String(parseInt(b, 10)).padStart(2, '0');
        const mm = String(parseInt(a, 10)).padStart(2, '0');
        const yyyy = String(parseInt(c, 10)).padStart(4, '0');
        return `${yyyy}-${mm}-${dd}`;
      }
      return undefined;
    };

    const parseMoney = (val?: string) => {
      const v = norm(val);
      if (!v || v.toUpperCase() === 'N/A') return undefined;
      const cleaned = v.replace(/[$,%\s]/g, '').replace(/,/g, '');
      const num = parseFloat(cleaned);
      return isNaN(num) ? undefined : num;
    };

    const get = (obj: Record<string, string>, keys: string[]) => {
      for (const k of keys) {
        const found = Object.keys(obj).find((h) => h.trim() === k.toLowerCase());
        if (found) {
          const v = obj[found];
          if (v != null && String(v).trim() !== '') return String(v).trim();
        }
      }
      return undefined;
    };

    const isHardwareName = (name: string) => {
      const n = name.toLowerCase();
      return ['server','dell','hp','lenovo','laptop','desktop','router','switch','firewall','ap','access point'].some(w => n.includes(w));
    };

    const records: MaintenanceRecord[] = [];

    for (const row of rows) {
      const productName = get(row, ['products', 'product', 'product name']) || '';
      if (!productName) continue;

      const record: MaintenanceRecord = {
        product_name: productName,
        product_type: isHardwareName(productName) ? 'hardware' : 'software',
        vendor_name: get(row, ['account name', 'account']),
        purchase_date: normalizeDate(get(row, ['purchase date', 'purchase'])),
        start_date: normalizeDate(get(row, ['start date', 'start'])),
        end_date: normalizeDate(get(row, ['end date', 'end'])),
        cost: parseMoney(get(row, ['cogs', 'cost'])),
        license_key: undefined,
        serial_number: get(row, ['serial number', 'serial']),
        status: 'active',
        notes: get(row, ['notes (hardware maintenance)', 'notes']),
      };

      records.push(record);
    }

    return records;
  };

  const onFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      const text = await file.text();
      setCsvData(text);
      const parsed = parseCsvData(text);
      setPreviewData(parsed);
      if (parsed.length === 0) {
        toast({ title: "No rows detected", description: "Check the delimiter (tabs vs commas) and headers.", variant: "destructive" });
      } else {
        toast({ title: "CSV Parsed Successfully", description: `Found ${parsed.length} maintenance records` });
      }
    } catch (err) {
      toast({ title: "File Read Error", description: "Failed to read the CSV file.", variant: "destructive" });
    }
  };

  const handlePreview = () => {
    try {
      const parsed = parseCsvData(csvData);
      setPreviewData(parsed);
      if (parsed.length === 0) {
        toast({ title: "No rows detected", description: "Check the delimiter (tabs vs commas) and headers.", variant: "destructive" });
      } else {
        toast({
          title: "CSV Parsed Successfully",
          description: `Found ${parsed.length} maintenance records`,
        });
      }
    } catch (error) {
      toast({
        title: "Parse Error",
        description: "Failed to parse CSV/TSV data. Please check the format.",
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

      // Notify other components to refresh
      window.dispatchEvent(new CustomEvent('maintenance:imported'));
      // Notify other components to refresh
      window.dispatchEvent(new CustomEvent('maintenance:imported'));

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
              <strong>Required Columns (CSV or TSV):</strong> Account Name, Purchase Date (YYYY-MM-DD), Start Date, End Date, Products, Serial Number, Income, COGS, Profit, Margin %, Notes (Hardware Maintenance)
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="csvFile">Upload CSV File</Label>
            <Input id="csvFile" type="file" accept=".csv" onChange={onFileChange} />
            <p className="text-sm text-muted-foreground">Or paste CSV below</p>
          </div>

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