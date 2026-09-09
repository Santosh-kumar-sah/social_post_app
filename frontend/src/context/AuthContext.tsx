import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, LoginCredentials, SignupCredentials } from '../types';
import { loginApi, signupApi, getMeApi } from '../api/auth';

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
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('pulse_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('pulse_jwt_token');
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Sync token and check authentication on boot
  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem('pulse_jwt_token');
      if (storedToken) {
        try {
          const res = await getMeApi();
          if (res.user) {
            setUser(res.user);
            localStorage.setItem('pulse_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('Session expired or invalid, clearing credentials.');
          localStorage.removeItem('pulse_jwt_token');
          localStorage.removeItem('pulse_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const res = await loginApi(credentials);
    if (res.token && res.user) {
      localStorage.setItem('pulse_jwt_token', res.token);
      localStorage.setItem('pulse_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
    }
  }, []);

  const signup = useCallback(async (credentials: SignupCredentials) => {
    const res = await signupApi(credentials);
    if (res.token && res.user) {
      localStorage.setItem('pulse_jwt_token', res.token);
      localStorage.setItem('pulse_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('pulse_jwt_token');
    localStorage.removeItem('pulse_user');
    setUser(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
