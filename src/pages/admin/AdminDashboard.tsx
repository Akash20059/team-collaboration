import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Cog as Cow, FileText, AlertTriangle, Download, Upload } from "lucide-react";
import { getProducts, getCows, getBlogPosts, downloadExport, importAllData } from "@/lib/adminStore";
import { toast } from "sonner";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    products: 0, inStock: 0, outStock: 0, lowStock: 0,
    cows: 0, adopted: 0,
    posts: 0,
  });
  const fileRef = useRef<HTMLInputElement>(null);

  const computeStats = () => {
    const products = getProducts();
    const cows = getCows();
    const posts = getBlogPosts();
    setStats({
      products: products.length,
      inStock: products.filter((x) => x.stock_status === "in_stock").length,
      outStock: products.filter((x) => x.stock_status === "out_of_stock").length,
      lowStock: products.filter((x) => x.stock_status === "low_stock").length,
      cows: cows.length,
      adopted: cows.filter((x) => x.is_adopted).length,
      posts: posts.length,
    });
  };

  useEffect(() => { computeStats(); }, []);

  const onExport = () => {
    downloadExport();
    toast.success("✅ Data exported as JSON");
  };

  const onImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importAllData(reader.result as string);
        computeStats();
        toast.success("✅ Data imported successfully! Refresh public pages to see changes.");
      } catch {
        toast.error("Invalid JSON file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const cards = [
    { label: "Total Products", value: stats.products, icon: Package, sub: `${stats.inStock} in stock` },
    { label: "Out of Stock", value: stats.outStock, icon: AlertTriangle, sub: `${stats.lowStock} low stock`, accent: stats.outStock > 0 },
    { label: "Total Cows", value: stats.cows, icon: Cow, sub: `${stats.adopted} adopted` },
    { label: "Blog Posts", value: stats.posts, icon: FileText, sub: "updates published" },
  ];

  return (
    <AdminLayout title="Overview">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-display font-bold text-secondary mb-3">Data Management</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="h-4 w-4" /> Export Data (JSON)
          </Button>
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4" /> Import Data
          </Button>
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={onImport} />
        </div>
        <p className="text-xs text-muted-foreground mt-2">Export creates a backup of all products, cows, and blog posts. Import restores from a backup file.</p>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
