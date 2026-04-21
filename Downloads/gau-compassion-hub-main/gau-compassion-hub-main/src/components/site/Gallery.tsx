import cow1 from "@/assets/cow-1.jpg";
import cow2 from "@/assets/cow-2.jpg";
import cow3 from "@/assets/cow-3.jpg";
import heroImg from "@/assets/hero-cow.jpg";
import { Play } from "lucide-react";

export const Gallery = () => {
  const items = [
    { src: cow1, alt: "Brown Malenadu Gidda calf in green pasture" },
    { src: cow2, alt: "Black indigenous cow with calf in gaushala" },
    { src: heroImg, alt: "Sacred cow at Western Ghats temple" },
    { src: cow3, alt: "White humped cow grazing in Western Ghats" },
  ];
  return (
    <section className="section-pad bg-gradient-warm">
      <div className="container-page">
        <div className="text-center mb-12">
          <p className="font-sanskrit text-primary text-lg">गौ दर्शन</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-secondary">Glimpses of Goumandira</h2>
          <div className="divider-lotus"><span className="text-primary">❀</span></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {items.map((it, i) => (
            <div
              key={i}
              className={`group relative overflow-hidden rounded-xl shadow-soft hover:shadow-warm transition-smooth ${
                i === 0 ? "col-span-2 row-span-2 md:col-span-2 md:row-span-2 aspect-square" : "aspect-square"
              }`}
            >
              <img
                src={it.src}
                alt={it.alt}
                loading="lazy"
                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-secondary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>

        <div className="mt-6 relative aspect-video rounded-2xl overflow-hidden bg-secondary shadow-warm flex items-center justify-center">
          <img src={heroImg} alt="Video preview of gaushala life" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-70" />
          <button className="relative z-10 h-20 w-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-glow animate-float hover:scale-110 transition-smooth">
            <Play className="h-8 w-8 ml-1" />
          </button>
          <div className="absolute bottom-4 left-4 text-primary-foreground font-display text-lg drop-shadow">A day at our gaushala</div>
        </div>
      </div>
    </section>
  );
};
