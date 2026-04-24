import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Package, Loader2, CheckCircle2, Clock, Truck, XCircle, ChevronRight, Search,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/config";
import { getMyOrderIds } from "@/lib/myOrders";
import { getSavedAddress } from "@/lib/savedAddress";

type Order = {
  order_id: string;
  customer_name: string;
  customer_mobile: string;
  total_amount: number;
  order_status:
    | "order_placed" | "payment_verified" | "packing"
    | "shipped"     | "out_for_delivery" | "delivered" | "cancelled";
  expected_delivery: string | null;
  created_at: string;
  items: { name: string; quantity: number; image_url?: string | null }[];
};

const STATUS_META: Record<Order["order_status"], { label: string; group: "processing" | "shipped" | "completed" | "cancelled"; color: string; }> = {
  order_placed:     { label: "Processing",       group: "processing", color: "bg-amber-100 text-amber-800 border-amber-300" },
  payment_verified: { label: "Processing",       group: "processing", color: "bg-amber-100 text-amber-800 border-amber-300" },
  packing:          { label: "Being packed",     group: "processing", color: "bg-amber-100 text-amber-800 border-amber-300" },
  shipped:          { label: "Shipped",          group: "shipped",    color: "bg-blue-100  text-blue-800  border-blue-300"  },
  out_for_delivery: { label: "Out for delivery", group: "shipped",    color: "bg-blue-100  text-blue-800  border-blue-300"  },
  delivered:        { label: "Completed",        group: "completed",  color: "bg-green-100 text-green-800 border-green-300" },
  cancelled:        { label: "Cancelled",        group: "cancelled",  color: "bg-red-100   text-red-800   border-red-300"   },
};

/* Days remaining until expected delivery; falls back to 5–7 days from order date */
const computeArrivalText = (order: Order): string => {
  if (order.order_status === "delivered") return "Delivered";
  if (order.order_status === "cancelled") return "Cancelled";

  const today = new Date(); today.setHours(0, 0, 0, 0);

  if (order.expected_delivery) {
    const exp = new Date(order.expected_delivery); exp.setHours(0, 0, 0, 0);
    const days = Math.ceil((exp.getTime() - today.getTime()) / 86_400_000);
    if (days < 0)  return `Expected ${exp.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`;
    if (days === 0) return "Arriving today";
    if (days === 1) return "Arriving tomorrow";
    return `Arriving in ${days} days`;
  }

  const placed = new Date(order.created_at); placed.setHours(0, 0, 0, 0);
  const elapsed = Math.floor((today.getTime() - placed.getTime()) / 86_400_000);
  const min = Math.max(0, 5 - elapsed);
  const max = Math.max(1, 7 - elapsed);
  return `Arriving in ${min}–${max} days`;
};

const StatusIcon = ({ status }: { status: Order["order_status"] }) => {
  const g = STATUS_META[status].group;
  if (g === "completed") return <CheckCircle2 className="h-4 w-4" />;
  if (g === "cancelled") return <XCircle      className="h-4 w-4" />;
  if (g === "shipped")   return <Truck        className="h-4 w-4" />;
  return <Clock className="h-4 w-4" />;
};

const MyOrders = () => {
  const [orders, setOrders]   = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobile, setMobile]   = useState<string>("");
  const [searchMobile, setSearchMobile] = useState<string>("");

  /* ─── Load orders by stored order IDs + by saved mobile ─── */
  useEffect(() => {
    const saved = getSavedAddress();
    if (saved?.mobile) setMobile(saved.mobile);
    fetchOrders(saved?.mobile);
  }, []);

  const fetchOrders = async (mobileNum?: string) => {
    setLoading(true);

    const localIds = getMyOrderIds();
    const all = new Map<string, Order>();

    if (localIds.length > 0) {
      const { data } = await supabase
        .from("orders")
        .select("order_id, customer_name, customer_mobile, total_amount, order_status, expected_delivery, created_at, items")
        .in("order_id", localIds);
      (data ?? []).forEach((o: any) => all.set(o.order_id, o as Order));
    }

    if (mobileNum) {
      const { data } = await supabase
        .from("orders")
        .select("order_id, customer_name, customer_mobile, total_amount, order_status, expected_delivery, created_at, items")
        .eq("customer_mobile", mobileNum)
        .order("created_at", { ascending: false });
      (data ?? []).forEach((o: any) => all.set(o.order_id, o as Order));
    }

    const list = Array.from(all.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    setOrders(list);
    setLoading(false);
  };

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(searchMobile)) return;
    setMobile(searchMobile);
    fetchOrders(searchMobile);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-12">
        <div className="container-page max-w-2xl">

          <div className="flex items-center gap-3 mb-5">
            <Package className="h-7 w-7 text-primary" />
            <h1 className="font-display text-2xl md:text-3xl font-bold text-secondary">My Orders</h1>
          </div>

          {/* If no saved mobile, ask for it */}
          {!mobile && !loading && orders.length === 0 && (
            <Card className="p-5 mb-5">
              <form onSubmit={onSearch} className="space-y-3">
                <Label htmlFor="mobile">Enter your mobile to find your orders</Label>
                <div className="flex gap-2">
                  <Input
                    id="mobile"
                    inputMode="numeric"
                    placeholder="10-digit mobile number"
                    value={searchMobile}
                    onChange={(e) => setSearchMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  />
                  <Button type="submit" variant="hero" className="shrink-0">
                    <Search className="h-4 w-4" /> Find
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Loading */}
          {loading && (
            <Card className="p-10 text-center">
              <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
              <p className="text-sm text-muted-foreground mt-3">Loading your orders…</p>
            </Card>
          )}

          {/* Empty state */}
          {!loading && orders.length === 0 && mobile && (
            <Card className="p-10 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="font-medium text-secondary">No orders found</p>
              <p className="text-sm text-muted-foreground mt-1">
                You haven't placed any orders yet with mobile <b>+91-{mobile}</b>.
              </p>
              <Button variant="hero" className="mt-5" asChild>
                <Link to="/#products">Start Shopping</Link>
              </Button>
            </Card>
          )}

          {/* Orders list */}
          {!loading && orders.length > 0 && (
            <div className="space-y-3">
              {orders.map((o) => {
                const meta = STATUS_META[o.order_status];
                return (
                  <Link
                    key={o.order_id}
                    to={`/track-order?id=${o.order_id}`}
                    className="block group"
                  >
                    <Card className="p-4 bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                      {/* Top: order id + status */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="min-w-0">
                          <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">
                            Order ID
                          </p>
                          <p className="font-mono font-bold text-primary text-sm">{o.order_id}</p>
                        </div>
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${meta.color}`}>
                          <StatusIcon status={o.order_status} />
                          {meta.label}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex -space-x-2">
                          {o.items.slice(0, 3).map((it, idx) => (
                            it.image_url
                              ? <img key={idx} src={it.image_url} alt={it.name} className="h-10 w-10 rounded-full object-cover border-2 border-white" />
                              : <div key={idx} className="h-10 w-10 rounded-full bg-muted border-2 border-white grid place-items-center text-xs">📦</div>
                          ))}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-secondary font-medium truncate">
                            {o.items.map((i) => `${i.name} × ${i.quantity}`).join(", ")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Placed on {new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                      </div>

                      {/* Bottom: ETA + total + chevron */}
                      <div className="flex items-center justify-between pt-3 border-t border-border/50">
                        <div className="flex items-center gap-1.5 text-[13px]">
                          {meta.group === "completed" ? (
                            <span className="text-green-700 font-medium flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" /> {computeArrivalText(o)}
                            </span>
                          ) : meta.group === "cancelled" ? (
                            <span className="text-red-700 font-medium">Order cancelled</span>
                          ) : (
                            <span className="text-secondary font-medium flex items-center gap-1">
                              <Truck className="h-3.5 w-3.5 text-primary" /> {computeArrivalText(o)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-secondary">{formatINR(Number(o.total_amount))}</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}

              {/* Search by different mobile */}
              <Card className="p-4 mt-2 bg-white/60 border-dashed">
                <form onSubmit={onSearch} className="space-y-2">
                  <p className="text-xs text-muted-foreground">Look up orders for a different mobile number</p>
                  <div className="flex gap-2">
                    <Input
                      inputMode="numeric"
                      placeholder="10-digit mobile"
                      value={searchMobile}
                      onChange={(e) => setSearchMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    />
                    <Button type="submit" variant="outline" className="shrink-0">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyOrders;
