import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { 
  Upload, 
  Download, 
  FileText, 
  Database, 
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Zap,
  Users,
  Building2,
  Target,
  RefreshCw
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
import { Progress } from "@/components/ui/progress"

export default function DataImportExport() {
  const { toast } = useToast()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importProgress, setImportProgress] = useState(0)
  const [isImporting, setIsImporting] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [importType, setImportType] = useState("contacts")

  const importSteps = [
    {
      step: 1,
      title: "Export from Zoho CRM",
      description: "Go to Zoho CRM → Setup → Data Administration → Export Data",
      icon: Download,
      status: "pending"
    },
    {
      step: 2,
      title: "Download CSV File",
      description: "Select your data type (Contacts, Companies, Deals) and download CSV",
      icon: FileText,
      status: "pending"
    },
    {
      step: 3,
      title: "Upload to WISDM CRM",
      description: "Use the upload feature below to import your data",
      icon: Upload,
      status: "pending"
    },
    {
      step: 4,
      title: "Review & Map Fields",
      description: "Verify data mapping and import into your CRM",
      icon: CheckCircle,
      status: "pending"
    }
  ]

  const sampleMappings = {
    contacts: [
      { zoho: "First Name", wisdm: "firstName" },
      { zoho: "Last Name", wisdm: "lastName" },
      { zoho: "Email", wisdm: "email" },
      { zoho: "Phone", wisdm: "phone" },
      { zoho: "Account Name", wisdm: "company" },
      { zoho: "Title", wisdm: "position" },
    ],
    companies: [
      { zoho: "Account Name", wisdm: "name" },
      { zoho: "Website", wisdm: "website" },
      { zoho: "Industry", wisdm: "industry" },
      { zoho: "Employees", wisdm: "size" },
      { zoho: "Annual Revenue", wisdm: "revenue" },
    ],
    deals: [
      { zoho: "Deal Name", wisdm: "name" },
      { zoho: "Account Name", wisdm: "company" },
      { zoho: "Amount", wisdm: "value" },
      { zoho: "Stage", wisdm: "stage" },
      { zoho: "Closing Date", wisdm: "closeDate" },
      { zoho: "Probability", wisdm: "probability" },
    ]
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === "text/csv") {
      setSelectedFile(file)
      toast({
        title: "File Selected",
        description: `${file.name} is ready for import`,
      })
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a CSV file",
        variant: "destructive",
      })
    }
  }

  const handleImport = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a CSV file first",
        variant: "destructive",
      })
      return
    }

    setIsImporting(true)
    setImportProgress(0)

    try {
      // Read the CSV file
      const text = await selectedFile.text()
      const lines = text.split('\n')
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
      
      console.log('CSV headers found:', headers)
      console.log(`Processing ${lines.length - 1} records from ${selectedFile.name}`)
      
      const records = []
      
      // Process each line
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
          const record: any = {}
          
          headers.forEach((header, index) => {
            record[header] = values[index] || ''
          })
          
          records.push(record)
        }
        
        // Update progress
        setImportProgress((i / lines.length) * 100)
        await new Promise(resolve => setTimeout(resolve, 10)) // Small delay for UI
      }
      
      console.log(`Successfully processed ${records.length} records:`, records.slice(0, 3))
      
      // Store in localStorage for now (in a real app, this would go to a database)
      const existingData = localStorage.getItem(`wisdm_${importType}`) || '[]'
      const currentData = JSON.parse(existingData)
      const newData = [...currentData, ...records]
      localStorage.setItem(`wisdm_${importType}`, JSON.stringify(newData))
      
      setImportProgress(100)
      toast({
        title: "Import Complete",
        description: `Successfully imported ${records.length} ${importType} from ${selectedFile.name}. Navigate to the ${importType} section to view them.`,
      })
      
    } catch (error) {
      console.error('Import error:', error)
      toast({
        title: "Import Failed",
        description: "There was an error processing your CSV file. Please check the format and try again.",
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
    }
  }

  const handleZapierTrigger = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!webhookUrl) {
      toast({
        title: "Error",
        description: "Please enter your Zapier webhook URL",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    console.log("Triggering Zapier webhook:", webhookUrl)

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          triggered_from: window.location.origin,
          action: "zoho_data_sync",
          crm: "WISDM CRM",
        }),
      })

      toast({
        title: "Zapier Triggered",
        description: "The automation was triggered. Check your Zap's history to confirm it ran successfully.",
      })
    } catch (error) {
      console.error("Error triggering webhook:", error)
      toast({
        title: "Error",
        description: "Failed to trigger the Zapier webhook. Please check the URL and try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const exportData = (dataType: string) => {
    // Simulate export
    toast({
      title: "Export Started",
      description: `Exporting ${dataType} data to CSV file...`,
    })
    
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: `${dataType} data has been exported successfully`,
      })
    }, 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Import & Export</h1>
          <p className="text-muted-foreground">Migrate data from Zoho CRM or other systems</p>
        </div>
      </div>

      <Tabs defaultValue="import" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="import">Import Data</TabsTrigger>
          <TabsTrigger value="export">Export Data</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-6">
          {/* Migration Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Zoho CRM Migration Guide
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {importSteps.map((step) => (
                  <div key={step.step} className="flex flex-col items-center text-center p-4 border rounded-lg">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                      <step.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-medium mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Upload CSV File</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Data Type</Label>
                <Select value={importType} onValueChange={setImportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contacts">Contacts</SelectItem>
                    <SelectItem value="companies">Companies</SelectItem>
                    <SelectItem value="deals">Deals</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="csvFile">Choose CSV File</Label>
                <Input
                  id="csvFile"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="cursor-pointer"
                />
              </div>

              {selectedFile && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">File Ready: {selectedFile.name}</span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    Size: {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              )}

              {isImporting && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Import Progress</span>
                    <span className="text-sm text-muted-foreground">{importProgress}%</span>
                  </div>
                  <Progress value={importProgress} className="w-full" />
                </div>
              )}

              <Button 
                onClick={handleImport} 
                disabled={!selectedFile || isImporting}
                className="w-full"
              >
                {isImporting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Data
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Field Mapping */}
          <Card>
            <CardHeader>
              <CardTitle>Field Mapping Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Here's how your Zoho CRM fields will map to WISDM CRM:
                </p>
                {sampleMappings[importType as keyof typeof sampleMappings].map((mapping, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{mapping.zoho}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{mapping.wisdm}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export WISDM CRM Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-6 border-2 border-dashed rounded-lg hover:border-primary transition-colors cursor-pointer" onClick={() => exportData("contacts")}>
                  <Users className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                  <h3 className="font-medium mb-2">Export Contacts</h3>
                  <p className="text-sm text-muted-foreground">Download all contact data as CSV</p>
                  <Button variant="outline" className="mt-3">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>

                <div className="text-center p-6 border-2 border-dashed rounded-lg hover:border-primary transition-colors cursor-pointer" onClick={() => exportData("companies")}>
                  <Building2 className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                  <h3 className="font-medium mb-2">Export Companies</h3>
                  <p className="text-sm text-muted-foreground">Download all company data as CSV</p>
                  <Button variant="outline" className="mt-3">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>

                <div className="text-center p-6 border-2 border-dashed rounded-lg hover:border-primary transition-colors cursor-pointer" onClick={() => exportData("deals")}>
                  <Target className="h-12 w-12 mx-auto mb-4 text-green-600" />
                  <h3 className="font-medium mb-2">Export Deals</h3>
                  <p className="text-sm text-muted-foreground">Download all deal data as CSV</p>
                  <Button variant="outline" className="mt-3">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Zapier Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Set Up Automated Data Sync</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Use Zapier to automatically sync data between Zoho CRM and WISDM CRM. 
                      Create a Zap with a webhook trigger and connect it below.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleZapierTrigger} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">Zapier Webhook URL</Label>
                  <Input
                    id="webhookUrl"
                    type="url"
                    placeholder="https://hooks.zapier.com/hooks/catch/..."
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Get this URL from your Zapier webhook trigger
                  </p>
                </div>

                <Button type="submit" disabled={isLoading || !webhookUrl}>
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Triggering...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Trigger Sync
                    </>
                  )}
                </Button>
              </form>

              <div className="space-y-3">
                <h4 className="font-medium">How to Set Up Zapier Integration:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Go to Zapier.com and create a new Zap</li>
                  <li>Choose "Webhooks by Zapier" as the trigger</li>
                  <li>Select "Catch Hook" and copy the webhook URL</li>
                  <li>Add Zoho CRM as the action app</li>
                  <li>Configure the data sync you want</li>
                  <li>Paste the webhook URL above and test</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}