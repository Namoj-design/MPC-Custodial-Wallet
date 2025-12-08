import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type UserRole = 'client' | 'manager';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const mockUsers: Record<string, User & { password: string }> = {
  'client@demo.com': {
    id: '1',
    email: 'client@demo.com',
    name: 'Alex Johnson',
    role: 'client',
    password: 'demo123',
  },
  'manager@demo.com': {
    id: '2',
    email: 'manager@demo.com',
    name: 'Sarah Chen',
    role: 'manager',
    password: 'demo123',
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored session
    const stored = localStorage.getItem('mpc_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser = mockUsers[email];
    if (mockUser && mockUser.password === password) {
      const { password: _, ...userData } = mockUser;
      setUser(userData);
      localStorage.setItem('mpc_user', JSON.stringify(userData));
    } else {
      throw new Error('Invalid credentials');
    }
    setIsLoading(false);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    // For demo, log in as client
    const userData = {
      id: '3',
      email: 'google.user@gmail.com',
      name: 'Google User',
      role: 'client' as UserRole,
    };
    setUser(userData);
    localStorage.setItem('mpc_user', JSON.stringify(userData));
    setIsLoading(false);
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string, role: UserRole) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const userData: User = {
      id: Date.now().toString(),
      email,
      name,
      role,
    };
    setUser(userData);
    localStorage.setItem('mpc_user', JSON.stringify(userData));
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('mpc_user');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        loginWithGoogle,
        signup,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
