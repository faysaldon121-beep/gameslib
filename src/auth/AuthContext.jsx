import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from './api'; // We will create this helper next

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('authToken'));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for a token in local storage on initial load
        if (token) {
            try {
                // You can add a '/api/auth/me' endpoint to verify the token and get fresh user data
                const userData = JSON.parse(atob(token.split('.')[1])); // Simple decode, not for sensitive data
                setUser({ email: userData.email, role: userData.role });
            } catch (error) {
                // Token is invalid
                localStorage.removeItem('authToken');
                setToken(null);
                setUser(null);
            }
        }
        setIsLoading(false);
    }, [token]);

    const login = async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        if (response.token) {
            localStorage.setItem('authToken', response.token);
            setToken(response.token);
            setUser(response.user);
            return response;
        }
        throw new Error(response.error || 'Login failed');
    };

    const register = async (email, password) => {
        const response = await api.post('/auth/register', { email, password });
        return response;
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
    };

    const value = { user, token, login, register, logout, isLoading };

    return (
        <AuthContext.Provider value={value}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

// Custom hook to easily use the auth context
export const useAuth = () => {
    return useContext(AuthContext);
};