import { ImpactEntry } from "./types";

const monthLabelFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

const weekdayLabelFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
});

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

export function parseISODate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function toISODate(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(value: Date, amount: number): Date {
  const next = new Date(value);
  next.setDate(next.getDate() + amount);
  return next;
}

export function addMonths(value: Date, amount: number): Date {
  const next = new Date(value);
  next.setMonth(next.getMonth() + amount);
  return next;
}

export function startOfMonth(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), 1);
}

export function endOfMonth(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth() + 1, 0);
}

export function startOfWeek(value: Date): Date {
  return addDays(value, -value.getDay());
}

export function endOfWeek(value: Date): Date {
  return addDays(startOfWeek(value), 6);
}

export function normalizeRange(startDate: string, endDate: string) {
  return startDate <= endDate
    ? { startDate, endDate }
    : { startDate: endDate, endDate: startDate };
}

export function getMonthGrid(anchorDate: Date): Date[][] {
  const monthStart = startOfMonth(anchorDate);
  const gridStart = startOfWeek(monthStart);
  const weeks: Date[][] = [];

  for (let weekIndex = 0; weekIndex < 6; weekIndex += 1) {
    const weekStart = addDays(gridStart, weekIndex * 7);
    weeks.push(Array.from({ length: 7 }, (_, dayIndex) => addDays(weekStart, dayIndex)));
  }

  return weeks;
}

export function getWeekdayLabels() {
  return Array.from({ length: 7 }, (_, dayIndex) =>
    weekdayLabelFormatter.format(addDays(new Date(2026, 0, 4), dayIndex)),
  );
}

export function formatMonthLabel(value: Date) {
  return monthLabelFormatter.format(value);
}

export function formatShortDate(value: string) {
  return shortDateFormatter.format(parseISODate(value));
}

export function isSameMonth(day: Date, monthDate: Date) {
  return day.getMonth() === monthDate.getMonth() && day.getFullYear() === monthDate.getFullYear();
}

export function isToday(day: Date) {
  return toISODate(day) === toISODate(new Date());
}

export function isDateWithinRange(targetDate: string, startDate: string, endDate: string) {
  return targetDate >= startDate && targetDate <= endDate;
}

export function getRangeLength(startDate: string, endDate: string) {
  const start = parseISODate(startDate);
  const end = parseISODate(endDate);
  return Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
}

export function entryIntersectsRange(entry: ImpactEntry, startDate: string, endDate: string) {
  return !(entry.endDate < startDate || entry.startDate > endDate);
}

export function entryOccursOnDate(entry: ImpactEntry, date: string) {
  return isDateWithinRange(date, entry.startDate, entry.endDate);
}

export function sortImpactEntries(entries: ImpactEntry[]) {
  return [...entries].sort((left, right) => {
    if (left.startDate !== right.startDate) {
      return left.startDate.localeCompare(right.startDate);
    }

    if (left.endDate !== right.endDate) {
      return right.endDate.localeCompare(left.endDate);
    }

    return left.metricLabel.localeCompare(right.metricLabel);
  });
}

