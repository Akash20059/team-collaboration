import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Lock, User } from "lucide-react";
import logo from "@/assets/logo.png";

const AdminLogin = () => {
  const nav = useNavigate();
  const { isAuthenticated, loading, login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      nav("/admin", { replace: true });
    }
  }, [isAuthenticated, loading, nav]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("Please enter both email and password");
      return;
    }
    setBusy(true);
    try {
      const ok = await login(username.trim(), password);
      if (ok) {
        toast.success("Welcome, Admin 🙏");
        nav("/admin", { replace: true });
      } else {
        toast.error("Invalid credentials. Please try again.");
      }
    } catch {
      toast.error("Could not connect to server. Is the backend running?");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-warm flex items-center justify-center p-4">
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md p-8 shadow-warm relative z-10 border-primary/10">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-20 w-20 rounded-full overflow-hidden border-[3px] border-primary/30 shadow-lg mb-4">
            <img src={logo} alt="Shreemata Goumandira" className="h-full w-full object-cover scale-105" />
          </div>
          <p className="font-sanskrit text-primary text-lg">श्रीमाता गौमंदिर</p>
          <h1 className="font-display text-2xl font-bold text-secondary mt-1">Admin Panel</h1>
          <p className="text-sm text-muted-foreground mt-2">Sign in to manage your gaushala</p>
        </div>

        {/* Login Form */}
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="admin-username" className="text-sm font-medium">Email</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="admin-username"
                type="text"
                autoComplete="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter email"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-password" className="text-sm font-medium">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="pl-10"
                required
              />
            </div>
          </div>

          <Button type="submit" variant="hero" className="w-full text-base py-5" disabled={busy}>
            {busy && <Loader2 className="animate-spin mr-2" />}
            {busy ? "Signing in…" : "Sign In"}
          </Button>
        </form>

        {/* Footer hint */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground/60">🔒 Authorized personnel only</p>
        </div>
      </Card>
    </div>
  );
};

export default AdminLogin;
