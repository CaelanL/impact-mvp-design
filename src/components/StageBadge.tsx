"use client";

import type { VentureStage } from "@/lib/types";
import { getStageLabel } from "@/lib/permissions";

interface StageBadgeProps {
  stage: VentureStage;
}

const stageColors: Record<VentureStage, string> = {
  accelerate: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  build: "bg-teal-500/10 text-teal-700 border-teal-500/20",
  scale: "bg-violet-500/10 text-violet-700 border-violet-500/20",
  multiply: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
};

export function StageBadge({ stage }: StageBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full border ${stageColors[stage]}`}>
      {getStageLabel(stage)}
    </span>
  );
}
