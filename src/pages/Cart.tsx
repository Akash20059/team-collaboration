import { useCart } from "@/hooks/useCart";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Minus, Plus, Trash2, ShieldCheck, Info, Truck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { computeDelivery, formatINR, SITE_CONFIG } from "@/lib/config";

const Cart = () => {
  const { items, setQty, remove, subtotal, mrpTotal } = useCart();
  const nav = useNavigate();
  const delivery = computeDelivery(subtotal);
  const total = subtotal + delivery;
  const savings = mrpTotal - subtotal;
  const toFreeDelivery = SITE_CONFIG.delivery.free_above - subtotal;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-24">
          <div className="text-7xl mb-6">🛒</div>
          <h1 className="font-display text-3xl font-bold text-secondary">Your cart is empty</h1>
          <p className="text-muted-foreground mt-2 max-w-md">Discover our pure Gau products lovingly made in our gaushala.</p>
          <Button variant="hero" size="lg" className="mt-6" onClick={() => nav("/#products")}>
            Explore Our Products
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-32 lg:pb-12">
        <div className="container-page">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-secondary mb-6">Your Cart</h1>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Items */}
            <div className="lg:col-span-2 space-y-3">
              {items.map((it) => (
                <Card key={it.id} className="p-4 flex gap-4">
                  {it.image_url && <img src={it.image_url} alt={it.name} className="h-24 w-24 object-cover rounded-md shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-secondary">{it.name}</p>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-primary font-bold">{formatINR(it.price)}</span>
                      {it.mrp && it.mrp > it.price && (
                        <span className="text-xs text-muted-foreground line-through">{formatINR(it.mrp)}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center border border-border rounded-md">
                        <button onClick={() => setQty(it.id, it.quantity - 1)} className="p-2 hover:bg-muted" aria-label="Decrease">
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-3 text-sm font-medium">{it.quantity}</span>
                        <button onClick={() => setQty(it.id, it.quantity + 1)} disabled={it.quantity >= it.max_stock} className="p-2 hover:bg-muted disabled:opacity-40" aria-label="Increase">
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button onClick={() => remove(it.id)} className="text-destructive text-sm flex items-center gap-1 hover:underline">
                        <Trash2 className="h-3 w-3" /> Remove
                      </button>
                      <span className="ml-auto font-bold text-secondary">{formatINR(it.price * it.quantity)}</span>
                    </div>
                    {it.quantity >= it.max_stock && (
                      <p className="text-xs text-accent-foreground/80 mt-2">Maximum available stock reached</p>
                    )}
                  </div>
                </Card>
              ))}
              <Link to="/#products" className="text-primary hover:underline text-sm inline-block mt-2">← Continue Shopping</Link>
            </div>

            {/* Summary */}
            <div className="space-y-4">
              {/* Courier info notice */}
              <Card className="p-4 bg-accent/15 border-accent/40">
                <div className="flex gap-3 text-sm">
                  <Info className="h-5 w-5 text-accent-foreground shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Delivery via courier service</p>
                    <p className="text-muted-foreground mt-1">Tracking details will be shared on WhatsApp after dispatch. Estimated delivery: 5–7 business days.</p>
                  </div>
                </div>
              </Card>

              {toFreeDelivery > 0 && (
                <Card className="p-3 bg-primary/10 border-primary/30 text-sm flex items-center gap-2">
                  <Truck className="h-4 w-4 text-primary" />
                  <span>Add <b>{formatINR(toFreeDelivery)}</b> more for FREE delivery!</span>
                </Card>
              )}

              {/* Price breakdown */}
              <Card className="p-5 shadow-soft">
                <h2 className="font-display font-bold text-secondary mb-4">Price Details</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">MRP Total</span>
                    <span className={savings > 0 ? "line-through text-muted-foreground" : ""}>{formatINR(mrpTotal)}</span>
                  </div>
                  {savings > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="text-green-700">- {formatINR(savings)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Platform/Handling Fee</span>
                    <span className="text-green-700 font-medium">FREE</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Courier Delivery</span>
                    {delivery === 0 ? (
                      <span className="text-green-700 font-medium">FREE</span>
                    ) : (
                      <span>{formatINR(delivery)}</span>
                    )}
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between font-display text-lg font-bold text-secondary">
                    <span>Total Amount</span>
                    <span>{formatINR(total)}</span>
                  </div>
                  {savings > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-2 text-center text-green-800 text-sm font-medium">
                      ✅ You'll save {formatINR(savings)} on this order!
                    </div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-4 space-y-1">
                  <p>🚚 Estimated delivery: 5–7 business days via courier</p>
                  <p>Courier partner & tracking details shared after dispatch</p>
                </div>
                <Button variant="hero" className="w-full mt-4 hidden lg:flex" size="lg" onClick={() => nav("/checkout/address")}>
                  Proceed to Checkout
                </Button>
              </Card>

              <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>Safe payments · Genuine Gau Products · Trusted Courier Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky bottom bar (mobile) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-background border-t border-border shadow-warm">
        <div className="container-page py-3 flex items-center gap-3">
          <div className="flex-1">
            {savings > 0 && <div className="text-xs text-muted-foreground line-through">{formatINR(mrpTotal)}</div>}
            <div className="font-display text-lg font-bold text-secondary">{formatINR(total)}</div>
          </div>
          <Button variant="hero" size="lg" onClick={() => nav("/checkout/address")} className="flex-1">
            Place Order →
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Cart;
