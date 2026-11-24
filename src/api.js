import axios from 'axios';

const api = axios.create({ baseURL: 'http://127.0.0.1:8000/api/' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access');
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});

export function errorMessage(err, fallback) {
  const d = err.response && err.response.data;
  if (!d || typeof d === 'string') return fallback;
  let e = d.error || d.detail;
  if (!e) {
    const k = Object.keys(d)[0];
    if (k) e = k + ': ' + (Array.isArray(d[k]) ? d[k][0] : d[k]);
  }
  if (Array.isArray(e)) e = e[0];
  return typeof e === 'string' ? e : fallback;
}

export default api;