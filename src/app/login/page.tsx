"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { users } from "@/lib/data";
import { useUser } from "@/lib/UserContext";

export default function LoginPage() {
  const router = useRouter();
  const { selectUser } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Simulated auth — match by email against mock users
    const match = users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!match || !password) {
      setError("Invalid email or password. Please try again.");
      return;
    }

    selectUser(match.id);
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-stone-950 flex items-start justify-center px-4 py-12 sm:py-20">
      {/* Grain overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center shrink-0">
            <span className="text-stone-900 font-bold text-sm">I3</span>
          </div>
          <span className="text-base font-semibold text-stone-100 tracking-tight">Impact360</span>
        </div>

        {/* Heading */}
        <h1 className="font-[family-name:var(--font-instrument-serif)] text-4xl sm:text-5xl text-stone-50 mb-2 leading-tight tracking-tight">
          Welcome back
        </h1>
        <p className="text-stone-500 text-sm mb-8">
          Sign in to your Impact360 account.
        </p>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-stone-900/40 border border-stone-800 rounded-xl p-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                required
                autoComplete="email"
                className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2.5 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-stone-400">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs text-stone-500 hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                required
                autoComplete="current-password"
                className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2.5 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-500"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-xs text-rose-400 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-amber-500 text-stone-900 rounded-lg text-sm font-semibold hover:bg-amber-400 transition-colors cursor-pointer"
          >
            Sign In
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-stone-800" />
          <span className="text-xs text-stone-600">or</span>
          <div className="flex-1 h-px bg-stone-800" />
        </div>

        {/* New applicant CTA */}
        <div className="bg-stone-900/40 border border-stone-800 rounded-xl p-5">
          <p className="text-sm font-medium text-stone-300 mb-1">New to Impact360?</p>
          <p className="text-xs text-stone-500 leading-relaxed mb-4">
            Not a member yet? Submit an application and our team will be in touch.
          </p>
          <Link
            href="/apply"
            className="block w-full text-center py-2.5 border border-stone-700 text-stone-300 rounded-lg text-sm font-medium hover:border-amber-500/50 hover:text-amber-400 transition-colors"
          >
            Apply to Join Impact360 →
          </Link>
        </div>

      </div>
    </div>
  );
}
