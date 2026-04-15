import axios from 'axios';

const BASE_URL = 'http://localhost:8081';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('API Error:', err);
    return Promise.reject(err);
  }
);

// Planning Service
export const planningService = {
  getAll: () => api.get('/api/plannings/'),
  getById: (id) => api.get(`/api/plannings/getPlanning`, { params: { Planning_ID: id } }),
  create: (data) => api.post('/api/plannings', data),
  update: (id, data) => api.put(`/planning-service/plannings/${id}`, data),
  delete: (id) => api.delete(`/planning-service/plannings/${id}`),
  getByDate: (date) => api.get(`/planning-service/plannings/date/${date}`),
};

// Order Service
export const orderService = {
  getAll: () => api.get('/order-service/orders'),
  getById: (id) => api.get(`/order-service/orders/${id}`),
  create: (data) => api.post('/order-service/orders', data),
  update: (id, data) => api.put(`/order-service/orders/${id}`, data),
  updateStatus: (id, status) => api.patch(`/order-service/orders/${id}/status`, { status }),
  delete: (id) => api.delete(`/order-service/orders/${id}`),
};

// Customer Service
export const customerService = {
  getAll: () => api.get('/customer-service/customers'),
  getById: (id) => api.get(`/customer-service/customers/${id}`),
  create: (data) => api.post('/customer-service/customers', data),
  update: (id, data) => api.put(`/customer-service/customers/${id}`, data),
  delete: (id) => api.delete(`/customer-service/customers/${id}`),
  search: (query) => api.get(`/customer-service/customers/search?q=${query}`),
};

// Car Service
export const carService = {
  getAll: () => api.get('/car-service/cars'),
  getById: (id) => api.get(`/car-service/cars/${id}`),
  create: (data) => api.post('/car-service/cars', data),
  update: (id, data) => api.put(`/car-service/cars/${id}`, data),
  delete: (id) => api.delete(`/car-service/cars/${id}`),
  getByCustomer: (customerId) => api.get(`/car-service/cars/customer/${customerId}`),
};

export default api;
