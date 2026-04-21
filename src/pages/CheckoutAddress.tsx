import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { CheckoutSteps } from "@/components/checkout/CheckoutSteps";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCart } from "@/hooks/useCart";
import { getSavedAddress, saveAddress, SavedAddress } from "@/lib/savedAddress";
import { toast } from "sonner";

const STATES = ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Delhi","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal"];

const schema = z.object({
  full_name: z.string().trim().min(2, "Name required").max(100),
  mobile: z.string().regex(/^[0-9]{10}$/, "Enter 10-digit mobile"),
  pincode: z.string().regex(/^[0-9]{6}$/, "Enter 6-digit pincode"),
  address_line1: z.string().trim().min(5, "Address required").max(200),
  address_line2: z.string().max(200).optional().or(z.literal("")),
  city: z.string().trim().min(2, "City required").max(50),
  state: z.string().min(2, "State required"),
  landmark: z.string().max(100).optional().or(z.literal("")),
});

const STORAGE_KEY = "goumandira_checkout_addr";

const CheckoutAddress = () => {
  const nav = useNavigate();
  const { items } = useCart();
  const [saved, setSavedState] = useState<SavedAddress | null>(null);
  const [useNew, setUseNew] = useState(false);
  const [saveForLater, setSaveForLater] = useState(true);
  const [form, setForm] = useState<SavedAddress>({
    full_name: "", mobile: "", pincode: "", address_line1: "", address_line2: "", city: "", state: "", landmark: "",
  });

  useEffect(() => {
    if (items.length === 0) {
      nav("/cart", { replace: true });
      return;
    }
    const s = getSavedAddress();
    if (s) {
      setSavedState(s);
      setForm(s);
    }
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    const data: SavedAddress = parsed.data as SavedAddress;
    if (saveForLater) saveAddress(data);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    nav("/checkout/payment");
  };

  const useSaved = () => {
    if (saved) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      nav("/checkout/payment");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-12">
        <div className="container-page max-w-2xl">
          <CheckoutSteps step={2} />

          {saved && !useNew && (
            <Card className="p-5 mb-4 border-primary/40">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-primary font-semibold uppercase tracking-wide mb-1">Saved Address</p>
                  <p className="font-medium text-secondary">{saved.full_name}</p>
                  <p className="text-sm text-muted-foreground mt-1">{saved.address_line1}{saved.address_line2 && `, ${saved.address_line2}`}</p>
                  <p className="text-sm text-muted-foreground">{saved.city}, {saved.state} - {saved.pincode}</p>
                  <p className="text-sm text-muted-foreground">📱 {saved.mobile}</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <Button variant="hero" className="flex-1" onClick={useSaved}>Use this address</Button>
                <Button variant="outline" className="flex-1" onClick={() => setUseNew(true)}>Add new address</Button>
              </div>
            </Card>
          )}

          {(!saved || useNew) && (
            <Card className="p-6">
              <h1 className="font-display text-xl font-bold text-secondary mb-4">Delivery Address</h1>
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input id="full_name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required maxLength={100} />
                  </div>
                  <div>
                    <Label htmlFor="mobile">Mobile Number *</Label>
                    <Input id="mobile" type="tel" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, "").slice(0, 10) })} placeholder="10 digit number" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input id="pincode" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })} placeholder="6 digits" required />
                </div>
                <div>
                  <Label htmlFor="address_line1">Address Line 1 *</Label>
                  <Input id="address_line1" value={form.address_line1} onChange={(e) => setForm({ ...form, address_line1: e.target.value })} placeholder="House no, building, street" required maxLength={200} />
                </div>
                <div>
                  <Label htmlFor="address_line2">Address Line 2 (optional)</Label>
                  <Input id="address_line2" value={form.address_line2} onChange={(e) => setForm({ ...form, address_line2: e.target.value })} placeholder="Area, locality" maxLength={200} />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required maxLength={50} />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Select value={form.state} onValueChange={(v) => setForm({ ...form, state: v })}>
                      <SelectTrigger id="state"><SelectValue placeholder="Select state" /></SelectTrigger>
                      <SelectContent>
                        {STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="landmark">Landmark (optional)</Label>
                  <Input id="landmark" value={form.landmark} onChange={(e) => setForm({ ...form, landmark: e.target.value })} maxLength={100} />
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={saveForLater} onCheckedChange={(v) => setSaveForLater(v === true)} />
                  Save this address for future orders
                </label>
                <Button type="submit" variant="hero" size="lg" className="w-full">Continue to Payment →</Button>
              </form>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutAddress;
