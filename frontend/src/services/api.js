import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authAPI = {
  register: (userData) => api.post('/users/register', userData),
  login: (credentials) => api.post('/users/login', credentials),
  logout: () => api.post('/users/logout'),
  getUser: () => api.get('/users/user'),
  updateUser: (userData) => {
    // Handle FormData for file uploads
    if (userData instanceof FormData) {
      return api.put('/users/update-user', userData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    return api.put('/users/update-user', userData);
  },
  forgotPassword: (email) => api.post('/users/forget-password', { email }),
  resetPassword: (token, password, confirmPassword) => api.post(`/users/reset-password/${token}`, { password, confPassword: confirmPassword }),
  verifyEmail: (token) => api.get(`/users/verify/${token}`),
};

// Subscription services
export const subscriptionAPI = {
  createFree: (userId) => api.post(`/subscriptions/createFreeSubscription/${userId}`),
  getUserSubscription: () => api.get('/subscriptions/getUserSubscription'),
  getAllSubscriptions: () => api.get('/subscriptions/getAllSubscriptions'),
  getSubscriptionById: (id) => api.get(`/subscriptions/getSubscriptionById/${id}`),
  updateSubscription: (id, data) => api.put(`/subscriptions/updateSubscription/${id}`, data),
  cancelSubscription: (id) => api.put(`/subscriptions/cancelSubscription/${id}`),
  renewSubscription: (id, data) => api.put(`/subscriptions/renewSubscription/${id}`, data),
  activateSubscription: (id) => api.put(`/subscriptions/activateSubscription/${id}`),
  deactivateSubscription: (id) => api.put(`/subscriptions/deactivateSubscription/${id}`),
  upgradeSubscription: (data) => api.put(`/subscriptions/upgradeSubscription`, data),
  createStripeCheckout: (data) => api.post('/subscriptions/create-checkout-session', data),
  purchaseSubscription: (planId) => api.post('/subscriptions/purchase', { planId }),
  stripeCheckout: (planId) => api.post('/payments/checkout', { planId }),
};

// Plan services
export const planAPI = {
  getAllPlans: () => api.get('/plans'),
  getPlanById: (id) => api.get(`/plans/${id}`),
  createPlan: (data) => api.post('/plans', data),
  updatePlan: (id, data) => api.put(`/plans/${id}`, data),
  deletePlan: (id) => api.delete(`/plans/${id}`),
};

// Payment services
export const paymentAPI = {
  getUserPayments: () => api.get('/payments/history'),
  getPaymentById: (id) => api.get(`/payments/status/${id}`),
  getAllPayments: () => api.get('/payments/all'),
  createPayment: (data) => api.post('/payments/create', data),
  processSubscriptionPayment: (data) => api.post('/payments/process-subscription', data),
};

// Session services
export const sessionAPI = {
  createSession: (data) => api.post('/sessions/create', data),
  getAllSessions: () => api.get('/sessions'),
  getSessionById: (id) => api.get(`/sessions/${id}`),
  updateSession: (id, data) => api.put(`/sessions/${id}`, data),
  deleteSession: (id) => api.delete(`/sessions/${id}`),
  joinSession: (id, data) => api.post(`/sessions/${id}/join`, data),
  leaveSession: (id) => api.post(`/sessions/${id}/leave`, {}),
  startSession: (id) => api.post(`/sessions/${id}/start`, {}),
  endSession: (id) => api.post(`/sessions/${id}/end`, {}),
  toggleRecording: (id, enabled) => api.post(`/sessions/${id}/toggle-recording`, { enabled }),
  toggleScreenShare: (id, enabled) => api.post(`/sessions/${id}/toggle-screen-share`, { enabled }),
  getSessionRecordings: (id) => api.get(`/recordings/session/${id}`)
};

// Recording services
export const recordingAPI = {
  startRecording: (sessionId) => api.post(`/recordings/start/${sessionId}`),
  stopRecording: (sessionId, data) => api.post(`/recordings/stop/${sessionId}`, data),
  getSessionRecordings: (sessionId) => api.get(`/recordings/session/${sessionId}`),
  getUserRecordings: () => api.get('/recordings/user'),
  deleteRecording: (recordingId) => api.delete(`/recordings/${recordingId}`),
  downloadRecording: (recordingId) => api.get(`/recordings/download/${recordingId}`)
};

//chatApi
export const chatAPI = {
  getMessages: (sessionId) => api.get(`/chat/session/${sessionId}/history`),
  sendMessage: (data) => api.post('/chat/save', data),
  deleteMessage: (messageId) => api.delete(`/chat/message/${messageId}`)
};  

export default api;
