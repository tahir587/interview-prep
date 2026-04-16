import React, { createContext, useState, useContext, useEffect } from "react";
import * as api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check user when app loads
  useEffect(() => {
    const checkAuth = async () => {
      const token = sessionStorage.getItem("token");

      // Remove legacy persisted token so app does not auto-login from previous localStorage state.
      localStorage.removeItem("token");

      // If token exists, try to get user info
      if (token) {
        try {
          const res = await api.getMe();
          setUser(res.data);
        } catch (error) {
          console.error("Auth check failed:", error);
          sessionStorage.removeItem("token");
          setUser(null);
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  // Register
  const register = async (data) => {
    try {
      const res = await api.register(data);

      sessionStorage.setItem("token", res.data.token);

      setUser(res.data.user);

      return res.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  // Login
  const login = async (data) => {
    try {
      const res = await api.login(data);

      sessionStorage.setItem("token", res.data.token);

      // Ensure we have the complete user object with role
      const userData = res.data.user;
      setUser(userData);

      return res.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  // Logout
  const logout = () => {
    sessionStorage.removeItem("token");
    localStorage.removeItem("token");

    setUser(null);
  };

  // Update user data
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
