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
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus, Repeat, Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatINR } from "@/lib/config";
import { api } from "@/lib/api";

type DonationType = "one-time" | "monthly";
type Donor = { id: string; name: string; type: DonationType; amount: number; donated_at: string; message: string | null; };

const empty = {
  name: "", type: "one-time" as DonationType, amount: 12000,
  donated_at: new Date().toISOString().slice(0, 10), message: "",
};

const AdminDonors = () => {
  const [items, setItems] = useState<Donor[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Donor | null>(null);
  const [form, setForm] = useState(empty);
  const [del, setDel] = useState<Donor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const data = await api.getDonors();
      setItems(data);
    } catch (e: any) {
      toast.error("Failed to load donors: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (d: Donor) => {
    setEditing(d);
    setForm({ name: d.name, type: d.type, amount: d.amount, donated_at: d.donated_at.slice(0, 10), message: d.message || "" });
    setOpen(true);
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    if (form.amount <= 0) { toast.error("Amount must be greater than 0"); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(), type: form.type, amount: form.amount,
        donated_at: new Date(form.donated_at).toISOString(),
        message: form.message.trim() || null,
      };
      if (editing) {
        await api.updateDonor(editing.id, payload);
        toast.success("✅ Donor updated!");
      } else {
        await api.createDonor(payload);
        toast.success("✅ Donor added!");
      }
      setOpen(false); load();
    } catch (e: any) {
      toast.error("Failed to save: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!del) return;
    try {
      await api.deleteDonor(del.id);
      toast.success("Donor removed"); setDel(null); load();
    } catch (e: any) {
      toast.error("Failed to delete: " + e.message);
    }
  };

  return (
    <AdminLayout title="Donators">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">{items.length} donors</p>
        <Button variant="hero" onClick={openAdd}><Plus className="h-4 w-4" /> Add Donor</Button>
      </div>

      <Card className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Type</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Date</th>
                <th className="p-3">Message</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((d) => (
                <tr key={d.id} className="border-t border-border">
                  <td className="p-3 font-medium">{d.name}</td>
                  <td className="p-3">
                    {d.type === "monthly"
                      ? <Badge className="bg-primary/15 text-primary border-0 gap-1"><Repeat className="h-3 w-3" />Monthly</Badge>
                      : <Badge variant="outline" className="gap-1"><Star className="h-3 w-3" />One-Time</Badge>}
                  </td>
                  <td className="p-3 font-bold text-primary">
                    {formatINR(d.amount)}{d.type === "monthly" && <span className="text-xs text-muted-foreground">/mo</span>}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {new Date(d.donated_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="p-3 max-w-[180px]">
                    <p className="text-xs text-muted-foreground truncate">{d.message || "—"}</p>
                  </td>
                  <td className="p-3 text-right">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(d)}><Pencil className="h-3 w-3" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => setDel(d)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No donors yet. Add the first one!</td></tr>
              )}
            </tbody>
          </table>
        )}
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit Donor" : "Add Donor"}</DialogTitle></DialogHeader>
          <form onSubmit={onSave} className="space-y-4">
            <div>
              <Label>Full Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Ramesh Kumar" required maxLength={100} />
            </div>
            <div>
              <Label>Donation Type *</Label>
              <Select value={form.type} onValueChange={(v: DonationType) => setForm({ ...form, type: v, amount: v === "one-time" ? 12000 : form.amount })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="one-time">One-Time</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Amount (₹) *</Label>
              <Input type="number" min={1} value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} required />
            </div>
            <div>
              <Label>Date of Donation *</Label>
              <Input type="date" value={form.donated_at} onChange={(e) => setForm({ ...form, donated_at: e.target.value })} required />
            </div>
            <div>
              <Label>Message (optional)</Label>
              <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="A dedication or note from the donor" rows={2} maxLength={200} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" variant="hero" disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!del} onOpenChange={(o) => !o && setDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this donor?</AlertDialogTitle>
            <AlertDialogDescription>"{del?.name}" will be removed from the donators list.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground">Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminDonors;
