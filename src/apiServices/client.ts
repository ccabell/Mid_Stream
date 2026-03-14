import axios from 'axios';

// Use /api prefix for Vite proxy in development, or full URL in production
const baseURL = import.meta.env.VITE_API_URL ?? '/api';

export const client = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.detail ?? err.message ?? 'Request failed';
    return Promise.reject(new Error(typeof message === 'string' ? message : JSON.stringify(message)));
  }
);
