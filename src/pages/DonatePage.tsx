import { Navbar } from "@/components/site/Navbar";
import { Donate } from "@/components/site/Donate";
import { Footer } from "@/components/site/Footer";
import { Heart, Shield, Users } from "lucide-react";

const stats = [
  { icon: "🐄", value: "3+", label: "Sacred Cows Protected" },
  { icon: "🙏", value: "50+", label: "Devotee Donors" },
  { icon: "🌿", label: "100% Organic Fodder", value: "Pure" },
];

const DonatePage = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <Navbar />

    {/* Hero Banner */}
    <div className="relative pt-20 overflow-hidden bg-secondary">
      {/* Decorative circles */}
      <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-10 -left-10 h-60 w-60 rounded-full bg-accent/10 blur-2xl" />

      <div className="container-page relative z-10 py-16 text-center text-secondary-foreground">
        <p className="font-sanskrit text-accent text-xl mb-3">सेवा परमो धर्मः</p>
        <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight">
          Support Our Sacred Mission
        </h1>
        <p className="mt-4 text-secondary-foreground/75 max-w-2xl mx-auto text-lg">
          Your contribution feeds, shelters, and protects the endangered Malenadu Gidda — 
          one of India's most sacred and rare cattle breeds.
        </p>

        {/* Stats strip */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl mb-1">{s.icon}</div>
              <div className="font-display text-2xl font-bold text-accent">{s.value}</div>
              <div className="text-xs text-secondary-foreground/70 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Wave divider */}
      <svg viewBox="0 0 1440 60" className="w-full -mb-1 fill-background" preserveAspectRatio="none" height={60}>
        <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" />
      </svg>
    </div>

    {/* Trust badges */}
    <div className="bg-background border-b border-border/50">
      <div className="container-page py-5 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <span>Secure UPI Payment</span>
        </div>
        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4 text-primary" fill="currentColor" />
          <span>Donation Receipt via Email</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <span>50+ Donors Trust Us</span>
        </div>
      </div>
    </div>

    {/* Donate Section */}
    <main className="flex-1">
      <Donate />
    </main>

    <Footer />
  </div>
);

export default DonatePage;
