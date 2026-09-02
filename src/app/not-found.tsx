import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-7">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center gap-2.5 font-display font-bold mb-8">
          <span className="w-7 h-7 rounded-full bg-green-deep text-gold-soft flex items-center justify-center font-mono text-xs font-bold">
            UP
          </span>
          UrPassport <span className="text-gold font-normal">NG</span>
        </div>
        <div className="font-mono text-xs tracking-widest uppercase text-green-mid mb-4">
          404
        </div>
        <h1 className="font-display text-3xl mb-3">This page doesn&rsquo;t exist.</h1>
        <p className="text-ink-soft mb-8">
          The link might be old, or the address was typed wrong. Head back and start from there.
        </p>
        <Link
          href="/"
          className="inline-block bg-green-deep hover:bg-green-mid transition-colors text-white font-semibold px-6.5 py-3.5 rounded-md"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
