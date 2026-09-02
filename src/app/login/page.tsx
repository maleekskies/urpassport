"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);

    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });
        if (error) throw error;
        setNotice("Check your email for a link to reset your password.");
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;
        router.push("/dashboard");
        router.refresh();
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      const fallback =
        mode === "forgot"
          ? "Couldn't send the reset link."
          : mode === "signup"
          ? "Couldn't create your account."
          : "Couldn't sign you in.";
      setError(err instanceof Error ? err.message : fallback);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-between p-14 bg-gradient-to-br from-green-deep to-navy text-white">
        <div className="flex items-center gap-2.5 font-display font-bold text-lg">
          <span className="w-7 h-7 rounded-full bg-gold text-navy flex items-center justify-center font-mono text-xs font-bold">
            UP
          </span>
          UrPassport NG
        </div>
        <div>
          <h2 className="font-display text-4xl leading-tight max-w-md">
            One login for every step between here and there.
          </h2>
          <p className="text-white/65 mt-4 max-w-sm">
            Your passport status, visa documents, flights and itinerary, all under one
            account, built for how Nigerians actually travel.
          </p>
        </div>
        <div className="flex gap-6 font-mono text-[11px] tracking-wide uppercase text-white/50">
          <span>NIN-Matched</span>
          <span>Encrypted Vault</span>
          <span>Paystack Secured</span>
        </div>
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="flex gap-1.5 bg-panel border border-line rounded-lg p-1 mb-7">
            <button
              onClick={() => {
                setMode("signin");
                setError(null);
                setNotice(null);
              }}
              className={`flex-1 py-2.5 rounded-md text-sm font-semibold ${
                mode === "signin" ? "bg-green-deep text-white" : "text-ink-soft"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode("signup");
                setError(null);
                setNotice(null);
              }}
              className={`flex-1 py-2.5 rounded-md text-sm font-semibold ${
                mode === "signup" ? "bg-green-deep text-white" : "text-ink-soft"
              }`}
            >
              Create Account
            </button>
          </div>

          <h1 className="font-display text-2xl mb-1.5">
            {mode === "signin"
              ? "Welcome back"
              : mode === "signup"
              ? "Create your account"
              : "Reset your password"}
          </h1>
          <p className="text-ink-soft text-sm mb-6">
            {mode === "signin"
              ? "Sign in to continue where you left off."
              : mode === "signup"
              ? "Takes under a minute. No NIN needed yet."
              : "Enter your email and we'll send you a reset link."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1.5">
                  Full name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="As it appears on your NIN"
                  className="w-full px-3.5 py-3 border border-line rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-mid"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-ink-soft mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full px-3.5 py-3 border border-line rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-mid"
              />
            </div>
            {mode !== "forgot" && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-ink-soft">Password</label>
                  {mode === "signin" && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode("forgot");
                        setError(null);
                        setNotice(null);
                      }}
                      className="text-xs font-semibold text-green-deep hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === "signup" ? "Minimum 8 characters" : "••••••••"}
                    className="w-full px-3.5 py-3 pr-11 border border-line rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-mid"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink-soft text-xs font-semibold"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            )}

            {notice && (
              <p className="text-sm text-green-deep bg-green-pale rounded-md px-3.5 py-2.5">
                {notice}
              </p>
            )}
            {error && (
              <p className="text-sm text-red bg-red-soft rounded-md px-3.5 py-2.5">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-deep hover:bg-green-mid transition-colors text-white font-bold py-3.5 rounded-md text-sm disabled:opacity-60"
            >
              {loading
                ? "Please wait..."
                : mode === "signin"
                ? "Sign In"
                : mode === "signup"
                ? "Create Account"
                : "Send reset link"}
            </button>

            {mode === "forgot" && (
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setError(null);
                  setNotice(null);
                }}
                className="w-full text-center text-xs font-semibold text-ink-soft hover:text-ink"
              >
                Back to Sign In
              </button>
            )}
          </form>

          {mode !== "forgot" && (
            <>
              <div className="flex items-center gap-3 my-6 text-ink-faint text-xs">
                <div className="flex-1 h-px bg-line" />
                or
                <div className="flex-1 h-px bg-line" />
              </div>

              <button
                onClick={handleGoogle}
                className="w-full border border-line hover:border-green-mid transition-colors py-3 rounded-md text-sm font-semibold"
              >
                Continue with Google
              </button>
            </>
          )}

          <p className="text-xs text-ink-faint text-center mt-5">
            By continuing, you agree to our Terms and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
