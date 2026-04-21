import { Star } from "lucide-react";

const testimonials = [
  { name: "Anjali Sharma", place: "Bengaluru, KA", quote: "Visiting Goumandira felt like stepping into another era — peaceful, sacred and full of love for these gentle cows." },
  { name: "Ramesh Kulkarni", place: "Shivamogga, KA", quote: "The dedication to preserving Malenadu Gidda is inspiring. Their A2 ghee is pure divinity." },
  { name: "Priya Nair", place: "Mumbai, MH", quote: "I adopted a cow last month. The updates and photos make me feel deeply connected to this noble cause." },
  { name: "Suresh Hegde", place: "Sirsi, KA", quote: "A model gaushala. Clean, ethical, and rooted in our beautiful tradition." },
];

export const Testimonials = () => (
  <section className="section-pad bg-gradient-warm">
    <div className="container-page max-w-6xl">
      <div className="text-center mb-12">
        <p className="font-sanskrit text-primary text-lg">अनुभव</p>
        <h2 className="font-display text-3xl md:text-5xl font-bold text-secondary">What Our Visitors Say</h2>
        <div className="divider-lotus"><span className="text-primary text-xl">💬</span></div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {testimonials.map((t) => (
          <div key={t.name} className="bg-card rounded-2xl p-6 shadow-soft hover:shadow-warm transition-smooth border border-border/60 flex flex-col">
            <div className="flex gap-0.5 text-accent mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4" fill="currentColor" />
              ))}
            </div>
            <p className="text-sm text-foreground/85 italic flex-1">"{t.quote}"</p>
            <div className="mt-5 flex items-center gap-3 pt-4 border-t border-border/60">
              <div className="h-10 w-10 rounded-full bg-gradient-saffron text-primary-foreground flex items-center justify-center font-bold">
                {t.name.charAt(0)}
              </div>
              <div>
                <div className="font-semibold text-secondary text-sm">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.place}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
