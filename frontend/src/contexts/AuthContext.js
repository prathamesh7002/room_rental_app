import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { config } from '../utils/config';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = config.apiBaseUrl;

  // Try to refresh access token using refresh token
  const refreshAccessToken = useCallback(async () => {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) return null;
    try {
      const resp = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, { refresh });
      const newAccess = resp.data?.access;
      if (newAccess) {
        localStorage.setItem('access_token', newAccess);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newAccess}`;
        return newAccess;
      }
      return null;
    } catch (e) {
      // Refresh failed; clear tokens
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      delete axios.defaults.headers.common['Authorization'];
      return null;
    }
  }, [API_BASE_URL]);

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/profile/`);
      setUser(response.data);
    } catch (error) {
      // If unauthorized, try refreshing the access token once and retry
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          try {
            const retry = await axios.get(`${API_BASE_URL}/auth/profile/`);
            setUser(retry.data);
            return;
          } catch (_) {
            // fall through to clear tokens below
          }
        }
      }
      // Clear invalid tokens
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, refreshAccessToken]);

  // Configure axios defaults
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const refresh = localStorage.getItem('refresh_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserProfile();
    } else if (refresh) {
      // Attempt to refresh and then load profile
      (async () => {
        const newAccess = await refreshAccessToken();
        if (newAccess) {
          await fetchUserProfile();
        } else {
          setLoading(false);
        }
      })();
    } else {
      setLoading(false);
    }
  }, [fetchUserProfile, refreshAccessToken]);

  const login = async (username, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login/`, {
        username,
        password,
      });
      
      const { access, refresh, user } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      
      setUser(user);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register/`, userData);
      
      const { access, refresh, user } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      
      setUser(user);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  // OTP Authentication methods
  const sendOTP = async (emailOrPhone, type = 'login') => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/send-otp/`, {
        email_or_phone: emailOrPhone,
        type
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to send OTP' 
      };
    }
  };

  const verifyOTP = async ({ otp, email, phone, type }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verify-otp/`, {
        otp,
        email,
        phone,
        type
      });
      
      const { access, refresh, user } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      
      setUser(user);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Invalid OTP' 
      };
    }
  };

  const resendOTP = async ({ email, phone, type }) => {
    try {
      await axios.post(`${API_BASE_URL}/auth/resend-otp/`, {
        email,
        phone,
        type
      });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to resend OTP' 
      };
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
    sendOTP,
    verifyOTP,
    resendOTP,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
