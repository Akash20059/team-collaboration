import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Heart, Loader2, ClipboardCopy } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const UPI_ID = "337437337963378@cnrb";
const UPI_NAME = "Shreemata Goumandira";
const ONE_TIME_AMOUNT = 12000;
const MONTHLY_PLANS = [1000, 2000, 3000, 6000];

const buildUpiUrl = (amount: number) =>
  `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent("Donation to Shreemata Goumandira")}`;

const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
const monthsToComplete = (monthly: number) => Math.ceil(ONE_TIME_AMOUNT / monthly);

const emptyOneTimeForm = {
  name: "",
  email: "",
  phone: "",
  address_line1: "",
  city: "",
  state: "",
  pincode: "",
  message: "",
};

const emptyMonthlyForm = {
  name: "",
  email: "",
  phone: "",
};

export const Donate = () => {
  const [tab, setTab] = useState<"onetime" | "monthly">("onetime");
  const [selectedMonthly, setSelectedMonthly] = useState<number>(1000);

  // Form states
  const [showOneTimeForm, setShowOneTimeForm] = useState(false);
  const [showMonthlyForm, setShowMonthlyForm] = useState(false);
  const [oneTimeForm, setOneTimeForm] = useState(emptyOneTimeForm);
  const [monthlyForm, setMonthlyForm] = useState(emptyMonthlyForm);
  const [saving, setSaving] = useState(false);

  // QR dialog (desktop only — shown after form submit)
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [qrAmount, setQrAmount] = useState(0);

  const payOrShowQR = (amount: number) => {
    if (isMobile()) {
      window.location.href = buildUpiUrl(amount);
    } else {
      setQrAmount(amount);
      setShowQRDialog(true);
    }
  };

  // ─── One-Time Flow ────────────────────────────────────────────────────────
  const handleOneTimeClick = () => setShowOneTimeForm(true);

  const handleOneTimeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const f = oneTimeForm;
    if (!f.name.trim()) { toast.error("Name is required"); return; }
    if (!f.address_line1.trim() || !f.city.trim() || !f.state.trim() || !f.pincode.trim()) {
      toast.error("Please fill the full address (for your receipt)");
      return;
    }
    if (!/^[0-9]{6}$/.test(f.pincode)) {
      toast.error("Pincode must be 6 digits");
      return;
    }

    setSaving(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("one_time_donations").insert({
      name: f.name.trim(),
      email: f.email.trim() || null,
      phone: f.phone.trim() || null,
      address_line1: f.address_line1.trim(),
      city: f.city.trim(),
      state: f.state.trim(),
      pincode: f.pincode.trim(),
      message: f.message.trim() || null,
      amount: ONE_TIME_AMOUNT,
      donated_at: new Date().toISOString().slice(0, 10),
    });
    setSaving(false);

    if (error) {
      console.error("Supabase error:", error);
      toast.error(`Save failed: ${error.message ?? "Unknown error"}`);
      return;
    }

    toast.success("🙏 Thank you! Your details are saved. Please complete the payment.");
    setShowOneTimeForm(false);
    setOneTimeForm(emptyOneTimeForm);
    payOrShowQR(ONE_TIME_AMOUNT);
  };

  // ─── Monthly Flow ─────────────────────────────────────────────────────────
  const handleMonthlyClick = () => setShowMonthlyForm(true);

  const handleMonthlySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const f = monthlyForm;
    if (!f.name.trim()) { toast.error("Please enter your name"); return; }
    if (!f.email.trim() && !f.phone.trim()) {
      toast.error("Please enter at least an email or phone number");
      return;
    }

    setSaving(true);
    const today = new Date();
    const dueDate = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    const reminderDate = new Date(dueDate);
    reminderDate.setDate(reminderDate.getDate() - 1);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("monthly_donors").insert({
      name: f.name.trim(),
      email: f.email.trim() || null,
      phone: f.phone.trim() || null,
      amount: selectedMonthly,
      last_payment_date: today.toISOString().slice(0, 10),
      next_reminder_date: reminderDate.toISOString().slice(0, 10),
    });
    setSaving(false);

    if (error) {
      console.error("Supabase error:", error);
      toast.error(`Save failed: ${error.message ?? "Unknown error"}`);
      return;
    }

    toast.success("✅ Registered! We'll remind you 1 day before each month 🙏");
    setShowMonthlyForm(false);
    setMonthlyForm(emptyMonthlyForm);
    payOrShowQR(selectedMonthly);
  };

  return (
    <>
      <section id="donate" className="section-pad bg-gradient-warm">
        <div className="container-page max-w-6xl">
          <div className="text-center mb-12">
            <p className="font-sanskrit text-primary text-lg">सेवा</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-secondary">Support Our Mission</h2>
            <div className="divider-lotus"><span className="text-primary text-xl">🙏</span></div>
            <p className="text-muted-foreground max-w-xl mx-auto">Every contribution feeds, shelters and protects a sacred life.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">

            {/* LEFT — Info card (no QR until form is submitted) */}
            <div className="bg-card rounded-3xl p-8 shadow-soft border border-border/60 flex flex-col items-center justify-center text-center gap-5">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="h-10 w-10 text-primary" fill="currentColor" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold text-secondary">
                  {tab === "onetime" ? "Adopt a Cow for 1 Year" : "Become a Goumitra"}
                </h3>
                <p className="text-muted-foreground text-sm mt-2 max-w-xs mx-auto">
                  {tab === "onetime"
                    ? "Your ₹12,000 cares for one sacred Malenadu Gidda for a full year."
                    : "Choose your monthly plan, fill your details, and we'll remind you every month."}
                </p>
              </div>
              {tab === "monthly" && (
                <div className="w-full space-y-2">
                  {MONTHLY_PLANS.map((plan) => (
                    <div key={plan} className="flex items-center justify-between px-4 py-2 rounded-xl bg-muted/50 text-sm">
                      <span className="font-semibold text-secondary">₹{plan.toLocaleString("en-IN")}/mo</span>
                      <span className="text-muted-foreground">{monthsToComplete(plan)} months to ₹12,000</span>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                📋 Fill your details → 💳 Get UPI QR → 🙏 Complete payment
              </p>
            </div>

            {/* RIGHT — Tabs + plan selection + donate button */}
            <div className="bg-card rounded-3xl p-8 shadow-soft border border-border/60">
              <Tabs value={tab} onValueChange={(v) => setTab(v as "onetime" | "monthly")} className="w-full">
                <TabsList className="grid grid-cols-2 w-full bg-muted">
                  <TabsTrigger value="onetime">One-Time</TabsTrigger>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                </TabsList>

                <TabsContent value="onetime" className="mt-6 space-y-5">
                  <p className="text-sm text-muted-foreground">Make a one-time contribution to support our gaushala.</p>
                  <div className="rounded-2xl border-2 border-primary bg-primary/5 py-6 text-center">
                    <p className="text-4xl font-bold text-primary">₹12,000</p>
                    <p className="text-sm text-muted-foreground mt-1">Adopt 1 cow for a full year</p>
                  </div>
                </TabsContent>

                <TabsContent value="monthly" className="mt-6 space-y-4">
                  <p className="text-sm text-muted-foreground">Become a monthly Goumitra. Sustained care, every month.</p>
                  <div className="grid grid-cols-2 gap-3">
                    {MONTHLY_PLANS.map((plan) => {
                      const months = monthsToComplete(plan);
                      const isSelected = selectedMonthly === plan;
                      return (
                        <button
                          key={plan}
                          type="button"
                          onClick={() => setSelectedMonthly(plan)}
                          className={`rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
                            isSelected ? "border-primary bg-primary/8 shadow-warm" : "border-border bg-background hover:border-primary/50"
                          }`}
                        >
                          <p className={`text-xl font-bold ${isSelected ? "text-primary" : "text-secondary"}`}>
                            ₹{plan.toLocaleString("en-IN")}
                            <span className="text-xs font-normal text-muted-foreground">/mo</span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Completes ₹12,000 in{" "}
                            <span className={`font-semibold ${isSelected ? "text-primary" : "text-secondary"}`}>
                              {months} {months === 1 ? "month" : "months"}
                            </span>
                          </p>
                        </button>
                      );
                    })}
                  </div>
                  <div className="rounded-xl bg-muted/50 p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Goal: ₹12,000</span>
                      <span className="font-semibold text-primary">
                        {monthsToComplete(selectedMonthly)} months @ ₹{selectedMonthly.toLocaleString("en-IN")}/mo
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-border overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${Math.min((selectedMonthly / ONE_TIME_AMOUNT) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <Button
                variant="hero"
                size="lg"
                className="w-full mt-6"
                onClick={tab === "onetime" ? handleOneTimeClick : handleMonthlyClick}
              >
                {tab === "onetime" ? "Donate 🙏 ₹12,000" : `Start Monthly ₹${selectedMonthly.toLocaleString("en-IN")}/mo`}
              </Button>

              <div className="mt-6 rounded-2xl bg-gradient-divine p-1">
                <div className="rounded-[calc(1rem-4px)] bg-card p-5">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0">
                      <Heart className="h-5 w-5" fill="currentColor" />
                    </div>
                    <div>
                      <h4 className="font-display text-lg font-bold text-secondary">🐄 Adopt 1 Cow for ₹12,000/year</h4>
                      <p className="text-sm text-muted-foreground mt-1">Help us feed and care for one sacred Malenadu Gidda for an entire year.</p>
                      <Button variant="temple" size="sm" className="mt-3" onClick={handleOneTimeClick}>
                        Adopt Now
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3 w-3 text-primary" />
            You'll receive a donation receipt on email / WhatsApp
          </div>
        </div>
      </section>

      {/* One-Time Donor Form */}
      <Dialog open={showOneTimeForm} onOpenChange={setShowOneTimeForm}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-secondary">Your Details 🙏</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground -mt-2">
            Pledging <span className="font-semibold text-primary">₹12,000</span> (One-time).
            We'll send you a receipt by post/email.
          </p>
          <form onSubmit={handleOneTimeSubmit} className="space-y-3 mt-2">
            <div>
              <Label>Full Name *</Label>
              <Input
                value={oneTimeForm.name}
                onChange={(e) => setOneTimeForm({ ...oneTimeForm, name: e.target.value })}
                placeholder="e.g. Ramesh Kumar"
                required
                maxLength={100}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={oneTimeForm.email}
                  onChange={(e) => setOneTimeForm({ ...oneTimeForm, email: e.target.value })}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  type="tel"
                  value={oneTimeForm.phone}
                  onChange={(e) => setOneTimeForm({ ...oneTimeForm, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
            <div>
              <Label>Address *</Label>
              <Input
                value={oneTimeForm.address_line1}
                onChange={(e) => setOneTimeForm({ ...oneTimeForm, address_line1: e.target.value })}
                placeholder="House no, street, area"
                required
                maxLength={200}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label>City *</Label>
                <Input
                  value={oneTimeForm.city}
                  onChange={(e) => setOneTimeForm({ ...oneTimeForm, city: e.target.value })}
                  required
                  maxLength={50}
                />
              </div>
              <div>
                <Label>State *</Label>
                <Input
                  value={oneTimeForm.state}
                  onChange={(e) => setOneTimeForm({ ...oneTimeForm, state: e.target.value })}
                  required
                  maxLength={50}
                />
              </div>
              <div>
                <Label>Pincode *</Label>
                <Input
                  value={oneTimeForm.pincode}
                  onChange={(e) => setOneTimeForm({ ...oneTimeForm, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                  required
                  inputMode="numeric"
                  maxLength={6}
                />
              </div>
            </div>
            <div>
              <Label>Message (optional)</Label>
              <Textarea
                value={oneTimeForm.message}
                onChange={(e) => setOneTimeForm({ ...oneTimeForm, message: e.target.value })}
                placeholder="A dedication or prayer..."
                rows={2}
                maxLength={200}
              />
            </div>
            <Button type="submit" variant="hero" className="w-full" disabled={saving}>
              {saving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
              {saving ? "Saving..." : "Continue to Payment →"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Monthly Donor Form */}
      <Dialog open={showMonthlyForm} onOpenChange={setShowMonthlyForm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-secondary">Set Up Monthly Reminder 🙏</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground -mt-2">
            Pledging <span className="font-semibold text-primary">₹{selectedMonthly.toLocaleString("en-IN")}/month</span>.
            We'll remind you 1 day before each payment is due.
          </p>
          <form onSubmit={handleMonthlySubmit} className="space-y-4 mt-2">
            <div>
              <Label>Your Name *</Label>
              <Input value={monthlyForm.name} onChange={(e) => setMonthlyForm({ ...monthlyForm, name: e.target.value })} placeholder="e.g. Ramesh Kumar" required />
            </div>
            <div>
              <Label>Email (for reminders)</Label>
              <Input type="email" value={monthlyForm.email} onChange={(e) => setMonthlyForm({ ...monthlyForm, email: e.target.value })} placeholder="you@example.com" />
            </div>
            <div>
              <Label>WhatsApp / Phone (optional)</Label>
              <Input type="tel" value={monthlyForm.phone} onChange={(e) => setMonthlyForm({ ...monthlyForm, phone: e.target.value })} placeholder="+91 98765 43210" />
            </div>
            <p className="text-xs text-muted-foreground">At least one of email or phone is required.</p>
            <Button type="submit" variant="hero" className="w-full" disabled={saving}>
              {saving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
              {saving ? "Saving..." : "Continue to Payment →"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* QR Dialog (shown after form submit on desktop) */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-secondary text-center">Scan to Pay 🙏</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-2xl bg-gradient-saffron p-1 shadow-warm">
              <div className="rounded-[calc(1rem-4px)] bg-background p-4">
                <QRCodeSVG value={buildUpiUrl(qrAmount)} size={200} bgColor="#ffffff" fgColor="#1a1a1a" level="M" />
              </div>
            </div>
            <p className="text-3xl font-bold text-primary">₹{qrAmount.toLocaleString("en-IN")}</p>
            <div className="flex items-center gap-2 bg-muted rounded-xl px-4 py-2 w-full justify-between">
              <span className="font-mono text-sm">{UPI_ID}</span>
              <button
                onClick={() => { navigator.clipboard.writeText(UPI_ID); toast.success("UPI ID copied!"); }}
                className="text-muted-foreground hover:text-primary"
              >
                <ClipboardCopy className="h-4 w-4" />
              </button>
            </div>
            <Button variant="hero" className="w-full" onClick={() => { window.location.href = buildUpiUrl(qrAmount); }}>
              Open UPI App Instead
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
