import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import cow1 from "@/assets/cow-1.jpg";
import cow2 from "@/assets/cow-2.jpg";
import cow3 from "@/assets/cow-3.jpg";

const FALLBACK = [cow1, cow2, cow3];

interface Cow {
  id: string;
  cow_number: number;
  name: string;
  age: string | null;
  weight_kg: number | null;
  milk_yield_litres: number | null;
  health_status: "healthy" | "under_treatment" | "pregnant" | "new_born";
  is_adopted: boolean;
  photo_url: string | null;
  notes: string | null;
}

export const Cows = () => {
  const [cows, setCows] = useState<Cow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("cows")
      .select("*")
      .order("cow_number", { ascending: true })
      .then(({ data }) => {
        if (data) setCows(data as Cow[]);
        setLoading(false);
      });
  }, []);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="cows" className="section-pad bg-background">
      <div className="container-page">
        <div className="text-center mb-12">
          <p className="font-sanskrit text-primary text-lg">गौमाता</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-secondary">Meet Our Sacred Cows</h2>
          <div className="divider-lotus"><span className="text-primary text-xl">🐄</span></div>
          <p className="text-muted-foreground max-w-2xl mx-auto">Each one cared for as a member of our family.</p>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground py-12">Loading cows...</div>
        ) : cows.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">Cow profiles coming soon 🐄</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {cows.map((c, i) => {
              const photo = c.photo_url || FALLBACK[i % FALLBACK.length];
              return (
                <div key={c.id} className="group bg-card border border-border/60 rounded-2xl overflow-hidden shadow-soft hover:shadow-warm hover:-translate-y-1 transition-smooth">
                  <div className="relative aspect-square overflow-hidden">
                    <img src={photo} alt={`${c.name}, Malenadu Gidda cow #${c.cow_number}`} loading="lazy" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute top-2 left-2 h-9 w-9 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center shadow-warm">
                      {c.cow_number}
                    </div>
                    {c.is_adopted && (
                      <span className="absolute top-2 right-2 bg-accent text-accent-foreground text-[10px] font-semibold px-2 py-1 rounded-full">💛 Adopted</span>
                    )}
                    {c.health_status === "under_treatment" && (
                      <span className="absolute bottom-2 right-2 h-3 w-3 rounded-full bg-destructive border-2 border-background" title="Under care" />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-display text-lg font-bold text-secondary">{c.name}</h3>
                    <dl className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-muted-foreground">
                      {c.age && <div><dt className="inline font-medium text-foreground">Age:</dt> <dd className="inline">{c.age}</dd></div>}
                      {c.weight_kg && <div><dt className="inline font-medium text-foreground">Wt:</dt> <dd className="inline">{c.weight_kg}kg</dd></div>}
                      {c.milk_yield_litres && <div className="col-span-2"><dt className="inline font-medium text-foreground">Milk:</dt> <dd className="inline">{c.milk_yield_litres} L/day</dd></div>}
                      {c.notes && <div className="col-span-2 italic">"{c.notes}"</div>}
                    </dl>
                    {!c.is_adopted && (
                      <Button onClick={() => go("donate")} variant="hero" size="sm" className="mt-3 w-full text-xs">
                        <Heart className="h-3 w-3" fill="currentColor" /> Adopt
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
