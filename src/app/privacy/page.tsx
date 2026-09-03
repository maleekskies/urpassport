import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What UrPassport NG collects, why, and who it's shared with.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg px-6 py-14">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="font-mono text-xs text-green-mid mb-8 inline-block">
          ← Back to Home
        </Link>
        <h1 className="font-display text-3xl mb-2">Privacy Policy</h1>
        <p className="text-ink-faint text-sm mb-10">Last updated: September 2026</p>

        <div className="space-y-7 text-ink-soft text-sm leading-relaxed">
          <p>
            This describes, plainly, what data UrPassport NG collects and why, since the app
            handles genuinely sensitive information: your NIN, passport and visa documents, and
            payment activity.
          </p>

          <section>
            <h2 className="font-display text-lg text-ink mb-2">What we collect</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Account info: email, full name, phone number.</li>
              <li>
                Your NIN: never stored in readable form. We store a one-way hash of it, used only
                to power the NIN Match Checker. The hash can&rsquo;t be reversed back into your
                actual NIN.
              </li>
              <li>
                Documents you upload to the Document Vault: stored privately, accessible only to
                your account.
              </li>
              <li>Application progress: your passport/visa checklist state and status.</li>
              <li>Trip details you enter into the AI Trip Planner, and the itineraries it generates.</li>
              <li>Payment records: what was paid for, amount, and status, not your card details.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg text-ink mb-2">Who else sees it</h2>
            <p>We use a small number of external services to make the app work:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>Supabase: hosts our database, authentication, and file storage.</li>
              <li>Anthropic: powers the AI Trip Planner. Trip details you enter are sent to generate your itinerary.</li>
              <li>Duffel: powers flight search. Your search criteria (route, dates) are sent to return live fares.</li>
              <li>Paystack: processes payments for paid add-ons.</li>
              <li>Resend: sends document/visa expiry reminder emails, if you have those enabled.</li>
              <li>
                A third-party visa-requirements API: destination country lookups are sent to
                return current visa rules. No personal data beyond a country pair is sent for
                this.
              </li>
            </ul>
            <p className="mt-2">
              We don&rsquo;t sell your data, and we don&rsquo;t share it with anyone beyond what&rsquo;s
              needed to run the features above.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-ink mb-2">Your NIN, specifically</h2>
            <p>
              The NIN Match Checker on the Passport Hub runs the comparison in your browser. Your
              raw NIN is never sent to our servers by that feature. When you save a NIN to your
              profile (a separate, optional step), we store only its hash, not the number itself.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-ink mb-2">Your rights</h2>
            <p>
              You can update your profile information at any time in Settings. You can delete
              individual documents from the Vault yourself. To delete your account and all
              associated data entirely, contact us and we&rsquo;ll process the request.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-ink mb-2">A note on this policy</h2>
            <p>
              This page describes what the app actually does with your data, in plain language.
              It hasn&rsquo;t been reviewed by a lawyer, and shouldn&rsquo;t be treated as a
              substitute for proper legal review, particularly given how sensitive some of this
              data is. If you&rsquo;re relying on this for a live product handling real users&rsquo;
              NIN and passport data, get it reviewed by someone qualified before you scale.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
