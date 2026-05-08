/**
 * healthkit.js — Apple Health integration for Lift Tracker
 *
 * Uses window.Capacitor (injected by the native iOS shell) directly —
 * no bundler or build step required. All functions are silent no-ops when
 * running on the web (GitHub Pages / Safari PWA), so the web version is
 * completely unaffected.
 *
 * Architecture:
 *   • window.Capacitor is provided by the Capacitor iOS native wrapper
 *   • window.Capacitor.registerPlugin('Health') proxies to the native
 *     @capacitor-community/health Swift plugin compiled into the iOS app
 *   • getCachedWeight() lets session.js read the latest weight synchronously
 *     (pre-fetched at app startup via initHealthKit())
 */

const HEALTH_SETTINGS_KEY = 'liftHealthSettings';

// ── Persisted settings ──────────────────────────────────────────────────────

const _defaultSettings = {
  enabled: true,
  readSteps: true,
  readWeight: true
};

let _settings = { ..._defaultSettings };
let _permissionsGranted = false;
let _cachedWeight = null; // { value: number, unit: string, date: Date } | null

export function loadHealthSettings() {
  try {
    const raw = localStorage.getItem(HEALTH_SETTINGS_KEY);
    if (raw) Object.assign(_settings, JSON.parse(raw));
  } catch (e) {}
}

function _save() {
  try {
    localStorage.setItem(HEALTH_SETTINGS_KEY, JSON.stringify(_settings));
  } catch (e) {}
}

export function getHealthSettings() { return { ..._settings, permissionsGranted: _permissionsGranted }; }
export function setHealthEnabled(val)   { _settings.enabled = !!val; _save(); }
export function setReadSteps(val)       { _settings.readSteps = !!val; _save(); }
export function setReadWeight(val)      { _settings.readWeight = !!val; _save(); }

// ── Platform detection ──────────────────────────────────────────────────────

/**
 * Returns true only when running inside the Capacitor iOS native wrapper.
 * Always false on the web version — guards every HealthKit call below.
 */
export function isHealthKitAvailable() {
  const cap = window.Capacitor;
  return !!(cap?.isNativePlatform?.() && cap?.getPlatform?.() === 'ios');
}

/** Internal — returns the native Health plugin proxy, or null on web. */
function _plugin() {
  if (!isHealthKitAvailable() || !_settings.enabled) return null;
  // registerPlugin is available globally in the Capacitor native context.
  // The native Swift handler is compiled in via @capacitor-community/health.
  return window.Capacitor.registerPlugin('Health');
}

// ── Permissions ─────────────────────────────────────────────────────────────

/**
 * Presents the native iOS HealthKit authorization sheet.
 * iOS only shows this dialog once; subsequent calls resolve immediately.
 * Returns true if the request succeeded (user may still deny individual types).
 */
export async function requestHealthPermissions() {
  const plugin = _plugin();
  if (!plugin) return false;

  try {
    const types = [];
    if (_settings.readSteps)  types.push('steps');
    if (_settings.readWeight) types.push('weight');
    if (types.length === 0) return false;

    await plugin.requestAuthorization({ read: types, write: ['workout'] });
    _permissionsGranted = true;
    return true;
  } catch (e) {
    console.warn('[HealthKit] requestHealthPermissions:', e?.message ?? e);
    return false;
  }
}

/** Non-prompting availability check. */
export async function isHealthAvailable() {
  const plugin = _plugin();
  if (!plugin) return false;
  try {
    const result = await plugin.isAvailable();
    return !!result?.available;
  } catch (e) {
    return false;
  }
}

// ── Internal helpers ─────────────────────────────────────────────────────────

function _startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
}

function _endOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
}

function _sumSamples(resultData) {
  if (!resultData?.length) return 0;
  return resultData.reduce((sum, s) => sum + (parseFloat(s.value) || 0), 0);
}

// ── Steps ───────────────────────────────────────────────────────────────────

/**
 * Returns today's total step count as a rounded integer, or null on failure.
 */
export async function getTodaySteps() {
  const plugin = _plugin();
  if (!plugin || !_settings.readSteps) return null;
  try {
    const now = new Date();
    const result = await plugin.queryHKitSampleType({
      sampleType: 'steps',
      startDate: _startOfDay(now).toISOString(),
      endDate:   now.toISOString(),
      limit: 0
    });
    return Math.round(_sumSamples(result?.resultData));
  } catch (e) {
    console.warn('[HealthKit] getTodaySteps:', e?.message ?? e);
    return null;
  }
}

/**
 * Returns the step count for a specific Date, or null on failure.
 */
export async function getStepsForDate(date) {
  const plugin = _plugin();
  if (!plugin || !_settings.readSteps) return null;
  try {
    const result = await plugin.queryHKitSampleType({
      sampleType: 'steps',
      startDate: _startOfDay(date).toISOString(),
      endDate:   _endOfDay(date).toISOString(),
      limit: 0
    });
    return Math.round(_sumSamples(result?.resultData));
  } catch (e) {
    console.warn('[HealthKit] getStepsForDate:', e?.message ?? e);
    return null;
  }
}

/**
 * Returns an array of { date: 'YYYY-MM-DD', steps: number }
 * covering the last `days` calendar days, sorted oldest → newest.
 */
export async function getStepsHistory(days = 30) {
  const plugin = _plugin();
  if (!plugin || !_settings.readSteps) return [];
  try {
    const now   = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - days);
    start.setHours(0, 0, 0, 0);

    const result = await plugin.queryHKitSampleType({
      sampleType: 'steps',
      startDate: start.toISOString(),
      endDate:   now.toISOString(),
      limit: 0
    });

    // Aggregate individual samples into per-day totals
    const byDate = {};
    (result?.resultData ?? []).forEach(s => {
      const key = new Date(s.startDate).toISOString().split('T')[0];
      byDate[key] = (byDate[key] ?? 0) + (parseFloat(s.value) || 0);
    });

    return Object.entries(byDate)
      .map(([date, steps]) => ({ date, steps: Math.round(steps) }))
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch (e) {
    console.warn('[HealthKit] getStepsHistory:', e?.message ?? e);
    return [];
  }
}

// ── Weight ───────────────────────────────────────────────────────────────────

/**
 * Returns the most recent weight entry as { value, unit, date } or null.
 * Result is also cached in _cachedWeight for synchronous access by session.js.
 */
export async function getMostRecentWeight() {
  const plugin = _plugin();
  if (!plugin || !_settings.readWeight) return null;
  try {
    const result = await plugin.queryHKitSampleType({
      sampleType: 'weight',
      startDate:  new Date(Date.now() - 365 * 86_400_000).toISOString(),
      endDate:    new Date().toISOString(),
      limit: 1
    });
    const samples = result?.resultData;
    if (!samples?.length) return null;
    const s = samples[0];
    const entry = {
      value: parseFloat(s.value),
      unit:  s.unit ?? 'lb',
      date:  new Date(s.startDate)
    };
    _cachedWeight = entry;
    return entry;
  } catch (e) {
    console.warn('[HealthKit] getMostRecentWeight:', e?.message ?? e);
    return null;
  }
}

/**
 * Returns weight history as [{ date: Date, weight: number, unit: string }]
 * sorted oldest → newest.
 */
export async function getWeightHistory(days = 90) {
  const plugin = _plugin();
  if (!plugin || !_settings.readWeight) return [];
  try {
    const now   = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - days);

    const result = await plugin.queryHKitSampleType({
      sampleType: 'weight',
      startDate:  start.toISOString(),
      endDate:    now.toISOString(),
      limit: 0
    });

    return (result?.resultData ?? [])
      .map(s => ({
        date:   new Date(s.startDate),
        weight: parseFloat(s.value),
        unit:   s.unit ?? 'lb'
      }))
      .sort((a, b) => a.date - b.date);
  } catch (e) {
    console.warn('[HealthKit] getWeightHistory:', e?.message ?? e);
    return [];
  }
}

/**
 * Synchronous — returns the last weight fetched during initHealthKit()
 * (or a subsequent getMostRecentWeight() call), or null.
 * Safe to call from session.js without async.
 */
export function getCachedWeight() {
  return _cachedWeight;
}

// ── Init ─────────────────────────────────────────────────────────────────────

/**
 * Call once at app startup.
 * Loads saved settings, requests HealthKit permissions (iOS only), then
 * pre-fetches today's steps and the most recent weight in parallel.
 *
 * Returns { steps: number|null, weight: { value, unit, date }|null }
 */
export async function initHealthKit() {
  loadHealthSettings();

  if (!isHealthKitAvailable() || !_settings.enabled) {
    return { steps: null, weight: null };
  }

  const granted = await requestHealthPermissions();
  if (!granted) return { steps: null, weight: null };

  const [steps, weight] = await Promise.all([
    getTodaySteps(),
    getMostRecentWeight()   // also populates _cachedWeight
  ]);

  return { steps, weight };
}
