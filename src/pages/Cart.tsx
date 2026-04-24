import { useEffect, useState } from "react";
import { useCart } from "@/hooks/useCart";
import { Navbar } from "@/components/site/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Minus, Plus, Trash2, ArrowLeft, ChevronRight, ChevronDown,
  ChevronUp, MapPin, Phone, User, Loader2, Receipt,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { computeDelivery, formatINR } from "@/lib/config";
import { getSavedAddress, saveAddress, SavedAddress } from "@/lib/savedAddress";
import { addMyOrderId } from "@/lib/myOrders";
import { addCustomerOrder } from "@/lib/adminStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

/* ─── Device detection ─── */
const isMobileDevice = () =>
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

/* ─── UPI app definitions ─── */
type UpiApp = { id: string; name: string; scheme: string; bg: string; initial: string };

const RECOMMENDED_APPS: UpiApp[] = [
  { id: "bhim",   name: "BHIM UPI",       scheme: "upi",     bg: "bg-orange-600",  initial: "B"  },
  { id: "paytm",  name: "Paytm UPI",      scheme: "paytmmp", bg: "bg-sky-500",     initial: "P"  },
  { id: "gpay",   name: "Google Pay UPI", scheme: "tez",     bg: "bg-emerald-600", initial: "G"  },
];

const OTHER_APPS: UpiApp[] = [
  { id: "phonepe",   name: "PhonePe UPI",   scheme: "phonepe", bg: "bg-violet-700",  initial: "Ph" },
  { id: "amazonpay", name: "Amazon Pay UPI",scheme: "upi",     bg: "bg-slate-800",   initial: "A"  },
  { id: "navi",      name: "Navi UPI",      scheme: "upi",     bg: "bg-indigo-700",  initial: "N"  },
];

const ALL_APPS = [...RECOMMENDED_APPS, ...OTHER_APPS];

/* ─── Validation ─── */
const addressSchema = z.object({
  full_name:    z.string().trim().min(2, "Enter your name"),
  mobile:       z.string().regex(/^[0-9]{10}$/, "Enter a valid 10-digit mobile number"),
  address_line1:z.string().trim().min(5, "Enter your delivery address"),
  pincode:      z.string().regex(/^[0-9]{6}$/, "Enter a 6-digit pincode"),
});

/* ─── UPI app row ─── */
function AppRow({ app, active, onSelect }: { app: UpiApp; active: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors border-b border-border/50 last:border-0 ${
        active ? "bg-primary/5" : "hover:bg-muted/50"
      }`}
    >
      <div className={`h-10 w-10 rounded-lg ${app.bg} text-white grid place-items-center text-[11px] font-bold shrink-0`}>
        {app.initial}
      </div>
      <span className="flex-1 font-medium text-[15px] text-foreground">{app.name}</span>
      {active && <div className="h-2 w-2 rounded-full bg-primary" />}
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}

/* ─── Main component ─── */
const Cart = () => {
  const { items, setQty, remove, subtotal, mrpTotal, clear } = useCart();
  const nav = useNavigate();

  const delivery = computeDelivery(subtotal);
  const total    = subtotal + delivery;
  const savings  = mrpTotal - subtotal;

  const [form, setForm] = useState<SavedAddress>({
    full_name: "", mobile: "", pincode: "", address_line1: "",
    address_line2: "", city: "", state: "", landmark: "",
  });
  const [deliveryOpen,  setDeliveryOpen]  = useState(false);
  const [billOpen,      setBillOpen]      = useState(false);
  const [paymentOpen,   setPaymentOpen]   = useState(false);
  const [selectedApp,   setSelectedApp]   = useState<string>("gpay");
  const [busy,          setBusy]          = useState(false);
  const isMobile = isMobileDevice();

  useEffect(() => {
    const s = getSavedAddress();
    if (s) { setForm(s); }
  }, []);

  /* ─── Empty state ─── */
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-24">
          <div className="text-7xl mb-6">🛒</div>
          <h1 className="font-display text-3xl font-bold text-secondary">Your cart is empty</h1>
          <p className="text-muted-foreground mt-2 max-w-md">
            Discover our pure Gau products lovingly made in our gaushala.
          </p>
          <Button variant="hero" size="lg" className="mt-6" onClick={() => nav("/#products")}>
            Explore Our Products
          </Button>
        </main>
      </div>
    );
  }

  /* ─── Place order ─── */
  const handlePlaceOrder = async () => {
    const parsed = addressSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      if (!deliveryOpen) setDeliveryOpen(true);
      return;
    }
    // On desktop we use QR code flow; on mobile we use UPI intent flow
    const effectiveAppId = isMobile ? selectedApp : "desktop_qr";
    const app = isMobile ? ALL_APPS.find((a) => a.id === selectedApp) : { id: "desktop_qr", name: "UPI QR Code" };
    if (!app) { toast.error("Please choose a UPI app"); return; }

    setBusy(true);
    try {
      const orderItems = items.map((i) => ({
        id: i.id, name: i.name, price: i.price, quantity: i.quantity, image_url: i.image_url,
      }));

      const { data, error } = await supabase
        .from("orders")
        .insert({
          customer_name:    form.full_name,
          customer_mobile:  form.mobile,
          address_line1:    form.address_line1,
          address_line2:    form.address_line2 || null,
          city:             form.city || "—",
          state:            form.state || "—",
          pincode:          form.pincode,
          landmark:         form.landmark || null,
          items:            orderItems,
          subtotal,
          delivery_charge:  delivery,
          discount:         Math.max(0, mrpTotal - subtotal),
          total_amount:     total,
          payment_method:   "upi",
          payment_reference: isMobile ? `Opened ${app.name}` : "Desktop QR pending",
        })
        .select("order_id")
        .single();

      if (error) throw error;
      saveAddress(form);
      addMyOrderId(data.order_id);

      // ── Save to admin localStorage order store ──
      addCustomerOrder({
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        order_id: data.order_id,
        customer_name: form.full_name,
        mobile: form.mobile,
        address_line1: form.address_line1,
        city: form.city || "—",
        state: form.state || "—",
        pincode: form.pincode,
        items: items.map((i) => ({ name: i.name, qty: i.quantity, price: i.price })),
        total_amount: total,
        delivery_charge: delivery,
        status: "pending",
        placed_at: new Date().toISOString(),
      });

      clear();

      // Go to payment page; UPI intent (mobile) or QR code (desktop)
      nav(`/checkout/pay/${data.order_id}`, {
        state: { appId: effectiveAppId, appName: app.name, total },
      });
    } catch (err: any) {
      toast.error(err.message || "Could not place order");
    } finally {
      setBusy(false);
    }
  };

  const activeApp = ALL_APPS.find((a) => a.id === selectedApp)!;
  const hasAddress = form.full_name && form.address_line1 && form.mobile && form.pincode;

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20 pb-28">
        <div className="container-page max-w-2xl">

          {/* ── Header ── */}
          <div className="flex items-center gap-3 py-4">
            <button onClick={() => nav(-1)} aria-label="Back" className="p-1 -ml-1 hover:bg-muted rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">
              Bill total: <span className="font-bold text-secondary">{formatINR(total)}</span>
            </h1>
          </div>

          {/* ── Items ── */}
          <div className="bg-white rounded-xl shadow-sm mb-3">
            <div className="divide-y divide-border/50">
              {items.map((it) => (
                <div key={it.id} className="flex items-center gap-3 px-4 py-3">
                  {it.image_url
                    ? <img src={it.image_url} alt={it.name} className="h-12 w-12 object-cover rounded-md shrink-0" />
                    : <div className="h-12 w-12 rounded-md bg-muted shrink-0" />
                  }
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[14px] text-foreground leading-tight truncate">{it.name}</p>
                    {it.mrp && it.mrp > it.price && (
                      <p className="text-[11px] text-muted-foreground line-through">{formatINR(it.mrp)}</p>
                    )}
                  </div>
                  {/* Qty stepper */}
                  <div className="flex items-center border border-primary rounded-md text-primary text-sm shrink-0">
                    <button
                      onClick={() => (it.quantity <= 1 ? remove(it.id) : setQty(it.id, it.quantity - 1))}
                      className="px-2 py-1 hover:bg-primary/10"
                      aria-label="Decrease"
                    >
                      {it.quantity <= 1 ? <Trash2 className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                    </button>
                    <span className="px-2 font-semibold w-6 text-center">{it.quantity}</span>
                    <button
                      onClick={() => setQty(it.id, it.quantity + 1)}
                      disabled={it.quantity >= it.max_stock}
                      className="px-2 py-1 hover:bg-primary/10 disabled:opacity-40"
                      aria-label="Increase"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <span className="w-16 text-right font-semibold text-[14px] text-secondary shrink-0">
                    {formatINR(it.price * it.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 border-t border-border/50">
              <Link
                to="/#products"
                className="inline-flex items-center gap-1 text-primary text-sm font-medium hover:underline"
              >
                <Plus className="h-4 w-4" /> Add more items
              </Link>
            </div>
          </div>

          {/* ── Delivery details (collapsible) ── */}
          <div className="bg-white rounded-xl shadow-sm mb-3 overflow-hidden">
            <button
              type="button"
              onClick={() => setDeliveryOpen((v) => !v)}
              className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-muted/30 transition-colors"
            >
              <MapPin className="h-5 w-5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                {hasAddress ? (
                  <>
                    <p className="text-[13px] font-semibold text-foreground">
                      {form.full_name}
                      <span className="font-normal text-muted-foreground"> &nbsp;•&nbsp; +91-{form.mobile}</span>
                    </p>
                    <p className="text-[12px] text-muted-foreground truncate mt-0.5">
                      {form.address_line1}{form.pincode ? ` - ${form.pincode}` : ""}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-[13px] font-semibold text-foreground">Delivery address</p>
                    <p className="text-[12px] text-primary">Tap to add your address</p>
                  </>
                )}
              </div>
              {deliveryOpen
                ? <ChevronUp   className="h-4 w-4 text-muted-foreground shrink-0" />
                : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
              }
            </button>

            {deliveryOpen && (
              <div className="px-4 pb-4 border-t border-border/40 space-y-3 pt-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="name" className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                      <User className="h-3 w-3" /> Full name *
                    </Label>
                    <Input
                      id="name"
                      value={form.full_name}
                      onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                      placeholder="Your name"
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <Label htmlFor="mobile" className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                      <Phone className="h-3 w-3" /> Mobile *
                    </Label>
                    <Input
                      id="mobile"
                      type="tel"
                      inputMode="numeric"
                      value={form.mobile}
                      onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                      placeholder="10-digit number"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="addr" className="text-xs text-muted-foreground mb-1 block">
                    Delivery address *
                  </Label>
                  <Input
                    id="addr"
                    value={form.address_line1}
                    onChange={(e) => setForm({ ...form, address_line1: e.target.value })}
                    placeholder="House no, street, area, city, state"
                    maxLength={200}
                  />
                </div>
                <div>
                  <Label htmlFor="pincode" className="text-xs text-muted-foreground mb-1 block">Pincode *</Label>
                  <Input
                    id="pincode"
                    inputMode="numeric"
                    value={form.pincode}
                    onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                    placeholder="6-digit pincode"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setDeliveryOpen(false)}
                  className="w-full text-center text-sm text-primary font-medium py-1"
                >
                  Save & close ↑
                </button>
              </div>
            )}
          </div>

          {/* ── Total bill (collapsible) ── */}
          <div className="bg-white rounded-xl shadow-sm mb-3 overflow-hidden">
            <button
              type="button"
              onClick={() => setBillOpen((v) => !v)}
              className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-muted/30 transition-colors"
            >
              <Receipt className="h-5 w-5 text-primary shrink-0" />
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-foreground">Total Bill {formatINR(total)}</p>
                <p className="text-[12px] text-muted-foreground">Incl. delivery charges</p>
              </div>
              {billOpen
                ? <ChevronUp   className="h-4 w-4 text-muted-foreground shrink-0" />
                : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
              }
            </button>

            {billOpen && (
              <div className="px-4 pb-4 border-t border-border/40 pt-3 text-[13px] space-y-2">
                {items.map((it) => (
                  <div key={it.id} className="flex justify-between text-muted-foreground">
                    <span>{it.name} <span className="text-xs">× {it.quantity}</span></span>
                    <span className="font-medium text-foreground">{formatINR(it.price * it.quantity)}</span>
                  </div>
                ))}
                <div className="border-t border-dashed border-border/60 pt-2 space-y-1.5">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Item total</span>
                    <span>{formatINR(subtotal)}</span>
                  </div>
                  {savings > 0 && (
                    <div className="flex justify-between text-green-700">
                      <span>Discount</span>
                      <span>− {formatINR(savings)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery charge</span>
                    <span>{delivery === 0 ? "FREE" : formatINR(delivery)}</span>
                  </div>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-bold text-secondary text-[14px]">
                  <span>Total</span>
                  <span>{formatINR(total)}</span>
                </div>
                {savings > 0 && (
                  <div className="bg-green-50 text-green-700 text-[12px] rounded-lg px-3 py-2 text-center font-medium">
                    You save {formatINR(savings)} on this order!
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </main>

      {/* ── Sticky bottom bar ── */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-border shadow-[0_-2px_12px_rgba(0,0,0,0.08)]">
        <div className="container-page max-w-2xl flex items-center gap-2 py-2.5">
          {/* Left: pay using ── mobile shows app picker, desktop shows QR label */}
          {isMobile ? (
            <button
              type="button"
              onClick={() => setPaymentOpen(true)}
              className="flex flex-col items-start min-w-0 flex-1 px-1 py-1 rounded-lg hover:bg-muted/40 transition-colors"
            >
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold flex items-center gap-0.5">
                Pay using <ChevronUp className="h-3 w-3" />
              </span>
              <span className="text-[13px] font-semibold text-secondary truncate leading-tight">{activeApp.name}</span>
            </button>
          ) : (
            <div className="flex flex-col items-start min-w-0 flex-1 px-1 py-1">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                Pay via
              </span>
              <span className="text-[13px] font-semibold text-secondary truncate leading-tight flex items-center gap-1">
                📱 UPI QR Code
              </span>
            </div>
          )}

          {/* Divider */}
          <div className="w-px h-9 bg-border/70 shrink-0" />

          {/* Right: total + place order */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right">
              <div className="text-[13px] font-bold text-secondary leading-none">{formatINR(total)}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Total</div>
            </div>
            <Button
              onClick={handlePlaceOrder}
              disabled={busy}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 h-10 rounded-lg"
            >
              {busy
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <span className="flex items-center gap-1">Place Order <ChevronRight className="h-4 w-4" /></span>
              }
            </Button>
          </div>
        </div>
      </div>

      {/* ── Payment method sheet (slides up from bottom) ── */}
      <Sheet open={paymentOpen} onOpenChange={setPaymentOpen}>
        <SheetContent
          side="bottom"
          className="p-0 rounded-t-2xl max-h-[85vh] overflow-y-auto"
        >
          {/* Sheet header */}
          <div className="px-5 pt-5 pb-3 border-b border-border/60">
            <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />
            <p className="text-[13px] text-muted-foreground font-medium">
              Bill total: <span className="font-bold text-secondary">{formatINR(total)}</span>
            </p>
          </div>

          {/* Recommended */}
          <div className="px-4 pt-4">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold mb-2 px-1">
              Recommended
            </p>
            <div className="rounded-xl border border-border/70 overflow-hidden bg-white">
              {RECOMMENDED_APPS.map((app) => (
                <AppRow
                  key={app.id}
                  app={app}
                  active={selectedApp === app.id}
                  onSelect={() => { setSelectedApp(app.id); setPaymentOpen(false); }}
                />
              ))}
            </div>
          </div>

          {/* Other UPI apps */}
          <div className="px-4 pt-4 pb-6">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold mb-2 px-1">
              Pay by any UPI app
            </p>
            <div className="rounded-xl border border-border/70 overflow-hidden bg-white">
              {OTHER_APPS.map((app) => (
                <AppRow
                  key={app.id}
                  app={app}
                  active={selectedApp === app.id}
                  onSelect={() => { setSelectedApp(app.id); setPaymentOpen(false); }}
                />
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>

    </div>
  );
};

export default Cart;
