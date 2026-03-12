"use client";

import { AppLayout } from "@/components/AppLayout";
import { useUser } from "@/lib/UserContext";
import { getUserVenture, hasRole } from "@/lib/permissions";

const stages = ["Accelerate", "Build", "Scale", "Multiply"];

const placeholderDocs = [
  { name: "Venture Blueprint", type: "PDF", updated: "Feb 10, 2026" },
  { name: "Builder Roadmap", type: "PDF", updated: "Jan 22, 2026" },
  { name: "Impact Measurement Guide", type: "PDF", updated: "Dec 15, 2025" },
  { name: "Coach Meeting Template", type: "Document", updated: "Feb 1, 2026" },
];

const placeholderReminders = [
  { from: "James Carter (Coach)", content: "Submit February impact data by March 5th", date: "Feb 20" },
  { from: "Sarah Mitchell (Director)", content: "Quarterly review meeting scheduled for March 10", date: "Feb 18" },
  { from: "System", content: "Builder milestone: complete financial plan document", date: "Feb 15" },
];

export default function TrainingPage() {
  const { currentUser } = useUser();
  if (!currentUser) return null;

  const venture = getUserVenture(currentUser);
  const isCoach = hasRole(currentUser, "coach");
  const currentStage = venture?.stage || "accelerate";
  const stageIndex = stages.findIndex((s) => s.toLowerCase() === currentStage);

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">Training</h1>
          <p className="text-sm text-stone-500 mt-1">
            {venture ? `${venture.name} — Your training path and resources` : "Venture training resources"}
          </p>
        </div>

        {/* Program track */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 mb-5">
          <h2 className="text-sm font-semibold text-stone-900 mb-5">Training Path</h2>
          <div className="flex items-center gap-1 mb-2">
            {stages.map((stage, i) => (
              <div key={stage} className="flex-1 flex flex-col items-center">
                <div className={`w-full h-2 rounded-full ${
                  i <= stageIndex ? "bg-amber-400" : "bg-stone-100"
                } ${i === 0 ? "rounded-r-none" : i === stages.length - 1 ? "rounded-l-none" : "rounded-none"}`} />
                <span className={`text-xs mt-2 font-medium ${
                  i <= stageIndex ? "text-amber-600" : "text-stone-400"
                } ${i === stageIndex ? "font-semibold" : ""}`}>
                  {stage}
                </span>
                {i === stageIndex && (
                  <span className="text-[10px] text-amber-500 mt-0.5">Current</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-stone-900">
              {isCoach ? "Venture Documents" : "My Documents"}
            </h2>
            {isCoach && (
              <button className="text-xs font-medium text-amber-600 hover:text-amber-700 cursor-pointer">
                + Upload Document
              </button>
            )}
          </div>
          <div className="space-y-2">
            {placeholderDocs.map((doc) => (
              <div key={doc.name} className="flex items-center gap-3 p-3 rounded-lg border border-stone-100 hover:border-stone-200 hover:bg-stone-50 cursor-pointer group">
                <div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center text-stone-400 shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-700 group-hover:text-stone-900">{doc.name}</p>
                  <p className="text-xs text-stone-400">{doc.type} &middot; Updated {doc.updated}</p>
                </div>
                <svg className="w-4 h-4 text-stone-300 group-hover:text-stone-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            ))}
          </div>
        </div>

        {/* Actions & Reminders */}
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <h2 className="text-sm font-semibold text-stone-900 mb-4">Actions &amp; Reminders</h2>
          <div className="space-y-2">
            {placeholderReminders.map((reminder, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-lg bg-stone-50 border border-stone-100">
                <div className="w-1 rounded-full bg-amber-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-stone-700">{reminder.content}</p>
                  <p className="text-xs text-stone-400 mt-0.5">From {reminder.from} &middot; {reminder.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
