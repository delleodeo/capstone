<!-- FILE: client/src/views/Home.vue -->
<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <div class="hero-text">
            <h1 class="hero-title">
              AI-Powered <span class="text-gradient">Citrus Disease</span> Detection
            </h1>
            <p class="hero-subtitle">
              Protect your dalandan crops with instant, AI-powered disease diagnosis. 
              Upload a leaf photo and get expert recommendations in seconds.
            </p>
            <div class="hero-actions">
              <router-link to="/detect" class="btn btn-primary btn-lg">
                Start Detection
                <span>📱</span>
              </router-link>
              <router-link to="/chat" class="btn btn-outline btn-lg">
                Ask AI Assistant
                <span>💬</span>
              </router-link>
            </div>
          </div>
          
          <div class="hero-visual">
            <div class="feature-demo">
              <div class="demo-card">
                <div class="demo-image">
                  <div class="image-placeholder">
                    <span class="leaf-icon">🍃</span>
                  </div>
                </div>
                <div class="demo-result">
                  <div class="result-header">
                    <span class="status-indicator success"></span>
                    <span>Analysis Complete</span>
                  </div>
                  <div class="confidence-bar">
                    <div class="confidence-fill" :style="{ width: '87%' }"></div>
                  </div>
                  <p class="result-text">Healthy Citrus - 87% confidence</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="container">
        <div class="section-header">
          <h2>How AgriDrone Helps Filipino Farmers</h2>
          <p>Advanced AI technology made simple for everyday use</p>
        </div>
        
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">📸</div>
            <h3>Instant Detection</h3>
            <p>Take a photo or upload an image of your dalandan leaf. Our AI analyzes it in seconds using advanced machine learning.</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">🎯</div>
            <h3>Accurate Diagnosis</h3>
            <p>Identify 4 key conditions: Healthy leaves, Black Spot, Canker, and Greening disease with high accuracy rates.</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">📋</div>
            <h3>Expert Recommendations</h3>
            <p>Get detailed treatment and prevention guidance tailored to your specific diagnosis and farming conditions.</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">💬</div>
            <h3>AI Assistant</h3>
            <p>Ask questions anytime about citrus farming, disease management, and get personalized advice from our AI assistant.</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">🌱</div>
            <h3>Sustainable Farming</h3>
            <p>Emphasis on organic solutions, integrated pest management, and environmentally friendly practices.</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">📱</div>
            <h3>Mobile Friendly</h3>
            <p>Works perfectly on smartphones and tablets. Use it directly in the field while inspecting your crops.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Quick Start Section -->
    <section class="quick-start">
      <div class="container">
        <div class="section-header">
          <h2>Get Started in 3 Simple Steps</h2>
          <p>No training required - start protecting your crops today</p>
        </div>
        
        <div class="steps">
          <div class="step">
            <div class="step-number">1</div>
            <div class="step-content">
              <h3>Capture or Upload</h3>
              <p>Take a clear photo of a dalandan leaf or upload an existing image from your device.</p>
            </div>
          </div>
          
          <div class="step">
            <div class="step-number">2</div>
            <div class="step-content">
              <h3>AI Analysis</h3>
              <p>Our trained model analyzes the image and identifies potential diseases or confirms healthy status.</p>
            </div>
          </div>
          
          <div class="step">
            <div class="step-number">3</div>
            <div class="step-content">
              <h3>Get Recommendations</h3>
              <p>Receive detailed guidance on treatment, prevention, and when to consult agricultural experts.</p>
            </div>
          </div>
        </div>
        
        <div class="cta-section">
          <router-link to="/detect" class="btn btn-secondary btn-lg">
            Try Disease Detection Now
          </router-link>
        </div>
      </div>
    </section>

    <!-- Supported class catalog -->
    <section class="diseases-info supported-catalog">
      <div class="container">
        <div class="section-header">
          <h2>Supported Citrus Diseases, Pests & Other Classes</h2>
          <p>All: 40 · Diseases & Conditions: 15 · Pests: 18 · Other: 7</p>
        </div>
        <div class="catalog-controls">
          <div class="catalog-tabs" role="tablist" aria-label="Class categories">
            <button
              v-for="tab in categoryTabs"
              :key="tab.key"
              class="catalog-tab"
              :class="{ active: selectedCategory === tab.key }"
              type="button"
              role="tab"
              :aria-selected="selectedCategory === tab.key"
              @click="selectedCategory = tab.key"
            >
              {{ tab.label }} ({{ tab.count }})
            </button>
          </div>
          <label class="catalog-search">
            <span>Search supported classes</span>
            <input v-model.trim="searchQuery" type="search" placeholder="Search by name or label" />
          </label>
        </div>
        <div v-if="filteredClasses.length" class="diseases-grid">
          <article v-for="item in filteredClasses" :key="item.label" class="disease-card">
            <div class="disease-icon" aria-hidden="true">{{ item.icon }}</div>
            <h3>{{ item.displayName }}</h3>
            <span class="catalog-category">{{ categoryLabel(item.category) }}</span>
            <p>{{ item.description }}</p>
            <details>
              <summary>Model label</summary>
              <code>{{ item.label }}</code>
            </details>
          </article>
        </div>
        <div v-else class="catalog-empty" role="status">
          No supported class matches “{{ searchQuery }}”. Try another display name or exact model label.
        </div>
        <p class="catalog-note">
          This is the model’s supported label set, not a list of pests confirmed in Oriental Mindoro.
          Validate results on representative local dalandan images. See the
          <a href="https://universe.roboflow.com/myproject-dgrxa/citrus-disease-detection-yoydc-ygw6l" target="_blank" rel="noopener noreferrer">pretrained Roboflow model</a>
          and its CC BY 4.0 attribution.
        </p>
        <router-link to="/detect" class="btn btn-primary">Analyze an image</router-link>
      </div>
    </section>
  </div>
</template>

<script>
import {
  CLASS_CATALOG,
  CLASS_CATEGORY_LABELS
} from '../../../shared/classCatalog.js';

export default {
  name: 'Home',

  data() {
    return {
      classes: CLASS_CATALOG,
      selectedCategory: 'all',
      searchQuery: ''
    };
  },

  computed: {
    categoryTabs() {
      return ['all', 'disease', 'pest', 'other'].map((key) => ({
        key,
        label: CLASS_CATEGORY_LABELS[key],
        count: key === 'all'
          ? this.classes.length
          : this.classes.filter((item) => item.category === key).length
      }));
    },

    filteredClasses() {
      const query = this.searchQuery.toLowerCase();
      return this.classes.filter((item) => {
        const categoryMatches = this.selectedCategory === 'all' || item.category === this.selectedCategory;
        const searchMatches = !query ||
          item.displayName.toLowerCase().includes(query) ||
          item.label.toLowerCase().includes(query);
        return categoryMatches && searchMatches;
      });
    }
  },

  methods: {
    categoryLabel(category) {
      return CLASS_CATEGORY_LABELS[category] || 'Unknown';
    }
  }
};
</script>

<style scoped>
.catalog-controls {
  display: grid;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.catalog-tabs {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--spacing-sm);
}

.catalog-tab {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--card);
  color: var(--text-secondary);
  cursor: pointer;
  font: inherit;
}

.catalog-tab.active,
.catalog-tab:hover {
  border-color: var(--primary);
  background: var(--primary);
  color: var(--text-light);
}

.catalog-search {
  display: grid;
  gap: var(--spacing-xs);
  max-width: 32rem;
  margin: 0 auto;
  color: var(--text-secondary);
  font-weight: 600;
}

.catalog-search input {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--card);
  color: var(--text);
  font: inherit;
}

.catalog-category {
  display: inline-block;
  margin-bottom: var(--spacing-sm);
  color: var(--primary);
  font-size: var(--font-size-sm);
  font-weight: 700;
}

.disease-card details {
  margin-top: var(--spacing-md);
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}

.disease-card code {
  display: block;
  margin-top: var(--spacing-xs);
  overflow-wrap: anywhere;
}

.catalog-empty,
.catalog-note {
  margin: var(--spacing-xl) auto;
  max-width: 50rem;
  color: var(--text-secondary);
  text-align: center;
  line-height: 1.6;
}

.catalog-note a {
  color: var(--primary);
}

/* Hero Section */
.hero {
  background: linear-gradient(135deg, var(--green-50) 0%, var(--orange-50) 100%);
  padding: var(--spacing-2xl) 0;
  min-height: 80vh;
  display: flex;
  align-items: center;
}

.hero-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-2xl);
  align-items: center;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: var(--spacing-lg);
  color: var(--text);
}

.text-gradient {
  background: linear-gradient(135deg, var(--green-600), var(--orange-500));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: var(--font-size-xl);
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: var(--spacing-2xl);
}

.hero-actions {
  display: flex;
  gap: var(--spacing-lg);
}

/* Feature Demo */
.feature-demo {
  display: flex;
  justify-content: center;
}

.demo-card {
  background: var(--card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-lg);
  max-width: 300px;
  width: 100%;
}

.demo-image {
  background: var(--bg-secondary);
  border-radius: var(--radius);
  padding: var(--spacing-xl);
  text-align: center;
  margin-bottom: var(--spacing-lg);
}

.image-placeholder {
  width: 80px;
  height: 80px;
  background: var(--green-100);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.leaf-icon {
  font-size: 2rem;
}

.demo-result {
  text-align: center;
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-indicator.success {
  background-color: var(--success);
}

.confidence-bar {
  background: var(--bg-tertiary);
  border-radius: var(--radius);
  height: 8px;
  margin-bottom: var(--spacing-md);
  overflow: hidden;
}

.confidence-fill {
  background: linear-gradient(90deg, var(--green-500), var(--green-400));
  height: 100%;
  border-radius: var(--radius);
  transition: var(--transition);
}

.result-text {
  font-weight: 600;
  color: var(--success);
  margin: 0;
}

/* Features Section */
.features {
  padding: var(--spacing-2xl) 0;
  background: var(--bg);
}

.section-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

.section-header h2 {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  margin-bottom: var(--spacing-md);
  color: var(--text);
}

.section-header p {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  margin-bottom: 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-xl);
}

.feature-card {
  background: var(--card);
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  text-align: center;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border);
  transition: var(--transition);
}

.feature-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: var(--spacing-lg);
}

.feature-card h3 {
  font-size: var(--font-size-xl);
  font-weight: 600;
  margin-bottom: var(--spacing-md);
  color: var(--text);
}

.feature-card p {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 0;
}

/* Quick Start Section */
.quick-start {
  padding: var(--spacing-2xl) 0;
  background: var(--bg-secondary);
}

.steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-2xl);
}

.step {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-lg);
  text-align: left;
}

.step-number {
  width: 3rem;
  height: 3rem;
  background: var(--primary);
  color: var(--text-light);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xl);
  font-weight: 700;
  flex-shrink: 0;
}

.step-content h3 {
  font-size: var(--font-size-xl);
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
  color: var(--text);
}

.step-content p {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 0;
}

.cta-section {
  text-align: center;
}

/* Diseases Info Section */
.diseases-info {
  padding: var(--spacing-2xl) 0;
  background: var(--bg);
}

.diseases-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
}

.disease-card {
  background: var(--card);
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  text-align: center;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border);
  transition: var(--transition);
  position: relative;
}

.disease-card:hover {
  box-shadow: var(--shadow-md);
}

.disease-card.healthy {
  border-color: var(--green-300);
  background: var(--success-bg);
}

.disease-icon {
  font-size: 2.5rem;
  margin-bottom: var(--spacing-lg);
}

.disease-card h3 {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin-bottom: var(--spacing-md);
  color: var(--text);
}

.disease-card p {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: var(--spacing-lg);
}

.severity-indicator {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius);
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: uppercase;
}

.severity-indicator.low {
  background: var(--success-bg);
  color: var(--green-800);
}

.severity-indicator.medium {
  background: var(--warning-bg);
  color: #92400e;
}

.severity-indicator.high {
  background: var(--error-bg);
  color: #991b1b;
}

/* Responsive Design */
@media (max-width: 968px) {
  .hero-content {
    grid-template-columns: 1fr;
    text-align: center;
    gap: var(--spacing-xl);
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-actions {
    justify-content: center;
    flex-wrap: wrap;
  }

  .steps {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .hero {
    padding: var(--spacing-xl) 0;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: var(--font-size-lg);
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-md);
  }

  .features-grid,
  .diseases-grid {
    grid-template-columns: 1fr;
  }

  .step {
    text-align: center;
    flex-direction: column;
    align-items: center;
  }
}
</style>