import { useEffect, useState } from "react";
import { getDonors } from "@/lib/adminStore";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Heart, Repeat, Star, Loader2 } from "lucide-react";
import { formatINR } from "@/lib/config";
import { supabase } from "@/integrations/supabase/client";

type DisplayDonor = {
  id: string;
  name: string;
  type: "one-time" | "monthly";
  amount: number;
  donated_at: string;
  message?: string;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

const DonorCard = ({ donor }: { donor: DisplayDonor }) => (
  <div className="bg-card rounded-2xl border border-border/60 shadow-soft p-5 flex items-start gap-4 hover:shadow-warm transition-smooth">
    <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${
      donor.type === "monthly" ? "bg-primary/15 text-primary" : "bg-accent/30 text-secondary"
    }`}>
      {donor.type === "monthly" ? <Repeat className="h-5 w-5" /> : <Star className="h-5 w-5" />}
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-display font-bold text-secondary text-lg truncate">{donor.name}</p>
      <div className="flex flex-wrap items-center gap-2 mt-1">
        {donor.type === "monthly" ? (
          <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">
            <Repeat className="h-3 w-3" /> Monthly Goumitra — {formatINR(donor.amount)}/month
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 bg-accent/30 text-secondary text-xs font-semibold px-2 py-0.5 rounded-full">
            <Heart className="h-3 w-3" /> One-Time Supporter — {formatINR(donor.amount)}
          </span>
        )}
        <span className="text-xs text-muted-foreground">{formatDate(donor.donated_at)}</span>
      </div>
      {donor.message && (
        <p className="mt-2 text-sm text-muted-foreground italic">"{donor.message}"</p>
      )}
    </div>
  </div>
);

const Donators = () => {
  const [donors, setDonors] = useState<DisplayDonor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonors = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sb = supabase as any;
        const [monthlyRes, oneTimeRes] = await Promise.all([
          sb.from("monthly_donors").select("id, name, amount, created_at").eq("is_active", true),
          sb.from("one_time_donations").select("id, name, amount, donated_at, message"),
        ]);

        const fromSupabase: DisplayDonor[] = [
          ...((monthlyRes.data ?? []) as Array<{ id: string; name: string; amount: number; created_at: string }>).map((d) => ({
            id: `m-${d.id}`,
            name: d.name,
            type: "monthly" as const,
            amount: d.amount,
            donated_at: d.created_at,
          })),
          ...((oneTimeRes.data ?? []) as Array<{ id: string; name: string; amount: number; donated_at: string; message: string | null }>).map((d) => ({
            id: `o-${d.id}`,
            name: d.name,
            type: "one-time" as const,
            amount: d.amount,
            donated_at: d.donated_at,
            message: d.message ?? undefined,
          })),
        ];

        // Merge with admin-curated donors from localStorage
        const adminList: DisplayDonor[] = getDonors().map((d) => ({
          id: `a-${d.id}`,
          name: d.name,
          type: d.type,
          amount: d.amount,
          donated_at: d.donated_at,
          message: d.message,
        }));

        const combined = [...fromSupabase, ...adminList].sort(
          (a, b) => new Date(b.donated_at).getTime() - new Date(a.donated_at).getTime()
        );
        setDonors(combined);
      } catch (err) {
        console.error("Failed to load donors:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDonors();
  }, []);

  const monthly = donors.filter((d) => d.type === "monthly");
  const onetime = donors.filter((d) => d.type === "one-time");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container-page max-w-3xl">
          <div className="text-center mb-12">
            <p className="font-sanskrit text-primary text-lg">दानवीर</p>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-secondary mt-1">Our Donators</h1>
            <div className="divider-lotus"><span className="text-primary text-xl">🙏</span></div>
            <p className="text-muted-foreground max-w-xl mx-auto">
              With deep gratitude, we honour the generous souls who support our sacred mission.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20 text-muted-foreground">
              <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
              <p className="mt-3 text-sm">Loading donors...</p>
            </div>
          ) : donors.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Heart className="h-12 w-12 mx-auto mb-4 text-primary/40" />
              <p className="text-lg">No donations recorded yet.</p>
              <p className="text-sm mt-1">Be the first to contribute! 🙏</p>
            </div>
          ) : (
            <div className="space-y-10">
              {monthly.length > 0 && (
                <section>
                  <h2 className="font-display text-xl font-bold text-secondary mb-4 flex items-center gap-2">
                    <Repeat className="h-5 w-5 text-primary" /> Monthly Goumitras
                    <span className="text-sm font-normal text-muted-foreground">({monthly.length})</span>
                  </h2>
                  <div className="space-y-3">
                    {monthly.map((d) => <DonorCard key={d.id} donor={d} />)}
                  </div>
                </section>
              )}

              {onetime.length > 0 && (
                <section>
                  <h2 className="font-display text-xl font-bold text-secondary mb-4 flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" /> One-Time Supporters
                    <span className="text-sm font-normal text-muted-foreground">({onetime.length})</span>
                  </h2>
                  <div className="space-y-3">
                    {onetime.map((d) => <DonorCard key={d.id} donor={d} />)}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Donators;
