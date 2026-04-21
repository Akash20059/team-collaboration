import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ExternalLink, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatINR, SITE_CONFIG } from "@/lib/config";

const STAGES = [
  { key: "order_placed", label: "Order Placed" },
  { key: "payment_verified", label: "Payment Verified" },
  { key: "packing", label: "Order Packed" },
  { key: "shipped", label: "Shipped" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
];

const TrackOrder = () => {
  const [params] = useSearchParams();
  const initialId = params.get("id") || "";
  const [orderId, setOrderId] = useState(initialId);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = async (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setSearched(true);
    const { data } = await supabase.from("orders").select("*").eq("order_id", id.trim().toUpperCase()).maybeSingle();
    setOrder(data);
    setLoading(false);
  };

  useEffect(() => {
    if (initialId) search(initialId);
  }, []);

  const currentIdx = order ? STAGES.findIndex((s) => s.key === order.order_status) : -1;
  const historyMap: Record<string, string> = {};
  if (order?.status_history) {
    (order.status_history as any[]).forEach((h) => { historyMap[h.status] = h.at; });
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-12">
        <div className="container-page max-w-3xl">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-secondary text-center">Track Your Order</h1>
          <p className="text-muted-foreground text-center mt-1">Enter your Order ID to see live status</p>

          <Card className="p-4 mt-6">
            <form onSubmit={(e) => { e.preventDefault(); search(orderId); }} className="flex gap-2">
              <Input value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="GOU-2026-0001" className="font-mono uppercase" />
              <Button variant="hero" type="submit" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : <Search />} Track
              </Button>
            </form>
          </Card>

          {searched && !loading && !order && (
            <Card className="p-6 mt-4 text-center">
              <p className="text-muted-foreground">We couldn't find this Order ID.</p>
              <p className="text-sm mt-1">Please check and try again.</p>
              <a href={`https://wa.me/${SITE_CONFIG.whatsappNumber}`} className="text-primary hover:underline text-sm inline-block mt-3">Need help? Contact us on WhatsApp →</a>
            </Card>
          )}

          {order && (
            <div className="mt-6 space-y-4">
              {/* Order Info */}
              <Card className="p-5">
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Order ID</p>
                    <p className="font-mono font-bold text-primary">{order.order_id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Order Date</p>
                    <p className="text-sm">{new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Total</p>
                    <p className="font-bold">{formatINR(Number(order.total_amount))}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border text-sm">
                  <p className="text-muted-foreground text-xs">Items</p>
                  {(order.items as any[]).map((i, idx) => (
                    <p key={idx}>{i.name} × {i.quantity}</p>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-border text-sm">
                  <p className="text-muted-foreground text-xs">Delivery Address</p>
                  <p>{order.customer_name}, {order.address_line1}{order.address_line2 && `, ${order.address_line2}`}, {order.city}, {order.state} - {order.pincode}</p>
                </div>
              </Card>

              {/* Courier */}
              {(order.courier_partner || order.awb_number) && (
                <Card className="p-5">
                  <h2 className="font-display font-bold text-secondary mb-3">Courier Details</h2>
                  <dl className="text-sm space-y-2">
                    {order.courier_partner && <div className="flex justify-between"><dt className="text-muted-foreground">Partner</dt><dd className="font-medium">{order.courier_partner}</dd></div>}
                    {order.awb_number && <div className="flex justify-between"><dt className="text-muted-foreground">AWB / Tracking No.</dt><dd className="font-mono">{order.awb_number}</dd></div>}
                    {order.expected_delivery && <div className="flex justify-between"><dt className="text-muted-foreground">Expected delivery</dt><dd>{new Date(order.expected_delivery).toLocaleDateString("en-IN")}</dd></div>}
                  </dl>
                  {order.tracking_url && (
                    <Button variant="outline" size="sm" className="mt-3" asChild>
                      <a href={order.tracking_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" /> Track on Courier Website
                      </a>
                    </Button>
                  )}
                </Card>
              )}

              {/* Timeline */}
              <Card className="p-5">
                <h2 className="font-display font-bold text-secondary mb-4">Status Timeline</h2>
                {order.order_status === "cancelled" ? (
                  <div className="text-destructive font-medium">This order was cancelled.</div>
                ) : (
                  <ol className="relative border-l-2 border-border ml-3 space-y-5">
                    {STAGES.map((stage, i) => {
                      const done = i <= currentIdx;
                      const current = i === currentIdx;
                      const ts = historyMap[stage.key];
                      return (
                        <li key={stage.key} className="ml-6">
                          <span className={`absolute -left-[11px] flex h-5 w-5 items-center justify-center rounded-full ${done ? "bg-primary text-primary-foreground" : "bg-muted border-2 border-border"} ${current ? "animate-pulse ring-4 ring-primary/30" : ""}`}>
                            {done ? <Check className="h-3 w-3" /> : null}
                          </span>
                          <p className={`text-sm font-medium ${done ? "text-secondary" : "text-muted-foreground"}`}>{stage.label}</p>
                          {ts && <p className="text-xs text-muted-foreground">{new Date(ts).toLocaleString("en-IN")}</p>}
                        </li>
                      );
                    })}
                  </ol>
                )}
              </Card>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TrackOrder;
