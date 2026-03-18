"use client";

import { useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/AppLayout";
import { useUser } from "@/lib/UserContext";
import { hasAnyRole } from "@/lib/permissions";
import { cities, cohorts, orgs } from "@/lib/data";
import type { City, Cohort, Org } from "@/lib/types";

const inputCls =
  "w-full border border-stone-300 bg-white text-stone-900 placeholder-stone-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-500 transition-colors";
const selectCls =
  "w-full border border-stone-300 bg-white text-stone-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-500 cursor-pointer transition-colors";
const labelCls = "block text-xs font-medium text-stone-600 mb-1.5";

type Task = "city" | "cohort" | "affiliate";

export default function StructurePage() {
  const { currentUser } = useUser();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const [localCities, setLocalCities] = useState<City[]>(cities);
  const [localCohorts, setLocalCohorts] = useState<Cohort[]>(cohorts);
  const [localOrgs, setLocalOrgs] = useState<Org[]>(orgs);

  const [cityForm, setCityForm] = useState({ name: "", state: "" });
  const [cohortForm, setCohortForm] = useState({ cityId: "", name: "", season: "", isActive: true });
  const [affiliateForm, setAffiliateForm] = useState({ name: "", cityId: "" });

  const [success, setSuccess] = useState<string | null>(null);

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

  function flash(msg: string) {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3500);
  }

  function handleAddCity(e: React.FormEvent) {
    e.preventDefault();
    const newCity: City = {
      id: `city-${cityForm.name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
      name: cityForm.name,
      state: cityForm.state.toUpperCase(),
      leaderId: null,
      orgId: "org-linc",
    };
    setLocalCities([...localCities, newCity]);
    setCityForm({ name: "", state: "" });
    flash(`${newCity.name}, ${newCity.state} added.`);
  }

  function handleAddCohort(e: React.FormEvent) {
    e.preventDefault();
    const newCohort: Cohort = {
      id: `cohort-${cohortForm.cityId}-${Date.now()}`,
      name: cohortForm.name,
      cityId: cohortForm.cityId,
      season: cohortForm.season,
      isActive: cohortForm.isActive,
    };
    setLocalCohorts([...localCohorts, newCohort]);
    setCohortForm({ cityId: "", name: "", season: "", isActive: true });
    flash(`${newCohort.name} cohort added.`);
  }

  function handleAddAffiliate(e: React.FormEvent) {
    e.preventDefault();
    const autoSlug = affiliateForm.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const newOrg: Org = {
      id: `org-${autoSlug}-${Date.now()}`,
      name: affiliateForm.name,
      slug: autoSlug,
    };
    setLocalOrgs([...localOrgs, newOrg]);
    setAffiliateForm({ name: "", cityId: "" });
    flash(`${newOrg.name} added as an affiliate.`);
  }

  const tasks = [
    {
      id: "city" as Task,
      label: "Add a City",
      description: "Create a new city node on the platform",
      count: localCities.length,
      countLabel: "cities",
      icon: (
        <svg className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
        </svg>
      ),
      iconBg: "bg-violet-50 border-violet-200",
    },
    {
      id: "cohort" as Task,
      label: "Add a Cohort",
      description: "Create a cohort tied to a city and season",
      count: localCohorts.filter((c) => c.isActive).length,
      countLabel: "active cohorts",
      icon: (
        <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
        </svg>
      ),
      iconBg: "bg-amber-50 border-amber-200",
    },
    {
      id: "affiliate" as Task,
      label: "Add an Affiliate",
      description: "Register a new organization on the platform",
      count: localOrgs.length,
      countLabel: "affiliates",
      icon: (
        <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
        </svg>
      ),
      iconBg: "bg-teal-50 border-teal-200",
    },
  ];

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        {/* Back link when a task is active */}
        {activeTask ? (
          <button
            onClick={() => { setActiveTask(null); setSuccess(null); }}
            className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-700 mb-5 transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Cities, Cohorts &amp; Affiliates
          </button>
        ) : (
          <Link
            href="/platform-admin"
            className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-700 mb-5 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Platform Admin
          </Link>
        )}

        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-stone-900 tracking-tight mb-1">
            {activeTask === "city" && "Add a City"}
            {activeTask === "cohort" && "Add a Cohort"}
            {activeTask === "affiliate" && "Add an Affiliate"}
            {!activeTask && "Cities, Cohorts & Affiliates"}
          </h1>
          <p className="text-sm text-stone-500">
            {activeTask === "city" && "Create a new city node on the platform."}
            {activeTask === "cohort" && "Cohorts are tied to a city and a season."}
            {activeTask === "affiliate" && "Register an organization. An affiliate must exist before a Director can be assigned."}
            {!activeTask && "Add and manage cities, cohorts, and affiliate organizations."}
          </p>
        </div>

        {/* Success banner */}
        {success && (
          <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 mb-5">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            {success}
          </div>
        )}

        {/* Task picker */}
        {!activeTask && (
          <div className="space-y-3">
            {tasks.map((task) => (
              <button
                key={task.id}
                onClick={() => setActiveTask(task.id)}
                className="w-full bg-white rounded-xl border border-stone-200 p-5 text-left hover:border-stone-300 hover:shadow-sm transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 ${task.iconBg}`}>
                    {task.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-stone-900">{task.label}</p>
                    <p className="text-xs text-stone-500 mt-0.5">{task.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-semibold text-stone-900">{task.count}</p>
                    <p className="text-xs text-stone-500">{task.countLabel}</p>
                  </div>
                  <svg className="w-4 h-4 text-stone-400 group-hover:text-amber-500 shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Add City form */}
        {activeTask === "city" && (
          <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-4">
            <form onSubmit={handleAddCity} className="space-y-4">
              <div>
                <label className={labelCls}>City Name</label>
                <input type="text" value={cityForm.name} onChange={(e) => setCityForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Houston" className={inputCls} required />
              </div>
              <div>
                <label className={labelCls}>State</label>
                <input type="text" value={cityForm.state} onChange={(e) => setCityForm((f) => ({ ...f, state: e.target.value }))} placeholder="TX" maxLength={2} className={inputCls} required />
              </div>
              <button type="submit" className="w-full py-2.5 bg-amber-500 text-stone-900 rounded-lg text-sm font-semibold hover:bg-amber-400 transition-colors cursor-pointer">
                Add City
              </button>
            </form>
            {localCities.length > 0 && (
              <div className="pt-4 border-t border-stone-100">
                <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-3">All Cities</p>
                <ul className="space-y-1.5">
                  {localCities.map((c) => (
                    <li key={c.id} className="text-sm text-stone-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-300 shrink-0" />
                      {c.name}, {c.state}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Add Cohort form */}
        {activeTask === "cohort" && (
          <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-4">
            <form onSubmit={handleAddCohort} className="space-y-4">
              <div>
                <label className={labelCls}>City</label>
                <select value={cohortForm.cityId} onChange={(e) => setCohortForm((f) => ({ ...f, cityId: e.target.value }))} className={selectCls} required>
                  <option value="">Select city…</option>
                  {localCities.map((c) => <option key={c.id} value={c.id}>{c.name}, {c.state}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Cohort Name</label>
                <input type="text" value={cohortForm.name} onChange={(e) => setCohortForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Chicago Spring 2026" className={inputCls} required />
              </div>
              <div>
                <label className={labelCls}>Season</label>
                <input type="text" value={cohortForm.season} onChange={(e) => setCohortForm((f) => ({ ...f, season: e.target.value }))} placeholder="e.g. Spring 2026" className={inputCls} required />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCohortForm((f) => ({ ...f, isActive: !f.isActive }))}
                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors cursor-pointer ${cohortForm.isActive ? "bg-amber-500" : "bg-stone-300"}`}
                  role="switch"
                  aria-checked={cohortForm.isActive}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${cohortForm.isActive ? "translate-x-4" : "translate-x-0.5"}`} />
                </button>
                <span className="text-xs text-stone-600">Active cohort</span>
              </div>
              <button type="submit" className="w-full py-2.5 bg-amber-500 text-stone-900 rounded-lg text-sm font-semibold hover:bg-amber-400 transition-colors cursor-pointer">
                Add Cohort
              </button>
            </form>
            {localCohorts.length > 0 && (
              <div className="pt-4 border-t border-stone-100">
                <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-3">All Cohorts</p>
                <ul className="space-y-1.5">
                  {localCohorts.map((c) => {
                    const city = localCities.find((ci) => ci.id === c.cityId);
                    return (
                      <li key={c.id} className="text-sm text-stone-600 flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.isActive ? "bg-amber-400" : "bg-stone-300"}`} />
                        {c.name}{city ? <span className="text-stone-400">· {city.name}</span> : null}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Add Affiliate form */}
        {activeTask === "affiliate" && (
          <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-4">
            <form onSubmit={handleAddAffiliate} className="space-y-4">
              <div>
                <label className={labelCls}>Affiliate Name</label>
                <input type="text" value={affiliateForm.name} onChange={(e) => setAffiliateForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Grace Church Dallas" className={inputCls} required />
              </div>
              <div>
                <label className={labelCls}>Primary City <span className="font-normal text-stone-400">(optional)</span></label>
                <select value={affiliateForm.cityId} onChange={(e) => setAffiliateForm((f) => ({ ...f, cityId: e.target.value }))} className={selectCls}>
                  <option value="">No city association</option>
                  {localCities.map((c) => <option key={c.id} value={c.id}>{c.name}, {c.state}</option>)}
                </select>
              </div>
              <button type="submit" className="w-full py-2.5 bg-amber-500 text-stone-900 rounded-lg text-sm font-semibold hover:bg-amber-400 transition-colors cursor-pointer">
                Add Affiliate
              </button>
            </form>
            {localOrgs.length > 0 && (
              <div className="pt-4 border-t border-stone-100">
                <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-3">All Affiliates</p>
                <ul className="space-y-1.5">
                  {localOrgs.map((o) => (
                    <li key={o.id} className="text-sm text-stone-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-300 shrink-0" />
                      {o.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
