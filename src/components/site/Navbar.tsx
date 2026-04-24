import logo from "@/assets/logo.png";
import { useEffect, useState } from "react";
import { Menu, X, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";

const links = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "cows", label: "Our Cows" },
  { id: "donate", label: "Donate" },
  { id: "products", label: "Products" },
  { id: "my-orders", label: "My Orders" },
  { id: "admin", label: "Admin" },
  { id: "connect", label: "Connect" },
];

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { count, setOpen: setCartOpen } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id: string) => {
    setOpen(false);
    if (id === "admin") {
      window.location.href = "/admin/login";
      return;
    }
    if (id === "my-orders") {
      window.location.href = "/my-orders";
      return;
    }
    if (id === "donators") {
      window.location.href = "/donators";
      return;
    }
    if (id === "donate") {
      window.location.href = "/donate";
      return;
    }
    if (id === "products") {
      window.location.href = "/products";
      return;
    }
    if (window.location.pathname !== "/") {
      window.location.href = `/#${id}`;
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all ${scrolled ? "bg-background/95 backdrop-blur shadow-soft" : "bg-background/70 backdrop-blur-sm"}`}>
      <div className="container-page flex items-center justify-between py-3">
        <button onClick={() => go("home")} className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full overflow-hidden shrink-0 border-[3px] border-[#D4540A]">
            <img src={logo} alt="Shreemata Goumandira logo" className="h-full w-full object-cover scale-105" width={40} height={40} />
          </div>
          <div className="text-left leading-tight">
            <div className="font-display text-base md:text-lg font-bold text-secondary whitespace-nowrap">Shreemata Goumandira</div>
            <div className="font-sanskrit text-xs text-primary hidden sm:block whitespace-nowrap">श्रीमाता गौमंदिर</div>
          </div>
        </button>

        <nav className="hidden lg:flex items-center gap-0.5">
          {links.map((l) => (
            <button key={l.id} onClick={() => go(l.id)} className="px-2 py-2 text-sm font-medium text-foreground/80 hover:text-primary transition-smooth whitespace-nowrap">
              {l.label}
            </button>
          ))}
          <Button onClick={() => go("donate")} variant="hero" size="sm" className="ml-2">
            Donate 🙏
          </Button>
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCartOpen(true)}
            className="relative p-2 text-secondary hover:text-primary transition-smooth"
            aria-label={`Open cart, ${count} items`}
          >
            <ShoppingCart className="h-6 w-6" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full h-5 min-w-5 px-1 flex items-center justify-center">
                {count}
              </span>
            )}
          </button>
          <button aria-label="Open menu" onClick={() => setOpen((v) => !v)} className="lg:hidden p-2 text-secondary">
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-background/98 backdrop-blur">
          <nav className="container-page py-3 flex flex-col">
            {links.map((l) => (
              <button key={l.id} onClick={() => go(l.id)} className="text-left px-2 py-3 text-base font-medium text-foreground/85 hover:text-primary border-b border-border/40 last:border-0">
                {l.label}
              </button>
            ))}
            <Button onClick={() => go("donate")} variant="hero" className="mt-3">
              Donate Now 🙏
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};
