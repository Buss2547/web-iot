import React, { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getStoredUser());
  const [token, setToken] = useState(() => authService.getStoredToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifySession() {
      const storedToken = authService.getStoredToken();
      if (storedToken) {
        try {
          const profile = await authService.getCurrentUser();
          setUser(profile);
          setToken(storedToken);
        } catch {
          // Token invalid or expired
          authService.logout();
          setUser(null);
          setToken(null);
        }
      } else {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    }

    verifySession();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    setToken(data.access_token);
    return data;
  };

  const signup = async (formData) => {
    return await authService.signup(formData);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    loading,
    login,
    signup,
    logout,
    refreshUser: async () => {
      try {
        const profile = await authService.getCurrentUser();
        setUser(profile);
      } catch {
        logout();
      }
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
