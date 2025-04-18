import React, {createContext, useState, useEffect, useContext} from 'react';
import axios from 'axios';

// Login-user
type User = {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
};

// Type for auth
type AuthContextType = {
    user: User | null;
    loading: boolean;
    login: (token: string, userData?: any) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
};

// Default values for the context
const defaultAuthContext: AuthContextType = {
    user: null,
    loading: true,
    login: async () => {
    },
    logout: () => {
    },
    isAuthenticated: false,
};

// React context for authentication
const AuthContext = createContext<AuthContextType>(defaultAuthContext);

// Local JWT storage key
const TOKEN_KEY = 'flow_auth_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const processToken = async (token: string) => {
        try {
            // TODO: server-side token validation
            // For now to check whether it works - client-side validation
            const response = await axios.get('/api/auth/verify', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const userData = response.data.user;

            setUser({
                id: userData.id,
                name: userData.name,
                email: userData.email,
                image: userData.image,
            });

            localStorage.setItem(TOKEN_KEY, token); // Store token in local storage
        } catch (error) {
            console.error('Error processing token:', error);
            setUser(null);
            localStorage.removeItem(TOKEN_KEY); // Remove token from local storage
        }
    };

    // Login function
    const login = async (token: string, userData?: any) => {
        setLoading(true);
        if (userData) {
            // If we got user data, set it directly
            setUser({
                id: userData.id,
                name: userData.name,
                email: userData.email,
                image: userData.image,
            });
            localStorage.setItem(TOKEN_KEY, token);
        } else {
            // Else just process the token
            await processToken(token);
        }
        setLoading(false);
    };

    // Logout function
    const logout = () => {
        setUser(null);
        localStorage.removeItem(TOKEN_KEY); // Remove token from local storage
    }

    useEffect(() => {
        const loadUserFromToken = async () => {
            const token = localStorage.getItem(TOKEN_KEY);
            if (token) {
                await processToken(token);
            }
            setLoading(false);
        };
        loadUserFromToken();
    }, []); // Load user from token on initial render

    const value: AuthContextType = {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user, // Check if user is authenticated
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);
export default AuthContext;