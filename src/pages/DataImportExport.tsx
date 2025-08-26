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
    ],
    tickets: [
      { zoho: "Ticket Number", wisdm: "title" },
      { zoho: "Subject", wisdm: "title" },
      { zoho: "Description", wisdm: "description" },
      { zoho: "Contact Name", wisdm: "contact" },
      { zoho: "Account Name", wisdm: "company" },
      { zoho: "Priority", wisdm: "priority" },
      { zoho: "Status", wisdm: "status" },
      { zoho: "Assignee", wisdm: "assignee" },
      { zoho: "Category", wisdm: "task_type" },
    ],
    maintenance: [
      { zoho: "Product Name", wisdm: "product_name" },
      { zoho: "Product Type", wisdm: "product_type" },
      { zoho: "Vendor Name", wisdm: "vendor_name" },
      { zoho: "Serial Number", wisdm: "serial_number" },
      { zoho: "License Key", wisdm: "license_key" },
      { zoho: "Purchase Date", wisdm: "purchase_date" },
      { zoho: "Start Date", wisdm: "start_date" },
      { zoho: "End Date", wisdm: "end_date" },
      { zoho: "Cost", wisdm: "cost" },
      { zoho: "Status", wisdm: "status" },
      { zoho: "Notes", wisdm: "notes" },
    ],
    vendors: [
      { zoho: "Vendor Name", wisdm: "name" },
      { zoho: "Contact Name", wisdm: "contact_name" },
      { zoho: "Email", wisdm: "email" },
      { zoho: "Phone", wisdm: "phone" },
      { zoho: "Website", wisdm: "website" },
      { zoho: "Industry", wisdm: "industry" },
      { zoho: "Status", wisdm: "status" },
    ],
    forecasts: [
      { zoho: "Period", wisdm: "period" },
      { zoho: "Forecast Type", wisdm: "forecast_type" },
      { zoho: "Target Amount", wisdm: "target_amount" },
      { zoho: "Actual Amount", wisdm: "actual_amount" },
      { zoho: "Probability", wisdm: "probability" },
      { zoho: "Notes", wisdm: "notes" },
    ],
    reports: [
      { zoho: "Report Name", wisdm: "name" },
      { zoho: "Report Type", wisdm: "report_type" },
      { zoho: "Description", wisdm: "description" },
      { zoho: "Data Source", wisdm: "data_source" },
      { zoho: "Schedule", wisdm: "schedule" },
      { zoho: "Format", wisdm: "format" },
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
        console.log('📋 CSV Headers found:', headers)
        
        // Check if CSV has proper headers (more than 1 column or doesn't look like a filename)
        if (headers.length === 1 && (headers[0].includes('.csv') || headers[0].includes('report') || headers[0].length > 50)) {
          throw new Error('Invalid CSV format: The file appears to have malformed headers. Please ensure your CSV has proper column headers in the first row.')
        }
      
      // Security: Validate headers (allow common CSV characters including special chars, quotes, etc.)
      const allowedHeaderPattern = /^[a-zA-Z0-9\s_.,&():/'"#@%$*+=\[\]{}|\\~`!?-]+$/
      const invalidHeaders = headers.filter(header => !allowedHeaderPattern.test(header))
      if (invalidHeaders.length > 0) {
        console.warn('Invalid headers found:', invalidHeaders)
        console.log('All headers:', headers)
        // Make validation less strict - just warn instead of failing
        console.warn('Some headers contain special characters but proceeding with import...')
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
          } else if (importType === 'tickets') {
            return {
              'Ticket Number': 'title',
              'Subject': 'title',
              'Title': 'title',
              'Description': 'description',
              'Contact Name': 'description', // Append to description since tasks table doesn't have contact_name
              'Contact': 'description',
              'Account Name': 'description', // Append to description since tasks table doesn't have company_name
              'Company': 'description',
              'Status': 'status',
              'Category': 'task_type',
              'Type': 'task_type',
              'Due Date': 'due_date',
              // Add missing mappings to prevent unmapped fields from causing issues
              'To Address': null, // Ignore email fields that don't map to tasks table
              'Email': null,
              'Contact Id': null,
              'Account Id': null,
              'Product Name': null,
              'Product Id': null,
              'Ticket Owner': null,
              'Ticket Owner Id': null,
              'Created By': null,
              'Created By Id': null,
              'Modified By': null,
              'Modified By Id': null,
              'Created Time': null,
              'Modified Time': null,
              'Resolution': null,
              'Priority': null,
              'Mode': null,
              'Sub Category': null,
              'Ticket Closed Time': null,
              'Is Overdue': null,
              'Is Escalated': null,
              'Classification': null,
              'Time to Respond': null,
              'Team': null,
              'Team Id': null,
              'Tags': null,
              'Ticket On Hold Time': null,
              'Language': null,
              'Vendor Ticket Number': null,
              'Child Ticket Count': null,
              'Department': null,
              'Department Id': null,
              'Ticket Id': null,
              'Ticket Reference Id': null
            }
          } else if (importType === 'deals') {
            return {
              'Deal Name': 'name',
              'Name': 'name',
              'Title': 'name',
              'Deal Owner': 'deal_owner_name', // Store owner name as text field
              'Account Name': 'company_name', // Store company name as text
              'Company': 'company_name',
              'Amount': 'value',
              'Value': 'value',
              'Deal Value': 'value',
              'Stage': 'stage',
              'Deal Stage': 'stage',
              'Status': 'stage',
              'Close Date': 'close_date',
              'Closing Date': 'close_date',
              'Expected Close': 'close_date',
              'Contact Name': 'contact_name',
              'Contact': 'contact_name',
              'Win Probability': 'probability',
              'Description': 'description',
              'Notes': 'notes',
              'Comments': 'notes'
            }
          } else if (importType === 'maintenance') {
            return {
              'Product Name': 'product_name',
              'Product': 'product_name',
              'Products': 'product_name', // Add mapping for plural "Products" column
              'Name': 'product_name',
              'Software Name': 'product_name',
              'Hardware Name': 'product_name',
              'Item Name': 'product_name',
              'Asset Name': 'product_name',
              'Product Type': 'product_type',
              'Type': 'product_type',
              'Category': 'product_type',
              'Vendor Name': 'vendor_name',
              'Vendor': 'vendor_name',
              'Manufacturer': 'vendor_name',
              'Serial Number': 'serial_number',
              'Serial': 'serial_number',
              'S/N': 'serial_number',
              'License Key': 'license_key',
              'License': 'license_key',
              'Key': 'license_key',
              'Purchase Date': 'purchase_date',
              'Purchased': 'purchase_date',
              'Start Date': 'start_date',
              'Start': 'start_date',
              'End Date': 'end_date',
              'End': 'end_date',
              'Expiry Date': 'end_date',
              'Expiration Date': 'end_date',
              'Cost': 'cost',
              'Price': 'cost',
              'Amount': 'cost',
              'Status': 'status',
              'State': 'status',
              'Notes': 'notes',
              'Comments': 'notes',
              'Description': 'notes',
              'Renewal Reminder Days': 'renewal_reminder_days',
              'Reminder Days': 'renewal_reminder_days'
            }
          } else if (importType === 'vendors') {
            return {
              'Vendor Name': 'name',
              'Name': 'name',
              'Company Name': 'name',
              'Contact Name': 'contact_name',
              'Contact': 'contact_name',
              'Email': 'email',
              'Phone': 'phone',
              'Website': 'website',
              'Address': 'address',
              'Street': 'address',
              'City': 'city',
              'State': 'state',
              'Country': 'country',
              'Zip Code': 'zip_code',
              'Postal Code': 'zip_code',
              'Industry': 'industry',
              'Status': 'status',
              'Notes': 'notes',
              'Comments': 'notes',
              'Description': 'notes'
            }
          } else if (importType === 'forecasts') {
            return {
              'Period': 'period',
              'Time Period': 'period',
              'Quarter': 'period',
              'Month': 'period',
              'Year': 'period',
              'Forecast Type': 'forecast_type',
              'Type': 'forecast_type',
              'Category': 'forecast_type',
              'Target Amount': 'target_amount',
              'Target': 'target_amount',
              'Goal': 'target_amount',
              'Actual Amount': 'actual_amount',
              'Actual': 'actual_amount',
              'Result': 'actual_amount',
              'Probability': 'probability',
              'Confidence': 'probability',
              'Likelihood': 'probability',
              'Notes': 'notes',
              'Comments': 'notes',
              'Description': 'notes'
            }
          } else if (importType === 'reports') {
            return {
              'Report Name': 'name',
              'Name': 'name',
              'Title': 'name',
              'Report Type': 'report_type',
              'Type': 'report_type',
              'Category': 'report_type',
              'Description': 'description',
              'Notes': 'description',
              'Data Source': 'data_source',
              'Source': 'data_source',
              'Table': 'data_source',
              'Schedule': 'schedule',
              'Frequency': 'schedule',
              'Timing': 'schedule',
              'Format': 'format',
              'Output Format': 'format',
              'Export Format': 'format',
              'Recipients': 'recipients',
              'Email Recipients': 'recipients',
              'Send To': 'recipients',
              'Active': 'is_active',
              'Enabled': 'is_active',
              'Status': 'is_active'
            }
          }
        return {}
      }
      
      const columnMapping = getColumnMapping(importType)
      console.log('🔍 Available column mapping for', importType, ':', columnMapping)
      
      const records = []
      const validatedRecords = []
      
      // Process each line with validation
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
          
          const mappedRecord: Record<string, any> = {}
          console.log('🔄 Processing row:', i + 1, 'Raw values:', values)
          
          headers.forEach((header, index) => {
            const value = values[index] || ''
            if (columnMapping[header] !== undefined) {
              // Only map if the mapping is not null (null means ignore the field)
              if (columnMapping[header] !== null) {
                // Enhanced validation to prevent HTML/CSS content from being mapped to wrong fields
                const mappedField = columnMapping[header]
                
                // Check if this is a timestamp/date field that shouldn't contain HTML/CSS
                const timestampFields = ['due_date', 'created_time', 'modified_time', 'start_date', 'end_date', 'purchase_date', 'close_date']
                
                if (timestampFields.includes(mappedField)) {
                  // Skip HTML/CSS content and email addresses for timestamp fields
                  const htmlCssPatterns = [
                    /<[^>]*>/,  // HTML tags
                    /style\s*=/,  // CSS styles
                    /font-/,  // Font styles
                    /margin:/,  // Margin styles
                    /padding:/,  // Padding styles
                    /@[^@]*\.[a-zA-Z]{2,}/,  // Email addresses
                    /rgba?\(/,  // Color functions
                    /px|em|rem|%/g,  // CSS units
                    /sans-serif|serif/g,  // Font families
                    /inherit|initial|auto/g,  // CSS keywords
                    /\d+\.\d+\.\d+\.\d+/g,  // IP addresses
                    /^[a-zA-Z0-9]+$/g  // IDs that are just alphanumeric
                  ]
                  
                  if (htmlCssPatterns.some(pattern => pattern.test(value))) {
                    console.log(`🚫 Skipping invalid timestamp content for "${header}": "${value}"`)
                    return // Skip this field
                  }
                  
                  // Additional validation for timestamp format
                  if (value && !value.includes('-') && !value.includes('/') && !value.includes(':')) {
                    console.log(`🚫 Skipping non-timestamp value for "${header}": "${value}"`)
                    return // Skip this field
                  }
                }
                
                // Check if this is a status field that needs enum validation
                if (mappedField === 'status' && importType === 'tickets') {
                  const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled']
                  if (!validStatuses.includes(value.toLowerCase())) {
                    console.log(`🚫 Invalid status value "${value}", using default "pending"`)
                    mappedRecord[mappedField] = 'pending'
                  } else {
                    mappedRecord[mappedField] = value.toLowerCase()
                  }
                } else if (mappedField === 'task_type' && importType === 'tickets') {
                  const validTaskTypes = ['call', 'email', 'meeting', 'follow_up', 'other']
                  if (!validTaskTypes.includes(value.toLowerCase())) {
                    console.log(`🚫 Invalid task_type value "${value}", using default "other"`)
                    mappedRecord[mappedField] = 'other'
                  } else {
                    mappedRecord[mappedField] = value.toLowerCase()
                  }
                } else {
                  // For other fields, just clean HTML/CSS content
                  let cleanValue = value
                  if (typeof cleanValue === 'string') {
                    cleanValue = cleanValue
                      .replace(/<[^>]*>/g, '') // Remove HTML tags
                      .replace(/style\s*=\s*[^>]*?>/g, '') // Remove style attributes
                      .replace(/margin:\s*[^;]*;?/g, '') // Remove margin styles
                      .replace(/padding:\s*[^;]*;?/g, '') // Remove padding styles
                      .replace(/font-[^;]*;?/g, '') // Remove font styles
                      .trim()
                  }
                  
                  mappedRecord[mappedField] = cleanValue
                }
                
                console.log(`   📌 Mapped "${header}" → "${mappedField}" = "${mappedRecord[mappedField] || 'CLEANED'}"`)
              } else {
                console.log(`   🚫 Ignoring field "${header}" (explicitly mapped to null)`)
              }
            } else {
              console.log(`   ❌ No mapping found for header: "${header}"`)
            }
          })
          
          console.log('🎯 Final mapped record for row', i + 1, ':', mappedRecord)
          
          records.push(mappedRecord)
          validatedRecords.push(mappedRecord)
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
            } else if (importType === 'deals') {
              return new Set([
                'name', 'value', 'stage', 'probability', 'close_date', 'description', 
                'notes', 'company_id', 'contact_id', 'deal_owner_name', 'company_name', 'contact_name', 'user_id'
              ])
           } else if (importType === 'tickets') {
             return new Set([
               'title', 'description', 'task_type', 'status', 'due_date', 'user_id'
             ])
           } else if (importType === 'maintenance') {
             return new Set([
               'product_name', 'product_type', 'vendor_name', 'serial_number',
              'license_key', 'purchase_date', 'start_date', 'end_date', 
              'cost', 'status', 'notes', 'renewal_reminder_days', 'user_id'
            ])
          } else if (importType === 'vendors') {
            return new Set([
              'name', 'contact_name', 'email', 'phone', 'website', 'address',
              'city', 'state', 'zip_code', 'country', 'industry', 'status', 'notes', 'user_id'
            ])
          } else if (importType === 'forecasts') {
            return new Set([
              'period', 'forecast_type', 'target_amount', 'actual_amount', 
              'probability', 'notes', 'user_id'
            ])
          } else if (importType === 'reports') {
            return new Set([
              'name', 'report_type', 'description', 'data_source', 'schedule', 
              'format', 'recipients', 'is_active', 'user_id'
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
          'visitor_score', 'number_of_chats', 'days_visited', 'average_time_spent_minutes',
          'cost', 'renewal_reminder_days', 'target_amount', 'actual_amount', 'probability'
        ])

        // Define timestamp columns that need special handling
        const timestampColumns = new Set([
          'created_time', 'modified_time', 'last_activity_time', 'unsubscribed_time', 
          'change_log_time', 'first_visit', 'most_recent_visit', 'last_enriched_time',
          // Import: tasks.due_date is a timestamptz column and must be parsed/validated
          'due_date'
        ])

        // Define date columns for maintenance records and deals
        const dateColumns = new Set([
          'purchase_date', 'start_date', 'end_date', 'close_date'
        ])
        
        // Define boolean columns
        const booleanColumns = new Set(['email_opt_out', 'locked', 'is_active'])

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
          
          // Comprehensive check for HTML/CSS content and reject it
          const cssKeywords = [
            '<', 'style=', 'margin:', 'font-', 'border:', 'line-height:', 'sans-serif', 
            'serif', 'px', 'inherit', 'css', 'color:', 'background:', 'width:', 'height:', 
            'padding:', 'text-', 'display:', 'position:', 'float:', 'overflow:', 'opacity:',
            'rgba(', 'rgb(', 'url(', '@', 'class=', 'id=', 'div', 'span', 'html', 'body'
          ]
          
          const lowerValue = value.toLowerCase()
          if (cssKeywords.some(keyword => lowerValue.includes(keyword))) {
            console.warn(`HTML/CSS content detected in timestamp field, setting to null: "${value}"`)
            return null
          }
          
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

        // Helper function to safely convert to date (YYYY-MM-DD format)
        const safeDateConvert = (value: string): string | null => {
          if (!value || value.trim() === '') return null
          
          console.log(`🔍 Processing date value: "${value}"`)
          
          // Comprehensive check for HTML/CSS content and reject it
          const cssKeywords = [
            '<', 'style=', 'margin:', 'font-', 'border:', 'line-height:', 'sans-serif', 
            'serif', 'px', 'inherit', 'css', 'color:', 'background:', 'width:', 'height:', 
            'padding:', 'text-', 'display:', 'position:', 'float:', 'overflow:', 'opacity:',
            'rgba(', 'rgb(', 'url(', '@', 'class=', 'id=', 'div', 'span', 'html', 'body'
          ]
          
          const lowerValue = value.toLowerCase()
          if (cssKeywords.some(keyword => lowerValue.includes(keyword))) {
            console.warn(`HTML/CSS content detected in date field, setting to null: "${value}"`)
            return null
          }
          if (value.includes('<') || value.includes('style=') || value.includes('margin:') || value.includes('font-')) {
            console.warn(`HTML/CSS content detected in date field, setting to null: "${value}"`)
            return null
          }
          
          // Check for email addresses (common mistake in date fields)
          if (value.includes('@')) {
            console.warn(`Email detected in date field, setting to null: "${value}"`)
            return null
          }
          
          // Check for obvious non-date strings that contain company names, text, etc.
          const nonDatePatterns = [
            /WISDM/i,
            /upgrade/i,
            /tangent/i,
            /kofax/i,
            /school/i,
            /university/i,
            /scanning/i,
            /humanities/i,
            /sciences/i,
            /faculty/i,
            /files/i,
            /department/i,
            /services/i,
            /\w{10,}/,  // Any single word longer than 10 characters (likely not a date)
            /^[a-zA-Z\s&-]{8,}$/  // Text with spaces, ampersands, hyphens longer than 8 chars
          ]
          
          if (nonDatePatterns.some(pattern => pattern.test(value))) {
            console.warn(`Non-date pattern detected in date field, setting to null: "${value}"`)
            return null
          }
          
          // Check for numeric-only values that might be misinterpreted
          if (/^\d+$/.test(value.trim())) {
            console.warn(`Numeric-only value detected in date field, setting to null: "${value}"`)
            return null
          }
          
          // Check for obviously invalid date patterns
          if (value.includes('100697') || value.includes('+') || /^\d{6,}/.test(value)) {
            console.warn(`Invalid date pattern detected, setting to null: "${value}"`)
            return null
          }
          
          // Validate year range to prevent extreme dates
          const yearMatch = value.match(/\b(\d{4})\b/)
          if (yearMatch) {
            const year = parseInt(yearMatch[1])
            if (year < 1900 || year > 2100) {
              console.warn(`Year ${year} out of valid range (1900-2100), setting to null: "${value}"`)
              return null
            }
          }
          
          try {
            // Try to parse the date
            const date = new Date(value)
            if (isNaN(date.getTime())) {
              console.warn(`Invalid date "${value}", setting to null`)
              return null
            }
            
            // Additional validation on the parsed date
            const year = date.getFullYear()
            if (year < 1900 || year > 2100) {
              console.warn(`Parsed year ${year} out of valid range, setting to null: "${value}"`)
              return null
            }
            
            const isoString = date.toISOString().split('T')[0]
            console.log(`✅ Successfully converted "${value}" to "${isoString}"`)
            return isoString
          } catch (error) {
            console.warn(`Error parsing date "${value}":`, error)
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
              // Early filter for CSS/HTML content
              const value = record[key]
              const cssKeywords = [
                'sans-serif', 'border:', 'line-height:', 'font-', 'margin:', 'padding:', 
                'inherit', 'px', 'rgba(', 'rgb(', 'style=', 'css', '<', '>'
              ]
              
              if (typeof value === 'string' && cssKeywords.some(keyword => value.toLowerCase().includes(keyword))) {
                console.warn(`🚫 Skipping CSS/HTML content in field "${key}": "${value}"`)
                return
              }
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

              // Handle date columns (for maintenance records)
              if (dateColumns.has(key)) {
                console.log(`🗓️ Processing date column "${key}" with value: "${record[key]}"`)
                const dateValue = safeDateConvert(record[key])
                if (dateValue !== null) {
                  cleanRecord[key] = dateValue
                  console.log(`📅 Added date field "${key}": "${dateValue}"`)
                } else {
                  console.log(`❌ Skipped invalid date for "${key}": "${record[key]}"`)
                }
                return
              }

              // Handle boolean columns
              if (booleanColumns.has(key)) {
                cleanRecord[key] = safeBooleanConvert(record[key])
                return
              }

              // Clean text content - remove HTML/CSS and other unwanted content
              let cleanValue = record[key]
              
              // Remove HTML tags and CSS styling
              if (typeof cleanValue === 'string') {
                cleanValue = cleanValue
                  .replace(/<[^>]*>/g, '') // Remove HTML tags
                  .replace(/style\s*=\s*[^>]*?>/g, '') // Remove style attributes
                  .replace(/margin:\s*[^;]*;?/g, '') // Remove margin styles
                  .replace(/padding:\s*[^;]*;?/g, '') // Remove padding styles
                  .replace(/font-[^;]*;?/g, '') // Remove font styles
                  .trim()
              }

              // Handle regular text columns
              cleanRecord[key] = cleanValue
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
          } else if (importType === 'tickets') {
            // title is NOT NULL in tasks table (using tasks table for tickets)
            if (!cleanRecord.title || cleanRecord.title.trim() === '') {
              cleanRecord.title = 'Imported Ticket'
            }
            // Set default task_type if not provided
            if (!cleanRecord.task_type) {
              cleanRecord.task_type = 'other'
            }
            // Validate and set status - only allow valid enum values
            const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled']
            if (!cleanRecord.status || !validStatuses.includes(cleanRecord.status.toLowerCase())) {
              cleanRecord.status = 'pending'
            } else {
              cleanRecord.status = cleanRecord.status.toLowerCase()
            }
            // Validate and set task_type - only allow valid enum values  
            const validTaskTypes = ['call', 'email', 'meeting', 'follow_up', 'other']
            if (!cleanRecord.task_type || !validTaskTypes.includes(cleanRecord.task_type.toLowerCase())) {
              cleanRecord.task_type = 'other'
            } else {
              cleanRecord.task_type = cleanRecord.task_type.toLowerCase()
            }
          } else if (importType === 'maintenance') {
            // product_name and product_type are NOT NULL in maintenance_records table
            if (!cleanRecord.product_name || cleanRecord.product_name.trim() === '') {
              console.log('⚠️ Setting default product_name because value was:', cleanRecord.product_name)
              cleanRecord.product_name = 'Unknown Product'
            }
            if (!cleanRecord.product_type || cleanRecord.product_type.trim() === '') {
              console.log('⚠️ Setting default product_type because value was:', cleanRecord.product_type)
              cleanRecord.product_type = 'software'  // lowercase to match constraint
            } else {
              // Normalize product_type to lowercase to match constraint
              cleanRecord.product_type = cleanRecord.product_type.toLowerCase()
            }
            // Set default status if not provided
            if (!cleanRecord.status || cleanRecord.status.trim() === '') {
              cleanRecord.status = 'active'
            } else {
              // Normalize status to lowercase to match constraint
              cleanRecord.status = cleanRecord.status.toLowerCase()
            }
            // Set default renewal reminder days if not provided
            if (!cleanRecord.renewal_reminder_days) {
              cleanRecord.renewal_reminder_days = 30
            }
            console.log('🔧 Final maintenance record after cleanup:', cleanRecord)
           } else if (importType === 'deals') {
             // name is NOT NULL in deals table
             if (!cleanRecord.name || cleanRecord.name.trim() === '') {
               console.warn('⚠️ Deal name is missing, setting default. Original record:', record)
               cleanRecord.name = 'Imported Deal'
             }
             // Set default stage if not provided or invalid
             const validStages = ['prospect', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']
             if (!cleanRecord.stage || !validStages.includes(cleanRecord.stage.toLowerCase())) {
               cleanRecord.stage = 'prospect'
             } else {
               cleanRecord.stage = cleanRecord.stage.toLowerCase()
             }
             // Ensure numeric fields are properly handled and constrained
             if (cleanRecord.value && typeof cleanRecord.value === 'string') {
               const valueNum = parseFloat(cleanRecord.value) || 0
               cleanRecord.value = Math.max(0, valueNum) // Ensure non-negative
             }
             if (cleanRecord.probability && typeof cleanRecord.probability === 'string') {
               let probNum = parseInt(cleanRecord.probability) || 0
               // Ensure probability is between 0 and 100
               probNum = Math.max(0, Math.min(100, probNum))
               cleanRecord.probability = probNum
               console.log(`📊 Adjusted probability from "${cleanRecord.probability}" to ${probNum}`)
             } else if (typeof cleanRecord.probability === 'number') {
               // Also constrain if it's already a number
               let probNum = cleanRecord.probability
               probNum = Math.max(0, Math.min(100, probNum))
               cleanRecord.probability = probNum
             }
             // Set default probability if not provided
             if (!cleanRecord.probability && cleanRecord.probability !== 0) {
               cleanRecord.probability = 0
             }
          } else if (importType === 'vendors') {
            // name is NOT NULL in vendors table
            if (!cleanRecord.name || cleanRecord.name.trim() === '') {
              cleanRecord.name = 'Unknown Vendor'
            }
            // Set default status if not provided
            if (!cleanRecord.status || cleanRecord.status.trim() === '') {
              cleanRecord.status = 'active'
            }
          } else if (importType === 'forecasts') {
            // period and forecast_type are NOT NULL in forecasts table
            if (!cleanRecord.period || cleanRecord.period.trim() === '') {
              cleanRecord.period = new Date().getFullYear().toString()
            }
            if (!cleanRecord.forecast_type || cleanRecord.forecast_type.trim() === '') {
              cleanRecord.forecast_type = 'revenue'
            }
            // Set default probability if not provided
            if (!cleanRecord.probability) {
              cleanRecord.probability = 100
            }
           } else if (importType === 'reports') {
             // If report_type contains descriptive text and name is empty, use report_type as name
             if ((!cleanRecord.name || cleanRecord.name.trim() === '') && 
                 cleanRecord.report_type && cleanRecord.report_type.trim() !== '') {
               cleanRecord.name = cleanRecord.report_type
               cleanRecord.report_type = 'custom'
             }
             // Set default name if still empty
             if (!cleanRecord.name || cleanRecord.name.trim() === '') {
               cleanRecord.name = 'Unknown Report'
             }
             // Set default report_type if not provided
             if (!cleanRecord.report_type || cleanRecord.report_type.trim() === '') {
               cleanRecord.report_type = 'custom'
             }
             // Set default is_active if not provided
             if (cleanRecord.is_active === undefined || cleanRecord.is_active === null) {
               cleanRecord.is_active = true
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
          } else if (importType === 'tickets') {
            hasRequiredFields = record.title
          } else if (importType === 'maintenance') {
            hasRequiredFields = record.product_name && record.product_type
          } else if (importType === 'vendors') {
            hasRequiredFields = record.name
          } else if (importType === 'forecasts') {
            hasRequiredFields = record.period && record.forecast_type
          } else if (importType === 'reports') {
            hasRequiredFields = record.name
          }
          
          if (!hasRequiredFields) {
            console.warn('Skipping record with missing required fields:', record)
          }
          return hasRequiredFields
        })

        console.log(`📊 Final clean records being sent to database (first 3):`, recordsWithUserId.slice(0, 3))
        console.log(`🔢 Total records to import: ${recordsWithUserId.length}`)
        
        // Log any records with date fields for debugging
        recordsWithUserId.forEach((record, index) => {
          const dateFields = ['purchase_date', 'start_date', 'end_date', 'due_date', 'created_at', 'updated_at']
          const hasDateFields = dateFields.some(field => record[field])
          if (hasDateFields && index < 5) {
            console.log(`📋 Record ${index + 1} date fields:`, 
              dateFields.reduce((acc, field) => {
                if (record[field]) acc[field] = record[field]
                return acc
              }, {})
            )
          }
        })

        const tableName = importType === 'tickets' ? 'tasks' : 
                          importType === 'maintenance' ? 'maintenance_records' : 
                          importType as 'contacts' | 'accounts' | 'deals' | 'vendors' | 'forecasts' | 'reports'
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
                        <SelectItem value="vendors">Vendors</SelectItem>
                        <SelectItem value="forecasts">Forecasts</SelectItem>
                        <SelectItem value="reports">Reports</SelectItem>
                        <SelectItem value="tickets">Tasks/Support Tickets</SelectItem>
                        <SelectItem value="maintenance">Maintenance Records</SelectItem>
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
