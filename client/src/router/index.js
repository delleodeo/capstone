// FILE: client/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Detect from '../views/Detect.vue';
import Chat from '../views/Chat.vue';
import About from '../views/About.vue';
import Monitoring from '../views/Monitoring.vue';
import SoilQuality from '../views/SoilQuality.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: 'Home - AgriDrone',
      description: 'AI-powered citrus disease detection for Filipino farmers'
    }
  },
  {
    path: '/detect',
    name: 'Detect',
    component: Detect,
    meta: {
      title: 'Disease Detection - AgriDrone',
      description: 'Upload or capture dalandan leaf images for instant disease diagnosis'
    }
  },
  {
    path: '/chat',
    name: 'Chat',
    component: Chat,
    meta: {
      title: 'AI Assistant - AgriDrone',
      description: 'Ask questions and get personalized agricultural advice'
    }
  },
  {
    path: '/about',
    name: 'About',
    component: About,
    meta: {
      title: 'About - AgriDrone',
      description: 'Learn about AgriDrone citrus disease detection technology'
    }
  },
  {
    path: '/monitoring',
    name: 'Monitoring',
    component: Monitoring,
    meta: {
      title: 'Field Monitoring - AgriDrone',
      description: 'View soil IoT readings, weather and run yield predictions'
    }
  },
  {
    path: '/soil-quality',
    name: 'SoilQuality',
    component: SoilQuality,
    meta: {
      title: 'Soil Quality - AgriDrone',
      description: 'View soil NPK quality, current weather, and predict yield'
    }
  },
  // Redirect old routes
  {
    path: '/home',
    redirect: '/'
  },
  // 404 catch-all
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: {
      title: '404 - Page Not Found',
      description: 'The page you are looking for does not exist'
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Return to saved position (browser back/forward)
    if (savedPosition) {
      return savedPosition;
    }
    // Scroll to top for new routes
    return { top: 0 };
  }
});

// Global navigation guards
router.beforeEach((to, from, next) => {
  // Update page title
  if (to.meta.title) {
    document.title = to.meta.title;
  }

  // Update meta description
  if (to.meta.description) {
    let metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', to.meta.description);
    }
  }

  // Analytics or tracking could go here
  console.log(`Navigating from ${from.name || 'unknown'} to ${to.name}`);

  next();
});

export default router;