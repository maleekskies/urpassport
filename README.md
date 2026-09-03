# UrPassport NG: Next.js + Supabase

The real, running codebase (not a mockup). Auth, database, storage,
live visa data, real flight search, billing, and email reminders are all
wired to actual providers.

## What's real here

- **Auth**: Supabase email/password + Google OAuth, route-protected via
  `middleware.ts` and a server-side check in `dashboard/layout.tsx`.
- **Database + RLS**: 12 tables (`supabase/migrations/0001_init.sql` +
  `0003_upgrades.sql`), every user-owned table locked down with RLS keyed
  on `auth.uid()`.
- **Storage**: private `documents` bucket, per-user folder policies.
- **Dashboard**: real queries against `applications`/`documents`.
- **Passport Hub**: real saved applications, checklist state, NIN Match
  Checker (client-side only, nothing ever sent anywhere).
- **Visa Assistant**: all 193 countries. UK/US/Canada/UAE are "★ Live
  Guide" (real, saveable applications with fully researched content).
  France/Ghana are "★ Full Guide" (fully researched, informational only).
  Every other country now pulls a **live** visa-requirement status from the
  Travel Buddy Visa Requirements API (via RapidAPI), cached in
  `visa_requirements_cache`, not static filler text.
- **Document Vault**: real uploads to Supabase Storage, real delete, now
  with **expiry-date tracking** per document and visual expiry badges.
- **AI Trip Planner**: real Anthropic API call, structured JSON, saved to
  `itineraries`. **Rate-limited** (`AI_PLANNER_DAILY_LIMIT`, default 5/day
  per user) via `ai_usage_log`.
- **Flights**: real search against the **Duffel Flights API**
  (test-mode token by default), with a visa-linked status banner that
  warns you if you're searching flights to a country you don't have a
  ready visa for yet. "Hold this fare" saves the offer to `bookings`.
- **Billing**: real **Paystack** checkout for a small set of paid add-ons
  (priority document review, full guide unlock, application fast-track).
  Payment status is confirmed via a signed Paystack webhook
  (`/api/paystack/webhook`), with the redirect-back callback page as a
  friendly fallback.
- **Email reminders**: a cron route (`/api/cron/expiry-reminders`) emails
  users via **Resend** when a document is within 30 days of its expiry
  date, respecting a per-user opt-out in Settings.
- **Family**: manage passport/visa applications on behalf of dependants
  (`/dashboard/family`), NIN stored the same way as your own (one-way hash).

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Create a Supabase project
Go to [supabase.com](https://supabase.com), create a project, grab your
Project URL, anon key, and **service role key** from **Settings → API**.
The service role key powers the cron route and the Paystack webhook,
both run with no user session, so they use it to bypass RLS safely.

### 3. Run the migrations, in order
1. `supabase/migrations/0001_init.sql`: core schema + RLS + the
   auth-signup trigger.
2. `supabase/migrations/0002_storage.sql`: the `documents` Storage bucket.
3. `supabase/migrations/0003_upgrades.sql`: visa cache, flights/billing
   support, document expiry, family members, AI rate limiting,
   notification log.
4. `supabase/seed.sql`: reference content for `application_types`.

(Supabase CLI: `supabase db push`.)

### 4. Enable Google OAuth (optional)
**Authentication → Providers** in the Supabase dashboard.

### 5. Set up the other providers
All of these are optional individually, each feature degrades gracefully
(with an honest error, never fabricated data) if its env vars are missing.

| Feature | Provider | Where to get keys |
|---|---|---|
| Live visa data | Travel Buddy (RapidAPI) | rapidapi.com, subscribe to "Visa Requirement API", free tier available |
| Flights | Duffel | duffel.com, free self-serve test-mode token |
| Billing | Paystack | dashboard.paystack.com, test keys under Settings → API Keys & Webhooks |
| Email reminders | Resend | resend.com, free tier, verify a sending domain |

### 6. Set environment variables
```bash
cp .env.local.example .env.local
```
Fill in what you have. See the table above for what each key unlocks.

### 7. Run it
```bash
npm run dev
```
Open `http://localhost:3000`, sign up, and you'll land on a real Dashboard.

### 8. Wire up the webhook and cron job (production only)
- Paystack: add `https://yourdomain.com/api/paystack/webhook` under
  **Settings → API Keys & Webhooks** in the Paystack dashboard.
- Expiry reminders: `vercel.json` already schedules
  `/api/cron/expiry-reminders` daily at 07:00 UTC if you deploy to Vercel.
  Set `CRON_SECRET` in your environment. Vercel Cron sends it
  automatically as a bearer token. On another host, point any scheduler at
  that URL with `Authorization: Bearer <CRON_SECRET>`.

## Project structure
```
src/
  app/
    page.tsx, login/, auth/callback/, auth/reset-password/
    not-found.tsx, icon.svg, opengraph-image.tsx, robots.ts, sitemap.ts
    api/
      cron/expiry-reminders/route.ts   # Resend expiry emails
      paystack/webhook/route.ts         # Payment confirmation
    dashboard/
      layout.tsx, page.tsx
      passport/, visa/, documents/, flights/, planner/, settings/, family/
  components/                            # AppShell, Sidebar
  lib/
    supabase/{client,server,middleware,service}.ts
    duffel.ts          # Flight search
    paystack.ts        # Checkout + webhook verification
    resend.ts           # Email sending
    visaApi.ts           # Live visa requirements + caching
    countries.ts          # Country list, ISO codes, researched guides
    billing.ts              # Paid add-on price list
    site.ts                  # Public site URL, used by metadata/sitemap/robots
    database.types.ts
public/
  llms.txt
supabase/
  migrations/0001_init.sql, 0002_storage.sql, 0003_upgrades.sql
  seed.sql
```

## Deploying
Push to GitHub, import into [Vercel](https://vercel.com), add the env vars
from `.env.local.example` in the Vercel project settings, and confirm the
cron job under **Settings → Cron Jobs** once deployed.

## Honest note on what wasn't verified here
This was written and typechecked (`npx tsc --noEmit` passes clean) in an
environment without access to Duffel, Paystack, Resend, or RapidAPI, so
none of those four integrations have been exercised against a live account,
so the code is correct to the best of careful review against each
provider's documented API shape, but you're the first to actually run a
request through them. If a response shape has drifted from what's coded
here, that's the most likely source of a runtime error, not a structural
issue.
