import { Navbar } from "@/components/site/Navbar";
import { Products } from "@/components/site/Products";
import { Footer } from "@/components/site/Footer";
import { ShoppingBag, Leaf, Award } from "lucide-react";

const ProductsPage = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <Navbar />

    {/* Hero Banner */}
    <div className="relative pt-20 overflow-hidden bg-secondary">
      <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      <div className="absolute -bottom-10 -left-10 h-60 w-60 rounded-full bg-primary/10 blur-2xl" />

      <div className="container-page relative z-10 py-16 text-center text-secondary-foreground">
        <p className="font-sanskrit text-accent text-xl mb-3">गौ उत्पाद</p>
        <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight">
          Pure Gau Products
        </h1>
        <p className="mt-4 text-secondary-foreground/75 max-w-2xl mx-auto text-lg">
          Handcrafted with love from our Malenadu Gidda cows — traditional A2 dairy and 
          ayurvedic products, pure as nature intended.
        </p>

        {/* Feature pills */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {["100% Pure A2", "No Chemicals", "Traditional Methods", "Sustainably Made"].map((tag) => (
            <span key={tag} className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm text-secondary-foreground/90 backdrop-blur-sm">
              ✓ {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Wave */}
      <svg viewBox="0 0 1440 60" className="w-full -mb-1 fill-background" preserveAspectRatio="none" height={60}>
        <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" />
      </svg>
    </div>

    {/* Trust badges */}
    <div className="bg-background border-b border-border/50">
      <div className="container-page py-5 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Leaf className="h-4 w-4 text-primary" />
          <span>Organic & Natural</span>
        </div>
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-primary" />
          <span>Traditionally Prepared</span>
        </div>
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-4 w-4 text-primary" />
          <span>Pan-India Delivery</span>
        </div>
      </div>
    </div>

    {/* Products Section */}
    <main className="flex-1">
      <Products />
    </main>

    <Footer />
  </div>
);

export default ProductsPage;
