import { createContext, useEffect, useState } from "react";
import { getCurrentUser, logout as apiLogout } from "../api/auth";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await getCurrentUser();
      setUser(res.data);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const logout = async () => {
    try {
      await apiLogout();
    } catch (err) {}

    setUser(null);
    window.location.href = "/https://teqaconnect.com/login";
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};