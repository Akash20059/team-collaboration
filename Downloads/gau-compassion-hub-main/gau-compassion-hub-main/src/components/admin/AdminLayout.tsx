import { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, Cog as Cow, FileText, ShoppingBag, LogOut, Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/cows", label: "Our Cows", icon: Cow },
  { to: "/admin/blog", label: "Updates", icon: FileText },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
];

const SidebarContent = ({ onNav }: { onNav?: () => void }) => (
  <div className="h-full flex flex-col bg-secondary text-secondary-foreground">
    <div className="p-4 border-b border-secondary-foreground/15 flex items-center gap-2">
      <img src={logo} alt="" className="h-10 w-10 object-contain" />
      <div>
        <p className="font-display font-bold text-sm leading-tight">Goumandira</p>
        <p className="text-xs text-secondary-foreground/70">Admin Panel</p>
      </div>
    </div>
    <nav className="flex-1 p-3 space-y-1">
      {navItems.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          end={it.end}
          onClick={onNav}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-smooth",
              isActive ? "bg-primary text-primary-foreground font-medium" : "hover:bg-secondary-foreground/10",
            )
          }
        >
          <it.icon className="h-4 w-4" />
          {it.label}
        </NavLink>
      ))}
    </nav>
  </div>
);

export const AdminLayout = ({ children, title }: { children: ReactNode; title?: string }) => {
  const { signOut, user } = useAuth();
  const nav = useNavigate();

  const onLogout = async () => {
    await signOut();
    nav("/auth", { replace: true });
  };

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-60 shrink-0">
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-background border-b border-border flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <button className="lg:hidden p-2" aria-label="Open menu"><Menu className="h-5 w-5" /></button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-60">
                <SidebarContent />
              </SheetContent>
            </Sheet>
            <h1 className="font-display font-bold text-secondary text-base sm:text-lg truncate">
              {title || `Welcome, Admin 👋`}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-xs text-muted-foreground truncate max-w-[200px]">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={onLogout}>
              <LogOut className="h-3 w-3" /> Logout
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
};
