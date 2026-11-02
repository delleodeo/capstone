<!-- FILE: client/src/components/Toast.vue -->
<template>
  <div 
    class="toast"
    :class="[`toast-${type}`, { 'toast-dismissible': dismissible }]"
    role="alert"
    :aria-live="type === 'error' ? 'assertive' : 'polite'"
  >
    <!-- Icon -->
    <div class="toast-icon">
      <span v-if="type === 'success'">✅</span>
      <span v-else-if="type === 'warning'">⚠️</span>
      <span v-else-if="type === 'error'">❌</span>
      <span v-else>ℹ️</span>
    </div>

    <!-- Message -->
    <div class="toast-content">
      <p class="toast-message">{{ message }}</p>
    </div>

    <!-- Close Button -->
    <button 
      v-if="dismissible"
      class="toast-close"
      @click="handleClose"
      aria-label="Close notification"
    >
      ×
    </button>
  </div>
</template>

<script>
export default {
  name: 'Toast',
  
  props: {
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'info',
      validator: (value) => ['success', 'warning', 'error', 'info'].includes(value)
    },
    duration: {
      type: Number,
      default: 3000
    },
    dismissible: {
      type: Boolean,
      default: true
    }
  },

  emits: ['close'],

  mounted() {
    // Auto-dismiss after duration (if not persistent)
    if (this.duration > 0) {
      setTimeout(() => {
        this.handleClose();
      }, this.duration);
    }
  },

  methods: {
    handleClose() {
      this.$emit('close');
    }
  }
};
</script>

<style scoped>
.toast {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  min-width: 300px;
  max-width: 500px;
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  background-color: var(--card);
  border: 1px solid var(--border);
  animation: toastSlideIn 0.3s ease-out;
  position: relative;
}

@keyframes toastSlideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast-icon {
  font-size: var(--font-size-lg);
  line-height: 1;
  margin-top: 0.125rem;
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-message {
  margin: 0;
  font-size: var(--font-size-sm);
  line-height: 1.4;
  word-wrap: break-word;
}

.toast-close {
  background: none;
  border: none;
  font-size: var(--font-size-xl);
  line-height: 1;
  cursor: pointer;
  color: var(--text-muted);
  transition: var(--transition-fast);
  padding: 0;
  margin-left: var(--spacing-sm);
  margin-top: -0.125rem;
}

.toast-close:hover {
  color: var(--text);
}

/* Toast Type Variants */
.toast-success {
  background-color: var(--success-bg);
  border-color: var(--green-300);
}

.toast-success .toast-message {
  color: var(--green-800);
}

.toast-warning {
  background-color: var(--warning-bg);
  border-color: #fbbf24;
}

.toast-warning .toast-message {
  color: #92400e;
}

.toast-error {
  background-color: var(--error-bg);
  border-color: #fca5a5;
}

.toast-error .toast-message {
  color: #991b1b;
}

.toast-info {
  background-color: var(--info-bg);
  border-color: #93c5fd;
}

.toast-info .toast-message {
  color: #1e40af;
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .toast {
    min-width: unset;
    max-width: calc(100vw - 2rem);
    margin: 0 var(--spacing-md);
  }
}

/* Dark mode support (if implemented later) */
@media (prefers-color-scheme: dark) {
  .toast {
    background-color: #374151;
    border-color: #4b5563;
  }
  
  .toast-message {
    color: #f3f4f6;
  }
  
  .toast-close {
    color: #9ca3af;
  }
  
  .toast-close:hover {
    color: #f3f4f6;
  }
}

/* Focus styles for accessibility */
.toast-close:focus {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
  border-radius: 2px;
}

/* Animation for dismissal */
.toast.dismissing {
  animation: toastSlideOut 0.3s ease-in forwards;
}

@keyframes toastSlideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}
</style>