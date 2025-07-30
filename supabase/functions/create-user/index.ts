import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.0.0";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import React from "npm:react@18.3.1";
import { WelcomeEmail } from "./_templates/welcome-email.tsx";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateUserRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'manager' | 'sales_rep';
  sendEmail?: boolean;
}

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

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

    // Create admin client for user creation
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
      throw new Error('Only administrators can create users');
    }

    const { email, firstName, lastName, role, sendEmail = true }: CreateUserRequest = await req.json();

    // Validate input
    if (!email || !role) {
      throw new Error('Email and role are required');
    }

    if (!['admin', 'manager', 'sales_rep'].includes(role)) {
      throw new Error('Invalid role specified');
    }

    // Generate temporary password
    const temporaryPassword = generateSecurePassword();

    console.log(`Creating user: ${email} with role: ${role}`);

    // Create user in Supabase Auth
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        first_name: firstName || null,
        last_name: lastName || null,
      }
    });

    if (createError) {
      console.error('Error creating user:', createError);
      throw new Error(`Failed to create user: ${createError.message}`);
    }

    if (!newUser.user) {
      throw new Error('User creation failed - no user returned');
    }

    console.log(`User created successfully: ${newUser.user.id}`);

    // Assign role using the secure function
    const { error: roleError } = await supabase.rpc('assign_user_role', {
      target_user_id: newUser.user.id,
      new_role: role,
      reason: `Initial role assignment during user creation by admin`
    });

    if (roleError) {
      console.error('Error assigning role:', roleError);
      // Try to clean up the created user
      await adminClient.auth.admin.deleteUser(newUser.user.id);
      throw new Error(`Failed to assign role: ${roleError.message}`);
    }

    console.log(`Role assigned successfully: ${role}`);

    // Send welcome email if requested
    if (sendEmail) {
      try {
        const loginUrl = `${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovableproject.com') || 'https://your-app-url.com'}/auth`;
        
        const emailHtml = await renderAsync(
          React.createElement(WelcomeEmail, {
            firstName: firstName || email.split('@')[0],
            email,
            temporaryPassword,
            loginUrl,
            role: role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          })
        );

        await resend.emails.send({
          from: 'CRM System <onboarding@resend.dev>',
          to: [email],
          subject: 'Welcome to CRM System - Your Account is Ready',
          html: emailHtml,
        });

        console.log('Welcome email sent successfully');
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail the entire operation if email fails
      }
    }

    // Log the creation in audit log
    await supabase.from('import_audit_log').insert({
      user_id: user.id,
      file_name: 'user_creation',
      data_type: 'user_management',
      records_processed: 1,
      records_imported: 1,
      file_size: 0,
      security_flags: [`User created: ${email} with role: ${role}`]
    });

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: newUser.user.id,
          email: newUser.user.email,
          role,
          temporaryPassword: sendEmail ? '[sent via email]' : temporaryPassword
        },
        message: `User created successfully${sendEmail ? ' and welcome email sent' : ''}`
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('User creation error:', error);
    
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

function generateSecurePassword(): string {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  
  // Ensure at least one of each type
  password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]; // Uppercase
  password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)]; // Lowercase
  password += "0123456789"[Math.floor(Math.random() * 10)]; // Number
  password += "!@#$%^&*"[Math.floor(Math.random() * 8)]; // Special char
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}