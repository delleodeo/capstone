<!-- FILE: client/src/components/AppShell.vue -->
<template>
  <div class="app-shell">
    <!-- Skip Navigation Link for Accessibility -->
    <a href="#main-content" class="skip-link">Skip to main content</a>
    
    <!-- Header -->
    <header class="app-header">
      <nav class="container">
        <div class="nav-wrapper">
          <!-- Logo / Brand -->
          <router-link to="/" class="nav-brand">
            <span class="brand-icon">🌱</span>
            <span class="brand-text">AgriDrone</span>
          </router-link>

          <!-- Navigation Links -->
          <div class="nav-links">
            <router-link 
              to="/" 
              class="nav-link"
            >
              Home
            </router-link>
            <router-link 
              to="/detect" 
              class="nav-link nav-link-primary"
            >
              Detect Disease
            </router-link>
            <router-link 
              to="/soil-quality"
              class="nav-link"
            >
              Soil Monitoring
            </router-link>
            <router-link 
              to="/chat" 
              class="nav-link"
            >
              AI Assistant
            </router-link>
            <router-link 
              to="/about" 
              class="nav-link"
            >
              About
            </router-link>
            <button
              type="button"
              class="theme-toggle"
              :aria-label="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
              :aria-pressed="isDarkMode"
              @click="toggleTheme"
            >
              <span aria-hidden="true">{{ isDarkMode ? '☀️' : '🌙' }}</span>
              <span>{{ isDarkMode ? 'Light' : 'Dark' }}</span>
            </button>
          </div>
        </div>
      </nav>
    </header>

    <!-- Mobile navigation -->
    <nav class="mobile-bottom-nav" aria-label="Mobile navigation">
      <router-link to="/" class="mobile-nav-item" aria-label="Home">
        <span class="mobile-nav-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /></svg>
        </span>
        <span>Home</span>
      </router-link>
      <router-link to="/detect" class="mobile-nav-item" aria-label="Detect disease">
        <span class="mobile-nav-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false"><path d="M7 3H5a2 2 0 0 0-2 2v2m14-4h2a2 2 0 0 1 2 2v2M7 21H5a2 2 0 0 1-2-2v-2m14 4h2a2 2 0 0 0 2-2v-2M8 8h8v8H8z" /></svg>
        </span>
        <span>Detect</span>
      </router-link>
      <router-link to="/soil-quality" class="mobile-nav-item" aria-label="Soil monitoring">
        <span class="mobile-nav-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false"><path d="M12 21V8m0 4c-4 0-6-2-6-5 3 0 6 1 6 5Zm0-3c0-4 2-6 6-6 0 3-2 6-6 6Z" /></svg>
        </span>
        <span>Soil</span>
      </router-link>
      <router-link to="/chat" class="mobile-nav-item" aria-label="AI chat">
        <span class="mobile-nav-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false"><path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.7 8.7 0 0 1-3.5-.7L4 20l1.5-3.6A7.2 7.2 0 0 1 4.5 12 7.5 7.5 0 0 1 12 4.5a7.5 7.5 0 0 1 8 7Z" /></svg>
        </span>
        <span>AI Chat</span>
      </router-link>
      <button
        type="button"
        class="mobile-nav-item mobile-nav-more"
        :aria-expanded="mobileMenuOpen"
        aria-controls="mobile-more-menu"
        @click="toggleMobileMenu"
      >
        <span class="mobile-nav-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false"><circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" /></svg>
        </span>
        <span>More</span>
      </button>
    </nav>

    <div
      v-if="mobileMenuOpen"
      id="mobile-more-menu"
      class="mobile-more-menu"
      role="dialog"
      aria-label="More navigation options"
    >
      <router-link to="/about" class="mobile-more-link" @click="closeMobileMenu">
        <span class="mobile-more-icon" aria-hidden="true">i</span>
        About AgriDrone
      </router-link>
      <button type="button" class="mobile-more-link" @click="toggleTheme">
        <span aria-hidden="true">{{ isDarkMode ? '☀' : '☾' }}</span>
        {{ isDarkMode ? 'Light mode' : 'Dark mode' }}
      </button>
    </div>

    <!-- Main Content -->
    <main id="main-content" class="app-main" @click="closeMobileMenu">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="app-footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <div class="footer-brand">
              <span class="brand-icon">🌱</span>
              <span class="brand-text">AgriDrone</span>
            </div>
            <p class="footer-description">
              AI-powered citrus disease detection for Filipino farmers
            </p>
          </div>
          
          <div class="footer-section">
            <h4>Quick Links</h4>
            <ul class="footer-links">
              <li><router-link to="/">Home</router-link></li>
              <li><router-link to="/detect">Disease Detection</router-link></li>
              <li><router-link to="/soil-quality">Soil Monitoring</router-link></li>
              <li><router-link to="/chat">AI Assistant</router-link></li>
              <li><router-link to="/about">About</router-link></li>
            </ul>
          </div>
          
          <div class="footer-section">
            <h4>Support</h4>
            <ul class="footer-links">
              <li><a href="#" @click.prevent="showHealthCheck">System Health</a></li>
              <li><a href="mailto:support@agridrone.com">Contact Support</a></li>
            </ul>
          </div>
        </div>
        
        <div class="footer-bottom">
          <p>&copy; 2026 AgriDrone. Built for Filipino farmers.</p>
          <p class="disclaimer">
            <strong>Disclaimer:</strong> This tool provides guidance only. 
            Always consult agricultural experts for professional diagnosis.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { healthCheck } from '../utils/api.js';

export default {
  name: 'AppShell',
  
  data() {
    return {
      mobileMenuOpen: false,
      isDarkMode: false
    };
  },

  mounted() {
    const savedTheme = localStorage.getItem('agridrone-theme');
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    this.isDarkMode = savedTheme ? savedTheme === 'dark' : prefersDark;
    this.applyTheme();

    document.addEventListener('click', this.handleOutsideClick);
    
    // Close mobile menu on escape key
    document.addEventListener('keydown', this.handleKeydown);
  },

  beforeUnmount() {
    document.removeEventListener('click', this.handleOutsideClick);
    document.removeEventListener('keydown', this.handleKeydown);
  },

  methods: {
    applyTheme() {
      document.documentElement.dataset.theme = this.isDarkMode ? 'dark' : 'light';
    },

    toggleTheme() {
      this.isDarkMode = !this.isDarkMode;
      localStorage.setItem('agridrone-theme', this.isDarkMode ? 'dark' : 'light');
      this.applyTheme();
    },

    toggleMobileMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen;
    },

    closeMobileMenu() {
      this.mobileMenuOpen = false;
    },

    handleOutsideClick(event) {
      if (!event.target.closest('.nav-wrapper') && !event.target.closest('.mobile-bottom-nav') && !event.target.closest('.mobile-more-menu')) {
        this.closeMobileMenu();
      }
    },

    handleKeydown(event) {
      if (event.key === 'Escape') {
        this.closeMobileMenu();
      }
    },

    async showHealthCheck() {
      try {
        const health = await healthCheck();
        const status = health.database?.status === 'connected' && 
                      health.llm?.status === 'available' ? 
                      '✅ All systems operational' : 
                      '⚠️ Some services may be unavailable';
        
        if (window.showToast) {
          window.showToast(status, health.database?.status === 'connected' ? 'success' : 'warning');
        } else {
          alert(status);
        }
      } catch (error) {
        const message = '❌ Unable to check system health';
        if (window.showToast) {
          window.showToast(message, 'error');
        } else {
          alert(message);
        }
      }
    }
  }
};
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

/* Header Styles */
.app-header {
  background-color: var(--card);
  border-bottom: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 40;
}

.nav-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) 0;
  min-height: 4rem;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--primary);
  text-decoration: none;
  transition: var(--transition);
}

.nav-brand:hover {
  color: var(--primary-hover);
  text-decoration: none;
}

.brand-icon {
  font-size: 1.5rem;
}

.brand-text {
  background: linear-gradient(135deg, var(--green-600), var(--orange-500));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Navigation Links */
.nav-links {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.nav-link {
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius);
  transition: var(--transition);
  position: relative;
}

.nav-link:hover {
  color: var(--primary);
  background-color: var(--primary-light);
  text-decoration: none;
}

.nav-link.router-link-active {
  color: var(--primary);
  font-weight: 600;
}

.nav-link-primary {
  background-color: var(--primary);
  color: var(--text-light) !important;
  font-weight: 600;
}

.nav-link-primary:hover {
  background-color: var(--primary-hover);
  color: var(--text-light) !important;
}

.theme-toggle {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text-secondary);
  background: var(--bg-secondary);
  cursor: pointer;
  font: inherit;
  transition: var(--transition);
}

.theme-toggle:hover {
  color: var(--text);
  border-color: var(--primary);
  background: var(--primary-light);
}

/* Main Content */
.app-main {
  flex: 1;
  min-height: calc(100vh - 8rem);
}

/* Footer Styles */
.app-footer {
  background-color: var(--green-900);
  color: var(--text-light);
  margin-top: auto;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-xl);
  padding: var(--spacing-2xl) 0;
}

.footer-section h4 {
  color: var(--orange-300);
  margin-bottom: var(--spacing-lg);
  font-size: var(--font-size-lg);
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-xl);
  font-weight: 700;
  margin-bottom: var(--spacing-md);
}

.footer-description {
  color: var(--green-200);
  font-size: var(--font-size-sm);
  line-height: 1.6;
}

.footer-links {
  list-style: none;
  padding: 0;
}

.footer-links li {
  margin-bottom: var(--spacing-sm);
}

.footer-links a {
  color: var(--green-200);
  text-decoration: none;
  font-size: var(--font-size-sm);
  transition: var(--transition);
}

.footer-links a:hover {
  color: var(--orange-300);
  text-decoration: underline;
}

.footer-bottom {
  border-top: 1px solid var(--green-800);
  padding: var(--spacing-lg) 0;
  text-align: center;
  font-size: var(--font-size-sm);
}

.footer-bottom p {
  margin-bottom: var(--spacing-sm);
  color: var(--green-200);
}

.disclaimer {
  font-size: var(--font-size-xs);
  color: var(--green-300);
  font-style: italic;
}

/* Tablet layout */
@media (max-width: 1099px) {
  .nav-links {
    gap: var(--spacing-sm);
  }

  .nav-link {
    padding: var(--spacing-sm);
    font-size: var(--font-size-sm);
  }

  .footer-content {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
    text-align: center;
  }

  .footer-bottom {
    text-align: center;
  }
}

@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
}

@media (max-width: 480px) {
  .nav-wrapper {
    padding: var(--spacing-sm) 0;
  }

  .brand-text {
    font-size: var(--font-size-lg);
  }

  .footer-content {
    padding: var(--spacing-xl) 0;
  }
}
</style>