import axios from 'axios';

// ── Single gateway base URL ───────────────────────────────────────────────────
// All requests go through the same host (your API gateway / reverse proxy).
// Change BASE_URL here once and every service picks it up automatically.
const BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('API Error:', err?.response?.status, err?.response?.data || err.message);
    return Promise.reject(err);
  }
);

// ── Planning Service ──────────────────────────────────────────────────────────
export const planningService = {
  getAll:    ()           => api.get('/api/plannings'),
  getById:   (id)         => api.get('/api/plannings/getPlanning', { params: { Planning_ID: id } }),
  create:    (data)       => api.post('/api/plannings', data),
  update:    (id, data)   => api.put(`/api/plannings/${id}`, data),
  delete:    (id)         => api.delete(`/api/plannings/${id}`),
  getByDate: (date)       => api.get(`/api/plannings/date/${date}`),
};

// ── Order Service ─────────────────────────────────────────────────────────────
// Previously Orders.jsx called http://localhost:8082/api/orders directly via
// raw fetch() with its own inline helper — now unified here via axios so
// error handling, base URL and auth headers are consistent across all services.
export const orderService = {
  getAll:          ()           => api.get('/api/orders'),
  getById:         (id)         => api.get(`/api/orders/${id}`),
  getNewNumber:    ()           => api.get('/api/orders/new'),
  create:       (data)       => api.post('/api/orders', data),
  createFromPlanning: (data)    => api.post('/api/orders/from-planning', data), // ✅ renamed for clarity
  save:            (data)       => api.post('/api/orders', data),               // for direct Order entity saves if needed
  update:          (id, data)   => api.put(`/api/orders/${id}`, data),
  updateStatus:    (id, status) => api.patch(`/api/orders/${id}/status`, { status }),
  delete:          (id)         => api.delete(`/api/orders/${id}`),
};

// ── Customer Service ──────────────────────────────────────────────────────────
// Previously Customers.jsx called http://localhost:8083/api/customers directly
// via its own inline apiFetch helper — now unified here.
export const customerService = {
  getAll:    ()           => api.get('/api/customers'),
  getById:   (id)         => api.get(`/api/customers/${id}`),
  create:    (data)       => api.post('/api/customers', data),
  update:    (id, data)   => api.put(`/api/customers/${id}`, data),
  delete:    (id)         => api.delete(`/api/customers/${id}`),
  search:    (query)      => api.get(`/api/customers/search?q=${query}`),
};

// ── Car Service ───────────────────────────────────────────────────────────────
export const carService = {
  getAll:        ()           => api.get('/api/vehicles'),
  getById:       (id)         => api.get(`/api/vehicles/${id}`),
  getByPlate:    (plate)      => api.get(`/api/vehicles/plate/${encodeURIComponent(plate)}`),  // NEW: lookup by license plate on backend if available
  create:        (data)       => api.post('/api/vehicles', data),
  update:        (id, data)   => api.put(`/api/vehicles/${id}`, data),
  delete:        (id)         => api.delete(`/api/vehicles/${id}`),
  getByCustomer: (customerId) => api.get(`api/vehicles/customer/${customerId}`),
};

export default api;
