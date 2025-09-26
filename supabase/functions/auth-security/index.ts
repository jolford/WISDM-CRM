import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AuthAttempt {
  email: string;
  ip_address: string;
  attempt_type: 'login' | 'signup';
  user_agent?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { email, attempt_type }: AuthAttempt = await req.json();
    
    if (!email || !attempt_type) {
      throw new Error('Missing required fields: email, attempt_type');
    }

    // Get client info for security logging
    const clientIp = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Check for rate limiting - max 5 attempts per email per 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    
    const { data: recentAttempts, error: countError } = await supabase
      .from('auth_attempts')
      .select('id')
      .eq('email', email.toLowerCase())
      .gte('created_at', fifteenMinutesAgo);

    if (countError) {
      console.error('Error checking auth attempts:', countError);
    }

    const attemptCount = recentAttempts?.length || 0;
    
    // Rate limiting: block if too many attempts
    if (attemptCount >= 5) {
      // Log the blocked attempt
      await supabase
        .from('security_events')
        .insert({
          event_type: 'rate_limit_exceeded',
          email: email.toLowerCase(),
          ip_address: clientIp,
          user_agent: userAgent,
          details: { attempt_count: attemptCount, attempt_type }
        });

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Too many authentication attempts. Please try again later.',
          retry_after: 900 // 15 minutes in seconds
        }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Log the authentication attempt
    await supabase
      .from('auth_attempts')
      .insert({
        email: email.toLowerCase(),
        ip_address: clientIp,
        user_agent: userAgent,
        attempt_type,
        success: false // Will be updated if auth succeeds
      });

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /admin|root|test|demo/i, // Common attack usernames
      /.{50,}/, // Unusually long emails
      /[<>\"']/  // Potential XSS attempts
    ];

    const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(email));
    
    if (isSuspicious) {
      await supabase
        .from('security_events')
        .insert({
          event_type: 'suspicious_auth_attempt',
          email: email.toLowerCase(),
          ip_address: clientIp,
          user_agent: userAgent,
          details: { reason: 'suspicious_email_pattern', attempt_type }
        });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Authentication attempt logged',
        rate_limit_remaining: Math.max(0, 5 - attemptCount - 1)
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Auth security error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});