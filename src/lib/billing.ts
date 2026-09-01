// Plain data — NOT in a "use server" file. Next.js only allows async
// function exports from "use server" files (see settings/actions.ts), so
// this constant lives here and gets imported by both the server action and
// the client component that renders it.
export const BILLABLE_ITEMS: Record<string, { label: string; amountNaira: number }> = {
  document_review: { label: "Priority document review", amountNaira: 5000 },
  visa_guide_unlock: { label: "Full researched guide unlock (non-Live-Guide country)", amountNaira: 2500 },
  application_fast_track: { label: "Application fast-track support", amountNaira: 15000 },
};
