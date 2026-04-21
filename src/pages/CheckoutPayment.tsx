import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { CheckoutSteps } from "@/components/checkout/CheckoutSteps";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/hooks/useCart";
import { SavedAddress } from "@/lib/savedAddress";
import { computeDelivery, formatINR, SITE_CONFIG } from "@/lib/config";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Copy, Loader2 } from "lucide-react";

const ADDR_KEY = "goumandira_checkout_addr";

const CheckoutPayment = () => {
  const nav = useNavigate();
  const { items, subtotal, mrpTotal, clear } = useCart();
  const [address, setAddress] = useState<SavedAddress | null>(null);
  const [method, setMethod] = useState<"upi" | "bank_transfer" | "cod">("upi");
  const [paymentRef, setPaymentRef] = useState("");
  const [busy, setBusy] = useState(false);

  const delivery = computeDelivery(subtotal);
  const total = subtotal + delivery;

  useEffect(() => {
    if (items.length === 0) {
      nav("/cart", { replace: true });
      return;
    }
    const raw = sessionStorage.getItem(ADDR_KEY);
    if (!raw) {
      nav("/checkout/address", { replace: true });
      return;
    }
    setAddress(JSON.parse(raw));
  }, []);

  const upiLink = `upi://pay?pa=${encodeURIComponent(SITE_CONFIG.upiId)}&pn=${encodeURIComponent(SITE_CONFIG.upiName)}&am=${total}&cu=INR&tn=${encodeURIComponent("Goumandira Order")}`;

  const onConfirm = async () => {
    if (!address) return;
    if (method === "upi" && !paymentRef.trim()) {
      toast.error("Please enter UTR / Transaction reference");
      return;
    }
    setBusy(true);
    try {
      const orderItems = items.map((i) => ({
        id: i.id, name: i.name, price: i.price, quantity: i.quantity, image_url: i.image_url,
      }));
      const { data, error } = await supabase
        .from("orders")
        .insert({
          customer_name: address.full_name,
          customer_mobile: address.mobile,
          address_line1: address.address_line1,
          address_line2: address.address_line2 || null,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          landmark: address.landmark || null,
          items: orderItems,
          subtotal,
          delivery_charge: delivery,
          discount: Math.max(0, mrpTotal - subtotal),
          total_amount: total,
          payment_method: method,
          payment_reference: method === "upi" ? paymentRef.trim() : null,
        })
        .select("order_id")
        .single();

      if (error) throw error;

      // WhatsApp notify owner
      const msg = `🙏 New Order: ${data.order_id}%0A👤 ${address.full_name} (${address.mobile})%0A📍 ${address.city}, ${address.state} - ${address.pincode}%0A💰 Total: ${formatINR(total)}%0A💳 ${method.toUpperCase()}${method === "upi" ? ` (UTR: ${paymentRef})` : ""}%0A%0AItems:%0A${items.map((i) => `• ${i.name} x ${i.quantity}`).join("%0A")}`;
      window.open(`https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${msg}`, "_blank");

      clear();
      sessionStorage.removeItem(ADDR_KEY);
      nav(`/order-confirmed/${data.order_id}`);
    } catch (err: any) {
      toast.error(err.message || "Could not place order");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-12">
        <div className="container-page">
          <CheckoutSteps step={3} />

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Payment */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="p-6">
                <h1 className="font-display text-xl font-bold text-secondary mb-4">Payment Method</h1>
                <RadioGroup value={method} onValueChange={(v) => setMethod(v as any)} className="space-y-3">
                  <label className="flex items-start gap-3 p-3 border border-border rounded-lg cursor-pointer hover:border-primary">
                    <RadioGroupItem value="upi" id="upi" className="mt-1" />
                    <div className="flex-1">
                      <p className="font-medium text-secondary">UPI Payment (Recommended)</p>
                      <p className="text-xs text-muted-foreground">Scan QR or pay to UPI ID, then enter UTR</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 p-3 border border-border rounded-lg cursor-pointer hover:border-primary">
                    <RadioGroupItem value="bank_transfer" id="bank" className="mt-1" />
                    <div className="flex-1">
                      <p className="font-medium text-secondary">Bank Transfer</p>
                      <p className="text-xs text-muted-foreground">NEFT / IMPS / RTGS</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 p-3 border border-border rounded-lg cursor-pointer hover:border-primary">
                    <RadioGroupItem value="cod" id="cod" className="mt-1" />
                    <div className="flex-1">
                      <p className="font-medium text-secondary">Cash on Delivery</p>
                      <p className="text-xs text-muted-foreground">Pay courier on delivery</p>
                    </div>
                  </label>
                </RadioGroup>
              </Card>

              {method === "upi" && (
                <Card className="p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-3">Scan to pay {formatINR(total)}</p>
                  <div className="bg-card p-4 inline-block rounded-lg border border-border">
                    <QRCodeSVG value={upiLink} size={200} />
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <code className="bg-muted px-3 py-1.5 rounded text-sm">{SITE_CONFIG.upiId}</code>
                    <button onClick={() => { navigator.clipboard.writeText(SITE_CONFIG.upiId); toast.success("UPI ID copied"); }} className="text-primary hover:bg-primary/10 p-1.5 rounded">
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">After paying, enter your UTR / Transaction ID below</p>
                  <div className="mt-4 max-w-sm mx-auto text-left">
                    <Label htmlFor="utr">UTR / Transaction Reference *</Label>
                    <Input id="utr" value={paymentRef} onChange={(e) => setPaymentRef(e.target.value)} placeholder="e.g. 412345678901" maxLength={50} />
                  </div>
                </Card>
              )}

              {method === "bank_transfer" && (
                <Card className="p-6">
                  <h2 className="font-display font-bold text-secondary mb-3">Bank Account Details</h2>
                  <dl className="text-sm space-y-2">
                    <div className="flex justify-between"><dt className="text-muted-foreground">Account Name</dt><dd>{SITE_CONFIG.bankDetails.accountName}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted-foreground">Account Number</dt><dd className="font-mono">{SITE_CONFIG.bankDetails.accountNumber}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted-foreground">IFSC</dt><dd className="font-mono">{SITE_CONFIG.bankDetails.ifsc}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted-foreground">Bank</dt><dd>{SITE_CONFIG.bankDetails.bankName}</dd></div>
                  </dl>
                  <div className="mt-4">
                    <Label htmlFor="utr2">Reference No. *</Label>
                    <Input id="utr2" value={paymentRef} onChange={(e) => setPaymentRef(e.target.value)} placeholder="Bank transaction ref" maxLength={50} />
                  </div>
                </Card>
              )}

              <Button variant="hero" size="lg" className="w-full" onClick={onConfirm} disabled={busy}>
                {busy && <Loader2 className="animate-spin" />} Confirm Order
              </Button>
            </div>

            {/* Order Summary */}
            <Card className="p-5 h-fit lg:sticky lg:top-24">
              <h2 className="font-display font-bold text-secondary mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm max-h-60 overflow-y-auto">
                {items.map((i) => (
                  <div key={i.id} className="flex justify-between gap-2">
                    <span className="text-muted-foreground">{i.name} <span className="text-xs">× {i.quantity}</span></span>
                    <span>{formatINR(i.price * i.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border mt-4 pt-3 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatINR(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>{delivery === 0 ? "FREE" : formatINR(delivery)}</span></div>
                <div className="flex justify-between font-display font-bold text-secondary text-base pt-2 border-t border-border">
                  <span>Total</span><span>{formatINR(total)}</span>
                </div>
              </div>
              {address && (
                <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
                  <p className="font-medium text-secondary mb-1">Delivering to:</p>
                  <p>{address.full_name}, {address.address_line1}, {address.city}, {address.state} - {address.pincode}</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutPayment;
