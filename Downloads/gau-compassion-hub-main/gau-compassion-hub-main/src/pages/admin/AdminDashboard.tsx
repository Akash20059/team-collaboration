import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Cog as Cow, FileText, ShoppingBag, AlertTriangle, IndianRupee } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/config";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    products: 0, inStock: 0, outStock: 0, lowStock: 0,
    cows: 0, adopted: 0,
    posts: 0,
    orders: 0, pendingOrders: 0, revenue: 0,
  });

  useEffect(() => {
    Promise.all([
      supabase.from("products").select("stock_status"),
      supabase.from("cows").select("is_adopted"),
      supabase.from("blog_posts").select("id"),
      supabase.from("orders").select("order_status, total_amount, payment_status"),
    ]).then(([p, c, b, o]) => {
      const products = p.data || [];
      const cows = c.data || [];
      const posts = b.data || [];
      const orders = o.data || [];
      setStats({
        products: products.length,
        inStock: products.filter((x: any) => x.stock_status === "in_stock").length,
        outStock: products.filter((x: any) => x.stock_status === "out_of_stock").length,
        lowStock: products.filter((x: any) => x.stock_status === "low_stock").length,
        cows: cows.length,
        adopted: cows.filter((x: any) => x.is_adopted).length,
        posts: posts.length,
        orders: orders.length,
        pendingOrders: orders.filter((x: any) => x.order_status !== "delivered" && x.order_status !== "cancelled").length,
        revenue: orders.filter((x: any) => x.payment_status === "verified").reduce((s: number, x: any) => s + Number(x.total_amount), 0),
      });
    });
  }, []);

  const cards = [
    { label: "Total Products", value: stats.products, icon: Package, sub: `${stats.inStock} in stock` },
    { label: "Out of Stock", value: stats.outStock, icon: AlertTriangle, sub: `${stats.lowStock} low stock`, accent: stats.outStock > 0 },
    { label: "Total Cows", value: stats.cows, icon: Cow, sub: `${stats.adopted} adopted` },
    { label: "Blog Posts", value: stats.posts, icon: FileText, sub: "updates published" },
    { label: "Total Orders", value: stats.orders, icon: ShoppingBag, sub: `${stats.pendingOrders} pending` },
    { label: "Revenue", value: formatINR(stats.revenue), icon: IndianRupee, sub: "from verified orders" },
  ];

  return (
    <AdminLayout title="Overview">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.label} className={`p-5 ${c.accent ? "border-destructive/40" : ""}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{c.label}</p>
                <p className="font-display text-2xl font-bold text-secondary mt-1">{c.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{c.sub}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <c.icon className="h-5 w-5 text-primary" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6">
        <h2 className="font-display font-bold text-secondary mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="hero" size="sm"><Link to="/admin/products">+ Add Product</Link></Button>
          <Button asChild variant="hero" size="sm"><Link to="/admin/cows">+ Add Cow</Link></Button>
          <Button asChild variant="hero" size="sm"><Link to="/admin/blog">+ Add Blog Post</Link></Button>
          <Button asChild variant="outline" size="sm"><Link to="/admin/orders">View Orders</Link></Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
