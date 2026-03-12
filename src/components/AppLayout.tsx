"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/lib/UserContext";
import { getNavItems, shouldShowSwitcher, getSwitcherOptions } from "@/lib/permissions";
import { orgs } from "@/lib/data";
import { NavIcon } from "./NavIcon";
import { RoleBadge } from "./RoleBadge";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, activeContext, setActiveContext, clearUser } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);

  function closeMenus() {
    setSidebarOpen(false);
    setSwitcherOpen(false);
  }

  useEffect(() => {
    if (!currentUser && pathname !== "/") {
      router.push("/");
    }
  }, [currentUser, pathname, router]);

  if (!currentUser) return null;

  const navItems = getNavItems(currentUser);
  const uniqueRoles = [...new Set(currentUser.roles.map((r) => r.role))];
  const showSwitcher = shouldShowSwitcher(currentUser);
  const switcherOptions = showSwitcher ? getSwitcherOptions(currentUser) : [];

  // Current context display info
  const activeOrgName =
    activeContext?.type === "platform"
      ? "All Organizations"
      : activeContext?.type === "affiliate"
        ? orgs.find((o) => o.id === activeContext.affiliateId)?.name ?? "Unknown"
        : "—";
  const activeOrgLetter =
    activeContext?.type === "platform"
      ? "P"
      : activeContext?.type === "affiliate"
        ? (orgs.find((o) => o.id === activeContext.affiliateId)?.name ?? "?")[0]
        : "?";

  return (
    <div className="flex h-screen overflow-hidden bg-stone-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[260px] bg-stone-900 text-stone-300 flex flex-col transform transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo area */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-stone-800 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
            <span className="text-stone-900 font-bold text-sm">I3</span>
          </div>
          <span className="text-base font-semibold text-stone-100 tracking-tight">
            Impact360
          </span>
        </div>

        {/* Context switcher — only for multi-org/platform users */}
        {showSwitcher && (
          <div className="px-3 py-3 border-b border-stone-800">
            <button
              onClick={() => setSwitcherOpen(!switcherOpen)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-stone-800/60 text-left cursor-pointer transition-colors"
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                activeContext?.type === "platform"
                  ? "bg-stone-700 text-stone-300"
                  : "bg-amber-500/20 text-amber-400"
              }`}>
                {activeOrgLetter}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-200 truncate">{activeOrgName}</p>
              </div>
              <svg
                className={`w-4 h-4 text-stone-500 shrink-0 transition-transform duration-150 ${switcherOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            {/* Dropdown */}
            {switcherOpen && (
              <div className="mt-1 bg-stone-800 rounded-lg border border-stone-700 overflow-hidden">
                {switcherOptions.map((option) => {
                  const isAffiliate = option.type === "affiliate";
                  const key = isAffiliate ? option.affiliate.id : "platform";
                  const label = isAffiliate ? option.affiliate.name : "All Organizations";
                  const letter = isAffiliate ? option.affiliate.name[0] : "P";
                  const isActive = activeContext?.type === option.type && (
                    option.type === "platform" ||
                    (option.type === "affiliate" && activeContext.type === "affiliate" && activeContext.affiliateId === option.affiliate.id)
                  );

                  // Show divider before "Platform View"
                  const showDivider = !isAffiliate;

                  return (
                    <div key={key}>
                      {showDivider && (
                        <div className="border-t border-stone-700 my-1" />
                      )}
                      <button
                        onClick={() => {
                          if (isAffiliate) {
                            setActiveContext({ type: "affiliate", affiliateId: option.affiliate.id });
                          } else {
                            setActiveContext({ type: "platform" });
                          }
                          closeMenus();
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm cursor-pointer transition-colors ${
                          isActive
                            ? "bg-stone-700/60 text-stone-100"
                            : "text-stone-300 hover:bg-stone-700/40 hover:text-stone-100"
                        }`}
                      >
                        <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          isAffiliate
                            ? "bg-amber-500/15 text-amber-400"
                            : "bg-stone-600 text-stone-300"
                        }`}>
                          {letter}
                        </div>
                        <span className="flex-1 truncate">{label}</span>
                        {isActive && (
                          <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const isAddImpact = item.icon === "add-impact";

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenus}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                  isActive
                    ? "bg-stone-800 text-stone-100"
                    : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/60"
                } ${isAddImpact ? "mt-1 mb-1" : ""}`}
              >
                <span className={`${isActive ? "text-amber-400" : "text-stone-500 group-hover:text-stone-400"}`}>
                  <NavIcon name={item.icon} />
                </span>
                <span>{item.label}</span>
                {isAddImpact && (
                  <span className="ml-auto w-5 h-5 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs">
                    +
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section at bottom */}
        <div className="border-t border-stone-800 p-4 shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-stone-700 flex items-center justify-center text-stone-300 text-sm font-semibold shrink-0">
              {currentUser.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-stone-200 truncate">{currentUser.name}</p>
              <p className="text-xs text-stone-500 truncate">{currentUser.email}</p>
            </div>
          </div>
          <button
            onClick={() => {
              clearUser();
              router.push("/");
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-stone-700 text-stone-400 text-xs font-medium hover:border-stone-600 hover:text-stone-300 hover:bg-stone-800/50 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
            Switch Persona
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-stone-200 flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg text-stone-500 hover:text-stone-700 hover:bg-stone-100"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-stone-900">{currentUser.name}</span>
              <div className="flex gap-1">
                {uniqueRoles.map((role) => (
                  <RoleBadge key={role} role={role} />
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeContext && showSwitcher && (
              <span className="hidden sm:inline text-xs text-stone-500 font-medium bg-stone-100 px-2.5 py-1 rounded-full">
                Viewing: {activeOrgName}
              </span>
            )}
            <span className="hidden sm:inline text-xs text-stone-400 font-medium bg-stone-100 px-2.5 py-1 rounded-full">
              Prototype Mode
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
