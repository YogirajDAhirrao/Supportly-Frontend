import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true, // sends httpOnly cookies automatically
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth
export const authApi = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  logout: () => api.post('/auth/logout/'),
  me: () => api.get('/auth/me/'),
};

// Tickets
export const ticketsApi = {
  list: () => api.get('/tickets/'),
  create: (data) => api.post('/tickets/', data),
  get: (id) => api.get(`/tickets/${id}/`),
  assign: (id, data) => api.post(`/tickets/${id}/assign/`, data),
  updateStatus: (id, data) => api.patch(`/tickets/${id}/status/`, data),
  getMessages: (id) => api.get(`/tickets/${id}/messages/`),
  sendMessage: (id, data) => api.post(`/tickets/${id}/messages/`, data),
};

export default api;
