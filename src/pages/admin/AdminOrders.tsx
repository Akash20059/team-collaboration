import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Loader2, MessageCircle, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatINR, SITE_CONFIG } from "@/lib/config";

interface Order {
  id: string;
  order_id: string;
  customer_name: string;
  customer_mobile: string;
  city: string;
  state: string;
  pincode: string;
  address_line1: string;
  address_line2: string | null;
  items: any[];
  subtotal: number;
  delivery_charge: number;
  total_amount: number;
  payment_method: string;
  payment_status: "pending" | "verified" | "failed";
  payment_reference: string | null;
  order_status: string;
  courier_partner: string | null;
  awb_number: string | null;
  tracking_url: string | null;
  expected_delivery: string | null;
  internal_notes: string | null;
  created_at: string;
}

const ORDER_STATUSES = [
  "order_placed", "payment_verified", "packing", "shipped", "out_for_delivery", "delivered", "cancelled",
];

const STATUS_LABEL: Record<string, string> = {
  order_placed: "Order Placed", payment_verified: "Payment Verified", packing: "Packing",
  shipped: "Shipped", out_for_delivery: "Out for Delivery", delivered: "Delivered", cancelled: "Cancelled",
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Order | null>(null);
  const [edits, setEdits] = useState<Partial<Order>>({});
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders((data as Order[]) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openEdit = (o: Order) => { setEditing(o); setEdits({}); };

  const onSave = async () => {
    if (!editing) return;
    setBusy(true);
    const { error } = await supabase.from("orders").update(edits as any).eq("id", editing.id);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("✅ Order updated");
    setEditing(null);
    load();
  };

  const notifyWhatsApp = (o: Order) => {
    const courier = o.courier_partner || "Courier";
    const awb = o.awb_number || "—";
    const url = o.tracking_url || "";
    const msg = `Dear ${o.customer_name}, your Shreemata Goumandira order ${o.order_id} has been shipped via ${courier} | Tracking No: ${awb}${url ? ` | Track here: ${url}` : ""} 🙏`;
    window.open(`https://wa.me/91${o.customer_mobile}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const paymentBadge = (s: string) => {
    if (s === "verified") return <Badge className="bg-green-600 text-white">Verified</Badge>;
    if (s === "failed") return <Badge variant="destructive">Failed</Badge>;
    return <Badge variant="secondary">Pending</Badge>;
  };

  const view = editing ? { ...editing, ...edits } : null;

  return (
    <AdminLayout title="Orders">
      <div className="mb-4 text-sm text-muted-foreground">{orders.length} orders</div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" /></div>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3">Order ID</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Items</th>
                <th className="p-3">Total</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-border hover:bg-muted/20">
                  <td className="p-3 font-mono text-xs">{o.order_id}<div className="text-muted-foreground">{new Date(o.created_at).toLocaleDateString("en-IN")}</div></td>
                  <td className="p-3">{o.customer_name}<div className="text-xs text-muted-foreground">📱 {o.customer_mobile}</div></td>
                  <td className="p-3 text-xs">{(o.items || []).length} item(s)</td>
                  <td className="p-3 font-bold">{formatINR(Number(o.total_amount))}</td>
                  <td className="p-3">{paymentBadge(o.payment_status)}<div className="text-[10px] text-muted-foreground uppercase mt-1">{o.payment_method}</div></td>
                  <td className="p-3 text-xs">{STATUS_LABEL[o.order_status]}</td>
                  <td className="p-3 text-right">
                    <Button size="sm" variant="outline" onClick={() => openEdit(o)}>Manage</Button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">No orders yet</td></tr>}
            </tbody>
          </table>
        </Card>
      )}

      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {view && (
            <>
              <SheetHeader>
                <SheetTitle className="font-mono">{view.order_id}</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-4 text-sm">
                <Card className="p-3 bg-muted/30">
                  <p className="font-medium">{view.customer_name}</p>
                  <p className="text-xs text-muted-foreground">📱 {view.customer_mobile}</p>
                  <p className="text-xs text-muted-foreground mt-1">{view.address_line1}{view.address_line2 && `, ${view.address_line2}`}, {view.city}, {view.state} - {view.pincode}</p>
                </Card>

                <Card className="p-3">
                  <p className="font-medium mb-2">Items</p>
                  {(view.items || []).map((i: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-xs py-1">
                      <span>{i.name} × {i.quantity}</span>
                      <span>{formatINR(i.price * i.quantity)}</span>
                    </div>
                  ))}
                  <div className="border-t border-border mt-2 pt-2 flex justify-between font-bold">
                    <span>Total</span><span>{formatINR(Number(view.total_amount))}</span>
                  </div>
                  {view.payment_reference && <p className="text-xs text-muted-foreground mt-2">UTR: {view.payment_reference}</p>}
                </Card>

                <div>
                  <Label>Payment Status</Label>
                  <Select value={view.payment_status} onValueChange={(v: any) => setEdits({ ...edits, payment_status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Order Status</Label>
                  <Select value={view.order_status} onValueChange={(v: any) => setEdits({ ...edits, order_status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ORDER_STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div><Label>Courier Partner</Label><Input value={view.courier_partner || ""} onChange={(e) => setEdits({ ...edits, courier_partner: e.target.value })} placeholder="Delhivery / DTDC / India Post" maxLength={50} /></div>
                <div><Label>AWB / Tracking Number</Label><Input value={view.awb_number || ""} onChange={(e) => setEdits({ ...edits, awb_number: e.target.value })} maxLength={50} /></div>
                <div><Label>Tracking URL</Label><Input type="url" value={view.tracking_url || ""} onChange={(e) => setEdits({ ...edits, tracking_url: e.target.value })} placeholder="https://..." /></div>
                <div><Label>Expected Delivery</Label><Input type="date" value={view.expected_delivery || ""} onChange={(e) => setEdits({ ...edits, expected_delivery: e.target.value })} /></div>
                <div><Label>Internal Notes</Label><Textarea rows={3} value={view.internal_notes || ""} onChange={(e) => setEdits({ ...edits, internal_notes: e.target.value })} maxLength={500} /></div>

                <div className="flex flex-col gap-2">
                  <Button variant="hero" onClick={onSave} disabled={busy}>
                    {busy && <Loader2 className="animate-spin" />} Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => notifyWhatsApp(view)}>
                    <MessageCircle className="h-4 w-4" /> Notify Customer on WhatsApp
                  </Button>
                  <a href={`/track-order?id=${view.order_id}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1 justify-center">
                    <ExternalLink className="h-3 w-3" /> View customer tracking page
                  </a>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AdminLayout>
  );
};

export default AdminOrders;
