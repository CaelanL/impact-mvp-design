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
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">Platform Admin</h1>
            <span className="text-[10px] font-bold text-stone-100 bg-stone-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Owner
            </span>
          </div>
          <p className="text-sm text-stone-500">Manage all organizations on the Impact360 platform</p>
        </div>

        {/* Affiliate list */}
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden mb-5">
          <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-stone-900">Organizations</h2>
            <button className="text-xs font-medium text-amber-600 hover:text-amber-700 cursor-pointer">
              + Add Organization
            </button>
          </div>
          <div className="divide-y divide-stone-100">
            {orgs.map((org) => {
              const orgCities = cities.filter((c) => c.orgId === org.id);
              const orgVentures = ventures.filter((v) => orgCities.some((c) => c.id === v.cityId));
              return (
                <div key={org.id} className="p-5 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-stone-900 flex items-center justify-center text-amber-400 font-bold text-xl shrink-0">
                    {org.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-stone-900">{org.name}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-stone-500 mt-0.5">
                      <span>{orgCities.length} cities</span>
                      <span>{orgVentures.length} ventures</span>
                      <span>{allUsers.filter((u) => u.roles.some((r) => r.affiliateId === org.id)).length} users</span>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 border border-stone-200 text-stone-600 rounded-lg text-xs font-medium hover:bg-stone-50 cursor-pointer">
                    Manage
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Platform stats */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 mb-5">
          <h2 className="text-sm font-semibold text-stone-900 mb-4">Platform Statistics</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-stone-50 rounded-lg">
              <div className="text-2xl font-semibold text-stone-900">{orgs.length}</div>
              <div className="text-xs text-stone-500 mt-0.5">Organizations</div>
            </div>
            <div className="text-center p-3 bg-stone-50 rounded-lg">
              <div className="text-2xl font-semibold text-stone-900">{cities.length}</div>
              <div className="text-xs text-stone-500 mt-0.5">Cities</div>
            </div>
            <div className="text-center p-3 bg-stone-50 rounded-lg">
              <div className="text-2xl font-semibold text-stone-900">{ventures.length}</div>
              <div className="text-xs text-stone-500 mt-0.5">Ventures</div>
            </div>
            <div className="text-center p-3 bg-stone-50 rounded-lg">
              <div className="text-2xl font-semibold text-stone-900">{allUsers.length}</div>
              <div className="text-xs text-stone-500 mt-0.5">Users</div>
            </div>
          </div>
        </div>

        {/* Onboarding card — platform_owner and admin only */}
        {hasAnyRole(currentUser, ["platform_owner", "admin"]) && (
          <Link
            href="/platform-admin/onboarding"
            className="block bg-white rounded-xl border border-stone-200 p-5 mb-5 hover:border-stone-300 hover:shadow-sm cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-stone-900 mb-0.5">User Management &amp; Onboarding</h2>
                <p className="text-xs text-stone-500">Invite users, manage pending invites, and review applicants</p>
              </div>
              <svg
                className="w-4 h-4 text-stone-400 group-hover:text-amber-500 shrink-0 ml-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </Link>
        )}

        {/* Affiliate model note */}
        <div className="bg-stone-50 rounded-xl border border-stone-200 p-6 text-center">
          <p className="text-sm text-stone-500 font-medium">
            Each organization has its own leadership structure and ventures, completely separate from others.
          </p>
          <p className="text-xs text-stone-400 mt-1">
            City leaders can see organizations in their city. The platform owner can see all organizations.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
