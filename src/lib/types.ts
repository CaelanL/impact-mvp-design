// ============================================================
// Core types for Impact360
// ============================================================

export type Role =
  | "venture_leader"
  | "coach"
  | "city_leader"
  | "ceo"
  | "platform_owner";

export type VentureStage =
  | "accelerate"
  | "build"
  | "scale"
  | "multiply";

export type PrivacyLevel = "private" | "discoverable" | "connectable";

export type CheckInStatus = "submitted" | "overdue" | "way_overdue" | "not_started";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  roles: UserRole[];
}

export interface UserRole {
  role: Role;
  scopeType: "venture" | "city" | "org" | "platform";
  scopeId: string;
}

export interface Venture {
  id: string;
  name: string;
  cause: string;
  address: string;
  cityId: string;
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
  month: string; // "2026-01", "2026-02", etc.
  bucket: "social" | "spiritual" | "economic";
  metric: string;
  value: number;
  story?: string;
}
