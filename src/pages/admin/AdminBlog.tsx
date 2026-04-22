import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Pencil, Trash2, Plus } from "lucide-react";
import { getBlogPosts, saveBlogPost, deleteBlogPost, type BlogPost, type BlogCategory } from "@/lib/adminStore";
import { toast } from "sonner";

const CATS: Record<BlogCategory, string> = {
  new_born_calf: "New Born Calf 🐮",
  program: "Program 📅",
  function: "Function 🎉",
  general_update: "General Update 📢",
};

const empty: {
  title: string; category: BlogCategory; post_date: string;
  cover_image_url: string | null; content: string;
} = {
  title: "", category: "general_update",
  post_date: new Date().toISOString().slice(0, 10),
  cover_image_url: null, content: "",
};

const AdminBlog = () => {
  const [items, setItems] = useState<BlogPost[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [form, setForm] = useState(empty);
  const [del, setDel] = useState<BlogPost | null>(null);

  const load = () => { setItems(getBlogPosts()); };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (p: BlogPost) => {
    setEditing(p);
    setForm({
      title: p.title, category: p.category,
      post_date: p.post_date, cover_image_url: p.cover_image_url,
      content: p.content || "",
    });
    setOpen(true);
  };

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Title required"); return; }
    saveBlogPost({
      ...(editing ? { id: editing.id } : {}),
      title: form.title.trim(),
      category: form.category,
      post_date: form.post_date,
      cover_image_url: form.cover_image_url,
      content: form.content.trim(),
    });
    toast.success(editing ? "✅ Post updated successfully!" : "✅ Post added successfully!");
    setOpen(false); load();
  };

  const onDelete = () => {
    if (!del) return;
    deleteBlogPost(del.id);
    toast.success("Post deleted"); setDel(null); load();
  };

  return (
    <AdminLayout title="Updates / Blog">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">{items.length} posts</p>
        <Button variant="hero" onClick={openAdd}><Plus className="h-4 w-4" /> Add Post</Button>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3">Cover</th>
              <th className="p-3">Title</th>
              <th className="p-3">Category</th>
              <th className="p-3">Date</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-3">{p.cover_image_url ? <img src={p.cover_image_url} alt="" className="h-12 w-16 object-cover rounded" /> : <div className="h-12 w-16 bg-muted rounded" />}</td>
                <td className="p-3 font-medium max-w-xs truncate">{p.title}</td>
                <td className="p-3 text-xs">{CATS[p.category]}</td>
                <td className="p-3 text-xs text-muted-foreground">{new Date(p.post_date).toLocaleDateString("en-IN")}</td>
                <td className="p-3 text-right">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(p)}><Pencil className="h-3 w-3" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => setDel(p)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No posts yet</td></tr>}
          </tbody>
        </table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Post" : "Add Post"}</DialogTitle></DialogHeader>
          <form onSubmit={onSave} className="space-y-3">
            <div><Label>Cover Image</Label><ImageUpload value={form.cover_image_url} onChange={(url) => setForm({ ...form, cover_image_url: url })} /></div>
            <div><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required maxLength={150} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v: any) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(CATS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Date</Label><Input type="date" value={form.post_date} onChange={(e) => setForm({ ...form, post_date: e.target.value })} /></div>
            </div>
            <div><Label>Content</Label><Textarea rows={6} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} maxLength={2000} /></div>
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
            <AlertDialogDescription>"{del?.title}" will be permanently removed. This cannot be undone.</AlertDialogDescription>
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

export default AdminBlog;
