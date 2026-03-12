"use client";

import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useUser } from "@/lib/UserContext";
import { getVisibleVentures, hasAnyRole } from "@/lib/permissions";
import { cities } from "@/lib/data";

export default function ReportsPage() {
  const { currentUser, activeContext } = useUser();
  const [selectedVenture, setSelectedVenture] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [dateRange, setDateRange] = useState("1month");
  const [showReport, setShowReport] = useState(false);

  if (!currentUser) return null;

  const visibleVentures = getVisibleVentures(currentUser, activeContext ?? undefined);
  const canFilterByCity = hasAnyRole(currentUser, ["city_leader", "director", "platform_owner", "admin"]);

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">Reports</h1>
          <p className="text-sm text-stone-500 mt-1">Generate impact reports for your ventures</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 mb-5 space-y-4">
          <h2 className="text-sm font-semibold text-stone-900">Report Options</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-stone-500 mb-1.5 block">Venture</label>
              <select
                value={selectedVenture}
                onChange={(e) => setSelectedVenture(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 bg-white text-stone-700"
              >
                <option value="all">All ventures ({visibleVentures.length})</option>
                {visibleVentures.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>

            {canFilterByCity && (
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1.5 block">City</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 bg-white text-stone-700"
                >
                  <option value="all">All cities</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}, {c.state}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-stone-500 mb-1.5 block">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 bg-white text-stone-700"
              >
                <option value="1month">Last Month</option>
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last Year</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-stone-500 mb-1.5 block">Format</label>
              <select
                className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 bg-white text-stone-700"
              >
                <option>1-Page Summary (PDF)</option>
                <option>Detailed Report (PDF)</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => setShowReport(true)}
            className="w-full sm:w-auto px-6 py-2.5 bg-amber-500 text-stone-900 rounded-lg text-sm font-semibold hover:bg-amber-400 cursor-pointer"
          >
            Generate Report
          </button>
        </div>

        {/* Report preview */}
        {showReport ? (
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-stone-900">Report Preview</h2>
              <div className="flex gap-2">
                <button className="text-xs text-stone-500 hover:text-stone-700 font-medium cursor-pointer">Download PDF</button>
                <span className="text-stone-300">|</span>
                <button className="text-xs text-stone-500 hover:text-stone-700 font-medium cursor-pointer">Share</button>
              </div>
            </div>
            <div className="p-8">
              <div className="max-w-lg mx-auto">
                <div className="text-center mb-8">
                  <h3 className="font-[family-name:var(--font-instrument-serif)] text-2xl text-stone-900 mb-1">Impact Report</h3>
                  <p className="text-sm text-stone-500">
                    {selectedVenture === "all" ? "All Ventures" : visibleVentures.find(v => v.id === selectedVenture)?.name}
                    {" "}&middot; {dateRange === "1month" ? "February 2026" : dateRange === "3months" ? "Dec 2025 - Feb 2026" : dateRange === "6months" ? "Sep 2025 - Feb 2026" : "Mar 2025 - Feb 2026"}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="text-center p-4 bg-teal-50 rounded-xl border border-teal-100">
                    <div className="text-2xl font-bold text-teal-700">1,695</div>
                    <div className="text-xs text-teal-600 mt-0.5">Social Impact</div>
                  </div>
                  <div className="text-center p-4 bg-violet-50 rounded-xl border border-violet-100">
                    <div className="text-2xl font-bold text-violet-700">400</div>
                    <div className="text-xs text-violet-600 mt-0.5">Spiritual Impact</div>
                  </div>
                  <div className="text-center p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <div className="text-2xl font-bold text-amber-700">$14.1k</div>
                    <div className="text-xs text-amber-600 mt-0.5">Economic Impact</div>
                  </div>
                </div>

                <div className="border-t border-stone-100 pt-6 text-center">
                  <p className="text-xs text-stone-400">
                    Generated by Impact360 &middot; {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
            <svg className="w-12 h-12 text-stone-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
            </svg>
            <p className="text-sm text-stone-500 font-medium">Choose your options above, then generate a report</p>
            <p className="text-xs text-stone-400 mt-1">Reports will appear here as a preview</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
