<template>
  <div class="prediction-card">
    <div class="prediction-header">
      <h3>Detection Results</h3>
      <span class="analysis-timestamp">{{ formatTimestamp(result.timestamp) }}</span>
    </div>

    <div v-if="!hasDetections" class="empty-result" role="status">
      <div class="empty-icon">🔎</div>
      <h4>No supported detection</h4>
      <p>No supported citrus condition or pest detected. Try a clearer close-up image.</p>
      <small>
        An empty result can also mean the image is blurry, the model missed a condition,
        or the condition is outside the supported classes.
      </small>
    </div>

    <template v-else>
      <div class="top-prediction">
        <div class="prediction-main">
          <div class="condition-info">
            <div class="condition-icon">{{ getConditionIcon(topPrediction.diseaseKey) }}</div>
            <div>
              <h4 class="condition-name">{{ topPrediction.displayName }}</h4>
              <p class="condition-key">{{ topPrediction.className }}</p>
            </div>
          </div>

          <div class="confidence-section">
            <div class="confidence-value">{{ formatConfidence(topPrediction.confidence) }}%</div>
            <div class="confidence-label">Model confidence</div>
          </div>
        </div>
      </div>

      <div v-if="showDetailed" class="detailed-predictions">
        <h4>All accepted detections</h4>
        <div class="predictions-list">
          <div
            v-for="(prediction, index) in predictions"
            :key="`${prediction.className}-${index}`"
            class="prediction-item"
          >
            <div class="prediction-info">
              <span class="prediction-icon">{{ getConditionIcon(prediction.diseaseKey) }}</span>
              <span>
                <strong>{{ prediction.displayName }}</strong>
                <small>{{ prediction.category }} · {{ prediction.className }}</small>
              </span>
            </div>
            <span class="confidence-badge">{{ formatConfidence(prediction.confidence) }}%</span>
          </div>
        </div>
      </div>

      <div class="confidence-disclaimer">
        Confidence shows how strongly the model matched a detection. It does not measure
        disease severity or the percentage of the plant that is infected.
      </div>
    </template>

    <div v-if="showDetailed" class="model-info">
      <details>
        <summary>Model information</summary>
        <div class="model-content">
          <div>
            <span class="stat-label">Provider</span>
            <strong>{{ result.provider || 'Local TensorFlow.js model' }}</strong>
          </div>
          <div>
            <span class="stat-label">Image size</span>
            <strong>{{ result.image?.width || '—' }} × {{ result.image?.height || '—' }}</strong>
          </div>
          <div>
            <span class="stat-label">Experimental threshold</span>
            <strong>{{ result.threshold === undefined ? 'Not used' : `${formatConfidence(result.threshold)}%` }}</strong>
          </div>
        </div>
      </details>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PredictionCard',

  props: {
    result: {
      type: Object,
      required: true
    },
    showDetailed: {
      type: Boolean,
      default: true
    }
  },

  computed: {
    predictions() {
      return this.result.allPredictions || this.result.predictions || [];
    },

    topPrediction() {
      return this.result.topPrediction || this.predictions[0] || null;
    },

    hasDetections() {
      return this.result.status !== 'no_supported_detection' && Boolean(this.topPrediction);
    }
  },

  methods: {
    getConditionIcon(conditionKey) {
      const icons = {
        healthy: '✅',
        'black-spot': '🔵',
        canker: '🟠',
        greening: '🟡',
        'citrus-psyllid': '🪲',
        'citrus-leafminer': '🐛',
        'citrus-fruit-fly': '🪰',
        'scale-insects': '🪲',
        'red-wax-scale': '🔴'
      };
      return icons[conditionKey] || '🔎';
    },

    formatConfidence(confidence) {
      const numeric = Number(confidence);
      return Number.isFinite(numeric) ? Math.round(numeric * 100) : 0;
    },

    formatTimestamp(timestamp) {
      const date = new Date(timestamp);
      if (Number.isNaN(date.getTime())) return 'Just now';
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
};
</script>

<style scoped>
.prediction-card {
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--card);
  box-shadow: var(--shadow);
}

.prediction-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border);
  background: var(--bg-secondary);
}

.prediction-header h3,
.condition-name,
.detailed-predictions h4,
.empty-result h4 {
  margin: 0;
}

.analysis-timestamp,
.condition-key,
.prediction-info small,
.empty-result small {
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}

.top-prediction,
.empty-result {
  padding: var(--spacing-xl);
}

.prediction-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-lg);
}

.condition-info,
.prediction-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.condition-icon {
  font-size: 2.5rem;
}

.condition-name {
  font-size: var(--font-size-xl);
}

.condition-key {
  margin: var(--spacing-xs) 0 0;
  font-family: monospace;
}

.confidence-section {
  text-align: center;
}

.confidence-value {
  color: var(--success);
  font-size: 2.4rem;
  font-weight: 800;
  line-height: 1;
}

.confidence-label {
  margin-top: var(--spacing-xs);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.detailed-predictions,
.model-info {
  padding: var(--spacing-lg) var(--spacing-xl);
  border-top: 1px solid var(--border-light);
}

.predictions-list {
  display: grid;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
}

.prediction-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: var(--radius);
  background: var(--bg-secondary);
}

.prediction-info span:last-child {
  display: grid;
  gap: 0.15rem;
}

.prediction-icon {
  font-size: var(--font-size-xl);
}

.confidence-badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 999px;
  background: var(--success-bg);
  color: var(--success-text);
  font-weight: 700;
}

.confidence-disclaimer {
  padding: var(--spacing-md) var(--spacing-xl);
  border-top: 1px solid var(--border-light);
  background: var(--info-bg);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.empty-result {
  display: grid;
  justify-items: center;
  gap: var(--spacing-sm);
  text-align: center;
}

.empty-result p {
  margin: 0;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 2.5rem;
}

.model-info summary {
  cursor: pointer;
  color: var(--text-secondary);
  font-weight: 600;
}

.model-content {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
}

.model-content > div {
  display: grid;
  gap: var(--spacing-xs);
}

.stat-label {
  color: var(--text-muted);
  font-size: var(--font-size-xs);
}

@media (max-width: 640px) {
  .prediction-header,
  .prediction-main,
  .prediction-item {
    align-items: center;
    flex-direction: column;
    text-align: center;
  }

  .model-content {
    grid-template-columns: 1fr;
  }
}
</style>
