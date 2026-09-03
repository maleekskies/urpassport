import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that apply to using UrPassport NG.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-bg px-6 py-14">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="font-mono text-xs text-green-mid mb-8 inline-block">
          ← Back to Home
        </Link>
        <h1 className="font-display text-3xl mb-2">Terms of Service</h1>
        <p className="text-ink-faint text-sm mb-10">Last updated: September 2026</p>

        <div className="space-y-7 text-ink-soft text-sm leading-relaxed">
          <p>
            UrPassport NG is a tool to help you track a Nigerian passport renewal, research and
            track visa applications, store travel documents, search flights, and generate AI trip
            itineraries. By creating an account, you agree to the terms below.
          </p>

          <section>
            <h2 className="font-display text-lg text-ink mb-2">What this service is and isn&rsquo;t</h2>
            <p>
              UrPassport NG is not affiliated with the Nigeria Immigration Service, any embassy,
              consulate, or government body. Information shown for passport and visa processes is
              provided as guidance, not official instruction. Always confirm exact requirements,
              fees, and procedures on the relevant government or embassy&rsquo;s own site before
              relying on anything shown here. We are not responsible for a rejected application,
              missed deadline, or any other outcome of a real-world passport or visa process.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-ink mb-2">Your account</h2>
            <p>
              You&rsquo;re responsible for keeping your login credentials secure and for anything
              that happens under your account. Tell us if you believe your account has been
              accessed without your permission.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-ink mb-2">Your documents</h2>
            <p>
              Files you upload to the Document Vault (passport scans, visa stamps, and similar)
              are stored for your own use in tracking your applications. You&rsquo;re responsible
              for the accuracy and legality of anything you upload.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-ink mb-2">Payments</h2>
            <p>
              Paid add-ons are processed through Paystack. Payment details are handled by Paystack
              directly; we never see or store your card details ourselves.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-ink mb-2">AI-generated content</h2>
            <p>
              The AI Trip Planner generates itineraries using an AI model. Costs, opening hours,
              and availability shown in a generated itinerary are estimates, not confirmed
              bookings, and should be verified before you rely on them.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-ink mb-2">Account deletion</h2>
            <p>
              You can request deletion of your account and associated data at any time by
              contacting us. See the <Link href="/privacy" className="text-green-deep underline">Privacy Policy</Link> for
              what that includes.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-ink mb-2">Changes</h2>
            <p>
              These terms may be updated as the service changes. Continuing to use UrPassport NG
              after an update means you accept the revised terms.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
