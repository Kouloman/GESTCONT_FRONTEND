import axios from 'axios';
import Cookies from 'js-cookie';
// import { toast } from 'react-toastify'; // Supprimé

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;
    
    // Handle specific HTTP status codes
    if (response) {
      if (response.status === 401) {
        Cookies.remove('auth_token');
        window.location.href = '/login';
      } else if (response.status === 403) {
        // 403 interdit : aucune notification toast
      } else if (response.status === 404) {
        // 404 non trouvé : aucune notification toast
      } else if (response.status === 500) {
        // 500 erreur serveur : aucune notification toast
      } else {
        // Autres erreurs : aucune notification toast
      }
    } else {
      // Network error or server not reachable
      // Pas de toast ici non plus
      
      // In development mode, we'll handle the request in mock services
      if (import.meta.env.DEV) {
        console.warn('API request failed, falling back to mock data');
        return Promise.reject({ isMockable: true, originalError: error });
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;