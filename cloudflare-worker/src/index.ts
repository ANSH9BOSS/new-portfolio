import { EmailMessage } from "cloudflare:email";

export interface Env {
  // Cloudflare SendEmail binding
  SEB: {
    send: (message: EmailMessage) => Promise<void>;
  };
  // The verified sender address on your Cloudflare domain, e.g. contact@aerix.cloud
  FROM_EMAIL?: string;
  // Where you want to receive the email, e.g. ansh9boss@aerix.cloud or your personal Gmail
  TO_EMAIL?: string;
  // Optional secret token to prevent unauthorized access
  AUTH_SECRET?: string;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildHtmlTemplate(fullName: string, email: string, message: string, ip: string, timestamp: string) {
  const cleanName = escapeHtml(fullName);
  const cleanEmail = escapeHtml(email);
  const cleanMsg = escapeHtml(message).replace(/\n/g, "<br/>");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 24px; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background: #18181b; border: 1px solid #27272a; border-radius: 12px; overflow: hidden;">
    <tr>
      <td style="padding: 24px 32px; background: linear-gradient(135deg, #f97316 0%, #ec4899 100%);">
        <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff;">Cloudflare Mailer &bull; New Message</h1>
        <p style="margin: 4px 0 0; font-size: 13px; color: rgba(255, 255, 255, 0.9); font-family: monospace;">From: ${cleanName} &lt;${cleanEmail}&gt;</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 28px 32px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
          <tr>
            <td style="padding: 10px 14px; background: #27272a; border-radius: 8px; font-size: 13px; color: #a1a1aa;">
              <strong style="color: #ffffff;">Sender:</strong> ${cleanName} (<a href="mailto:${cleanEmail}" style="color: #fb923c; text-decoration: none;">${cleanEmail}</a>)
            </td>
          </tr>
        </table>
        <div style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #f4f4f5; background: #09090b; padding: 18px; border-radius: 8px; border-left: 3px solid #f97316;">
          ${cleanMsg}
        </div>
        <div style="text-align: center; margin: 24px 0;">
          <a href="mailto:${cleanEmail}?subject=Re:%20Portfolio%20Inquiry" style="display: inline-block; padding: 12px 24px; background: #f97316; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; border-radius: 8px;">
            Reply to ${cleanName}
          </a>
        </div>
        <hr style="border: 0; border-top: 1px solid #27272a; margin: 24px 0 16px;" />
        <p style="margin: 0; font-size: 11px; color: #71717a; font-family: monospace;">Received at: ${timestamp} &bull; Client IP: ${ip}</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildRawMime(from: string, to: string, replyTo: string, subject: string, text: string, html: string): string {
  const boundary = "==_mime_part_" + Math.random().toString(36).substring(2);
  const dateStr = new Date().toUTCString();
  const subjectB64 = `=?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;

  const headers = [
    `From: Portfolio Contact <${from}>`,
    `To: <${to}>`,
    `Reply-To: <${replyTo}>`,
    `Subject: ${subjectB64}`,
    `Date: ${dateStr}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
  ].join("\r\n");

  const textPart = [
    `--${boundary}`,
    `Content-Type: text/plain; charset=UTF-8`,
    `Content-Transfer-Encoding: base64`,
    ``,
    btoa(unescape(encodeURIComponent(text))),
  ].join("\r\n");

  const htmlPart = [
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: base64`,
    ``,
    btoa(unescape(encodeURIComponent(html))),
  ].join("\r\n");

  return [headers, "", textPart, htmlPart, `--${boundary}--`, ""].join("\r\n");
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // Verify secret token if configured
    if (env.AUTH_SECRET) {
      const authHeader = request.headers.get("Authorization");
      const token = authHeader?.replace(/^Bearer\s+/i, "");
      if (token !== env.AUTH_SECRET) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
      }
    }

    try {
      const body = (await request.json()) as {
        fullName?: string;
        email?: string;
        message?: string;
        ip?: string;
        timestamp?: string;
      };

      const fullName = (body.fullName || "").trim();
      const email = (body.email || "").trim();
      const message = (body.message || "").trim();
      const ip = body.ip || "unknown";
      const timestamp = body.timestamp || new Date().toISOString();

      if (!fullName || !email || !message) {
        return new Response(
          JSON.stringify({ error: "Missing required fields (fullName, email, message)" }),
          { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }

      if (!env.SEB) {
        return new Response(
          JSON.stringify({
            error: "SendEmail binding (SEB) is not configured in Cloudflare Worker.",
          }),
          { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }

      const fromEmail = env.FROM_EMAIL || "contact@aerix.cloud";
      const toEmail = env.TO_EMAIL || "ansh9boss@aerix.cloud";

      const plainText = `New Message from ${fullName} <${email}>\n\nMessage:\n${message}\n\nReceived at: ${timestamp}\nClient IP: ${ip}`;
      const htmlText = buildHtmlTemplate(fullName, email, message, ip, timestamp);
      const rawMime = buildRawMime(fromEmail, toEmail, email, `New Portfolio Message from ${fullName}`, plainText, htmlText);

      const emailMessage = new EmailMessage(fromEmail, toEmail, rawMime);
      await env.SEB.send(emailMessage);

      return new Response(
        JSON.stringify({ success: true, message: "Email sent successfully via Cloudflare Email Routing!" }),
        { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Internal Server Error";
      return new Response(JSON.stringify({ error: errorMsg }), {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }
  },
};
