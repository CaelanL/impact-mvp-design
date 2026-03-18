// ============================================================
// Permission helpers — the core of the additive role model
// Given a user, determine what they can see and access.
// ============================================================

import { User, Role, ActiveContext, Org } from "./types";
import { ventures, coachAssignments, cities, orgs, cityLeaderAffiliates } from "./data";

/** Check if user has a specific role */
export function hasRole(user: User, role: Role): boolean {
  return user.roles.some((r) => r.role === role);
}

/** Check if user has ANY of the given roles */
export function hasAnyRole(user: User, roles: Role[]): boolean {
  return roles.some((role) => hasRole(user, role));
}

/** Get the highest role a user holds (for display purposes) */
export function getHighestRole(user: User): Role {
  const priority: Role[] = [
    "platform_owner",
    "admin",
    "city_leader",
    "director",
    "coach",
    "venture_leader",
    "church_partner",
  ];
  for (const role of priority) {
    if (hasRole(user, role)) return role;
  }
  return "venture_leader";
}

/** Get the venture this user leads (if any) */
export function getUserVenture(user: User) {
  const vlRole = user.roles.find((r) => r.role === "venture_leader");
  if (!vlRole) return null;
  return ventures.find((v) => v.id === vlRole.scopeId) ?? null;
}

/** Get ventures this user coaches */
export function getCoachedVentures(user: User) {
  if (!hasRole(user, "coach")) return [];
  const assignments = coachAssignments.filter((a) => a.coachId === user.id);
  return assignments
    .map((a) => ventures.find((v) => v.id === a.ventureId))
    .filter(Boolean) as typeof ventures;
}

/** Get ventures in a user's city (for city leaders) */
export function getCityVentures(user: User, activeContext?: ActiveContext) {
  const cityRole = user.roles.find((r) => r.role === "city_leader");
  if (!cityRole) return [];
  let cityVents = ventures.filter((v) => v.cityId === cityRole.scopeId);
  // If viewing a specific affiliate, filter to that affiliate's ventures
  if (activeContext?.type === "affiliate") {
    cityVents = cityVents.filter((v) => v.affiliateId === activeContext.affiliateId);
  }
  return cityVents;
}

/** Get the city a user leads (if city leader) */
export function getUserCity(user: User) {
  const cityRole = user.roles.find((r) => r.role === "city_leader");
  if (!cityRole) return null;
  return cities.find((c) => c.id === cityRole.scopeId) ?? null;
}

/** Get all affiliates a user can access */
export function getUserAffiliates(user: User): Org[] {
  const affiliateIds = new Set<string>();

  for (const r of user.roles) {
    // Affiliate roles carry an affiliateId
    if (r.affiliateId) {
      affiliateIds.add(r.affiliateId);
    }
    // City leaders see affiliates linked to their city
    if (r.role === "city_leader") {
      const linked = cityLeaderAffiliates[user.id];
      if (linked) linked.forEach((id) => affiliateIds.add(id));
    }
    // Platform owner and admin see all affiliates
    if (r.role === "platform_owner" || r.role === "admin") {
      orgs.forEach((o) => affiliateIds.add(o.id));
    }
  }

  return orgs.filter((o) => affiliateIds.has(o.id));
}

/** Should this user see the context switcher? */
export function shouldShowSwitcher(user: User): boolean {
  const affiliates = getUserAffiliates(user);
  const hasPlatformRole = user.roles.some(
    (r) => r.role === "platform_owner" || r.role === "admin" || r.role === "city_leader"
  );
  return affiliates.length > 1 || hasPlatformRole;
}

/** Get switcher dropdown options for a user */
export function getSwitcherOptions(
  user: User
): Array<{ type: "affiliate"; affiliate: Org } | { type: "platform" }> {
  const options: Array<{ type: "affiliate"; affiliate: Org } | { type: "platform" }> = [];
  const affiliates = getUserAffiliates(user);
  for (const a of affiliates) {
    options.push({ type: "affiliate", affiliate: a });
  }
  // Platform Owner and Admin get a "Platform View" option
  if (hasAnyRole(user, ["platform_owner", "admin"])) {
    options.push({ type: "platform" });
  }
  return options;
}

/** Compute the default context for a user */
export function getDefaultContext(user: User): ActiveContext {
  const affiliates = getUserAffiliates(user);
  // Default to their first/primary affiliate
  if (affiliates.length > 0) {
    return { type: "affiliate", affiliateId: affiliates[0].id };
  }
  // Fallback for platform-only users
  return { type: "platform" };
}

/** Get ALL ventures visible to this user based on roles + active context */
export function getVisibleVentures(user: User, activeContext?: ActiveContext) {
  // Platform context: platform_owner/admin see everything
  if (
    activeContext?.type === "platform" &&
    hasAnyRole(user, ["platform_owner", "admin"])
  ) {
    return ventures;
  }

  // If in an affiliate context, scope everything to that affiliate
  if (activeContext?.type === "affiliate") {
    const affiliateVentures = ventures.filter(
      (v) => v.affiliateId === activeContext.affiliateId
    );

    // Director sees all ventures in their affiliate
    const directorRole = user.roles.find(
      (r) => r.role === "director" && r.affiliateId === activeContext.affiliateId
    );
    if (directorRole) return affiliateVentures;

    // Platform owner/admin see all ventures in the selected affiliate
    if (hasAnyRole(user, ["platform_owner", "admin"])) return affiliateVentures;

    // City leader viewing an affiliate: show ventures in their city within this affiliate
    if (hasRole(user, "city_leader")) {
      const cityRole = user.roles.find((r) => r.role === "city_leader");
      if (cityRole) {
        const cityFiltered = affiliateVentures.filter(
          (v) => v.cityId === cityRole.scopeId
        );
        // Also add own venture if it's in this affiliate
        const own = getUserVenture(user);
        if (own && own.affiliateId === activeContext.affiliateId) {
          const combined = new Map(cityFiltered.map((v) => [v.id, v]));
          combined.set(own.id, own);
          return Array.from(combined.values());
        }
        return cityFiltered;
      }
    }

    // Otherwise apply normal role scoping within this affiliate
    const visible = new Map<string, (typeof ventures)[0]>();

    const own = getUserVenture(user);
    if (own && own.affiliateId === activeContext.affiliateId) {
      visible.set(own.id, own);
    }

    for (const v of getCoachedVentures(user)) {
      if (v.affiliateId === activeContext.affiliateId) {
        visible.set(v.id, v);
      }
    }

    return Array.from(visible.values());
  }

  // No context set — legacy fallback (same as old behavior)
  if (hasAnyRole(user, ["director", "platform_owner", "admin"])) {
    return ventures;
  }

  const visible = new Map<string, (typeof ventures)[0]>();

  const own = getUserVenture(user);
  if (own) visible.set(own.id, own);

  for (const v of getCoachedVentures(user)) {
    visible.set(v.id, v);
  }

  for (const v of getCityVentures(user)) {
    visible.set(v.id, v);
  }

  return Array.from(visible.values());
}

/** Determine which nav items a user should see */
export interface NavItem {
  label: string;
  href: string;
  icon: string;
}

export function getNavItems(user: User): NavItem[] {
  // Church partners have a limited view: Dashboard, Network, Settings only
  if (hasRole(user, "church_partner") && !hasAnyRole(user, ["venture_leader", "coach", "director", "city_leader", "admin", "platform_owner"])) {
    return [
      { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
      { label: "Network", href: "/network", icon: "network" },
      { label: "Settings", href: "/settings", icon: "settings" },
    ];
  }

  const items: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
    { label: "Ventures", href: "/ventures", icon: "ventures" },
  ];

  if (hasRole(user, "venture_leader")) {
    items.push({ label: "Add Impact", href: "/add-impact", icon: "add-impact" });
  }

  if (hasAnyRole(user, ["venture_leader", "coach"])) {
    items.push({ label: "Training", href: "/training", icon: "training" });
  }

  if (hasRole(user, "city_leader")) {
    items.push({ label: "My City", href: "/my-city", icon: "city" });
  }

  if (hasAnyRole(user, ["director", "platform_owner", "admin"])) {
    items.push({ label: "All Cities", href: "/all-cities", icon: "all-cities" });
  }

  items.push({ label: "Reports", href: "/reports", icon: "reports" });
  items.push({ label: "Network", href: "/network", icon: "network" });
  items.push({ label: "Settings", href: "/settings", icon: "settings" });

  if (hasAnyRole(user, ["platform_owner", "admin"])) {
    items.push({ label: "Platform Admin", href: "/platform-admin", icon: "admin" });
  }

  return items;
}

/** Get role display labels */
export function getRoleLabel(role: Role): string {
  const labels: Record<Role, string> = {
    venture_leader: "Venture Leader",
    coach: "Coach",
    city_leader: "City Leader",
    director: "Director",
    admin: "Admin",
    platform_owner: "Platform Owner",
    church_partner: "Church Partner",
  };
  return labels[role];
}

/** Get venture stage display label */
export function getStageLabel(stage: string): string {
  const labels: Record<string, string> = {
    accelerate: "Accelerate",
    build: "Build",
    scale: "Scale",
    multiply: "Multiply",
  };
  return labels[stage] ?? stage;
}

/** Get check-in status for a venture */
export function getCheckInStatus(lastSubmission: string | null): "submitted" | "overdue" | "way_overdue" | "not_started" {
  if (!lastSubmission) return "not_started";
  const last = new Date(lastSubmission);
  const now = new Date();
  const daysSince = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
  if (daysSince <= 35) return "submitted";
  if (daysSince <= 60) return "overdue";
  return "way_overdue";
}
