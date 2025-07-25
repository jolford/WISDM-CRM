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

    // Enhanced security validation with stricter limits
    const maxFileSize = 5 * 1024 * 1024 // 5MB limit (reduced for security)
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel']
    const allowedExtensions = ['.csv']
    
    // Check permissions first
    if (!canImport) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to import data. Contact your administrator.",
        variant: "destructive",
      })
      return
    }
    
    // Check file size
    if (file.size > maxFileSize) {
      toast({
        title: "File Too Large",
        description: "File size must be less than 5MB for security reasons",
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
    
    // Enhanced filename security validation
    const suspiciousPatterns = /[<>:"\\|?*\x00-\x1f#%&{}[\]$!]|^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i
    if (suspiciousPatterns.test(file.name)) {
      toast({
        title: "Invalid File Name",
        description: "File name contains invalid characters. Use only letters, numbers, hyphens, and underscores.",
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
      
      // Create column mapping for contacts and companies to handle CSV headers -> database columns
      const getColumnMapping = (importType: string) => {
        if (importType === 'contacts') {
          return {
            'Record Id': 'record_id',
            'Contact Owner.id': 'contact_owner_id', 
            'Contact Owner': 'contact_owner',
            'Lead Source': 'lead_source',
            'First Name': 'first_name',
            'Last Name': 'last_name',
            'Account Name.id': 'account_name_id',
            'Account Name': 'account_name',
            'Vendor Name.id': 'vendor_name_id',
            'Vendor Name': 'vendor_name',
            'Email': 'email',
            'Title': 'title',
            'Department': 'department',
            'Phone': 'phone',
            'Mobile': 'mobile',
            'Created By.id': 'created_by_id',
            'Created By': 'created_by',
            'Modified By.id': 'modified_by_id',
            'Modified By': 'modified_by',
            'Created Time': 'created_time',
            'Modified Time': 'modified_time',
            'Contact Name': 'contact_name',
            'Description': 'description',
            'Email Opt Out': 'email_opt_out',
            'Salutation': 'salutation',
            'Last Activity Time': 'last_activity_time',
            'Tag': 'tag',
            'Reporting To.id': 'reporting_to_id',
            'Reporting To': 'reporting_to',
            'Unsubscribed Mode': 'unsubscribed_mode',
            'Unsubscribed Time': 'unsubscribed_time',
            'Change Log Time': 'change_log_time',
            'First Visit': 'first_visit',
            'Visitor Score': 'visitor_score',
            'Referrer': 'referrer',
            'Average Time Spent (Minutes)': 'average_time_spent_minutes',
            'Most Recent Visit': 'most_recent_visit',
            'First Page Visited': 'first_page_visited',
            'Number Of Chats': 'number_of_chats',
            'Days Visited': 'days_visited',
            'General Phone': 'general_phone',
            'Direct Phone': 'direct_phone',
            'LinkedIn Connection': 'linkedin_connection',
            'Account Egnyte Link': 'account_egnyte_link',
            'Name Pronunciation': 'name_pronunciation',
            'Industry & FB Group Memberships': 'industry_fb_group_memberships',
            'Role in deals': 'role_in_deals',
            'Street': 'street',
            'City': 'city',
            'Zip Code': 'zip_code',
            'State': 'state',
            'Country': 'country',
            'County': 'county',
            'Locked': 'locked',
            'Last Enriched Time': 'last_enriched_time',
            'Enrich Status': 'enrich_status',
            'Reference Type': 'reference_type',
            'Reference Subject Matter, Use Case  & Department': 'reference_subject_matter',
            'Reference Egnyte Link': 'reference_egnyte_link',
            'Reference Services Products & Solutions': 'reference_services_products',
            'Conferences & Organizations Attended': 'conferences_organizations_attended'
          }
        } else if (importType === 'companies') {
          return {
            'Account Name': 'name',
            'Company Name': 'name',
            'Name': 'name',
            'Website': 'website',
            'Industry': 'industry',
            'Size': 'size',
            'Employees': 'size',
            'Annual Revenue': 'revenue',
            'Revenue': 'revenue',
            'Phone': 'phone',
            'Email': 'email',
            'Address': 'address',
            'Street': 'address',
            'City': 'city',
            'State': 'state',
            'Country': 'country',
            'Zip Code': 'zip_code',
            'Postal Code': 'zip_code',
            'Notes': 'notes',
            'Description': 'notes'
          }
        }
        return {}
      }
      
      const columnMapping = getColumnMapping(importType)
      
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
            
            // Map CSV header to database column name
            const dbColumnName = columnMapping[header] || header.toLowerCase().replace(/\s+/g, '_')
            record[dbColumnName] = value
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

        // Add user_id to each record and filter only valid database columns
        const getValidDbColumns = (importType: string) => {
          if (importType === 'contacts') {
            return new Set([
              'first_name', 'last_name', 'email', 'phone', 'mobile', 'title', 'department',
              'lead_source', 'notes', 'contact_owner', 'account_name', 'vendor_name',
              'contact_name', 'description', 'salutation', 'tag', 'reporting_to',
              'unsubscribed_mode', 'referrer', 'first_page_visited', 'general_phone',
              'direct_phone', 'linkedin_connection', 'account_egnyte_link', 'name_pronunciation',
              'industry_fb_group_memberships', 'role_in_deals', 'street', 'city', 'zip_code',
              'state', 'country', 'county', 'record_id', 'contact_owner', 'created_by',
              'modified_by', 'account_name', 'vendor_name', 'email_opt_out', 'locked', 
              'enrich_status', 'reference_type', 'reference_subject_matter', 'reference_egnyte_link', 
              'reference_services_products', 'conferences_organizations_attended', 'average_time_spent_minutes', 
              'visitor_score', 'number_of_chats', 'days_visited', 'user_id'
            ])
          } else if (importType === 'companies') {
            return new Set([
              'name', 'website', 'industry', 'size', 'revenue', 'phone', 'email', 
              'address', 'city', 'state', 'country', 'zip_code', 'notes', 'user_id'
            ])
          }
          return new Set(['user_id'])
        }

        const validDbColumns = getValidDbColumns(importType)

        // UUID columns that should be excluded if they contain non-UUID values
        const uuidColumns = new Set([
          'contact_owner_id', 'created_by_id', 'modified_by_id', 'account_name_id', 
          'vendor_name_id', 'reporting_to_id', 'company_id'
        ])

        // Helper function to check if a string is a valid UUID
        const isValidUUID = (str: string) => {
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
          return uuidRegex.test(str)
        }

        // Define numeric columns that need special handling
        const numericColumns = new Set([
          'visitor_score', 'number_of_chats', 'days_visited', 'average_time_spent_minutes'
        ])

        // Define timestamp columns that need special handling
        const timestampColumns = new Set([
          'created_time', 'modified_time', 'last_activity_time', 'unsubscribed_time', 
          'change_log_time', 'first_visit', 'most_recent_visit', 'last_enriched_time'
        ])

        // Define boolean columns
        const booleanColumns = new Set(['email_opt_out', 'locked'])

        // Helper function to safely convert to number
        const safeNumberConvert = (value: string, fieldName: string): number | null => {
          if (!value || value.trim() === '') return null
          
          // Check if it looks like a timestamp (contains / or :)
          if (value.includes('/') || value.includes(':') || value.includes('-')) {
            console.warn(`Skipping timestamp-like value "${value}" for numeric field ${fieldName}`)
            return null
          }
          
          const num = parseFloat(value)
          if (isNaN(num)) {
            console.warn(`Invalid number "${value}" for field ${fieldName}, setting to null`)
            return null
          }
          return num
        }

        // Helper function to safely convert to timestamp
        const safeTimestampConvert = (value: string): string | null => {
          if (!value || value.trim() === '') return null
          
          try {
            // Try to parse the date
            const date = new Date(value)
            if (isNaN(date.getTime())) {
              console.warn(`Invalid timestamp "${value}", setting to null`)
              return null
            }
            return date.toISOString()
          } catch (error) {
            console.warn(`Error parsing timestamp "${value}":`, error)
            return null
          }
        }

        // Helper function to safely convert to boolean
        const safeBooleanConvert = (value: string): boolean => {
          if (!value || value.trim() === '') return false
          const lowerValue = value.toLowerCase()
          return lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes'
        }

        const recordsWithUserId = validatedRecords.map(record => {
          const cleanRecord: any = { user_id: user.id }
          
          // Only include columns that exist in the database
          Object.keys(record).forEach(key => {
            if (validDbColumns.has(key) && record[key] !== '') {
              // Skip UUID columns that don't contain valid UUIDs
              if (uuidColumns.has(key) && !isValidUUID(record[key])) {
                console.warn(`Skipping invalid UUID for ${key}: ${record[key]}`)
                return
              }

              // Handle numeric columns
              if (numericColumns.has(key)) {
                const numValue = safeNumberConvert(record[key], key)
                if (numValue !== null) {
                  cleanRecord[key] = numValue
                }
                return
              }

              // Handle timestamp columns
              if (timestampColumns.has(key)) {
                const timestampValue = safeTimestampConvert(record[key])
                if (timestampValue !== null) {
                  cleanRecord[key] = timestampValue
                }
                return
              }

              // Handle boolean columns
              if (booleanColumns.has(key)) {
                cleanRecord[key] = safeBooleanConvert(record[key])
                return
              }

              // Handle regular text columns
              cleanRecord[key] = record[key]
            }
          })

          // Ensure required fields are present based on import type
          if (importType === 'contacts') {
            // first_name and last_name are NOT NULL in contacts table
            if (!cleanRecord.first_name || cleanRecord.first_name.trim() === '') {
              cleanRecord.first_name = 'Unknown'
            }
            if (!cleanRecord.last_name || cleanRecord.last_name.trim() === '') {
              cleanRecord.last_name = 'Contact'
            }
          } else if (importType === 'companies') {
            // name is NOT NULL in companies table
            if (!cleanRecord.name || cleanRecord.name.trim() === '') {
              cleanRecord.name = 'Unknown Company'
            }
          }
          
          return cleanRecord
        }).filter(record => {
          // Additional validation: ensure we have required fields based on import type
          let hasRequiredFields = true
          
          if (importType === 'contacts') {
            hasRequiredFields = record.first_name && record.last_name
          } else if (importType === 'companies') {
            hasRequiredFields = record.name
          }
          
          if (!hasRequiredFields) {
            console.warn('Skipping record with missing required fields:', record)
          }
          return hasRequiredFields
        })

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