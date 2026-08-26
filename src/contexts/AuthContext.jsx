import React, { createContext, useContext, useState, useEffect } from 'react';
import firebaseAuthService from '../services/firebaseAuthService';
import apiService from '../services/api';

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
  const [error, setError] = useState(null);

  useEffect(() => {
    // onIdTokenChanged fires on sign-in, sign-out, AND whenever Firebase
    // silently refreshes the ID token (~hourly) — keeping apiService's
    // Authorization header valid for the whole session, not just at login.
    const unsubscribe = firebaseAuthService.onIdTokenChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        apiService.setToken(token);
      } else {
        apiService.setToken(null);
      }
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const register = async (email, password, displayName) => {
    try {
      setError(null);
      const result = await firebaseAuthService.register(email, password, displayName);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const result = await firebaseAuthService.login(email, password);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      setError(null);
      const result = await firebaseAuthService.loginWithGoogle();
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await firebaseAuthService.logout();
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      setError(null);
      await firebaseAuthService.resetPassword(email);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const updateProfile = async (updates) => {
    try {
      setError(null);
      const updatedUser = await firebaseAuthService.updateUserProfile(updates);
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      setError(null);
      await firebaseAuthService.changePassword(currentPassword, newPassword);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    updateProfile,
    changePassword,
    clearError,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
