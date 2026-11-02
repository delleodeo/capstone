<!-- FILE: client/src/views/NotFound.vue -->
<template>
  <AppShell>
    <main class="not-found">
      <div class="container">
        <div class="error-content">
          <div class="error-icon">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" fill="none"/>
              <path d="M12 7v6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              <circle cx="12" cy="17" r="1" fill="currentColor"/>
            </svg>
          </div>
          <h1>404 - Pahina Hindi Natagpuan</h1>
          <p class="error-message">
            Pasensya na, pero ang hinahanap mong pahina ay hindi namin matagpuan. 
            Maaaring mali ang link o hindi na ito available.
          </p>
          <p class="error-message-en">
            Sorry, but the page you're looking for cannot be found. 
            The link might be incorrect or no longer available.
          </p>
          
          <div class="actions">
            <router-link to="/" class="btn btn-primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" stroke-width="2" fill="none"/>
                <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" stroke-width="2" fill="none"/>
              </svg>
              Bumalik sa Home
            </router-link>
            
            <router-link to="/detect" class="btn btn-secondary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"/>
                <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                <polyline points="21,15 16,10 5,21" stroke="currentColor" stroke-width="2" fill="none"/>
              </svg>
              Mag-detect ng Sakit
            </router-link>
          </div>

          <div class="help-section">
            <h3>Naligaw ka ba?</h3>
            <p>Narito ang mga pwedeng mong gawin:</p>
            <ul>
              <li><router-link to="/">Home</router-link> - Simula ng application</li>
              <li><router-link to="/detect">Disease Detection</router-link> - I-scan ang dalandan leaves</li>
              <li><router-link to="/chat">AI Assistant</router-link> - Makipag-chat sa AI</li>
              <li><router-link to="/about">About</router-link> - Alamin pa ang AgriDrone</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  </AppShell>
</template>

<script>
import AppShell from '../components/AppShell.vue';

export default {
  name: 'NotFound',
  components: {
    AppShell
  },
  mounted() {
    // Track 404 errors for analytics
    console.warn('404 Error: Page not found -', this.$route.fullPath);
  }
};
</script>

<style scoped>
.not-found {
  min-height: calc(100vh - var(--header-height, 80px) - var(--footer-height, 60px));
  display: flex;
  align-items: center;
  padding: 2rem 0;
  background: linear-gradient(135deg, var(--color-bg-soft) 0%, var(--color-surface) 100%);
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
}

.error-content {
  text-align: center;
  background: white;
  border-radius: 16px;
  padding: 3rem 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--color-border);
}

.error-icon {
  margin-bottom: 2rem;
  color: var(--color-warning);
}

.error-content h1 {
  font-size: 2.5rem;
  color: var(--color-heading);
  margin-bottom: 1rem;
  font-weight: 700;
}

.error-message,
.error-message-en {
  font-size: 1.1rem;
  color: var(--color-text);
  line-height: 1.6;
  margin-bottom: 1rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.error-message-en {
  font-style: italic;
  color: var(--color-text-light);
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin: 2rem 0;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(var(--color-primary-rgb), 0.3);
}

.btn-secondary {
  background: var(--color-accent);
  color: white;
}

.btn-secondary:hover {
  background: var(--color-accent-dark);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(var(--color-accent-rgb), 0.3);
}

.help-section {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--color-border);
  text-align: left;
}

.help-section h3 {
  color: var(--color-heading);
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.help-section p {
  color: var(--color-text);
  margin-bottom: 1rem;
}

.help-section ul {
  list-style: none;
  padding: 0;
}

.help-section li {
  margin-bottom: 0.5rem;
  padding-left: 1.5rem;
  position: relative;
}

.help-section li::before {
  content: "→";
  position: absolute;
  left: 0;
  color: var(--color-primary);
  font-weight: bold;
}

.help-section a {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
}

.help-section a:hover {
  color: var(--color-primary-dark);
  text-decoration: underline;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .error-content {
    padding: 2rem 1rem;
  }
  
  .error-content h1 {
    font-size: 2rem;
  }
  
  .actions {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 100%;
    max-width: 300px;
    justify-content: center;
  }
  
  .help-section {
    text-align: center;
  }
}
</style>