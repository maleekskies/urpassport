# UrPassport NG: Next.js + Supabase

A dashboard for Nigerians planning a trip. It tracks a passport application, visa checklists, uploaded documents, flight searches and AI trip plans behind one login. Auth, database, storage, visa data, flights, billing and reminders are wired to external providers.

## Features

- **Auth**: Supabase email/password and Google OAuth, with route protection in `middleware.ts` and a server check in `dashboard/layout.tsx`.
- **Database and RLS**: 12 tables created by the migrations in `supabase/migrations`, with row level security keyed on `auth.uid()` for user data.
- **Storage**: private `documents` bucket with per-user folder policies.
- **Dashboard**: queries against `applications` and `documents`.
- **Passport Hub**: saved applications, checklist state and a name comparison tool that runs in the browser.
- **Visa Assistant**: all 193 countries. The UK, US, Canada, UAE, France and Ghana have researched guides and trackable applications. Other countries show a general checklist plus a live requirement status from the Travel Buddy Visa Requirements API via RapidAPI, cached in `visa_requirements_cache`.
- **Document Vault**: uploads and deletes through Supabase Storage, expiry dates and expiry badges.
- **AI Trip Planner**: an Anthropic API call returning structured JSON saved to `itineraries`, limited by `AI_PLANNER_DAILY_LIMIT` (default 5 per day) through `ai_usage_log`.
- **Flights**: search through the Duffel Flights API with a test-mode token by default, plus a visa status banner and a "Hold this fare" action that saves offers to `bookings`.
- **Billing**: Paystack checkout for a small set of add-ons, confirmed by a signed webhook at `/api/paystack/webhook` with the callback page as a fallback.
- **Email reminders**: a cron route at `/api/cron/expiry-reminders` sends Resend emails for documents within 30 days of expiry, unless the user opted out in Settings.
- **Family**: manage applications for dependants at `/dashboard/family`, with NIN values stored as hashes.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

Go to [supabase.com](https://supabase.com), create a project, and copy the Project URL, anon key and service role key from Settings, API. The service role key is used by the cron route and the Paystack webhook, which run without a user session.

### 3. Apply the schema and seed data, in order

1. `supabase/migrations/0001_init.sql`: core schema, RLS and the auth signup trigger.
2. `supabase/migrations/0002_storage.sql`: the `documents` storage bucket.
3. `supabase/migrations/0003_upgrades.sql`: visa cache, flights and billing support, document expiry, family members, AI rate limits and notification log.
4. `supabase/seed.sql`: reference rows for `application_types`.
5. `supabase/migrations/0004_generic_visa_tracking.sql`: the generic visa type and the France and Ghana rows. Run this after the seed, because the seed clears `application_types`.

With the Supabase CLI: `supabase db push`.

### 4. Enable Google OAuth (optional)

Use Authentication, Providers in the Supabase dashboard.

### 5. Set up the other providers

Each provider is optional. A feature reports a specific error if its keys are missing.

| Feature | Provider | Where to get keys |
|---|---|---|
| Live visa data | Travel Buddy via RapidAPI | rapidapi.com, subscribe to "Travel Buddy - Visa Requirements API", free tier available |
| Flights | Duffel | duffel.com, free self-serve test-mode token |
| Billing | Paystack | dashboard.paystack.com, test keys under Settings, API Keys and Webhooks |
| Email reminders | Resend | resend.com, free tier, verify a sending domain you control |

### 6. Set environment variables

```bash
cp .env.local.example .env.local
```

Fill in the keys you have. Each key is listed in `.env.local.example` with the feature it unlocks.

### 7. Run it

```bash
npm run dev
```

Open `http://localhost:3000` and sign up to reach the dashboard.

### 8. Wire up the webhook and cron job (production only)

- Paystack: add `https://urpassport.vercel.app/api/paystack/webhook` under Settings, API Keys and Webhooks in the Paystack dashboard.
- Expiry reminders: `vercel.json` schedules `/api/cron/expiry-reminders` daily at 07:00 UTC on Vercel. Set `CRON_SECRET`; Vercel Cron sends it as a bearer token. On another host, point a scheduler at that URL with `Authorization: Bearer <CRON_SECRET>`.
- Set `NEXT_PUBLIC_APP_URL=https://urpassport.vercel.app` so metadata, sitemap, robots and the Paystack callback use the public host.

## Project structure

```
src/
  app/
    page.tsx, login/, terms/, privacy/
    auth/callback/, auth/reset-password/
    not-found.tsx, icon.svg, opengraph-image.tsx, robots.ts, sitemap.ts
    api/
      cron/expiry-reminders/route.ts   # Resend expiry emails
      paystack/webhook/route.ts        # Payment confirmation
    dashboard/
      layout.tsx, page.tsx
      passport/, visa/, documents/, flights/, planner/, settings/, family/
  components/                           # AppShell, Sidebar, StartApplicationButton
  lib/
    supabase/{client,server,middleware,service}.ts
    auth.ts
    duffel.ts         # Flight search
    paystack.ts       # Checkout and webhook verification
    resend.ts         # Email sending
    visaApi.ts        # Live visa requirements and caching
    countries.ts      # Country list, ISO codes, researched guides
    billing.ts        # Paid add-on price list
    site.ts           # Public site URL used by metadata, sitemap and robots
    database.types.ts
public/
  llms.txt
supabase/
  migrations/0001_init.sql, 0002_storage.sql, 0003_upgrades.sql,
             0004_generic_visa_tracking.sql
  seed.sql
```

## Deploying

Push to GitHub, import into [Vercel](https://vercel.com), add the variables from `.env.local.example` in the Vercel project settings, and confirm the cron job under Settings, Cron Jobs.

## Unverified integrations

Duffel, Paystack, Resend and RapidAPI were not reachable during development, so those four integrations were written against each provider's documented API shape and have not been exercised with live accounts. Check their responses after setup.
