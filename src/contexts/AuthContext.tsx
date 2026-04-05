/**
 * Auth Context - User Authentication Management
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, User } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<any>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load current user on mount
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { user: authUser, error } = await authService.signIn(email, password);
    if (!error && authUser) {
      setUser(authUser);
    }
    return { user: authUser, error };
  };

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    const result = await authService.signUp(email, password, userData);
    const { user: authUser, error, requiresEmailConfirmation } = result;
    if (!error && authUser && !requiresEmailConfirmation) {
      setUser(authUser);
    }
    return { user: authUser, error, requiresEmailConfirmation };
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    const { data, error } = await authService.updateProfile(user.id, updates);
    if (!error && data) {
      setUser(data);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
