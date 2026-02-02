import axios from 'axios';

const devUrl = import.meta.env.VITE_API_AUTH_DEV_URL;
const prodUrl = import.meta.env.VITE_API_AUTH_PROD_URL;
const mode = import.meta.env.MODE; // 'development' or 'production'

const baseURL = mode === 'production' ? prodUrl : devUrl;

const api = axios.create({
  baseURL: baseURL,
});

api.interceptors.request.use((config) => {
  // Allow requests to opt-out of adding the Authorization header by
  // setting a custom request header `x-skip-auth`.
  if (config && config.headers && config.headers['x-skip-auth']) {
    // remove the marker so it isn't sent to the backend
    delete config.headers['x-skip-auth'];
    return config;
  }

  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;