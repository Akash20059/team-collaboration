import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Pencil, Trash2, Plus, Loader2, Video, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

type GalleryImage = {
  id: string;
  url: string;
  title: string;
  display_order: number;
};

const empty = { url: "", title: "", display_order: 0 };

export const AdminGallery = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<typeof empty>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isMediaTypeVideo, setIsMediaTypeVideo] = useState(false);

  const [delId, setDelId] = useState<string | null>(null);

  const isVideoUrl = (url: string) => /youtube\.com|youtu\.be|vimeo\.com/i.test(url);

  const openCreateDialog = (video: boolean) => {
    setForm(empty);
    setEditingId(null);
    setIsMediaTypeVideo(video);
    setDialogOpen(true);
  };

  const openEditDialog = (img: GalleryImage) => {
    setForm({ url: img.url, title: img.title || "", display_order: img.display_order });
    setEditingId(img.id);
    setIsMediaTypeVideo(isVideoUrl(img.url));
    setDialogOpen(true);
  };

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.getGallery();
      setImages(res);
    } catch (e: any) {
      toast.error(e.message || "Failed to load gallery images");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async () => {
    if (!form.url) {
      toast.error("Image is required");
      return;
    }
    try {
      if (editingId) {
        await api.updateGalleryImage(editingId, form);
        toast.success("Image updated");
      } else {
        await api.createGalleryImage(form);
        toast.success("Image added");
      }
      setDialogOpen(false);
      load();
    } catch (e: any) {
      toast.error(e.message || "Error saving image");
    }
  };

  const handleDelete = async () => {
    if (!delId) return;
    try {
      await api.deleteGalleryImage(delId);
      toast.success("Image deleted");
      setDelId(null);
      load();
    } catch (e: any) {
      toast.error(e.message || "Error deleting");
    }
  };

  return (
    <AdminLayout title="Gallery Management">
      <div className="flex justify-end gap-3 mb-6">
        <Button variant="outline" onClick={() => openCreateDialog(true)}>
          <Video className="mr-2 h-4 w-4" /> Add Video Link
        </Button>
        <Button onClick={() => openCreateDialog(false)}>
          <Plus className="mr-2 h-4 w-4" /> Add Image
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : images.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">No gallery images found.</Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {images.map(img => {
            const isVideo = isVideoUrl(img.url);
            return (
            <Card key={img.id} className="overflow-hidden group">
              <div className="aspect-square relative flex bg-gray-100">
                {isVideo ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-secondary text-secondary-foreground">
                    <Video className="w-12 h-12 mb-2 opacity-50" />
                    <span className="text-xs truncate px-4">{img.url}</span>
                  </div>
                ) : (
                  <img src={img.url} alt={img.title} className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="icon" variant="secondary" onClick={() => openEditDialog(img)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="destructive" onClick={() => setDelId(img.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  {isVideo ? <Video className="w-3 h-3 text-muted-foreground" /> : <ImageIcon className="w-3 h-3 text-muted-foreground" />}
                  <p className="font-medium truncate text-sm">{img.title || "No Title"}</p>
                </div>
                <p className="text-xs text-muted-foreground">Order: {img.display_order}</p>
              </div>
            </Card>
          )})}
        </div>
      )}

      {/* Editor Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit" : "Add"} {isMediaTypeVideo ? "Video Link" : "Gallery Image"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>{isMediaTypeVideo ? "YouTube/Vimeo Embed URL" : "Image"}</Label>
              {isMediaTypeVideo ? (
                <div className="mt-2 space-y-2">
                  <Input 
                    value={form.url} 
                    onChange={(e) => setForm({ ...form, url: e.target.value })} 
                    placeholder="https://www.youtube.com/embed/..." 
                  />
                  <p className="text-xs text-muted-foreground font-medium">Use the "embed" link from YouTube or Vimeo for best results. E.g. https://www.youtube.com/embed/xyz123</p>
                </div>
              ) : (
                <ImageUpload
                  value={form.url}
                  onChange={(url) => setForm({ ...form, url: url || "" })}
                />
              )}
            </div>
            <div>
              <Label>Title / Alt Text</Label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. A beautiful cow" />
            </div>
            <div>
              <Label>Display Order</Label>
              <Input type="number" value={form.display_order} onChange={e => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!delId} onOpenChange={(o) => !o && setDelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the image from the gallery.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};