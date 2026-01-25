import axios from 'axios';

// Env variables (Vite):
// - VITE_API_BASE_URL: override explicit base URL for all environments
// - VITE_API_DEV_URL: development backend (defaults to '/api' to use Vite proxy)
// - VITE_API_PROD_URL: production backend URL

// During debugging we default dev URL to local backend on port 8000
const devUrl = import.meta.env.VITE_API_DEV_URL || 'http://localhost:8000';
const prodUrl = import.meta.env.VITE_API_PROD_URL || 'https://document-collector-7p0a.onrender.com';
const mode = import.meta.env.MODE; // 'development' or 'production'

const baseURL = import.meta.env.VITE_API_BASE_URL || (mode === 'production' ? prodUrl : devUrl);

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export default api;
