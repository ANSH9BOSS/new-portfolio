# Cloudflare Email Routing Worker for Portfolio Contact Form

This worker receives contact form requests and sends the email directly using **Cloudflare Email Routing (`SendEmail` binding)** at Cloudflare's edge — 100% free, zero external SaaS, and zero third-party email dependencies.

---

## ⚡ Quick 3-Step Setup

### Step 1: Enable Email Routing in Cloudflare Dashboard
1. Go to your [Cloudflare Dashboard](https://dash.cloudflare.com) and select your domain (e.g. `aerix.cloud`).
2. Navigate to **Email** &rarr; **Email Routing**.
3. If not already enabled, click **Get Started** and add your destination address (e.g., `ansh9boss@aerix.cloud` or your Gmail) and verify the email.
4. Make sure your destination address matches `TO_EMAIL` in `wrangler.toml`.

### Step 2: Deploy the Worker
Open your terminal in this directory:
```bash
cd cloudflare-worker
npx wrangler login     # (Logs into your Cloudflare account in the browser)
npx wrangler deploy    # (Deploys the worker instantly)
```

Wrangler will output your live worker URL:
```text
Published portfolio-contact-mailer (https://portfolio-contact-mailer.<your-subdomain>.workers.dev)
```

*(Optional Security)* Set a secret token so only your portfolio can invoke the worker:
```bash
npx wrangler secret put AUTH_SECRET
# Enter any random secret string (e.g. my_secret_token_123)
```

### Step 3: Add to Portfolio `.env.local`
In your portfolio root directory `.env.local` (and in Vercel project environment settings):
```env
CLOUDFLARE_WORKER_URL=https://portfolio-contact-mailer.<your-subdomain>.workers.dev
CLOUDFLARE_WORKER_SECRET=my_secret_token_123
```

That's it! Your contact form will now deliver emails directly through Cloudflare's edge network!
