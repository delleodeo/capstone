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

          <!-- Mobile Menu Toggle -->
          <button 
            class="mobile-menu-toggle"
            :class="{ active: mobileMenuOpen }"
            @click="toggleMobileMenu"
            :aria-expanded="mobileMenuOpen"
            aria-label="Toggle navigation menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <!-- Navigation Links -->
          <div class="nav-links" :class="{ open: mobileMenuOpen }">
            <router-link 
              to="/" 
              class="nav-link"
              @click="closeMobileMenu"
            >
              Home
            </router-link>
            <router-link 
              to="/detect" 
              class="nav-link nav-link-primary"
              @click="closeMobileMenu"
            >
              Detect Disease
            </router-link>
            <router-link 
              to="/soil-quality"
              class="nav-link"
              @click="closeMobileMenu"
            >
              Soil Monitoring
            </router-link>
            <router-link 
              to="/chat" 
              class="nav-link"
              @click="closeMobileMenu"
            >
              AI Assistant
            </router-link>
            <router-link 
              to="/about" 
              class="nav-link"
              @click="closeMobileMenu"
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

    <!-- Main Content -->
    <main id="main-content" class="app-main">
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

    // Close mobile menu when clicking outside
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
      // Close mobile menu if clicking outside nav
      if (!event.target.closest('.nav-wrapper')) {
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

/* Mobile Menu Toggle */
.mobile-menu-toggle {
  display: none;
  flex-direction: column;
  justify-content: space-around;
  width: 2rem;
  height: 2rem;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
}

.mobile-menu-toggle span {
  width: 2rem;
  height: 0.25rem;
  background: var(--text);
  border-radius: 0.125rem;
  transition: var(--transition);
  transform-origin: 1px;
}

.mobile-menu-toggle.active span:first-child {
  transform: rotate(45deg);
}

.mobile-menu-toggle.active span:nth-child(2) {
  opacity: 0;
  transform: translateX(20px);
}

.mobile-menu-toggle.active span:nth-child(3) {
  transform: rotate(-45deg);
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

/* Mobile Responsive */
@media (max-width: 1099px) {
  .mobile-menu-toggle {
    display: flex;
  }

  .nav-links {
    position: fixed;
    top: 100%;
    left: 0;
    right: 0;
    background-color: var(--card);
    box-shadow: var(--shadow-lg);
    flex-direction: column;
    align-items: stretch;
    padding: var(--spacing-lg);
    gap: var(--spacing-sm);
    transform: translateY(-100%);
    visibility: hidden;
    opacity: 0;
    transition: all 0.3s ease;
  }

  .nav-links.open {
    transform: translateY(0);
    visibility: visible;
    opacity: 1;
  }

  .nav-link {
    width: 100%;
    text-align: center;
    padding: var(--spacing-md);
    border-radius: var(--radius);
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