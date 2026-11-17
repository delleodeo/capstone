import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const FARMER_APP_NAME = 'agridrone-farmer-dashboard';
const DETECTION_HISTORY_PREFIX = 'agridrone-detection-history';
const NPK_HISTORY_KEY = 'agridrone-npk-history';
const MAX_HISTORY = 50;
const ACTIVE_FARMER_ID_KEY = 'agridrone-active-farmer-id';

export const firebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
);

export function getFarmerAuth() {
  if (!firebaseConfigured) return null;

  const existingApp = getApps().find((app) => app.name === FARMER_APP_NAME);
  const app = existingApp || initializeApp(firebaseConfig, FARMER_APP_NAME);
  return getAuth(app);
}

export function rememberFarmer(user) {
  if (user?.uid) localStorage.setItem(ACTIVE_FARMER_ID_KEY, user.uid);
}

export function getCurrentFarmerId() {
  const auth = getFarmerAuth();
  return auth?.currentUser?.uid || localStorage.getItem(ACTIVE_FARMER_ID_KEY) || 'anonymous';
}

export function forgetFarmer() {
  localStorage.removeItem(ACTIVE_FARMER_ID_KEY);
}

export function getDetectionHistoryStorageKey(userId = 'anonymous') {
  return `${DETECTION_HISTORY_PREFIX}-${userId}`;
}

export function readDetectionHistory(userId = 'anonymous') {
  try {
    const stored = JSON.parse(localStorage.getItem(getDetectionHistoryStorageKey(userId)) || '[]');
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

export function saveDetectionHistory(result, userId = 'anonymous') {
  if (!result || result.status !== 'detected') return;

  const record = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: result.timestamp || new Date().toISOString(),
    detections: (result.allPredictions || []).map((prediction) => ({
      diseaseKey: prediction.diseaseKey,
      displayName: prediction.displayName,
      category: prediction.category,
      confidence: prediction.confidence,
    })),
  };
  const history = [record, ...readDetectionHistory(userId)].slice(0, MAX_HISTORY);

  try {
    localStorage.setItem(getDetectionHistoryStorageKey(userId), JSON.stringify(history));
  } catch {
    // History is optional local data; detection itself should continue if storage is unavailable.
  }
}

export function readNpkHistory() {
  try {
    const stored = JSON.parse(localStorage.getItem(NPK_HISTORY_KEY) || '[]');
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

export function saveNpkReading(reading) {
  if (!reading) return;
  const history = [
    reading,
    ...readNpkHistory().filter((item) => item.updatedAt !== reading.updatedAt),
  ].slice(0, MAX_HISTORY);

  try {
    localStorage.setItem(NPK_HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Live sensor monitoring should continue if browser storage is unavailable.
  }
}
