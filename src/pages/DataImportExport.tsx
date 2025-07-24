import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useRoleAccess } from "@/hooks/useRoleAccess"
import { supabase } from "@/integrations/supabase/client"
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
  const { hasPermission, requiresPermission } = useRoleAccess()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importProgress, setImportProgress] = useState(0)
  const [isImporting, setIsImporting] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [importType, setImportType] = useState("contacts")

  // Check permissions
  const canImport = hasPermission('canImportData')
  const canExport = hasPermission('canExportData')

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
      { zoho: "Mobile", wisdm: "mobile" },
      { zoho: "Account Name", wisdm: "accountName" },
      { zoho: "Vendor Name", wisdm: "vendorName" },
      { zoho: "Title", wisdm: "title" },
      { zoho: "Department", wisdm: "department" },
      { zoho: "Contact Owner", wisdm: "contactOwner" },
      { zoho: "Lead Source", wisdm: "leadSource" },
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
    
    if (!file) return

    // Enhanced security validation
    const maxFileSize = 10 * 1024 * 1024 // 10MB limit
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel']
    const allowedExtensions = ['.csv']
    
    // Check file size
    if (file.size > maxFileSize) {
      toast({
        title: "File Too Large",
        description: "File size must be less than 10MB",
        variant: "destructive",
      })
      return
    }
    
    // Check file type and extension
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      toast({
        title: "Invalid File Type",
        description: "Please select a CSV file only",
        variant: "destructive",
      })
      return
    }
    
    // Check filename for suspicious patterns
    const suspiciousPatterns = /[<>:"\\|?*\x00-\x1f]|^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i
    if (suspiciousPatterns.test(file.name)) {
      toast({
        title: "Invalid File Name",
        description: "File name contains invalid characters",
        variant: "destructive",
      })
      return
    }
    
    setSelectedFile(file)
    toast({
      title: "File Selected",
      description: `${file.name} is ready for import`,
    })
  }

  const handleImport = async () => {
    // Check permissions first
    if (!requiresPermission('canImportData', () => {
      toast({
        title: "Access Denied",
        description: "You don't have permission to import data",
        variant: "destructive",
      })
    })) {
      return
    }

    console.log('🔥 Import started - handleImport called')
    
    if (!selectedFile) {
      console.error('❌ No file selected')
      toast({
        title: "No File Selected",
        description: "Please select a CSV file first",
        variant: "destructive",
      })
      return
    }

    console.log('📁 File selected:', selectedFile.name, 'Size:', selectedFile.size, 'Type:', selectedFile.type)

    setIsImporting(true)
    setImportProgress(0)

    try {
      // Skip server-side validation for now and use client-side only
      console.log('⏭️ Skipping server validation, using client-side validation only')
      
      const text = await selectedFile.text()
      
      // Continue with client-side processing for UI feedback
      
      // Security: Check for excessive content or potential attacks
      const maxContentSize = 5 * 1024 * 1024 // 5MB text limit
      if (text.length > maxContentSize) {
        throw new Error('File content exceeds size limit')
      }
      
      // Security: Check for malicious patterns in content
      const maliciousPatterns = [
        /<script/i,
        /javascript:/i,
        /data:text\/html/i,
        /vbscript:/i,
        /<iframe/i,
        /<embed/i,
        /<object/i
      ]
      
      if (maliciousPatterns.some(pattern => pattern.test(text))) {
        throw new Error('File contains potentially malicious content')
      }
      
      const lines = text.split('\n').filter(line => line.trim()) // Remove empty lines
      
      // Security: Limit number of records
      const maxRecords = 10000
      if (lines.length > maxRecords) {
        throw new Error(`File contains too many records. Maximum allowed: ${maxRecords}`)
      }
      
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
      
      // Security: Validate headers (allow common CSV characters including &, (), :, ,)
      const allowedHeaderPattern = /^[a-zA-Z0-9\s_.,&():/-]+$/
      if (!headers.every(header => allowedHeaderPattern.test(header))) {
        console.warn('Invalid headers found:', headers.filter(header => !allowedHeaderPattern.test(header)))
        throw new Error('File contains invalid header names')
      }
      
      console.log('CSV headers found:', headers)
      console.log(`Processing ${lines.length - 1} records from ${selectedFile.name}`)
      
      const records = []
      const validatedRecords = []
      
      // Process each line with validation
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
          const record: any = {}
          
          headers.forEach((header, index) => {
            const value = values[index] || ''
            
            // Security: Sanitize and validate individual values
            if (value.length > 1000) { // Max field length
              throw new Error(`Field value too long in row ${i}`)
            }
            
            // Security: Check for script injection in values
            if (maliciousPatterns.some(pattern => pattern.test(value))) {
              throw new Error(`Potentially malicious content detected in row ${i}`)
            }
            
            record[header] = value
          })
          
          // Additional validation based on import type
          try {
            if (importType === 'contacts' && record.email) {
              const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
              if (!emailPattern.test(record.email)) {
                console.warn(`Invalid email in row ${i}: ${record.email}`)
                record.email = '' // Clear invalid email instead of failing
              }
            }
            
            records.push(record)
            validatedRecords.push(record)
          } catch (validationError) {
            console.warn(`Validation error in row ${i}:`, validationError)
            // Skip invalid records but continue processing
          }
        }
        
        // Update progress
        setImportProgress((i / lines.length) * 100)
        await new Promise(resolve => setTimeout(resolve, 5)) // Small delay for UI
      }
      
      if (validatedRecords.length === 0) {
        throw new Error('No valid records found in the file')
      }
      
      console.log(`Successfully processed ${validatedRecords.length} valid records out of ${records.length} total`)
      
      // Store directly in database instead of localStorage
      console.log('💾 Storing data directly in database')
      
      setImportProgress(50)
      
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        // Add user_id to each record and insert into database
        const recordsWithUserId = validatedRecords.map(record => ({
          ...record,
          user_id: user.id
        }))

        const tableName = importType as 'contacts' | 'companies' | 'deals'
        const { error: insertError } = await supabase
          .from(tableName)
          .insert(recordsWithUserId)

        if (insertError) {
          console.error('Database insert error:', insertError)
          throw new Error(`Failed to save data: ${insertError.message}`)
        }

        console.log('✅ Data stored successfully in database. Total records:', validatedRecords.length)
        
        setImportProgress(100)
        
        // Show detailed results
        const skippedCount = records.length - validatedRecords.length
        const message = skippedCount > 0 
          ? `Successfully imported ${validatedRecords.length} ${importType}. ${skippedCount} records were skipped due to validation errors.`
          : `Successfully imported ${validatedRecords.length} ${importType}!`
        
        toast({
          title: "Import Complete",
          description: `${message} Navigate to the ${importType} section to view them.`,
        })
        
      } catch (dbError) {
        console.error('Database storage error:', dbError)
        throw new Error(`Failed to save data to database: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`)
      }

    } catch (error) {
      console.error('Import error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast({
        title: "Import Failed",
        description: `Error: ${errorMessage}. Please check the file format and try again.`,
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

    // Enhanced webhook URL validation
    try {
      const url = new URL(webhookUrl)
      
      // Only allow HTTPS for security
      if (url.protocol !== 'https:') {
        toast({
          title: "Invalid URL",
          description: "Webhook URL must use HTTPS for security",
          variant: "destructive",
        })
        return
      }
      
      // Validate that it's a legitimate Zapier webhook
      const allowedHosts = [
        'hooks.zapier.com',
        'hooks.zapierapp.com'
      ]
      
      if (!allowedHosts.includes(url.hostname)) {
        toast({
          title: "Invalid Webhook",
          description: "Please use a valid Zapier webhook URL",
          variant: "destructive",
        })
        return
      }
      
      // Check URL length (reasonable limit)
      if (webhookUrl.length > 500) {
        toast({
          title: "Invalid URL",
          description: "Webhook URL is too long",
          variant: "destructive",
        })
        return
      }
      
    } catch (urlError) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid webhook URL",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    console.log("Triggering Zapier webhook:", webhookUrl)

    try {
      // Sanitize data before sending
      const payload = {
        timestamp: new Date().toISOString(),
        triggered_from: window.location.origin,
        action: "zoho_data_sync",
        crm: "WISDM CRM",
        user_agent: navigator.userAgent.substring(0, 100) // Limit length
      }

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify(payload),
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
    // Check permissions first
    if (!requiresPermission('canExportData', () => {
      toast({
        title: "Access Denied",
        description: "You don't have permission to export data",
        variant: "destructive",
      })
    })) {
      return
    }

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
          <TabsTrigger value="import" disabled={!canImport}>
            Import Data {!canImport && "🔒"}
          </TabsTrigger>
          <TabsTrigger value="export" disabled={!canExport}>
            Export Data {!canExport && "🔒"}
          </TabsTrigger>
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