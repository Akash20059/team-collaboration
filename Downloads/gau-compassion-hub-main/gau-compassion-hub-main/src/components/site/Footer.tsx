import logo from "@/assets/logo.png";
import { Mail, Phone, MapPin, Package } from "lucide-react";
import { Link } from "react-router-dom";

const sections = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "cows", label: "Our Cows" },
  { id: "donate", label: "Donate" },
  { id: "products", label: "Products" },
  { id: "connect", label: "Connect" },
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
    <footer className="bg-secondary text-secondary-foreground pt-16 pb-8">
      <div className="container-page grid md:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="h-14 w-14 object-contain" width={56} height={56} />
            <div>
              <div className="font-display text-xl font-bold">Shreemata Goumandira</div>
              <div className="font-sanskrit text-sm text-accent">श्रीमाता गौमंदिर</div>
            </div>
          </div>
          <p className="mt-4 text-sm text-secondary-foreground/80 leading-relaxed">
            A sacred shelter dedicated to conserving the endangered Malenadu Gidda cattle of the Western Ghats.
          </p>
        </div>

        <div>
          <h4 className="font-display text-lg font-bold mb-4">Quick Links</h4>
          <ul className="grid grid-cols-2 gap-2 text-sm">
            {sections.map((s) => (
              <li key={s.id}>
                <button onClick={() => go(s.id)} className="text-secondary-foreground/85 hover:text-accent transition-smooth">
                  {s.label}
                </button>
              </li>
            ))}
            <li>
              <Link to="/track-order" className="text-secondary-foreground/85 hover:text-accent transition-smooth flex items-center gap-1">
                <Package className="h-3 w-3" /> Track Order
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg font-bold mb-4">Contact</h4>
          <ul className="space-y-3 text-sm text-secondary-foreground/85">
            <li className="flex gap-2"><MapPin className="h-4 w-4 text-accent shrink-0 mt-0.5" /> Western Ghats, Karnataka, India</li>
            <li className="flex gap-2"><Phone className="h-4 w-4 text-accent shrink-0 mt-0.5" /> +91 91102 68570</li>
            <li className="flex gap-2"><Mail className="h-4 w-4 text-accent shrink-0 mt-0.5" /> info@goumandira.org</li>
          </ul>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-secondary-foreground/15 text-center text-xs text-secondary-foreground/70 flex flex-col sm:flex-row items-center justify-center gap-2">
        <span>© 2026 Shreemata Goumandira · Made with 🙏 for Gau Mata</span>
        <span className="opacity-50">·</span>
        <Link to="/auth" className="text-secondary-foreground/50 hover:text-accent transition-smooth">Admin</Link>
      </div>
    </footer>
  );
};
