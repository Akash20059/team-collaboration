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
              <Card className="p-4 shadow-sm border-border/60 text-[15px]">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>MRP</span>
                    <span className="text-secondary">{formatINR(mrpTotal)}</span>
                  </div>
                  <div className="border-b border-border/50 border-dashed" />
                  
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span className="flex items-center gap-1">Fees <span className="text-[10px]">v</span></span>
                    <span className="text-secondary">{delivery === 0 ? "₹0" : formatINR(delivery)}</span>
                  </div>
                  <div className="border-b border-border/50 border-dashed" />
                  
                  {savings > 0 && (
                    <>
                      <div className="flex justify-between items-center text-muted-foreground">
                        <span className="flex items-center gap-1">Discounts <span className="text-[10px]">v</span></span>
                        <span className="text-green-700">- {formatINR(savings)}</span>
                      </div>
                      <div className="border-b border-border/50 border-dashed" />
                    </>
                  )}
                  
                  <div className="flex justify-between items-center font-bold text-base text-secondary pt-1">
                    <span>Total Amount</span>
                    <span>{formatINR(total)}</span>
                  </div>
                  
                  {savings > 0 && (
                    <div className="bg-[#e5f7ed] rounded-md p-3 mt-4 text-center text-[#11883e] text-sm font-medium flex items-center justify-center gap-1.5">
                      <div className="bg-[#11883e] text-white rounded-sm text-[10px] w-4 h-4 flex items-center justify-center font-bold">%</div> 
                      You'll save {formatINR(savings)} on this order!
                    </div>
                  )}
                </div>
                <Button className="w-full mt-5 hidden lg:block bg-[#ffc200] hover:bg-[#f3b600] text-black font-semibold text-[15px]" size="lg" onClick={() => nav("/checkout/address")}>
                  Place Order
                </Button>
              </Card>

              <div className="flex items-center gap-4 mt-6 px-2 opacity-80">
                <ShieldCheck className="h-8 w-8 text-muted-foreground shrink-0" strokeWidth={1.5} />
                <span className="text-xs text-muted-foreground font-medium leading-relaxed">Safe and secure payments. Easy returns. 100% Authentic products.</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky bottom bar (mobile) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <div className="container-page py-3 px-4 flex items-center justify-between gap-4">
          <div>
            {savings > 0 && <div className="text-xs text-muted-foreground line-through decoration-muted-foreground/60">{formatINR(mrpTotal)}</div>}
            <div className="font-bold text-lg text-secondary flex items-center gap-1.5 leading-none">
              {formatINR(total)} <Info className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </div>
          <Button 
            className="flex-1 max-w-[160px] bg-[#ffc200] hover:bg-[#f3b600] text-black font-semibold text-[15px] rounded border border-transparent shadow-none" 
            size="lg" 
            onClick={() => nav("/checkout/address")}
          >
            Place Order
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Cart;
