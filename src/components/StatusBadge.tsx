"use client";

import { getCheckInStatus } from "@/lib/permissions";

interface StatusBadgeProps {
  lastSubmission: string | null;
}

const statusConfig = {
  submitted: { label: "Up to date", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  overdue: { label: "Overdue", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  way_overdue: { label: "Way overdue", className: "bg-rose-500/10 text-rose-600 border-rose-500/20" },
  not_started: { label: "No data yet", className: "bg-stone-100 text-stone-500 border-stone-200" },
};

export function StatusBadge({ lastSubmission }: StatusBadgeProps) {
  const status = getCheckInStatus(lastSubmission);
  const config = statusConfig[status];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${config.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        status === "submitted" ? "bg-emerald-500" :
        status === "overdue" ? "bg-amber-500" :
        status === "way_overdue" ? "bg-rose-500" :
        "bg-stone-400"
      }`} />
      {config.label}
    </span>
  );
}
