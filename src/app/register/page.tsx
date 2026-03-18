"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RoleBadge } from "@/components/RoleBadge";
import { getRoleLabel } from "@/lib/permissions";
import { allUsers, pendingInvites, orgs } from "@/lib/data";
import type { AffiliateRole, PlatformRole } from "@/lib/types";

// ─── inner component (needs useSearchParams inside Suspense) ─

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const invite = pendingInvites.find((i) => i.token === token) ?? null;
  const inviter = invite ? allUsers.find((u) => u.id === invite.invitedByUserId) : null;
  const org = invite?.affiliateId ? orgs.find((o) => o.id === invite.affiliateId) : null;

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, router]);

  // ── error states ────────────────────────────────────────

  if (!token || !invite) {
    return (
      <ErrorState
        title="Invalid invite link"
        message="This invite link is invalid or has expired. Contact your admin for a new invite."
      />
    );
  }

  if (invite.status === "expired") {
    return (
      <ErrorState
        title="This invite has expired"
        message="This invite link is invalid or has expired. Contact your admin for a new invite."
      />
    );
  }

  if (invite.status === "accepted") {
    return (
      <ErrorState
        title="Already used"
        message="This invite has already been used. Try logging in, or contact your admin if you need help."
      />
    );
  }

  // ── success state ───────────────────────────────────────

  if (success) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="font-[family-name:var(--font-instrument-serif)] text-3xl sm:text-4xl text-stone-50 mb-3">
            You&rsquo;re all set, {invite.firstName}!
          </h2>
          <p className="text-stone-400 text-sm max-w-xs mx-auto leading-relaxed">
            Your account has been created. Redirecting you to the app&hellip;
          </p>
        </div>
      </div>
    );
  }

  // ── invite role type guard ──────────────────────────────

  const inviteRole = invite.role as AffiliateRole | PlatformRole;

  // ── main form ───────────────────────────────────────────

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    if (!password) {
      setPasswordError("Password is required.");
      return;
    }
    if (password !== confirm) {
      setPasswordError("Passwords don't match.");
      return;
    }
    setSuccess(true);
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
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center shrink-0">
            <span className="text-stone-900 font-bold text-sm">I3</span>
          </div>
          <span className="text-base font-semibold text-stone-100 tracking-tight">Impact360</span>
        </div>

        {/* Heading */}
        <h1 className="font-[family-name:var(--font-instrument-serif)] text-4xl sm:text-5xl text-stone-50 mb-3 leading-tight tracking-tight">
          You&rsquo;ve been invited to Impact360
        </h1>

        {/* Invited by */}
        {inviter && (
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm text-stone-500">Invited by</span>
            <span className="text-sm font-medium text-stone-300">{inviter.name}</span>
            <RoleBadge role={inviter.roles[0].role} />
          </div>
        )}

        {/* Read-only info card */}
        <div className="bg-stone-900/60 border border-stone-800 rounded-xl p-4 mb-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500">Name</span>
            <span className="text-sm font-medium text-stone-200">
              {invite.firstName} {invite.lastName}
            </span>
          </div>
          <div className="border-t border-stone-800" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500">Assigned Role</span>
            <RoleBadge role={inviteRole} />
          </div>
          {org && (
            <>
              <div className="border-t border-stone-800" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500">Organization</span>
                <span className="text-sm font-medium text-stone-200">{org.name}</span>
              </div>
            </>
          )}
        </div>

        {/* Personal note */}
        {invite.personalNote && inviter && (
          <blockquote className="border-l-2 border-amber-500/50 pl-4 mb-6">
            <p className="text-sm text-stone-400 leading-relaxed italic">
              &ldquo;{invite.personalNote}&rdquo;
            </p>
            <footer className="text-xs text-stone-600 mt-1">— {inviter.name}</footer>
          </blockquote>
        )}

        {/* Password form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-stone-900/40 border border-stone-800 rounded-xl p-5 space-y-4">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Set your password</p>

            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setPasswordError(""); }}
                required
                className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2.5 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-500"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1.5">Confirm Password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => { setConfirm(e.target.value); setPasswordError(""); }}
                required
                className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2.5 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-500"
                placeholder="••••••••"
              />
            </div>

            {passwordError && (
              <p className="text-xs text-rose-400 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
                {passwordError}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-amber-500 text-stone-900 rounded-lg text-sm font-semibold hover:bg-amber-400 cursor-pointer"
          >
            Create My Account
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Error state component ───────────────────────────────────

function ErrorState({ title, message }: { title: string; message: string }) {
  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-12 h-12 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center mx-auto mb-5">
          <svg className="w-5 h-5 text-stone-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
        </div>
        <div className="flex items-center gap-2.5 justify-center mb-4">
          <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
            <span className="text-stone-900 font-bold text-xs">I3</span>
          </div>
          <span className="text-sm font-semibold text-stone-400 tracking-tight">Impact360</span>
        </div>
        <h2 className="text-xl font-semibold text-stone-200 mb-2">{title}</h2>
        <p className="text-sm text-stone-500 leading-relaxed">{message}</p>
      </div>
    </div>
  );
}

// ─── Page export (Suspense boundary for useSearchParams) ─────

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-950 flex items-center justify-center">
          <div className="w-5 h-5 rounded-full border-2 border-amber-500/40 border-t-amber-500 animate-spin" />
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
