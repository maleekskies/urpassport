// Single source of truth for the site's public URL, used by metadata,
// sitemap.ts, and robots.ts. Reuses NEXT_PUBLIC_APP_URL, the same env var
// settings/actions.ts already uses for the Paystack callback, so the host
// stays consistent everywhere without hardcoding a domain.
export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
