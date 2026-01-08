import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    login: (password: string) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        // Check if user is authenticated from sessionStorage
        return sessionStorage.getItem('isAuthenticated') === 'true';
    });

    useEffect(() => {
        // Sync authentication state with sessionStorage
        if (isAuthenticated) {
            sessionStorage.setItem('isAuthenticated', 'true');
        } else {
            sessionStorage.removeItem('isAuthenticated');
        }
    }, [isAuthenticated]);

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

    const logout = () => {
        setIsAuthenticated(false);
        sessionStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userRole');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
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
