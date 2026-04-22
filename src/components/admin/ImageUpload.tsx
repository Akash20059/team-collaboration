import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

interface Props {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
}

export const ImageUpload = ({ value, onChange, label = "Upload Image" }: Props) => {
  const [busy, setBusy] = useState(false);

  const handleFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setBusy(true);
    const reader = new FileReader();
    reader.onload = () => {
      onChange(reader.result as string);
      setBusy(false);
      toast.success("Image loaded");
    };
    reader.onerror = () => {
      toast.error("Failed to read image");
      setBusy(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      {value && (
        <div className="relative inline-block">
          <img src={value} alt="" className="h-32 w-32 object-cover rounded-md border border-border" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full h-6 w-6 flex items-center justify-center"
            aria-label="Remove"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
      <div>
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            disabled={busy}
          />
          <Button type="button" variant="outline" size="sm" disabled={busy} asChild>
            <span>{busy ? <Loader2 className="animate-spin" /> : <Upload className="h-3 w-3" />} {value ? "Replace" : label}</span>
          </Button>
        </label>
      </div>
    </div>
  );
};
