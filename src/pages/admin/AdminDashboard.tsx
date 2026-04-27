import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Cog as Cow, FileText, AlertTriangle, Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await api.getStats();
      setStats(data);
    } catch (e: any) {
      toast.error("Failed to load stats: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStats(); }, []);

  const cards = stats ? [
    { label: "Total Products", value: stats.products.total, icon: Package, sub: `${stats.products.inStock} in stock` },
    { label: "Out of Stock", value: stats.products.outOfStock, icon: AlertTriangle, sub: `${stats.products.lowStock} low stock`, accent: stats.products.outOfStock > 0 },
    { label: "Total Cows", value: stats.cows.total, icon: Cow, sub: `${stats.cows.adopted} adopted` },
    { label: "Blog Posts", value: stats.posts.total, icon: FileText, sub: "updates published" },
    { label: "Total Orders", value: stats.orders.total, icon: Package, sub: `${stats.orders.pending} pending` },
    { label: "Total Donors", value: stats.donors.total, icon: Heart, sub: "generous supporters" },
  ] : [];

  return (
    <AdminLayout title="Overview">
      {loading ? (
        <div className="flex items-center justify-center p-16">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <>
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
              <Button asChild variant="hero" size="sm"><Link to="/admin/donors">+ Add Donor</Link></Button>
            </div>
          </div>

          <div className="mt-6">
            <Button variant="outline" size="sm" onClick={loadStats}>
              <Loader2 className="h-4 w-4 mr-1" /> Refresh Stats
            </Button>
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
