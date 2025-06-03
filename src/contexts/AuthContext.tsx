import React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import api from '../services/api';
import { mockAuthService } from '../services/mockServices';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const checkAuth = useCallback(async () => {
    try {
      // Try to get user data from backend
      const token = Cookies.get('auth_token');
      
      if (token) {
        try {
          const response = await api.get('/users/me');
          setUser(response.data);
        } catch (error) {
          // If backend fails, fallback to mock service in development
          if (import.meta.env.DEV) {
            const mockUser = await mockAuthService.getCurrentUser();
            if (mockUser) {
              setUser(mockUser);
            } else {
              Cookies.remove('auth_token');
              setUser(null);
            }
          } else {
            Cookies.remove('auth_token');
            setUser(null);
          }
        }
      }
    } finally {
      setIsInitialized(true);
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      const { token, user: userData } = response.data;
      
      Cookies.set('auth_token', token, { expires: 7 });
      setUser(userData);
    } catch (error) {
      // Fallback to mock auth in development
      if (import.meta.env.DEV) {
        const result = await mockAuthService.login(username, password);
        if (result.success) {
          Cookies.set('auth_token', 'mock-token', { expires: 7 });
          setUser(result.user);
        } else {
          throw new Error('Invalid credentials');
        }
      } else {
        throw error;
      }
    }
  };

  const logout = () => {
    Cookies.remove('auth_token');
    setUser(null);
  };

  const hasPermission = (permission: string) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.permissions.includes(permission);
  };

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isInitialized,
      isAdmin,
      login,
      logout,
      checkAuth,
      hasPermission
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};