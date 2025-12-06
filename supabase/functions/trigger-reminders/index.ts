import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Mock book data - in production this would come from the database
const getPendingBooksData = () => {
  // This returns mock data for demonstration
  // In production, you would query the actual books table
  const bookData = [
    { name: "Area D", primaryTrader: "Robert Allan", desk: "Gas & Hub" },
    { name: "Deal Flow", primaryTrader: "Robert Allan", desk: "Gas & Hub" },
    { name: "IRE Gas", primaryTrader: "Robert Allan", desk: "Gas & Hub" },
    { name: "Conti Futures", primaryTrader: "Alexander Welch", desk: "Gas & Hub" },
    { name: "Futures", primaryTrader: "Alexander Welch", desk: "Gas & Hub" },
  ];

  // Get today's date as pending
  const today = new Date().toISOString().split("T")[0];

  return bookData.map((book) => ({
    bookName: book.name,
    desk: book.desk,
    primaryTrader: book.primaryTrader,
    pendingDates: [today],
  }));
};

const handler = async (req: Request): Promise<Response> => {
  console.log("trigger-reminders function called at", new Date().toISOString());

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get pending books data
    const pendingBooks = getPendingBooksData();

    if (pendingBooks.length === 0) {
      console.log("No pending books found, skipping reminder");
      return new Response(
        JSON.stringify({ success: true, message: "No pending reports" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Found ${pendingBooks.length} books with pending sign-offs`);

    // Call the send-reminder-emails function
    const { data, error } = await supabase.functions.invoke("send-reminder-emails", {
      body: {
        pendingBooks,
        siteUrl: "https://bdkvqqermbggvuygacay.lovableproject.com",
      },
    });

    if (error) {
      console.error("Error calling send-reminder-emails:", error);
      throw error;
    }

    console.log("Reminder emails triggered successfully:", data);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Reminders triggered successfully",
        result: data,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in trigger-reminders function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
