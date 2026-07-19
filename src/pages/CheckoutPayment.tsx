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
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRazorpay } from "@/hooks/useRazorpay";

const ADDR_KEY = "goumandira_checkout_addr";

const CheckoutPayment = () => {
  const nav = useNavigate();
  const isRazorpayLoaded = useRazorpay();
  const { items, subtotal, mrpTotal, clear } = useCart();
  const [address, setAddress] = useState<SavedAddress | null>(null);
  const [method, setMethod] = useState<"razorpay" | "cod">("razorpay");
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

  const handleCreateOrder = async (paymentRef: string | null = null) => {
    try {
      const orderItems = items.map((i) => ({
        id: i.id, name: i.name, price: i.price, quantity: i.quantity, image_url: i.image_url,
      }));
      const data = await api.createOrder({
        customer_name: address!.full_name,
        customer_mobile: address!.mobile,
        address_line1: address!.address_line1,
        address_line2: address!.address_line2 || null,
        city: address!.city,
        state: address!.state,
        pincode: address!.pincode,
        landmark: address!.landmark || null,
        items: orderItems,
        subtotal,
        delivery_charge: delivery,
        discount: Math.max(0, mrpTotal - subtotal),
        total_amount: total,
        payment_method: method,
        payment_reference: paymentRef,
      });

      // WhatsApp notify owner
      const msg = `🙏 New Order: ${data.order_id}%0A👤 ${address!.full_name} (${address!.mobile})%0A📍 ${address!.city}, ${address!.state} - ${address!.pincode}%0A💰 Total: ${formatINR(total)}%0A💳 ${method.toUpperCase()}${paymentRef ? ` (Ref: ${paymentRef})` : ""}%0A%0AItems:%0A${items.map((i) => `• ${i.name} x ${i.quantity}`).join("%0A")}`;
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

  const onConfirm = async () => {
    if (!address) return;
    setBusy(true);

    if (method === "cod") {
      await handleCreateOrder(null);
      return;
    }

    if (method === "razorpay") {
      if (!isRazorpayLoaded) {
        toast.error("Payment gateway is loading. Please try again in a moment.");
        setBusy(false);
        return;
      }

      try {
        const orderData = await api.createPaymentOrder({ amount: total });
        
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "Shreemata Goumandira",
          description: "Store Purchase",
          order_id: orderData.id,
          handler: async function (response: any) {
            try {
              const verifyRes = await api.verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              });
              
              if (verifyRes.success) {
                toast.success("Payment successful!");
                await handleCreateOrder(response.razorpay_payment_id);
              } else {
                toast.error("Payment verification failed");
                setBusy(false);
              }
            } catch (err) {
              toast.error("Payment verification failed");
              setBusy(false);
            }
          },
          prefill: {
            name: address.full_name,
            contact: address.mobile,
          },
          theme: {
            color: "#f97316" // primary orange
          }
        };

        const rzp1 = new (window as any).Razorpay(options);
        rzp1.on('payment.failed', function (response: any) {
          toast.error("Payment failed: " + response.error.description);
          setBusy(false);
        });
        rzp1.open();
      } catch (err: any) {
        toast.error(err.message || "Could not initialize payment");
        setBusy(false);
      }
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
                    <RadioGroupItem value="razorpay" id="razorpay" className="mt-1" />
                    <div className="flex-1">
                      <p className="font-medium text-secondary">Pay Online (Razorpay)</p>
                      <p className="text-xs text-muted-foreground">UPI, Cards, NetBanking, Wallets</p>
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
