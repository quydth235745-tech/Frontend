import React, { createContext, useEffect, useMemo, useState } from 'react';
import ClientAxios from '../api/ClientAxios';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        if (storedUser && storedToken) {
          // Verify token is still valid and user not banned
          try {
            const res = await ClientAxios.get('/api/auth/verify-token');
            setUser(res.data.user);
          } catch (err) {
            // Token invalid or user banned - logout
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Check ban status every 30 seconds for logged-in users
    const interval = setInterval(async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          await ClientAxios.get('/api/auth/verify-token');
        } catch (err) {
          // Only logout on 401 (expired) or 403 (banned)
          // Don't logout on network errors or other failures
          if (err.response?.status === 401 || err.response?.status === 403) {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            setUser(null);
          }
        }
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const login = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = useMemo(() => ({ user, login, logout, isLoading }), [user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


