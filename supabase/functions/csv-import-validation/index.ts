import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ImportRequest {
  csvData: string;
  dataType: 'contacts' | 'companies' | 'deals';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        },
        global: {
          headers: {
            Authorization: authHeader,
          }
        }
      }
    );

    // Get current user using the token
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Auth error:', userError);
      throw new Error('Unauthorized');
    }

    console.log(`CSV import validation request from user: ${user.id}`);

    const { csvData, dataType }: ImportRequest = await req.json();

    // Validate input
    if (!csvData || !dataType) {
      throw new Error('Missing required fields: csvData and dataType');
    }

    if (!['contacts', 'companies', 'deals'].includes(dataType)) {
      throw new Error('Invalid data type. Must be: contacts, companies, or deals');
    }

    // Parse CSV data with better error handling
    const lines = csvData.trim().split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV must contain headers and at least one data row');
    }

    // More robust CSV parsing for headers
    const headerLine = lines[0];
    let headers;
    
    try {
      // Handle different CSV formats including quoted fields
      if (headerLine.includes('"')) {
        // Complex parsing for quoted fields
        headers = headerLine.match(/("([^"]*)"|[^,]*)/g)?.map(h => 
          h.trim().replace(/^"|"$/g, '').trim()
        ) || [];
      } else {
        // Simple comma-separated parsing
        headers = headerLine.split(',').map(h => h.trim());
      }
      
      if (headers.length === 0) {
        throw new Error('No headers found in CSV file');
      }
      
      console.log('Parsed headers:', headers);
    } catch (error) {
      throw new Error(`Failed to parse CSV headers: ${error.message}`);
    }
    
    // Enhanced security validation for headers
    const allowedHeaderPattern = /^[a-zA-Z0-9\s_.,&():/-]+$/;
    const invalidHeaders = headers.filter(header => !allowedHeaderPattern.test(header));
    if (invalidHeaders.length > 0) {
      throw new Error(`Invalid header names detected: ${invalidHeaders.join(', ')}`);
    }

    // Check for suspicious patterns in headers
    const suspiciousPatterns = /(script|javascript|eval|exec|function|<|>)/i;
    const suspiciousHeaders = headers.filter(header => suspiciousPatterns.test(header));
    if (suspiciousHeaders.length > 0) {
      throw new Error(`Suspicious header names detected: ${suspiciousHeaders.join(', ')}`);
    }

    // Validate each data row
    const dataRows = lines.slice(1);
    const maxRows = 1000; // Limit import size for security
    
    if (dataRows.length > maxRows) {
      throw new Error(`Too many rows. Maximum allowed: ${maxRows}`);
    }

    let validatedRows = 0;
    const errors: string[] = [];

    for (let i = 0; i < Math.min(dataRows.length, 100); i++) { // Validate first 100 rows for performance
      const row = dataRows[i];
      if (!row.trim()) continue;

      const values = row.split(',').map(v => v.trim().replace(/"/g, ''));
      
      // Check for SQL injection patterns
      const sqlInjectionPattern = /(union|select|insert|update|delete|drop|create|alter|exec|execute|script|javascript)/i;
      const maliciousValues = values.filter(value => sqlInjectionPattern.test(value));
      
      if (maliciousValues.length > 0) {
        errors.push(`Row ${i + 2}: Potentially malicious content detected`);
        continue;
      }

      // Validate email format if present
      if (dataType === 'contacts') {
        const emailIndex = headers.findIndex(h => h.toLowerCase().includes('email'));
        if (emailIndex !== -1 && values[emailIndex]) {
          const email = values[emailIndex];
          const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
          if (!emailRegex.test(email)) {
            errors.push(`Row ${i + 2}: Invalid email format: ${email}`);
            continue;
          }
        }
      }

      validatedRows++;
    }

    // Enhanced rate limiting check with user role verification
    const { data: userRole } = await supabase.rpc('get_current_user_role');
    
    // Check user permissions for data import
    if (!userRole || (userRole !== 'admin' && userRole !== 'manager')) {
      throw new Error('Insufficient permissions for data import. Contact your administrator.');
    }

    // Enhanced rate limiting check
    const { data: rateLimitCheck } = await supabase.rpc('check_import_rate_limit', { 
      user_id: user.id 
    });

    if (!rateLimitCheck) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    // Additional security: Implement file size and content validation limits
    const csvSizeBytes = new TextEncoder().encode(csvData).length;
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB limit
    
    if (csvSizeBytes > maxSizeBytes) {
      throw new Error('File size too large. Maximum allowed size is 5MB.');
    }

    // Enhanced malicious content detection
    const suspiciousContentPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /data:text\/html/gi,
      /vbscript:/gi,
      /onload|onerror|onclick/gi,
      /eval\s*\(/gi,
      /expression\s*\(/gi,
      /import\s+/gi,
      /require\s*\(/gi
    ];

    for (const pattern of suspiciousContentPatterns) {
      if (pattern.test(csvData)) {
        console.error('Malicious content pattern detected:', pattern);
        throw new Error('Potentially malicious content detected in file. Upload rejected for security.');
      }
    }

    console.log(`Validation completed: ${validatedRows} valid rows, ${errors.length} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        validatedRows,
        totalRows: dataRows.length,
        errors: errors.slice(0, 10), // Return max 10 errors
        headers,
        message: errors.length > 0 
          ? `Validation completed with ${errors.length} errors` 
          : 'All rows validated successfully'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('CSV validation error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error'
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});