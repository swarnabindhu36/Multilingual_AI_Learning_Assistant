import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserProfile } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, preferredLanguage: string) => Promise<void>;
  logout: () => void;
  quickLoginAs: (role: 'student' | 'admin') => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('lingualearn_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const storedToken = localStorage.getItem('lingualearn_token');
    if (!storedToken) {
      setUser(null);
      setProfile(null);
      setIsLoading(false);
      return;
    }
    try {
      const res = await api.getMe();
      setUser(res.user);
      setProfile(res.profile || null);
    } catch {
      localStorage.removeItem('lingualearn_token');
      setUser(null);
      setProfile(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    localStorage.setItem('lingualearn_token', res.token);
    setToken(res.token);
    setUser(res.user);
    await refreshUser();
  };

  const register = async (name: string, email: string, password: string, preferredLanguage: string) => {
    const res = await api.register({ name, email, password, preferredLanguage });
    localStorage.setItem('lingualearn_token', res.token);
    setToken(res.token);
    setUser(res.user);
    await refreshUser();
  };

  const logout = () => {
    localStorage.removeItem('lingualearn_token');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const quickLoginAs = async (role: 'student' | 'admin') => {
    if (role === 'admin') {
      await login('admin@lingualearn.edu', 'Admin@12345');
    } else {
      await login('student@lingualearn.edu', 'Student@12345');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        isLoading,
        loading: isLoading,
        login,
        register,
        logout,
        quickLoginAs,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
