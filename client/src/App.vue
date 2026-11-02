<!-- FILE: client/src/App.vue -->
<template>
  <div id="app">
    <AppShell>
      <router-view />
    </AppShell>

    <div id="toast-container" class="fixed top-4 right-4 z-50 space-y-2">
      <Toast
        v-for="toast in toasts"
        :key="toast.id"
        :message="toast.message"
        :type="toast.type"
        :duration="toast.duration"
        @close="removeToast(toast.id)"
      />
    </div>
  </div>
</template>

<script>
import AppShell from './components/AppShell.vue';
import Toast from './components/Toast.vue';

export default {
  name: 'App',
  components: {
    AppShell,
    Toast
  },
  
  data() {
    return {
      toasts: []
    };
  },

  mounted() {
    // Set up global toast system
    window.showToast = this.showToast;
    
    // Check app health on startup
    this.checkAppHealth();
  },

  beforeUnmount() {
    // Clean up global references
    delete window.showToast;
  },

  methods: {
    async checkAppHealth() {
      try {
        const response = await fetch('/api/health');
        if (!response.ok) {
          this.showToast('Backend service may be unavailable', 'warning');
        }
      } catch (error) {
        this.showToast('Unable to connect to backend service', 'error', 5000);
      }
    },

    showToast(message, type = 'info', duration = 3000) {
      const toast = {
        id: Date.now() + Math.random(),
        message,
        type,
        duration
      };
      
      this.toasts.push(toast);
      
      // Auto-remove toast after duration
      setTimeout(() => {
        this.removeToast(toast.id);
      }, duration);
    },

    removeToast(id) {
      const index = this.toasts.findIndex(toast => toast.id === id);
      if (index > -1) {
        this.toasts.splice(index, 1);
      }
    }
  }
};
</script>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Toast container styles */
.fixed {
  position: fixed;
}

.top-4 {
  top: 1rem;
}

.right-4 {
  right: 1rem;
}

.z-50 {
  z-index: 50;
}

.space-y-2 > * + * {
  margin-top: 0.5rem;
}

/* Smooth transitions for route changes */
.router-link-exact-active {
  color: var(--primary);
}

/* Loading states */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Focus styles for accessibility */
*:focus {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

button:focus,
.btn:focus,
input:focus,
textarea:focus,
select:focus {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

/* Skip link for accessibility */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--primary);
  color: white;
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 1000;
}

.skip-link:focus {
  top: 6px;
}
</style>