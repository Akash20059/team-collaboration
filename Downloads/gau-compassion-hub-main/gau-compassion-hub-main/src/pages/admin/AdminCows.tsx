import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Cow {
  id: string;
  cow_number: number;
  name: string;
  age: string | null;
  weight_kg: number | null;
  breed: string | null;
  milk_yield_litres: number | null;
  health_status: "healthy" | "under_treatment" | "pregnant" | "new_born";
  is_adopted: boolean;
  photo_url: string | null;
  notes: string | null;
}

type Health = "healthy" | "under_treatment" | "pregnant" | "new_born";
const empty: { cow_number: number; name: string; age: string; weight_kg: number; breed: string; milk_yield_litres: number; health_status: Health; is_adopted: boolean; photo_url: string | null; notes: string } = {
  cow_number: 0, name: "", age: "", weight_kg: 0, breed: "Malenadu Gidda",
  milk_yield_litres: 0, health_status: "healthy", is_adopted: false, photo_url: null, notes: "",
};

const AdminCows = () => {
  const [items, setItems] = useState<Cow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Cow | null>(null);
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [del, setDel] = useState<Cow | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("cows").select("*").order("cow_number");
    setItems((data as Cow[]) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => {
    const next = items.length ? Math.max(...items.map((c) => c.cow_number)) + 1 : 1;
    setEditing(null); setForm({ ...empty, cow_number: next }); setOpen(true);
  };
  const openEdit = (c: Cow) => {
    setEditing(c);
    setForm({
      cow_number: c.cow_number, name: c.name, age: c.age || "",
      weight_kg: c.weight_kg ? Number(c.weight_kg) : 0,
      breed: c.breed || "Malenadu Gidda",
      milk_yield_litres: c.milk_yield_litres ? Number(c.milk_yield_litres) : 0,
      health_status: c.health_status, is_adopted: c.is_adopted,
      photo_url: c.photo_url, notes: c.notes || "",
    });
    setOpen(true);
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || form.cow_number <= 0) { toast.error("Number and name required"); return; }
    setBusy(true);
    const payload = {
      cow_number: form.cow_number,
      name: form.name.trim(),
      age: form.age.trim() || null,
      weight_kg: form.weight_kg > 0 ? form.weight_kg : null,
      breed: form.breed.trim() || "Malenadu Gidda",
      milk_yield_litres: form.milk_yield_litres > 0 ? form.milk_yield_litres : null,
      health_status: form.health_status,
      is_adopted: form.is_adopted,
      photo_url: form.photo_url,
      notes: form.notes.trim() || null,
    };
    const res = editing
      ? await supabase.from("cows").update(payload).eq("id", editing.id)
      : await supabase.from("cows").insert(payload);
    setBusy(false);
    if (res.error) { toast.error(res.error.message); return; }
    toast.success(editing ? "✅ Cow updated" : "✅ Cow added");
    setOpen(false); load();
  };

  const onDelete = async () => {
    if (!del) return;
    const { error } = await supabase.from("cows").delete().eq("id", del.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Cow removed"); setDel(null); load();
  };

  return (
    <AdminLayout title="Our Cows">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">{items.length} cows</p>
        <Button variant="hero" onClick={openAdd}><Plus className="h-4 w-4" /> Add Cow</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((c) => (
            <Card key={c.id} className="overflow-hidden">
              <div className="relative aspect-square bg-muted">
                {c.photo_url && <img src={c.photo_url} alt={c.name} className="h-full w-full object-cover" />}
                <span className="absolute top-2 left-2 h-7 w-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">{c.cow_number}</span>
                {c.is_adopted && <span className="absolute top-2 right-2 bg-accent text-accent-foreground text-[10px] px-2 py-0.5 rounded-full font-semibold">💛 Adopted</span>}
              </div>
              <div className="p-3">
                <p className="font-display font-bold text-secondary truncate">{c.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{c.health_status.replace("_", " ")}</p>
                <div className="flex gap-1 mt-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(c)}><Pencil className="h-3 w-3" /></Button>
                  <Button size="sm" variant="outline" onClick={() => setDel(c)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                </div>
              </div>
            </Card>
          ))}
          {items.length === 0 && <p className="col-span-full text-center text-muted-foreground py-8">No cows added yet</p>}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Cow" : "Add Cow"}</DialogTitle></DialogHeader>
          <form onSubmit={onSave} className="space-y-3">
            <div><Label>Photo</Label><ImageUpload bucket="cow-images" value={form.photo_url} onChange={(url) => setForm({ ...form, photo_url: url })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Cow Number *</Label><Input type="number" min={1} value={form.cow_number} onChange={(e) => setForm({ ...form, cow_number: Number(e.target.value) })} required /></div>
              <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required maxLength={50} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Age</Label><Input value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="e.g. 5 yrs" maxLength={20} /></div>
              <div><Label>Weight (kg)</Label><Input type="number" min={0} step={0.1} value={form.weight_kg} onChange={(e) => setForm({ ...form, weight_kg: Number(e.target.value) })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Breed</Label><Input value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} maxLength={50} /></div>
              <div><Label>Milk (L/day)</Label><Input type="number" min={0} step={0.1} value={form.milk_yield_litres} onChange={(e) => setForm({ ...form, milk_yield_litres: Number(e.target.value) })} /></div>
            </div>
            <div>
              <Label>Health Status</Label>
              <Select value={form.health_status} onValueChange={(v: any) => setForm({ ...form, health_status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="healthy">Healthy</SelectItem>
                  <SelectItem value="under_treatment">Under Treatment</SelectItem>
                  <SelectItem value="pregnant">Pregnant</SelectItem>
                  <SelectItem value="new_born">New Born</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Notes</Label><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} maxLength={300} /></div>
            <label className="flex items-center justify-between p-3 bg-muted/40 rounded-md cursor-pointer">
              <span className="text-sm font-medium">Adopted</span>
              <Switch checked={form.is_adopted} onCheckedChange={(v) => setForm({ ...form, is_adopted: v })} />
            </label>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" variant="hero" disabled={busy}>{busy && <Loader2 className="animate-spin" />} Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!del} onOpenChange={(o) => !o && setDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {del?.name}?</AlertDialogTitle>
            <AlertDialogDescription>This cow profile will be permanently removed.</AlertDialogDescription>
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

export default AdminCows;
