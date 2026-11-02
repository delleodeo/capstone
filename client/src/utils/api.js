// FILE: client/src/utils/api.js
const API_BASE = '/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

    const config = {
      ...options,
      headers: {
        ...(!isFormData && { 'Content-Type': 'application/json' }),
        ...options.headers,
      },
    };

    // Add request body if provided
    if (options.body && !isFormData && config.headers['Content-Type'] === 'application/json') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      
      // Handle different response types
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else if (contentType && contentType.includes('text/plain')) {
        data = await response.text();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        throw new ApiError(
          data?.error || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          data
        );
      }

      return data;

    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      // Network or other errors
      throw new ApiError(
        error.message || 'Network error occurred',
        0,
        null
      );
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, { method: 'GET' });
  }

  // POST request
  async post(endpoint, body = null, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body,
      ...options,
    });
  }

  // PUT request
  async put(endpoint, body = null) {
    return this.request(endpoint, {
      method: 'PUT',
      body,
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Streaming chat request
  async streamChat(message, sessionId = null) {
    const response = await fetch(`${this.baseURL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        sessionId,
        stream: true
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(
        error.error || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        error
      );
    }

    return response;
  }
}

// Custom error class
class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }

  get isNetworkError() {
    return this.status === 0;
  }

  get isServerError() {
    return this.status >= 500;
  }

  get isClientError() {
    return this.status >= 400 && this.status < 500;
  }
}

// API client instance
const api = new ApiClient();

// Health check
export const healthCheck = () => api.get('/health');

// Recommendations
export const getRecommendation = (diseaseKey) => 
  api.get(`/recommendations/${diseaseKey}`);

export const generateAIRecommendation = (diseaseKey, context = {}, enhanceExisting = true) =>
  // Server validation expects `context` as a string; stringify objects
  api.post('/recommendations/generate', {
    diseaseKey,
    context: typeof context === 'string' ? context : JSON.stringify(context),
    enhanceExisting
  });

export const listRecommendations = () => api.get('/recommendations');

// Roboflow-backed citrus disease and pest detection. The private provider key
// stays on the server; the browser sends only the selected image.
export const detectCitrusConditions = (file, { signal } = {}) => {
  const formData = new FormData();
  formData.append('image', file);
  return api.post('/detection', formData, { signal });
};

// Chat
export const sendChatMessage = (message, sessionId = null) =>
  api.post('/chat', { message, sessionId });

export const streamChatMessage = (message, sessionId = null) =>
  api.streamChat(message, sessionId);

export const getChatHistory = (sessionId, limit = 50, offset = 0) =>
  api.get(`/chat/history/${sessionId}`, { limit, offset });

export const deleteChatSession = (sessionId) =>
  api.delete(`/chat/session/${sessionId}`);

// Monitoring (soil, weather, yield)
export const postSoilReading = (reading) =>
  api.post('/monitoring/soil', reading);

export const getLatestSoil = () => api.get('/monitoring/soil/latest');

export const getSoilHistory = (limit = 50) =>
  api.get('/monitoring/soil/history', { limit });

export const fetchWeather = (lat, lon, days = 3) =>
  api.get('/monitoring/weather', { lat, lon, days });

export const fetchLocationName = (lat, lon) =>
  api.get('/monitoring/location', { lat, lon });

export const predictSinturisYield = (payload = {}) =>
  api.post('/monitoring/yield/sinturis', payload);

// Utilities
export const generateSessionId = () => {
  return crypto.randomUUID ? 
    crypto.randomUUID() : 
    'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
};

export { ApiError };
export default api;
