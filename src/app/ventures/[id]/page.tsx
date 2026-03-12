"use client";

import { use } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useUser } from "@/lib/UserContext";
import { ventures, allUsers, notes as allNotes, cities } from "@/lib/data";
import { ImpactCircle } from "@/components/ImpactCircle";
import { StageBadge } from "@/components/StageBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { hasAnyRole } from "@/lib/permissions";
import Link from "next/link";

export default function VentureDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { currentUser } = useUser();

  if (!currentUser) return null;

  const venture = ventures.find((v) => v.id === id);
  if (!venture) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <p className="text-stone-500">We couldn&apos;t find this venture. It may have been removed or you may not have access.</p>
          <Link href="/ventures" className="text-amber-600 text-sm mt-2 inline-block hover:text-amber-700">
            &larr; Back to ventures
          </Link>
        </div>
      </AppLayout>
    );
  }

  const leader = allUsers.find((u) => u.id === venture.leaderId);
  const city = cities.find((c) => c.id === venture.cityId);
  const canSeeNotes = hasAnyRole(currentUser, ["coach", "city_leader", "director", "platform_owner", "admin"]);
  const isOwnVenture = currentUser.roles.some(
    (r) => r.role === "venture_leader" && r.scopeId === venture.id
  );
  const ventureNotes = allNotes.filter((n) => n.ventureId === venture.id);

  return (
    <AppLayout>
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link href="/ventures" className="text-xs text-stone-400 hover:text-stone-600">
          &larr; Ventures
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Header card */}
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-5">
              {/* Avatar placeholder */}
              <div className="w-20 h-20 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center shrink-0">
                <svg className="w-8 h-8 text-stone-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h1 className="text-xl font-semibold text-stone-900">{venture.name}</h1>
                  <StageBadge stage={venture.stage} />
                  <StatusBadge lastSubmission={venture.lastSubmission} />
                </div>
                <p className="text-sm text-stone-600 mb-1">{venture.cause}</p>
                <p className="text-xs text-stone-400">{venture.address}</p>

                {leader && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center text-[10px] font-semibold text-stone-600">
                      {leader.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <span className="text-sm text-stone-600">{leader.name}</span>
                    <span className="text-xs text-stone-400">&middot; {leader.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Story */}
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <h2 className="text-sm font-semibold text-stone-900 mb-3">Mission &amp; Story</h2>
            <p className="text-sm text-stone-600 leading-relaxed">{venture.story}</p>
            {/* Placeholder photos */}
            <div className="mt-4 grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square rounded-lg bg-stone-50 border border-stone-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-stone-200" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                  </svg>
                </div>
              ))}
            </div>
          </div>

          {/* Impact */}
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <h2 className="text-sm font-semibold text-stone-900 mb-5">Impact Summary</h2>
            <div className="flex justify-center gap-6 sm:gap-10">
              <ImpactCircle label="Social" value={venture.impact.social} type="social" size="lg" />
              <ImpactCircle label="Spiritual" value={venture.impact.spiritual} type="spiritual" size="lg" />
              <ImpactCircle label="Economic" value={venture.impact.economic} type="economic" size="lg" />
            </div>
          </div>

          {/* Notes — only visible to coaches and above */}
          {canSeeNotes && (
            <div className="bg-white rounded-xl border border-stone-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-stone-900">Coach Notes</h2>
                <span className="text-[10px] font-medium text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Private
                </span>
              </div>
              {ventureNotes.length > 0 ? (
                <div className="space-y-3">
                  {ventureNotes.map((note) => {
                    const author = allUsers.find((u) => u.id === note.authorId);
                    return (
                      <div key={note.id} className="p-3 rounded-lg bg-stone-50 border border-stone-100">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-5 h-5 rounded-full bg-stone-200 flex items-center justify-center text-[9px] font-semibold text-stone-600">
                            {author?.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <span className="text-xs font-medium text-stone-700">{author?.name}</span>
                          <span className="text-[10px] text-stone-400">
                            {new Date(note.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        </div>
                        <p className="text-sm text-stone-600 leading-relaxed">{note.content}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-stone-400">No coaching notes have been added yet.</p>
              )}
              <button className="mt-3 text-xs font-medium text-amber-600 hover:text-amber-700 cursor-pointer">
                + Add Note
              </button>
            </div>
          )}
        </div>

        {/* Sidebar column */}
        <div className="space-y-5">
          {/* Actions */}
          <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-2.5">
            {isOwnVenture && (
              <Link href="/add-impact" className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-amber-500 text-stone-900 rounded-lg text-sm font-semibold hover:bg-amber-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                Add Impact
              </Link>
            )}
            {canSeeNotes && !isOwnVenture && (
              <button className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-amber-500/10 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-500/20 cursor-pointer">
                Add Impact for This Venture
              </button>
            )}
            <button className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-stone-200 text-stone-600 rounded-lg text-sm font-medium hover:bg-stone-50 cursor-pointer">
              Generate Report
            </button>
            <Link href="/training" className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-stone-200 text-stone-600 rounded-lg text-sm font-medium hover:bg-stone-50">
              Training &amp; Documents
            </Link>
          </div>

          {/* Quick info */}
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Details</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-stone-400 text-xs">City</dt>
                <dd className="text-stone-700 font-medium">{city?.name}, {city?.state}</dd>
              </div>
              <div>
                <dt className="text-stone-400 text-xs">Stage</dt>
                <dd><StageBadge stage={venture.stage} /></dd>
              </div>
              <div>
                <dt className="text-stone-400 text-xs">Privacy</dt>
                <dd className="text-stone-700 font-medium capitalize">{venture.privacy}</dd>
              </div>
              <div>
                <dt className="text-stone-400 text-xs">Last Report</dt>
                <dd className="text-stone-700 font-medium">
                  {venture.lastSubmission
                    ? new Date(venture.lastSubmission).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                    : "Not yet submitted"
                  }
                </dd>
              </div>
            </dl>
          </div>

          {/* Milestones placeholder */}
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Milestones</h3>
            <div className="flex items-center justify-center py-6">
              <div className="text-center">
                <p className="text-xs text-stone-400">Coming soon</p>
                <p className="text-[10px] text-stone-300 mt-0.5">Grant eligibility, achievements, and more</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
