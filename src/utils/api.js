import axios from 'axios';

const devUrl = import.meta.env.VITE_API_AUTH_DEV_URL;
const prodUrl = import.meta.env.VITE_API_AUTH_PROD_URL;
const mode = import.meta.env.MODE; // 'development' or 'production'

const baseURL = mode === 'production' ? prodUrl : devUrl;
console.log('🔧 Environment:', mode);
console.log('🔧 VITE_API_AUTH_DEV_URL:', devUrl);
console.log('🔧 VITE_API_AUTH_PROD_URL:', prodUrl);

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