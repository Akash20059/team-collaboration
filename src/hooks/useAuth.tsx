import { createContext, useContext, useEffect, useState, ReactNode } from "react";

// ─── Hardcoded Admin Credentials ───────────────────────────────────────────
const ADMIN_USER = "shreematagomandira@gmail.com";
const ADMIN_PASS = "Goshala@123";
const AUTH_KEY = "admin_auth";

interface AuthCtx {
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const Ctx = createContext<AuthCtx>({
  isAuthenticated: false,
  loading: true,
  login: () => false,
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for existing session
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored === "true") {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = (username: string, password: string): boolean => {
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      localStorage.setItem(AUTH_KEY, "true");
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
  };

  return (
    <Ctx.Provider value={{ isAuthenticated, loading, login, logout }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => useContext(Ctx);
