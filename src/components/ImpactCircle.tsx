"use client";

interface ImpactCircleProps {
  label: string;
  value: number;
  type: "social" | "spiritual" | "economic";
  size?: "sm" | "md" | "lg";
}

const colorMap = {
  social: {
    ring: "border-teal-400",
    bg: "bg-teal-50",
    text: "text-teal-700",
    label: "text-teal-600",
  },
  spiritual: {
    ring: "border-violet-400",
    bg: "bg-violet-50",
    text: "text-violet-700",
    label: "text-violet-600",
  },
  economic: {
    ring: "border-amber-400",
    bg: "bg-amber-50",
    text: "text-amber-700",
    label: "text-amber-600",
  },
};

const sizeMap = {
  sm: { container: "w-20 h-20", text: "text-lg", label: "text-[10px]" },
  md: { container: "w-28 h-28", text: "text-2xl", label: "text-xs" },
  lg: { container: "w-36 h-36", text: "text-3xl", label: "text-sm" },
};

export function ImpactCircle({ label, value, type, size = "md" }: ImpactCircleProps) {
  const colors = colorMap[type];
  const sizes = sizeMap[size];

  const formatValue = (v: number) => {
    if (type === "economic") {
      return v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`;
    }
    return v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toString();
  };

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={`${sizes.container} ${colors.bg} ${colors.ring} border-2 rounded-full flex flex-col items-center justify-center`}
      >
        <span className={`${sizes.text} ${colors.text} font-semibold leading-none`}>
          {formatValue(value)}
        </span>
      </div>
      <span className={`${sizes.label} ${colors.label} font-medium uppercase tracking-wider`}>
        {label}
      </span>
    </div>
  );
}
