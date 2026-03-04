"use client";

import { AppLayout } from "@/components/AppLayout";
import { useUser } from "@/lib/UserContext";
import { getUserCity, getCityVentures } from "@/lib/permissions";
import { allUsers, coachAssignments } from "@/lib/data";
import { ImpactCircle } from "@/components/ImpactCircle";
import { StatusBadge } from "@/components/StatusBadge";
import { StageBadge } from "@/components/StageBadge";
import Link from "next/link";

export default function MyCityPage() {
  const { currentUser, activeContext } = useUser();
  if (!currentUser) return null;

  const city = getUserCity(currentUser);
  const cityVentures = getCityVentures(currentUser, activeContext ?? undefined);

  if (!city) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <p className="text-stone-500">You are not assigned as a city leader.</p>
        </div>
      </AppLayout>
    );
  }

  // Get coaches for this city
  const coachIds = [...new Set(
    coachAssignments
      .filter((a) => cityVentures.some((v) => v.id === a.ventureId))
      .map((a) => a.coachId)
  )];
  const coaches = coachIds.map((id) => allUsers.find((u) => u.id === id)).filter(Boolean);

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">{city.name}, {city.state}</h1>
        <p className="text-sm text-stone-500 mt-1">
          {cityVentures.length} ventures &middot; {coaches.length} coaches
        </p>
      </div>

      {/* City impact rollup */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 mb-5">
        <h2 className="text-sm font-semibold text-stone-900 mb-5">City Impact</h2>
        <div className="flex justify-center gap-6 sm:gap-10">
          <ImpactCircle label="Social" value={cityVentures.reduce((s, v) => s + v.impact.social, 0)} type="social" />
          <ImpactCircle label="Spiritual" value={cityVentures.reduce((s, v) => s + v.impact.spiritual, 0)} type="spiritual" />
          <ImpactCircle label="Economic" value={cityVentures.reduce((s, v) => s + v.impact.economic, 0)} type="economic" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Coaches */}
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <h2 className="text-sm font-semibold text-stone-900 mb-4">Coaches</h2>
          <div className="space-y-3">
            {coaches.map((coach) => {
              if (!coach) return null;
              const assignments = coachAssignments.filter((a) => a.coachId === coach.id);
              return (
                <div key={coach.id} className="flex items-center gap-3 p-3 rounded-lg bg-stone-50">
                  <div className="w-9 h-9 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 text-xs font-semibold shrink-0">
                    {coach.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800">{coach.name}</p>
                    <p className="text-xs text-stone-500">{assignments.length} venture{assignments.length !== 1 ? "s" : ""} assigned</p>
                  </div>
                </div>
              );
            })}
            {coaches.length === 0 && (
              <p className="text-sm text-stone-400">No coaches assigned in this city yet.</p>
            )}
          </div>
        </div>

        {/* Ventures */}
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <h2 className="text-sm font-semibold text-stone-900 mb-4">Ventures</h2>
          <div className="space-y-2">
            {cityVentures.map((venture) => {
              const leader = allUsers.find((u) => u.id === venture.leaderId);
              return (
                <Link key={venture.id} href={`/ventures/${venture.id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-stone-800 group-hover:text-stone-900">{venture.name}</span>
                      <StageBadge stage={venture.stage} />
                    </div>
                    <span className="text-xs text-stone-500">{leader?.name} &middot; {venture.cause}</span>
                  </div>
                  <StatusBadge lastSubmission={venture.lastSubmission} />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
