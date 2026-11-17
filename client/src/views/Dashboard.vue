<template>
  <div class="dashboard-page">
    <div class="container">
      <header class="dashboard-header">
        <div>
          <p class="eyebrow">{{ t('FARMER DASHBOARD', 'DASHBOARD NG MAGSASAKA') }}</p>
          <h1>{{ t('Farm overview', 'Pangkalahatang-ideya ng bukid') }}</h1>
          <p class="muted">{{ t('Manage your field and monitor crop conditions in one place.', 'Pamahalaan ang bukid at subaybayan ang kondisyon ng pananim sa iisang lugar.') }}</p>
        </div>
        <div class="dashboard-actions">
          <div class="language-switcher" role="group" :aria-label="t('Dashboard language', 'Wika ng dashboard')">
            <button type="button" :class="{ active: language === 'en' }" @click="setLanguage('en')">English</button>
            <button type="button" :class="{ active: language === 'tl' }" @click="setLanguage('tl')">Tagalog</button>
          </div>
          <button v-if="firebaseUser" type="button" class="btn btn-outline" @click="signOutFarmer">
            {{ t('Sign out', 'Mag-sign out') }}
          </button>
        </div>
      </header>

      <section v-if="!firebaseConfigured" class="dashboard-card notice-card">
        <h2>{{ t('Account sign-in is not configured', 'Hindi pa naka-configure ang pag-sign in') }}</h2>
        <p>{{ t('Add the VITE_FIREBASE_* values from client/.env.example to enable farmer accounts.', 'Idagdag ang VITE_FIREBASE_* values mula sa client/.env.example para paganahin ang farmer accounts.') }}</p>
      </section>

      <section v-else-if="!authReady" class="dashboard-card auth-card">
        <h2>{{ t('Checking farmer account…', 'Sinusuri ang farmer account…') }}</h2>
      </section>

      <section v-else-if="!firebaseUser" class="dashboard-card auth-card">
        <div>
          <p class="eyebrow">{{ t('FARMER ACCESS', 'ACCESS NG MAGSASAKA') }}</p>
          <h2>{{ isRegistering ? t('Create your farmer account', 'Gumawa ng farmer account') : t('Sign in to your farm dashboard', 'Mag-sign in sa dashboard ng bukid') }}</h2>
          <p class="muted">{{ t('Your field profile is kept separate from other farmer accounts.', 'Hiwalay ang field profile mo sa ibang farmer accounts.') }}</p>
        </div>

        <form class="auth-form" @submit.prevent="submitAuth">
          <label>
            {{ t('Email', 'Email') }}
            <input v-model.trim="authForm.email" class="input" type="email" autocomplete="email" required />
          </label>
          <label>
            {{ t('Password', 'Password') }}
            <input v-model="authForm.password" class="input" type="password" minlength="6" autocomplete="current-password" required />
          </label>
          <p v-if="authError" class="error-message">{{ authError }}</p>
          <button class="btn btn-primary" type="submit" :disabled="authLoading">
            {{ authLoading ? t('Please wait…', 'Sandali…') : isRegistering ? t('Create account', 'Gumawa ng account') : t('Sign in', 'Mag-sign in') }}
          </button>
        </form>

        <button type="button" class="text-button" @click="toggleAuthMode">
          {{ isRegistering ? t('Already have an account? Sign in', 'May account na? Mag-sign in') : t('New farmer? Create an account', 'Bagong farmer? Gumawa ng account') }}
        </button>
      </section>

      <template v-else>
        <section class="dashboard-card welcome-card">
          <div>
            <p class="eyebrow">{{ t('WELCOME BACK', 'MALIGAYANG PAGBABALIK') }}</p>
            <h2>{{ firebaseUser.email }}</h2>
            <p class="muted">{{ t('Update your field profile so your records stay useful.', 'I-update ang field profile para maging kapaki-pakinabang ang iyong mga tala.') }}</p>
          </div>
          <router-link to="/detect" class="btn btn-primary">{{ t('Scan a plant', 'Mag-scan ng halaman') }}</router-link>
        </section>

        <section class="dashboard-grid">
          <article class="dashboard-card stat-card">
            <span class="stat-label">{{ t('Field name', 'Pangalan ng bukid') }}</span>
            <strong>{{ farmProfile.name || t('Not set', 'Wala pa') }}</strong>
            <span class="muted">{{ farmProfile.location || t('Add a location below', 'Magdagdag ng lokasyon sa ibaba') }}</span>
          </article>
          <article class="dashboard-card stat-card">
            <span class="stat-label">{{ t('Farm size', 'Laki ng bukid') }}</span>
            <strong>{{ farmProfile.area ? `${farmProfile.area} ha` : '—' }}</strong>
            <span class="muted">{{ farmProfile.cropStage || t('Crop stage not set', 'Wala pang yugto ng pananim') }}</span>
          </article>
          <article class="dashboard-card stat-card">
            <span class="stat-label">{{ t('Latest NPK reading', 'Pinakabagong NPK reading') }}</span>
            <strong>{{ latestNpk ? `N ${latestNpk.nitrogen} · P ${latestNpk.phosphorus} · K ${latestNpk.potassium}` : '—' }}</strong>
            <span class="muted">{{ latestNpk ? formatDate(latestNpk.updatedAt) : t('No reading yet', 'Wala pang reading') }}</span>
          </article>
        </section>

        <section class="dashboard-columns">
          <article class="dashboard-card">
            <div class="section-heading">
              <div>
                <p class="eyebrow">{{ t('FIELD PROFILE', 'PROFILE NG BUKID') }}</p>
                <h2>{{ t('Farm details', 'Detalye ng bukid') }}</h2>
              </div>
              <span class="profile-status">{{ profileSaved ? t('Saved', 'Naka-save') : t('Draft', 'Draft') }}</span>
            </div>
            <form class="profile-form" @submit.prevent="saveFarmProfile">
              <label>
                {{ t('Field name', 'Pangalan ng bukid') }}
                <input v-model.trim="farmProfile.name" class="input" type="text" maxlength="80" placeholder="Dalandan Field 1" />
              </label>
              <label>
                {{ t('Location', 'Lokasyon') }}
                <input v-model.trim="farmProfile.location" class="input" type="text" maxlength="120" placeholder="Barangay, Province" />
              </label>
              <div class="form-row">
                <label>
                  {{ t('Area (hectares)', 'Lawak (ektarya)') }}
                  <input v-model.number="farmProfile.area" class="input" type="number" min="0" step="0.01" />
                </label>
                <label>
                  {{ t('Crop stage', 'Yugto ng pananim') }}
                  <select v-model="farmProfile.cropStage" class="input">
                    <option value="">{{ t('Select stage', 'Pumili ng yugto') }}</option>
                    <option value="Seedling">{{ t('Seedling', 'Punla') }}</option>
                    <option value="Vegetative">{{ t('Vegetative growth', 'Paglago ng halaman') }}</option>
                    <option value="Flowering">{{ t('Flowering', 'Namumulaklak') }}</option>
                    <option value="Fruiting">{{ t('Fruiting', 'Namumunga') }}</option>
                    <option value="Harvest">{{ t('Harvest', 'Ani') }}</option>
                  </select>
                </label>
              </div>
              <button class="btn btn-secondary" type="submit">{{ t('Save field profile', 'I-save ang profile ng bukid') }}</button>
            </form>
          </article>

          <article class="dashboard-card">
            <div class="section-heading">
              <div>
                <p class="eyebrow">{{ t('CROP HEALTH', 'KALUSUGAN NG PANANIM') }}</p>
                <h2>{{ t('Recent NPK readings', 'Mga huling NPK reading') }}</h2>
              </div>
              <router-link to="/soil-quality" class="text-link">{{ t('Open monitoring', 'Buksan ang monitoring') }}</router-link>
            </div>
            <div v-if="!npkHistory.length" class="empty-state">
              {{ t('No NPK readings yet. Connect the sensor in Soil Monitoring to collect readings.', 'Wala pang NPK reading. Ikonekta ang sensor sa Soil Monitoring para mangolekta ng readings.') }}
            </div>
            <ul v-else class="reading-list">
              <li v-for="reading in npkHistory.slice(0, 5)" :key="reading.updatedAt">
                <span>{{ formatDate(reading.updatedAt) }}</span>
                <strong>N {{ reading.nitrogen ?? '—' }} · P {{ reading.phosphorus ?? '—' }} · K {{ reading.potassium ?? '—' }}</strong>
                <small>{{ reading.unit || 'mg/kg' }}</small>
              </li>
            </ul>
          </article>
        </section>

        <section class="dashboard-card detection-history">
          <div class="section-heading">
            <div>
              <p class="eyebrow">{{ t('DETECTION HISTORY', 'KASAYSAYAN NG DETECTION') }}</p>
              <h2>{{ t('Your recent disease and pest scans', 'Mga huling scan ng sakit at peste') }}</h2>
            </div>
            <router-link to="/detect" class="text-link">{{ t('New scan', 'Bagong scan') }}</router-link>
          </div>
          <div v-if="!detectionHistory.length" class="empty-state">
            {{ t('No saved detections yet. Scan a plant to start your history.', 'Wala pang naka-save na detection. Mag-scan ng halaman para simulan ang history.') }}
          </div>
          <ul v-else class="detection-list">
            <li v-for="record in detectionHistory.slice(0, 8)" :key="record.id">
              <div>
                <strong>{{ record.detections.map((item) => item.displayName).join(', ') }}</strong>
                <small>{{ formatDate(record.timestamp) }}</small>
              </div>
              <span>{{ record.detections.length }} {{ t('detection(s)', 'detected') }}</span>
            </li>
          </ul>
        </section>

        <section class="quick-actions">
          <router-link to="/detect" class="dashboard-action-card">
            <span aria-hidden="true">📸</span>
            <strong>{{ t('Detect disease or pests', 'Mag-detect ng sakit o peste') }}</strong>
            <small>{{ t('Upload a plant image for guidance.', 'Mag-upload ng larawan ng halaman para sa gabay.') }}</small>
          </router-link>
          <router-link to="/soil-quality" class="dashboard-action-card">
            <span aria-hidden="true">🌱</span>
            <strong>{{ t('Check soil quality', 'Suriin ang kalidad ng lupa') }}</strong>
            <small>{{ t('Review NPK, weather, and yield tools.', 'Tingnan ang NPK, panahon, at yield tools.') }}</small>
          </router-link>
          <router-link to="/chat" class="dashboard-action-card">
            <span aria-hidden="true">💬</span>
            <strong>{{ t('Ask the AI assistant', 'Magtanong sa AI assistant') }}</strong>
            <small>{{ t('Get practical farming guidance.', 'Kumuha ng praktikal na gabay sa pagsasaka.') }}</small>
          </router-link>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { browserLocalPersistence, createUserWithEmailAndPassword, onAuthStateChanged, setPersistence, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { firebaseConfigured, forgetFarmer, getFarmerAuth, readDetectionHistory, readNpkHistory, rememberFarmer } from '../utils/farmerData.js';

const language = ref(localStorage.getItem('agridrone-dashboard-language') || 'en');
const router = useRouter();
const firebaseUser = ref(null);
const authReady = ref(false);
const authForm = reactive({ email: '', password: '' });
const authLoading = ref(false);
const authError = ref('');
const isRegistering = ref(false);
const npkHistory = ref([]);
const latestNpk = computed(() => npkHistory.value[0] || null);
const detectionHistory = ref([]);
const profileSaved = ref(false);
const farmProfile = reactive({ name: '', location: '', area: null, cropStage: '' });
let farmerAuth;
let authUnsubscribe;

function t(english, tagalog) {
  return language.value === 'tl' ? tagalog : english;
}

function setLanguage(value) {
  language.value = value;
  localStorage.setItem('agridrone-dashboard-language', value);
}

function profileStorageKey() {
  return firebaseUser.value ? `agridrone-farm-profile-${firebaseUser.value.uid}` : '';
}

function loadFarmProfile() {
  try {
    const saved = JSON.parse(localStorage.getItem(profileStorageKey()) || 'null');
    Object.assign(farmProfile, { name: '', location: '', area: null, cropStage: '', ...(saved || {}) });
  } catch {
    Object.assign(farmProfile, { name: '', location: '', area: null, cropStage: '' });
  }
}

function saveFarmProfile() {
  try {
    localStorage.setItem(profileStorageKey(), JSON.stringify(farmProfile));
    profileSaved.value = true;
    window.showToast?.(t('Farm profile saved', 'Naka-save ang profile ng bukid'), 'success');
  } catch {
    window.showToast?.(t('Unable to save the farm profile', 'Hindi ma-save ang profile ng bukid'), 'error');
  }
}

function loadDashboardHistory() {
  npkHistory.value = readNpkHistory();
  detectionHistory.value = readDetectionHistory(firebaseUser.value?.uid || 'anonymous');
}

async function submitAuth() {
  authLoading.value = true;
  authError.value = '';
  try {
    farmerAuth = farmerAuth || getFarmerAuth();
    if (!farmerAuth) {
      throw new Error(t('Account sign-in is not configured.', 'Hindi naka-configure ang pag-sign in.'));
    }
    const auth = farmerAuth;
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      authError.value = error.message || t('Unable to persist the farmer session.', 'Hindi ma-save ang farmer session.');
    });
    if (isRegistering.value) {
      await createUserWithEmailAndPassword(auth, authForm.email, authForm.password);
    } else {
      await signInWithEmailAndPassword(auth, authForm.email, authForm.password);
    }
    authForm.password = '';
    firebaseUser.value = auth.currentUser;
    rememberFarmer(firebaseUser.value);
    loadFarmProfile();
    loadDashboardHistory();
    await router.push({ name: 'Dashboard' });
  } catch (error) {
    const messages = {
      'auth/invalid-credential': t('This account was not found or the email/password is incorrect. Create the account first if you are a new farmer.', 'Hindi makita ang account o mali ang email/password. Gumawa muna ng account kung bagong farmer.'),
      'auth/user-not-found': t('No farmer account exists for this email. Choose “Create an account” first.', 'Walang farmer account para sa email na ito. Piliin muna ang “Gumawa ng account.”'),
      'auth/wrong-password': t('The password is incorrect.', 'Mali ang password.'),
      'auth/invalid-email': t('Enter a valid email address.', 'Maglagay ng valid na email address.'),
      'auth/email-already-in-use': t('This email already has an account. Switch to Sign in.', 'May account na ang email na ito. Lumipat sa Mag-sign in.'),
      'auth/weak-password': t('Use a password with at least 6 characters.', 'Gumamit ng password na hindi bababa sa 6 na character.'),
      'auth/too-many-requests': t('Too many attempts. Wait a few minutes and try again.', 'Masyadong maraming pagtatangka. Maghintay ng ilang minuto at subukan muli.'),
      'auth/operation-not-allowed': t('Email/password sign-in is disabled in Firebase. Enable it in Firebase Console > Authentication > Sign-in method.', 'Naka-disable ang email/password sign-in sa Firebase. I-enable ito sa Firebase Console > Authentication > Sign-in method.'),
      'auth/invalid-api-key': t('The Firebase API key is invalid.', 'Hindi valid ang Firebase API key.'),
      'auth/network-request-failed': t('Unable to reach Firebase. Check your internet connection.', 'Hindi maabot ang Firebase. Suriin ang internet connection.'),
    };
    authError.value = messages[error.code] || error.message || t('Unable to access the account.', 'Hindi ma-access ang account.');
  } finally {
    authLoading.value = false;
  }
}

function toggleAuthMode() {
  isRegistering.value = !isRegistering.value;
  authError.value = '';
}

async function signOutFarmer() {
  farmerAuth = farmerAuth || getFarmerAuth();
  if (farmerAuth) {
    await signOut(farmerAuth);
    forgetFarmer();
  }
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat(language.value === 'tl' ? 'fil-PH' : 'en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

async function initializeFirebase() {
  if (!firebaseConfigured) {
    authReady.value = true;
    return;
  }
  try {
    farmerAuth = getFarmerAuth();
    setPersistence(farmerAuth, browserLocalPersistence).catch((error) => {
      authError.value = error.message || t('Unable to persist the farmer session.', 'Hindi ma-save ang farmer session.');
    });
    authUnsubscribe = onAuthStateChanged(
      farmerAuth,
      (user) => {
        firebaseUser.value = user;
        authReady.value = true;
        if (!user) return;
        rememberFarmer(user);
        loadFarmProfile();
        loadDashboardHistory();
      },
      (error) => {
        firebaseUser.value = null;
        authReady.value = true;
        authError.value = error.message || t('Unable to check the farmer account.', 'Hindi masuri ang farmer account.');
      }
    );
  } catch (error) {
    authReady.value = true;
    authError.value = error.message || t('Firebase could not be initialized.', 'Hindi ma-initialize ang Firebase.');
  }
}

onMounted(initializeFirebase);
onBeforeUnmount(() => authUnsubscribe?.());
</script>

<style scoped>
.dashboard-page { padding: var(--spacing-2xl) 0; background: var(--bg-secondary); min-height: 100%; }
.dashboard-header, .welcome-card, .section-heading, .dashboard-actions { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--spacing-lg); }
.dashboard-header { margin-bottom: var(--spacing-xl); }
.dashboard-header h1, .auth-card h2, .welcome-card h2, .dashboard-card h2 { margin: 0 0 var(--spacing-sm); }
.eyebrow, .stat-label { color: var(--primary); font-size: var(--font-size-xs); font-weight: 800; letter-spacing: .12em; }
.dashboard-header .muted, .welcome-card .muted { margin: 0; }
.dashboard-actions { align-items: center; flex-wrap: wrap; }
.language-switcher { display: flex; gap: 2px; padding: 3px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--card); }
.language-switcher button { border: 0; border-radius: var(--radius-sm); padding: var(--spacing-xs) var(--spacing-sm); background: transparent; color: var(--text-secondary); cursor: pointer; font-weight: 600; }
.language-switcher button.active { background: var(--primary); color: var(--text-light); }
.dashboard-card { padding: var(--spacing-xl); border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--card); box-shadow: var(--shadow-sm); }
.notice-card, .auth-card { max-width: 640px; margin: 0 auto; }
.auth-card { display: grid; gap: var(--spacing-lg); }
.auth-form, .profile-form { display: grid; gap: var(--spacing-md); }
.auth-form label, .profile-form label { display: grid; gap: var(--spacing-xs); color: var(--text-secondary); font-weight: 600; }
.error-message { margin: 0; color: var(--error-text); }
.text-button, .text-link { border: 0; padding: 0; background: transparent; color: var(--primary); cursor: pointer; font-weight: 600; text-decoration: none; }
.dashboard-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--spacing-md); margin-bottom: var(--spacing-md); }
.stat-card { display: grid; gap: var(--spacing-xs); }
.stat-card strong { font-size: var(--font-size-xl); color: var(--text); }
.stat-card .muted { font-size: var(--font-size-sm); }
.welcome-card { align-items: center; margin-bottom: var(--spacing-md); }
.profile-status { padding: var(--spacing-xs) var(--spacing-sm); border-radius: 999px; background: var(--success-bg); color: var(--success-text); font-size: var(--font-size-sm); font-weight: 700; }
.dashboard-columns { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: var(--spacing-md); }
.dashboard-columns .dashboard-card { min-width: 0; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md); }
.reading-list { display: grid; gap: var(--spacing-sm); padding: 0; margin: var(--spacing-lg) 0 0; list-style: none; }
.reading-list li { display: grid; grid-template-columns: 1fr auto; gap: var(--spacing-xs) var(--spacing-md); padding: var(--spacing-sm) 0; border-bottom: 1px solid var(--border-light); }
.reading-list li small { grid-column: 1 / -1; color: var(--text-muted); }
.empty-state { padding: var(--spacing-xl) 0; color: var(--text-secondary); }
.detection-history { margin-top: var(--spacing-md); }
.detection-list { display: grid; gap: var(--spacing-sm); padding: 0; margin: var(--spacing-lg) 0 0; list-style: none; }
.detection-list li { display: flex; align-items: center; justify-content: space-between; gap: var(--spacing-md); padding: var(--spacing-sm) 0; border-bottom: 1px solid var(--border-light); }
.detection-list li > div { display: grid; gap: var(--spacing-xs); }
.detection-list small { color: var(--text-muted); }
.detection-list li > span { color: var(--text-secondary); font-size: var(--font-size-sm); white-space: nowrap; }
.quick-actions { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--spacing-md); margin-top: var(--spacing-md); }
.dashboard-action-card { display: grid; gap: var(--spacing-xs); padding: var(--spacing-lg); border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--card); color: var(--text); text-decoration: none; transition: var(--transition); }
.dashboard-action-card:hover { border-color: var(--primary); transform: translateY(-2px); }
.dashboard-action-card > span { font-size: 1.8rem; }
.dashboard-action-card small { color: var(--text-secondary); }
@media (max-width: 800px) {
  .dashboard-header, .welcome-card { align-items: stretch; flex-direction: column; }
  .dashboard-grid, .dashboard-columns, .quick-actions { grid-template-columns: 1fr; }
  .detection-list li { align-items: flex-start; flex-direction: column; }
}
@media (max-width: 480px) {
  .dashboard-page { padding: var(--spacing-xl) 0; }
  .dashboard-card { padding: var(--spacing-lg); }
  .form-row { grid-template-columns: 1fr; }
}
</style>
