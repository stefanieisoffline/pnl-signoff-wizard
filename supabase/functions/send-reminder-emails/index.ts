import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PendingReport {
  bookName: string;
  desk: string;
  date: string;
}

interface TraderReminder {
  traderName: string;
  traderEmail: string;
  pendingReports: PendingReport[];
}

interface RequestBody {
  pendingBooks: Array<{
    bookName: string;
    desk: string;
    primaryTrader: string;
    primaryTraderEmail?: string;
    pendingDates: string[];
  }>;
  siteUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-reminder-emails function called");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { pendingBooks, siteUrl }: RequestBody = await req.json();

    console.log(`Processing ${pendingBooks.length} books with pending sign-offs`);

    // Group pending reports by trader
    const traderReminders = new Map<string, TraderReminder>();

    for (const book of pendingBooks) {
      // Create mock email from trader name (in production, this would come from a users table)
      const traderEmail = book.primaryTraderEmail || 
        `${book.primaryTrader.toLowerCase().replace(/\s+/g, '.')}@sefe-energy.com`;
      
      if (!traderReminders.has(book.primaryTrader)) {
        traderReminders.set(book.primaryTrader, {
          traderName: book.primaryTrader,
          traderEmail: traderEmail,
          pendingReports: [],
        });
      }

      const reminder = traderReminders.get(book.primaryTrader)!;
      for (const date of book.pendingDates) {
        reminder.pendingReports.push({
          bookName: book.bookName,
          desk: book.desk,
          date: date,
        });
      }
    }

    console.log(`Sending reminders to ${traderReminders.size} traders`);

    const results: Array<{ trader: string; status: string; error?: string }> = [];

    // Add delay between emails to avoid rate limiting (2 req/s limit)
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    for (const [traderName, reminder] of traderReminders) {
      try {
        const reportsList = reminder.pendingReports
          .map((r) => `• ${r.bookName} (${r.desk}) - ${formatDate(r.date)}`)
          .join("\n");

        const htmlReportsList = reminder.pendingReports
          .map((r) => `<li><strong>${r.bookName}</strong> (${r.desk}) - ${formatDate(r.date)}</li>`)
          .join("");

        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
              .footer { background: #f3f4f6; padding: 15px; border-radius: 0 0 8px 8px; font-size: 12px; color: #6b7280; }
              .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
              .report-list { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
              .report-list ul { margin: 0; padding-left: 20px; }
              .report-list li { margin: 8px 0; }
              .count-badge { background: #ef4444; color: white; padding: 2px 8px; border-radius: 12px; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">P&L Sign-Off Reminder</h1>
                <p style="margin: 5px 0 0 0; opacity: 0.9;">SEFE Trading Report Management</p>
              </div>
              <div class="content">
                <p>Hi ${reminder.traderName},</p>
                <p>You have <span class="count-badge">${reminder.pendingReports.length}</span> P&L report(s) awaiting your sign-off:</p>
                <div class="report-list">
                  <ul>${htmlReportsList}</ul>
                </div>
                <p>Please sign off these reports at your earliest convenience.</p>
                <a href="${siteUrl}/trader" class="button">Sign Off Now →</a>
              </div>
              <div class="footer">
                <p>This is an automated reminder from the SEFE P&L Sign-Off system.</p>
                <p>If you have any questions, please contact your Product Controller.</p>
              </div>
            </div>
          </body>
          </html>
        `;

        // For testing, use Resend's test domain - in production, replace with verified domain
        const emailResponse = await resend.emails.send({
          from: "SEFE P&L Sign-Off <onboarding@resend.dev>",
          to: [reminder.traderEmail],
          subject: `P&L Sign-Off Reminder - ${reminder.pendingReports.length} Report(s) Pending`,
          html: emailHtml,
        });

        console.log(`Email sent to ${traderName}:`, emailResponse);

        // Log to database
        await supabase.from("notification_logs").insert({
          trader_email: reminder.traderEmail,
          trader_name: traderName,
          books_count: reminder.pendingReports.length,
          book_names: reminder.pendingReports.map((r) => r.bookName),
          notification_type: "email",
          status: "sent",
        });

        // Create in-app notification
        await supabase.from("notifications").insert({
          user_id: traderName,
          user_email: reminder.traderEmail,
          title: "P&L Sign-Off Reminder",
          message: `You have ${reminder.pendingReports.length} report(s) pending sign-off`,
          type: "reminder",
          link: "/trader",
          metadata: { reports: reminder.pendingReports },
        });

        results.push({ trader: traderName, status: "sent" });
        
        // Wait 600ms between emails to stay under rate limit
        await delay(600);
      } catch (emailError: any) {
        console.error(`Failed to send email to ${traderName}:`, emailError);
        
        // Log failure
        await supabase.from("notification_logs").insert({
          trader_email: reminder.traderEmail,
          trader_name: traderName,
          books_count: reminder.pendingReports.length,
          book_names: reminder.pendingReports.map((r) => r.bookName),
          notification_type: "email",
          status: "failed",
          error_message: emailError.message,
        });

        results.push({ trader: traderName, status: "failed", error: emailError.message });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        tradersNotified: results.filter((r) => r.status === "sent").length,
        tradersFailed: results.filter((r) => r.status === "failed").length,
        results,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-reminder-emails function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

serve(handler);
