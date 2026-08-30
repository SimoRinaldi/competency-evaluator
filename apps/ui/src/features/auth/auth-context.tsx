import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  User,
  UserRole,
  AuthResponse,
  getToken,
  removeToken,
  login as apiLogin,
  register as apiRegister,
  fetchCurrentUser,
} from './auth.api';

interface AuthContextType {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<AuthResponse>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    removeToken();
    setTokenState(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const currentToken = getToken();
    if (!currentToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const userData = await fetchCurrentUser();
      setUser(userData);
    } catch {
      // If fetching user fails (e.g. token expired / 401), clear invalid token
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    if (token) {
      refreshUser();
    } else {
      setIsLoading(false);
    }
  }, [token, refreshUser]);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    const data = await apiLogin(email, password);
    setTokenState(data.access_token);
    if (data.user) {
      setUser(data.user);
    }
    return data;
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ): Promise<AuthResponse> => {
    return apiRegister(name, email, password, role);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
