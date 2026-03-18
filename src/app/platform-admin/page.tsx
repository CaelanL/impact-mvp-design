"use client";

import Link from "next/link";
import { AppLayout } from "@/components/AppLayout";
import { useUser } from "@/lib/UserContext";
import { hasAnyRole } from "@/lib/permissions";
import { orgs, cities, ventures, allUsers } from "@/lib/data";

export default function PlatformAdminPage() {
  const { currentUser } = useUser();
  if (!currentUser) return null;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        {/* Page header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">Platform Admin</h1>
            <span className="text-[10px] font-bold text-stone-500 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Owner
            </span>
          </div>
          <p className="text-sm text-stone-500">Manage all organizations on the Impact360 platform</p>
        </div>

        {/* Platform stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { label: "Organizations", value: orgs.length },
            { label: "Cities", value: cities.length },
            { label: "Ventures", value: ventures.length },
            { label: "Users", value: allUsers.length },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-xl border border-stone-200 px-4 py-4 text-center">
              <div className="text-2xl font-semibold text-stone-900">{value}</div>
              <div className="text-xs text-stone-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Quick-access cards */}
        {hasAnyRole(currentUser, ["platform_owner", "admin"]) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            <Link
              href="/platform-admin/onboarding"
              className="block bg-white rounded-xl border border-stone-200 p-5 hover:border-stone-300 hover:shadow-sm cursor-pointer group transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                  </svg>
                </div>
                <svg className="w-4 h-4 text-stone-400 group-hover:text-amber-500 shrink-0 mt-0.5 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </div>
              <div className="mt-3">
                <h2 className="text-sm font-semibold text-stone-900 mb-0.5">Users &amp; Invites</h2>
                <p className="text-xs text-stone-500">Invite users, review applicants, and manage access</p>
              </div>
            </Link>

            <Link
              href="/platform-admin/structure"
              className="block bg-white rounded-xl border border-stone-200 p-5 hover:border-stone-300 hover:shadow-sm cursor-pointer group transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="w-9 h-9 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-stone-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
                  </svg>
                </div>
                <svg className="w-4 h-4 text-stone-400 group-hover:text-amber-500 shrink-0 mt-0.5 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </div>
              <div className="mt-3">
                <h2 className="text-sm font-semibold text-stone-900 mb-0.5">Cities, Cohorts &amp; Affiliates</h2>
                <p className="text-xs text-stone-500">Add cities, create cohorts, and register affiliate organizations</p>
              </div>
            </Link>
          </div>
        )}

        {/* Affiliate list */}
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden mb-5">
          <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-stone-900">Organizations</h2>
          </div>
          <div className="divide-y divide-stone-100">
            {orgs.map((org) => {
              const orgCities = cities.filter((c) => c.orgId === org.id);
              const orgVentures = ventures.filter((v) => orgCities.some((c) => c.id === v.cityId));
              const orgUsers = allUsers.filter((u) =>
                u.roles.some((r) => r.affiliateId === org.id)
              ).length;
              return (
                <div key={org.id} className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-amber-600 font-bold text-lg shrink-0">
                    {org.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-stone-900">{org.name}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-stone-500 mt-0.5">
                      {org.id === "org-linc" && (
                        <span>{orgCities.length} {orgCities.length === 1 ? "city" : "cities"}</span>
                      )}
                      <span>{orgVentures.length} ventures</span>
                      <span>{orgUsers} users</span>
                    </div>
                  </div>
                  <Link
                    href={`/platform-admin/orgs/${org.id}`}
                    className="px-3 py-1.5 border border-stone-200 text-stone-600 rounded-lg text-xs font-medium hover:bg-stone-50 hover:text-stone-900 cursor-pointer transition-colors"
                  >
                    Manage
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
