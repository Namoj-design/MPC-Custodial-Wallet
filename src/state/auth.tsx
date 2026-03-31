import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { UserRole } from '@/types';

const AUTH_KEY = 'dfns_auth';

export interface AuthUser {
  userId: string;
  email: string;
  role: UserRole;
  token: string;
  dfnsWalletId?: string;
  hederaAccountId?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (user: AuthUser) => void;
  loginWithToken: (token: string) => Promise<AuthUser>;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function loadStoredAuth(): AuthUser | null {
  try {
    const stored = sessionStorage.getItem(AUTH_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function saveAuth(user: AuthUser | null) {
  if (user) {
    sessionStorage.setItem(AUTH_KEY, JSON.stringify(user));
  } else {
    sessionStorage.removeItem(AUTH_KEY);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadStoredAuth);

  const loginWithToken = useCallback(async (firebaseToken: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${firebaseToken}`
        }
      });
      const data = await response.json();
      if (data.success) {
        const authUser: AuthUser = {
          userId: data.data.userId,
          email: data.data.email,
          role: data.data.role,
          token: firebaseToken, // using firebase token as the session token
          dfnsWalletId: data.data.walletId,
          hederaAccountId: data.data.hederaAccountId,
        };
        setUser(authUser);
        saveAuth(authUser);
        return authUser;
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, []);

  const login = useCallback((authUser: AuthUser) => {
    setUser(authUser);
    saveAuth(authUser);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    saveAuth(null);
  }, []);

  const updateUser = useCallback((updates: Partial<AuthUser>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      saveAuth(updated);
      return updated;
    });
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    loginWithToken,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
