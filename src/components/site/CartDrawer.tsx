import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { computeDelivery, formatINR } from "@/lib/config";

export const CartDrawer = () => {
  const { open, setOpen, items, setQty, remove, subtotal, mrpTotal } = useCart();
  const nav = useNavigate();
  const delivery = computeDelivery(subtotal);
  const total = subtotal + delivery;
  const savings = mrpTotal - subtotal;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-display text-xl text-secondary flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" /> Your Cart ({items.length})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="text-6xl mb-4">🛒</div>
            <p className="font-display text-lg text-secondary">Your cart is empty</p>
            <p className="text-sm text-muted-foreground mt-1">Add some sacred Gau products</p>
            <Button variant="hero" className="mt-6" onClick={() => setOpen(false)}>
              Explore Products
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-3 -mx-6 px-6">
              {items.map((it) => (
                <div key={it.id} className="flex gap-3 bg-muted/30 rounded-lg p-3">
                  {it.image_url && (
                    <img src={it.image_url} alt={it.name} className="h-16 w-16 object-cover rounded-md" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-secondary truncate">{it.name}</p>
                    <p className="text-primary font-bold text-sm">{formatINR(it.price)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => setQty(it.id, it.quantity - 1)} className="h-7 w-7 rounded border border-border flex items-center justify-center hover:bg-muted" aria-label="Decrease">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm font-medium w-6 text-center">{it.quantity}</span>
                      <button onClick={() => setQty(it.id, it.quantity + 1)} disabled={it.quantity >= it.max_stock} className="h-7 w-7 rounded border border-border flex items-center justify-center hover:bg-muted disabled:opacity-40" aria-label="Increase">
                        <Plus className="h-3 w-3" />
                      </button>
                      <button onClick={() => remove(it.id)} className="ml-auto text-destructive hover:bg-destructive/10 h-7 w-7 rounded flex items-center justify-center" aria-label="Remove">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              {savings > 0 && (
                <div className="flex justify-between text-xs text-green-700"><span>You save</span><span>{formatINR(savings)}</span></div>
              )}
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="font-medium">{formatINR(subtotal)}</span></div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                <span className={delivery === 0 ? "text-green-700 font-medium" : "font-medium"}>{delivery === 0 ? "FREE" : formatINR(delivery)}</span>
              </div>
              <div className="flex justify-between font-display text-lg font-bold text-secondary pt-2 border-t border-border">
                <span>Total</span><span>{formatINR(total)}</span>
              </div>
              <Button variant="hero" className="w-full mt-3" onClick={() => { setOpen(false); nav("/cart"); }}>
                View Cart & Checkout
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
