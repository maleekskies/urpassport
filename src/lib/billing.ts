// Plain data shared by the server action and the billing panel.
export const BILLABLE_ITEMS: Record<string, { label: string; amountNaira: number }> = {
  document_review: { label: "Priority document review", amountNaira: 5000 },
  visa_guide_unlock: { label: "Full researched guide unlock", amountNaira: 2500 },
  application_fast_track: { label: "Application fast-track support", amountNaira: 15000 },
};
