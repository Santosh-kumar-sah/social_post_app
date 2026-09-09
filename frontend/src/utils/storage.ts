import { User } from '../types';

export const STORAGE_KEYS = {
  TOKEN: 'pulse_jwt_token',
  USER: 'pulse_user',
  THEME_MODE: 'pulse_theme_mode',
} as const;

export const storage = {
  getToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  setToken: (token: string): void => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  },

  removeToken: (): void => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  },

  getUser: (): User | null => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.USER);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  },

  setUser: (user: User): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch {
      // Ignore quota exceeded or serialization errors
    }
  },

  removeUser: (): void => {
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  clearAuth: (): void => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  getThemeMode: (): 'light' | 'dark' => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME_MODE);
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
  },

  setThemeMode: (mode: 'light' | 'dark'): void => {
    localStorage.setItem(STORAGE_KEYS.THEME_MODE, mode);
  },
};
