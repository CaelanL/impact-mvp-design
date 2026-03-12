"use client";

import { type ReactNode, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useUser } from "@/lib/UserContext";
import {
  addDays,
  addMonths,
  entryOccursOnDate,
  entryIntersectsRange,
  formatMonthLabel,
  formatShortDate,
  getMonthGrid,
  getRangeLength,
  getWeekdayLabels,
  isDateWithinRange,
  isSameMonth,
  isToday,
  normalizeRange,
  parseISODate,
  sortImpactEntries,
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

const MAX_VISIBLE_LANES = 3;

const categoryConfig: Record<
  ImpactCategory,
  {
    label: string;
    accent: string;
    pill: string;
    chip: string;
    panelRing: string;
    soft: string;
    text: string;
    hoverState: string;
  }
> = {
  social: {
    label: "Social",
    accent: "bg-teal-500",
    pill: "border-teal-200 bg-teal-500/15 text-teal-900",
    chip: "border-teal-300 bg-teal-50 text-teal-700",
    panelRing: "ring-teal-500/20",
    soft: "bg-teal-500/8",
    text: "text-teal-700",
    hoverState: "hover:bg-teal-500/20 hover:ring-1 hover:ring-teal-500/40 hover:shadow-sm hover:z-30",
  },
  spiritual: {
    label: "Spiritual",
    accent: "bg-violet-500",
    pill: "border-violet-200 bg-violet-500/15 text-violet-900",
    chip: "border-violet-300 bg-violet-50 text-violet-700",
    panelRing: "ring-violet-500/20",
    soft: "bg-violet-500/8",
    text: "text-violet-700",
    hoverState: "hover:bg-violet-500/20 hover:ring-1 hover:ring-violet-500/40 hover:shadow-sm hover:z-30",
  },
  economic: {
    label: "Economic",
    accent: "bg-amber-500",
    pill: "border-amber-200 bg-amber-500/15 text-amber-950",
    chip: "border-amber-300 bg-amber-50 text-amber-700",
    panelRing: "ring-amber-500/20",
    soft: "bg-amber-500/10",
    text: "text-amber-700",
    hoverState: "hover:bg-amber-500/25 hover:ring-1 hover:ring-amber-500/40 hover:shadow-sm hover:z-30",
  },
};

type PanelMode = "empty" | "create" | "detail" | "edit";

interface ComposerDraft {
  category: ImpactCategory;
  metricMode: "preset" | "custom";
  selectedMetricId: string;
  customMetricLabel: string;
  customValueType: ImpactValueType;
  value: string;
  story: string;
}

interface DragSelectionState {
  anchorDate: string;
  currentDate: string;
}

interface FloatingPosition {
  left: number;
  top: number;
}

interface WeekSegment {
  entry: ImpactEntry;
  lane: number;
  startCol: number;
  endCol: number;
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

  const visibleSegments = laidOutSegments.filter((segment) => segment.lane < MAX_VISIBLE_LANES);
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

function isRangeDaySelected(
  monthGrid: Date[][],
  range: { startDate: string; endDate: string } | null,
  weekIndex: number,
  dayIndex: number,
) {
  const day = monthGrid[weekIndex]?.[dayIndex];

  if (!range || !day) {
    return false;
  }

  return isDateWithinRange(toISODate(day), range.startDate, range.endDate);
}

function getRangeDayOutline(
  monthGrid: Date[][],
  range: { startDate: string; endDate: string } | null,
  weekIndex: number,
  dayIndex: number,
) {
  if (!isRangeDaySelected(monthGrid, range, weekIndex, dayIndex)) {
    return null;
  }

  return {
    hasTopNeighbor: isRangeDaySelected(monthGrid, range, weekIndex - 1, dayIndex),
    hasRightNeighbor: isRangeDaySelected(monthGrid, range, weekIndex, dayIndex + 1),
    hasBottomNeighbor: isRangeDaySelected(monthGrid, range, weekIndex + 1, dayIndex),
    hasLeftNeighbor: isRangeDaySelected(monthGrid, range, weekIndex, dayIndex - 1),
  };
}

function getRangeDayInsetShadow(rangeDayOutline: {
  hasTopNeighbor: boolean;
  hasRightNeighbor: boolean;
  hasBottomNeighbor: boolean;
  hasLeftNeighbor: boolean;
}) {
  const edgeShadows = [
    !rangeDayOutline.hasTopNeighbor ? "inset 0 2px 0 0 #34d399" : null,
    !rangeDayOutline.hasRightNeighbor ? "inset -2px 0 0 0 #34d399" : null,
    !rangeDayOutline.hasBottomNeighbor ? "inset 0 -2px 0 0 #34d399" : null,
    !rangeDayOutline.hasLeftNeighbor ? "inset 2px 0 0 0 #34d399" : null,
  ].filter(Boolean);

  return edgeShadows.join(", ");
}

function CustomSelect({
  value,
  onChange,
  options,
  triggerClassName = "",
  dropdownClassName = "w-full mt-1",
}: {
  value: string | number;
  onChange: (value: string) => void;
  options: { label: string; value: string | number }[];
  triggerClassName?: string;
  dropdownClassName?: string;
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

  const selectedOption = options.find((opt) => opt.value.toString() === value.toString()) || options[0];

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={triggerClassName}
      >
        <span className="truncate">{selectedOption?.label}</span>
        <svg className={`h-4 w-4 text-stone-500 transition-transform shrink-0 ml-2 ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className={`absolute z-50 bg-white border border-stone-200 rounded-xl shadow-lg max-h-60 overflow-auto py-1 ${dropdownClassName}`}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value.toString());
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-stone-50 transition-colors ${
                option.value.toString() === value.toString() ? "bg-amber-50 text-amber-900 font-medium" : "text-stone-700"
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

function ModalShell({
  title,
  onClose,
  widthClassName = "max-w-lg",
  children,
}: {
  title: string;
  onClose: () => void;
  widthClassName?: string;
  children: ReactNode;
}) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-stone-100/55 p-4 backdrop-blur-sm sm:p-6 lg:p-8" onClick={onClose}>
      <div
        className={`w-full ${widthClassName} overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-2xl`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
          >
            <span className="sr-only">Close</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        <div className="max-h-[min(80vh,48rem)] overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}

export default function AddImpactPage() {
  const { currentUser } = useUser();
  const [entriesRevision, setEntriesRevision] = useState(0);
  const [viewDate, setViewDate] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [panelMode, setPanelMode] = useState<PanelMode>("empty");
  const [activeRange, setActiveRange] = useState<{ startDate: string; endDate: string } | null>(null);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [composerDraft, setComposerDraft] = useState<ComposerDraft>(createInitialDraft());
  const [dragSelection, setDragSelection] = useState<DragSelectionState | null>(null);
  const [tapAnchor, setTapAnchor] = useState<string | null>(null);
  const [presetRevision, setPresetRevision] = useState(0);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [dayListDate, setDayListDate] = useState<string | null>(null);
  const [isImpactEditMode, setIsImpactEditMode] = useState(false);
  const [rangeActionPosition, setRangeActionPosition] = useState<FloatingPosition | null>(null);
  const [isPending, startTransition] = useTransition();
  const calendarAreaRef = useRef<HTMLDivElement>(null);

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
    return venture ? sortImpactEntries(listImpactEntriesForVenture(venture.id)) : [];
  }, [entriesRevision, venture]);
  const monthGrid = useMemo(() => getMonthGrid(viewDate), [viewDate]);
  const weekLayouts = useMemo(
    () => monthGrid.map((week) => buildWeekLayout(week, visibleEntries)),
    [monthGrid, visibleEntries],
  );

  const monthStart = toISODate(new Date(viewDate.getFullYear(), viewDate.getMonth(), 1));
  const monthEnd = toISODate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0));
  const monthEntries = useMemo(
    () => visibleEntries.filter((entry) => entryIntersectsRange(entry, monthStart, monthEnd)),
    [monthEnd, monthStart, visibleEntries],
  );

  const dayListEntries = useMemo(
    () => (dayListDate ? visibleEntries.filter((entry) => entryOccursOnDate(entry, dayListDate)) : []),
    [dayListDate, visibleEntries],
  );

  const highlightedRange = dragSelection
    ? normalizeRange(dragSelection.anchorDate, dragSelection.currentDate)
    : !isImpactEditMode && !selectedEntryId
      ? activeRange
      : null;
  const rangeActionRange = !isImpactEditMode && !selectedEntryId && panelMode === "empty" && !dayListDate
    ? highlightedRange
    : null;
  const shouldShowRangeAction = Boolean(rangeActionRange);

  const selectedEntry = useMemo(
    () => visibleEntries.find((entry) => entry.id === selectedEntryId) ?? null,
    [selectedEntryId, visibleEntries],
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

  useEffect(() => {
    if (!shouldShowRangeAction || !rangeActionRange || !calendarAreaRef.current) {
      return;
    }

    const calendarArea = calendarAreaRef.current;

    const updateRangeActionPosition = () => {
      const calendarRect = calendarArea.getBoundingClientRect();
      const selectedCells = Array.from(
        calendarArea.querySelectorAll<HTMLElement>("[data-iso-date]"),
      ).filter((cell) => {
        const isoDate = cell.dataset.isoDate;
        return isoDate ? isDateWithinRange(isoDate, rangeActionRange.startDate, rangeActionRange.endDate) : false;
      });

      if (selectedCells.length === 0) {
        setRangeActionPosition(null);
        return;
      }

      const selectedBottom = Math.max(
        ...selectedCells.map((cell) => cell.getBoundingClientRect().bottom - calendarRect.top),
      );
      const actionWidth = Math.min(360, Math.max(280, calendarRect.width - 32));
      const horizontalPadding = 16;
      const leftmostColumnEdge = Math.min(
        ...selectedCells.map((cell) => cell.getBoundingClientRect().left - calendarRect.left),
      );
      const rightmostColumnEdge = Math.max(
        ...selectedCells.map((cell) => cell.getBoundingClientRect().right - calendarRect.left),
      );
      const anchorCenter = (leftmostColumnEdge + rightmostColumnEdge) / 2;
      const left = Math.min(
        Math.max(anchorCenter, horizontalPadding + actionWidth / 2),
        calendarRect.width - horizontalPadding - actionWidth / 2,
      );

      setRangeActionPosition({
        left,
        top: selectedBottom + 14,
      });
    };

    updateRangeActionPosition();

    const observer = new ResizeObserver(updateRangeActionPosition);
    observer.observe(calendarArea);
    window.addEventListener("resize", updateRangeActionPosition);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateRangeActionPosition);
    };
  }, [rangeActionRange, shouldShowRangeAction]);

  const coveredDayCount = useMemo(() => {
    const coveredDates = new Set<string>();

    for (const entry of monthEntries) {
      const clippedStart = entry.startDate < monthStart ? monthStart : entry.startDate;
      const clippedEnd = entry.endDate > monthEnd ? monthEnd : entry.endDate;

      for (
        let current = parseISODate(clippedStart);
        toISODate(current) <= clippedEnd;
        current = addDays(current, 1)
      ) {
        coveredDates.add(toISODate(current));
      }
    }

    return coveredDates.size;
  }, [monthEnd, monthEntries, monthStart]);

  const impactRecordCountLabel = `${monthEntries.length} record${monthEntries.length === 1 ? "" : "s"}`;
  const coveredDayCountLabel = `${coveredDayCount} day${coveredDayCount === 1 ? "" : "s"}`;

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

  const weekdayLabels = getWeekdayLabels();

  function resetComposer(nextCategory: ImpactCategory = "social") {
    setComposerDraft(createInitialDraft(nextCategory));
  }

  function clearSelectionState() {
    setPanelMode("empty");
    setActiveRange(null);
    setSelectedEntryId(null);
    setDragSelection(null);
    setDayListDate(null);
    setTapAnchor(null);
    setRangeActionPosition(null);
    resetComposer();
  }

  function handleInteractionModeChange(nextMode: boolean) {
    if (nextMode === isImpactEditMode) {
      return;
    }

    clearSelectionState();
    setIsImpactEditMode(nextMode);
  }

  function refreshEntries(focusEntryId?: string) {
    setEntriesRevision((current) => current + 1);

    if (focusEntryId) {
      setSelectedEntryId(focusEntryId);
      setPanelMode("detail");
    }
  }

  function setSelectedRange(
    range: { startDate: string; endDate: string },
    preserveDraft = false,
  ) {
    setActiveRange(range);
    setSelectedEntryId(null);
    setDayListDate(null);
    setPanelMode("empty");

    if (!preserveDraft) {
      resetComposer();
    }
  }

  function openDetail(entry: ImpactEntry) {
    setSelectedEntryId(entry.id);
    setPanelMode("detail");
    setActiveRange({ startDate: entry.startDate, endDate: entry.endDate });
    setDayListDate(null);
    setTapAnchor(null);
  }

  function openEditComposer(entry: ImpactEntry) {
    setSelectedEntryId(entry.id);
    setActiveRange({ startDate: entry.startDate, endDate: entry.endDate });
    setDayListDate(null);
    setPanelMode("edit");
    setComposerDraft({
      category: entry.category,
      metricMode: entry.metricSource,
      selectedMetricId: entry.metricId ?? "",
      customMetricLabel: entry.metricSource === "custom" ? entry.metricLabel : "",
      customValueType: entry.valueType,
      value: entry.value.toString(),
      story: entry.story ?? "",
    });
  }

  function handleCategoryChange(nextCategory: ImpactCategory) {
    setComposerDraft((current) => ({
      ...current,
      category: nextCategory,
      customValueType: nextCategory === "economic" ? "currency" : "count",
      selectedMetricId: metricOptions[nextCategory][0]?.id ?? "",
    }));
  }

  function handleActiveRangeBoundaryChange(boundary: "startDate" | "endDate", value: string) {
    if (!activeRange || !value) {
      return;
    }

    if (boundary === "startDate") {
      const nextStartDate = value;
      const nextEndDate = nextStartDate > activeRange.endDate ? nextStartDate : activeRange.endDate;
      setActiveRange({ startDate: nextStartDate, endDate: nextEndDate });
      return;
    }

    const nextEndDate = value;
    const nextStartDate = nextEndDate < activeRange.startDate ? nextEndDate : activeRange.startDate;
    setActiveRange({ startDate: nextStartDate, endDate: nextEndDate });
  }

  function resolveCalendarDateFromPoint(clientX: number, clientY: number) {
    const element = document.elementFromPoint(clientX, clientY);
    const cell = element?.closest<HTMLElement>("[data-iso-date]");
    return cell?.dataset.isoDate ?? null;
  }

  function commitCalendarDaySelection(date: string, anchorDate = tapAnchor) {
    if (
      anchorDate === date &&
      activeRange?.startDate === date &&
      activeRange.endDate === date &&
      !selectedEntryId
    ) {
      clearSelectionState();
      return;
    }

    if (anchorDate && anchorDate !== date) {
      setSelectedRange(normalizeRange(anchorDate, date), true);
      setTapAnchor(null);
      return;
    }

    setTapAnchor(date);
    setSelectedRange({ startDate: date, endDate: date }, false);
  }

  function handleCalendarDayMouseDown(event: React.MouseEvent<HTMLDivElement>, date: string) {
    event.preventDefault();

    const anchorDate = tapAnchor;
    const originX = event.clientX;
    const originY = event.clientY;
    let didDrag = false;
    let currentDate = date;

    const commitDragSelection = (targetDate: string) => {
      const nextRange = normalizeRange(date, targetDate);
      setDragSelection(null);
      setTapAnchor(null);
      setSelectedRange(nextRange, true);
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const movedEnough = Math.abs(moveEvent.clientX - originX) > 3 || Math.abs(moveEvent.clientY - originY) > 3;
      if (!didDrag && !movedEnough) {
        return;
      }

      didDrag = true;
      currentDate = resolveCalendarDateFromPoint(moveEvent.clientX, moveEvent.clientY) ?? currentDate;
      setDragSelection({ anchorDate: date, currentDate });
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);

      if (didDrag) {
        currentDate = resolveCalendarDateFromPoint(upEvent.clientX, upEvent.clientY) ?? currentDate;
        commitDragSelection(currentDate);
        return;
      }

      setDragSelection(null);
      commitCalendarDaySelection(date, anchorDate);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }

  function handleSaveEntry() {
    if (!venture || !activeRange) {
      return;
    }

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
    const editingEntry = panelMode === "edit" ? selectedEntry : null;
    const metricLabel = composerDraft.metricMode === "custom" ? trimmedCustomMetric : currentMetric!.label;
    const metricId =
      composerDraft.metricMode === "custom" ? `custom-${slugifyMetricLabel(trimmedCustomMetric)}` : currentMetric!.id;
    const entry: ImpactEntry = {
      id: editingEntry?.id ?? crypto.randomUUID(),
      ventureId: venture.id,
      category: composerDraft.category,
      metricId,
      metricLabel,
      metricSource: composerDraft.metricMode,
      value,
      valueType: composerValueType,
      startDate: activeRange.startDate,
      endDate: activeRange.endDate,
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
      clearSelectionState();
      setSaveMessage(panelMode === "edit" ? "Impact updated." : "Impact added to the calendar.");
    });
  }

  function handleDeleteEntry(entry: ImpactEntry) {
    if (!window.confirm(`Remove "${entry.metricLabel}" from the calendar?`)) {
      return;
    }

    deleteImpactEntry(entry.id);
    refreshEntries();
    clearSelectionState();
    setSaveMessage("Impact removed.");
  }

  return (
    <AppLayout>
      <div className="relative min-h-[calc(100vh-8rem)] space-y-6">
        <section className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="border-b border-stone-100 bg-stone-50/40 px-6 py-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Add Impact</h1>
                <p className="mt-2 text-sm text-stone-500">
                  Select days on the calendar to record your impact.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:min-w-[22rem]">
                <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-stone-400">Entries this month</p>
                  <p className="mt-1 text-lg font-semibold text-stone-900">{impactRecordCountLabel}</p>
                </div>
                <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-stone-400">Days with impact</p>
                  <p className="mt-1 text-lg font-semibold text-stone-900">{coveredDayCountLabel}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white">
            {/* Calendar Section */}
            <div className="bg-white">
              <div className="p-4 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex bg-stone-100 rounded-full p-1">
                    <button
                      onClick={() => setViewDate((current) => addMonths(current, -1))}
                      className="w-8 h-8 flex items-center justify-center rounded-full text-stone-600 hover:bg-white hover:shadow-sm transition-all"
                    >
                      <span className="sr-only">Previous month</span>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewDate((current) => addMonths(current, 1))}
                      className="w-8 h-8 flex items-center justify-center rounded-full text-stone-600 hover:bg-white hover:shadow-sm transition-all"
                    >
                      <span className="sr-only">Next month</span>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m9 6 6 6-6 6" />
                      </svg>
                    </button>
                  </div>

                  <h2 className="text-lg font-medium text-stone-900 w-32">
                    {formatMonthLabel(viewDate)}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <div className="mr-2 flex items-center rounded-2xl border border-stone-200 bg-stone-50 p-1.5 shadow-sm">
                    <button
                      type="button"
                      onClick={() => handleInteractionModeChange(false)}
                      className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                        !isImpactEditMode
                          ? "bg-white text-stone-900 shadow-sm ring-1 ring-stone-200"
                          : "text-stone-600 hover:bg-white/80 hover:text-stone-900"
                      }`}
                    >
                      Add impacts
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInteractionModeChange(true)}
                      className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                        isImpactEditMode
                          ? "bg-white text-stone-900 shadow-sm ring-1 ring-stone-200"
                          : "text-stone-600 hover:bg-white/80 hover:text-stone-900"
                      }`}
                    >
                      Review impacts
                    </button>
                  </div>

                  <CustomSelect
                    value={viewDate.getMonth()}
                    onChange={(val) =>
                      setViewDate((current) => new Date(current.getFullYear(), Number(val), 1))
                    }
                    options={Array.from({ length: 12 }, (_, monthIndex) => ({
                      value: monthIndex,
                      label: new Date(2026, monthIndex, 1).toLocaleString("en-US", { month: "short" })
                    }))}
                    triggerClassName="flex w-24 items-center justify-between rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-900 shadow-sm transition-all hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-200"
                    dropdownClassName="w-32 mt-1"
                  />

                  <CustomSelect
                    value={viewDate.getFullYear()}
                    onChange={(val) =>
                      setViewDate((current) => new Date(Number(val), current.getMonth(), 1))
                    }
                    options={years.map((year) => ({
                      value: year,
                      label: year.toString()
                    }))}
                    triggerClassName="flex w-24 items-center justify-between rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-900 shadow-sm transition-all hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-200"
                    dropdownClassName="w-32 mt-1 right-0"
                  />
                </div>
              </div>

              {/* Calendar Grid */}
              <div ref={calendarAreaRef} className={`relative border-t border-stone-100 ${shouldShowRangeAction ? "pb-28" : ""}`}>
                <div className="grid grid-cols-7 border-b border-stone-100 bg-stone-50/50">
                  {weekdayLabels.map((label) => (
                    <div key={label} className="px-3 py-2 text-center text-[11px] font-medium text-stone-500">
                      {label}
                    </div>
                  ))}
                </div>

                <div className="relative divide-y divide-stone-100 select-none">
                  {monthGrid.map((week, weekIndex) => (
                    <div key={weekIndex} className="relative">
                      <div className="grid grid-cols-7">
                        {week.map((day, dayIndex) => {
                          const isoDate = toISODate(day);
                          const hiddenCount = weekLayouts[weekIndex].hiddenCounts[isoDate] ?? 0;
                          const isCurrentMonth = isSameMonth(day, viewDate);
                          const rangeDayOutline = getRangeDayOutline(
                            monthGrid,
                            highlightedRange,
                            weekIndex,
                            dayIndex,
                          );

                          const selectionClasses = isImpactEditMode
                            ? "bg-white hover:bg-stone-50/50"
                            : "bg-white hover:bg-emerald-50/70";

                          return (
                            <div
                              key={isoDate}
                              data-iso-date={isoDate}
                              role="button"
                              tabIndex={isImpactEditMode ? -1 : 0}
                              onMouseDown={(event) => {
                                if (isImpactEditMode) {
                                  return;
                                }

                                handleCalendarDayMouseDown(event, isoDate);
                              }}
                              onKeyDown={(event) => {
                                if (isImpactEditMode) {
                                  return;
                                }

                                if (event.key === "Enter" || event.key === " ") {
                                  event.preventDefault();
                                  commitCalendarDaySelection(isoDate);
                                }
                              }}
                              className={`relative min-h-[7rem] select-none border-r border-stone-100 px-2 py-2 text-left outline-none transition-colors last:border-r-0 ${selectionClasses} ${isImpactEditMode ? "cursor-default" : "cursor-pointer"} ${!isCurrentMonth ? "opacity-40" : ""}`}
                            >
                              {rangeDayOutline && (
                                <div
                                  className="pointer-events-none absolute -inset-px z-10 bg-emerald-50/95"
                                  style={{
                                    transition: "none",
                                    boxShadow: getRangeDayInsetShadow(rangeDayOutline),
                                    borderTopLeftRadius:
                                      !rangeDayOutline.hasTopNeighbor && !rangeDayOutline.hasLeftNeighbor ? 18 : 0,
                                    borderTopRightRadius:
                                      !rangeDayOutline.hasTopNeighbor && !rangeDayOutline.hasRightNeighbor ? 18 : 0,
                                    borderBottomRightRadius:
                                      !rangeDayOutline.hasBottomNeighbor && !rangeDayOutline.hasRightNeighbor ? 18 : 0,
                                    borderBottomLeftRadius:
                                      !rangeDayOutline.hasBottomNeighbor && !rangeDayOutline.hasLeftNeighbor ? 18 : 0,
                                  }}
                                />
                              )}

                              <div className="relative z-20 flex items-center justify-between">
                                <span
                                  className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                                    isToday(day)
                                      ? "bg-teal-600 text-white font-semibold"
                                      : "text-stone-600 font-medium"
                                  }`}
                                >
                                  {day.getDate()}
                                </span>
                              </div>

                              {hiddenCount > 0 && (
                                <button
                                  type="button"
                                  onMouseDown={(event) => event.stopPropagation()}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setDayListDate(isoDate);
                                  }}
                                  className="absolute right-2 top-2 z-30 rounded-full bg-stone-800/92 px-2.5 py-0.5 text-[10px] font-semibold text-white shadow-md ring-1 ring-white/70 transition-colors hover:bg-stone-700"
                                >
                                  +{hiddenCount} more
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="pointer-events-none absolute inset-x-0 top-8 px-1 z-20">
                        <div className="grid auto-rows-[22px] grid-cols-7 gap-y-1">
                          {weekLayouts[weekIndex].visibleSegments.map((segment) => {
                            const isSelected = segment.entry.id === selectedEntryId;
                            const config = categoryConfig[segment.entry.category];
                            return (
                              <button
                                key={`${segment.entry.id}-${segment.startCol}-${segment.endCol}`}
                                type="button"
                                onMouseDown={(event) => {
                                  if (!isImpactEditMode) {
                                    return;
                                  }

                                  event.stopPropagation();
                                }}
                                onClick={(event) => {
                                  if (!isImpactEditMode) {
                                    return;
                                  }

                                  event.stopPropagation();
                                  openEditComposer(segment.entry);
                                }}
                                tabIndex={isImpactEditMode ? 0 : -1}
                                className={`group relative flex h-full select-none items-center overflow-hidden rounded px-2 text-left transition-all ${
                                  config.soft
                                } ${config.text} ${isImpactEditMode ? "pointer-events-auto" : "pointer-events-none"} ${isSelected ? `ring-1 ring-inset ${config.panelRing} bg-opacity-20 shadow-sm` : isImpactEditMode ? config.hoverState : ""}`}
                                style={{
                                  gridColumn: `${segment.startCol} / ${segment.endCol + 1}`,
                                  gridRow: `${segment.lane + 1}`,
                                }}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${config.accent} shrink-0`} />
                                <div className="flex min-w-0 items-center gap-1.5">
                                  <span className="truncate text-[10px] font-medium leading-none">
                                    {segment.entry.metricLabel}
                                  </span>
                                  <span className="shrink-0 rounded-full bg-white/75 px-1.5 py-0.5 text-[9px] font-semibold leading-none text-current">
                                    {formatImpactValue(segment.entry.value, segment.entry.valueType)}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}

                  {shouldShowRangeAction && rangeActionPosition && rangeActionRange && (
                    <div
                      className="absolute z-40 w-[min(22.5rem,calc(100%-2rem))] -translate-x-1/2"
                      style={{ left: rangeActionPosition.left, top: rangeActionPosition.top }}
                    >
                      <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3 shadow-xl">
                        <div>
                          <p className="text-sm font-medium text-stone-900">{formatImpactRange(rangeActionRange)}</p>
                          <p className="text-xs text-stone-500">
                            {getRangeLength(rangeActionRange.startDate, rangeActionRange.endDate)} day{getRangeLength(rangeActionRange.startDate, rangeActionRange.endDate) !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPanelMode("create")}
                          className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-stone-900 transition-colors hover:bg-amber-400"
                        >
                          Add impact
                        </button>
                        <button
                          type="button"
                          onClick={clearSelectionState}
                          className="ml-auto rounded-full p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
                        >
                          <span className="sr-only">Clear selection</span>
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m6 6 12 12M18 6 6 18" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </section>

        {dayListDate && (
          <ModalShell title={`Impacts on ${formatShortDate(dayListDate)}`} onClose={() => setDayListDate(null)} widthClassName="max-w-2xl">
            <div className="space-y-3">
              {dayListEntries.map((entry) => {
                const config = categoryConfig[entry.category];
                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => (isImpactEditMode ? openEditComposer(entry) : openDetail(entry))}
                    className="w-full rounded-2xl border border-stone-200 bg-white p-4 text-left shadow-sm transition-colors hover:border-stone-300 hover:bg-stone-50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${config.pill}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${config.accent}`} />
                          {config.label}
                        </span>
                        <h3 className="mt-2 text-sm font-semibold text-stone-900">{entry.metricLabel}</h3>
                        <p className="mt-1 text-xs text-stone-500">
                          {formatImpactRange(entry)} • {getRangeLength(entry.startDate, entry.endDate)} day{getRangeLength(entry.startDate, entry.endDate) !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${config.text}`}>
                          {formatImpactValue(entry.value, entry.valueType)}
                        </p>
                        <p className="mt-2 text-xs font-medium text-stone-500">
                          {isImpactEditMode ? "Edit impact" : "View impact"}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </ModalShell>
        )}

        {panelMode === "detail" && selectedEntry && (
          <ModalShell title="Impact details" onClose={clearSelectionState}>
            <div className="space-y-6">
              <div className={`rounded-2xl border p-5 ${categoryConfig[selectedEntry.category].soft} ${categoryConfig[selectedEntry.category].panelRing}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${categoryConfig[selectedEntry.category].text} mb-2`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${categoryConfig[selectedEntry.category].accent}`} />
                      {categoryConfig[selectedEntry.category].label}
                    </span>
                    <h3 className="text-xl font-semibold text-stone-900">{selectedEntry.metricLabel}</h3>
                  </div>
                  <div className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 shadow-sm">
                    <span className={`text-lg font-semibold ${categoryConfig[selectedEntry.category].text}`}>
                      {formatImpactValue(selectedEntry.value, selectedEntry.valueType)}
                    </span>
                  </div>
                </div>
                <p className="mt-4 text-sm text-stone-600">
                  {formatImpactRange(selectedEntry)} • {getRangeLength(selectedEntry.startDate, selectedEntry.endDate)} day{getRangeLength(selectedEntry.startDate, selectedEntry.endDate) !== 1 ? "s" : ""}
                </p>
              </div>

              {selectedEntry.story && (
                <div>
                  <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-stone-500">Notes</h4>
                  <p className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm leading-relaxed text-stone-700">
                    {selectedEntry.story}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => openEditComposer(selectedEntry)}
                  className="flex-1 rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-800"
                >
                  Edit impact
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteEntry(selectedEntry)}
                  className="rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
                >
                  Delete impact
                </button>
              </div>
            </div>
          </ModalShell>
        )}

        {(panelMode === "create" || panelMode === "edit") && activeRange && (
          <ModalShell
            title={panelMode === "edit" ? "Edit impact" : "Add impact"}
            onClose={() => {
              if (panelMode === "edit") {
                clearSelectionState();
                return;
              }

              setPanelMode("empty");
            }}
            widthClassName="max-w-2xl"
          >
            <div className="space-y-6">
              <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
                {panelMode === "edit" || panelMode === "create" ? (
                  <div className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-stone-500">
                          Start date
                        </span>
                        <input
                          type="date"
                          value={activeRange.startDate}
                          onInput={(event) => handleActiveRangeBoundaryChange("startDate", event.currentTarget.value)}
                          onChange={(event) => handleActiveRangeBoundaryChange("startDate", event.target.value)}
                          className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-stone-500">
                          End date
                        </span>
                        <input
                          type="date"
                          value={activeRange.endDate}
                          onInput={(event) => handleActiveRangeBoundaryChange("endDate", event.currentTarget.value)}
                          onChange={(event) => handleActiveRangeBoundaryChange("endDate", event.target.value)}
                          className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                        />
                      </label>
                    </div>

                    <p className="text-xs text-stone-500">
                      {formatImpactRange(activeRange)} • {getRangeLength(activeRange.startDate, activeRange.endDate)} day{getRangeLength(activeRange.startDate, activeRange.endDate) !== 1 ? "s" : ""}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-stone-900">{formatImpactRange(activeRange)}</p>
                    <p className="text-xs text-stone-500">
                      {getRangeLength(activeRange.startDate, activeRange.endDate)} day{getRangeLength(activeRange.startDate, activeRange.endDate) !== 1 ? "s" : ""}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-900">Category</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(categoryConfig) as ImpactCategory[]).map((category) => {
                      const isActive = composerDraft.category === category;
                      const config = categoryConfig[category];
                      const activeCategoryClasses = "border-stone-300 bg-stone-100 text-stone-900 shadow-sm";
                      return (
                        <button
                          key={category}
                          type="button"
                          onClick={() => handleCategoryChange(category)}
                          className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 text-sm transition-all ${
                            isActive
                              ? activeCategoryClasses
                              : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
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
                  <div className="mb-2 flex items-center justify-between">
                    <label className="block text-sm font-medium text-stone-900">What to measure</label>
                    <div className="flex rounded-lg bg-stone-100 p-0.5">
                      <button
                        type="button"
                        onClick={() => setComposerDraft((current) => ({ ...current, metricMode: "preset", selectedMetricId: availableMetrics[0]?.id ?? "" }))}
                        className={`rounded-md px-2.5 py-1 text-xs font-medium ${composerDraft.metricMode === "preset" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"}`}
                      >
                        Suggested
                      </button>
                      <button
                        type="button"
                        onClick={() => setComposerDraft((current) => ({ ...current, metricMode: "custom" }))}
                        className={`rounded-md px-2.5 py-1 text-xs font-medium ${composerDraft.metricMode === "custom" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"}`}
                      >
                        Custom
                      </button>
                    </div>
                  </div>

                  {composerDraft.metricMode === "preset" ? (
                    <CustomSelect
                      value={resolvedMetricId}
                      onChange={(val) => setComposerDraft((current) => ({ ...current, selectedMetricId: val }))}
                      options={availableMetrics.map((metric) => ({ value: metric.id, label: metric.label }))}
                      triggerClassName="w-full flex items-center justify-between rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                    />
                  ) : (
                    <div className="space-y-3">
                      <input
                        value={composerDraft.customMetricLabel}
                        onChange={(event) => setComposerDraft((current) => ({ ...current, customMetricLabel: event.target.value }))}
                        placeholder="E.g., Meals Delivered"
                        className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      />
                      <div className="flex gap-2">
                        {(["count", "currency"] as ImpactValueType[]).map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setComposerDraft((current) => ({ ...current, customValueType: type }))}
                            className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
                              composerDraft.customValueType === type
                                ? "border-stone-900 bg-stone-900 text-white"
                                : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
                            }`}
                          >
                            {type === "currency" ? "Dollar amount" : "Count"}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-900">Amount</label>
                  <div className="relative">
                    {composerValueType === "currency" && (
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-stone-500">$</span>
                    )}
                    <input
                      type="number"
                      min="0"
                      step={composerValueType === "currency" ? "0.01" : "1"}
                      value={composerDraft.value}
                      onChange={(event) => setComposerDraft((current) => ({ ...current, value: event.target.value }))}
                      placeholder={composerValueType === "currency" ? "0.00" : "0"}
                      className={`w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${composerValueType === "currency" ? "pl-8" : ""}`}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-900">
                    Notes <span className="font-normal text-stone-400">(Optional)</span>
                  </label>
                  <textarea
                    value={composerDraft.story}
                    onChange={(event) => setComposerDraft((current) => ({ ...current, story: event.target.value }))}
                    placeholder="Add context or a brief story..."
                    rows={4}
                    className="w-full resize-none rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleSaveEntry}
                  disabled={isPending}
                  className="flex-1 rounded-xl bg-amber-500 py-2.5 text-sm font-medium text-stone-900 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPending ? "Saving..." : panelMode === "edit" ? "Save Changes" : "Save Impact"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (panelMode === "edit") {
                      clearSelectionState();
                      return;
                    }

                    setPanelMode("empty");
                  }}
                  className="rounded-xl border border-stone-200 bg-white px-5 py-2.5 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-50 hover:text-stone-900"
                >
                  Cancel
                </button>
              </div>
            </div>
          </ModalShell>
        )}

        {saveMessage && (
          <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white shadow-xl">
            {saveMessage}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
