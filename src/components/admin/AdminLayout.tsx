import { ReactNode } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, FileText, LogOut, Menu, Heart, ShoppingBag } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";

const CustomCowIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 10a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z" />
    <path d="M3 13c3.13 1 6.87 2.5 9 2.5s5.87 -1.5 9 -2.5" />
    <path d="M5 20v2" />
    <path d="M19 20v2" />
    <path d="M6 10l-1.5 -3.5a1.5 1.5 0 0 1 1 -2z" />
    <path d="M18 10l1.5 -3.5a1.5 1.5 0 0 0 -1 -2z" />
    <path d="M9 10v-3l-2 -3" />
    <path d="M15 10v-3l2 -3" />
  </svg>
);

const navItems = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/cows", label: "Our Cows", icon: CustomCowIcon },
  { to: "/admin/blog", label: "Updates", icon: FileText },
  { to: "/admin/donors", label: "Donators", icon: Heart },
];

const SidebarContent = ({ onNav }: { onNav?: () => void }) => (
  <div className="h-full flex flex-col bg-secondary text-secondary-foreground">
    <Link to="/" className="p-4 border-b border-secondary-foreground/15 flex items-center gap-3 transition-opacity hover:opacity-80">
      <div className="h-11 w-11 rounded-full overflow-hidden shrink-0 border-[3px] border-primary bg-white">
        <img src={logo} alt="Goumandira" className="h-full w-full object-cover scale-105" />
      </div>
      <div>
        <p className="font-display font-bold text-sm leading-tight text-white">Goumandira</p>
        <p className="text-xs text-secondary-foreground/70">Admin Panel</p>
      </div>
    </Link>
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
  const { logout } = useAuth();
  const nav = useNavigate();

  const onLogout = () => {
    logout();
    nav("/admin/login", { replace: true });
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
            <span className="hidden sm:block text-xs text-muted-foreground">Admin</span>
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
