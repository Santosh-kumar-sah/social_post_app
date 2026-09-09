import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, LoginCredentials, SignupCredentials } from '../types';
import { loginApi, signupApi, getMeApi } from '../api/auth';
import { storage } from '../utils/storage';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => storage.getUser());
  const [token, setToken] = useState<string | null>(() => storage.getToken());
  const [loading, setLoading] = useState<boolean>(true);

  // Sync token and check authentication on boot
  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = storage.getToken();
      if (storedToken) {
        try {
          const res = await getMeApi();
          if (res.user) {
            setUser(res.user);
            storage.setUser(res.user);
          }
        } catch {
          console.warn('Session expired or invalid, clearing credentials.');
          storage.clearAuth();
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, []);

  const saveAuthSession = (authToken: string, authUser: User) => {
    storage.setToken(authToken);
    storage.setUser(authUser);
    setToken(authToken);
    setUser(authUser);
  };

  const login = useCallback(async (credentials: LoginCredentials) => {
    const res = await loginApi(credentials);
    if (res.token && res.user) {
      saveAuthSession(res.token, res.user);
    }
  }, []);

  const signup = useCallback(async (credentials: SignupCredentials) => {
    const res = await signupApi(credentials);
    if (res.token && res.user) {
      saveAuthSession(res.token, res.user);
    }
  }, []);

  const logout = useCallback(() => {
    storage.clearAuth();
    setUser(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
