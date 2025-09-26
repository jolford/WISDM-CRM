import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Share2, 
  Printer, 
  FileImage, 
  FileText, 
  Mail,
  Presentation,
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp,
  Calendar,
  Filter,
  Maximize2,
  Eye
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface SpectacularExportProps {
  reportData: any[];
  charts: any[];
  reportTitle: string;
  reportDescription?: string;
  onPreview: () => void;
}

const SpectacularExport: React.FC<SpectacularExportProps> = ({
  reportData,
  charts,
  reportTitle,
  reportDescription,
  onPreview
}) => {
  const { toast } = useToast();
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const exportToCSV = () => {
    if (!reportData || reportData.length === 0) {
      toast({
        title: "No Data",
        description: "No data available to export",
        variant: "destructive"
      });
      return;
    }

    const headers = Object.keys(reportData[0]);
    const csvContent = [
      headers.join(','),
      ...reportData.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${reportTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Successful",
      description: "CSV file has been downloaded",
    });
  };

  const exportToExcel = () => {
    if (!reportData || reportData.length === 0) {
      toast({
        title: "No Data", 
        description: "No data available to export",
        variant: "destructive"
      });
      return;
    }

    // Create Excel-compatible CSV with UTF-8 BOM
    const headers = Object.keys(reportData[0]);
    const csvContent = '\uFEFF' + [
      headers.join('\t'),
      ...reportData.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && (value.includes(',') || value.includes('\t'))
            ? `"${value}"` 
            : value;
        }).join('\t')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/tab-separated-values;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${reportTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.xlsx`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Successful",
      description: "Excel file has been downloaded",
    });
  };

  const exportToPDF = async () => {
    if (!reportRef.current) return;

    setIsExporting(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Add title page
      pdf.setFontSize(24);
      pdf.text(reportTitle, 20, 30);
      
      if (reportDescription) {
        pdf.setFontSize(12);
        pdf.text(reportDescription, 20, 45);
      }
      
      pdf.setFontSize(10);
      pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, 280);
      pdf.text(`Total Records: ${reportData.length}`, 120, 280);

      // Calculate dimensions
      const imgWidth = 170;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add report content on new page
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 20, 20, imgWidth, imgHeight);

      pdf.save(`${reportTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_report.pdf`);

      toast({
        title: "PDF Export Successful",
        description: "PDF report has been downloaded",
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to generate PDF report",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsImage = async () => {
    if (!reportRef.current) return;

    setIsExporting(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const link = document.createElement('a');
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', `${reportTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.png`);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          toast({
            title: "Image Export Successful",
            description: "Report image has been downloaded",
          });
        }
      }, 'image/png', 0.95);
    } catch (error) {
      console.error('Image export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to generate report image",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const shareReport = () => {
    const shareData = {
      title: reportTitle,
      text: reportDescription || 'Check out this comprehensive business report',
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Report link has been copied to clipboard",
      });
    }
  };

  const printReport = () => {
    window.print();
  };

  const emailReport = () => {
    const subject = encodeURIComponent(`Business Report: ${reportTitle}`);
    const body = encodeURIComponent(
      `Please find the business report below:\n\n` +
      `Report: ${reportTitle}\n` +
      `${reportDescription ? `Description: ${reportDescription}\n` : ''}` +
      `Generated: ${new Date().toLocaleString()}\n` +
      `Records: ${reportData.length}\n\n` +
      `View the full interactive report: ${window.location.href}`
    );
    
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" onClick={onPreview}>
        <Eye className="h-4 w-4 mr-2" />
        Preview
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button disabled={isExporting}>
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Export Formats</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={exportToCSV}>
            <FileText className="h-4 w-4 mr-2" />
            Export as CSV
            <Badge variant="secondary" className="ml-auto">Excel</Badge>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={exportToExcel}>
            <FileText className="h-4 w-4 mr-2 text-green-600" />
            Export as Excel
            <Badge variant="secondary" className="ml-auto">XLSX</Badge>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={exportToPDF}>
            <FileText className="h-4 w-4 mr-2 text-red-600" />
            Export as PDF
            <Badge variant="secondary" className="ml-auto">PDF</Badge>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={exportAsImage}>
            <FileImage className="h-4 w-4 mr-2 text-blue-600" />
            Export as Image
            <Badge variant="secondary" className="ml-auto">PNG</Badge>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Share Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={shareReport}>
            <Share2 className="h-4 w-4 mr-2" />
            Share Report
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={emailReport}>
            <Mail className="h-4 w-4 mr-2" />
            Email Report
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={printReport}>
            <Printer className="h-4 w-4 mr-2" />
            Print Report
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Hidden div for PDF/Image generation */}
      <div 
        ref={reportRef} 
        className="fixed -left-[9999px] -top-[9999px] w-[794px] bg-white p-8 print:relative print:left-0 print:top-0"
        style={{ fontFamily: 'Arial, sans-serif' }}
      >
        <div className="space-y-6">
          <div className="text-center border-b pb-4">
            <h1 className="text-3xl font-bold text-gray-800">{reportTitle}</h1>
            {reportDescription && (
              <p className="text-gray-600 mt-2">{reportDescription}</p>
            )}
            <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
              <span>Generated: {new Date().toLocaleString()}</span>
              <span>Total Records: {reportData.length}</span>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 my-6">
            <div className="text-center p-4 border rounded">
              <div className="text-2xl font-bold text-blue-600">{reportData.length}</div>
              <div className="text-sm text-gray-600">Total Records</div>
            </div>
            <div className="text-center p-4 border rounded">
              <div className="text-2xl font-bold text-green-600">{charts.length}</div>
              <div className="text-sm text-gray-600">Visualizations</div>
            </div>
            <div className="text-center p-4 border rounded">
              <div className="text-2xl font-bold text-purple-600">{Object.keys(reportData[0] || {}).length}</div>
              <div className="text-sm text-gray-600">Data Points</div>
            </div>
          </div>

          {/* Charts would be rendered here */}
          {charts.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Visual Analysis</h2>
              {charts.map((chart, index) => (
                <div key={index} className="p-4 border rounded bg-gray-50">
                  <div className="text-lg font-medium text-gray-700 mb-2">
                    {chart.chart_title || `Chart ${index + 1}`}
                  </div>
                  <div className="h-64 bg-white rounded border flex items-center justify-center text-gray-500">
                    Chart Visualization ({chart.chart_type})
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Data Table */}
          {reportData.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-800">Data Summary</h2>
              <div className="overflow-hidden border rounded">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(reportData[0]).map(key => (
                        <th key={key} className="px-3 py-2 text-left font-medium text-gray-700 border-b">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.slice(0, 20).map((row, index) => (
                      <tr key={index} className="border-b">
                        {Object.values(row).map((value, cellIndex) => (
                          <td key={cellIndex} className="px-3 py-2 text-gray-600">
                            {typeof value === 'number' && value > 1000 
                              ? new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: 'USD',
                                  minimumFractionDigits: 0
                                }).format(value)
                              : String(value)
                            }
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {reportData.length > 20 && (
                  <div className="p-3 bg-gray-50 text-center text-gray-600 text-sm">
                    ... and {reportData.length - 20} more records
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="text-center text-xs text-gray-400 border-t pt-4">
            This report was generated by WISDM CRM Analytics Platform
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpectacularExport;