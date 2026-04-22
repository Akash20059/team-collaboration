import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Pencil, Trash2, Plus } from "lucide-react";
import { getProducts, saveProduct, deleteProduct, type Product } from "@/lib/adminStore";
import { toast } from "sonner";
import { formatINR } from "@/lib/config";

const empty = { name: "", description: "", price: 0, mrp: 0, quantity_available: 0, image_url: null as string | null, order_link: "" };

const AdminProducts = () => {
  const [items, setItems] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(empty);
  const [del, setDel] = useState<Product | null>(null);

  const load = () => { setItems(getProducts()); };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, description: p.description || "", price: Number(p.price),
      mrp: p.mrp ? Number(p.mrp) : 0, quantity_available: p.quantity_available,
      image_url: p.image_url, order_link: p.order_link || "",
    });
    setOpen(true);
  };

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || form.price <= 0) {
      toast.error("Name and valid price required");
      return;
    }
    saveProduct({
      ...(editing ? { id: editing.id } : {}),
      name: form.name.trim(),
      description: form.description.trim(),
      price: form.price,
      mrp: form.mrp > 0 ? form.mrp : 0,
      quantity_available: form.quantity_available,
      stock_status: "in_stock", // will be auto-calculated
      image_url: form.image_url,
      order_link: form.order_link.trim(),
    });
    toast.success(editing ? "✅ Product updated successfully!" : "✅ Product added successfully!");
    setOpen(false);
    load();
  };

  const onDelete = () => {
    if (!del) return;
    deleteProduct(del.id);
    toast.success("Product deleted");
    setDel(null);
    load();
  };

  const statusBadge = (s: string, q: number) => {
    if (s === "out_of_stock" || q <= 0) return <Badge variant="destructive">🔴 Out of Stock</Badge>;
    if (s === "low_stock") return <Badge className="bg-accent text-accent-foreground">🟡 Low ({q})</Badge>;
    return <Badge className="bg-green-600 text-white">🟢 In Stock ({q})</Badge>;
  };

  return (
    <AdminLayout title="Products">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">{items.length} products</p>
        <Button variant="hero" onClick={openAdd}><Plus className="h-4 w-4" /> Add Product</Button>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3">Photo</th>
              <th className="p-3">Name</th>
              <th className="p-3">Description</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-3">{p.image_url ? <img src={p.image_url} alt="" className="h-12 w-12 object-cover rounded" /> : <div className="h-12 w-12 bg-muted rounded" />}</td>
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3"><div className="text-xs text-muted-foreground line-clamp-2 max-w-xs">{p.description}</div></td>
                <td className="p-3 font-bold text-primary">{formatINR(Number(p.price))}{p.mrp && Number(p.mrp) > Number(p.price) && <div className="text-xs text-muted-foreground line-through">{formatINR(Number(p.mrp))}</div>}</td>
                <td className="p-3">{statusBadge(p.stock_status, p.quantity_available)}</td>
                <td className="p-3 text-right">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(p)}><Pencil className="h-3 w-3" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => setDel(p)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No products yet</td></tr>}
          </tbody>
        </table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Product" : "Add Product"}</DialogTitle></DialogHeader>
          <form onSubmit={onSave} className="space-y-3">
            <div>
              <Label>Photo</Label>
              <ImageUpload value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} />
            </div>
            <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required maxLength={100} /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} maxLength={500} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Price (₹) *</Label><Input type="number" min={0} step={1} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} required /></div>
              <div><Label>MRP (₹)</Label><Input type="number" min={0} step={1} value={form.mrp} onChange={(e) => setForm({ ...form, mrp: Number(e.target.value) })} /></div>
            </div>
            <div><Label>Quantity Available *</Label><Input type="number" min={0} value={form.quantity_available} onChange={(e) => setForm({ ...form, quantity_available: Number(e.target.value) })} required /></div>
            <div><Label>External Order Link (optional)</Label><Input type="url" value={form.order_link} onChange={(e) => setForm({ ...form, order_link: e.target.value })} placeholder="https://..." /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" variant="hero">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!del} onOpenChange={(o) => !o && setDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this?</AlertDialogTitle>
            <AlertDialogDescription>"{del?.name}" will be permanently removed. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminProducts;
