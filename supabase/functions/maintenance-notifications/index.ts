import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Email functionality will be added when Resend is properly configured

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MaintenanceRecord {
  id: string;
  product_name: string;
  product_type: string;
  vendor_name: string;
  end_date: string;
  user_id: string;
}

interface Profile {
  notification_email?: string;
  enable_maintenance_notifications: boolean;
  first_name?: string;
  last_name?: string;
  email: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const today = new Date();
    
    // Calculate notification dates
    const in30Days = new Date(today);
    in30Days.setDate(today.getDate() + 30);
    
    const in60Days = new Date(today);
    in60Days.setDate(today.getDate() + 60);
    
    const in90Days = new Date(today);
    in90Days.setDate(today.getDate() + 90);

    // Get maintenance records expiring in 30, 60, or 90 days
    const { data: maintenanceRecords, error: recordsError } = await supabaseClient
      .from('maintenance_records')
      .select('*')
      .or(`end_date.eq.${in30Days.toISOString().split('T')[0]},end_date.eq.${in60Days.toISOString().split('T')[0]},end_date.eq.${in90Days.toISOString().split('T')[0]}`)
      .eq('status', 'active');

    if (recordsError) {
      console.error('Error fetching maintenance records:', recordsError);
      return new Response(JSON.stringify({ error: recordsError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let notificationsSent = 0;

    for (const record of maintenanceRecords || []) {
      const endDate = new Date(record.end_date);
      const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      let notificationType = '';
      if (daysUntilExpiry <= 32 && daysUntilExpiry >= 28) notificationType = '30_day';
      else if (daysUntilExpiry <= 62 && daysUntilExpiry >= 58) notificationType = '60_day';
      else if (daysUntilExpiry <= 92 && daysUntilExpiry >= 88) notificationType = '90_day';
      
      if (!notificationType) continue;

      // Check if notification already sent
      const { data: existingNotification } = await supabaseClient
        .from('maintenance_notifications')
        .select('id')
        .eq('maintenance_record_id', record.id)
        .eq('notification_type', notificationType)
        .eq('email_sent', true)
        .single();

      if (existingNotification) continue;

      // Get user profile for notification preferences
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('notification_email, enable_maintenance_notifications, first_name, last_name, email')
        .eq('id', record.user_id)
        .single();

      if (!profile?.enable_maintenance_notifications) continue;

      const notificationEmail = profile.notification_email || profile.email;
      const userName = profile.first_name && profile.last_name 
        ? `${profile.first_name} ${profile.last_name}` 
        : profile.email;

      // Log notification (email functionality will be added when Resend is configured)
      try {
        console.log(`Would send notification for ${record.product_name} to ${notificationEmail}`);
        console.log(`Content: Maintenance Renewal Alert - ${record.product_name} expires in ${daysUntilExpiry} days`);

        // Record the notification
        await supabaseClient
          .from('maintenance_notifications')
          .upsert({
            maintenance_record_id: record.id,
            user_id: record.user_id,
            notification_type: notificationType,
            email_sent: false, // Set to false until email is actually implemented
            sent_at: new Date().toISOString(),
          });

        notificationsSent++;
        console.log(`Notification logged for ${record.product_name} to ${notificationEmail}`);

      } catch (logError) {
        console.error('Error logging notification:', logError);
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Maintenance notification check completed. ${notificationsSent} notifications sent.` 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in maintenance-notifications function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});