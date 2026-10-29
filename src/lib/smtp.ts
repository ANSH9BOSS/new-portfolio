import * as net from "node:net";
import * as tls from "node:tls";
import * as crypto from "node:crypto";

export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  secure?: boolean;
  rejectUnauthorized?: boolean;
}

export interface SendMailOptions {
  fromName?: string;
  fromEmail?: string;
  to: string;
  replyTo?: string;
  subject: string;
  text: string;
  html?: string;
}

const DEFAULT_TIMEOUT_MS = 15000;

export class NativeSmtpClient {
  private socket: net.Socket | tls.TLSSocket | null = null;
  private buffer = "";

  constructor(private config: SmtpConfig) {}

  private async readResponse(timeoutMs = DEFAULT_TIMEOUT_MS): Promise<{ code: number; lines: string[]; full: string }> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        cleanup();
        reject(new Error(`SMTP connection timed out after ${timeoutMs}ms waiting for server response`));
      }, timeoutMs);

      const cleanup = () => {
        clearTimeout(timer);
        this.socket?.off("data", onData);
        this.socket?.off("error", onError);
        this.socket?.off("close", onClose);
      };

      const onData = (chunk: Buffer) => {
        this.buffer += chunk.toString("utf-8");
        const lines = this.buffer.split("\r\n");

        if (lines.length > 1 && lines[lines.length - 1] === "") {
          const completedLines = lines.slice(0, -1);
          const lastLine = completedLines[completedLines.length - 1];

          // Final response line starts with 3 digits followed by a space
          const match = lastLine.match(/^(\d{3})\s(.*)$/);
          if (match) {
            this.buffer = "";
            cleanup();
            resolve({
              code: parseInt(match[1], 10),
              lines: completedLines,
              full: completedLines.join("\n"),
            });
          }
        }
      };

      const onError = (err: Error) => {
        cleanup();
        reject(new Error(`SMTP Socket error: ${err.message}`));
      };

      const onClose = () => {
        cleanup();
        if (this.buffer.trim().length > 0) {
          const match = this.buffer.match(/^(\d{3})[\s-]/);
          if (match) {
            resolve({
              code: parseInt(match[1], 10),
              lines: this.buffer.split("\r\n").filter(Boolean),
              full: this.buffer,
            });
            return;
          }
        }
        reject(new Error("SMTP connection closed unexpectedly by remote server"));
      };

      this.socket?.on("data", onData);
      this.socket?.once("error", onError);
      this.socket?.once("close", onClose);
    });
  }

  private async sendCommand(cmd: string, expectedCode?: number): Promise<{ code: number; lines: string[]; full: string }> {
    if (!this.socket || this.socket.destroyed) {
      throw new Error("SMTP socket is not connected or already closed");
    }

    this.socket.write(cmd + "\r\n");
    const res = await this.readResponse();

    if (expectedCode) {
      const expectedFamily = Math.floor(expectedCode / 100);
      const actualFamily = Math.floor(res.code / 100);
      if (expectedFamily !== actualFamily) {
        throw new Error(`SMTP Error [${res.code}] on command '${cmd.split(" ")[0]}': ${res.full}`);
      }
    }

    return res;
  }

  async send(options: SendMailOptions): Promise<void> {
    const isDirectTls = this.config.secure ?? (this.config.port === 465);
    const rejectUnauthorized = this.config.rejectUnauthorized ?? true;

    // 1. Establish initial socket
    if (isDirectTls) {
      this.socket = tls.connect({
        host: this.config.host,
        port: this.config.port,
        servername: this.config.host,
        rejectUnauthorized,
      });
    } else {
      this.socket = net.connect({
        host: this.config.host,
        port: this.config.port,
      });
    }

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.socket?.destroy();
        reject(new Error(`Connection to SMTP host ${this.config.host}:${this.config.port} timed out`));
      }, DEFAULT_TIMEOUT_MS);

      const onConnect = () => {
        clearTimeout(timeout);
        resolve();
      };

      this.socket?.once(isDirectTls ? "secureConnect" : "connect", onConnect);
      this.socket?.once("error", (err) => {
        clearTimeout(timeout);
        reject(new Error(`Failed to connect to ${this.config.host}:${this.config.port}: ${err.message}`));
      });
    });

    try {
      // 2. Banner greeting (220)
      const greeting = await this.readResponse();
      if (greeting.code !== 220) {
        throw new Error(`Unexpected SMTP banner from server: ${greeting.full}`);
      }

      // 3. Initial EHLO
      await this.sendCommand("EHLO localhost", 250);

      // 4. Upgrade to STARTTLS if not already direct TLS
      if (!isDirectTls) {
        await this.sendCommand("STARTTLS", 220);

        const clearSocket = this.socket as net.Socket;
        this.socket = tls.connect({
          socket: clearSocket,
          host: this.config.host,
          servername: this.config.host,
          rejectUnauthorized,
        });

        await new Promise<void>((resolve, reject) => {
          this.socket?.once("secureConnect", () => resolve());
          this.socket?.once("error", (err) => reject(new Error(`STARTTLS handshake failed: ${err.message}`)));
        });

        // Re-issue EHLO after TLS handshake
        await this.sendCommand("EHLO localhost", 250);
      }

      // 5. Authenticate via AUTH LOGIN
      await this.sendCommand("AUTH LOGIN", 334);
      await this.sendCommand(Buffer.from(this.config.user).toString("base64"), 334);
      
      const authPassRes = await this.sendCommand(Buffer.from(this.config.pass).toString("base64"));
      if (authPassRes.code !== 235) {
        throw new Error(`SMTP Authentication failed for ${this.config.user}: ${authPassRes.full}`);
      }

      // 6. Envelope Sender & Recipient
      const senderAddress = this.config.user;
      await this.sendCommand(`MAIL FROM:<${senderAddress}>`, 250);
      await this.sendCommand(`RCPT TO:<${options.to}>`, 250);

      // 7. Initiate DATA transfer
      await this.sendCommand("DATA", 354);

      // 8. Construct RFC 5322 MIME message
      const boundary = "==_multipart_" + crypto.randomBytes(12).toString("hex");
      const dateStr = new Date().toUTCString();
      const subjectB64 = `=?UTF-8?B?${Buffer.from(options.subject).toString("base64")}?=`;
      
      const senderName = options.fromName ? options.fromName.replace(/["\r\n]/g, "") : "Portfolio Contact";
      const fromHeader = `=?UTF-8?B?${Buffer.from(senderName).toString("base64")}?= <${senderAddress}>`;

      const headers = [
        `From: ${fromHeader}`,
        `To: <${options.to}>`,
        options.replyTo ? `Reply-To: <${options.replyTo}>` : "",
        `Subject: ${subjectB64}`,
        `Date: ${dateStr}`,
        `Message-ID: <${crypto.randomUUID()}@${this.config.host}>`,
        `MIME-Version: 1.0`,
        `Content-Type: multipart/alternative; boundary="${boundary}"`,
      ].filter(Boolean).join("\r\n");

      // Plain text part (Base64 encoded to avoid 998-char line limits and dot-stuffing issues)
      const textPart = [
        `--${boundary}`,
        `Content-Type: text/plain; charset=UTF-8`,
        `Content-Transfer-Encoding: base64`,
        ``,
        Buffer.from(options.text).toString("base64"),
      ].join("\r\n");

      // HTML part
      const htmlPart = options.html
        ? [
            `--${boundary}`,
            `Content-Type: text/html; charset=UTF-8`,
            `Content-Transfer-Encoding: base64`,
            ``,
            Buffer.from(options.html).toString("base64"),
          ].join("\r\n")
        : "";

      const finalBody = [
        headers,
        "",
        textPart,
        htmlPart,
        `--${boundary}--`,
        "",
        ".",
      ].filter(Boolean).join("\r\n");

      await this.sendCommand(finalBody, 250);

      // 9. Graceful QUIT
      try {
        await this.sendCommand("QUIT", 221);
      } catch {
        // Safe to ignore QUIT failures
      }
    } finally {
      if (this.socket && !this.socket.destroyed) {
        this.socket.destroy();
      }
    }
  }
}

/**
 * Sends an email using native Node.js TLS/Net socket without any third-party npm packages.
 */
export async function sendNativeEmail(config: SmtpConfig, options: SendMailOptions): Promise<void> {
  const client = new NativeSmtpClient(config);
  await client.send(options);
}
