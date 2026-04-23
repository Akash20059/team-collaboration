import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Email via Resend
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";

// SMS + WhatsApp via Twilio
const TWILIO_SID = Deno.env.get("TWILIO_ACCOUNT_SID") ?? "";
const TWILIO_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN") ?? "";
const TWILIO_SMS_FROM = Deno.env.get("TWILIO_PHONE_NUMBER") ?? "";            // e.g. +14155551234
const TWILIO_WA_FROM = Deno.env.get("TWILIO_WHATSAPP_NUMBER") ?? "";          // e.g. +14155238886 (sandbox)

// Change this once you verify your own domain in Resend.
// Until then, Resend's test domain `onboarding@resend.dev` works out of the box.
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") ?? "Shreemata Goumandira <onboarding@resend.dev>";
const UPI_ID = "337437337963378@cnrb";

type Donor = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  amount: number;
  next_reminder_date: string;
};

serve(async () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const today = new Date().toISOString().slice(0, 10);

  const { data: donors, error } = await supabase
    .from("monthly_donors")
    .select("id, name, email, phone, amount, next_reminder_date")
    .lte("next_reminder_date", today)
    .eq("is_active", true);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  const results: Array<{ id: string; name: string; channels: Record<string, boolean> }> = [];

  for (const donor of (donors ?? []) as Donor[]) {
    const channels = {
      email: false,
      sms: false,
      whatsapp: false,
    };

    if (donor.email) channels.email = await sendEmail(donor);
    if (donor.phone) {
      channels.sms = await sendSMS(donor);
      channels.whatsapp = await sendWhatsApp(donor);
    }

    results.push({ id: donor.id, name: donor.name, channels });

    // Advance reminder date only if at least one channel succeeded
    if (channels.email || channels.sms || channels.whatsapp) {
      const reminder = new Date(donor.next_reminder_date);
      const nextDue = new Date(reminder);
      nextDue.setDate(nextDue.getDate() + 1);       // restore due date
      nextDue.setMonth(nextDue.getMonth() + 1);     // advance 1 month
      nextDue.setDate(nextDue.getDate() - 1);       // back 1 day

      await supabase
        .from("monthly_donors")
        .update({
          last_payment_date: new Date(reminder.getTime() + 86400000).toISOString().slice(0, 10),
          next_reminder_date: nextDue.toISOString().slice(0, 10),
        })
        .eq("id", donor.id);
    }
  }

  return new Response(JSON.stringify({ processed: results.length, results }), {
    headers: { "Content-Type": "application/json" },
  });
});

// ─── Channel: Email (Resend) ────────────────────────────────────────────────
async function sendEmail(donor: Donor): Promise<boolean> {
  if (!RESEND_API_KEY || !donor.email) return false;

  const amt = `₹${donor.amount.toLocaleString("en-IN")}`;
  const upiLink = `upi://pay?pa=${UPI_ID}&pn=Shreemata%20Goumandira&am=${donor.amount}&cu=INR&tn=Monthly%20Donation`;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto">
      <div style="background:#D4540A;padding:20px;text-align:center;border-radius:8px 8px 0 0">
        <h1 style="color:white;margin:0;font-size:22px">🐄 Shreemata Goumandira</h1>
        <p style="color:rgba(255,255,255,0.85);margin:4px 0 0">Monthly Donation Reminder</p>
      </div>
      <div style="background:#fff8f3;padding:24px;border:1px solid #f0dcc8;border-top:none;border-radius:0 0 8px 8px">
        <p>Namaskara <strong>${donor.name}</strong> 🙏</p>
        <p>Your monthly pledge of <strong style="color:#D4540A">${amt}</strong> is due tomorrow.</p>
        <div style="background:white;border:2px solid #D4540A;border-radius:8px;padding:16px;margin:16px 0;text-align:center">
          <p style="margin:0;font-size:22px;font-weight:bold;color:#D4540A">${amt}</p>
          <p style="margin:4px 0 10px;font-size:13px">UPI: <code>${UPI_ID}</code></p>
          <a href="${upiLink}" style="background:#D4540A;color:white;padding:10px 24px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block">Pay Now 🙏</a>
        </div>
        <p style="color:#888;font-size:13px">May Gau Mata bless you 🌿</p>
      </div>
    </div>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: donor.email,
      subject: `Monthly Donation Reminder — ${amt} 🙏`,
      html,
    }),
  });
  return res.ok;
}

// ─── Channel: SMS (Twilio) ──────────────────────────────────────────────────
async function sendSMS(donor: Donor): Promise<boolean> {
  if (!TWILIO_SID || !TWILIO_TOKEN || !TWILIO_SMS_FROM || !donor.phone) return false;
  return twilioSend(donor.phone, TWILIO_SMS_FROM, buildSmsBody(donor));
}

// ─── Channel: WhatsApp (Twilio) ─────────────────────────────────────────────
async function sendWhatsApp(donor: Donor): Promise<boolean> {
  if (!TWILIO_SID || !TWILIO_TOKEN || !TWILIO_WA_FROM || !donor.phone) return false;
  const toWhatsApp = `whatsapp:${donor.phone}`;
  const fromWhatsApp = `whatsapp:${TWILIO_WA_FROM}`;
  return twilioSend(toWhatsApp, fromWhatsApp, buildWhatsAppBody(donor), true);
}

function buildSmsBody(d: Donor): string {
  const amt = `Rs ${d.amount.toLocaleString("en-IN")}`;
  return `Namaskara ${d.name}! Your monthly donation of ${amt} to Shreemata Goumandira is due tomorrow. Pay via UPI: ${UPI_ID}. Thank you! 🙏`;
}

function buildWhatsAppBody(d: Donor): string {
  const amt = `₹${d.amount.toLocaleString("en-IN")}`;
  const upiLink = `upi://pay?pa=${UPI_ID}&pn=Shreemata%20Goumandira&am=${d.amount}&cu=INR&tn=Monthly%20Donation`;
  return `🐄 *Shreemata Goumandira* — Monthly Reminder 🙏\n\nNamaskara *${d.name}*!\n\nYour monthly pledge of *${amt}* is due tomorrow.\n\n💳 Pay via UPI:\n• UPI ID: \`${UPI_ID}\`\n• Direct link: ${upiLink}\n\nMay Gau Mata bless you 🌿`;
}

async function twilioSend(to: string, from: string, body: string, _isWhatsApp = false): Promise<boolean> {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`;
  const auth = btoa(`${TWILIO_SID}:${TWILIO_TOKEN}`);
  const form = new URLSearchParams({ To: to, From: from, Body: body });

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`Twilio send failed (to=${to}):`, err);
    return false;
  }
  return true;
}
