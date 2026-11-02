<template>
  <div class="monitor-page">
    <section class="hero-panel">
      <div class="hero-copy">
        <div class="eyebrow">Field intelligence</div>
        <h1>Know your soil.<br><span>Plan the next harvest.</span></h1>
        <p>
          One view for demo IoT telemetry, live public weather, and a transparent
          Sinturis yield outlook.
        </p>
        <div class="source-row" aria-label="Data sources">
          <span class="source-pill"><i class="status-dot demo"></i> Demo IoT sensor</span>
          <span class="source-pill"><i class="status-dot live"></i> Open-Meteo live</span>
          <span v-if="lastSynced" class="last-sync">Updated {{ formatTime(lastSynced) }}</span>
        </div>
      </div>

      <div class="location-card">
        <div class="location-heading">
          <div>
            <span class="mini-label">Forecast location</span>
            <strong>{{ locationName || 'Selected field location' }}</strong>
            <small v-if="weatherMeta?.location?.timezone">{{ weatherMeta.location.timezone }} timezone</small>
          </div>
          <button class="icon-button" type="button" title="Use my current location" @click="useMyLocation">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.1 7-13a7 7 0 1 0-14 0c0 6.9 7 13 7 13Zm0-10a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"/></svg>
            <span>Use my location</span>
          </button>
        </div>
        <div class="coordinate-grid">
          <label>
            <span>Latitude</span>
            <input v-model.number="lat" type="number" step="0.0001" min="-90" max="90">
          </label>
          <label>
            <span>Longitude</span>
            <input v-model.number="lon" type="number" step="0.0001" min="-180" max="180">
          </label>
          <label>
            <span>Forecast</span>
            <select v-model.number="days">
              <option :value="3">3 days</option>
              <option :value="5">5 days</option>
              <option :value="7">7 days</option>
              <option :value="10">10 days</option>
            </select>
          </label>
        </div>
        <button class="refresh-button" type="button" :disabled="loading.weather" @click="refreshWeatherAndYield">
          <svg :class="{ spinning: loading.weather }" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11a8.1 8.1 0 0 0-14.9-3L3 11m0 0V5m0 6h6m-5 2a8.1 8.1 0 0 0 14.9 3l2.1-3m0 0v6m0-6h-6"/></svg>
          {{ loading.weather ? 'Refreshing forecast...' : 'Refresh field data' }}
        </button>
      </div>
    </section>

    <div v-if="errorMessage" class="alert" role="alert">
      <strong>Some data could not be refreshed.</strong>
      <span>{{ errorMessage }}</span>
      <button type="button" @click="errorMessage = ''">Dismiss</button>
    </div>

    <section class="kpi-grid" aria-label="Field overview">
      <article class="kpi-card soil-kpi">
        <div class="kpi-topline"><span>Soil health</span><span class="trend positive">Citrus range</span></div>
        <div class="kpi-value">{{ assessment?.score ?? '--' }}<small>/100</small></div>
        <div class="kpi-footer">
          <span>{{ assessment?.grade || 'Waiting for sensor' }}</span>
          <div class="mini-progress"><i :style="{ width: `${assessment?.score || 0}%` }"></i></div>
        </div>
      </article>

      <article class="kpi-card moisture-kpi">
        <div class="kpi-topline"><span>Root-zone moisture</span><span>{{ freshnessLabel }}</span></div>
        <div class="kpi-value">{{ formatNumber(latestSoil?.moisture, 1) }}<small>%</small></div>
        <div class="kpi-footer"><span>{{ metricStatus('moisture') }}</span><span>Ideal 35-55%</span></div>
      </article>

      <article class="kpi-card weather-kpi">
        <div class="kpi-topline"><span>{{ days }}-day rainfall</span><span>Forecast</span></div>
        <div class="kpi-value">{{ formatNumber(totalRainfall, 1) }}<small>mm</small></div>
        <div class="kpi-footer"><span>{{ rainSummary }}</span><span>Open-Meteo</span></div>
      </article>

      <article class="kpi-card yield-kpi">
        <div class="kpi-topline"><span>Whole-farm harvest</span><span :class="['confidence-tag', confidenceClass]">{{ prediction?.confidence?.level || 'Pending' }}</span></div>
        <div class="kpi-value range-value">
          <template v-if="prediction?.harvestRange">
            {{ compactNumber(prediction.harvestRange.low) }}-{{ compactNumber(prediction.harvestRange.high) }}
            <small>kg total</small>
          </template>
          <template v-else>--</template>
        </div>
        <div class="kpi-footer"><span>{{ formatNumber(farmSizeHectares, 2) }} ha farm</span><span>{{ prediction?.confidence?.score || 0 }}% confidence</span></div>
      </article>
    </section>

    <section class="dashboard-grid">
      <article class="panel soil-panel">
        <header class="panel-header">
          <div>
            <span class="section-kicker">Soil monitoring</span>
            <h2>Root-zone condition</h2>
            <p>Demo telemetry uses the same schema as your future IoT device.</p>
          </div>
          <div class="panel-actions">
            <span class="device-badge"><i></i>{{ latestSoil?.deviceId || 'Connecting' }}</span>
            <button class="text-button" type="button" :disabled="loading.soil" @click="refreshSoil">
              {{ loading.soil ? 'Loading...' : 'Refresh' }}
            </button>
          </div>
        </header>

        <div class="soil-overview">
          <div class="score-ring" :style="{ '--score-angle': `${(assessment?.score || 0) * 3.6}deg` }">
            <div><strong>{{ assessment?.score ?? '--' }}</strong><span>Soil score</span></div>
          </div>
          <div class="soil-summary-copy">
            <span :class="['health-label', soilHealthClass]">{{ assessment?.grade || 'Awaiting reading' }}</span>
            <h3>{{ soilHeadline }}</h3>
            <p>{{ soilSummary }}</p>
          </div>
        </div>

        <div class="metric-grid">
          <article v-for="metric in soilMetrics" :key="metric.key" class="metric-card">
            <div class="metric-heading">
              <span>{{ metric.label }}</span>
              <i :class="['metric-status', metric.status]"></i>
            </div>
            <strong>{{ metric.value }}<small>{{ metric.unit }}</small></strong>
            <div class="range-track"><i :class="metric.status" :style="{ width: `${metric.score}%` }"></i></div>
            <div class="range-caption"><span>{{ capitalize(metric.status) }}</span><span>Ideal {{ metric.range }}</span></div>
          </article>
        </div>

        <div class="trend-block">
          <div class="trend-header">
            <div>
              <span class="mini-label">Moisture trend</span>
              <strong>Last {{ soilHistory.length }} demo readings</strong>
            </div>
            <span class="legend"><i></i> Moisture %</span>
          </div>
          <svg class="sparkline" viewBox="0 0 640 120" role="img" aria-label="Recent soil moisture trend">
            <defs>
              <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#20a464" stop-opacity="0.26"/>
                <stop offset="100%" stop-color="#20a464" stop-opacity="0"/>
              </linearGradient>
            </defs>
            <line v-for="y in [20, 60, 100]" :key="y" x1="0" :y1="y" x2="640" :y2="y" class="grid-line"/>
            <polygon v-if="sparklinePoints" :points="`0,120 ${sparklinePoints} 640,120`" fill="url(#areaFill)"/>
            <polyline v-if="sparklinePoints" :points="sparklinePoints" fill="none" stroke="#168a54" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>

        <details class="demo-controls">
          <summary>
            <span><strong>Demo sensor controls</strong><small>Adjust values before connecting the physical IoT device</small></span>
            <span class="summary-action">Configure</span>
          </summary>
          <div class="demo-form">
            <label v-for="field in demoFields" :key="field.key">
              <span>{{ field.label }} <small>{{ field.unit }}</small></span>
              <input v-model.number="soilForm[field.key]" type="number" :step="field.step" :min="field.min" :max="field.max">
            </label>
          </div>
          <button class="primary-button" type="button" :disabled="loading.saving" @click="saveDemoReading">
            {{ loading.saving ? 'Saving reading...' : 'Save demo reading' }}
          </button>
        </details>
      </article>

      <article class="panel weather-panel">
        <header class="panel-header compact">
          <div>
            <span class="section-kicker">Weather monitoring</span>
            <h2>Field forecast</h2>
          </div>
          <span class="api-badge">Public API</span>
        </header>

        <div v-if="weatherData?.current" class="current-weather">
          <div class="weather-main">
            <span class="weather-symbol" aria-hidden="true">{{ weatherInfo(weatherData.current.weather_code).icon }}</span>
            <div>
              <strong>{{ formatNumber(weatherData.current.temperature_2m, 1) }}&deg;</strong>
              <span>{{ weatherInfo(weatherData.current.weather_code).label }}</span>
            </div>
          </div>
          <div class="weather-facts">
            <div><span>Feels like</span><strong>{{ formatNumber(weatherData.current.apparent_temperature, 1) }}&deg;C</strong></div>
            <div><span>Humidity</span><strong>{{ formatNumber(weatherData.current.relative_humidity_2m, 0) }}%</strong></div>
            <div><span>Wind</span><strong>{{ formatNumber(weatherData.current.wind_speed_10m, 0) }} km/h</strong></div>
          </div>
        </div>
        <div v-else class="weather-skeleton">Loading live conditions...</div>

        <div class="forecast-list">
          <article v-for="day in forecast" :key="day.date" class="forecast-day">
            <div class="forecast-date"><strong>{{ day.day }}</strong><span>{{ day.shortDate }}</span></div>
            <span class="forecast-icon" aria-hidden="true">{{ day.weather.icon }}</span>
            <div class="forecast-temp"><strong>{{ day.max }}&deg;</strong><span>{{ day.min }}&deg;</span></div>
            <div class="forecast-rain">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3S6.5 9.5 6.5 14A5.5 5.5 0 0 0 12 19.5 5.5 5.5 0 0 0 17.5 14C17.5 9.5 12 3 12 3Z"/></svg>
              <span>{{ day.rain }} mm</span>
              <small>{{ day.chance }}%</small>
            </div>
          </article>
        </div>

        <div class="weather-note">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 6v5m0 3h.01"/></svg>
          <p><strong>Planning note</strong>{{ irrigationNote }}</p>
        </div>
        <p class="provider-note">
          Forecast by Open-Meteo. Place names &copy;
          <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a>.
        </p>
      </article>
    </section>

    <section class="panel yield-panel">
      <header class="panel-header yield-heading">
        <div>
          <span class="section-kicker">Yield prediction</span>
          <h2>Sinturis harvest outlook</h2>
          <p>A condition-adjusted estimate using the soil reading and the forecast displayed above.</p>
        </div>
        <div class="yield-controls">
          <label>
            <span>Farm area</span>
            <div class="input-with-unit farm-size-input"><input v-model.number="farmSizeHectares" type="number" min="0.01" max="100000" step="0.01"><small>ha</small></div>
          </label>
          <label>
            <span>Expected yield per hectare</span>
            <div class="input-with-unit"><input v-model.number="baseYield" type="number" min="1" max="200000"><small>kg/ha</small></div>
          </label>
          <button class="primary-button" type="button" :disabled="loading.yield" @click="predict">
            {{ loading.yield ? 'Calculating...' : 'Update outlook' }}
          </button>
        </div>
      </header>

      <div v-if="prediction && !prediction.error" class="yield-content">
        <div class="yield-result">
          <span class="mini-label">Estimated total harvest</span>
          <div class="yield-range">
            <strong>{{ formatWhole(prediction.harvestRange?.low) }}-{{ formatWhole(prediction.harvestRange?.high) }}</strong>
            <span>kilograms for {{ formatNumber(prediction.farmSizeHectares, 2) }} hectares</span>
          </div>
          <p class="harvest-formula">
            {{ formatWhole(prediction.predictedYield) }} kg/ha
            <span>&times;</span>
            {{ formatNumber(prediction.farmSizeHectares, 2) }} ha
            <span>=</span>
            <strong>{{ formatWhole(prediction.predictedHarvest) }} kg total</strong>
          </p>
          <p v-if="prediction.predictedHarvest >= 1000" class="tonnes-equivalent">
            Approximately {{ formatNumber(prediction.predictedHarvest / 1000, 2) }} metric tonnes at the midpoint.
          </p>
          <div class="confidence-row">
            <span :class="['confidence-badge', confidenceClass]">{{ prediction.confidence?.level }} confidence</span>
            <div class="confidence-track"><i :style="{ width: `${prediction.confidence?.score || 0}%` }"></i></div>
            <strong>{{ prediction.confidence?.score }}%</strong>
          </div>
        </div>

        <div class="factor-panel">
          <div class="factor-heading"><strong>Condition factors</strong><span>Closer to 100% is better</span></div>
          <div class="factor-list">
            <div v-for="factor in yieldFactors" :key="factor.label" class="factor-row">
              <span>{{ factor.label }}</span>
              <div><i :class="factor.status" :style="{ width: `${factor.percent}%` }"></i></div>
              <strong>{{ factor.percent }}%</strong>
            </div>
          </div>
        </div>

        <aside class="insight-panel">
          <span class="mini-label">What to act on</span>
          <ul>
            <li v-for="observation in prediction.observations" :key="observation">{{ observation }}</li>
          </ul>
          <p>{{ prediction.disclaimer }}</p>
        </aside>
      </div>
      <div v-else-if="prediction?.error" class="empty-state error-state">{{ prediction.error }}</div>
      <div v-else class="empty-state">Load soil and weather data to calculate an outlook.</div>

      <details v-if="prediction" class="model-details">
        <summary>Method and input details</summary>
        <div class="method-grid">
          <div><span>Model</span><strong>{{ prediction.modelVersion }}</strong></div>
          <div><span>Farm area</span><strong>{{ formatNumber(prediction.inputs?.farmSizeHectares, 2) }} ha</strong></div>
          <div><span>Yield per hectare</span><strong>{{ formatWhole(prediction.predictedYield) }} kg/ha</strong></div>
          <div><span>Soil source</span><strong>{{ capitalize(prediction.inputs?.soilSource) }}</strong></div>
          <div><span>Weather source</span><strong>{{ prediction.inputs?.weatherSource }}</strong></div>
          <div><span>Forecast rainfall</span><strong>{{ formatNumber(prediction.inputs?.precipitation, 1) }} mm</strong></div>
          <div><span>Average air temp</span><strong>{{ formatNumber(prediction.inputs?.avgTemp, 1) }}&deg;C</strong></div>
          <div><span>Calculated</span><strong>{{ formatDateTime(prediction.timestamp) }}</strong></div>
        </div>
      </details>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import {
  fetchWeather,
  fetchLocationName,
  getLatestSoil,
  getSoilHistory,
  postSoilReading,
  predictSinturisYield,
} from '../utils/api.js';

const lat = ref(14.5995);
const lon = ref(120.9842);
const days = ref(5);
const baseYield = ref(1000);
const farmSizeHectares = ref(4);
const latestSoil = ref(null);
const soilHistory = ref([]);
const assessment = ref(null);
const weatherData = ref(null);
const weatherMeta = ref(null);
const locationName = ref('');
const prediction = ref(null);
const lastSynced = ref(null);
const errorMessage = ref('');
const loading = reactive({ soil: false, weather: false, yield: false, saving: false });
const soilForm = reactive({ moisture: 44, temperature: 27, ph: 6.2, n: 50, p: 31, k: 53 });

const demoFields = [
  { key: 'moisture', label: 'Moisture', unit: '%', min: 0, max: 100, step: 0.1 },
  { key: 'temperature', label: 'Soil temp', unit: '°C', min: -10, max: 60, step: 0.1 },
  { key: 'ph', label: 'pH', unit: '', min: 0, max: 14, step: 0.1 },
  { key: 'n', label: 'Nitrogen', unit: 'index', min: 0, max: 200, step: 1 },
  { key: 'p', label: 'Phosphorus', unit: 'index', min: 0, max: 200, step: 1 },
  { key: 'k', label: 'Potassium', unit: 'index', min: 0, max: 200, step: 1 },
];

const totalRainfall = computed(() => {
  const values = weatherData.value?.daily?.precipitation_sum || [];
  return values.reduce((total, value) => total + (Number(value) || 0), 0);
});

const forecastAverageTemperature = computed(() => {
  const maxValues = weatherData.value?.daily?.temperature_2m_max || [];
  const minValues = weatherData.value?.daily?.temperature_2m_min || [];
  if (!maxValues.length) return null;
  const values = maxValues.map((value, index) => (Number(value) + Number(minValues[index])) / 2);
  return values.reduce((total, value) => total + value, 0) / values.length;
});

const forecast = computed(() => {
  const daily = weatherData.value?.daily;
  if (!daily?.time) return [];
  return daily.time.map((date, index) => ({
    date,
    day: index === 0 ? 'Today' : new Intl.DateTimeFormat('en-PH', { weekday: 'short' }).format(new Date(`${date}T12:00:00`)),
    shortDate: new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric' }).format(new Date(`${date}T12:00:00`)),
    weather: weatherInfo(daily.weather_code?.[index]),
    max: Math.round(daily.temperature_2m_max?.[index] ?? 0),
    min: Math.round(daily.temperature_2m_min?.[index] ?? 0),
    rain: formatNumber(daily.precipitation_sum?.[index], 1),
    chance: Math.round(daily.precipitation_probability_max?.[index] ?? 0),
  }));
});

const soilMetrics = computed(() => {
  const components = assessment.value?.components || [];
  const order = ['n', 'p', 'k', 'moisture', 'ph', 'temperature'];
  return order.map((key) => {
    const component = components.find((item) => item.key === key);
    const fallback = latestSoil.value?.[key];
    const unit = component?.unit === 'index' ? '' : component?.unit || '';
    return {
      key,
      label: component?.label || key.toUpperCase(),
      value: formatNumber(component?.value ?? fallback, key === 'ph' ? 2 : 1),
      unit: unit ? ` ${unit}` : '',
      score: component?.score || 0,
      status: component?.status || 'attention',
      range: component?.idealRange?.join('-') || '--',
    };
  });
});

const yieldFactors = computed(() => {
  const factors = prediction.value?.factors;
  if (!factors) return [];
  return [
    ['Soil moisture', factors.moistureFactor],
    ['Air temperature', factors.temperatureFactor],
    ['Forecast rainfall', factors.rainfallFactor],
    ['NPK balance', factors.nutrientFactor],
    ['Soil pH', factors.phFactor],
  ].map(([label, value]) => {
    const percent = Math.round((Number(value) || 0) * 100);
    return { label, percent, status: percent >= 90 ? 'optimal' : percent >= 75 ? 'watch' : 'attention' };
  });
});

const chronologicalHistory = computed(() => [...soilHistory.value].reverse());
const sparklinePoints = computed(() => {
  const values = chronologicalHistory.value.map((item) => Number(item.moisture)).filter(Number.isFinite);
  if (values.length < 2) return '';
  const min = Math.min(...values) - 2;
  const max = Math.max(...values) + 2;
  return values.map((value, index) => {
    const x = (index / (values.length - 1)) * 640;
    const y = 108 - ((value - min) / Math.max(max - min, 1)) * 88;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
});

const freshnessLabel = computed(() => {
  if (!latestSoil.value?.timestamp) return 'No reading';
  const minutes = Math.max(0, Math.round((Date.now() - new Date(latestSoil.value.timestamp).getTime()) / 60000));
  if (minutes < 2) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  return formatTime(latestSoil.value.timestamp);
});

const rainSummary = computed(() => {
  const average = totalRainfall.value / Math.max(days.value, 1);
  if (average < 2) return 'Dry pattern';
  if (average <= 8) return 'Useful rainfall';
  return 'Wet pattern';
});

const irrigationNote = computed(() => {
  const moisture = Number(latestSoil.value?.moisture);
  const rain = totalRainfall.value;
  if (moisture < 35 && rain < 10) return 'Soil is trending dry with limited rain ahead. Check the root zone before scheduling irrigation.';
  if (rain > 45) return 'Meaningful rain is forecast. Delay routine irrigation and inspect drainage after heavy showers.';
  return 'Moisture and expected rainfall are balanced. Continue monitoring before the next irrigation cycle.';
});

const soilHeadline = computed(() => {
  if (!assessment.value) return 'Waiting for the first reading';
  if (assessment.value.score >= 90) return 'The root zone is well balanced';
  if (assessment.value.score >= 75) return 'Conditions are generally suitable';
  return 'A few conditions need attention';
});

const soilSummary = computed(() => {
  const attention = assessment.value?.attention || [];
  if (!attention.length) return 'All measured indicators sit inside the configured citrus suitability bands.';
  const labels = attention.map((key) => soilMetrics.value.find((item) => item.key === key)?.label || key);
  return `Watch ${labels.join(' and ')}. Confirm demo sensor indices with calibrated field or laboratory measurements.`;
});

const soilHealthClass = computed(() => assessment.value?.score >= 90 ? 'optimal' : assessment.value?.score >= 70 ? 'watch' : 'attention');
const confidenceClass = computed(() => (prediction.value?.confidence?.level || 'low').toLowerCase());

function metricStatus(key) {
  const item = assessment.value?.components?.find((component) => component.key === key);
  return item ? capitalize(item.status) : 'Waiting';
}

function syncForm(reading) {
  for (const key of Object.keys(soilForm)) {
    if (Number.isFinite(Number(reading?.[key]))) soilForm[key] = Number(reading[key]);
  }
}

async function loadSoil() {
  loading.soil = true;
  try {
    const response = await getLatestSoil();
    latestSoil.value = response.latest || response;
    assessment.value = response.assessment || latestSoil.value?.assessment || null;
    syncForm(latestSoil.value);
  } catch (error) {
    errorMessage.value = error.message || 'Unable to load the soil reading.';
  } finally {
    loading.soil = false;
  }
}

async function loadHistory() {
  try {
    const response = await getSoilHistory(18);
    soilHistory.value = response.history || [];
  } catch {
    soilHistory.value = [];
  }
}

async function loadWeather() {
  loading.weather = true;
  try {
    const [weatherResult, locationResult] = await Promise.allSettled([
      fetchWeather(lat.value, lon.value, days.value),
      fetchLocationName(lat.value, lon.value),
    ]);

    if (weatherResult.status === 'rejected') throw weatherResult.reason;
    const response = weatherResult.value;
    weatherData.value = response.data || response;
    weatherMeta.value = response;

    if (locationResult.status === 'fulfilled') {
      locationName.value = locationResult.value.location?.label || '';
    } else if (!locationName.value) {
      locationName.value = 'Selected field location';
    }
  } catch (error) {
    errorMessage.value = error.message || 'Unable to load the public weather forecast.';
  } finally {
    loading.weather = false;
  }
}

async function predict() {
  if (!latestSoil.value) return;
  loading.yield = true;
  try {
    prediction.value = await predictSinturisYield({
      baseYield: baseYield.value,
      farmSizeHectares: farmSizeHectares.value,
      moisture: latestSoil.value.moisture,
      avgTemp: forecastAverageTemperature.value,
      precipitation: totalRainfall.value,
      ph: latestSoil.value.ph,
      n: latestSoil.value.n,
      p: latestSoil.value.p,
      k: latestSoil.value.k,
      soilSource: latestSoil.value.source,
      weatherSource: weatherData.value ? 'open-meteo' : 'fallback',
      latitude: lat.value,
      longitude: lon.value,
      days: days.value,
    });
  } catch (error) {
    prediction.value = { error: error.message || 'Unable to calculate the yield outlook.' };
  } finally {
    loading.yield = false;
  }
}

async function refreshSoil() {
  await Promise.all([loadSoil(), loadHistory()]);
  await predict();
  lastSynced.value = new Date().toISOString();
}

async function refreshWeatherAndYield() {
  errorMessage.value = '';
  await loadWeather();
  await predict();
  lastSynced.value = new Date().toISOString();
}

async function saveDemoReading() {
  loading.saving = true;
  try {
    await postSoilReading({
      deviceId: 'demo-citrus-bed-01',
      source: 'demo',
      ...soilForm,
      battery: latestSoil.value?.battery ?? 86,
      signalStrength: latestSoil.value?.signalStrength ?? -67,
      timestamp: new Date().toISOString(),
    });
    await refreshSoil();
    window.showToast?.('Demo soil reading saved', 'success');
  } catch (error) {
    errorMessage.value = error.message || 'Unable to save the demo reading.';
  } finally {
    loading.saving = false;
  }
}

function useMyLocation() {
  if (!navigator.geolocation) {
    errorMessage.value = 'Location services are not supported by this browser.';
    return;
  }
  navigator.geolocation.getCurrentPosition(
    async ({ coords }) => {
      lat.value = Number(coords.latitude.toFixed(4));
      lon.value = Number(coords.longitude.toFixed(4));
      locationName.value = 'Locating field...';
      await refreshWeatherAndYield();
    },
    () => { errorMessage.value = 'Location permission was not granted. You can enter coordinates manually.'; },
    { enableHighAccuracy: true, timeout: 8000 },
  );
}

function weatherInfo(code) {
  const value = Number(code);
  if (value === 0) return { icon: '\u2600\uFE0F', label: 'Clear sky' };
  if ([1, 2].includes(value)) return { icon: '\uD83C\uDF24\uFE0F', label: 'Partly cloudy' };
  if (value === 3) return { icon: '\u2601\uFE0F', label: 'Overcast' };
  if ([45, 48].includes(value)) return { icon: '\uD83C\uDF2B\uFE0F', label: 'Foggy' };
  if ([51, 53, 55, 56, 57].includes(value)) return { icon: '\uD83C\uDF26\uFE0F', label: 'Drizzle' };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(value)) return { icon: '\uD83C\uDF27\uFE0F', label: 'Rain showers' };
  if ([95, 96, 99].includes(value)) return { icon: '\u26C8\uFE0F', label: 'Thunderstorms' };
  return { icon: '\u2601\uFE0F', label: 'Cloudy' };
}

function compactNumber(value) {
  if (!Number.isFinite(Number(value))) return '--';
  return new Intl.NumberFormat('en-PH', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(value));
}

function formatWhole(value) {
  if (!Number.isFinite(Number(value))) return '--';
  return new Intl.NumberFormat('en-PH', { maximumFractionDigits: 0 }).format(Number(value));
}

function formatNumber(value, digits = 1) {
  if (!Number.isFinite(Number(value))) return '--';
  return new Intl.NumberFormat('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: digits }).format(Number(value));
}

function formatTime(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-PH', { hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

function formatDateTime(value) {
  if (!value) return '--';
  return new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function capitalize(value) {
  if (!value) return '--';
  return String(value).charAt(0).toUpperCase() + String(value).slice(1);
}

onMounted(async () => {
  errorMessage.value = '';
  await Promise.all([loadSoil(), loadHistory(), loadWeather()]);
  await predict();
  lastSynced.value = new Date().toISOString();
});
</script>

<style scoped>
.monitor-page {
  --ink: var(--text);
  --muted: var(--text-secondary);
  --line: var(--border);
  --soft: var(--bg-secondary);
  --leaf: #168a54;
  --leaf-dark: #0d633b;
  --lime: #b8dc76;
  --orange: #eb7b3c;
  width: min(1380px, calc(100% - 40px));
  margin: 0 auto;
  padding: 36px 0 72px;
  color: var(--ink);
}

.hero-panel {
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(360px, 0.65fr);
  gap: 40px;
  padding: 48px;
  border-radius: 30px;
  color: #fff;
  background:
    radial-gradient(circle at 86% 18%, rgba(184, 220, 118, 0.23), transparent 30%),
    linear-gradient(132deg, #0a5936 0%, #123d2d 100%);
  box-shadow: 0 24px 60px rgba(13, 75, 48, 0.18);
}

.hero-panel::after {
  content: '';
  position: absolute;
  width: 340px;
  height: 340px;
  right: -150px;
  bottom: -220px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 50%;
  box-shadow: 0 0 0 48px rgba(255, 255, 255, 0.03), 0 0 0 96px rgba(255, 255, 255, 0.025);
}

.hero-copy { position: relative; z-index: 1; align-self: center; }
.eyebrow, .section-kicker, .mini-label { text-transform: uppercase; letter-spacing: .14em; font-size: .72rem; font-weight: 800; }
.eyebrow { color: #cceca0; margin-bottom: 14px; }
.hero-copy h1 { color: #fff; font-size: clamp(2.4rem, 5vw, 4.5rem); line-height: .98; letter-spacing: -.055em; margin-bottom: 22px; max-width: 760px; }
.hero-copy h1 span { color: #cbe995; }
.hero-copy > p { max-width: 660px; color: rgba(255,255,255,.78); font-size: 1.05rem; margin-bottom: 24px; }
.source-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.source-pill { display: inline-flex; align-items: center; gap: 8px; padding: 7px 11px; background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.13); border-radius: 999px; font-size: .78rem; font-weight: 700; }
.status-dot { width: 7px; height: 7px; border-radius: 50%; box-shadow: 0 0 0 4px rgba(255,255,255,.08); }
.status-dot.demo { background: #f2b866; }
.status-dot.live { background: #7ee3a7; }
.last-sync { color: rgba(255,255,255,.58); font-size: .78rem; margin-left: 4px; }

.location-card { position: relative; z-index: 1; align-self: stretch; padding: 24px; border: 1px solid rgba(255,255,255,.15); border-radius: 22px; background: rgba(255,255,255,.09); backdrop-filter: blur(12px); }
.location-heading { display: flex; justify-content: space-between; gap: 20px; align-items: flex-start; margin-bottom: 20px; }
.location-heading > div { display: grid; gap: 5px; }
.location-heading .mini-label { color: rgba(255,255,255,.58); }
.location-heading strong { color: #fff; font-size: 1.04rem; }
.location-heading small { color: rgba(255,255,255,.58); font-size: .7rem; }
.icon-button { display: inline-flex; gap: 7px; align-items: center; color: #dff6d0; background: none; border: 0; cursor: pointer; font-weight: 700; font-size: .78rem; }
.icon-button svg { width: 17px; fill: currentColor; }
.coordinate-grid { display: grid; grid-template-columns: 1fr 1fr .8fr; gap: 10px; }
.coordinate-grid label { display: grid; gap: 6px; color: rgba(255,255,255,.62); font-size: .7rem; font-weight: 700; }
.coordinate-grid input, .coordinate-grid select { width: 100%; min-width: 0; padding: 10px 11px; border: 1px solid rgba(255,255,255,.14); border-radius: 10px; color: #fff; background: rgba(5,30,20,.28); outline: none; }
.coordinate-grid select option { color: #172d25; }
.coordinate-grid input:focus, .coordinate-grid select:focus { border-color: #b8dc76; box-shadow: 0 0 0 3px rgba(184,220,118,.16); }
.refresh-button { width: 100%; margin-top: 14px; min-height: 44px; display: flex; justify-content: center; align-items: center; gap: 9px; border: 0; border-radius: 11px; color: #17422e; background: #cbe995; font-weight: 800; cursor: pointer; }
.refresh-button:disabled { opacity: .7; cursor: wait; }
.refresh-button svg { width: 18px; fill: none; stroke: currentColor; stroke-width: 2; }
.spinning { animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.alert { margin-top: 18px; padding: 14px 18px; display: flex; gap: 12px; align-items: center; border: 1px solid #f5c9b4; border-radius: 13px; background: #fff6f1; color: #8a3f20; font-size: .88rem; }
.alert span { flex: 1; }
.alert button { border: 0; background: none; color: inherit; font-weight: 800; cursor: pointer; }

.kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin: 18px 0; }
.kpi-card { min-width: 0; padding: 20px; border: 1px solid var(--line); border-radius: 18px; background: var(--card); box-shadow: 0 8px 30px rgba(18,61,45,.055); }
.kpi-topline, .kpi-footer { display: flex; justify-content: space-between; gap: 12px; align-items: center; color: var(--muted); font-size: .73rem; }
.kpi-topline > span:first-child { color: var(--ink); text-transform: uppercase; letter-spacing: .08em; font-weight: 800; }
.kpi-value { margin: 17px 0 15px; color: var(--ink); font-size: clamp(2rem, 3vw, 2.8rem); line-height: 1; font-weight: 800; letter-spacing: -.05em; }
.kpi-value small { margin-left: 4px; color: var(--muted); font-size: .8rem; letter-spacing: 0; }
.range-value { font-size: clamp(1.65rem, 2.4vw, 2.25rem); }
.mini-progress { width: 72px; height: 5px; overflow: hidden; background: #eaf0ec; border-radius: 99px; }
.mini-progress i { display: block; height: 100%; background: var(--leaf); border-radius: inherit; }
.trend.positive { color: var(--leaf); font-weight: 800; }
.confidence-tag { padding: 3px 7px; border-radius: 99px; font-weight: 800; }
.confidence-tag.high, .confidence-badge.high { background: #e8f6ed; color: #147747; }
.confidence-tag.moderate, .confidence-badge.moderate { background: #fff3d9; color: #9a6110; }
.confidence-tag.low, .confidence-badge.low { background: #fff0e9; color: #b34f24; }

.dashboard-grid { display: grid; grid-template-columns: minmax(0, 1.45fr) minmax(330px, .75fr); gap: 18px; align-items: start; }
.panel { padding: 28px; border: 1px solid var(--line); border-radius: 22px; background: var(--card); box-shadow: 0 10px 38px rgba(18,61,45,.055); }
.panel-header { display: flex; justify-content: space-between; gap: 24px; align-items: flex-start; margin-bottom: 26px; }
.panel-header h2 { margin: 4px 0 6px; color: var(--ink); font-size: 1.55rem; letter-spacing: -.025em; }
.panel-header p { margin: 0; color: var(--muted); font-size: .88rem; }
.section-kicker { color: var(--leaf); }
.panel-actions { display: flex; align-items: center; gap: 12px; }
.device-badge, .api-badge { display: inline-flex; align-items: center; gap: 7px; padding: 7px 10px; border-radius: 99px; background: var(--soft); color: #50625a; font-size: .72rem; font-weight: 800; }
.device-badge i { width: 7px; height: 7px; border-radius: 50%; background: #e9a143; }
.api-badge { color: var(--leaf-dark); background: #eaf6ee; }
.text-button { padding: 7px; border: 0; background: none; color: var(--leaf); font-weight: 800; cursor: pointer; }

.soil-overview { display: grid; grid-template-columns: 122px 1fr; gap: 24px; align-items: center; padding: 22px; border-radius: 18px; background: var(--soft); }
.score-ring { width: 114px; height: 114px; padding: 9px; border-radius: 50%; background: conic-gradient(var(--leaf) var(--score-angle), #dce8e0 0); }
.score-ring > div { width: 100%; height: 100%; display: grid; place-content: center; text-align: center; border-radius: 50%; background: var(--card); }
.score-ring strong { font-size: 2rem; letter-spacing: -.04em; }
.score-ring span { color: var(--muted); font-size: .7rem; }
.soil-summary-copy h3 { margin: 8px 0 7px; color: var(--ink); font-size: 1.16rem; }
.soil-summary-copy p { color: var(--muted); font-size: .86rem; margin: 0; }
.health-label { display: inline-flex; padding: 4px 8px; border-radius: 99px; font-size: .68rem; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; }
.health-label.optimal { color: #116c41; background: #dff2e6; }
.health-label.watch { color: #8a5b0c; background: #fff0cf; }
.health-label.attention { color: #a74525; background: #fee9df; }

.metric-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 18px; }
.metric-card { padding: 15px; border: 1px solid #e5ece7; border-radius: 14px; }
.metric-heading, .range-caption { display: flex; justify-content: space-between; gap: 8px; color: var(--muted); font-size: .7rem; }
.metric-heading > span { color: #53655d; font-weight: 700; }
.metric-status { width: 8px; height: 8px; border-radius: 50%; }
.metric-status.optimal, .range-track i.optimal, .factor-row i.optimal { background: var(--leaf); }
.metric-status.watch, .range-track i.watch, .factor-row i.watch { background: #e8a43b; }
.metric-status.attention, .range-track i.attention, .factor-row i.attention { background: #dc6943; }
.metric-card > strong { display: block; margin: 9px 0 10px; font-size: 1.42rem; color: var(--ink); }
.metric-card > strong small { color: var(--muted); font-size: .68rem; font-weight: 600; }
.range-track { height: 5px; overflow: hidden; border-radius: 99px; background: #edf1ee; }
.range-track i { display: block; height: 100%; border-radius: inherit; }
.range-caption { margin-top: 7px; font-size: .62rem; }

.trend-block { margin-top: 18px; padding: 18px; border: 1px solid #e5ece7; border-radius: 16px; }
.trend-header { display: flex; justify-content: space-between; gap: 12px; align-items: center; }
.trend-header > div { display: grid; gap: 3px; }
.trend-header .mini-label { color: var(--muted); font-size: .62rem; }
.trend-header strong { font-size: .85rem; }
.legend { display: inline-flex; align-items: center; gap: 6px; color: var(--muted); font-size: .7rem; }
.legend i { width: 8px; height: 8px; border-radius: 50%; background: var(--leaf); }
.sparkline { display: block; width: 100%; height: 120px; margin-top: 12px; overflow: visible; }
.grid-line { stroke: #e8efea; stroke-width: 1; stroke-dasharray: 5 7; }

.demo-controls { margin-top: 18px; padding: 0 18px; border: 1px dashed var(--line); border-radius: 14px; background: var(--bg-secondary); }
.demo-controls summary { padding: 15px 0; display: flex; justify-content: space-between; gap: 12px; align-items: center; cursor: pointer; list-style: none; }
.demo-controls summary::-webkit-details-marker { display: none; }
.demo-controls summary > span:first-child { display: grid; gap: 2px; }
.demo-controls summary strong { font-size: .84rem; }
.demo-controls summary small { color: var(--muted); font-size: .7rem; }
.summary-action { color: var(--leaf); font-size: .74rem; font-weight: 800; }
.demo-form { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; padding: 3px 0 13px; }
.demo-form label { display: grid; gap: 5px; color: #52645c; font-size: .7rem; font-weight: 700; }
.demo-form label small { color: var(--muted); font-weight: 500; }
.demo-form input, .input-with-unit input { width: 100%; min-width: 0; padding: 9px 10px; border: 1px solid var(--line); border-radius: 9px; color: var(--ink); background: var(--card); outline: none; }
.demo-form input:focus, .input-with-unit input:focus { border-color: var(--leaf); box-shadow: 0 0 0 3px rgba(22,138,84,.1); }
.demo-controls .primary-button { margin-bottom: 16px; }

.panel-header.compact { align-items: center; }
.current-weather { padding: 22px; color: #fff; border-radius: 18px; background: linear-gradient(145deg, #1c8b67, #135a45); }
.weather-main { display: flex; gap: 14px; align-items: center; }
.weather-symbol { font-size: 3.2rem; filter: drop-shadow(0 4px 8px rgba(0,0,0,.12)); }
.weather-main > div { display: grid; }
.weather-main strong { color: #fff; font-size: 2.8rem; line-height: 1; letter-spacing: -.06em; }
.weather-main span:last-child { color: rgba(255,255,255,.74); font-size: .78rem; }
.weather-facts { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 22px; }
.weather-facts > div { display: grid; gap: 3px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,.16); }
.weather-facts span { color: rgba(255,255,255,.62); font-size: .65rem; }
.weather-facts strong { color: #fff; font-size: .8rem; }
.weather-skeleton { padding: 50px 20px; text-align: center; color: var(--muted); border-radius: 18px; background: var(--soft); }
.forecast-list { display: grid; gap: 2px; margin-top: 16px; }
.forecast-day { display: grid; grid-template-columns: 1fr 42px .8fr 1.05fr; gap: 9px; align-items: center; padding: 12px 6px; border-bottom: 1px solid #edf1ee; }
.forecast-day:last-child { border-bottom: 0; }
.forecast-date { display: grid; }
.forecast-date strong { font-size: .78rem; }
.forecast-date span, .forecast-temp span { color: var(--muted); font-size: .66rem; }
.forecast-icon { font-size: 1.45rem; }
.forecast-temp { display: flex; gap: 5px; align-items: baseline; }
.forecast-temp strong { font-size: .9rem; }
.forecast-rain { display: grid; grid-template-columns: 14px 1fr auto; gap: 4px; align-items: center; color: #477065; font-size: .68rem; }
.forecast-rain svg { width: 13px; fill: #55a8bf; }
.forecast-rain small { color: var(--muted); }
.weather-note { display: flex; gap: 10px; padding: 13px; margin-top: 16px; border-radius: 12px; color: #76531a; background: #fff7e6; }
.weather-note svg { flex: 0 0 17px; width: 17px; fill: none; stroke: currentColor; stroke-width: 2; }
.weather-note p { margin: 0; font-size: .73rem; line-height: 1.45; }
.weather-note strong { display: block; margin-bottom: 2px; }
.provider-note { margin: 12px 0 0; color: var(--muted); font-size: .64rem; text-align: center; }
.provider-note a { color: var(--leaf-dark); text-decoration: underline; }

.yield-panel { margin-top: 18px; }
.yield-heading { align-items: flex-end; }
.yield-controls { display: flex; align-items: flex-end; gap: 10px; }
.yield-controls label { display: grid; gap: 5px; color: var(--muted); font-size: .7rem; font-weight: 700; }
.input-with-unit { position: relative; }
.input-with-unit input { width: 165px; padding-right: 54px; }
.farm-size-input input { width: 120px; padding-right: 38px; }
.input-with-unit small { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); color: var(--muted); }
.primary-button { min-height: 39px; padding: 9px 14px; border: 0; border-radius: 9px; color: #fff; background: var(--leaf); font-weight: 800; cursor: pointer; }
.primary-button:hover { background: var(--leaf-dark); }
.primary-button:disabled { opacity: .6; cursor: wait; }
.yield-content { display: grid; grid-template-columns: 1.05fr 1.15fr .9fr; gap: 16px; }
.yield-result, .factor-panel, .insight-panel { min-width: 0; padding: 21px; border: 1px solid #e4ebe6; border-radius: 16px; }
.yield-result { color: #fff; border-color: transparent; background: linear-gradient(145deg, #153f30, #0c5f3a); }
.yield-result .mini-label { color: #a9d59b; }
.yield-range { margin: 14px 0 10px; }
.yield-range strong { display: block; color: #fff; font-size: clamp(2rem, 3.2vw, 3rem); line-height: 1; letter-spacing: -.06em; }
.yield-range span { color: rgba(255,255,255,.65); font-size: .72rem; text-transform: uppercase; letter-spacing: .1em; }
.yield-result > p { color: rgba(255,255,255,.68); font-size: .76rem; margin: 0; }
.yield-result .harvest-formula { display: flex; flex-wrap: wrap; gap: 5px; align-items: baseline; padding: 10px 0; color: rgba(255,255,255,.82); border-top: 1px solid rgba(255,255,255,.12); border-bottom: 1px solid rgba(255,255,255,.12); }
.harvest-formula span { color: #b8dc76; font-weight: 800; }
.harvest-formula strong { color: #fff; }
.yield-result .tonnes-equivalent { margin-top: 9px; color: #cbe6d2; font-size: .7rem; }
.confidence-row { display: grid; grid-template-columns: auto 1fr auto; gap: 9px; align-items: center; margin-top: 18px; }
.confidence-badge { padding: 5px 7px; border-radius: 99px; font-size: .64rem; font-weight: 800; }
.confidence-track { height: 5px; overflow: hidden; border-radius: 99px; background: rgba(255,255,255,.15); }
.confidence-track i { display: block; height: 100%; border-radius: inherit; background: #b8dc76; }
.confidence-row > strong { color: #fff; font-size: .72rem; }
.factor-heading { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 18px; }
.factor-heading strong { font-size: .86rem; }
.factor-heading span { color: var(--muted); font-size: .66rem; }
.factor-list { display: grid; gap: 13px; }
.factor-row { display: grid; grid-template-columns: 105px 1fr 34px; gap: 10px; align-items: center; font-size: .7rem; }
.factor-row > span { color: #506159; }
.factor-row > div { height: 6px; overflow: hidden; border-radius: 99px; background: #ebf0ed; }
.factor-row i { display: block; height: 100%; border-radius: inherit; }
.factor-row > strong { text-align: right; font-size: .7rem; }
.insight-panel { background: var(--bg-secondary); }
.insight-panel .mini-label { color: var(--leaf); }
.insight-panel ul { display: grid; gap: 10px; margin: 14px 0; padding-left: 17px; color: #41554c; font-size: .76rem; }
.insight-panel li::marker { color: var(--orange); }
.insight-panel p { margin: 0; padding-top: 12px; border-top: 1px solid #e1e9e3; color: var(--muted); font-size: .64rem; line-height: 1.45; }
.empty-state { padding: 38px; border-radius: 14px; text-align: center; color: var(--muted); background: var(--soft); }
.error-state { color: #a64829; background: #fff2ec; }
.model-details { margin-top: 16px; border-top: 1px solid #e6ece8; }
.model-details summary { padding: 14px 0 0; color: var(--leaf); font-size: .75rem; font-weight: 800; cursor: pointer; }
.method-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 14px; }
.method-grid > div { display: grid; gap: 4px; padding: 11px; border-radius: 9px; background: var(--soft); }
.method-grid span { color: var(--muted); font-size: .64rem; }
.method-grid strong { font-size: .74rem; overflow-wrap: anywhere; }

@media (max-width: 1100px) {
  .hero-panel { grid-template-columns: 1fr; }
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .dashboard-grid { grid-template-columns: 1fr; }
  .weather-panel { display: grid; grid-template-columns: 1fr 1fr; column-gap: 20px; }
  .weather-panel .panel-header, .weather-panel .provider-note { grid-column: 1 / -1; }
  .weather-note { align-self: end; }
  .yield-content { grid-template-columns: 1fr 1fr; }
  .insight-panel { grid-column: 1 / -1; }
}

@media (max-width: 760px) {
  .monitor-page { width: min(100% - 24px, 1380px); padding-top: 18px; }
  .hero-panel { padding: 30px 22px; border-radius: 22px; }
  .hero-copy h1 { font-size: 2.55rem; }
  .coordinate-grid { grid-template-columns: 1fr 1fr; }
  .coordinate-grid label:last-child { grid-column: 1 / -1; }
  .kpi-grid { grid-template-columns: 1fr 1fr; gap: 9px; }
  .kpi-card { padding: 15px; }
  .kpi-topline, .kpi-footer { align-items: flex-start; flex-direction: column; gap: 5px; }
  .mini-progress { width: 100%; }
  .panel { padding: 20px 16px; border-radius: 18px; }
  .panel-header, .yield-heading { flex-direction: column; align-items: stretch; }
  .panel-actions { justify-content: space-between; }
  .soil-overview { grid-template-columns: 90px 1fr; padding: 16px; }
  .score-ring { width: 86px; height: 86px; }
  .score-ring strong { font-size: 1.45rem; }
  .metric-grid { grid-template-columns: repeat(2, 1fr); }
  .demo-form { grid-template-columns: repeat(2, 1fr); }
  .weather-panel { display: block; }
  .weather-panel .panel-header { display: flex; }
  .forecast-day { grid-template-columns: 1fr 36px .7fr 1fr; }
  .yield-controls { align-items: stretch; flex-direction: column; }
  .input-with-unit input { width: 100%; }
  .yield-content { grid-template-columns: 1fr; }
  .insight-panel { grid-column: auto; }
  .method-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 430px) {
  .kpi-grid { grid-template-columns: 1fr; }
  .location-heading { flex-direction: column; }
  .coordinate-grid { grid-template-columns: 1fr; }
  .coordinate-grid label:last-child { grid-column: auto; }
  .soil-overview { grid-template-columns: 1fr; text-align: center; justify-items: center; }
  .metric-grid { grid-template-columns: 1fr 1fr; }
  .range-caption { flex-direction: column; }
  .demo-form { grid-template-columns: 1fr 1fr; }
  .method-grid { grid-template-columns: 1fr; }
}
</style>
