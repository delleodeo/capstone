<template>
  <div class="detect-page">
    <div class="container detection-container">
      <div class="page-header">
        <div class="page-eyebrow">SINDRONE IMAGE ANALYSIS</div>
        <h1>Citrus Disease & Pest Detection</h1>
        <p>Check a dalandan image for possible supported diseases, pests, and other classes.</p>
      </div>

      <ol class="flow-progress" aria-label="Detection progress">
        <li :class="{ current: currentStep === 1, complete: currentStep > 1 }">
          <span>1</span><strong>Choose image</strong>
        </li>
        <li :class="{ current: currentStep === 2, complete: currentStep > 2 }">
          <span>2</span><strong>Analyze</strong>
        </li>
        <li :class="{ current: currentStep === 3, complete: currentStep > 3 }">
          <span>3</span><strong>Review results</strong>
        </li>
      </ol>

      <div class="detection-flow">
        <section
          class="detection-step"
          :class="{ active: currentStep >= 1, completed: currentStep > 1 }"
          aria-labelledby="select-image-heading"
        >
          <div class="step-header">
            <div class="step-number">1</div>
            <div>
              <p class="step-kicker">START HERE</p>
              <h2 id="select-image-heading">Choose an image</h2>
              <p class="step-description">Use a clear photo where the leaf, fruit, or insect is easy to see.</p>
            </div>
          </div>

          <ImageUploader
            v-if="currentStep === 1"
            @image-selected="handleImageSelected"
            @error="handleError"
          />

          <div v-if="currentStep === 1 && selectedImage" class="proceed-section">
            <button @click="proceedToAnalysis" class="btn btn-primary btn-lg proceed-button">
              Continue to analysis <span aria-hidden="true">→</span>
            </button>
          </div>

          <div v-else-if="currentStep > 1 && selectedImage" class="image-preview-small">
            <img :src="selectedImage.preview" alt="Selected citrus image" />
            <div>
              <strong>{{ selectedImage.name }}</strong>
              <button @click="resetDetection" class="btn btn-outline btn-sm">
                Choose Different Image
              </button>
            </div>
          </div>
        </section>

        <section class="detection-step" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
          <div class="step-header">
            <div class="step-number">2</div>
            <div>
              <p class="step-kicker">NEXT</p>
              <h2>Analyze your image</h2>
              <p class="step-description">The hosted model checks for supported citrus targets.</p>
            </div>
          </div>

          <div v-if="currentStep === 2" class="analysis-section" aria-live="polite">
            <div v-if="isAnalyzing" class="analysis-progress" aria-live="polite">
              <div class="spinner-container"><div class="spinner"></div></div>
              <p class="analysis-title">Analyzing your image…</p>
              <p class="analysis-help">Keep this page open while the model checks the image.</p>
              <div class="progress-steps">
                <div class="progress-step" :class="{ active: analysisStep >= 1 }"><span>1</span> Uploading securely</div>
                <div class="progress-step" :class="{ active: analysisStep >= 2 }"><span>2</span> Checking image</div>
              </div>
            </div>

            <div v-else-if="analysisError" class="analysis-error">
              <div class="alert alert-error">
                <strong>Analysis failed:</strong> {{ analysisError }}
              </div>
              <button @click="runAnalysis" class="btn btn-primary">Try Again</button>
            </div>

            <div v-else class="analysis-ready">
              <div class="ready-icon" aria-hidden="true">✓</div>
              <p class="analysis-title">Image ready to analyze</p>
              <p class="analysis-help">Your image stays private to this analysis request.</p>
              <button @click="runAnalysis" class="btn btn-primary btn-lg">
                Analyze image
                <span>🔍</span>
              </button>
            </div>
          </div>

          <div v-else-if="currentStep > 2 && predictionResult" class="analysis-complete">
            <PredictionCard :result="predictionResult" :show-detailed="false" />
          </div>
        </section>

        <section
          v-if="predictionResult?.status === 'detected'"
          class="detection-step"
          :class="{ active: currentStep >= 3 }"
        >
          <div class="step-header">
            <div class="step-number">3</div>
            <div>
              <p class="step-kicker">DONE</p>
              <h2>Review results</h2>
              <p class="step-description">Use the boxes and model confidence as a starting point for field checking.</p>
            </div>
          </div>

          <div v-if="currentStep === 3 && predictionResult" class="results-section">
            <DetectionOverlay
              :src="selectedImage.preview"
              :image="predictionResult.image"
              :predictions="predictionResult.allPredictions"
            />

            <PredictionCard :result="predictionResult" :show-detailed="true" />

            <div v-if="predictionResult.status === 'detected'" class="recommendation-section">
              <div v-if="isLoadingRecommendation" class="loading-recommendation">
                <div class="spinner"></div>
                <p>Loading management guidance…</p>
              </div>

              <div v-else-if="recommendationError" class="recommendation-error">
                <div class="alert alert-warning">
                  <strong>Recommendations unavailable:</strong> {{ recommendationError }}
                </div>
                <button @click="loadRecommendation" class="btn btn-outline">Try Loading Again</button>
              </div>

              <RecommendationCard
                v-else-if="recommendation && recommendationTarget"
                :recommendation="recommendation"
                :disease-key="recommendationTarget.diseaseKey"
              />
            </div>

            <p class="provider-note">
              Powered by a pretrained Roboflow citrus detection model. Its performance must be
              evaluated on local dalandan images before results are used for field decisions.
            </p>

            <div class="results-actions">
              <button
                v-if="recommendationTarget"
                @click="enhanceWithAI"
                class="btn btn-secondary"
                :disabled="isEnhancing"
              >
                <span v-if="isEnhancing" class="spinner"></span>
                {{ isEnhancing ? 'Enhancing…' : 'Get AI-Enhanced Advice' }}
              </button>
              <router-link to="/chat" class="btn btn-outline">Ask Follow-up Questions</router-link>
              <button @click="resetDetection" class="btn btn-outline">Analyze Another Image</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import ImageUploader from '../components/ImageUploader.vue';
import DetectionOverlay from '../components/DetectionOverlay.vue';
import PredictionCard from '../components/PredictionCard.vue';
import RecommendationCard from '../components/RecommendationCard.vue';
import {
  detectCitrusConditions,
  generateAIRecommendation,
  getRecommendation
} from '../utils/api.js';
import { CLASS_CATALOG_BY_LABEL } from '../../../shared/classCatalog.js';

const PEST_KEYS = new Set([
  'citrus-psyllid',
  'citrus-leafminer',
  'citrus-fruit-fly',
  'scale-insects',
  'red-wax-scale'
]);

const LEGACY_RECOMMENDATION_KEYS = Object.freeze({
  healthy_leaf: 'healthy',
  citrus_black_spot: 'black-spot',
  citrus_canker: 'canker',
  citrus_huanglongbing: 'greening',
  citrus_psyllid: 'citrus-psyllid',
  citrus_leafminer: 'citrus-leafminer',
  citrus_fruit_fly: 'citrus-fruit-fly',
  other_scale_insect: 'scale-insects',
  red_wax_scale: 'red-wax-scale'
});

export default {
  name: 'Detect',

  components: {
    ImageUploader,
    DetectionOverlay,
    PredictionCard,
    RecommendationCard
  },

  data() {
    return {
      currentStep: 1,
      selectedImage: null,
      isAnalyzing: false,
      analysisStep: 0,
      analysisError: null,
      predictionResult: null,
      recommendation: null,
      isLoadingRecommendation: false,
      recommendationError: null,
      isEnhancing: false,
      activeDetectionController: null,
      analysisRequestId: 0
    };
  },

  computed: {
    recommendationTarget() {
      const predictions = this.predictionResult?.allPredictions || [];
      return predictions.find((prediction) => prediction.diseaseKey !== 'healthy') || predictions[0] || null;
    }
  },

  beforeUnmount() {
    this.cancelActiveAnalysis();
  },

  methods: {
    handleImageSelected(imageData) {
      this.cancelActiveAnalysis();
      this.selectedImage = imageData;
      this.clearResults();
    },

    proceedToAnalysis() {
      if (this.selectedImage) this.currentStep = 2;
    },

    handleError(error) {
      window.showToast?.(error, 'error');
    },

    cancelActiveAnalysis() {
      this.analysisRequestId += 1;
      this.activeDetectionController?.abort();
      this.activeDetectionController = null;
      this.isAnalyzing = false;
    },

    normalizeDetectionResult(response) {
      const allPredictions = response.predictions.map((prediction) => ({
        className: prediction.className,
        displayName: prediction.displayLabel,
        diseaseKey: LEGACY_RECOMMENDATION_KEYS[prediction.className] || prediction.className,
        category: prediction.category,
        recommendationKey: LEGACY_RECOMMENDATION_KEYS[prediction.className] || null,
        confidence: prediction.confidence,
        boundingBox: prediction.boundingBox
      }));

      return {
        ...response,
        status: response.status,
        provider: 'Roboflow',
        image: response.image,
        allPredictions,
        topPrediction: allPredictions[0] || null,
        timestamp: new Date().toISOString()
      };
    },

    async runAnalysis() {
      if (!this.selectedImage || this.isAnalyzing) return;

      this.cancelActiveAnalysis();
      const requestId = ++this.analysisRequestId;
      const controller = new AbortController();
      this.activeDetectionController = controller;
      this.isAnalyzing = true;
      this.analysisError = null;
      this.analysisStep = 1;

      try {
        await this.$nextTick();
        this.analysisStep = 2;
        const response = await detectCitrusConditions(this.selectedImage.file, {
          signal: controller.signal
        });

        if (requestId !== this.analysisRequestId || controller.signal.aborted) return;

        this.predictionResult = this.normalizeDetectionResult(response);
        this.currentStep = 3;

        if (response.status === 'detected') {
          this.loadRecommendation();
          window.showToast?.(`${response.predictions.length} detection(s) found`, 'success');
        } else {
          this.recommendation = null;
          window.showToast?.('No supported target detected', 'info');
        }
      } catch (error) {
        if (controller.signal.aborted || requestId !== this.analysisRequestId) return;
        this.analysisError = error.message || 'Detection service unavailable. Please try again.';
        window.showToast?.(this.analysisError, 'error');
      } finally {
        if (requestId === this.analysisRequestId) {
          this.isAnalyzing = false;
          this.activeDetectionController = null;
        }
      }
    },

    buildLocalRecommendation(prediction) {
      if (!prediction) return null;

      if (prediction.diseaseKey === 'healthy') {
        return {
          displayName: prediction.displayName,
          category: prediction.category,
          modelClass: prediction.className,
          description: this.getClassDescription(prediction),
          summary: 'A region was detected as Healthy Citrus. Continue monitoring the full plant and review any other detections listed above.',
          symptoms: [],
          causes: [],
          treatmentSteps: [],
          preventionSteps: ['Continue good watering, sanitation, nutrition, and regular inspection practices.'],
          whenToEscalate: ['If symptoms appear or plant health declines despite normal care.'],
          severity: 'low',
          disclaimer: 'Guidance only—confirm plant health with a local agriculture technician or DA office.'
        };
      }

      if (prediction.category === 'pest' || PEST_KEYS.has(prediction.diseaseKey)) {
        return {
          displayName: prediction.displayName,
          category: prediction.category,
          modelClass: prediction.className,
          description: this.getClassDescription(prediction),
          summary: `The model detected a possible ${prediction.displayName}. Confirm by inspecting the boxed region and nearby plants.`,
          symptoms: ['Inspect leaves, shoots, stems, and fruit around the detected region for live insects or feeding damage.'],
          causes: ['Possible pest presence; environmental and crop-management conditions may influence infestation.'],
          treatmentSteps: [
            'Isolate or mark affected plants for closer monitoring.',
            'Remove heavily affected material when practical and dispose of it safely.',
            'Use integrated pest management and follow locally approved product labels.'
          ],
          preventionSteps: [
            'Inspect new growth and fruit regularly.',
            'Keep tools and orchard debris clean.',
            'Encourage beneficial insects and avoid unnecessary broad-spectrum pesticide use.'
          ],
          whenToEscalate: ['The pest is present across multiple trees.', 'There is rapid damage, fruit drop, or continuing spread.'],
          severity: 'medium',
          disclaimer: 'Guidance only—confirm identification and treatment with a local agriculture technician or DA office.'
        };
      }

      return {
        displayName: prediction.displayName,
        category: prediction.category,
        modelClass: prediction.className,
        description: this.getClassDescription(prediction),
        summary: `Possible ${prediction.displayName} detected. Review the boxed region and confirm the finding with a local agriculture technician.`,
        symptoms: ['Inspect the detected area and nearby plant tissue for matching symptoms or organisms.'],
        causes: ['The model label is an initial image-based classification and may require field confirmation.'],
        treatmentSteps: ['Document the affected plant and monitor changes before applying any treatment.'],
        preventionSteps: ['Maintain sanitation and regular scouting of nearby citrus plants.'],
        whenToEscalate: ['The condition spreads, affects fruit or new growth, or cannot be confirmed visually.'],
        severity: 'medium',
        disclaimer: 'Guidance only—this model result is not a confirmed diagnosis or treatment recommendation.'
      };
    },

    getClassDescription(prediction) {
      const catalogEntry = CLASS_CATALOG_BY_LABEL[prediction?.className];
      return catalogEntry?.description
        || `The model identified a possible ${prediction?.displayName || 'citrus condition'}. This image-based result should be confirmed by inspecting the plant and consulting a local agriculture technician.`;
    },

    getRecommendationDescription(recommendation, prediction) {
      const generatedDescription = recommendation?.description?.trim();
      const genericDescription = 'The detected class may represent a citrus disease or pest, but an image-based model result is not a confirmed diagnosis.';

      return generatedDescription && generatedDescription !== genericDescription
        ? generatedDescription
        : this.getClassDescription(prediction);
    },

    async loadRecommendation() {
      const target = this.recommendationTarget;
      const resultReference = this.predictionResult;
      if (!target || !resultReference) return;

      this.isLoadingRecommendation = true;
      this.recommendationError = null;
      const llmKey = target.recommendationKey || target.className.replace(/_/g, '-');
      const llmContext = {
        displayName: target.displayName,
        category: target.category,
        modelClass: target.className,
        confidence: Math.round(target.confidence * 100),
        request: 'Start with a short, plain-language description of what this detected class is. Then provide cautious symptoms, causes, treatment, prevention, and escalation guidance. Do not infer severity from confidence. Do not recommend treatment for beneficial or other classes.'
      };

      try {
        const response = await generateAIRecommendation(llmKey, llmContext, false);
        if (this.predictionResult === resultReference) {
          this.recommendation = {
            ...response.data,
            displayName: target.displayName,
            category: target.category,
            modelClass: target.className,
            description: this.getRecommendationDescription(response.data, target),
            summary: response.data.summary || `Possible ${target.displayName} detected.`
          };
        }
      } catch (error) {
        if (this.predictionResult !== resultReference) return;
        try {
          if (target.recommendationKey) {
            const response = await getRecommendation(target.recommendationKey);
            if (this.predictionResult === resultReference) {
              this.recommendation = {
                ...response.data,
                displayName: target.displayName,
                category: target.category,
                modelClass: target.className,
                description: this.getRecommendationDescription(response.data, target)
              };
            }
          } else {
            this.recommendation = this.buildLocalRecommendation(target);
          }
        } catch (fallbackError) {
          if (this.predictionResult === resultReference) {
            this.recommendation = this.buildLocalRecommendation(target);
            if (!this.recommendation) this.recommendationError = fallbackError.message;
          }
        }
      } finally {
        if (this.predictionResult === resultReference) this.isLoadingRecommendation = false;
      }
    },

    async enhanceWithAI() {
      const target = this.recommendationTarget;
      if (!target || this.isEnhancing) return;

      if (!target.recommendationKey) {
        window.showToast?.('AI enhancement is not available for this model class yet.', 'info');
        return;
      }

      this.isEnhancing = true;
      try {
        const response = await generateAIRecommendation(target.recommendationKey, {
          confidence: Math.round(target.confidence * 100),
          severity: this.getManagementPriority(target.recommendationKey),
          userContext: 'User requested enhanced management guidance for a Roboflow detection.'
        });
        this.recommendation = {
          ...response.data,
          displayName: target.displayName,
          category: target.category,
          modelClass: target.className,
          description: this.getRecommendationDescription(response.data, target)
        };
        window.showToast?.('AI-enhanced recommendations loaded', 'success');
      } catch (error) {
        window.showToast?.('Unable to enhance recommendations at this time', 'error');
      } finally {
        this.isEnhancing = false;
      }
    },

    getManagementPriority(conditionKey) {
      const priorities = {
        healthy: 'low',
        'black-spot': 'medium',
        canker: 'high',
        greening: 'high'
      };
      return priorities[conditionKey] || 'medium';
    },

    clearResults() {
      this.predictionResult = null;
      this.recommendation = null;
      this.analysisStep = 0;
      this.analysisError = null;
      this.isLoadingRecommendation = false;
      this.recommendationError = null;
      this.isEnhancing = false;
    },

    resetDetection() {
      this.cancelActiveAnalysis();
      this.currentStep = 1;
      this.selectedImage = null;
      this.clearResults();
    }
  }
};
</script>

<style scoped>
.detect-page {
  --info: var(--primary);
  --info-bg: var(--primary-light);
  --warning: var(--secondary);
  --warning-bg: var(--secondary-light);
  --error: var(--secondary);
  --error-bg: var(--secondary-light);
  --error-text: var(--warning-text);
  min-height: 80vh;
  padding: clamp(2rem, 5vw, 4rem) 0;
  background:
    radial-gradient(circle at 5% 0%, var(--detection-glow) 0, transparent 34rem),
    var(--bg);
}

.detection-container {
  max-width: 1200px;
}

.page-header {
  max-width: 46rem;
  margin: 0 auto var(--spacing-xl);
  text-align: center;
}

.page-eyebrow,
.step-kicker {
  color: var(--primary);
  font-size: var(--font-size-xs);
  font-weight: 800;
  letter-spacing: 0.1em;
}

.page-eyebrow {
  margin-bottom: var(--spacing-sm);
}

.page-header h1 {
  margin-bottom: var(--spacing-md);
  color: var(--text);
  font-size: clamp(2rem, 5vw, 3rem);
}

.page-header p {
  margin: 0;
  color: var(--text-secondary);
  font-size: clamp(1rem, 2vw, var(--font-size-lg));
  line-height: 1.6;
}

.flow-progress {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  max-width: 42rem;
  margin: 0 auto var(--spacing-2xl);
  padding: 0;
  list-style: none;
}

.flow-progress li {
  position: relative;
  display: grid;
  justify-items: center;
  gap: var(--spacing-xs);
  color: var(--text-muted);
  font-size: var(--font-size-sm);
  text-align: center;
}

.flow-progress li:not(:last-child)::after {
  position: absolute;
  top: 1rem;
  left: calc(50% + 1.25rem);
  width: calc(100% - 2.5rem);
  height: 2px;
  background: var(--border);
  content: '';
}

.flow-progress li.complete::after {
  background: var(--success);
}

.flow-progress span {
  z-index: 1;
  display: grid;
  width: 2rem;
  height: 2rem;
  place-items: center;
  border: 2px solid var(--border);
  border-radius: 50%;
  background: var(--bg);
  font-weight: 800;
}

.flow-progress .current span {
  border-color: var(--primary);
  background: var(--primary);
  color: var(--text-light);
}

.flow-progress .complete span {
  border-color: var(--success);
  background: var(--success);
  color: var(--text-light);
}

.detect-page {
  overflow-x: hidden;
}

.detection-flow {
  display: grid;
  gap: var(--spacing-xl);
}

@media (min-width: 1100px) {
  .detection-flow {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: start;
  }

  .detection-flow > section:nth-child(3) {
    grid-column: 1 / -1;
  }
}

.detection-step {
  padding: clamp(1.25rem, 4vw, 2rem);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--card);
  box-shadow: var(--shadow-sm);
  transition: border-color 180ms ease, box-shadow 180ms ease;
}

.detection-step.active {
  border-color: var(--primary);
  box-shadow: var(--shadow-md);
}

.detection-step.completed {
  border-color: var(--success);
}

.step-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.step-number {
  display: grid;
  width: 3rem;
  height: 3rem;
  flex: 0 0 3rem;
  place-items: center;
  border-radius: 50%;
  background: var(--border-light);
  color: var(--text-muted);
  font-size: var(--font-size-lg);
  font-weight: 700;
}

.detection-step.active .step-number {
  background: var(--primary);
  color: var(--text-light);
}

.detection-step.completed .step-number {
  background: var(--success);
  color: var(--text-light);
}

.step-header h2 {
  margin: 0;
  color: var(--text);
  font-size: var(--font-size-xl);
}

.step-kicker {
  margin: 0 0 var(--spacing-xs);
}

.step-description {
  margin: var(--spacing-xs) 0 0;
  color: var(--text-secondary);
  line-height: 1.5;
}

.proceed-section,
.analysis-ready,
.analysis-error,
.analysis-progress,
.loading-recommendation,
.recommendation-error {
  text-align: center;
}

.proceed-section {
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border);
  text-align: right;
}

.image-preview-small {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  border-radius: var(--radius);
  background: var(--bg-secondary);
}

.image-preview-small img {
  width: 80px;
  height: 80px;
  border: 2px solid var(--success);
  border-radius: var(--radius);
  object-fit: cover;
}

.image-preview-small > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: var(--spacing-md);
}

.analysis-section,
.analysis-complete {
  padding: var(--spacing-lg) 0;
}

.analysis-progress {
  padding: clamp(1.25rem, 4vw, 2rem);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-secondary);
}

.spinner-container {
  margin-bottom: var(--spacing-lg);
}

.progress-steps {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: var(--spacing-lg);
  margin-top: var(--spacing-lg);
}

.progress-step {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius);
  background: var(--bg-secondary);
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}

.progress-step.active {
  background: var(--primary);
  color: var(--text-light);
}

.progress-step span {
  display: grid;
  width: 1.25rem;
  height: 1.25rem;
  place-items: center;
  border: 1px solid currentColor;
  border-radius: 50%;
  font-size: var(--font-size-xs);
  font-weight: 800;
}

.analysis-title {
  margin: 0;
  color: var(--text);
  font-size: var(--font-size-lg);
  font-weight: 700;
}

.analysis-help {
  margin: var(--spacing-xs) 0 0;
  color: var(--text-secondary);
}

.ready-icon {
  display: grid;
  width: 3rem;
  height: 3rem;
  margin: 0 auto var(--spacing-md);
  place-items: center;
  border-radius: 50%;
  background: var(--success-bg);
  color: var(--success);
  font-size: 1.5rem;
  font-weight: 800;
}

.analysis-ready {
  padding: var(--spacing-xl) 0;
}

.results-section {
  display: grid;
  gap: var(--spacing-xl);
}

.loading-recommendation,
.recommendation-error {
  padding: var(--spacing-xl);
}

.provider-note {
  margin: 0;
  padding: var(--spacing-md);
  border-radius: var(--radius);
  background: var(--warning-bg);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  text-align: center;
}

.results-actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  padding-top: var(--spacing-xl);
  border-top: 1px solid var(--border);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.65; }
}

@media (max-width: 1099px) {
  .detection-flow {
    grid-template-columns: minmax(0, 1fr);
  }

  .detection-flow > section:nth-child(3) {
    grid-column: auto;
  }

  .step-header,
  .image-preview-small,
  .image-preview-small > div,
  .progress-steps,
  .results-actions {
    align-items: center;
    flex-direction: column;
    text-align: center;
  }

  .detection-step {
    padding: var(--spacing-lg);
  }

  .flow-progress {
    margin-bottom: var(--spacing-xl);
  }

  .flow-progress strong {
    font-size: var(--font-size-xs);
  }

  .proceed-section {
    text-align: center;
  }

  .results-actions .btn {
    width: 100%;
    max-width: 320px;
  }
}
</style>
