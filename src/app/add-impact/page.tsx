"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useUser } from "@/lib/UserContext";
import {
  addMonths,
  entryIntersectsRange,
  entryOccursOnDate,
  formatMonthLabel,
  formatShortDate,
  getMonthGrid,
  getRangeLength,
  getWeekdayLabels,
  isSameMonth,
  isToday,
  normalizeRange,
  toISODate,
} from "@/lib/impact-calendar";
import { metricOptions } from "@/lib/data";
import { getUserVenture } from "@/lib/permissions";
import {
  deleteImpactEntry,
  listImpactEntriesForVenture,
  listMetricOptionsForVenture,
  saveCustomMetricPreset,
  saveImpactEntry,
} from "@/lib/impact-store";
import {
  ImpactCategory,
  ImpactEntry,
  ImpactValueType,
} from "@/lib/types";

const MAX_VISIBLE_WEEK_LANES = 2;

const categoryConfig: Record<
  ImpactCategory,
  {
    label: string;
    accent: string;
    pill: string;
    chip: string;
    soft: string;
    text: string;
  }
> = {
  social: {
    label: "Social",
    accent: "bg-teal-500",
    pill: "border-teal-200 bg-teal-500/15 text-teal-900",
    chip: "border-teal-200 bg-teal-50 text-teal-700",
    soft: "bg-teal-500/8",
    text: "text-teal-700",
  },
  spiritual: {
    label: "Spiritual",
    accent: "bg-violet-500",
    pill: "border-violet-200 bg-violet-500/15 text-violet-900",
    chip: "border-violet-200 bg-violet-50 text-violet-700",
    soft: "bg-violet-500/8",
    text: "text-violet-700",
  },
  economic: {
    label: "Economic",
    accent: "bg-amber-500",
    pill: "border-amber-200 bg-amber-500/15 text-amber-950",
    chip: "border-amber-200 bg-amber-50 text-amber-700",
    soft: "bg-amber-500/10",
    text: "text-amber-700",
  },
};

interface ComposerDraft {
  category: ImpactCategory;
  metricMode: "preset" | "custom";
  selectedMetricId: string;
  customMetricLabel: string;
  customValueType: ImpactValueType;
  value: string;
  story: string;
}

interface WeekSegment {
  entry: ImpactEntry;
  lane: number;
  startCol: number;
  endCol: number;
}

function getTodayDate() {
  return toISODate(new Date());
}

function getInitialRange() {
  const today = getTodayDate();
  return { startDate: today, endDate: today };
}

function createInitialDraft(category: ImpactCategory = "social"): ComposerDraft {
  return {
    category,
    metricMode: "preset",
    selectedMetricId: "",
    customMetricLabel: "",
    customValueType: category === "economic" ? "currency" : "count",
    value: "",
    story: "",
  };
}

function slugifyMetricLabel(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatImpactValue(value: number, valueType: ImpactValueType) {
  if (valueType === "currency") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
    }).format(value);
  }

  return new Intl.NumberFormat("en-US").format(value);
}

function formatImpactRange(entry: Pick<ImpactEntry, "startDate" | "endDate">) {
  if (entry.startDate === entry.endDate) {
    return formatShortDate(entry.startDate);
  }

  return `${formatShortDate(entry.startDate)} to ${formatShortDate(entry.endDate)}`;
}

function buildWeekLayout(week: Date[], entries: ImpactEntry[]) {
  const weekDates = week.map((day) => toISODate(day));
  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];

  const segments = entries
    .filter((entry) => entryIntersectsRange(entry, weekStart, weekEnd))
    .map((entry) => {
      const startDate = entry.startDate > weekStart ? entry.startDate : weekStart;
      const endDate = entry.endDate < weekEnd ? entry.endDate : weekEnd;
      const startCol = weekDates.findIndex((date) => date === startDate) + 1;
      const endCol = weekDates.findIndex((date) => date === endDate) + 1;

      return { entry, startCol, endCol };
    })
    .sort((left, right) => {
      if (left.startCol !== right.startCol) {
        return left.startCol - right.startCol;
      }

      if (left.endCol !== right.endCol) {
        return right.endCol - left.endCol;
      }

      return left.entry.metricLabel.localeCompare(right.entry.metricLabel);
    });

  const laneEndColumns: number[] = [];
  const laidOutSegments: WeekSegment[] = segments.map((segment) => {
    let lane = 0;

    while (laneEndColumns[lane] !== undefined && segment.startCol <= laneEndColumns[lane]) {
      lane += 1;
    }

    laneEndColumns[lane] = segment.endCol;

    return {
      entry: segment.entry,
      lane,
      startCol: segment.startCol,
      endCol: segment.endCol,
    };
  });

  const visibleSegments = laidOutSegments.filter((segment) => segment.lane < MAX_VISIBLE_WEEK_LANES);
  const hiddenCounts = Object.fromEntries(
    weekDates.map((date, index) => {
      const column = index + 1;
      const total = laidOutSegments.filter(
        (segment) => segment.startCol <= column && segment.endCol >= column,
      ).length;
      const visible = visibleSegments.filter(
        (segment) => segment.startCol <= column && segment.endCol >= column,
      ).length;

      return [date, Math.max(0, total - visible)];
    }),
  ) as Record<string, number>;

  return { visibleSegments, hiddenCounts };
}

function sortEntriesByRecent(entries: ImpactEntry[]) {
  return [...entries].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

function CustomSelect({
  value,
  onChange,
  options,
  triggerClassName = "",
  dropdownClassName = "w-full mt-1",
  triggerId,
  ariaLabel,
}: {
  value: string | number;
  onChange: (value: string) => void;
  options: { label: string; value: string | number }[];
  triggerClassName?: string;
  dropdownClassName?: string;
  triggerId?: string;
  ariaLabel?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((option) => option.value.toString() === value.toString()) ?? options[0];

  return (
    <div className="relative" ref={containerRef}>
      <button
        id={triggerId}
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-label={ariaLabel}
        className={triggerClassName}
      >
        <span className="truncate">{selectedOption?.label}</span>
        <svg
          className={`ml-2 h-4 w-4 shrink-0 text-stone-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className={`absolute z-50 max-h-60 overflow-auto rounded-xl border border-stone-200 bg-white py-1 shadow-lg ${dropdownClassName}`}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value.toString());
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-stone-50 ${
                option.value.toString() === value.toString()
                  ? "bg-amber-50 font-medium text-amber-900"
                  : "text-stone-700"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AddImpactPage() {
  const { currentUser } = useUser();
  const [entriesRevision, setEntriesRevision] = useState(0);
  const [presetRevision, setPresetRevision] = useState(0);
  const [viewDate, setViewDate] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [activeRange, setActiveRange] = useState(getInitialRange);
  const [isRangeEnabled, setIsRangeEnabled] = useState(false);
  const [composerDraft, setComposerDraft] = useState<ComposerDraft>(createInitialDraft());
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLElement>(null);

  const venture = currentUser ? getUserVenture(currentUser) : null;

  useEffect(() => {
    if (!saveMessage) {
      return;
    }

    const timeout = window.setTimeout(() => setSaveMessage(null), 2600);
    return () => window.clearTimeout(timeout);
  }, [saveMessage]);

  const visibleEntries = useMemo(() => {
    void entriesRevision;
    return venture ? listImpactEntriesForVenture(venture.id) : [];
  }, [entriesRevision, venture]);

  const recentEntries = useMemo(
    () => sortEntriesByRecent(visibleEntries),
    [visibleEntries],
  );

  const editingEntry = useMemo(
    () => visibleEntries.find((entry) => entry.id === editingEntryId) ?? null,
    [editingEntryId, visibleEntries],
  );

  const availableMetrics = useMemo(() => {
    void presetRevision;
    return venture ? listMetricOptionsForVenture(venture.id, composerDraft.category) : [];
  }, [composerDraft.category, presetRevision, venture]);

  const resolvedMetricId =
    composerDraft.metricMode === "preset" && availableMetrics.length > 0
      ? availableMetrics.some((metric) => metric.id === composerDraft.selectedMetricId)
        ? composerDraft.selectedMetricId
        : availableMetrics[0].id
      : composerDraft.selectedMetricId;
  const currentMetric = availableMetrics.find((metric) => metric.id === resolvedMetricId) ?? null;
  const composerValueType =
    composerDraft.metricMode === "custom"
      ? composerDraft.customValueType
      : currentMetric?.valueType ?? "count";

  const monthGrid = useMemo(() => getMonthGrid(viewDate), [viewDate]);
  const weekdayLabels = useMemo(() => getWeekdayLabels(), []);
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const entryYears = visibleEntries.flatMap((entry) => [
      Number(entry.startDate.slice(0, 4)),
      Number(entry.endDate.slice(0, 4)),
    ]);
    return Array.from(new Set([currentYear - 1, currentYear, currentYear + 1, ...entryYears])).sort(
      (left, right) => left - right,
    );
  }, [visibleEntries]);

  const calendarEntriesByDate = useMemo(() => {
    const dates = monthGrid.flat().map((day) => toISODate(day));
    return Object.fromEntries(
      dates.map((date) => [date, visibleEntries.filter((entry) => entryOccursOnDate(entry, date))]),
    ) as Record<string, ImpactEntry[]>;
  }, [monthGrid, visibleEntries]);
  const weekLayouts = useMemo(
    () => monthGrid.map((week) => buildWeekLayout(week, visibleEntries)),
    [monthGrid, visibleEntries],
  );

  const visibleRecentEntries = recentEntries.slice(0, 8);

  if (!currentUser) {
    return null;
  }

  if (!venture) {
    return (
      <AppLayout>
        <div className="py-20 text-center">
          <p className="text-stone-500">You&apos;re not assigned to a venture yet. Contact your coach or director to get started.</p>
        </div>
      </AppLayout>
    );
  }

  function resetComposer(nextCategory: ImpactCategory = "social") {
    setComposerDraft(createInitialDraft(nextCategory));
  }

  function resetForm() {
    setEditingEntryId(null);
    setIsRangeEnabled(false);
    setActiveRange(getInitialRange());
    resetComposer();
  }

  function refreshEntries(nextEditingEntryId: string | null = null) {
    setEntriesRevision((current) => current + 1);
    setEditingEntryId(nextEditingEntryId);
  }

  function handleCategoryChange(nextCategory: ImpactCategory) {
    setComposerDraft((current) => ({
      ...current,
      category: nextCategory,
      customValueType: nextCategory === "economic" ? "currency" : "count",
      selectedMetricId: metricOptions[nextCategory][0]?.id ?? "",
    }));
  }

  function handleRangeToggle(enabled: boolean) {
    setIsRangeEnabled(enabled);

    if (!enabled) {
      setActiveRange((current) => ({ startDate: current.startDate, endDate: current.startDate }));
    }
  }

  function handleActiveRangeBoundaryChange(boundary: "startDate" | "endDate", value: string) {
    if (!value) {
      return;
    }

    setActiveRange((current) => {
      const nextRange = {
        startDate: boundary === "startDate" ? value : current.startDate,
        endDate: boundary === "endDate" ? value : current.endDate,
      };
      return normalizeRange(nextRange.startDate, nextRange.endDate);
    });
  }

  function scrollFormIntoView() {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleUseToday() {
    const today = getTodayDate();
    setEditingEntryId(null);
    setIsRangeEnabled(false);
    setActiveRange({ startDate: today, endDate: today });
    scrollFormIntoView();
  }

  function handleEditEntry(entry: ImpactEntry) {
    setEditingEntryId(entry.id);
    setIsRangeEnabled(entry.startDate !== entry.endDate);
    setActiveRange({ startDate: entry.startDate, endDate: entry.endDate });
    setComposerDraft({
      category: entry.category,
      metricMode: entry.metricSource,
      selectedMetricId: entry.metricId ?? "",
      customMetricLabel: entry.metricSource === "custom" ? entry.metricLabel : "",
      customValueType: entry.valueType,
      value: entry.value.toString(),
      story: entry.story ?? "",
    });
    scrollFormIntoView();
  }

  function handleCancelEdit() {
    resetForm();
  }

  function handleSaveEntry() {
    if (!venture) {
      return;
    }

    const normalizedRange = isRangeEnabled
      ? normalizeRange(activeRange.startDate, activeRange.endDate)
      : { startDate: activeRange.startDate, endDate: activeRange.startDate };
    const trimmedCustomMetric = composerDraft.customMetricLabel.trim();
    const parsedValue = Number.parseFloat(composerDraft.value);
    const value = Number.isFinite(parsedValue) ? parsedValue : NaN;

    if (Number.isNaN(value) || value < 0) {
      return;
    }

    if (composerDraft.metricMode === "preset" && !currentMetric) {
      return;
    }

    if (composerDraft.metricMode === "custom" && !trimmedCustomMetric) {
      return;
    }

    const now = new Date().toISOString();
    const metricLabel = composerDraft.metricMode === "custom" ? trimmedCustomMetric : currentMetric!.label;
    const metricId =
      composerDraft.metricMode === "custom"
        ? `custom-${slugifyMetricLabel(trimmedCustomMetric)}`
        : currentMetric!.id;
    const entry: ImpactEntry = {
      id: editingEntry?.id ?? crypto.randomUUID(),
      ventureId: venture.id,
      category: composerDraft.category,
      metricId,
      metricLabel,
      metricSource: composerDraft.metricMode,
      value,
      valueType: composerValueType,
      startDate: normalizedRange.startDate,
      endDate: normalizedRange.endDate,
      story: composerDraft.story.trim() || undefined,
      createdAt: editingEntry?.createdAt ?? now,
      updatedAt: now,
    };

    startTransition(() => {
      saveImpactEntry(entry);

      if (composerDraft.metricMode === "custom") {
        saveCustomMetricPreset(venture.id, {
          id: metricId,
          label: trimmedCustomMetric,
          category: composerDraft.category,
          valueType: composerValueType,
        });
        setPresetRevision((current) => current + 1);
      }

      refreshEntries();
      resetForm();
      setSaveMessage(editingEntry ? "Impact updated." : "Impact logged.");
    });
  }

  function handleDeleteEntry(entry: ImpactEntry) {
    if (!window.confirm(`Remove "${entry.metricLabel}" from your impact log?`)) {
      return;
    }

    deleteImpactEntry(entry.id);
    refreshEntries();

    if (editingEntryId === entry.id) {
      resetForm();
    }

    setSaveMessage("Impact removed.");
  }

  const rangeLength = getRangeLength(activeRange.startDate, activeRange.endDate);
  const monthRecordLabel = `${visibleEntries.length} entr${visibleEntries.length === 1 ? "y" : "ies"} logged`;

  return (
    <AppLayout>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
          <div className="px-6 py-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-xl">
                <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Add Impact</h1>
                <p className="mt-2 text-sm text-stone-600">Log one result, choose the date, and save.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm text-stone-500">
                <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5">{monthRecordLabel}</span>
              </div>
            </div>
          </div>
        </section>

        <section ref={formRef} className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold text-stone-900">
                  {editingEntry ? "Edit impact" : "Log impact"}
                </h2>
                {editingEntry && (
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-800">
                    Editing entry
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-stone-500">Choose a metric, enter the amount, then save.</p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleUseToday}
                className="rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
              >
                Use today
              </button>
              {editingEntry && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
                >
                  Cancel edit
                </button>
              )}
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">1. Category</p>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(categoryConfig) as ImpactCategory[]).map((category) => {
                  const isActive = composerDraft.category === category;
                  const config = categoryConfig[category];
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => handleCategoryChange(category)}
                      className={`flex flex-col items-center gap-1.5 rounded-2xl border py-3 text-sm transition-all ${
                        isActive
                          ? "border-stone-300 bg-stone-100 text-stone-900 shadow-sm"
                          : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
                      }`}
                    >
                      <span className={`h-2.5 w-2.5 rounded-full ${isActive ? config.accent : "bg-stone-300"}`} />
                      <span className="font-medium">{config.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">2. What happened?</p>
                <div className="flex rounded-lg bg-stone-100 p-0.5">
                  <button
                    type="button"
                    onClick={() =>
                      setComposerDraft((current) => ({
                        ...current,
                        metricMode: "preset",
                        selectedMetricId: availableMetrics[0]?.id ?? "",
                      }))
                    }
                    className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                      composerDraft.metricMode === "preset"
                        ? "bg-white text-stone-900 shadow-sm"
                        : "text-stone-500 hover:text-stone-700"
                    }`}
                  >
                    Suggested
                  </button>
                  <button
                    type="button"
                    onClick={() => setComposerDraft((current) => ({ ...current, metricMode: "custom" }))}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                      composerDraft.metricMode === "custom"
                        ? "bg-white text-stone-900 shadow-sm"
                        : "text-stone-500 hover:text-stone-700"
                    }`}
                  >
                    Custom
                  </button>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(14rem,0.9fr)]">
                <div>
                  {composerDraft.metricMode === "preset" ? (
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-stone-900">Metric</p>
                      <CustomSelect
                        value={resolvedMetricId}
                        onChange={(value) => setComposerDraft((current) => ({ ...current, selectedMetricId: value }))}
                        options={availableMetrics.map((metric) => ({ value: metric.id, label: metric.label }))}
                        triggerId="impact-metric-select"
                        ariaLabel="Impact metric"
                        triggerClassName="flex w-full items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 shadow-sm transition-colors hover:bg-stone-50 focus:outline-none"
                      />
                      <label htmlFor="impact-amount" className="block text-sm font-medium text-stone-900">Amount</label>
                      <div className="relative">
                        {composerValueType === "currency" && (
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-stone-500">$</span>
                        )}
                        <input
                          id="impact-amount"
                          name="impactAmount"
                          type="number"
                          min="0"
                          step={composerValueType === "currency" ? "0.01" : "1"}
                          value={composerDraft.value}
                          onChange={(event) =>
                            setComposerDraft((current) => ({ ...current, value: event.target.value }))
                          }
                          placeholder={composerValueType === "currency" ? "0.00" : "0"}
                          className={`w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 ${
                            composerValueType === "currency" ? "pl-8" : ""
                          }`}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 rounded-2xl border border-stone-200 bg-stone-50/60 p-4">
                      <label htmlFor="custom-metric-label" className="block text-sm font-medium text-stone-900">
                        Metric
                      </label>
                      <input
                        id="custom-metric-label"
                        name="customMetricLabel"
                        value={composerDraft.customMetricLabel}
                        onChange={(event) =>
                          setComposerDraft((current) => ({ ...current, customMetricLabel: event.target.value }))
                        }
                        placeholder="What did you track?"
                        className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                      />
                      <div className="flex gap-2">
                        {(["count", "currency"] as ImpactValueType[]).map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() =>
                              setComposerDraft((current) => ({ ...current, customValueType: type }))
                            }
                            className={`flex-1 rounded-xl border py-2 text-sm font-medium transition-colors ${
                              composerDraft.customValueType === type
                                ? "border-stone-900 bg-stone-900 text-white"
                                : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
                            }`}
                          >
                            {type === "currency" ? "Dollar amount" : "Count"}
                          </button>
                        ))}
                      </div>
                      <label htmlFor="impact-amount" className="block text-sm font-medium text-stone-900">Amount</label>
                      <div className="relative">
                        {composerValueType === "currency" && (
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-stone-500">$</span>
                        )}
                        <input
                          id="impact-amount"
                          name="impactAmount"
                          type="number"
                          min="0"
                          step={composerValueType === "currency" ? "0.01" : "1"}
                          value={composerDraft.value}
                          onChange={(event) =>
                            setComposerDraft((current) => ({ ...current, value: event.target.value }))
                          }
                          placeholder={composerValueType === "currency" ? "0.00" : "0"}
                          className={`w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 ${
                            composerValueType === "currency" ? "pl-8" : ""
                          }`}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">3. When?</p>
                  <div className="relative">
                    <div className="space-y-3 rounded-2xl border border-stone-200 bg-stone-50/60 p-4">
                    <label htmlFor="impact-date" className="block">
                      <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-stone-500">
                        Date
                      </span>
                      <input
                        id="impact-date"
                        name="impactDate"
                        type="date"
                        value={activeRange.startDate}
                        onChange={(event) => handleActiveRangeBoundaryChange("startDate", event.target.value)}
                        className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                      />
                    </label>

                      <button
                        type="button"
                        onClick={() => handleRangeToggle(!isRangeEnabled)}
                        className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                          isRangeEnabled
                            ? "border-amber-200 bg-amber-50 text-amber-900"
                            : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
                        }`}
                      >
                        <span>Spans multiple days</span>
                        <span className="text-xs">{isRangeEnabled ? "On" : "Off"}</span>
                      </button>

                      {isRangeEnabled && (
                        <label htmlFor="impact-end-date" className="block">
                          <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-stone-500">
                            End date
                          </span>
                          <input
                            id="impact-end-date"
                            name="impactEndDate"
                            type="date"
                            value={activeRange.endDate}
                            onChange={(event) => handleActiveRangeBoundaryChange("endDate", event.target.value)}
                            className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                          />
                        </label>
                      )}

                      <p className="text-xs leading-relaxed text-stone-500">
                        {formatImpactRange(activeRange)} • {rangeLength} day{rangeLength === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">4. Add a note (optional)</p>
                <label htmlFor="impact-notes" className="mb-2 block text-sm font-medium text-stone-900">
                  Notes
                </label>
                <textarea
                  id="impact-notes"
                  name="impactNotes"
                  value={composerDraft.story}
                  onChange={(event) => setComposerDraft((current) => ({ ...current, story: event.target.value }))}
                  placeholder="Add context if needed"
                  rows={4}
                  className="w-full resize-none rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <div className="flex flex-col gap-3 border-t border-stone-100 pt-5 sm:flex-row">
                <button
                  type="button"
                  onClick={handleSaveEntry}
                  disabled={isPending}
                  className="flex-1 rounded-2xl bg-amber-500 px-5 py-3 text-sm font-semibold text-stone-900 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPending ? "Saving..." : editingEntry ? "Save changes" : "Save impact"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-2xl border border-stone-200 bg-white px-5 py-3 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-50 hover:text-stone-900"
                >
                  Clear form
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-stone-900">Recent entries</h2>
              <p className="mt-1 text-sm text-stone-500">Edit or remove something you already logged.</p>
            </div>
            <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-500">
              {recentEntries.length} total
            </span>
          </div>

          {visibleRecentEntries.length > 0 ? (
            <div className="mt-5 grid gap-3 lg:grid-cols-2">
              {visibleRecentEntries.map((entry) => {
                const config = categoryConfig[entry.category];
                const isEditing = editingEntryId === entry.id;
                return (
                  <div
                    key={entry.id}
                    className={`rounded-2xl border p-4 transition-colors ${
                      isEditing
                        ? "border-amber-200 bg-amber-50/60"
                        : "border-stone-200 bg-white hover:border-stone-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${config.pill}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${config.accent}`} />
                          {config.label}
                        </span>
                        <h3 className="mt-2 text-sm font-semibold text-stone-900">{entry.metricLabel}</h3>
                        <p className="mt-1 text-xs text-stone-500">
                          {formatImpactRange(entry)} • {getRangeLength(entry.startDate, entry.endDate)} day{getRangeLength(entry.startDate, entry.endDate) === 1 ? "" : "s"}
                        </p>
                        {entry.story && (
                          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone-600">{entry.story}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${config.text}`}>
                          {formatImpactValue(entry.value, entry.valueType)}
                        </p>
                        <p className="mt-1 text-[11px] text-stone-400">
                          Updated {new Date(entry.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditEntry(entry)}
                        className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteEntry(entry)}
                        className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-stone-200 bg-stone-50/60 p-5">
              <p className="text-sm font-medium text-stone-700">No impact logged yet.</p>
              <p className="mt-1 text-sm text-stone-500">Use the form above to add your first result.</p>
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
          <div className="border-b border-stone-100 px-6 py-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-stone-900">Calendar</h2>
                <p className="mt-1 text-sm text-stone-500">Click a day to load that date into the form.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex rounded-full bg-stone-100 p-1">
                  <button
                    type="button"
                    onClick={() => setViewDate((current) => addMonths(current, -1))}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-stone-600 transition-colors hover:bg-white hover:shadow-sm"
                  >
                    <span className="sr-only">Previous month</span>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewDate((current) => addMonths(current, 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-stone-600 transition-colors hover:bg-white hover:shadow-sm"
                  >
                    <span className="sr-only">Next month</span>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m9 6 6 6-6 6" />
                    </svg>
                  </button>
                </div>

                <h3 className="min-w-[10rem] text-lg font-medium text-stone-900">{formatMonthLabel(viewDate)}</h3>

                <CustomSelect
                  value={viewDate.getMonth()}
                  onChange={(value) => setViewDate((current) => new Date(current.getFullYear(), Number(value), 1))}
                  options={Array.from({ length: 12 }, (_, monthIndex) => ({
                    value: monthIndex,
                    label: new Date(2026, monthIndex, 1).toLocaleString("en-US", { month: "short" }),
                  }))}
                  triggerId="impact-calendar-month"
                  ariaLabel="Calendar month"
                  triggerClassName="flex w-24 items-center justify-between rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-900 shadow-sm transition-colors hover:bg-stone-50 focus:outline-none"
                  dropdownClassName="mt-1 w-32"
                />

                <CustomSelect
                  value={viewDate.getFullYear()}
                  onChange={(value) => setViewDate((current) => new Date(Number(value), current.getMonth(), 1))}
                  options={years.map((year) => ({ value: year, label: year.toString() }))}
                  triggerId="impact-calendar-year"
                  ariaLabel="Calendar year"
                  triggerClassName="flex w-24 items-center justify-between rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-900 shadow-sm transition-colors hover:bg-stone-50 focus:outline-none"
                  dropdownClassName="right-0 mt-1 w-32"
                />
              </div>
            </div>
          </div>

          <div className="px-4 py-5 sm:px-6">
            <div className="grid grid-cols-7 border-b border-stone-100 bg-stone-50/60">
              {weekdayLabels.map((label) => (
                <div key={label} className="px-3 py-2 text-center text-[11px] font-medium text-stone-500">
                  {label}
                </div>
              ))}
            </div>

            <div className="grid gap-px overflow-hidden rounded-b-2xl bg-stone-100">
              {monthGrid.map((week, weekIndex) => (
                <div key={weekIndex} className="relative grid grid-cols-7 gap-px">
                  {week.map((day) => {
                    const isoDate = toISODate(day);
                    const dayEntries = calendarEntriesByDate[isoDate] ?? [];
                    const hiddenCount = weekLayouts[weekIndex].hiddenCounts[isoDate] ?? 0;
                    const isCurrentMonth = isSameMonth(day, viewDate);

                    return (
                      <div
                        key={isoDate}
                        className={`relative min-h-[8.5rem] bg-white px-3 py-3 text-left align-top ${
                          isCurrentMonth ? "" : "opacity-45"
                        }`}
                      >
                        <div className="relative z-20 flex items-center justify-between">
                          <span
                            className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                              isToday(day)
                                ? "bg-teal-600 text-white"
                                : "text-stone-600"
                            }`}
                          >
                            {day.getDate()}
                          </span>
                          {dayEntries.length > 0 && (
                            <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-500">
                              {dayEntries.length}
                            </span>
                          )}
                        </div>

                        {hiddenCount > 0 && (
                          <div className="absolute bottom-3 left-3 z-20 text-[11px] font-medium text-stone-400">+{hiddenCount} more</div>
                        )}
                      </div>
                    );
                  })}

                  <div className="pointer-events-none absolute inset-x-0 top-[3.1rem] z-10 px-1">
                    <div className="grid auto-rows-[22px] grid-cols-7 gap-y-1">
                      {weekLayouts[weekIndex].visibleSegments.map((segment) => {
                        const config = categoryConfig[segment.entry.category];
                        return (
                          <div
                            key={`${segment.entry.id}-${segment.startCol}-${segment.endCol}`}
                            className={`flex items-center gap-1.5 overflow-hidden rounded-lg border px-2 py-1 text-[11px] opacity-80 ${config.chip}`}
                            style={{
                              gridColumn: `${segment.startCol} / ${segment.endCol + 1}`,
                              gridRow: `${segment.lane + 1}`,
                            }}
                          >
                            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${config.accent}`} />
                            <span className="truncate font-medium">{segment.entry.metricLabel}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {saveMessage && (
          <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white shadow-xl">
            {saveMessage}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
