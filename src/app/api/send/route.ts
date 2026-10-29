import { config } from "@/data/config";
import { sendNativeEmail, SmtpConfig } from "@/lib/smtp";
import { z } from "zod";

const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

const ContactSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters").max(100, "Name too long"),
  email: z.string().trim().email("Please provide a valid email address"),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(5000, "Message too long"),
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildHtmlTemplate({
  fullName,
  email,
  message,
  ip,
  timestamp,
}: {
  fullName: string;
  email: string;
  message: string;
  ip: string;
  timestamp: string;
}) {
  const cleanName = escapeHtml(fullName);
  const cleanEmail = escapeHtml(email);
  const cleanMsg = escapeHtml(message).replace(/\n/g, "<br/>");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Portfolio Message</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background: #18181b; border: 1px solid #27272a; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
    <tr>
      <td style="padding: 24px 32px; background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);">
        <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
          New Portfolio Message
        </h1>
        <p style="margin: 4px 0 0; font-size: 13px; color: rgba(255, 255, 255, 0.85); font-family: monospace;">
          From: ${cleanName} &lt;${cleanEmail}&gt;
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 28px 32px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
          <tr>
            <td style="padding: 10px 14px; background: #27272a; border-radius: 8px; font-size: 13px; color: #a1a1aa;">
              <strong style="color: #ffffff;">Sender:</strong> ${cleanName} (<a href="mailto:${cleanEmail}" style="color: #38bdf8; text-decoration: none;">${cleanEmail}</a>)
            </td>
          </tr>
        </table>

        <div style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #f4f4f5; background: #09090b; padding: 18px; border-radius: 8px; border-left: 3px solid #6366f1;">
          ${cleanMsg}
        </div>

        <div style="text-align: center; margin: 24px 0;">
          <a href="mailto:${cleanEmail}?subject=Re:%20Portfolio%20Inquiry" style="display: inline-block; padding: 12px 24px; background: #4f46e5; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; border-radius: 8px;">
            Reply to ${cleanName}
          </a>
        </div>

        <hr style="border: 0; border-top: 1px solid #27272a; margin: 24px 0 16px;" />
        <p style="margin: 0; font-size: 11px; color: #71717a; font-family: monospace;">
          Received at: ${timestamp} &bull; Client IP: ${ip}
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    if (isRateLimited(ip)) {
      return Response.json(
        { error: "Too many requests. Please wait a minute before trying again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parseResult = ContactSchema.safeParse(body);
    if (!parseResult.success) {
      const msg = parseResult.error.issues.map((i) => i.message).join(", ");
      return Response.json({ error: msg }, { status: 400 });
    }

    const { fullName, email, message } = parseResult.data;
    const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST";

    // 1. Check for Discord Webhook delivery (if configured)
    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
    let discordSent = false;
    if (discordWebhookUrl) {
      try {
        const discordRes = await fetch(discordWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "Portfolio Contact",
            avatar_url: "https://github.com/ANSH9BOSS.png",
            embeds: [
              {
                title: "📬 New Contact Form Submission",
                color: 0x6366f1, // Indigo
                fields: [
                  { name: "Sender", value: `**${fullName}**`, inline: true },
                  { name: "Email", value: `[${email}](mailto:${email})`, inline: true },
                  { name: "Message", value: message.length > 1024 ? message.slice(0, 1020) + "..." : message },
                ],
                footer: { text: `IP: ${ip} • ${timestamp}` },
                timestamp: new Date().toISOString(),
              },
            ],
          }),
        });
        if (discordRes.ok) {
          discordSent = true;
        }
      } catch (dErr) {
        console.error("Discord webhook delivery failed:", dErr);
      }
    }

    // 2. SMTP Delivery Configuration
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpPort = parseInt(process.env.SMTP_PORT || "465", 10);
    const smtpSecure = process.env.SMTP_SECURE !== "false";
    const receiverEmail = process.env.CONTACT_RECEIVER_EMAIL || config.email || "ansh9boss@aerix.cloud";

    // If SMTP is configured, send via Native SMTP
    if (smtpHost && smtpUser && smtpPass) {
      const smtpConfig: SmtpConfig = {
        host: smtpHost,
        port: smtpPort,
        user: smtpUser,
        pass: smtpPass,
        secure: smtpSecure,
        rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== "false",
      };

      const plainText = [
        `New Portfolio Contact Form Submission`,
        `=====================================`,
        `From: ${fullName} <${email}>`,
        `Date: ${timestamp}`,
        `IP: ${ip}`,
        ``,
        `Message:`,
        message,
        ``,
        `To reply, email: ${email}`,
      ].join("\n");

      const htmlText = buildHtmlTemplate({
        fullName,
        email,
        message,
        ip,
        timestamp,
      });

      await sendNativeEmail(smtpConfig, {
        fromName: `${fullName} (Portfolio)`,
        fromEmail: smtpUser,
        to: receiverEmail,
        replyTo: email,
        subject: `New Message from ${fullName} - Portfolio`,
        text: plainText,
        html: htmlText,
      });

      return Response.json({ success: true, message: "Email sent successfully via native SMTP!" });
    }

    // If Discord was sent without SMTP
    if (discordSent) {
      return Response.json({ success: true, message: "Message delivered successfully to Discord!" });
    }

    // Neither SMTP credentials nor Discord Webhook is configured
    return Response.json(
      {
        error:
          "SMTP credentials are not configured yet. Please configure SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in .env.local (or set DISCORD_WEBHOOK_URL).",
      },
      { status: 500 }
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Contact form error:", error);
    return Response.json({ error: errorMsg }, { status: 500 });
  }
}
