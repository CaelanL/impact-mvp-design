"use client";

import { AppLayout } from "@/components/AppLayout";
import { useUser } from "@/lib/UserContext";
import { ventures, allUsers } from "@/lib/data";
import { getUserVenture } from "@/lib/permissions";
import { StageBadge } from "@/components/StageBadge";

const privacyConfig = {
  private: { label: "Private", color: "bg-stone-100 text-stone-500 border-stone-200" },
  discoverable: { label: "Discoverable", color: "bg-amber-50 text-amber-700 border-amber-200" },
  connectable: { label: "Connectable", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

export default function NetworkPage() {
  const { currentUser } = useUser();
  if (!currentUser) return null;

  const myVenture = getUserVenture(currentUser);
  const publicVentures = ventures.filter((v) => v.privacy !== "private");

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">Network</h1>
        <p className="text-sm text-stone-500 mt-1">
          Connect with leaders and partners across the Impact360 network
        </p>
      </div>

      {/* Privacy banner */}
      {myVenture && (
        <div className={`rounded-xl border p-4 mb-5 flex items-center gap-3 ${
          myVenture.privacy === "private"
            ? "bg-stone-50 border-stone-200"
            : myVenture.privacy === "discoverable"
            ? "bg-amber-50/50 border-amber-200"
            : "bg-emerald-50/50 border-emerald-200"
        }`}>
          <svg className="w-5 h-5 text-stone-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
          <div className="flex-1">
            <span className="text-sm text-stone-700">
              Your venture is currently <strong className="font-semibold">{myVenture.privacy}</strong>
            </span>
            <p className="text-xs text-stone-500 mt-0.5">
              {myVenture.privacy === "private"
                ? "Your venture is hidden from the network map and public listings."
                : myVenture.privacy === "discoverable"
                ? "Others can see your venture name and city, but not contact info."
                : "Others can see your profile and reach out to connect."
              }
            </p>
          </div>
          <button className="text-xs font-medium text-amber-600 hover:text-amber-700 shrink-0 cursor-pointer">
            Change visibility
          </button>
        </div>
      )}

      {/* Map placeholder */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden mb-5">
        <div className="p-4 border-b border-stone-100 flex items-center gap-3">
          <input
            type="text"
            placeholder="Search by name, venture, or city..."
            className="flex-1 px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400"
            readOnly
          />
          <button className="px-4 py-2 bg-stone-100 text-stone-600 rounded-lg text-sm font-medium cursor-pointer">
            Search
          </button>
        </div>
        <div className="h-56 sm:h-72 bg-stone-50 flex items-center justify-center">
          <div className="text-center">
            <svg className="w-12 h-12 text-stone-200 mx-auto mb-2" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            <p className="text-sm text-stone-400 font-medium">Interactive Map</p>
            <p className="text-xs text-stone-300 mt-0.5">Coming soon</p>
          </div>
        </div>
      </div>

      {/* Public venture cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {publicVentures.map((venture) => {
          const leader = allUsers.find((u) => u.id === venture.leaderId);
          const privacy = privacyConfig[venture.privacy];

          return (
            <div key={venture.id} className="bg-white rounded-xl border border-stone-200 p-5 hover:border-stone-300">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
                  </svg>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${privacy.color}`}>
                  {privacy.label}
                </span>
              </div>

              <h3 className="text-sm font-semibold text-stone-800 mb-0.5">{venture.name}</h3>
              <p className="text-xs text-stone-500 mb-3">{venture.cause}</p>

              {venture.privacy === "connectable" && leader && (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 rounded-full bg-stone-200 flex items-center justify-center text-[9px] font-semibold text-stone-600">
                      {leader.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <span className="text-xs text-stone-600">{leader.name}</span>
                  </div>
                  <p className="text-xs text-stone-400 line-clamp-2 mb-3">{venture.story}</p>
                  <div className="flex gap-2">
                    <button className="text-xs font-medium text-amber-600 hover:text-amber-700 cursor-pointer">
                      Contact
                    </button>
                  </div>
                </>
              )}

              {venture.privacy === "discoverable" && (
                <div className="flex items-center gap-2 text-xs text-stone-400">
                  <StageBadge stage={venture.stage} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
}
