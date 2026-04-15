import { createContext, useEffect, useState } from "react";
import { getCurrentUser } from "../api/auth";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = async () => {
    try {
      await fetch("https://auth.teqaconnect.com/auth/logout/", {
        method: "POST",
        credentials: "include", 
      });
    } catch (err) {
      console.log("Logout error:", err);
    }

    localStorage.clear();
    sessionStorage.clear();
    setUser(null);

    window.location.href = "/login";
  };

  const loadUser = async () => {
    try {
      const res = await getCurrentUser();
      const userData = res.data;

      if (userData.role !== "STORE") {
        await logout();
        return;
      }

      setUser(userData);

    } catch (err) {
      console.log("ERROR:", err.response?.status);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};