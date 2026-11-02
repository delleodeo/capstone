<!-- FILE: client/src/components/RecommendationCard.vue -->
<template>
  <div class="recommendation-card">
    <div class="recommendation-header">
      <h3>💡 Treatment Recommendations</h3>
      <div v-if="recommendation.severity" class="severity-badge" :class="`severity-${recommendation.severity}`">
        {{ recommendation.severity.toUpperCase() }} PRIORITY
      </div>
    </div>

    <div class="recommendation-content">
      <div v-if="recommendation.description" class="recommendation-description">
        <h4>About {{ recommendation.displayName || 'this detected class' }}</h4>
        <p>{{ recommendation.description }}</p>
      </div>

      <!-- Summary -->
      <div class="recommendation-summary">
        <p>{{ recommendation.summary }}</p>
      </div>

      <!-- Symptoms -->
      <div v-if="recommendation.symptoms?.length" class="recommendation-section">
        <h4>🔍 Symptoms</h4>
        <ul class="recommendation-list">
          <li v-for="symptom in recommendation.symptoms" :key="symptom">{{ symptom }}</li>
        </ul>
      </div>

      <!-- Causes -->
      <div v-if="recommendation.causes?.length" class="recommendation-section">
        <h4>🧬 Causes</h4>
        <ul class="recommendation-list">
          <li v-for="cause in recommendation.causes" :key="cause">{{ cause }}</li>
        </ul>
      </div>

      <!-- Treatment Steps -->
      <div v-if="recommendation.treatmentSteps?.length" class="recommendation-section treatment">
        <h4>💊 Treatment Steps</h4>
        <ol class="recommendation-steps">
          <li v-for="step in recommendation.treatmentSteps" :key="step">{{ step }}</li>
        </ol>
      </div>

      <!-- Prevention -->
      <div v-if="recommendation.preventionSteps?.length" class="recommendation-section prevention">
        <h4>🛡️ Prevention</h4>
        <ol class="recommendation-steps">
          <li v-for="step in recommendation.preventionSteps" :key="step">{{ step }}</li>
        </ol>
      </div>

      <!-- When to Escalate -->
      <div v-if="recommendation.whenToEscalate?.length" class="recommendation-section escalation">
        <h4>⚠️ When to Contact an Expert</h4>
        <div class="expert-contact-grid">
          <div v-for="(condition, index) in recommendation.whenToEscalate" :key="condition" class="expert-contact-item">
            <div class="contact-urgency" :class="getUrgencyClass(index)">
              <span class="urgency-label">{{ getUrgencyLabel(index) }}</span>
            </div>
            <div class="contact-reason">
              {{ condition }}
            </div>
          </div>
        </div>
      </div>

      <!-- AI Enhancements -->
      <div v-if="recommendation.aiEnhancements" class="ai-enhancements">
        <h4>🤖 AI-Enhanced Advice</h4>
        
        <div v-if="recommendation.aiEnhancements.additionalNotes" class="ai-notes">
          <p>{{ recommendation.aiEnhancements.additionalNotes }}</p>
        </div>

        <div v-if="recommendation.aiEnhancements.enhancedTreatment?.length" class="enhanced-section">
          <h5>Additional Treatment Options</h5>
          <ul>
            <li v-for="treatment in recommendation.aiEnhancements.enhancedTreatment" :key="treatment">
              {{ treatment }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Disclaimer -->
    <div class="recommendation-footer">
      <div class="disclaimer">
        <strong>⚠️ Important Disclaimer:</strong> 
        {{ recommendation.disclaimer || 'This is guidance only. Always consult with agricultural experts for professional diagnosis and treatment confirmation.' }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RecommendationCard',
  
  props: {
    recommendation: {
      type: Object,
      required: true
    },
    diseaseKey: {
      type: String,
      required: true
    }
  },

  methods: {
    getUrgencyClass(index) {
      // First item is typically most urgent
      if (index === 0) return 'urgent';
      if (index === 1) return 'high';
      return 'normal';
    },

    getUrgencyLabel(index) {
      if (index === 0) return 'Immediately';
      if (index === 1) return 'This week';
      return 'Monitor';
    }
  }
};
</script>

<style scoped>
.recommendation-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow);
}

.recommendation-header {
  background: var(--bg-secondary);
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.recommendation-header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text);
}

.severity-badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius);
  font-size: var(--font-size-xs);
  font-weight: 700;
  text-transform: uppercase;
}

.severity-low {
  background: var(--success-bg);
  color: var(--success-text);
}

.severity-medium {
  background: var(--warning-bg);
  color: var(--warning-text);
}

.severity-high {
  background: var(--error-bg);
  color: var(--error-text);
}

.recommendation-content {
  padding: var(--spacing-xl);
}

.recommendation-summary {
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-lg);
  background: var(--primary-light);
  border-left: 4px solid var(--primary);
  border-radius: var(--radius);
}

.recommendation-summary p {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: 500;
  line-height: 1.6;
  color: var(--text);
}

.recommendation-section {
  margin-bottom: var(--spacing-xl);
}

.recommendation-description {
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-lg);
  border-left: 4px solid var(--primary);
  border-radius: var(--radius);
  background: var(--info-bg);
}

.recommendation-description h4 {
  margin: 0 0 var(--spacing-sm);
  color: var(--text);
}

.recommendation-description p {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.65;
}

.recommendation-section h4 {
  margin: 0 0 var(--spacing-md) 0;
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--text);
}

.recommendation-section h5 {
  margin: var(--spacing-md) 0 var(--spacing-sm) 0;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text);
}

.recommendation-list,
.recommendation-steps {
  margin: 0;
  padding-left: var(--spacing-lg);
  color: var(--text-secondary);
  line-height: 1.6;
}

.recommendation-list li,
.recommendation-steps li {
  margin-bottom: var(--spacing-sm);
}

.treatment {
  background: var(--success-bg);
  padding: var(--spacing-lg);
  border-radius: var(--radius);
  border-left: 4px solid var(--success);
}

.prevention {
  background: var(--info-bg);
  padding: var(--spacing-lg);
  border-radius: var(--radius);
  border-left: 4px solid var(--info);
}

.escalation {
  background: var(--warning-bg);
  padding: var(--spacing-lg);
  border-radius: var(--radius);
  border-left: 4px solid var(--warning);
}

.expert-contact-grid {
  display: grid;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
}

.expert-contact-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--card);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.contact-urgency {
  flex-shrink: 0;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.contact-urgency.urgent {
  background: var(--error-bg);
  color: var(--error-text);
  border: 1px solid var(--error);
}

.contact-urgency.high {
  background: var(--warning-bg);
  color: var(--warning-text);
  border: 1px solid var(--warning);
}

.contact-urgency.normal {
  background: var(--info-bg);
  color: var(--info);
  border: 1px solid var(--info);
}

.contact-reason {
  flex: 1;
  color: var(--text);
  line-height: 1.5;
  font-weight: 500;
}

.expert-contact-grid {
  display: grid;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
}

.expert-contact-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--card);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.contact-urgency {
  flex-shrink: 0;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.contact-urgency.urgent {
  background: var(--error-bg);
  color: var(--error-text);
  border: 1px solid var(--error);
}

.contact-urgency.high {
  background: var(--warning-bg);
  color: var(--warning-text);
  border: 1px solid var(--warning);
}

.contact-urgency.normal {
  background: var(--info-bg);
  color: var(--info);
  border: 1px solid var(--info);
}

.contact-reason {
  flex: 1;
  color: var(--text);
  line-height: 1.5;
  font-weight: 500;
}

.ai-enhancements {
  background: linear-gradient(135deg, var(--primary-light), var(--secondary-light));
  padding: var(--spacing-lg);
  border-radius: var(--radius);
  border: 2px dashed var(--primary);
  margin-top: var(--spacing-xl);
}

.ai-enhancements h4 {
  color: var(--primary);
  margin-bottom: var(--spacing-md);
}

.ai-notes p {
  font-style: italic;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
}

.enhanced-section {
  margin-top: var(--spacing-md);
}

.enhanced-section ul {
  margin: 0;
  padding-left: var(--spacing-lg);
}

.enhanced-section li {
  margin-bottom: var(--spacing-xs);
  color: var(--text-secondary);
}

.recommendation-footer {
  background: var(--bg-tertiary);
  padding: var(--spacing-lg);
  border-top: 1px solid var(--border);
}

.disclaimer {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: 1.5;
  text-align: center;
}

.disclaimer strong {
  color: var(--warning);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .recommendation-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .recommendation-content {
    padding: var(--spacing-lg);
  }

  .recommendation-summary {
    padding: var(--spacing-md);
  }

  .treatment,
  .prevention,
  .escalation,
  .ai-enhancements {
    padding: var(--spacing-md);
  }

  .expert-contact-item {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-sm);
  }

  .contact-urgency {
    align-self: flex-start;
  }
}

@media (max-width: 480px) {
  .recommendation-header {
    padding: var(--spacing-md);
  }

  .recommendation-content {
    padding: var(--spacing-md);
  }

  .recommendation-footer {
    padding: var(--spacing-md);
  }
}
</style>