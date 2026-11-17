<template>
  <section class="npk-monitor panel" aria-labelledby="npk-title">
    <header class="npk-header">
      <div>
        <span class="section-kicker">Soil monitoring</span>
        <h2 id="npk-title">Root-zone condition</h2>
        <p>Demo telemetry uses the same schema as your future IoT device.</p>
      </div>
      <div class="npk-actions">
        <span :class="['status-badge', `status-${readingState}`]">
          <i></i>{{ readingStateLabel }}
        </span>
        <button class="text-button" type="button" @click="openTargetsDialog">Fertility targets</button>
        <button v-if="needsFirebaseLogin" class="primary-button compact-button" type="button" @click="connectDialogOpen = true">
          Connect sensor
        </button>
        <button v-else-if="firebaseUser" class="text-button" type="button" @click="disconnectSensor">
          Disconnect
        </button>
      </div>
    </header>

    <div v-if="connectionError" class="monitor-message error-state" role="alert">
      {{ connectionError }}
    </div>

    <div class="npk-cards" aria-label="Latest NPK readings">
      <article v-for="nutrient in nutrients" :key="nutrient.key" class="npk-card">
        <div class="npk-card-heading">
          <span>{{ nutrient.label }}</span>
          <strong>{{ nutrient.symbol }}</strong>
        </div>
        <div class="npk-value">
          {{ formatValue(latestReading?.[nutrient.key]) }}
          <small>mg/kg</small>
        </div>
        <span class="npk-card-status">{{ valueStatus(latestReading?.[nutrient.key]) }}</span>
      </article>
    </div>

    <div class="npk-meta">
      <span>Last upload: <strong>{{ latestReading ? formatDateTime(latestReading.updatedAt) : 'Awaiting data' }}</strong></span>
      <span v-if="firebaseUser">Sensor account connected</span>
      <span v-else>Firebase source: {{ firebaseConfigured ? 'ready' : 'not configured' }}</span>
    </div>

    <div class="fertility-row">
      <div :class="['fertility-badge', `fertility-${fertilityStatus.state}`]">
        <span class="fertility-icon" aria-hidden="true">{{ fertilityIcon }}</span>
        <div>
          <strong>{{ fertilityLabel }}</strong>
          <span v-if="fertilityStatus.state === 'below-targets'">
            Below: {{ belowNutrients }}
          </span>
          <span v-else-if="targets.profileName">Profile: {{ targets.profileName }}</span>
          <span v-else-if="fertilityStatus.state === 'targets-needed'">Set minimums for your dalandan crop.</span>
        </div>
      </div>
      <p class="target-note">This comparison uses your selected NPK targets, not an automatic fertility cutoff.</p>
    </div>

    <div class="chart-panel">
      <div class="chart-header">
        <div>
          <span class="mini-label">Current session</span>
          <strong>NPK trend</strong>
        </div>
        <div class="chart-toggles" role="group" aria-label="Chart nutrients">
          <label v-for="nutrient in nutrients" :key="nutrient.key">
            <input v-model="selectedNutrients" type="checkbox" :value="nutrient.key">
            <span>{{ nutrient.symbol }}</span>
          </label>
        </div>
      </div>
      <div v-if="history.length < 2" class="chart-empty">Waiting for at least two live readings.</div>
      <svg v-else class="npk-chart" viewBox="0 0 720 240" role="img" aria-label="NPK readings over time">
        <line v-for="y in chartGridLines" :key="y" x1="44" :y1="y" x2="700" :y2="y" class="chart-grid-line"/>
        <text v-for="label in chartLabels" :key="label.text" x="8" :y="label.y + 4" class="chart-axis-label">{{ label.text }}</text>
        <g v-for="nutrient in selectedNutrients" :key="nutrient">
          <polyline
            v-if="chartLines[nutrient]"
            :points="chartLines[nutrient]"
            fill="none"
            :stroke="nutrientColor(nutrient)"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </g>
      </svg>
      <div v-if="history.length >= 2 && !selectedNutrients.length" class="chart-empty chart-empty-overlay">
        Select N, P, or K to show a line.
      </div>
      <div class="chart-legend">
        <span v-for="nutrient in nutrients" :key="nutrient.key"><i :style="{ background: nutrient.color }"></i>{{ nutrient.symbol }}</span>
        <small>{{ history.length }} / 120 unique readings</small>
      </div>
    </div>

    <div v-if="connectDialogOpen" class="dialog-backdrop" role="presentation" @click.self="connectDialogOpen = false">
      <form class="dialog-card" aria-labelledby="connect-title" @submit.prevent="connectSensor">
        <button class="dialog-close" type="button" aria-label="Close dialog" @click="connectDialogOpen = false">×</button>
        <span class="section-kicker">Firebase access</span>
        <h3 id="connect-title">Connect sensor</h3>
        <p>Use an account that has read access to the sensor database. Your password is only sent to Firebase and is not stored by this app.</p>
        <label class="form-label">Email<input v-model.trim="connectForm.email" class="form-input" type="email" autocomplete="username" required></label>
        <label class="form-label">Password<input v-model="connectForm.password" class="form-input" type="password" autocomplete="current-password" required></label>
        <p v-if="authError" class="dialog-error" role="alert">{{ authError }}</p>
        <div class="dialog-actions">
          <button class="btn btn-outline" type="button" @click="connectDialogOpen = false">Cancel</button>
          <button class="btn btn-primary" type="submit" :disabled="connecting">{{ connecting ? 'Connecting...' : 'Connect' }}</button>
        </div>
      </form>
    </div>

    <div v-if="targetsDialogOpen" class="dialog-backdrop" role="presentation" @click.self="targetsDialogOpen = false">
      <form class="dialog-card" aria-labelledby="targets-title" @submit.prevent="saveTargets">
        <button class="dialog-close" type="button" aria-label="Close dialog" @click="targetsDialogOpen = false">×</button>
        <span class="section-kicker">Dalandan profile</span>
        <h3 id="targets-title">Fertility targets</h3>
        <p>Enter minimums validated for your crop and measurement method. No live thresholds are set by default.</p>
        <label class="form-label">Profile name (optional)<input v-model.trim="targetForm.profileName" class="form-input" type="text" maxlength="60"></label>
        <div class="target-grid">
          <label v-for="nutrient in nutrients" :key="nutrient.key" class="form-label">
            Minimum {{ nutrient.symbol }} (mg/kg)
            <input v-model.number="targetForm[nutrient.key]" class="form-input" type="number" min="0" step="any">
          </label>
        </div>
        <p v-if="targetError" class="dialog-error" role="alert">{{ targetError }}</p>
        <div class="dialog-actions">
          <button class="btn btn-outline" type="button" @click="clearTargets">Clear targets</button>
          <button class="btn btn-primary" type="submit">Save targets</button>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getDatabase, onValue, ref as databaseRef } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import {
  SOIL_READING_PATH,
  addUniqueReading,
  getFertilityStatus,
  getReadingState,
  readingHasAllNutrients,
  normalizeReading,
} from '../utils/soilMonitor.js';
import { saveNpkReading, readNpkHistory } from '../utils/farmerData.js';

const emit = defineEmits(['npk-update']);
const nutrients = [
  { key: 'nitrogen', label: 'Nitrogen', symbol: 'N', color: '#168a54' },
  { key: 'phosphorus', label: 'Phosphorus', symbol: 'P', color: '#df8d29' },
  { key: 'potassium', label: 'Potassium', symbol: 'K', color: '#5d72c6' },
];
const selectedNutrients = ref(nutrients.map(({ key }) => key));
const latestReading = ref(null);
const history = ref([]);
const connected = ref(false);
const accessError = ref(false);
const connectionError = ref('');
const now = ref(Date.now());
const firebaseUser = ref(null);
const connectDialogOpen = ref(false);
const targetsDialogOpen = ref(false);
const connecting = ref(false);
const authError = ref('');
const targetError = ref('');
const sensorDisconnected = ref(false);
const connectForm = reactive({ email: '', password: '' });
const targetForm = reactive({ profileName: '', nitrogen: null, phosphorus: null, potassium: null });
let firebaseApp;
let databaseUnsubscribe;
let connectionUnsubscribe;
let authUnsubscribe;
let clockHandle;
let lastEmittedState;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'https://npk-sensor-bcdb9-default-rtdb.asia-southeast1.firebasedatabase.app',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};
const firebaseConfigured = computed(() => Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId));
const needsFirebaseLogin = computed(() => Boolean(firebaseConfigured.value && firebaseUser.value === null && (accessError.value || sensorDisconnected.value)));
const readingState = computed(() => getReadingState({
  reading: latestReading.value,
  connected: connected.value,
  accessError: accessError.value,
  now: now.value,
}));
const readingStateLabel = computed(() => ({
  'awaiting-data': 'Awaiting data',
  live: 'Live',
  offline: 'Offline',
  stale: 'Stale',
  'access-error': 'Access error',
}[readingState.value]));
const targets = ref(loadTargets());
const fertilityStatus = computed(() => getFertilityStatus({
  reading: latestReading.value,
  targets: targets.value,
  currentState: readingState.value,
}));
const fertilityLabel = computed(() => ({
  'awaiting-current': 'Awaiting current data',
  'targets-needed': 'Targets needed',
  'meets-targets': 'Meets NPK targets',
  'below-targets': 'Below NPK targets',
}[fertilityStatus.value.state]));
const fertilityIcon = computed(() => fertilityStatus.value.state === 'meets-targets' ? '✓' : fertilityStatus.value.state === 'below-targets' ? '!' : '•');
const belowNutrients = computed(() => fertilityStatus.value.below.map((key) => nutrients.find((item) => item.key === key)?.symbol).join(', '));
const chartGridLines = [36, 92, 148, 204];
const chartLabels = computed(() => chartGridLines.map((y, index) => ({ y, text: formatValue(chartBounds.value.max - ((chartBounds.value.max - chartBounds.value.min) * index / 3)) })));
const chartBounds = computed(() => {
  const values = history.value.flatMap((reading) => nutrients.map(({ key }) => reading[key])).filter(Number.isFinite);
  if (!values.length) return { min: 0, max: 100 };
  const min = Math.min(0, ...values);
  const max = Math.max(...values, 1);
  return { min, max: max === min ? min + 1 : max };
});
const chartLines = computed(() => Object.fromEntries(nutrients.map(({ key }) => {
  const points = history.value
    .map((reading, index) => {
      if (!Number.isFinite(reading[key])) return null;
      const x = 44 + (index / Math.max(history.value.length - 1, 1)) * 656;
      const y = 204 - ((reading[key] - chartBounds.value.min) / (chartBounds.value.max - chartBounds.value.min)) * 168;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .filter(Boolean)
    .join(' ');
  return [key, points];
})));

watch(latestReading, emitNpkUpdate, { deep: true });
watch(readingState, (state) => {
  if (state !== lastEmittedState) emitNpkUpdate();
});

function emitNpkUpdate() {
  lastEmittedState = readingState.value;
  emit('npk-update', {
    reading: latestReading.value,
    state: readingState.value,
  });
}

function valueStatus(value) {
  return Number.isFinite(value) ? (readingState.value === 'live' ? 'Live value' : 'Last valid value') : 'Unavailable';
}

function formatValue(value) {
  return Number.isFinite(value) ? new Intl.NumberFormat('en-PH', { maximumFractionDigits: 2 }).format(value) : '—';
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeStyle: 'short' }).format(value);
}

function nutrientColor(key) {
  return nutrients.find((nutrient) => nutrient.key === key)?.color;
}

function loadTargets() {
  try {
    const saved = JSON.parse(localStorage.getItem('agridrone-npk-targets') || 'null');
    return saved && typeof saved === 'object' ? saved : {};
  } catch {
    return {};
  }
}

function openTargetsDialog() {
  Object.assign(targetForm, { profileName: targets.value.profileName || '', nitrogen: targets.value.nitrogen ?? null, phosphorus: targets.value.phosphorus ?? null, potassium: targets.value.potassium ?? null });
  targetError.value = '';
  targetsDialogOpen.value = true;
}

function saveTargets() {
  if (!['nitrogen', 'phosphorus', 'potassium'].every((key) => Number.isFinite(Number(targetForm[key])) && Number(targetForm[key]) >= 0)) {
    targetError.value = 'Enter a non-negative minimum for nitrogen, phosphorus, and potassium.';
    return;
  }
  const saved = { profileName: targetForm.profileName, nitrogen: Number(targetForm.nitrogen), phosphorus: Number(targetForm.phosphorus), potassium: Number(targetForm.potassium) };
  try {
    localStorage.setItem('agridrone-npk-targets', JSON.stringify(saved));
    targets.value = saved;
    targetsDialogOpen.value = false;
  } catch {
    targetError.value = 'Targets could not be saved in this browser.';
  }
}

function clearTargets() {
  try {
    localStorage.removeItem('agridrone-npk-targets');
    targets.value = {};
    targetsDialogOpen.value = false;
  } catch {
    targetError.value = 'Targets could not be cleared in this browser.';
  }
}

async function connectSensor() {
  if (!firebaseApp) return;
  connecting.value = true;
  authError.value = '';
  sensorDisconnected.value = false;
  try {
    await signInWithEmailAndPassword(getAuth(firebaseApp), connectForm.email, connectForm.password);
    connectForm.password = '';
    connectDialogOpen.value = false;
  } catch (error) {
    authError.value = error.message || 'Firebase sign-in failed.';
  } finally {
    connecting.value = false;
  }
}

async function disconnectSensor() {
  if (!firebaseApp) return;
  sensorDisconnected.value = true;
  await signOut(getAuth(firebaseApp));
  stopDatabaseListeners();
  connected.value = false;
  accessError.value = false;
  connectionError.value = '';
}

function startDatabaseListeners() {
  stopDatabaseListeners();
  const database = getDatabase(firebaseApp);
  connectionUnsubscribe = onValue(databaseRef(database, '.info/connected'), (snapshot) => {
    connected.value = snapshot.val() === true;
    if (connected.value) accessError.value = false;
  });
  databaseUnsubscribe = onValue(databaseRef(database, SOIL_READING_PATH), (snapshot) => {
    const reading = normalizeReading(snapshot.val());
    if (!reading) return;
    latestReading.value = reading;
    history.value = addUniqueReading(history.value, reading);
    saveNpkReading(reading);
    accessError.value = false;
    connectionError.value = '';
  }, (error) => {
    accessError.value = error?.code === 'PERMISSION_DENIED' || error?.code === 'permission_denied';
    connectionError.value = error?.message || 'Unable to read the Firebase sensor.';
    if (!accessError.value) connected.value = false;
  });
}

function stopDatabaseListeners() {
  databaseUnsubscribe?.();
  connectionUnsubscribe?.();
  databaseUnsubscribe = null;
  connectionUnsubscribe = null;
}

onMounted(() => {
  history.value = readNpkHistory();
  clockHandle = window.setInterval(() => { now.value = Date.now(); }, 1000);
  if (!firebaseConfigured.value) {
    connectionError.value = 'Firebase client configuration is missing. Add the VITE_FIREBASE_* fields from .env.example.';
    accessError.value = true;
    return;
  }
  try {
    firebaseApp = initializeApp(firebaseConfig, 'agridrone-soil-monitor');
    authUnsubscribe = onAuthStateChanged(getAuth(firebaseApp), (user) => {
      firebaseUser.value = user;
      if (sensorDisconnected.value) {
        stopDatabaseListeners();
        return;
      }
      startDatabaseListeners();
    });
  } catch (error) {
    connectionError.value = error.message || 'Firebase could not be initialized.';
    accessError.value = true;
  }
});

onBeforeUnmount(() => {
  window.clearInterval(clockHandle);
  stopDatabaseListeners();
  authUnsubscribe?.();
});
</script>

<style scoped>
.npk-monitor { margin: 18px 0; padding: 28px; font-family: var(--font-family); }
.npk-header, .npk-actions, .npk-meta, .fertility-row, .chart-header, .chart-legend { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
.npk-header { align-items: flex-start; margin-bottom: 22px; }
.npk-header h2 { margin: 4px 0 6px; font-size: 1.55rem; letter-spacing: -.025em; }
.npk-header p { margin: 0; color: var(--text-secondary); font-size: .88rem; }
.section-kicker, .mini-label { color: var(--primary); font-size: .7rem; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; }
.npk-actions { flex-wrap: wrap; justify-content: flex-end; }
.status-badge, .fertility-badge { display: inline-flex; align-items: center; gap: 8px; border-radius: 999px; font-size: .75rem; font-weight: 800; }
.status-badge { padding: 7px 10px; background: var(--bg-secondary); }
.status-badge i { width: 7px; height: 7px; border-radius: 50%; background: var(--text-muted); }
.status-live i { background: var(--success); }.status-stale i, .status-awaiting-data i { background: var(--warning); }.status-offline i, .status-access-error i { background: var(--error); }
.npk-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.npk-card { padding: 18px; border: 1px solid var(--border); border-radius: 15px; background: var(--bg-secondary); }
.npk-card-heading, .npk-card-status { display: flex; justify-content: space-between; color: var(--text-secondary); font-size: .82rem; font-weight: 700; }
.npk-card-heading span { color: var(--text-secondary); font-weight: 700; }.npk-card-heading strong { color: var(--primary); font-size: .86rem; font-weight: 800; }.npk-value { margin: 14px 0 11px; color: var(--text); font-size: 2.1rem; line-height: 1; font-weight: 800; letter-spacing: -.04em; font-variant-numeric: tabular-nums; }.npk-value small { margin-left: 5px; color: var(--text-secondary); font-size: .82rem; font-weight: 600; letter-spacing: 0; }.npk-card-status { display: block; font-size: .78rem; }
.npk-meta { margin: 13px 0; color: var(--text-secondary); font-size: .72rem; flex-wrap: wrap; }.npk-meta strong { color: var(--text); font-weight: 700; }
.monitor-message { margin-bottom: 14px; padding: 12px 14px; border-radius: 10px; }.error-state { color: var(--error-text); background: var(--error-bg); }
.fertility-row { align-items: flex-start; padding: 14px; border: 1px solid var(--border); border-radius: 13px; }.fertility-badge { padding: 9px 12px; }.fertility-badge > div { display: grid; gap: 2px; }.fertility-badge strong { font-size: .72rem; font-weight: 800; }.fertility-badge span:last-child { color: var(--text-secondary); font-size: .68rem; font-weight: 500; }.fertility-icon { display: grid; width: 22px; height: 22px; place-items: center; border-radius: 50%; color: #fff; background: var(--text-muted); }.fertility-meets-targets { color: var(--success-text); background: var(--success-bg); }.fertility-meets-targets .fertility-icon { background: var(--success); }.fertility-below-targets { color: var(--warning-text); background: var(--warning-bg); }.fertility-below-targets .fertility-icon { background: var(--warning); }.target-note { max-width: 400px; margin: 0; color: var(--text-secondary); font-size: .7rem; text-align: right; }
.chart-panel { position: relative; margin-top: 18px; padding: 18px; border: 1px solid var(--border); border-radius: 15px; }.chart-header { align-items: flex-start; }.chart-header strong { display: block; margin-top: 4px; font-size: .86rem; }.chart-toggles { display: flex; gap: 8px; }.chart-toggles label { cursor: pointer; }.chart-toggles input { position: absolute; opacity: 0; }.chart-toggles span { display: inline-flex; min-width: 31px; min-height: 28px; align-items: center; justify-content: center; border: 1px solid var(--border); border-radius: 7px; color: var(--text-secondary); font-size: .7rem; font-weight: 800; }.chart-toggles input:checked + span { color: #fff; background: var(--primary); border-color: var(--primary); }.npk-chart { display: block; width: 100%; height: 240px; margin-top: 12px; }.chart-grid-line { stroke: var(--border); stroke-dasharray: 4 5; }.chart-axis-label { fill: var(--text-secondary); font-size: 10px; }.chart-empty { display: grid; min-height: 240px; place-items: center; color: var(--text-secondary); font-size: .78rem; }.chart-empty-overlay { position: absolute; inset: 62px 18px 38px; background: color-mix(in srgb, var(--card) 78%, transparent); }.chart-legend { justify-content: flex-start; flex-wrap: wrap; color: var(--text-secondary); font-size: .68rem; }.chart-legend span { display: inline-flex; align-items: center; gap: 5px; }.chart-legend i { width: 8px; height: 8px; border-radius: 50%; }.chart-legend small { margin-left: auto; }.compact-button { min-height: 34px; padding: 7px 10px; }
.dialog-backdrop { position: fixed; inset: 0; z-index: 100; display: grid; place-items: center; padding: 18px; background: rgb(15 23 42 / 55%); }.dialog-card { position: relative; width: min(100%, 500px); max-height: calc(100vh - 36px); overflow: auto; padding: 28px; border: 1px solid var(--border); border-radius: 18px; background: var(--card); box-shadow: var(--shadow-lg); }.dialog-card h3 { margin: 5px 0 8px; }.dialog-card p { color: var(--text-secondary); font-size: .82rem; }.dialog-close { position: absolute; top: 12px; right: 14px; border: 0; background: transparent; color: var(--text-secondary); font-size: 1.5rem; cursor: pointer; }.form-label { display: grid; gap: 6px; margin-top: 14px; color: var(--text); font-size: .78rem; font-weight: 700; }.target-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }.dialog-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }.dialog-error { color: var(--error-text) !important; }.dialog-actions .btn { width: auto; }
@media (max-width: 700px) { .npk-monitor { padding: 20px 16px; }.npk-header, .fertility-row { flex-direction: column; align-items: stretch; }.npk-actions { justify-content: flex-start; }.npk-cards { grid-template-columns: 1fr; }.target-note { max-width: none; text-align: left; }.target-grid { grid-template-columns: 1fr; }.chart-header { flex-direction: column; }.chart-toggles { align-self: stretch; }.chart-toggles label { flex: 1; }.chart-toggles span { width: 100%; } }
</style>
