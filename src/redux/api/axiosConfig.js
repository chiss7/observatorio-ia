import axios from 'axios';

const devUrl = import.meta.env.VITE_API_DEV_URL;
const prodUrl = import.meta.env.VITE_API_PROD_URL;
const mode = import.meta.env.MODE; // 'development' or 'production'

const baseURL = mode === 'production' ? prodUrl : devUrl;

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export default api;
