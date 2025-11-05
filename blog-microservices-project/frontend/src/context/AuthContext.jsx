// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Checks for token on initial load
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
        // Simple check: In a real app, you would validate the token's expiry
        setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      // Calls the API Gateway's /auth/login endpoint, which proxies to the User Service
      const response = await api.post('/auth/login', { username, password });
      
      const { token, user: userData } = response.data;
      
      localStorage.setItem('authToken', token);
      setUser(userData); 
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      throw new Error(error.response?.data?.message || 'Login error');
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return <div>Loading user session...</div>;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};