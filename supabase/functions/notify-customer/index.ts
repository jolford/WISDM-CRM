// supabase/functions/notify-customer/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  try {
    const { email, name, message, ticketId } = await req.json();

    if (!email || !name || !message || !ticketId) {
      return new Response("Missing required fields", { status: 400 });
    }

    const apiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = "jolford@westint.com";

    const payload = {
      from: `WISDM Support <${fromEmail}>`,
      to: [email],
      subject: `Reply to Your Support Ticket #${ticketId}`,
      html: `
        <p>Hi ${name},</p>
        <p>You’ve received a new reply to your support ticket:</p>
        <blockquote style="border-left: 4px solid #ccc; margin: 1em 0; padding-left: 1em;">
          ${message}
        </blockquote>
        <p>You can view and respond to this ticket by visiting your <strong>Support Desk</strong> or replying directly to this email.</p>
        <p style="margin-top: 2em;">— WISDM Support Team</p>
      `,
    };

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorDetails = await response.text();
      return new Response(`Failed to send email: ${errorDetails}`, { status: 500 });
    }

    return new Response("Email sent successfully", { status: 200 });
  } catch (error) {
    console.error("Function error:", error);
    return new Response("Internal server error", { status: 500 });
  }
});
