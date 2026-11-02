<template>
  <div class="detection-visualization">
    <div
      ref="stage"
      class="detection-stage"
      aria-label="Uploaded image with detected regions"
    >
      <img
        ref="imageElement"
        :src="src"
        alt="Uploaded citrus image with detection boxes"
        @load="updateLayout"
      />

      <template v-for="(prediction, index) in predictions" :key="`${prediction.className}-${index}`">
        <div
          v-if="prediction.boundingBox"
          class="detection-box"
          :style="boxStyle(prediction.boundingBox)"
        >
          <span class="detection-label">
            {{ prediction.displayName }} · {{ formatConfidence(prediction.confidence) }}%
          </span>
        </div>
      </template>
    </div>

    <p class="visualization-note">
      <template v-if="predictions.some((prediction) => prediction.boundingBox)">
        Boxes show detected regions.
      </template>
      <template v-else>
        The local classifier provides image-level predictions without bounding boxes.
      </template>
      Confidence is a model score, not disease severity or infection percentage.
    </p>
  </div>
</template>

<script>
export default {
  name: 'DetectionOverlay',

  props: {
    src: {
      type: String,
      required: true
    },
    image: {
      type: Object,
      required: true
    },
    predictions: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      layout: {
        scale: 1,
        offsetX: 0,
        offsetY: 0,
        sourceWidth: 1,
        sourceHeight: 1
      },
      resizeObserver: null
    };
  },

  mounted() {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.updateLayout());
      this.resizeObserver.observe(this.$refs.stage);
    }
    this.$nextTick(this.updateLayout);
  },

  beforeUnmount() {
    this.resizeObserver?.disconnect();
  },

  methods: {
    updateLayout() {
      const stage = this.$refs.stage;
      if (!stage) return;

      const sourceWidth = Number(this.image?.width) || this.$refs.imageElement?.naturalWidth || 1;
      const sourceHeight = Number(this.image?.height) || this.$refs.imageElement?.naturalHeight || 1;
      const scale = Math.min(stage.clientWidth / sourceWidth, stage.clientHeight / sourceHeight);
      const renderedWidth = sourceWidth * scale;
      const renderedHeight = sourceHeight * scale;

      this.layout = {
        scale,
        offsetX: (stage.clientWidth - renderedWidth) / 2,
        offsetY: (stage.clientHeight - renderedHeight) / 2,
        sourceWidth,
        sourceHeight
      };
    },

    boxStyle(box = {}) {
      const { scale, offsetX, offsetY, sourceWidth, sourceHeight } = this.layout;
      const left = Math.max(0, Number(box.x) || 0);
      const top = Math.max(0, Number(box.y) || 0);
      const boxWidth = Math.max(0, Number(box.width) || 0);
      const boxHeight = Math.max(0, Number(box.height) || 0);
      const right = Math.min(sourceWidth, left + boxWidth);
      const bottom = Math.min(sourceHeight, top + boxHeight);

      return {
        left: `${offsetX + left * scale}px`,
        top: `${offsetY + top * scale}px`,
        width: `${Math.max(0, right - left) * scale}px`,
        height: `${Math.max(0, bottom - top) * scale}px`
      };
    },

    formatConfidence(confidence) {
      return Math.round(Number(confidence) * 100);
    }
  }
};
</script>

<style scoped>
.detection-visualization {
  display: grid;
  gap: var(--spacing-sm);
}

.detection-stage {
  position: relative;
  width: 100%;
  height: clamp(300px, 55vw, 560px);
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: #111827;
}

.detection-stage img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
}

.detection-box {
  position: absolute;
  box-sizing: border-box;
  border: 3px solid #22c55e;
  border-radius: 4px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.45);
  pointer-events: none;
}

.detection-label {
  position: absolute;
  left: -3px;
  bottom: 100%;
  max-width: 240px;
  padding: 0.3rem 0.5rem;
  border-radius: 4px 4px 0 0;
  background: #15803d;
  color: white;
  font-size: var(--font-size-xs);
  font-weight: 700;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.visualization-note {
  margin: 0;
  color: var(--text-muted);
  font-size: var(--font-size-sm);
  text-align: center;
}
</style>
