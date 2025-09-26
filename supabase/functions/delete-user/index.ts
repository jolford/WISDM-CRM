import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DeleteUserRequest {
  userId: string;
  reason?: string;
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

    // Create Supabase client with user's token
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

    // Create admin client for user deletion
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify current user is admin
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user has admin role
    const { data: userRole } = await supabase.rpc('get_current_user_role');
    if (userRole !== 'admin') {
      throw new Error('Only administrators can delete users');
    }

    const { userId, reason }: DeleteUserRequest = await req.json();

    // Validate input
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Prevent self-deletion
    if (userId === user.id) {
      throw new Error('You cannot delete your own account');
    }

    console.log(`Deleting user: ${userId}`);

    // Get user info before deletion for audit log
    const { data: userToDelete } = await supabase
      .from('profiles')
      .select('email, role')
      .eq('id', userId)
      .single();

    // Delete user from Supabase Auth (this will cascade to profiles due to foreign key)
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error('Error deleting user:', deleteError);
      throw new Error(`Failed to delete user: ${deleteError.message}`);
    }

    console.log(`User deleted successfully: ${userId}`);

    // Log the deletion in audit log
    await supabase.from('import_audit_log').insert({
      user_id: user.id,
      file_name: 'user_deletion',
      data_type: 'user_management',
      records_processed: 1,
      records_imported: 1,
      file_size: 0,
      security_flags: [
        `User deleted: ${userToDelete?.email || 'Unknown'} (${userId})`,
        `Role: ${userToDelete?.role || 'Unknown'}`,
        `Reason: ${reason || 'No reason provided'}`
      ]
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'User deleted successfully'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('User deletion error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});