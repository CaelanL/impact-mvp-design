"use client";

import { AppLayout } from "@/components/AppLayout";
import { useUser } from "@/lib/UserContext";
import { getVisibleVentures, getUserVenture, hasRole } from "@/lib/permissions";
import { allUsers, cities } from "@/lib/data";
import { StatusBadge } from "@/components/StatusBadge";
import { StageBadge } from "@/components/StageBadge";
import { ImpactCircle } from "@/components/ImpactCircle";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function VenturesPage() {
  const { currentUser } = useUser();
  const router = useRouter();

  const myVenture = currentUser ? getUserVenture(currentUser) : null;
  const allVisible = currentUser ? getVisibleVentures(currentUser) : [];
  const isVLOnly = currentUser && currentUser.roles.length === 1 && hasRole(currentUser, "venture_leader");

  // If VL only with one venture, redirect to that venture's page
  useEffect(() => {
    if (isVLOnly && myVenture) {
      router.replace(`/ventures/${myVenture.id}`);
    }
  }, [isVLOnly, myVenture, router]);

  if (!currentUser) return null;
  if (isVLOnly && myVenture) return null; // Will redirect

  const otherVentures = allVisible.filter((v) => v.id !== myVenture?.id);

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">Ventures</h1>
        <p className="text-sm text-stone-500 mt-1">
          {allVisible.length} venture{allVisible.length !== 1 ? "s" : ""} in your scope
        </p>
      </div>

      <div className="space-y-4">
        {/* My venture pinned at top */}
        {myVenture && (
          <div>
            <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2 px-1">My Venture</div>
            <Link href={`/ventures/${myVenture.id}`} className="block bg-white rounded-xl border-2 border-amber-200 p-5 hover:border-amber-300 hover:shadow-sm group">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-1">
                    <h3 className="text-lg font-semibold text-stone-900 group-hover:text-amber-700">{myVenture.name}</h3>
                    <StageBadge stage={myVenture.stage} />
                    <StatusBadge lastSubmission={myVenture.lastSubmission} />
                  </div>
                  <p className="text-sm text-stone-500">{myVenture.cause}</p>
                  <p className="text-xs text-stone-400 mt-0.5">{myVenture.address}</p>
                </div>
                <div className="flex gap-3">
                  <ImpactCircle label="Social" value={myVenture.impact.social} type="social" size="sm" />
                  <ImpactCircle label="Spiritual" value={myVenture.impact.spiritual} type="spiritual" size="sm" />
                  <ImpactCircle label="Economic" value={myVenture.impact.economic} type="economic" size="sm" />
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Other ventures */}
        {otherVentures.length > 0 && (
          <div>
            {myVenture && (
              <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2 px-1">
                {hasRole(currentUser, "coach") ? "Coached Ventures" : "All Ventures"}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {otherVentures.map((venture) => {
                const leader = allUsers.find((u) => u.id === venture.leaderId);
                const city = cities.find((c) => c.id === venture.cityId);
                return (
                  <Link
                    key={venture.id}
                    href={`/ventures/${venture.id}`}
                    className="bg-white rounded-xl border border-stone-200 p-4 hover:border-stone-300 hover:shadow-sm group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-sm font-semibold text-stone-800 group-hover:text-stone-900">{venture.name}</h3>
                        <p className="text-xs text-stone-500 mt-0.5">{venture.cause}</p>
                      </div>
                      <StageBadge stage={venture.stage} />
                    </div>
                    <div className="flex items-center gap-3 mt-3 text-xs text-stone-400">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-stone-100 flex items-center justify-center text-[10px] font-semibold text-stone-500">
                          {leader?.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <span>{leader?.name}</span>
                      </div>
                      <span>&middot;</span>
                      <span>{city?.name}</span>
                      <span className="ml-auto"><StatusBadge lastSubmission={venture.lastSubmission} /></span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
