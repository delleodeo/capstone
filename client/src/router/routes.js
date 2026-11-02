// FILE: client/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';

// Import views
import Home from '../views/Home.vue';
import Detect from '../views/Detect.vue';
import Chat from '../views/Chat.vue';
import About from '../views/About.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: 'AgriDrone - AI Citrus Disease Detection',
      description: 'AI-powered dalandan leaf disease detection for Filipino farmers'
    }
  },
  {
    path: '/detect',
    name: 'Detect',
    component: Detect,
    meta: {
      title: 'Disease Detection - AgriDrone',
      description: 'Upload or capture citrus leaf images for instant AI disease diagnosis'
    }
  },
  {
    path: '/chat',
    name: 'Chat',
    component: Chat,
    meta: {
      title: 'AI Assistant - AgriDrone',
      description: 'Ask our AI assistant about citrus farming and disease management'
    }
  },
  {
    path: '/about',
    name: 'About',
    component: About,
    meta: {
      title: 'About - AgriDrone',
      description: 'Learn about AgriDrone\'s AI technology and mission for Filipino farmers'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: {
      title: 'Page Not Found - AgriDrone'
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Always scroll to top when changing routes
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0, behavior: 'smooth' };
  }
});

// Navigation guards
router.beforeEach((to, from, next) => {
  // Update page title and meta description
  if (to.meta.title) {
    document.title = to.meta.title;
  }
  
  if (to.meta.description) {
    let description = document.querySelector('meta[name="description"]');
    if (description) {
      description.setAttribute('content', to.meta.description);
    } else {
      description = document.createElement('meta');
      description.name = 'description';
      description.content = to.meta.description;
      document.head.appendChild(description);
    }
  }

  next();
});

// Handle navigation errors
router.onError((error) => {
  console.error('Router error:', error);
  
  // Show user-friendly error message
  if (window.showToast) {
    window.showToast('Navigation error occurred', 'error');
  }
});

export default router;