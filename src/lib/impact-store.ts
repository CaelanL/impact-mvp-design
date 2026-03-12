import { impactEntries, metricOptions } from "./data";
import { sortImpactEntries } from "./impact-calendar";
import { ImpactCategory, ImpactEntry, ImpactMetricOption } from "./types";

const IMPACT_STORAGE_KEY = "impact360_impact_entries_v2";
const PRESET_STORAGE_KEY = "impact360_custom_metric_presets_v1";

type CustomPresetRecord = Record<string, ImpactMetricOption[]>;

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readEntriesFromStorage(): ImpactEntry[] {
  if (!canUseStorage()) {
    return impactEntries;
  }

  const saved = window.localStorage.getItem(IMPACT_STORAGE_KEY);
  if (!saved) {
    window.localStorage.setItem(IMPACT_STORAGE_KEY, JSON.stringify(impactEntries));
    return impactEntries;
  }

  try {
    return JSON.parse(saved) as ImpactEntry[];
  } catch {
    window.localStorage.setItem(IMPACT_STORAGE_KEY, JSON.stringify(impactEntries));
    return impactEntries;
  }
}

function writeEntriesToStorage(entries: ImpactEntry[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(IMPACT_STORAGE_KEY, JSON.stringify(sortImpactEntries(entries)));
}

function readCustomPresets(): CustomPresetRecord {
  if (!canUseStorage()) {
    return {};
  }

  const saved = window.localStorage.getItem(PRESET_STORAGE_KEY);
  if (!saved) {
    return {};
  }

  try {
    return JSON.parse(saved) as CustomPresetRecord;
  } catch {
    return {};
  }
}

function writeCustomPresets(presets: CustomPresetRecord) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(presets));
}

function presetKey(ventureId: string, category: ImpactCategory) {
  return `${ventureId}:${category}`;
}

export function listImpactEntriesForVenture(ventureId: string) {
  return sortImpactEntries(readEntriesFromStorage().filter((entry) => entry.ventureId === ventureId));
}

export function saveImpactEntry(entry: ImpactEntry) {
  const entries = readEntriesFromStorage();
  const nextEntries = entries.some((current) => current.id === entry.id)
    ? entries.map((current) => (current.id === entry.id ? entry : current))
    : [...entries, entry];

  writeEntriesToStorage(nextEntries);
  return entry;
}

export function deleteImpactEntry(entryId: string) {
  writeEntriesToStorage(readEntriesFromStorage().filter((entry) => entry.id !== entryId));
}

export function listMetricOptionsForVenture(ventureId: string, category: ImpactCategory) {
  const customPresets = readCustomPresets()[presetKey(ventureId, category)] ?? [];
  const merged = [...metricOptions[category], ...customPresets];
  const deduped = new Map<string, ImpactMetricOption>();

  for (const metric of merged) {
    deduped.set(metric.id, metric);
  }

  return Array.from(deduped.values());
}

export function saveCustomMetricPreset(ventureId: string, preset: ImpactMetricOption) {
  const presets = readCustomPresets();
  const key = presetKey(ventureId, preset.category);
  const next = [...(presets[key] ?? []).filter((metric) => metric.id !== preset.id), preset];
  presets[key] = next.sort((left, right) => left.label.localeCompare(right.label));
  writeCustomPresets(presets);
}

