import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Truck, Clock, CheckCircle2, Search, Calendar } from "lucide-react";
import { getCustomerOrders, markOrderDispatched, updateOrderTracking, type CustomerOrder } from "@/lib/adminStore";
import { toast } from "sonner";
import { formatINR } from "@/lib/config";

const AdminOrders = () => {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "dispatched">("all");
  const [search, setSearch] = useState("");
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    setOrders(getCustomerOrders());
  }, []);

  const handleDispatch = (orderId: string) => {
    const tracking = trackingInputs[orderId];
    if (!tracking) {
      toast.error("Please enter a tracking number (e.g. India Post tracking ID)");
      return;
    }
    markOrderDispatched(orderId, tracking);
    setOrders(getCustomerOrders());
    toast.success(`Order ${orderId} marked as dispatched!`);
  };

  const handleUpdateTracking = (orderId: string) => {
    const tracking = trackingInputs[orderId];
    if (!tracking) return;
    updateOrderTracking(orderId, tracking);
    setOrders(getCustomerOrders());
    toast.success("Tracking number updated");
  };

  // Stats
  const total = orders.length;
  const pending = orders.filter((o) => o.status === "pending").length;
  const dispatched = orders.filter((o) => o.status === "dispatched").length;

  // Filter & Search
  const filteredOrders = orders.filter((o) => {
    const matchesFilter = filter === "all" || o.status === filter;
    const s = search.toLowerCase();
    const matchesSearch =
      o.order_id.toLowerCase().includes(s) ||
      o.customer_name.toLowerCase().includes(s) ||
      o.mobile.includes(s) ||
      o.city.toLowerCase().includes(s);
    return matchesFilter && matchesSearch;
  });

  return (
    <AdminLayout title="Customer Orders">
      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <Card className="p-4 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Package className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Total Orders</p>
            <p className="text-2xl font-bold font-display text-secondary">{total}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <Clock className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Pending</p>
            <p className="text-2xl font-bold font-display text-secondary">{pending}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <Truck className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Dispatched</p>
            <p className="text-2xl font-bold font-display text-secondary">{dispatched}</p>
          </div>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="dispatched">Dispatched</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name, phone, order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-border border-dashed">
            <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No orders found.</p>
          </div>
        ) : (
          filteredOrders.map((o) => (
            <Card key={o.id} className="overflow-hidden">
              <div className="bg-muted/30 p-4 border-b border-border flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary font-mono text-sm px-2 py-1 rounded-md font-bold">
                    #{o.order_id}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(o.placed_at).toLocaleString("en-IN", {
                      day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-bold text-secondary text-lg leading-tight">{formatINR(o.total_amount)}</p>
                    {o.delivery_charge > 0 && <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Incl. delivery</p>}
                  </div>
                  {o.status === "pending" ? (
                    <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                      <Clock className="h-3 w-3" /> PENDING
                    </span>
                  ) : (
                    <span className="bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> DISPATCHED
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 grid md:grid-cols-2 gap-6">
                {/* Customer Details */}
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Customer & Delivery</h4>
                  <p className="font-semibold text-secondary">{o.customer_name}</p>
                  <p className="text-sm text-muted-foreground mb-2">📞 {o.mobile}</p>
                  <div className="text-sm bg-muted/30 p-3 rounded-lg text-secondary-foreground/80 mt-2">
                    <p>{o.address_line1}</p>
                    <p>{o.city}, {o.state} — <span className="font-mono font-medium">{o.pincode}</span></p>
                  </div>
                </div>

                {/* Items & Actions */}
                <div className="flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Items Ordered</h4>
                    <ul className="space-y-2 mb-4">
                      {o.items.map((item, idx) => (
                        <li key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-secondary"><span className="text-muted-foreground mr-1">{item.qty}x</span> {item.name}</span>
                          <span className="text-muted-foreground">{formatINR(item.price * item.qty)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-border mt-auto">
                    {o.status === "pending" ? (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Tracking Number (e.g. India Post)"
                          value={trackingInputs[o.order_id] || ""}
                          onChange={(e) => setTrackingInputs({ ...trackingInputs, [o.order_id]: e.target.value })}
                          className="text-sm"
                        />
                        <Button onClick={() => handleDispatch(o.order_id)} className="shrink-0 bg-green-600 hover:bg-green-700">
                          Mark Dispatched
                        </Button>
                      </div>
                    ) : (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-green-800 font-medium flex items-center gap-1.5">
                            <Truck className="h-3.5 w-3.5" /> Dispatched via Indian Post
                          </p>
                          <p className="text-[10px] text-green-600">
                            {o.dispatched_at ? new Date(o.dispatched_at).toLocaleDateString() : ""}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Tracking Number"
                            value={trackingInputs[o.order_id] ?? o.tracking_number ?? ""}
                            onChange={(e) => setTrackingInputs({ ...trackingInputs, [o.order_id]: e.target.value })}
                            className="h-8 text-xs bg-white border-green-200 focus-visible:ring-green-500"
                          />
                          <Button size="sm" variant="outline" className="h-8 border-green-200 text-green-700 hover:bg-green-100" onClick={() => handleUpdateTracking(o.order_id)}>
                            Update
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
