"use client";

import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { RoleBadge } from "@/components/RoleBadge";
import { useUser } from "@/lib/UserContext";
import { hasAnyRole, getHighestRole, getRoleLabel } from "@/lib/permissions";
import {
  allUsers,
  orgs,
  cities,
  ventures,
  pendingInvites,
  applicants,
  type PendingInvite,
  type Applicant,
  type MinistryType,
  type ApplicantStatus,
} from "@/lib/data";
import type { AffiliateRole, PlatformRole } from "@/lib/types";

// ─── helpers ───────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ministryLabel(t: MinistryType) {
  return { church: "Church", nonprofit: "Nonprofit", business: "Business", ministry: "Ministry" }[t];
}

// ─── invite form state shape ────────────────────────────────

interface InviteFormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  mailingAddress: string;
  churchName: string;
  role: AffiliateRole | PlatformRole | "";
  affiliateId: string;
  cityId: string;
  ministryType: MinistryType | "";
  ventureId: string;
  coachId: string;
  adminNote: string;
  personalNote: string;
}

const emptyForm: InviteFormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  mailingAddress: "",
  churchName: "",
  role: "",
  affiliateId: "",
  cityId: "",
  ministryType: "",
  ventureId: "",
  coachId: "",
  adminNote: "",
  personalNote: "",
};

const affiliateRoles: (AffiliateRole | PlatformRole)[] = [
  "director",
  "coach",
  "venture_leader",
  "city_leader",
  "admin",
];

// ─── sub-components ─────────────────────────────────────────

function InviteStatusBadge({ status }: { status: PendingInvite["status"] }) {
  if (status === "pending") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-amber-500/10 text-amber-700 border border-amber-500/25">
        Awaiting Setup
      </span>
    );
  }
  if (status === "accepted") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-emerald-500/10 text-emerald-700 border border-emerald-500/25">
        Accepted
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-stone-200 text-stone-500 border border-stone-300">
      Expired
    </span>
  );
}

function ApplicantStatusBadge({ status }: { status: ApplicantStatus }) {
  if (status === "pending") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-amber-500/10 text-amber-700 border border-amber-500/25">
        Pending
      </span>
    );
  }
  if (status === "approved") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-emerald-500/10 text-emerald-700 border border-emerald-500/25">
        Approved
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-rose-500/10 text-rose-700 border border-rose-500/25">
      Rejected
    </span>
  );
}

// ─── Invite Form ────────────────────────────────────────────

function InviteForm({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<InviteFormState>(emptyForm);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);

  const set = (field: keyof InviteFormState, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const showAffiliateField = ["director", "coach", "venture_leader"].includes(form.role);
  const showMinistryType = form.role === "venture_leader";
  const showVentureAssign = form.role === "venture_leader";
  const showCoachAssign = form.role === "venture_leader";

  const filteredVentures = form.affiliateId
    ? ventures.filter((v) => v.affiliateId === form.affiliateId)
    : ventures;

  const filteredCoaches = form.affiliateId
    ? allUsers.filter((u) =>
        u.roles.some((r) => r.role === "coach" && r.affiliateId === form.affiliateId)
      )
    : allUsers.filter((u) => u.roles.some((r) => r.role === "coach"));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email) return;
    setSuccessEmail(form.email);
    setForm(emptyForm);
    setTimeout(() => setSuccessEmail(null), 4000);
  }

  return (
    <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 mt-4">
      <h3 className="text-sm font-semibold text-stone-900 mb-4">Invite a New User</h3>

      {successEmail && (
        <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
          Invite sent to <span className="font-medium">{successEmail}</span>. They&rsquo;ll receive an email shortly.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Info */}
        <div>
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Personal Info</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">First Name</label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => set("firstName", e.target.value)}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Last Name</label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => set("lastName", e.target.value)}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-stone-600 mb-1">Mailing Address</label>
              <input
                type="text"
                value={form.mailingAddress}
                onChange={(e) => set("mailingAddress", e.target.value)}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-stone-600 mb-1">Church Name</label>
              <input
                type="text"
                value={form.churchName}
                onChange={(e) => set("churchName", e.target.value)}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Platform Assignment */}
        <div>
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Platform Assignment</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Role</label>
              <select
                value={form.role}
                onChange={(e) => set("role", e.target.value)}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 cursor-pointer bg-white"
                required
              >
                <option value="">Select a role…</option>
                {affiliateRoles.map((r) => (
                  <option key={r} value={r}>{getRoleLabel(r)}</option>
                ))}
              </select>
            </div>

            {showAffiliateField && (
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Affiliate</label>
                <select
                  value={form.affiliateId}
                  onChange={(e) => set("affiliateId", e.target.value)}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 cursor-pointer bg-white"
                >
                  <option value="">Select affiliate…</option>
                  {orgs.map((o) => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">City</label>
              <select
                value={form.cityId}
                onChange={(e) => set("cityId", e.target.value)}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 cursor-pointer bg-white"
              >
                <option value="">Select city…</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}, {c.state}</option>
                ))}
              </select>
            </div>

            {showMinistryType && (
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Ministry Type{" "}
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-700 bg-amber-50 border border-amber-200 rounded px-1 py-0.5 ml-1">CEO Required</span>
                </label>
                <select
                  value={form.ministryType}
                  onChange={(e) => set("ministryType", e.target.value as MinistryType)}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 cursor-pointer bg-white"
                >
                  <option value="">Select type…</option>
                  <option value="church">Church</option>
                  <option value="nonprofit">Nonprofit</option>
                  <option value="business">Business</option>
                  <option value="ministry">Ministry</option>
                </select>
              </div>
            )}

            {showVentureAssign && (
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Venture Assignment</label>
                <select
                  value={form.ventureId}
                  onChange={(e) => set("ventureId", e.target.value)}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 cursor-pointer bg-white"
                >
                  <option value="">Will create new venture</option>
                  {filteredVentures.map((v) => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>
            )}

            {showCoachAssign && (
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Coach Assignment</label>
                <select
                  value={form.coachId}
                  onChange={(e) => set("coachId", e.target.value)}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 cursor-pointer bg-white"
                >
                  <option value="">Select coach…</option>
                  {filteredCoaches.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        <div>
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Notes</p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">
                Internal Admin Note{" "}
                <span className="text-stone-400 font-normal">— not visible to invitee</span>
              </label>
              <textarea
                rows={2}
                value={form.adminNote}
                onChange={(e) => set("adminNote", e.target.value)}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">
                Personal Note for Email{" "}
                <span className="text-stone-400 font-normal">— included in their invite email</span>
              </label>
              <textarea
                rows={2}
                value={form.personalNote}
                onChange={(e) => set("personalNote", e.target.value)}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            className="px-4 py-2 bg-amber-500 text-stone-900 rounded-lg text-sm font-semibold hover:bg-amber-400 cursor-pointer"
          >
            Send Invite
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-stone-200 text-stone-600 rounded-lg text-sm font-medium hover:bg-stone-50 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Users Tab ──────────────────────────────────────────────

function UsersTab() {
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <div className="space-y-5">
      {/* Invite Form — shown above the user list when open */}
      {inviteOpen && (
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <InviteForm onClose={() => setInviteOpen(false)} />
        </div>
      )}

      {/* Active Users */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-stone-900">Active Users</h2>
          <button
            onClick={() => setInviteOpen((o) => !o)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              inviteOpen
                ? "bg-stone-100 text-stone-600 hover:bg-stone-200"
                : "bg-amber-500 text-stone-900 hover:bg-amber-400"
            }`}
          >
            {inviteOpen ? "✕ Cancel Invite" : "+ Invite User"}
          </button>
        </div>

        <div className="divide-y divide-stone-100">
          {allUsers.map((user) => {
            const highest = getHighestRole(user);
            const affiliateId = user.roles.find((r) => r.affiliateId)?.affiliateId;
            const org = affiliateId ? orgs.find((o) => o.id === affiliateId) : null;

            return (
              <div key={user.id} className="px-5 py-3.5 flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-500 text-xs font-semibold shrink-0">
                  {user.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-900 truncate">{user.name}</p>
                  <p className="text-xs text-stone-500 truncate">{user.email}</p>
                </div>
                <div className="hidden sm:block">
                  <RoleBadge role={highest} />
                </div>
                {org && (
                  <span className="hidden md:block text-xs text-stone-400">{org.name}</span>
                )}
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-emerald-500/10 text-emerald-700 border border-emerald-500/25">
                  Active
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pending Invites */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100">
          <h2 className="text-sm font-semibold text-stone-900">Pending Invites</h2>
        </div>
        <div className="divide-y divide-stone-100">
          {pendingInvites.map((invite) => {
            const inviter = allUsers.find((u) => u.id === invite.invitedByUserId);
            const org = invite.affiliateId ? orgs.find((o) => o.id === invite.affiliateId) : null;

            return (
              <div key={invite.id} className="px-5 py-3.5 flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 text-xs font-semibold shrink-0">
                  {invite.firstName[0]}{invite.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-900 truncate">
                    {invite.firstName} {invite.lastName}
                  </p>
                  <p className="text-xs text-stone-500 truncate">{invite.email}</p>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <RoleBadge role={invite.role} />
                  {org && (
                    <span className="text-xs text-stone-400">{org.name}</span>
                  )}
                </div>
                <div className="hidden md:block text-xs text-stone-400 shrink-0">
                  {inviter ? `by ${inviter.name.split(" ")[0]}` : ""}
                </div>
                <div className="text-xs text-stone-400 shrink-0 hidden lg:block">
                  {formatDate(invite.createdAt)}
                </div>
                <InviteStatusBadge status={invite.status} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Applicant Detail ───────────────────────────────────────

interface AssignmentPanelState {
  firstName: string;
  lastName: string;
  email: string;
  role: AffiliateRole | PlatformRole | "";
  affiliateId: string;
  cityId: string;
  ministryType: MinistryType | "";
  ventureId: string;
  coachId: string;
  welcomeNote: string;
}

function ApplicantDetail({
  applicant: initialApplicant,
  onBack,
}: {
  applicant: Applicant;
  onBack: () => void;
}) {
  const [applicant, setApplicant] = useState(initialApplicant);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [assignment, setAssignment] = useState<AssignmentPanelState>({
    firstName: initialApplicant.firstName,
    lastName: initialApplicant.lastName,
    email: initialApplicant.email,
    role: "venture_leader",
    affiliateId: "",
    cityId: "",
    ministryType: initialApplicant.ministryType,
    ventureId: "",
    coachId: "",
    welcomeNote: "",
  });
  const [rejectNote, setRejectNote] = useState("");
  const [rejectEmail, setRejectEmail] = useState(
    `Thank you for applying. Based on your application, we don't feel this is the right time to move forward — but we'd love to stay in touch. Feel free to reach out to us at any time.`
  );

  const reviewer = applicant.reviewedByUserId
    ? allUsers.find((u) => u.id === applicant.reviewedByUserId)
    : null;

  const filteredVentures = assignment.affiliateId
    ? ventures.filter((v) => v.affiliateId === assignment.affiliateId)
    : ventures;

  const filteredCoaches = assignment.affiliateId
    ? allUsers.filter((u) =>
        u.roles.some((r) => r.role === "coach" && r.affiliateId === assignment.affiliateId)
      )
    : allUsers.filter((u) => u.roles.some((r) => r.role === "coach"));

  function setA(field: keyof AssignmentPanelState, value: string) {
    setAssignment((a) => ({ ...a, [field]: value }));
  }

  function handleApprove(e: React.FormEvent) {
    e.preventDefault();
    setApplicant((a) => ({
      ...a,
      status: "approved",
      reviewedAt: new Date().toISOString(),
      reviewedByUserId: "user-ben",
    }));
    setApproveOpen(false);
  }

  function handleReject(e: React.FormEvent) {
    e.preventDefault();
    setApplicant((a) => ({
      ...a,
      status: "rejected",
      adminNotes: rejectNote || a.adminNotes,
      rejectionMessage: rejectEmail,
      reviewedAt: new Date().toISOString(),
      reviewedByUserId: "user-ben",
    }));
    setRejectOpen(false);
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 cursor-pointer mb-5"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        Back to list
      </button>

      <div className="space-y-5">
        {/* Header card */}
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-semibold text-stone-900">
                {applicant.firstName} {applicant.lastName}
              </h2>
              <p className="text-sm text-stone-500 mt-0.5">{applicant.email} &middot; {applicant.phone}</p>
            </div>
            <ApplicantStatusBadge status={applicant.status} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div>
              <p className="text-xs text-stone-400 mb-0.5">City</p>
              <p className="text-stone-700 font-medium">{applicant.cityApplied}</p>
            </div>
            <div>
              <p className="text-xs text-stone-400 mb-0.5">Cohort</p>
              <p className="text-stone-700 font-medium">{applicant.cohort}</p>
            </div>
            <div>
              <p className="text-xs text-stone-400 mb-0.5">Ministry Type</p>
              <p className="text-stone-700 font-medium">{ministryLabel(applicant.ministryType)}</p>
            </div>
            <div>
              <p className="text-xs text-stone-400 mb-0.5">Submitted</p>
              <p className="text-stone-700 font-medium">{formatDate(applicant.submittedAt)}</p>
            </div>
          </div>
        </div>

        {/* Application fields */}
        <div className="bg-white rounded-xl border border-stone-200 divide-y divide-stone-100">
          {/* Contact & Church */}
          <div className="p-5">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Contact Info</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <div>
                <span className="text-stone-400">Address: </span>
                <span className="text-stone-700">{applicant.mailingAddress}</span>
              </div>
              {applicant.churchName && (
                <div>
                  <span className="text-stone-400">Church: </span>
                  <span className="text-stone-700">{applicant.churchName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Venture Info */}
          <div className="p-5">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Venture Info</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm mb-3">
              <div>
                <span className="text-stone-400">Venture Name: </span>
                <span className="text-stone-700">{applicant.ventureName ?? "—"}</span>
              </div>
              <div>
                <span className="text-stone-400">Website: </span>
                <span className="text-stone-700">{applicant.ventureWebsite ?? "—"}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-stone-400 mb-1">Description</p>
              <p className="text-sm text-stone-700 leading-relaxed">{applicant.ministryDescription}</p>
            </div>
          </div>

          {/* Essay fields */}
          {[
            { label: "Faith Story", value: applicant.faithStory },
            { label: "Gospel Impact", value: applicant.gospelImpact },
            { label: "Program Goals", value: applicant.programGoals },
          ].map(({ label, value }) => (
            <div key={label} className="p-5">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">{label}</p>
              <p className="text-sm text-stone-700 leading-relaxed">{value}</p>
            </div>
          ))}

          {applicant.referralSource && (
            <div className="p-5">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Referral Source</p>
              <p className="text-sm text-stone-700">{applicant.referralSource}</p>
            </div>
          )}
        </div>

        {/* Decision area */}
        {applicant.status === "pending" && (
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-4">Review Decision</p>

            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => { setApproveOpen(true); setRejectOpen(false); }}
                className="px-4 py-2 bg-amber-500 text-stone-900 rounded-lg text-sm font-semibold hover:bg-amber-400 cursor-pointer"
              >
                Approve
              </button>
              <button
                onClick={() => { setRejectOpen(true); setApproveOpen(false); }}
                className="px-4 py-2 border border-rose-300 text-rose-600 rounded-lg text-sm font-semibold hover:bg-rose-50 cursor-pointer"
              >
                Reject
              </button>
            </div>

            {/* Approve Panel */}
            {approveOpen && (
              <form onSubmit={handleApprove} className="border border-stone-200 rounded-lg p-4 space-y-4 bg-stone-50">
                <p className="text-xs font-semibold text-stone-700 mb-1">Approve &amp; Assign</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">First Name</label>
                    <input
                      type="text"
                      value={assignment.firstName}
                      onChange={(e) => setA("firstName", e.target.value)}
                      className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={assignment.lastName}
                      onChange={(e) => setA("lastName", e.target.value)}
                      className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Email</label>
                    <input
                      type="email"
                      value={assignment.email}
                      onChange={(e) => setA("email", e.target.value)}
                      className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Role</label>
                    <select
                      value={assignment.role}
                      onChange={(e) => setA("role", e.target.value)}
                      className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 cursor-pointer bg-white"
                    >
                      {affiliateRoles.map((r) => (
                        <option key={r} value={r}>{getRoleLabel(r)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Affiliate</label>
                    <select
                      value={assignment.affiliateId}
                      onChange={(e) => setA("affiliateId", e.target.value)}
                      className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 cursor-pointer bg-white"
                    >
                      <option value="">Select affiliate…</option>
                      {orgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">City</label>
                    <select
                      value={assignment.cityId}
                      onChange={(e) => setA("cityId", e.target.value)}
                      className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 cursor-pointer bg-white"
                    >
                      <option value="">Select city…</option>
                      {cities.map((c) => <option key={c.id} value={c.id}>{c.name}, {c.state}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Ministry Type</label>
                    <select
                      value={assignment.ministryType}
                      onChange={(e) => setA("ministryType", e.target.value as MinistryType)}
                      className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 cursor-pointer bg-white"
                    >
                      <option value="church">Church</option>
                      <option value="nonprofit">Nonprofit</option>
                      <option value="business">Business</option>
                      <option value="ministry">Ministry</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Venture Assignment</label>
                    <select
                      value={assignment.ventureId}
                      onChange={(e) => setA("ventureId", e.target.value)}
                      className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 cursor-pointer bg-white"
                    >
                      <option value="">Will create new venture</option>
                      {filteredVentures.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-stone-600 mb-1">Coach Assignment</label>
                    <select
                      value={assignment.coachId}
                      onChange={(e) => setA("coachId", e.target.value)}
                      className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 cursor-pointer bg-white"
                    >
                      <option value="">Select coach…</option>
                      {filteredCoaches.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-stone-600 mb-1">
                      Custom Welcome Email Message{" "}
                      <span className="text-stone-400 font-normal">— optional</span>
                    </label>
                    <textarea
                      rows={3}
                      value={assignment.welcomeNote}
                      onChange={(e) => setA("welcomeNote", e.target.value)}
                      className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 resize-none"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 text-stone-900 rounded-lg text-sm font-semibold hover:bg-amber-400 cursor-pointer"
                  >
                    Approve &amp; Send Welcome Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setApproveOpen(false)}
                    className="text-sm text-stone-500 hover:text-stone-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Reject Panel */}
            {rejectOpen && (
              <form onSubmit={handleReject} className="border border-rose-200 rounded-lg p-4 space-y-3 bg-rose-50/40">
                <p className="text-xs font-semibold text-stone-700 mb-1">Reject Applicant</p>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">
                    Internal Rejection Note{" "}
                    <span className="text-stone-400 font-normal">— for admin records only</span>
                  </label>
                  <textarea
                    rows={2}
                    value={rejectNote}
                    onChange={(e) => setRejectNote(e.target.value)}
                    className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 resize-none bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">
                    Rejection Email Message{" "}
                    <span className="text-stone-400 font-normal">— optional</span>
                  </label>
                  <textarea
                    rows={4}
                    value={rejectEmail}
                    onChange={(e) => setRejectEmail(e.target.value)}
                    className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 resize-none bg-white"
                  />
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-500 cursor-pointer"
                  >
                    Reject Applicant
                  </button>
                  <button
                    type="button"
                    onClick={() => setRejectOpen(false)}
                    className="text-sm text-stone-500 hover:text-stone-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Already reviewed */}
        {applicant.status !== "pending" && (
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Review Record</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm mb-3">
              <div>
                <p className="text-xs text-stone-400 mb-0.5">Decision</p>
                <ApplicantStatusBadge status={applicant.status} />
              </div>
              {applicant.reviewedAt && (
                <div>
                  <p className="text-xs text-stone-400 mb-0.5">Reviewed</p>
                  <p className="text-stone-700 font-medium">{formatDate(applicant.reviewedAt)}</p>
                </div>
              )}
              {reviewer && (
                <div>
                  <p className="text-xs text-stone-400 mb-0.5">Reviewed By</p>
                  <p className="text-stone-700 font-medium">{reviewer.name}</p>
                </div>
              )}
            </div>
            {applicant.adminNotes && (
              <div className="mb-3">
                <p className="text-xs text-stone-400 mb-1">Admin Notes</p>
                <p className="text-sm text-stone-700 leading-relaxed">{applicant.adminNotes}</p>
              </div>
            )}
            {applicant.rejectionMessage && (
              <div>
                <p className="text-xs text-stone-400 mb-1">Rejection Message Sent</p>
                <p className="text-sm text-stone-600 leading-relaxed italic">&ldquo;{applicant.rejectionMessage}&rdquo;</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Applicants Tab ─────────────────────────────────────────

function ApplicantsTab() {
  const [selected, setSelected] = useState<Applicant | null>(null);

  function handleBack() {
    setSelected(null);
  }

  if (selected) {
    return (
      <ApplicantDetail
        applicant={selected}
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-stone-100">
        <h2 className="text-sm font-semibold text-stone-900">Applicants</h2>
        <p className="text-xs text-stone-500 mt-0.5">Click any row to review the full application</p>
      </div>
      <div className="divide-y divide-stone-100">
        {applicants.map((app) => (
          <button
            key={app.id}
            onClick={() => setSelected(app)}
            className="w-full px-5 py-3.5 flex items-center gap-4 text-left hover:bg-stone-50 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-500 text-xs font-semibold shrink-0">
              {app.firstName[0]}{app.lastName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-900 truncate">
                {app.firstName} {app.lastName}
              </p>
              <p className="text-xs text-stone-500 truncate">{app.email}</p>
            </div>
            <span className="hidden sm:block text-xs text-stone-500 shrink-0">{app.cityApplied}</span>
            <span className="hidden md:block text-xs text-stone-400 shrink-0">{ministryLabel(app.ministryType)}</span>
            <span className="hidden lg:block text-xs text-stone-400 shrink-0">{formatDate(app.submittedAt)}</span>
            <ApplicantStatusBadge status={app.status} />
            <svg className="w-4 h-4 text-stone-300 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────

export default function OnboardingPage() {
  const { currentUser } = useUser();
  const [activeTab, setActiveTab] = useState<"users" | "applicants">("users");

  if (!currentUser) return null;
  if (!hasAnyRole(currentUser, ["platform_owner", "admin"])) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl border border-stone-200 p-10 text-center">
            <p className="text-sm text-stone-500">You don&rsquo;t have permission to view this page.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        {/* Page header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">User Management &amp; Onboarding</h1>
          </div>
          <p className="text-sm text-stone-500">Invite users, manage pending invites, and review applicants</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-stone-100 rounded-lg p-1 w-fit">
          {(["users", "applicants"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium cursor-pointer transition-all ${
                activeTab === tab
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              {tab === "users" ? "Users" : "Applicants"}
            </button>
          ))}
        </div>

        {activeTab === "users" ? <UsersTab /> : <ApplicantsTab />}
      </div>
    </AppLayout>
  );
}
