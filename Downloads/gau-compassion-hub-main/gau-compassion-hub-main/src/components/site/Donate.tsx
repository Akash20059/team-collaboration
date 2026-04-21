import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CheckCircle2, QrCode, Heart } from "lucide-react";

const amounts = [500, 1000, 5000, 12000];

export const Donate = () => {
  const [selected, setSelected] = useState<number | "custom">(1000);
  const [custom, setCustom] = useState("");

  return (
    <section id="donate" className="section-pad bg-gradient-warm">
      <div className="container-page max-w-6xl">
        <div className="text-center mb-12">
          <p className="font-sanskrit text-primary text-lg">सेवा</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-secondary">Support Our Mission</h2>
          <div className="divider-lotus"><span className="text-primary text-xl">🙏</span></div>
          <p className="text-muted-foreground max-w-xl mx-auto">Every contribution feeds, shelters and protects a sacred life.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* QR */}
          <div className="bg-card rounded-3xl p-8 shadow-soft border border-border/60 flex flex-col items-center text-center">
            <h3 className="font-display text-2xl font-bold text-secondary">Scan to Donate via UPI</h3>
            <div className="mt-6 relative aspect-square w-64 max-w-full rounded-2xl bg-gradient-saffron p-1 shadow-warm">
              <div className="h-full w-full rounded-[calc(1rem-4px)] bg-background flex items-center justify-center">
                <QrCode className="h-32 w-32 text-secondary" strokeWidth={1.2} />
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">UPI ID: <span className="font-mono text-foreground">goumandira@upi</span></p>
            <div className="mt-4 flex items-center gap-2 text-sm text-secondary">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              You'll receive a donation receipt on WhatsApp/Email
            </div>
          </div>

          {/* Amount + Tabs */}
          <div className="bg-card rounded-3xl p-8 shadow-soft border border-border/60">
            <Tabs defaultValue="onetime" className="w-full">
              <TabsList className="grid grid-cols-2 w-full bg-muted">
                <TabsTrigger value="onetime">One-Time</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
              </TabsList>
              <TabsContent value="onetime" className="mt-6 space-y-5">
                <AmountSelect selected={selected} setSelected={setSelected} custom={custom} setCustom={setCustom} />
              </TabsContent>
              <TabsContent value="monthly" className="mt-6 space-y-5">
                <p className="text-sm text-muted-foreground">Become a monthly Goumitra. Sustained care, every month.</p>
                <AmountSelect selected={selected} setSelected={setSelected} custom={custom} setCustom={setCustom} />
              </TabsContent>
            </Tabs>

            <Button variant="hero" size="lg" className="w-full mt-6">Donate 🙏</Button>

            <div className="mt-6 rounded-2xl bg-gradient-divine p-1">
              <div className="rounded-[calc(1rem-4px)] bg-card p-5">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0">
                    <Heart className="h-5 w-5" fill="currentColor" />
                  </div>
                  <div>
                    <h4 className="font-display text-lg font-bold text-secondary">🐄 Adopt 1 Cow for ₹12,000/year</h4>
                    <p className="text-sm text-muted-foreground mt-1">Help us feed and care for one sacred Malenadu Gidda for an entire year.</p>
                    <Button variant="temple" size="sm" className="mt-3">Adopt Now</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const AmountSelect = ({
  selected, setSelected, custom, setCustom,
}: {
  selected: number | "custom";
  setSelected: (v: number | "custom") => void;
  custom: string;
  setCustom: (v: string) => void;
}) => (
  <>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {amounts.map((a) => (
        <button
          key={a}
          onClick={() => setSelected(a)}
          className={`rounded-xl border-2 py-3 font-semibold transition-smooth ${
            selected === a
              ? "border-primary bg-primary text-primary-foreground shadow-warm"
              : "border-border bg-background hover:border-primary/60"
          }`}
        >
          ₹{a.toLocaleString("en-IN")}
        </button>
      ))}
    </div>
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Or</span>
      <input
        type="number"
        placeholder="Custom amount"
        value={custom}
        onChange={(e) => { setCustom(e.target.value); setSelected("custom"); }}
        className="flex-1 rounded-xl border-2 border-border bg-background px-4 py-3 outline-none focus:border-primary"
      />
    </div>
  </>
);
