"use client";

import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useUser } from "@/lib/UserContext";
import { getUserVenture } from "@/lib/permissions";
import { metricOptions } from "@/lib/data";
import { StageBadge } from "@/components/StageBadge";

type Bucket = "social" | "spiritual" | "economic";

const bucketConfig: Record<Bucket, { label: string; color: string; activeColor: string; borderColor: string }> = {
  social: { label: "Social", color: "text-teal-600", activeColor: "bg-teal-500 text-white", borderColor: "border-teal-200" },
  spiritual: { label: "Spiritual", color: "text-violet-600", activeColor: "bg-violet-500 text-white", borderColor: "border-violet-200" },
  economic: { label: "Economic", color: "text-amber-600", activeColor: "bg-amber-500 text-stone-900", borderColor: "border-amber-200" },
};

export default function AddImpactPage() {
  const { currentUser } = useUser();
  const [activeBucket, setActiveBucket] = useState<Bucket>("social");
  const [selectedMetrics, setSelectedMetrics] = useState<Record<string, boolean>>({});
  const [metricValues, setMetricValues] = useState<Record<string, number>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [showReview, setShowReview] = useState(false);

  if (!currentUser) return null;

  const venture = getUserVenture(currentUser);
  if (!venture) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <p className="text-stone-500">You don&apos;t have a venture to report for.</p>
        </div>
      </AppLayout>
    );
  }

  const now = new Date();
  const currentMonth = now.toLocaleString("en-US", { month: "long", year: "numeric" });

  const handleToggleMetric = (metric: string) => {
    setSelectedMetrics((prev) => ({ ...prev, [metric]: !prev[metric] }));
  };

  const handleValueChange = (metric: string, value: string) => {
    setMetricValues((prev) => ({ ...prev, [metric]: parseInt(value) || 0 }));
  };

  const handleSubmit = () => {
    setShowReview(false);
    setShowSuccess(true);
    // Save to localStorage
    const existing = JSON.parse(localStorage.getItem("impact360_submissions") || "[]");
    const entries = Object.entries(selectedMetrics)
      .filter(([, selected]) => selected)
      .map(([metric]) => ({
        ventureId: venture.id,
        month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
        bucket: activeBucket,
        metric,
        value: metricValues[metric] || 0,
      }));
    localStorage.setItem("impact360_submissions", JSON.stringify([...existing, ...entries]));
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const selectedCount = Object.values(selectedMetrics).filter(Boolean).length;
  const bucket = bucketConfig[activeBucket];

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">Add Impact</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-stone-500">{venture.name}</span>
            <StageBadge stage={venture.stage} />
          </div>
        </div>

        {/* Month selector */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 mb-4">
          <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Reporting Period</label>
          <div className="mt-2 flex items-center gap-2">
            <div className="px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm font-medium text-stone-700">
              {currentMonth}
            </div>
            <span className="text-xs text-stone-400">Current period</span>
          </div>
        </div>

        {/* Bucket tabs */}
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden mb-4">
          <div className="flex border-b border-stone-100">
            {(Object.keys(bucketConfig) as Bucket[]).map((b) => {
              const config = bucketConfig[b];
              const isActive = activeBucket === b;
              return (
                <button
                  key={b}
                  onClick={() => setActiveBucket(b)}
                  className={`flex-1 px-4 py-3.5 text-sm font-semibold text-center cursor-pointer ${
                    isActive
                      ? `${config.color} border-b-2 ${config.borderColor} bg-white`
                      : "text-stone-400 hover:text-stone-600 bg-stone-50/50"
                  }`}
                >
                  {config.label}
                </button>
              );
            })}
          </div>

          <div className="p-5">
            <p className="text-xs text-stone-400 mb-4">Select the metrics you want to report and enter values.</p>
            <div className="space-y-2">
              {metricOptions[activeBucket].map((metric) => {
                const isSelected = selectedMetrics[metric];
                return (
                  <div
                    key={metric}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${
                      isSelected ? `${bucket.borderColor} bg-stone-50` : "border-stone-100 hover:border-stone-200"
                    }`}
                    onClick={() => handleToggleMetric(metric)}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                      isSelected ? `${bucket.activeColor} border-transparent` : "border-stone-300"
                    }`}>
                      {isSelected && (
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm flex-1 ${isSelected ? "text-stone-800 font-medium" : "text-stone-600"}`}>
                      {metric}
                    </span>
                    {isSelected && (
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={metricValues[metric] || ""}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleValueChange(metric, e.target.value)}
                        className="w-24 px-3 py-1.5 text-sm text-right border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Stewardship section */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 mb-6">
          <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
            Stewardship <span className="text-stone-300">(Optional)</span>
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-stone-500 mb-1 block">$ Raised</label>
              <input
                type="number"
                placeholder="0.00"
                className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-xs text-stone-500 mb-1 block">$ Spent</label>
              <input
                type="number"
                placeholder="0.00"
                className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={() => selectedCount > 0 && setShowReview(true)}
          disabled={selectedCount === 0}
          className={`w-full py-3.5 rounded-xl text-sm font-semibold cursor-pointer ${
            selectedCount > 0
              ? "bg-amber-500 text-stone-900 hover:bg-amber-400 shadow-sm"
              : "bg-stone-100 text-stone-400 cursor-not-allowed"
          }`}
        >
          Review &amp; Submit ({selectedCount} metric{selectedCount !== 1 ? "s" : ""})
        </button>

        {/* Review modal */}
        {showReview && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <h3 className="text-lg font-semibold text-stone-900 mb-1">Review Submission</h3>
              <p className="text-xs text-stone-500 mb-4">{venture.name} &middot; {currentMonth}</p>
              <div className="space-y-2 mb-5">
                {Object.entries(selectedMetrics)
                  .filter(([, selected]) => selected)
                  .map(([metric]) => (
                    <div key={metric} className="flex items-center justify-between text-sm">
                      <span className="text-stone-600">{metric}</span>
                      <span className="font-semibold text-stone-900">{metricValues[metric] || 0}</span>
                    </div>
                  ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowReview(false)}
                  className="flex-1 py-2.5 border border-stone-200 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-50 cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-2.5 bg-amber-500 rounded-lg text-sm font-semibold text-stone-900 hover:bg-amber-400 cursor-pointer"
                >
                  Confirm &amp; Submit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success toast */}
        {showSuccess && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-stone-900 text-stone-100 px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 z-50">
            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <span className="text-sm font-medium">Impact submitted! Keep it up.</span>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
