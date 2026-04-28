import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { formatINR } from "@/lib/config";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  mrp: number;
  quantity_available: number;
  stock_status: "in_stock" | "low_stock" | "out_of_stock";
  image_url: string | null;
}

export const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { add, setOpen } = useCart();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await api.getProducts();
        setProducts(data);
      } catch (e: any) {
        console.error("Failed to load products", e);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const onAdd = (p: Product) => {
    add({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      mrp: p.mrp ? Number(p.mrp) : null,
      image_url: p.image_url,
      max_stock: p.quantity_available,
    });
    toast.success(`✅ ${p.name} added to cart!`);
    setOpen(true);
  };

  return (
    <section id="products" className="section-pad bg-background">
      <div className="container-page">
        <div className="text-center mb-12">
          <p className="font-sanskrit text-primary text-lg">गौ उत्पाद</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-secondary">Pure Gau Products</h2>
          <div className="divider-lotus"><span className="text-primary text-xl">🌿</span></div>
          <p className="text-muted-foreground max-w-2xl mx-auto">Made with love from our Malenadu Gidda cows.</p>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground py-12">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">No products yet. Check back soon 🙏</div>
        ) : (
          <div className="
            flex overflow-x-auto snap-x snap-mandatory gap-5 pb-4 -mx-4 px-4
            scrollbar-none
            lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible lg:mx-0 lg:px-0 lg:pb-0
          ">
            {products.map((p) => {
              const isOut = p.stock_status === "out_of_stock" || p.quantity_available <= 0;
              const isLow = p.stock_status === "low_stock" && p.quantity_available > 0;
              return (
                <div key={p.id} className="group bg-card rounded-2xl overflow-hidden border border-border/60 shadow-soft hover:shadow-warm transition-smooth snap-center shrink-0 w-[80vw] lg:w-auto">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="h-full w-full bg-muted flex items-center justify-center text-4xl">📦</div>
                    )}
                    {isOut && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-destructive text-destructive-foreground text-sm px-4 py-2 rounded-full font-semibold">Currently Unavailable</span>
                      </div>
                    )}
                    {isLow && <span className="absolute top-3 right-3 bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full font-semibold">Only {p.quantity_available} left!</span>}
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-xl font-bold text-secondary">{p.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1 min-h-[40px]">{p.description}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-primary text-lg">{formatINR(Number(p.price))}</span>
                        {p.mrp && Number(p.mrp) > Number(p.price) && (
                          <span className="ml-2 text-xs text-muted-foreground line-through">{formatINR(Number(p.mrp))}</span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="hero"
                      size="sm"
                      className="w-full mt-3"
                      disabled={isOut}
                      onClick={() => onAdd(p)}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      {isOut ? "Out of Stock" : isLow ? `Add to Cart — Only ${p.quantity_available} left!` : "Add to Cart"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
