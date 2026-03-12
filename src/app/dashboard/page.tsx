"use client";

import { AppLayout } from "@/components/AppLayout";
import { useUser } from "@/lib/UserContext";
import { ImpactCircle } from "@/components/ImpactCircle";
import { StatusBadge } from "@/components/StatusBadge";
import { StageBadge } from "@/components/StageBadge";
import {
  hasRole, hasAnyRole,
  getUserVenture, getCoachedVentures, getCityVentures, getUserCity,
} from "@/lib/permissions";
import { cities, ventures, allUsers, coachAssignments, orgs } from "@/lib/data";
import Link from "next/link";

function SectionCard({ title, children, accent }: { title: string; children: React.ReactNode; accent?: string }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-stone-100 flex items-center gap-3">
        {accent && <div className={`w-1 h-5 rounded-full ${accent}`} />}
        <h2 className="text-sm font-semibold text-stone-900 tracking-tight">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { currentUser, activeContext } = useUser();
  if (!currentUser) return null;

  const isVL = hasRole(currentUser, "venture_leader");
  const isCoach = hasRole(currentUser, "coach");
  const isCityLeader = hasRole(currentUser, "city_leader");
  const isDirector = hasRole(currentUser, "director");
  const isCEO = isDirector || hasAnyRole(currentUser, ["platform_owner", "admin"]);
  const isPlatformOwner = hasRole(currentUser, "platform_owner");

  const myVenture = getUserVenture(currentUser);
  const coached = getCoachedVentures(currentUser);
  const cityVentures = getCityVentures(currentUser, activeContext ?? undefined);
  const myCity = getUserCity(currentUser);

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-stone-500 mt-1">
          Welcome back, {currentUser.name.split(" ")[0]}.
        </p>
      </div>

      <div className="space-y-5">
        {/* My Venture section — only for VLs */}
        {isVL && myVenture && (
          <SectionCard title="My Venture" accent="bg-teal-500">
            <div className="flex flex-col sm:flex-row sm:items-start gap-5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <Link href={`/ventures/${myVenture.id}`} className="text-lg font-semibold text-stone-900 hover:text-amber-600">
                    {myVenture.name}
                  </Link>
                  <StageBadge stage={myVenture.stage} />
                </div>
                <p className="text-sm text-stone-500 mb-1">{myVenture.cause}</p>
                <p className="text-xs text-stone-400">
                  {myVenture.lastSubmission
                    ? `Last report: ${new Date(myVenture.lastSubmission).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                    : "No reports submitted yet"
                  }
                </p>
              </div>
              <div className="flex gap-4 sm:gap-6">
                <ImpactCircle label="Social" value={myVenture.impact.social} type="social" size="sm" />
                <ImpactCircle label="Spiritual" value={myVenture.impact.spiritual} type="spiritual" size="sm" />
                <ImpactCircle label="Economic" value={myVenture.impact.economic} type="economic" size="sm" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-stone-100 flex gap-3">
              <Link href="/add-impact" className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 text-stone-900 rounded-lg text-xs font-semibold hover:bg-amber-400">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                Add Impact
              </Link>
              <Link href={`/ventures/${myVenture.id}`} className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-stone-200 text-stone-600 rounded-lg text-xs font-medium hover:bg-stone-50">
                View Profile
              </Link>
            </div>
          </SectionCard>
        )}

        {/* My Leaders section — only for Coaches */}
        {isCoach && coached.length > 0 && (
          <SectionCard title={`Leaders I Coach (${coached.length})`} accent="bg-amber-500">
            <div className="space-y-3">
              {coached.map((venture) => {
                const leader = allUsers.find((u) => u.id === venture.leaderId);
                return (
                  <Link
                    key={venture.id}
                    href={`/ventures/${venture.id}`}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-stone-50 group"
                  >
                    <div className="w-9 h-9 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-500 text-xs font-semibold shrink-0">
                      {leader?.name.split(" ").map((n) => n[0]).join("") ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-stone-800 group-hover:text-stone-900">{leader?.name}</span>
                        <StatusBadge lastSubmission={venture.lastSubmission} />
                      </div>
                      <span className="text-xs text-stone-500">{venture.name} &middot; {venture.cause}</span>
                    </div>
                    <StageBadge stage={venture.stage} />
                  </Link>
                );
              })}
            </div>
          </SectionCard>
        )}

        {/* My City section — only for City Leaders */}
        {isCityLeader && myCity && (
          <SectionCard title={`${myCity.name}, ${myCity.state}`} accent="bg-violet-500">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-stone-50 rounded-lg">
                    <div className="text-2xl font-semibold text-stone-900">{cityVentures.length}</div>
                    <div className="text-xs text-stone-500 mt-0.5">Ventures</div>
                  </div>
                  <div className="text-center p-3 bg-stone-50 rounded-lg">
                    <div className="text-2xl font-semibold text-stone-900">
                      {new Set(coachAssignments.filter(a => cityVentures.some(v => v.id === a.ventureId)).map(a => a.coachId)).size}
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5">Coaches</div>
                  </div>
                  <div className="text-center p-3 bg-stone-50 rounded-lg">
                    <div className="text-2xl font-semibold text-stone-900">
                      {cityVentures.filter(v => v.lastSubmission).length}
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5">Submitting</div>
                  </div>
                </div>
                <div className="space-y-2">
                  {cityVentures.slice(0, 4).map((v) => (
                    <Link key={v.id} href={`/ventures/${v.id}`} className="flex items-center justify-between p-2 rounded-lg hover:bg-stone-50 text-sm">
                      <span className="text-stone-700 font-medium">{v.name}</span>
                      <StatusBadge lastSubmission={v.lastSubmission} />
                    </Link>
                  ))}
                </div>
              </div>
              <div className="flex gap-4 sm:flex-col sm:gap-3 justify-center">
                <ImpactCircle
                  label="Social"
                  value={cityVentures.reduce((s, v) => s + v.impact.social, 0)}
                  type="social" size="sm"
                />
                <ImpactCircle
                  label="Spiritual"
                  value={cityVentures.reduce((s, v) => s + v.impact.spiritual, 0)}
                  type="spiritual" size="sm"
                />
                <ImpactCircle
                  label="Economic"
                  value={cityVentures.reduce((s, v) => s + v.impact.economic, 0)}
                  type="economic" size="sm"
                />
              </div>
            </div>
          </SectionCard>
        )}

        {/* All Cities section — only for Director / CEO-level */}
        {isCEO && (
          <SectionCard title="All Cities" accent="bg-rose-400">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {cities.map((city) => {
                let cityV = ventures.filter((v) => v.cityId === city.id);
                if (activeContext?.type === "affiliate") {
                  cityV = cityV.filter((v) => v.affiliateId === activeContext.affiliateId);
                }
                const leader = allUsers.find((u) => u.id === city.leaderId);
                return (
                  <Link
                    key={city.id}
                    href="/all-cities"
                    className="p-4 rounded-lg border border-stone-100 hover:border-stone-200 hover:bg-stone-50 group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-stone-800">{city.name}, {city.state}</h3>
                      <span className="text-xs text-stone-400">{cityV.length} ventures</span>
                    </div>
                    <p className="text-xs text-stone-500">
                      {leader ? `Led by ${leader.name}` : "No city leader assigned"}
                    </p>
                    {cityV.length > 0 && (
                      <div className="mt-2 flex gap-3 text-xs text-stone-400">
                        <span className="text-teal-600">{cityV.reduce((s, v) => s + v.impact.social, 0)} social</span>
                        <span className="text-violet-600">{cityV.reduce((s, v) => s + v.impact.spiritual, 0)} spiritual</span>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </SectionCard>
        )}

        {/* Platform section — only for Platform Owner */}
        {isPlatformOwner && (
          <SectionCard title="Platform Overview" accent="bg-stone-800">
            <div className="space-y-3">
              {orgs.map((org) => {
                const orgVentures = ventures.filter((v) => v.affiliateId === org.id);
                const orgUsers = allUsers.filter((u) => u.roles.some((r) => r.affiliateId === org.id));
                return (
                  <div key={org.id} className="flex items-center gap-4 p-4 bg-stone-50 rounded-lg">
                    <div className="w-12 h-12 rounded-xl bg-stone-900 flex items-center justify-center text-amber-400 font-bold text-lg shrink-0">
                      {org.name[0]}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-stone-800">{org.name}</h3>
                      <p className="text-xs text-stone-500">{orgVentures.length} ventures &middot; {orgUsers.length} users</p>
                    </div>
                    <Link href="/platform-admin" className="text-xs font-medium text-amber-600 hover:text-amber-700">
                      Manage &rarr;
                    </Link>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-stone-400">
              {orgs.length} organizations on the platform.
            </p>
          </SectionCard>
        )}

        {/* Map placeholder */}
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-100">
            <h2 className="text-sm font-semibold text-stone-900 tracking-tight">Network Map</h2>
          </div>
          <div className="h-48 sm:h-64 bg-stone-50 flex items-center justify-center">
            <div className="text-center">
              <svg className="w-10 h-10 text-stone-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              <p className="text-sm text-stone-400 font-medium">Map View</p>
              <p className="text-xs text-stone-300 mt-0.5">Coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
