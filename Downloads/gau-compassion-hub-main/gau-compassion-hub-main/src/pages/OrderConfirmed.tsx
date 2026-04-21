import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/config";

const OrderConfirmed = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (!orderId) return;
    supabase.from("orders").select("*").eq("order_id", orderId).maybeSingle().then(({ data }) => setOrder(data));
  }, [orderId]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-12">
        <div className="container-page max-w-xl">
          <Card className="p-8 text-center shadow-warm">
            <div className="h-20 w-20 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4 animate-in zoom-in duration-500">
              <Check className="h-10 w-10 text-green-700" strokeWidth={3} />
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-secondary">Thank you! 🙏</h1>
            <p className="text-muted-foreground mt-2">Your order has been placed successfully</p>

            <div className="mt-6 bg-muted/40 rounded-lg p-4 inline-block">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Order ID</p>
              <p className="font-mono font-bold text-primary text-lg">{orderId}</p>
            </div>

            {order && (
              <div className="mt-6 text-left text-sm space-y-1 bg-muted/20 rounded-lg p-4">
                <p><span className="text-muted-foreground">Total:</span> <b>{formatINR(Number(order.total_amount))}</b></p>
                <p><span className="text-muted-foreground">Delivering to:</span> {order.customer_name}, {order.city}</p>
                <p className="text-xs text-muted-foreground mt-2">📦 Estimated delivery: 5–7 business days</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button variant="hero" className="flex-1" asChild>
                <Link to={`/track-order?id=${orderId}`}><Package className="h-4 w-4" /> Track My Order</Link>
              </Button>
              <Button variant="outline" className="flex-1" asChild>
                <Link to="/">Go to Home</Link>
              </Button>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderConfirmed;
