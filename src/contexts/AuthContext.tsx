import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { User } from '@/types';
import { getStoredAuth, setStoredAuth, removeStoredAuth } from '@/utils/storage';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const auth = getStoredAuth();
    if (auth?.token) {
      try {
        const decoded = jwtDecode<User>(auth.token);
        setUser(decoded);
        setToken(auth.token);
      } catch (error) {
        removeStoredAuth();
      }
    }
  }, []);

  const login = (newToken: string) => {
    try {
      const decoded = jwtDecode<User>(newToken);
      setUser(decoded);
      setToken(newToken);
      setStoredAuth({ token: newToken });
    } catch (error) {
      console.error('Invalid token:', error);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    removeStoredAuth();
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      isAuthenticated: !!user && !!token,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}