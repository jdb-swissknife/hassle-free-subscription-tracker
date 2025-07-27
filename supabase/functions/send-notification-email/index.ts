import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationEmailRequest {
  notificationId: string;
  userEmail: string;
  subscriptionName: string;
  notificationType: string;
  daysRemaining: number;
  price: number;
  cycle: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      notificationId,
      userEmail,
      subscriptionName,
      notificationType,
      daysRemaining,
      price,
      cycle
    }: NotificationEmailRequest = await req.json();

    console.log(`Processing email notification: ${notificationId} for ${userEmail}`);

    // Get email template from database
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('notification_type', notificationType)
      .eq('is_default', true)
      .single();

    if (templateError || !template) {
      console.error('Template not found:', templateError);
      throw new Error(`Email template not found for type: ${notificationType}`);
    }

    // Replace template variables
    const variables = {
      subscription_name: subscriptionName,
      days_remaining: daysRemaining.toString(),
      price: `$${price.toFixed(2)}`,
      cycle: cycle,
      subscription_url: `${Deno.env.get('SITE_URL') || 'https://app.example.com'}/dashboard`
    };

    let subject = template.subject;
    let htmlContent = template.html_content;
    let textContent = template.text_content || '';

    // Replace all variables in templates
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      subject = subject.replace(new RegExp(placeholder, 'g'), value);
      htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value);
      textContent = textContent.replace(new RegExp(placeholder, 'g'), value);
    });

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: "Subscription Manager <notifications@resend.dev>",
      to: [userEmail],
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
            h2 { margin: 0 0 20px 0; }
            p { margin: 0 0 15px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🔔 Subscription Notification</h1>
          </div>
          <div class="content">
            ${htmlContent}
          </div>
          <div class="footer">
            <p>This email was sent by your Subscription Manager app. If you no longer wish to receive these notifications, you can update your preferences in the app settings.</p>
          </div>
        </body>
        </html>
      `,
      text: textContent
    });

    console.log("Email sent successfully:", emailResponse);

    // Update notification queue status
    const { error: updateError } = await supabase
      .from('notification_queue')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        email_data: {
          message_id: emailResponse.data?.id,
          subject: subject,
          recipient: userEmail
        }
      })
      .eq('id', notificationId);

    if (updateError) {
      console.error('Failed to update notification status:', updateError);
    }

    return new Response(JSON.stringify({
      success: true,
      messageId: emailResponse.data?.id,
      notificationId
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-notification-email function:", error);

    // Try to update notification status to failed if we have the ID
    try {
      const body = await req.json();
      if (body.notificationId) {
        await supabase
          .from('notification_queue')
          .update({
            status: 'failed',
            error_message: error.message,
            attempts: supabase.rpc('increment_attempts', { notification_id: body.notificationId })
          })
          .eq('id', body.notificationId);
      }
    } catch (updateError) {
      console.error('Failed to update failed notification:', updateError);
    }

    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);