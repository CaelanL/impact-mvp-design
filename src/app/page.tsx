"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@/lib/UserContext";
import { users } from "@/lib/data";
import {
  getUserVenture,
  getCoachedVentures,
  getUserCity,
  getNavItems,
  shouldShowSwitcher,
  getSwitcherOptions,
} from "@/lib/permissions";
import { RoleBadge } from "@/components/RoleBadge";
import { useEffect } from "react";
import type { User } from "@/lib/types";

// Section definitions — groups personas by their layer in the system
const sections = [
  {
    id: "linc",
    title: "LINC Affiliate Users",
    description:
      "Standard users inside the LINC organization. They only see LINC data — no platform awareness, no org switcher. This is the experience most users will have.",
    userIds: ["user-maria", "user-james", "user-josh"],
  },
  {
    id: "platform",
    title: "Platform Users",
    description:
      "LINC staff with platform-level roles. They can see across affiliates, have the org switcher, and access platform-specific pages like My City or All Cities.",
    userIds: ["user-sarah", "user-david", "user-ben"],
  },
  {
    id: "affiliate",
    title: "Other Affiliates",
    description:
      "Users in a non-LINC organization. Fully isolated — they have no idea LINC or the platform layer exists. Their world is their church or nonprofit.",
    userIds: ["user-mike"],
  },
];

// Per-persona descriptions — what makes this persona interesting to test
const personaDescriptions: Record<string, string> = {
  "user-maria":
    "Runs \"Hope Kitchen\" in Chicago. Single role, single org — the simplest possible experience.",
  "user-james":
    "Coaches 3 venture leaders in Chicago. No venture of his own. Sees the coach layer without the VL layer.",
  "user-josh":
    "Runs \"Milwaukee Barbers\" AND coaches 2 other leaders. Tests dual affiliate roles in one person.",
  "user-sarah":
    "Oversees all of Chicago. Sees LINC and Grace Church ventures via the org switcher. No affiliate role.",
  "user-david":
    "Leads Milwaukee AND runs his own venture. Tests the platform + affiliate role overlap.",
  "user-ben":
    "The god-view. Director of LINC + Platform Owner. Can switch between every affiliate and a platform-wide view.",
  "user-mike":
    "Runs Grace Church Chicago. Complete affiliate isolation — sees only his church's 2 ventures.",
};

function PersonaCard({
  user,
  onSelect,
}: {
  user: User;
  onSelect: (id: string) => void;
}) {
  const uniqueRoles = [...new Set(user.roles.map((r) => r.role))];
  const venture = getUserVenture(user);
  const coached = getCoachedVentures(user);
  const city = getUserCity(user);
  const navItems = getNavItems(user);
  const hasSwitcher = shouldShowSwitcher(user);
  const switcherOptions = getSwitcherOptions(user);

  // Nav items that are conditional (not shared by everyone)
  const conditionalNavLabels = new Set([
    "Add Impact",
    "Training",
    "My City",
    "All Cities",
    "Platform Admin",
  ]);
  const uniqueNav = navItems.filter((n) => conditionalNavLabels.has(n.label));

  // Build switcher label
  let switcherLabel: string | null = null;
  if (hasSwitcher) {
    const names = switcherOptions.map((o) =>
      o.type === "platform" ? "Platform View" : o.affiliate.name
    );
    switcherLabel = names.join(" / ");
  }

  return (
    <button
      onClick={() => onSelect(user.id)}
      className="group relative bg-stone-900/60 border border-stone-800 rounded-2xl p-5 sm:p-6 text-left cursor-pointer hover:border-stone-700 hover:bg-stone-900/80 hover:shadow-lg hover:shadow-stone-950/50 transition-all"
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-stone-700 to-transparent group-hover:via-amber-500/40 transition-colors" />

      {/* Header: avatar + name + roles */}
      <div className="flex items-start gap-4 mb-3">
        <div className="w-11 h-11 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-400 text-sm font-semibold shrink-0 group-hover:border-stone-600 group-hover:text-stone-300 transition-colors">
          {user.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-stone-200 group-hover:text-stone-50 mb-1.5 transition-colors">
            {user.name}
          </h3>
          <div className="flex flex-wrap gap-1">
            {uniqueRoles.map((role) => (
              <RoleBadge key={role} role={role} />
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-stone-500 leading-relaxed mb-4 group-hover:text-stone-400 transition-colors">
        {personaDescriptions[user.id]}
      </p>

      {/* Context details */}
      <div className="space-y-2 text-xs text-stone-600">
        {/* Venture / coaching info */}
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {venture && (
            <span>
              Venture:{" "}
              <span className="text-stone-400">{venture.name}</span>
            </span>
          )}
          {coached.length > 0 && (
            <span>
              Coaching:{" "}
              <span className="text-stone-400">{coached.length} leaders</span>
            </span>
          )}
          {city && (
            <span>
              City:{" "}
              <span className="text-stone-400">{city.name}</span>
            </span>
          )}
        </div>

        {/* Org switcher */}
        <div className="flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${hasSwitcher ? "bg-amber-500" : "bg-stone-700"}`}
          />
          {hasSwitcher ? (
            <span>
              Switcher:{" "}
              <span className="text-stone-400">{switcherLabel}</span>
            </span>
          ) : (
            <span className="text-stone-700">No org switcher</span>
          )}
        </div>

        {/* Unique nav items */}
        {uniqueNav.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-700" />
            <span>
              Pages:{" "}
              <span className="text-stone-400">
                {uniqueNav.map((n) => n.label).join(", ")}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Arrow hint */}
      <div className="absolute bottom-5 right-5 w-8 h-8 rounded-full bg-stone-800/0 group-hover:bg-stone-800 flex items-center justify-center transition-colors">
        <svg
          className="w-4 h-4 text-stone-600 group-hover:text-amber-400 transition-colors"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
          />
        </svg>
      </div>
    </button>
  );
}

export default function PersonaSelector() {
  const { selectUser, currentUser } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (currentUser) {
      router.push("/dashboard");
    }
  }, [currentUser, router]);

  const handleSelect = (userId: string) => {
    selectUser(userId);
    router.push("/dashboard");
  };

  const userMap = new Map(users.map((u) => [u.id, u]));

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col">
      {/* Subtle grain overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative flex-1 flex flex-col items-center px-4 py-12 sm:py-16">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
              <span className="text-stone-900 font-bold text-base">I3</span>
            </div>
          </div>
          <h1 className="font-[family-name:var(--font-instrument-serif)] text-4xl sm:text-5xl lg:text-6xl text-stone-50 mb-4 tracking-tight">
            Impact360
          </h1>
          <p className="text-stone-500 text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
            Select a persona to explore the app from their perspective. Each
            section represents a different layer of the system.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 text-xs text-stone-600 bg-stone-900 border border-stone-800 rounded-full px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Interactive Prototype
          </div>
        </div>

        {/* Sections */}
        <div className="w-full max-w-5xl space-y-12">
          {sections.map((section) => {
            const sectionUsers = section.userIds
              .map((id) => userMap.get(id))
              .filter(Boolean) as User[];

            return (
              <div key={section.id}>
                {/* Section header */}
                <div className="mb-5">
                  <h2 className="text-lg font-semibold text-stone-300 mb-1">
                    {section.title}
                  </h2>
                  <p className="text-sm text-stone-600 max-w-2xl leading-relaxed">
                    {section.description}
                  </p>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sectionUsers.map((user) => (
                    <PersonaCard
                      key={user.id}
                      user={user}
                      onSelect={handleSelect}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <p className="mt-16 text-xs text-stone-700 text-center max-w-lg">
          This prototype demonstrates the additive permissions model — each role
          adds surface area to the same app. Try switching between personas to
          see how the navigation and dashboard adapt.
        </p>
      </div>
    </div>
  );
}
