// FILE: client/src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './assets/styles.css';

// Create Vue app
const app = createApp(App);

// Install router
app.use(router);

// Global error handler
app.config.errorHandler = (err, instance, info) => {
  console.error('Global error:', err);
  console.error('Error info:', info);
  
  // In production, you might want to send errors to a logging service
  if (import.meta.env.PROD) {
    // Send to error tracking service (e.g., Sentry)
    console.log('Error would be sent to monitoring service in production');
  }
};

// Global properties
app.config.globalProperties.$version = '1.0.0';

// Mount app
app.mount('#app');