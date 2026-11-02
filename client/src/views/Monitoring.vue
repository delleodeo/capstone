<template>
  <div class="container">
    <h1>Field Monitoring</h1>

    <section class="card grid-3">
      <div>
        <h3>Latest Soil</h3>
        <div v-if="latestSoil" class="soil-summary">
          <div class="stat">Moisture<br/><strong>{{ latestSoil.moisture ?? '—' }}%</strong></div>
          <div class="stat">Temp<br/><strong>{{ latestSoil.temperature ?? '—' }}°C</strong></div>
          <div class="stat">pH<br/><strong>{{ latestSoil.ph ?? '—' }}</strong></div>
        </div>
        <div v-else class="muted">No soil reading available</div>
      </div>

      <div>
        <h3>Recent Readings</h3>
        <ul class="history-list">
          <li v-for="s in soilHistory" :key="s.id">{{ new Date(s.timestamp).toLocaleString() }} — moisture: {{ s.moisture }}%, pH: {{ s.ph }}, temp: {{ s.temperature }}°C</li>
        </ul>
      </div>

      <div>
        <h3>Actions</h3>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-secondary" @click="sendSampleReading">Send Sample</button>
          <button class="btn" @click="loadLatestSoil">Refresh</button>
        </div>
      </div>
    </section>

    <section class="card grid-2">
      <div>
        <h3>Location</h3>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <label>Lat <input class="input" v-model.number="lat" type="number" step="0.0001" /></label>
          <label>Lon <input class="input" v-model.number="lon" type="number" step="0.0001" /></label>
          <label>Days <input class="input short" v-model.number="days" type="number" min="1" max="16" /></label>
          <button class="btn btn-primary" @click="loadWeather">Refresh Weather</button>
        </div>
      </div>

      <div>
        <h3>Weather Summary</h3>
        <div v-if="weatherData">
          <div class="muted">Provider: Open-Meteo</div>
          <div style="margin-top:8px">
            <strong>Daily</strong>
            <ul>
              <li v-if="weatherData.daily && weatherData.daily.time" v-for="(t, i) in weatherData.daily.time" :key="t">
                <div class="daily-row">
                  <div class="day">{{ t }}</div>
                  <div class="day-stats">max: <strong>{{ weatherData.daily.temperature_2m_max[i] }}°C</strong> &nbsp; min: <strong>{{ weatherData.daily.temperature_2m_min[i] }}°C</strong> &nbsp; precip: <strong>{{ weatherData.daily.precipitation_sum[i] }} mm</strong></div>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div v-else class="muted">Weather not loaded yet</div>
      </div>
    </section>

    <section class="card yield-card">
      <div class="section-heading">
        <div>
          <h2>Yield Prediction (Sinturis)</h2>
          <p class="muted">Structured summary from the latest soil and weather inputs.</p>
        </div>
        <div v-if="prediction?.timestamp" class="prediction-time">
          Updated {{ formatDateTime(prediction.timestamp) }}
        </div>
      </div>

      <div class="yield-block">
        <div class="yield-controls">
          <label class="inline-label">Base yield (kg/ha)
            <input class="input short" v-model.number="baseYield" type="number" />
          </label>
          <button class="btn btn-primary" @click="predictYield">Predict</button>
          <button class="btn" @click="showRaw = !showRaw">{{ showRaw ? 'Hide details' : 'Show details' }}</button>
          <button class="btn" @click="copyJSON">Copy JSON</button>
          <button class="btn" @click="downloadJSON">Download</button>
        </div>

        <div class="yield-display" :class="{ 'is-empty': !prediction || prediction.error }">
          <div class="yield-number">{{ prediction && !prediction.error ? formatNumber(prediction.predictedYield) + ' kg/ha' : '—' }}</div>
          <div v-if="prediction && !prediction.error" class="yield-meta">
            <span class="pill pill-primary">{{ prediction.crop }}</span>
            <span class="pill">Base {{ formatNumber(prediction.inputs?.baseYield) }} kg/ha</span>
          </div>
        </div>
      </div>

      <div v-if="prediction && !prediction.error" class="yield-insights">
        <div class="insight-grid">
          <article v-for="item in predictionFactors" :key="item.label" class="insight-card">
            <span class="insight-label">{{ item.label }}</span>
            <strong class="insight-value">{{ item.value }}</strong>
          </article>
        </div>

        <div class="details-grid">
          <div class="detail-panel">
            <h3>Inputs</h3>
            <dl class="detail-list">
              <div v-for="row in predictionInputs" :key="row.label" class="detail-row">
                <dt>{{ row.label }}</dt>
                <dd>{{ row.value }}</dd>
              </div>
            </dl>
          </div>

          <div class="detail-panel">
            <h3>Factors</h3>
            <dl class="detail-list compact">
              <div v-for="row in predictionFactorRows" :key="row.label" class="detail-row">
                <dt>{{ row.label }}</dt>
                <dd>{{ row.value }}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <div v-else-if="prediction?.error" class="error-box">
        {{ prediction.error }}
      </div>

      <details v-if="prediction" class="raw-details" :open="showRaw">
        <summary>Raw response</summary>
        <pre>{{ prettyPrediction }}</pre>
      </details>
    </section>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import { postSoilReading, getLatestSoil, getSoilHistory, fetchWeather, predictSinturisYield } from '../utils/api.js';

  const lat = ref(14.5);
  const lon = ref(121.0);
  const days = ref(3);

  const latestSoil = ref(null);
  const soilHistory = ref([]);
  const weatherData = ref(null);
  const prediction = ref(null);
  const showRaw = ref(false);
  const baseYield = ref(1000);

  // auto-refresh settings
  const autoRefreshMs = 30_000; // refresh every 30s
  let refreshHandle = null;

const prettyPrediction = computed(() => {
  if (!prediction.value) return '';
  return JSON.stringify(prediction.value, null, 2);
});

const predictionFactors = computed(() => {
  const factors = prediction.value?.factors;
  if (!factors) return [];

  return [
    { label: 'Moisture', value: formatFactor(factors.moistureFactor) },
    { label: 'Temperature', value: formatFactor(factors.tempFactor) },
    { label: 'Rainfall', value: formatFactor(factors.precipFactor) },
    { label: 'Nutrient blend', value: formatFactor(factors.nutrientFactor) },
  ];
});

const predictionInputs = computed(() => {
  const inputs = prediction.value?.inputs;
  if (!inputs) return [];

  return [
    { label: 'Base yield', value: `${formatNumber(inputs.baseYield)} kg/ha` },
    { label: 'Moisture', value: inputs.moisture ?? '—' },
    { label: 'Average temperature', value: formatTemperature(inputs.avgTemp) },
    { label: 'Precipitation', value: formatRainfall(inputs.precip) },
    { label: 'N', value: inputs.n ?? '—' },
    { label: 'P', value: inputs.p ?? '—' },
    { label: 'K', value: inputs.k ?? '—' },
  ];
});

const predictionFactorRows = computed(() => {
  const factors = prediction.value?.factors;
  if (!factors) return [];

  return [
    { label: 'Moisture factor', value: formatFactor(factors.moistureFactor) },
    { label: 'Temp factor', value: formatFactor(factors.tempFactor) },
    { label: 'Precip factor', value: formatFactor(factors.precipFactor) },
    { label: 'Nutrient factor', value: formatFactor(factors.nutrientFactor) },
  ];
});

async function loadLatestSoil() {
  try {
    const res = await getLatestSoil();
    latestSoil.value = res.latest || res;
  } catch (err) {
    latestSoil.value = { error: err.message || err };
  }
}

async function loadSoilHistory() {
  try {
    const res = await getSoilHistory(10);
    soilHistory.value = res.history || [];
  } catch (err) {
    soilHistory.value = [];
  }
}

async function sendSampleReading() {
  try {
    const sample = {
      deviceId: 'iot-sensor-001',
      moisture: Math.round(20 + Math.random() * 60),
      temperature: Math.round(20 + Math.random() * 10),
      ph: Number((6 + Math.random() * 2).toFixed(2)),
      timestamp: new Date().toISOString(),
    };
    const res = await postSoilReading(sample);
    await loadLatestSoil();
    return res;
  } catch (err) {
    console.error('send sample failed', err);
  }
}

async function loadWeather() {
  try {
    const res = await fetchWeather(lat.value, lon.value, days.value);
    weatherData.value = res.data || res;
  } catch (err) {
    weatherData.value = { error: err.message || err };
  }
}

async function predictYield() {
  try {
    // Use latest soil reading if available
    let latest = null;
    try { latest = (await getLatestSoil()).latest; } catch (e) { latest = null; }

    const payload = {
      baseYield: baseYield.value,
      moisture: latest?.moisture,
      avgTemp: latest?.temperature,
      n: latest?.n,
      p: latest?.p,
      k: latest?.k,
      latitude: lat.value,
      longitude: lon.value,
      days: days.value,
    };

    const res = await predictSinturisYield(payload);
    prediction.value = res;
    showRaw.value = false;
  } catch (err) {
    prediction.value = { error: err.message || err };
  }
}

async function copyJSON() {
  if (!prediction.value) return;
  try {
    await navigator.clipboard.writeText(JSON.stringify(prediction.value, null, 2));
    if (window.showToast) window.showToast('Copied JSON to clipboard', 'success');
  } catch (e) {
    console.error('copy failed', e);
  }
}

function downloadJSON() {
  if (!prediction.value) return;
  const blob = new Blob([JSON.stringify(prediction.value, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sinturis-prediction-${new Date().toISOString()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function formatNumber(n) {
  if (n === null || n === undefined) return '—';
  return new Intl.NumberFormat().format(n);
}

function formatPercent(f) {
  if (f === null || f === undefined) return '—';
  // show as multiplier or percent
  return (f >= 0.9 && f <= 1.1) ? (Math.round(f * 100) + '%') : f.toFixed(2);
}

function formatFactor(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  return `${Number(value).toFixed(2)}x`;
}

function formatTemperature(value) {
  if (value === null || value === undefined) return '—';
  return `${Number(value).toFixed(1)} °C`;
}

function formatRainfall(value) {
  if (value === null || value === undefined) return '—';
  return `${Number(value).toFixed(1)} mm`;
}

function formatDateTime(timestamp) {
  try {
    return new Date(timestamp).toLocaleString();
  } catch {
    return timestamp;
  }
}

// Auto-load on mount
onMounted(() => {
  loadLatestSoil();
  loadSoilHistory();
  loadWeather();
  // run initial prediction after a short delay to let soil/weather load
  setTimeout(() => predictYield(), 600);

  refreshHandle = setInterval(() => {
    loadLatestSoil();
    loadSoilHistory();
    loadWeather();
    predictYield();
  }, autoRefreshMs);
});

onBeforeUnmount(() => {
  if (refreshHandle) clearInterval(refreshHandle);
});
</script>

<style scoped>
.container {
  padding: 16px;
  max-width: 1200px;
  margin: 0 auto;
}

.card {
  margin: 12px 0;
  padding: 16px;
  border: 1px solid rgba(229, 231, 235, 0.9);
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
}

pre {
  background: #0f172a;
  color: #e2e8f0;
  padding: 14px;
  border-radius: 12px;
  overflow: auto;
  font-size: 0.9rem;
  line-height: 1.5;
}

.grid-3 { display:grid; grid-template-columns: repeat(auto-fit, minmax(220px,1fr)); gap:16px; align-items:start }
.grid-2 { display:grid; grid-template-columns: 1fr 1fr; gap:16px }
.soil-summary { display:flex; gap:12px; flex-wrap:wrap }
.soil-summary .stat { background: linear-gradient(135deg,#ffffff,#f7fafc); padding:12px; border-radius:12px; box-shadow:0 6px 18px rgba(16,24,40,0.06); text-align:center; min-width:88px; border: 1px solid rgba(229,231,235,0.8); }
.history-list { max-height:180px; overflow:auto; padding-left:12px; margin-top:8px }
.yield-summary { display:flex; justify-content:space-between; align-items:center }
.yield-summary .big { font-size:1.7rem; margin-top:8px; color:var(--green-800); font-weight:700 }
.muted { color:var(--text-secondary); font-size:0.95rem }

.section-heading {
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  gap:12px;
  margin-bottom: 12px;
}

.section-heading p { margin-bottom: 0; }

.prediction-time {
  color: var(--text-secondary);
  font-size: 0.9rem;
  white-space: nowrap;
}

.yield-block {
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:16px;
  flex-wrap:wrap;
}

.yield-controls {
  display:flex;
  gap:8px;
  align-items:center;
  flex-wrap:wrap;
}

.yield-display {
  margin-left:auto;
  min-width: 220px;
  padding: 16px 18px;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(22, 163, 74, 0.08), rgba(249, 115, 22, 0.08));
  border: 1px solid rgba(22, 163, 74, 0.12);
  text-align:right;
}

.yield-display.is-empty {
  background: #f8fafc;
  border-color: #e5e7eb;
}

.yield-number {
  color:var(--green-800);
  font-weight:800;
  font-size:2.2rem;
  line-height: 1;
}

.yield-meta {
  margin-top: 10px;
  display:flex;
  gap:8px;
  justify-content:flex-end;
  flex-wrap:wrap;
}

.pill {
  display:inline-flex;
  align-items:center;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  background: #e2e8f0;
  color: #0f172a;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.pill-primary {
  background: linear-gradient(90deg, var(--green-600), var(--orange-500));
  color: #fff;
}

.yield-insights {
  margin-top: 16px;
  display:grid;
  gap:16px;
}

.insight-grid {
  display:grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap:12px;
}

.insight-card,
.detail-panel {
  background: #ffffff;
  border: 1px solid rgba(229, 231, 235, 0.9);
  border-radius: 14px;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.04);
}

.insight-card {
  padding: 14px 16px;
  display:flex;
  flex-direction:column;
  gap: 8px;
}

.insight-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.insight-value {
  font-size: 1.35rem;
  color: var(--green-800);
}

.details-grid {
  display:grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap:12px;
}

.detail-panel {
  padding: 14px 16px;
}

.detail-panel h3 {
  margin-bottom: 12px;
}

.detail-list {
  display:grid;
  gap:10px;
}

.detail-row {
  display:flex;
  justify-content:space-between;
  gap:16px;
  padding: 8px 0;
  border-bottom: 1px solid #f1f5f9;
}

.detail-row:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.detail-row dt {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.detail-row dd {
  margin: 0;
  font-weight: 700;
  color: var(--text);
  text-align: right;
}

.detail-list.compact .detail-row {
  padding: 6px 0;
}

.error-box {
  margin-top: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--error-bg);
  color: var(--error);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.raw-details {
  margin-top: 14px;
}

.raw-details summary {
  cursor: pointer;
  font-weight: 700;
  color: var(--text-secondary);
  margin-bottom: 10px;
}

.inline-label { display:flex; align-items:center; gap:8px }

.btn[disabled] { opacity: 0.6; cursor: not-allowed }

/* Buttons and inputs */
.btn { appearance:none; border:0; background:#edf2f7; padding:8px 12px; border-radius:8px; cursor:pointer; font-weight:600; color:var(--text); }
.btn-primary { background: linear-gradient(90deg,var(--green-600),var(--orange-500)); color:#fff; box-shadow:0 6px 16px rgba(16,24,40,0.12) }
.btn-secondary { background:#fff; border:1px solid #e6e9ef }
.input { padding:6px 8px; border-radius:6px; border:1px solid #e6e9ef }
.input.short { width:64px }

.daily-row { display:flex; justify-content:space-between; gap:12px; padding:6px 8px; border-radius:6px }
.day { color:var(--text-secondary); width:120px }
.day-stats { color:var(--text); }

@media (max-width: 720px) {
  .grid-2 {
    grid-template-columns: 1fr;
  }

  .section-heading,
  .yield-display {
    text-align: left;
  }

  .yield-display {
    width: 100%;
    margin-left: 0;
  }

  .detail-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .detail-row dd {
    text-align: left;
  }
}
</style>
