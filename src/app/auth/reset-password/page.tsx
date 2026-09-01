"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Reached from the link in the "reset your password" email. Supabase's
// client SDK reads the recovery token straight out of the URL and
// establishes a session automatically — this page just needs to show a
// "set new password" form and call updateUser once the person submits it.
export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Couldn't reset your password. The link may have expired — request a new one."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 font-display font-bold text-lg mb-8 justify-center">
          <span className="w-7 h-7 rounded-full bg-gold text-navy flex items-center justify-center font-mono text-xs font-bold">
            UP
          </span>
          UrPassport NG
        </div>

        <h1 className="font-display text-2xl mb-1.5 text-center">Set a new password</h1>
        <p className="text-ink-soft text-sm mb-6 text-center">
          Choose a new password for your account.
        </p>

        {success ? (
          <p className="text-sm text-green-deep bg-green-pale rounded-md px-3.5 py-3 text-center">
            Password updated. Redirecting you to your dashboard...
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink-soft mb-1.5">
                New password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
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

            <div>
              <label className="block text-xs font-semibold text-ink-soft mb-1.5">
                Confirm new password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
                className="w-full px-3.5 py-3 border border-line rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-mid"
              />
            </div>

            {error && (
              <p className="text-sm text-red bg-red-soft rounded-md px-3.5 py-2.5">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-deep hover:bg-green-mid transition-colors text-white font-bold py-3.5 rounded-md text-sm disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save new password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
