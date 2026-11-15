export const SOIL_READING_PATH = 'devices/npk-esp32/latest';
export const STALE_AFTER_MS = 45_000;

const NUTRIENTS = ['nitrogen', 'phosphorus', 'potassium'];

export function normalizeReading(raw) {
  if (!raw || typeof raw !== 'object') return null;

  const updatedAt = Number(raw.updatedAt);
  if (!Number.isFinite(updatedAt) || updatedAt < 0) return null;

  return {
    nitrogen: normalizeNutrient(raw.nitrogen),
    phosphorus: normalizeNutrient(raw.phosphorus),
    potassium: normalizeNutrient(raw.potassium),
    unit: raw.unit === 'mg/kg' ? raw.unit : 'mg/kg',
    updatedAt,
  };
}

export function readingHasAllNutrients(reading) {
  return Boolean(reading) && NUTRIENTS.every((nutrient) => Number.isFinite(reading[nutrient]));
}

export function isReadingStale(reading, now = Date.now()) {
  return !reading || now - reading.updatedAt > STALE_AFTER_MS;
}

export function getReadingState({ reading, connected, accessError = false, now = Date.now() }) {
  if (accessError) return 'access-error';
  if (!connected) return 'offline';
  if (!reading) return 'awaiting-data';
  return isReadingStale(reading, now) ? 'stale' : 'live';
}

export function addUniqueReading(history, reading, maxReadings = 120) {
  if (!reading) return history;
  const next = history.filter((item) => item.updatedAt !== reading.updatedAt);
  next.push(reading);
  next.sort((a, b) => a.updatedAt - b.updatedAt);
  return next.slice(-maxReadings);
}

export function getFertilityStatus({ reading, targets, currentState }) {
  if (currentState !== 'live' || !readingHasAllNutrients(reading)) {
    return { state: 'awaiting-current', below: [] };
  }

  if (!targets || !NUTRIENTS.every((nutrient) => Number.isFinite(targets[nutrient]))) {
    return { state: 'targets-needed', below: [] };
  }

  const below = NUTRIENTS.filter((nutrient) => reading[nutrient] < targets[nutrient]);
  return {
    state: below.length ? 'below-targets' : 'meets-targets',
    below,
  };
}

export function mergeNpkAssessment(assessment, reading) {
  if (!assessment || !readingHasAllNutrients(reading)) return assessment;

  const bands = {
    n: { min: 40, max: 65, acceptableMin: 20, acceptableMax: 90 },
    p: { min: 25, max: 40, acceptableMin: 12, acceptableMax: 65 },
    k: { min: 40, max: 70, acceptableMin: 20, acceptableMax: 100 },
  };
  const components = assessment.components.map((component) => {
    const nutrient = component.key === 'n' ? reading.nitrogen : component.key === 'p' ? reading.phosphorus : component.key === 'k' ? reading.potassium : null;
    if (!Number.isFinite(nutrient)) return component;
    const score = Math.round(scoreBand(nutrient, bands[component.key]));
    return { ...component, value: nutrient, score, status: score >= 90 ? 'optimal' : score >= 70 ? 'watch' : 'attention' };
  });
  const score = Math.round(components.reduce((total, component) => total + component.score * component.weight, 0));
  return {
    ...assessment,
    score,
    grade: score >= 90 ? 'Excellent' : score >= 75 ? 'Good' : score >= 60 ? 'Fair' : 'Needs attention',
    attention: components.filter((component) => component.status !== 'optimal').sort((a, b) => a.score - b.score).slice(0, 3).map((component) => component.key),
    components,
  };
}

function normalizeNutrient(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

function scoreBand(value, band) {
  if (value >= band.min && value <= band.max) {
    const midpoint = (band.min + band.max) / 2;
    const halfWidth = Math.max((band.max - band.min) / 2, 0.01);
    return 90 + (1 - Math.abs(value - midpoint) / halfWidth) * 10;
  }
  if (value < band.min) {
    if (value <= band.acceptableMin) return Math.max(20, 60 - ((band.acceptableMin - value) / Math.max(band.acceptableMin, 1)) * 40);
    return 60 + ((value - band.acceptableMin) / (band.min - band.acceptableMin)) * 30;
  }
  if (value >= band.acceptableMax) return Math.max(20, 60 - ((value - band.acceptableMax) / Math.max(band.acceptableMax, 1)) * 40);
  return 90 - ((value - band.max) / (band.acceptableMax - band.max)) * 30;
}
