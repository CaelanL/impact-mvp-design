"use client";

import type { Role } from "@/lib/types";
import { getRoleLabel } from "@/lib/permissions";

interface RoleBadgeProps {
  role: Role;
  size?: "sm" | "md";
}

const roleColors: Record<Role, string> = {
  venture_leader: "bg-teal-500/10 text-teal-700 border-teal-500/25",
  coach: "bg-amber-500/10 text-amber-700 border-amber-500/25",
  city_leader: "bg-violet-500/10 text-violet-700 border-violet-500/25",
  ceo: "bg-rose-500/10 text-rose-700 border-rose-500/25",
  platform_owner: "bg-stone-800 text-stone-100 border-stone-700",
};

export function RoleBadge({ role, size = "sm" }: RoleBadgeProps) {
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span className={`inline-flex items-center font-semibold rounded-full border ${roleColors[role]} ${sizeClasses} tracking-wide uppercase`}>
      {getRoleLabel(role)}
    </span>
  );
}
