import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Droplets, Weight, Calendar, Leaf, Stethoscope } from "lucide-react";
import { getCows, type Cow } from "@/lib/adminStore";

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  healthy: { label: "✅ Healthy", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  under_treatment: { label: "🩺 Under Care", color: "text-rose-600 bg-rose-50 border-rose-200" },
  pregnant: { label: "🤰 Pregnant", color: "text-violet-600 bg-violet-50 border-violet-200" },
  new_born: { label: "🐣 New Born", color: "text-amber-600 bg-amber-50 border-amber-200" },
};

const BADGE_COLORS = ["bg-emerald-500", "bg-violet-500", "bg-amber-500", "bg-sky-500", "bg-rose-500", "bg-teal-500"];

export const Cows = () => {
  const [cows, setCows] = useState<Cow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCows(getCows());
    setLoading(false);
  }, []);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  if (loading) {
    return (
      <section id="cows" className="section-pad bg-background">
        <div className="container-page text-center text-muted-foreground py-12">Loading...</div>
      </section>
    );
  }

  return (
    <section id="cows" className="section-pad bg-background">
      <div className="container-page">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="font-sanskrit text-primary text-lg">गौमाता</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-secondary mt-1">
            Meet Our Sacred Cows
          </h2>
          <div className="divider-lotus"><span className="text-primary text-xl">🐄</span></div>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Each one cared for as a member of our family — nurtured with love, fed with organic
            fodder, and blessed daily with vedic rituals.
          </p>
        </div>

        {cows.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">No cows yet. Check back soon 🙏</div>
        ) : (
          /* Cow Cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {cows.map((c, i) => {
              const status = STATUS_LABEL[c.health_status] || STATUS_LABEL.healthy;
              const badgeColor = BADGE_COLORS[i % BADGE_COLORS.length];
              return (
                <div
                  key={c.id}
                  className="group bg-card border border-border/60 rounded-3xl overflow-hidden shadow-soft hover:shadow-warm hover:-translate-y-2 transition-all duration-300 flex flex-col"
                >
                  {/* Photo */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {c.photo_url ? (
                      <img
                        src={c.photo_url}
                        alt={`${c.name}, ${c.breed} cow #${c.cow_number}`}
                        loading="lazy"
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="h-full w-full bg-muted flex items-center justify-center text-6xl">🐄</div>
                    )}
                    {/* Number badge */}
                    <div className={`absolute top-3 left-3 h-9 w-9 rounded-full ${badgeColor} text-white font-bold text-sm flex items-center justify-center shadow-lg`}>
                      #{c.cow_number}
                    </div>
                    {/* Adopted badge */}
                    {c.is_adopted && (
                      <span className="absolute top-3 right-3 bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full shadow">
                        💛 Adopted
                      </span>
                    )}
                    {/* Under treatment subtle indicator */}
                    {c.health_status === "under_treatment" && !c.is_adopted && (
                      <span className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm text-rose-500 text-xs px-2 py-1 rounded-full shadow flex items-center gap-1">
                        <Stethoscope className="h-3 w-3" /> Care
                      </span>
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    {/* Name overlay */}
                    <div className="absolute bottom-3 left-4">
                      <h3 className="font-display text-2xl font-bold text-white drop-shadow-lg">{c.name}</h3>
                      <p className="text-white/80 text-xs font-medium">{c.breed}</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-5 flex flex-col gap-4 flex-1">
                    {/* Health status pill */}
                    <span className={`self-start text-xs font-semibold px-3 py-1 rounded-full border ${status.color}`}>
                      {status.label}
                    </span>

                    {/* Parents */}
                    {(c.father_name || c.mother_name) && (
                      <div className="text-xs text-muted-foreground bg-muted/40 rounded-lg p-2 flex flex-wrap gap-x-4 gap-y-1 justify-center border border-border/40 text-center">
                        {c.father_name && <span><strong className="text-secondary/80 font-semibold uppercase tracking-wide">Father:</strong> {c.father_name}</span>}
                        {c.mother_name && <span><strong className="text-secondary/80 font-semibold uppercase tracking-wide">Mother:</strong> {c.mother_name}</span>}
                      </div>
                    )}

                    {/* Stats grid */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-muted/50 rounded-xl p-3 text-center">
                        <Calendar className="h-4 w-4 text-primary mx-auto mb-1" />
                        <div className="text-xs text-muted-foreground">Age</div>
                        <div className="text-sm font-bold text-secondary">{c.age || "—"}</div>
                      </div>
                      <div className="bg-muted/50 rounded-xl p-3 text-center">
                        <Weight className="h-4 w-4 text-primary mx-auto mb-1" />
                        <div className="text-xs text-muted-foreground">Weight</div>
                        <div className="text-sm font-bold text-secondary">{c.weight_kg ? `${c.weight_kg} kg` : "—"}</div>
                      </div>
                      <div className="bg-muted/50 rounded-xl p-3 text-center">
                        <Droplets className="h-4 w-4 text-primary mx-auto mb-1" />
                        <div className="text-xs text-muted-foreground">Milk</div>
                        <div className="text-sm font-bold text-secondary">{c.milk_yield_litres ? `${c.milk_yield_litres} L` : "—"}</div>
                      </div>
                    </div>

                    {/* Notes */}
                    {c.notes && (
                      <div className="flex gap-2 bg-primary/5 border border-primary/10 rounded-xl p-3">
                        <Leaf className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground italic leading-snug">"{c.notes}"</p>
                      </div>
                    )}

                    {/* Adopt button */}
                    <div className="mt-auto">
                      {!c.is_adopted ? (
                        <Button
                          onClick={() => go("donate")}
                          variant="hero"
                          className="w-full"
                        >
                          <Heart className="h-4 w-4" fill="currentColor" />
                          Adopt {c.name} — ₹12,000/yr
                        </Button>
                      ) : (
                        <div className="w-full text-center text-sm text-muted-foreground font-medium py-2 bg-muted rounded-xl">
                          💛 Lovingly Adopted
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-14 text-center">
          <p className="text-muted-foreground mb-4">
            More cows will be added as our Gaushala grows 🙏
          </p>
          <Button onClick={() => go("donate")} variant="outline" size="lg">
            Support Our Herd
          </Button>
        </div>
      </div>
    </section>
  );
};
