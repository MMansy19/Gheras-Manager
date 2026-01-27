import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../api/authApi';
import { User } from '../api/types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
      login: (password: string) => Promise<boolean>;
  loginWithMail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return authApi.isAuthenticated();
  });

  const [user, setUser] = useState<User | null>(() => {
    return authApi.getCurrentUser();
  });

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Check authentication status on mount
    if (!isAuthenticated) {
      // Try to refresh token if needed
      const checkAuth = async () => {
        try {
          const token = sessionStorage.getItem('authToken');
          if (token) {
            // Token exists, verify it by getting user
            const currentUser = authApi.getCurrentUser();
            if (currentUser) {
              setIsAuthenticated(true);
              setUser(currentUser);
            } else {
              // Token might be expired, try to refresh
              await authApi.refreshToken();
              const refreshedUser = authApi.getCurrentUser();
              if (refreshedUser) {
                setIsAuthenticated(true);
                setUser(refreshedUser);
              } else {
                // Refresh failed, clear auth state
                sessionStorage.removeItem('authToken');
                sessionStorage.removeItem('user');
                setIsAuthenticated(false);
                setUser(null);
              }
            }
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          sessionStorage.removeItem('authToken');
          sessionStorage.removeItem('user');
          setIsAuthenticated(false);
          setUser(null);
        }
      };

      checkAuth();
    }
  }, []);
  const login = async (password: string): Promise<boolean> => {
        try {
            // Get the admin password from environment variable
            const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;

            if (password === adminPassword) {
                setIsAuthenticated(true);
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    };

  const loginWithMail = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      const response = await authApi.login(email, password);

      if (response.success) {
        setIsAuthenticated(true);
        setUser(response.data.user);
        sessionStorage.setItem('user', JSON.stringify(response.data.user));
        return { success: true };
      } else {
        return { success: false, error: 'Login failed' };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error?.error?.message || 'حدث خطأ أثناء تسجيل الدخول';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      sessionStorage.removeItem('user');
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login,loginWithMail, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
