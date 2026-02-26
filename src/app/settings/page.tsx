"use client";

import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useUser } from "@/lib/UserContext";
import { hasRole, hasAnyRole } from "@/lib/permissions";

interface Tab {
  id: string;
  label: string;
  condition: boolean;
}

export default function SettingsPage() {
  const { currentUser } = useUser();
  const [activeTab, setActiveTab] = useState("account");

  if (!currentUser) return null;

  const tabs: Tab[] = [
    { id: "account", label: "Account", condition: true },
    { id: "venture", label: "Venture", condition: hasRole(currentUser, "venture_leader") },
    { id: "notifications", label: "Notifications", condition: true },
    { id: "network", label: "Network Visibility", condition: hasRole(currentUser, "venture_leader") },
    { id: "impact-metrics", label: "Impact Metrics", condition: hasRole(currentUser, "coach") },
    { id: "city-admin", label: "City Admin", condition: hasRole(currentUser, "city_leader") },
    { id: "org-admin", label: "Org Admin", condition: hasAnyRole(currentUser, ["ceo", "platform_owner"]) },
    { id: "user-mgmt", label: "User Management", condition: hasAnyRole(currentUser, ["ceo", "platform_owner"]) },
    { id: "platform", label: "Platform Admin", condition: hasRole(currentUser, "platform_owner") },
  ].filter((t) => t.condition);

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">Settings</h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-5">
        {/* Tab nav */}
        <div className="sm:w-48 shrink-0">
          <nav className="flex sm:flex-col gap-1 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium text-left whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-stone-900 text-stone-100"
                    : "text-stone-500 hover:text-stone-700 hover:bg-stone-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        <div className="flex-1 bg-white rounded-xl border border-stone-200 p-6 min-h-[300px]">
          <h2 className="text-lg font-semibold text-stone-900 mb-1">
            {tabs.find((t) => t.id === activeTab)?.label}
          </h2>
          <p className="text-sm text-stone-400 mb-6">
            {activeTab === "account" && "Manage your personal information and preferences."}
            {activeTab === "venture" && "Configure your venture settings and details."}
            {activeTab === "notifications" && "Control what notifications you receive."}
            {activeTab === "network" && "Manage how your venture appears on the network."}
            {activeTab === "impact-metrics" && "Configure impact metrics for your ventures."}
            {activeTab === "city-admin" && "Manage coaches, ventures, and settings for your city."}
            {activeTab === "org-admin" && "Organization-level configuration and management."}
            {activeTab === "user-mgmt" && "Invite users, manage roles, and access permissions."}
            {activeTab === "platform" && "Platform-wide configuration for all affiliates."}
          </p>

          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-stone-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </div>
            <p className="text-sm text-stone-400 font-medium">Settings will be available in MVP 1</p>
            <p className="text-xs text-stone-300 mt-0.5">For now, this shows which settings your role has access to.</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
