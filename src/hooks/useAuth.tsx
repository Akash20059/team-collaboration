import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "@/lib/api";

const AUTH_KEY = "admin_auth_v2";

interface AuthCtx {
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx>({
  isAuthenticated: false,
  loading: true,
  login: async () => false,
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored === "true") {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await api.login(email, password);
      if (result.success) {
        localStorage.setItem(AUTH_KEY, "true");
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    localStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
    try { await api.logout(); } catch { /* ignore */ }
  };

  return (
    <Ctx.Provider value={{ isAuthenticated, loading, login, logout }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => useContext(Ctx);
