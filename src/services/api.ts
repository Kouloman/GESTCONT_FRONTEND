import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';

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
        toast.error('Votre session a expiré. Veuillez vous reconnecter.');
        window.location.href = '/login';
      } else if (response.status === 403) {
        toast.error('Vous n\'avez pas les autorisations nécessaires pour cette action.');
      } else if (response.status === 404) {
        toast.error('La ressource demandée n\'a pas été trouvée.');
      } else if (response.status === 500) {
        toast.error('Une erreur serveur est survenue. Veuillez réessayer ultérieurement.');
      } else {
        // Display error message from backend if available
        const errorMessage = response.data?.message || 'Une erreur est survenue';
        toast.error(errorMessage);
      }
    } else {
      // Network error or server not reachable
      toast.error('Impossible de se connecter au serveur. Vérifiez votre connexion internet.');
      
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