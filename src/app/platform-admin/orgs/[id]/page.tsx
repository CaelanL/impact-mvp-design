"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AppLayout } from "@/components/AppLayout";
import { RoleBadge } from "@/components/RoleBadge";
import { useUser } from "@/lib/UserContext";
import { hasAnyRole, getHighestRole, getRoleLabel } from "@/lib/permissions";
import { orgs, cities, cohorts, ventures, allUsers } from "@/lib/data";

export default function OrgDetailPage() {
  const { currentUser } = useUser();
  const params = useParams();
  const orgId = params.id as string;

  const org = orgs.find((o) => o.id === orgId);
  const orgCities = cities.filter((c) => c.orgId === orgId);
  const orgCohorts = cohorts.filter((c) => orgCities.some((city) => city.id === c.cityId));
  const orgVentures = ventures.filter((v) => orgCities.some((c) => c.id === v.cityId));
  const orgUsers = allUsers.filter((u) => u.roles.some((r) => r.affiliateId === orgId));

  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(org?.name ?? "");
  const [saved, setSaved] = useState(false);

  if (!currentUser) return null;
  if (!hasAnyRole(currentUser, ["platform_owner", "admin"])) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl border border-stone-200 p-10 text-center">
            <p className="text-sm text-stone-500">You don&rsquo;t have permission to view this page.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!org) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl border border-stone-200 p-10 text-center">
            <p className="text-sm text-stone-500">Organization not found.</p>
            <Link href="/platform-admin" className="text-xs text-amber-600 hover:text-amber-700 mt-3 inline-block">
              ← Back to Platform Admin
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  function handleSave() {
    setSaved(true);
    setEditingName(false);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <Link
          href="/platform-admin"
          className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-700 mb-5 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Platform Admin
        </Link>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-amber-600 font-bold text-2xl shrink-0">
            {name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">{name}</h1>
            <p className="text-sm text-stone-500 mt-0.5">
              {orgCities.length} {orgCities.length === 1 ? "city" : "cities"} · {orgVentures.length} ventures · {orgUsers.length} users
            </p>
          </div>
          {saved && (
            <span className="ml-auto text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg font-medium">
              Saved
            </span>
          )}
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden mb-4">
          <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-stone-900">Organization Info</h2>
            {editingName && (
              <button
                onClick={handleSave}
                className="px-3 py-1.5 bg-amber-500 text-stone-900 rounded-lg text-xs font-semibold hover:bg-amber-400 transition-colors cursor-pointer"
              >
                Save Changes
              </button>
            )}
          </div>
          <div className="p-5 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1.5">Name</label>
              {editingName ? (
                <div className="flex gap-2">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 border border-stone-300 bg-white text-stone-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-500"
                    autoFocus
                  />
                  <button
                    onClick={() => setEditingName(false)}
                    className="px-3 py-2 border border-stone-200 text-stone-500 rounded-lg text-xs hover:bg-stone-50 cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between group">
                  <span className="text-sm text-stone-900">{name}</span>
                  <button
                    onClick={() => setEditingName(true)}
                    className="text-xs text-stone-400 hover:text-amber-600 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Users */}
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden mb-4">
          <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-stone-900">Users</h2>
            <span className="text-xs text-stone-500">{orgUsers.length} total</span>
          </div>
          {orgUsers.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-stone-400">No users yet</div>
          ) : (
            <div className="divide-y divide-stone-100">
              {orgUsers.map((user) => {
                const highest = getHighestRole(user);
                return (
                  <div key={user.id} className="px-5 py-3.5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-500 text-xs font-semibold shrink-0">
                      {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-900">{user.name}</p>
                      <p className="text-xs text-stone-500">{user.email}</p>
                    </div>
                    <RoleBadge role={highest} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Cohorts */}
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden mb-4">
          <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-stone-900">Cohorts</h2>
            <Link
              href="/platform-admin/structure"
              className="text-xs font-medium text-amber-600 hover:text-amber-700 transition-colors"
            >
              + Add Cohort
            </Link>
          </div>
          {orgCohorts.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-stone-400">No cohorts yet</div>
          ) : (
            <div className="divide-y divide-stone-100">
              {orgCohorts.map((cohort) => {
                const cohortCity = cities.find((c) => c.id === cohort.cityId);
                return (
                  <div key={cohort.id} className="px-5 py-3.5 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-900">{cohort.name}</p>
                      <p className="text-xs text-stone-500">{cohort.season} · {cohortCity?.name}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wide ${
                      cohort.isActive
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-stone-100 text-stone-500 border-stone-200"
                    }`}>
                      {cohort.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Ventures */}
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-stone-900">Ventures</h2>
            <span className="text-xs text-stone-500">{orgVentures.length} total</span>
          </div>
          {orgVentures.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-stone-400">No ventures yet</div>
          ) : (
            <div className="divide-y divide-stone-100">
              {orgVentures.map((venture) => {
                const leader = allUsers.find((u) => u.id === venture.leaderId);
                const ventureCity = cities.find((c) => c.id === venture.cityId);
                return (
                  <div key={venture.id} className="px-5 py-3.5 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-900">{venture.name}</p>
                      <p className="text-xs text-stone-500">
                        {ventureCity?.name} · {leader?.name ?? "No leader"}
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-stone-100 text-stone-600 border-stone-200 uppercase tracking-wide">
                      {venture.stage}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
