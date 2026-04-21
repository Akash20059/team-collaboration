import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { formatINR } from "@/lib/config";
import ghee from "@/assets/product-ghee.jpg";
import dhoopa from "@/assets/product-dhoopa.jpg";
import soap from "@/assets/product-soap.jpg";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  mrp: number | null;
  quantity_available: number;
  stock_status: "in_stock" | "low_stock" | "out_of_stock";
  image_url: string | null;
}

const FALLBACK = [ghee, dhoopa, soap];

const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Pure Desi Ghee",
    description: "Traditional A2 ghee made from Malenadu Gidda cow milk. Rich and aromatic.",
    price: 450,
    mrp: 500,
    quantity_available: 45,
    stock_status: "in_stock",
    image_url: null,
  },
  {
    id: "2",
    name: "Fresh Cow Milk",
    description: "Fresh, unpasteurized A2 cow milk from our healthy herd. 1 Liter.",
    price: 60,
    mrp: 70,
    quantity_available: 80,
    stock_status: "in_stock",
    image_url: null,
  },
  {
    id: "3",
    name: "Gomaya (Cow Dung Cakes)",
    description: "Pure dried cow dung cakes for rituals and agriculture. 100% natural.",
    price: 50,
    mrp: 60,
    quantity_available: 150,
    stock_status: "in_stock",
    image_url: null,
  },
  {
    id: "4",
    name: "Homemade Curd",
    description: "Thick, creamy traditional curd made from fresh desi cow milk. 500g.",
    price: 40,
    mrp: 50,
    quantity_available: 60,
    stock_status: "in_stock",
    image_url: null,
  },
  {
    id: "5",
    name: "Cow Butter",
    description: "Handmade butter from fresh cream of A2 milk. Rich in nutrients. 200g.",
    price: 180,
    mrp: 200,
    quantity_available: 35,
    stock_status: "low_stock",
    image_url: null,
  },
  {
    id: "6",
    name: "Cow Urine (Gomutra)",
    description: "Sterile, processed cow urine from healthy cows. 500ml bottle.",
    price: 120,
    mrp: 150,
    quantity_available: 25,
    stock_status: "low_stock",
    image_url: null,
  },
  {
    id: "7",
    name: "Paneer (Cow Milk)",
    description: "Fresh paneer made from pure desi cow milk. Soft and delicious. 250g.",
    price: 200,
    mrp: 250,
    quantity_available: 40,
    stock_status: "in_stock",
    image_url: null,
  },
  {
    id: "8",
    name: "Cow Dung Incense",
    description: "Natural incense sticks made with pure cow dung. 50 sticks per pack.",
    price: 80,
    mrp: 100,
    quantity_available: 90,
    stock_status: "in_stock",
    image_url: null,
  },
  {
    id: "9",
    name: "Whey Powder",
    description: "Nutritious whey powder from cow milk. Great for protein. 500g.",
    price: 280,
    mrp: 320,
    quantity_available: 55,
    stock_status: "in_stock",
    image_url: null,
  },
  {
    id: "10",
    name: "Desi Cow Milk Powder",
    description: "Pure milk powder from Malenadu Gidda cow milk. No additives. 250g.",
    price: 220,
    mrp: 260,
    quantity_available: 50,
    stock_status: "in_stock",
    image_url: null,
  },
];

export const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { add, setOpen } = useCart();

  useEffect(() => {
    supabase
      .from("products")
      .select("id, name, description, price, mrp, quantity_available, stock_status, image_url")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setProducts(data as Product[]);
        } else {
          // Use mock products as fallback for frontend development
          setProducts(MOCK_PRODUCTS);
        }
        setLoading(false);
      });
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p, i) => {
              const isOut = p.stock_status === "out_of_stock" || p.quantity_available <= 0;
              const isLow = p.stock_status === "low_stock" && p.quantity_available > 0;
              const img = p.image_url || FALLBACK[i % FALLBACK.length];
              return (
                <div key={p.id} className="group bg-card rounded-2xl overflow-hidden border border-border/60 shadow-soft hover:shadow-warm transition-smooth">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={img} alt={p.name} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {isOut && <span className="absolute top-3 right-3 bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-full">Out of Stock</span>}
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
