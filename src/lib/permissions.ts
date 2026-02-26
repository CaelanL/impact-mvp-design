// ============================================================
// Permission helpers — the core of the additive role model
// Given a user, determine what they can see and access.
// ============================================================

import { User, Role } from "./types";
import { ventures, coachAssignments, cities } from "./data";

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
    "ceo",
    "city_leader",
    "coach",
    "venture_leader",
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
export function getCityVentures(user: User) {
  const cityRole = user.roles.find((r) => r.role === "city_leader");
  if (!cityRole) return [];
  return ventures.filter((v) => v.cityId === cityRole.scopeId);
}

/** Get the city a user leads (if city leader) */
export function getUserCity(user: User) {
  const cityRole = user.roles.find((r) => r.role === "city_leader");
  if (!cityRole) return null;
  return cities.find((c) => c.id === cityRole.scopeId) ?? null;
}

/** Get ALL ventures visible to this user based on all their roles */
export function getVisibleVentures(user: User) {
  // CEO / Platform Owner see everything
  if (hasAnyRole(user, ["ceo", "platform_owner"])) {
    return ventures;
  }

  const visible = new Map<string, (typeof ventures)[0]>();

  // Own venture
  const own = getUserVenture(user);
  if (own) visible.set(own.id, own);

  // Coached ventures
  for (const v of getCoachedVentures(user)) {
    visible.set(v.id, v);
  }

  // City ventures
  for (const v of getCityVentures(user)) {
    visible.set(v.id, v);
  }

  return Array.from(visible.values());
}

/** Determine which nav items a user should see */
export interface NavItem {
  label: string;
  href: string;
  icon: string; // icon name — we'll map these to components
}

export function getNavItems(user: User): NavItem[] {
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

  if (hasAnyRole(user, ["ceo", "platform_owner"])) {
    items.push({ label: "All Cities", href: "/all-cities", icon: "all-cities" });
  }

  items.push({ label: "Reports", href: "/reports", icon: "reports" });
  items.push({ label: "Network", href: "/network", icon: "network" });
  items.push({ label: "Settings", href: "/settings", icon: "settings" });

  if (hasRole(user, "platform_owner")) {
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
    ceo: "CEO",
    platform_owner: "Platform Owner",
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
