import logo from "@/assets/logo.png";
import { Mail, Phone, MapPin, Package, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const quickLinks = [
  { id: "home",     label: "Home" },
  { id: "about",    label: "About Us" },
  { id: "cows",     label: "Our Cows" },
  { id: "donate",   label: "Donate" },
  { id: "products", label: "Products" },
  { id: "connect",  label: "Connect" },
];

const supportLinks = [
  { to: "/donators",    label: "Donators" },
  { to: "/my-orders",   label: "My Orders" },
  { to: "/track-order", label: "Track Order" },
  { to: "/admin/login", label: "Admin Login" },
];

export const Footer = () => {
  const go = (id: string) => {
    if (window.location.pathname !== "/") {
      window.location.href = `/#${id}`;
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="bg-secondary text-secondary-foreground">

      {/* Top divider strip */}
      <div className="h-1 w-full bg-gradient-to-r from-primary via-accent to-primary opacity-80" />

      {/* Main footer content */}
      <div className="container-page pt-14 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Column 1 — Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-14 w-14 rounded-full overflow-hidden shrink-0 border-[3px] border-accent">
                <img src={logo} alt="Shreemata Goumandira logo" className="h-full w-full object-cover scale-105" width={56} height={56} />
              </div>
              <div>
                <div className="font-display text-lg font-bold leading-tight">Shreemata Goumandira</div>
                <div className="font-sanskrit text-xs text-accent mt-0.5">श्रीमाता गौमंदिर</div>
              </div>
            </div>
            <p className="text-sm text-secondary-foreground/75 leading-relaxed">
              A sacred shelter dedicated to conserving the endangered Malenadu Gidda cattle of the Western Ghats — one cow at a time.
            </p>
            <div className="mt-5 flex items-center gap-1.5 text-xs text-accent font-medium">
              <Heart className="h-3.5 w-3.5" fill="currentColor" />
              <span>Serving Gau Mata since 2020</span>
            </div>
          </div>

          {/* Column 2 — Quick Links */}
          <div>
            <h4 className="font-display text-base font-bold mb-5 pb-2 border-b border-secondary-foreground/15">Quick Links</h4>
            <ul className="space-y-2.5">
              {quickLinks.map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => go(s.id)}
                    className="text-sm text-secondary-foreground/75 hover:text-accent transition-smooth flex items-center gap-2 group"
                  >
                    <span className="h-1 w-1 rounded-full bg-accent/50 group-hover:bg-accent transition-colors" />
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Support */}
          <div>
            <h4 className="font-display text-base font-bold mb-5 pb-2 border-b border-secondary-foreground/15">Support</h4>
            <ul className="space-y-2.5">
              {supportLinks.map((s) => (
                <li key={s.to}>
                  <Link
                    to={s.to}
                    className="text-sm text-secondary-foreground/75 hover:text-accent transition-smooth flex items-center gap-2 group"
                  >
                    <span className="h-1 w-1 rounded-full bg-accent/50 group-hover:bg-accent transition-colors" />
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Contact */}
          <div>
            <h4 className="font-display text-base font-bold mb-5 pb-2 border-b border-secondary-foreground/15">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
                  <MapPin className="h-4 w-4 text-accent" />
                </div>
                <span className="text-sm text-secondary-foreground/75 leading-snug pt-1">Western Ghats, Karnataka, India</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
                  <Phone className="h-4 w-4 text-accent" />
                </div>
                <a href="tel:+919110268570" className="text-sm text-secondary-foreground/75 hover:text-accent transition-smooth">
                  +91 91102 68570
                </a>
              </li>
              <li className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4 text-accent" />
                </div>
                <a href="mailto:info@goumandira.org" className="text-sm text-secondary-foreground/75 hover:text-accent transition-smooth">
                  info@goumandira.org
                </a>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-secondary-foreground/10">
        <div className="container-page py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-secondary-foreground/50">
          <span>© 2026 Shreemata Goumandira · Made with 🙏 for Gau Mata</span>
          <span>Protecting the sacred Malenadu Gidda breed</span>
        </div>
      </div>

    </footer>
  );
};
