import axios from 'axios';

const devUrl = import.meta.env.VITE_API_AUTH_DEV_URL || 'http://localhost:8080/api';
const prodUrl = import.meta.env.VITE_API_AUTH_PROD_URL || 'https://tu-backend-auth.com/api';
const mode = import.meta.env.MODE; // 'development' or 'production'

const baseURL = import.meta.env.VITE_API_BASE_URL || (mode === 'production' ? prodUrl : devUrl);
console.log(import.meta.env.MODE);

const api = axios.create({
  baseURL: baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;