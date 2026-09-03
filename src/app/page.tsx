import Link from "next/link";

export default function LandingPage() {
  return (
    <div>
      <nav className="sticky top-0 z-50 bg-bg/90 backdrop-blur border-b border-line">
        <div className="max-w-[1180px] mx-auto px-7 h-[76px] flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-display font-bold">
            <span className="w-7 h-7 rounded-full bg-green-deep text-gold-soft flex items-center justify-center font-mono text-xs font-bold">
              UP
            </span>
            UrPassport <span className="text-gold font-normal">NG</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm text-ink-soft">
            <a href="#solution">Passport</a>
            <a href="#destinations">Visas</a>
            <a href="#trust">Trust</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-semibold text-green-deep">
              Sign In
            </Link>
            <Link
              href="/login"
              className="bg-green-deep hover:bg-green-mid transition-colors text-white text-sm font-semibold px-5 py-2.5 rounded-md"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <section className="max-w-[1180px] mx-auto px-7 py-20">
        <div className="font-mono text-xs tracking-widest uppercase text-green-mid mb-4">
          One account, every step
        </div>
        <h1 className="font-display text-4xl md:text-6xl leading-tight max-w-2xl">
          Everything between &ldquo;I want to travel&rdquo; and{" "}
          <em className="italic text-green-deep">the boarding gate.</em>
        </h1>
        <p className="text-lg text-ink-soft max-w-lg mt-6 mb-8">
          Your passport, your visa documents, your flights and your itinerary, tracked in one
          dashboard, built around how Nigerians actually apply, pay, and travel.
        </p>
        <div className="flex gap-4 flex-wrap">
          <Link
            href="/login"
            className="bg-green-deep hover:bg-green-mid transition-colors text-white font-semibold px-6.5 py-3.5 rounded-md"
          >
            Get Started
          </Link>
          <a
            href="#solution"
            className="border border-green-deep text-green-deep font-semibold px-6.5 py-3.5 rounded-md"
          >
            See how it works
          </a>
        </div>
      </section>

      <section id="solution" className="bg-green-deep text-white py-20">
        <div className="max-w-[1180px] mx-auto px-7">
          <div className="font-mono text-xs tracking-widest uppercase text-gold-soft mb-4">
            The platform
          </div>
          <h2 className="font-display text-3xl mb-10">Six modules. One dashboard.</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              ["Passport Hub", "The full NIS journey: checklist, NIN-match check, status tracking."],
              ["Visa Assistant", "Exact document lists for UK, US, Canada and UAE."],
              ["AI Trip Planner", "A day-by-day plan with flights, stays, and reminders attached."],
              ["Flight Search", "Routes from Lagos, Abuja and Port Harcourt, priced in Naira."],
              ["Document Vault", "Encrypted storage: upload once, reuse everywhere."],
              ["Dashboard", "Every application and booking, with real progress."],
            ].map(([title, desc]) => (
              <div key={title} className="bg-white/5 border border-white/15 rounded-md p-6">
                <h3 className="text-white font-display text-lg mb-2">{title}</h3>
                <p className="text-white/70 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="trust" className="max-w-[1180px] mx-auto px-7 py-20">
        <div className="font-mono text-xs tracking-widest uppercase text-green-mid mb-4">
          Why trust it
        </div>
        <h2 className="font-display text-3xl mb-10">We point to official sources. We never guess.</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            ["No guaranteed outcomes", "We never promise a visa or a faster passport."],
            ["Versioned, dated content", "Every checklist carries a last-verified date."],
            ["Your documents, encrypted", "Uploads are stored securely, used only where you choose."],
          ].map(([title, desc]) => (
            <div key={title} className="border-l-2 border-gold pl-5">
              <h3 className="font-display text-lg mb-2">{title}</h3>
              <p className="text-ink-soft text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-line py-10">
        <div className="max-w-[1180px] mx-auto px-7 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs text-ink-soft font-mono">
          <span>© 2026 UrPassport NG. Not affiliated with the Nigeria Immigration Service.</span>
          <span className="flex gap-4">
            <Link href="/terms" className="hover:text-ink underline">Terms</Link>
            <Link href="/privacy" className="hover:text-ink underline">Privacy</Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
