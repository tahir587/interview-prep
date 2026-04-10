import React, { createContext, useState, useContext, useEffect } from "react";
import * as api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check user when app loads
  useEffect(() => {
    const checkAuth = async () => {
      // Clear any existing token to force logout on every page load
      localStorage.removeItem("token");
      
      // Don't auto-login - require login every time
      setLoading(false);
      return;
    };

    checkAuth();
  }, []);

  // Register
  const register = async (data) => {
    try {
      const res = await api.register(data);

      localStorage.setItem("token", res.data.token);

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

    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);

    return res.data;

  } catch (error) {

    throw error;
  }
};

  // Logout
  const logout = () => {
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
