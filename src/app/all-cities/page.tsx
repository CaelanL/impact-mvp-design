"use client";

import { AppLayout } from "@/components/AppLayout";
import { useUser } from "@/lib/UserContext";
import { cities, ventures, allUsers, coachAssignments, orgs } from "@/lib/data";
import { ImpactCircle } from "@/components/ImpactCircle";
import { StatusBadge } from "@/components/StatusBadge";
import { StageBadge } from "@/components/StageBadge";
import Link from "next/link";
import { useState } from "react";

export default function AllCitiesPage() {
  const { currentUser, activeContext } = useUser();
  const [expandedCity, setExpandedCity] = useState<string | null>(null);

  if (!currentUser) return null;

  // Filter ventures by active context
  const scopedVentures = activeContext?.type === "affiliate"
    ? ventures.filter((v) => v.affiliateId === activeContext.affiliateId)
    : ventures;

  const activeOrgName = activeContext?.type === "affiliate"
    ? orgs.find((o) => o.id === activeContext.affiliateId)?.name ?? ""
    : "";
  const contextLabel = activeContext?.type === "platform"
    ? "across all organizations"
    : activeContext?.type === "affiliate"
      ? `in ${activeOrgName}`
      : "across the LINC network";

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">All Cities</h1>
        <p className="text-sm text-stone-500 mt-1">
          {cities.length} cities {contextLabel}
        </p>
      </div>

      {/* Summary stats */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 mb-5">
        <h2 className="text-sm font-semibold text-stone-900 mb-5">Network-Wide Impact</h2>
        <div className="flex justify-center gap-6 sm:gap-10">
          <ImpactCircle label="Social" value={scopedVentures.reduce((s, v) => s + v.impact.social, 0)} type="social" />
          <ImpactCircle label="Spiritual" value={scopedVentures.reduce((s, v) => s + v.impact.spiritual, 0)} type="spiritual" />
          <ImpactCircle label="Economic" value={scopedVentures.reduce((s, v) => s + v.impact.economic, 0)} type="economic" />
        </div>
      </div>

      {/* City cards */}
      <div className="space-y-3">
        {cities.map((city) => {
          const cityVentures = scopedVentures.filter((v) => v.cityId === city.id);
          const leader = allUsers.find((u) => u.id === city.leaderId);
          const isExpanded = expandedCity === city.id;
          const coachIds = [...new Set(
            coachAssignments
              .filter((a) => cityVentures.some((v) => v.id === a.ventureId))
              .map((a) => a.coachId)
          )];

          return (
            <div key={city.id} className="bg-white rounded-xl border border-stone-200 overflow-hidden">
              <button
                onClick={() => setExpandedCity(isExpanded ? null : city.id)}
                className="w-full flex items-center gap-4 p-5 text-left hover:bg-stone-50/50 cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-base font-semibold text-stone-900">{city.name}, {city.state}</h3>
                    {cityVentures.length === 0 && (
                      <span className="text-[10px] font-medium text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">No ventures</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-stone-500">
                    <span>{cityVentures.length} ventures</span>
                    <span>&middot;</span>
                    <span>{coachIds.length} coaches</span>
                    <span>&middot;</span>
                    <span>{leader ? `Led by ${leader.name}` : "No leader assigned"}</span>
                  </div>
                </div>
                {cityVentures.length > 0 && (
                  <div className="hidden sm:flex gap-4 mr-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-teal-600">{cityVentures.reduce((s, v) => s + v.impact.social, 0)}</div>
                      <div className="text-[10px] text-stone-400 uppercase">Social</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-violet-600">{cityVentures.reduce((s, v) => s + v.impact.spiritual, 0)}</div>
                      <div className="text-[10px] text-stone-400 uppercase">Spiritual</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-amber-600">${(cityVentures.reduce((s, v) => s + v.impact.economic, 0) / 1000).toFixed(1)}k</div>
                      <div className="text-[10px] text-stone-400 uppercase">Economic</div>
                    </div>
                  </div>
                )}
                <svg className={`w-5 h-5 text-stone-400 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {isExpanded && cityVentures.length > 0 && (
                <div className="border-t border-stone-100 p-5 bg-stone-50/30">
                  <div className="space-y-2">
                    {cityVentures.map((v) => {
                      const vLeader = allUsers.find((u) => u.id === v.leaderId);
                      return (
                        <Link key={v.id} href={`/ventures/${v.id}`} className="flex items-center gap-3 p-3 rounded-lg bg-white border border-stone-100 hover:border-stone-200 group">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-stone-800 group-hover:text-stone-900">{v.name}</span>
                              <StageBadge stage={v.stage} />
                            </div>
                            <span className="text-xs text-stone-500">{vLeader?.name} &middot; {v.cause}</span>
                          </div>
                          <StatusBadge lastSubmission={v.lastSubmission} />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
}
