import { Button } from "@/components/ui/button";
import { Heart, Droplets, Weight, Calendar, Leaf } from "lucide-react";
import cow1 from "@/assets/cow-1.jpg";
import cow2 from "@/assets/cow-2.jpg";
import cow3 from "@/assets/cow-3.jpg";

const COWS = [
  {
    id: "1",
    cow_number: 1,
    name: "Gowri",
    age: "4 years",
    weight_kg: 210,
    milk_yield_litres: 3.5,
    health_status: "healthy" as const,
    is_adopted: false,
    breed: "Malenadu Gidda",
    photo: cow1,
    notes: "Gentle and calm, loves morning grazing in the forest meadow.",
    badge_color: "bg-emerald-500",
  },
  {
    id: "2",
    cow_number: 2,
    name: "Kamadhenu",
    age: "6 years",
    weight_kg: 245,
    milk_yield_litres: 4.2,
    health_status: "pregnant" as const,
    is_adopted: true,
    breed: "Malenadu Gidda",
    photo: cow2,
    notes: "Expecting her second calf. She enjoys the evening temple bells.",
    badge_color: "bg-violet-500",
  },
  {
    id: "3",
    cow_number: 3,
    name: "Nandini",
    age: "3 years",
    weight_kg: 185,
    milk_yield_litres: 2.8,
    health_status: "healthy" as const,
    is_adopted: false,
    breed: "Malenadu Gidda",
    photo: cow3,
    notes: "Young and spirited — the youngest of our sacred herd.",
    badge_color: "bg-amber-500",
  },
];

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  healthy: { label: "✅ Healthy", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  under_treatment: { label: "🩺 Under Care", color: "text-rose-600 bg-rose-50 border-rose-200" },
  pregnant: { label: "🤰 Pregnant", color: "text-violet-600 bg-violet-50 border-violet-200" },
  new_born: { label: "🐣 New Born", color: "text-amber-600 bg-amber-50 border-amber-200" },
};

export const Cows = () => {
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

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

        {/* Cow Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {COWS.map((c) => {
            const status = STATUS_LABEL[c.health_status];
            return (
              <div
                key={c.id}
                className="group bg-card border border-border/60 rounded-3xl overflow-hidden shadow-soft hover:shadow-warm hover:-translate-y-2 transition-all duration-300 flex flex-col"
              >
                {/* Photo */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={c.photo}
                    alt={`${c.name}, Malenadu Gidda cow #${c.cow_number}`}
                    loading="lazy"
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Number badge */}
                  <div className={`absolute top-3 left-3 h-9 w-9 rounded-full ${c.badge_color} text-white font-bold text-sm flex items-center justify-center shadow-lg`}>
                    #{c.cow_number}
                  </div>
                  {/* Adopted badge */}
                  {c.is_adopted && (
                    <span className="absolute top-3 right-3 bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full shadow">
                      💛 Adopted
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

                  {/* Stats grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-muted/50 rounded-xl p-3 text-center">
                      <Calendar className="h-4 w-4 text-primary mx-auto mb-1" />
                      <div className="text-xs text-muted-foreground">Age</div>
                      <div className="text-sm font-bold text-secondary">{c.age}</div>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-3 text-center">
                      <Weight className="h-4 w-4 text-primary mx-auto mb-1" />
                      <div className="text-xs text-muted-foreground">Weight</div>
                      <div className="text-sm font-bold text-secondary">{c.weight_kg} kg</div>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-3 text-center">
                      <Droplets className="h-4 w-4 text-primary mx-auto mb-1" />
                      <div className="text-xs text-muted-foreground">Milk</div>
                      <div className="text-sm font-bold text-secondary">{c.milk_yield_litres} L</div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="flex gap-2 bg-primary/5 border border-primary/10 rounded-xl p-3">
                    <Leaf className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground italic leading-snug">"{c.notes}"</p>
                  </div>

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
