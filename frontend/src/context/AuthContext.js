import { createContext, useState, useEffect, useCallback } from 'react';
import client from '../api/client';
import { STORAGE_KEYS } from '../utils/constants';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await client.get('/auth/me');
        setUser(data.user);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
      } catch {
        setUser(null);
        localStorage.removeItem(STORAGE_KEYS.USER);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const signup = async (name, email, password) => {
    const { data } = await client.post('/auth/signup', { name, email, password });
    setUser(data.user);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
    showToast('Account created!');
  };

  const login = async (email, password) => {
    const { data } = await client.post('/auth/login', { email, password });
    setUser(data.user);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
    showToast('Welcome back!');
  };

  const logout = async () => {
    try { await client.post('/auth/logout'); } catch {}
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
    showToast('Logged out');
  };

  const updateProfile = async (name) => {
    const { data } = await client.patch('/auth/profile', { name });
    setUser(data.user);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
    showToast('Profile updated!');
  };

  return (
    <AuthContext.Provider value={{ user, loading, toast, signup, login, logout, updateProfile, showToast, client }}>
      {children}
    </AuthContext.Provider>
  );
};
