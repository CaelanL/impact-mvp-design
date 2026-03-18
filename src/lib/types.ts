// ============================================================
// Core types for Impact360
// ============================================================

// --- Role types (two-layer model) ---

export type AffiliateRole = "director" | "coach" | "venture_leader" | "church_partner";
export type PlatformRole = "platform_owner" | "admin" | "city_leader";
export type Role = AffiliateRole | PlatformRole;

// --- Context switcher ---

export type ActiveContext =
  | { type: "affiliate"; affiliateId: string }
  | { type: "platform" };

// --- Core enums ---

export type VentureStage =
  | "accelerate"
  | "build"
  | "scale"
  | "multiply";

export type PrivacyLevel = "private" | "discoverable" | "connectable";

export type CheckInStatus = "submitted" | "overdue" | "way_overdue" | "not_started";
export type ImpactCategory = "social" | "spiritual" | "economic";
export type ImpactMetricSource = "preset" | "custom";
export type ImpactValueType = "count" | "currency";

// --- Data interfaces ---

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  roles: UserRole[];
}

export interface UserRole {
  role: Role;
  affiliateId?: string; // Present for affiliate roles, absent for platform roles
  scopeType: "venture" | "city" | "org" | "platform";
  scopeId: string;
}

export interface Venture {
  id: string;
  name: string;
  cause: string;
  address: string;
  cityId: string;
  affiliateId: string;
  leaderId: string;
  stage: VentureStage;
  privacy: PrivacyLevel;
  story: string;
  lastSubmission: string | null; // ISO date
  impact: {
    social: number;
    spiritual: number;
    economic: number;
  };
}

export interface City {
  id: string;
  name: string;
  state: string;
  leaderId: string | null;
  orgId: string;
}

export interface Org {
  id: string;
  name: string;
  slug: string;
}

export type Affiliate = Org;

export interface CoachAssignment {
  coachId: string;
  ventureLeaderId: string;
  ventureId: string;
}

export interface Note {
  id: string;
  authorId: string;
  ventureId: string;
  content: string;
  createdAt: string; // ISO date
}

export interface ImpactEntry {
  id: string;
  ventureId: string;
  category: ImpactCategory;
  metricId?: string;
  metricLabel: string;
  metricSource: ImpactMetricSource;
  value: number;
  valueType: ImpactValueType;
  startDate: string; // YYYY-MM-DD inclusive
  endDate: string; // YYYY-MM-DD inclusive
  story?: string;
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
}

export interface ImpactMetricOption {
  id: string;
  label: string;
  category: ImpactCategory;
  valueType: ImpactValueType;
}

export interface Cohort {
  id: string;
  name: string;
  cityId: string;        // which city this cohort belongs to
  affiliateId?: string;  // optional: if scoped to a specific affiliate
  season: string;        // e.g. "Spring 2026"
  isActive: boolean;
}
