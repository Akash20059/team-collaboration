import heroImg from "@/assets/hero-cow.jpg";
import { Button } from "@/components/ui/button";

export const Hero = () => {
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  return (
    <section id="home" className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-20">
      <img
        src={heroImg}
        alt="Sacred Malenadu Gidda cow at a Western Ghats temple at golden hour"
        className="absolute inset-0 h-full w-full object-cover"
        width={1920}
        height={1080}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/40 via-secondary/30 to-background" />
      <div className="absolute inset-0 bg-gradient-to-r from-maroon/40 via-transparent to-transparent" />

      <div className="container-page relative z-10 text-center text-primary-foreground py-20">
        <p className="font-sanskrit text-xl md:text-2xl text-accent drop-shadow-lg mb-3 animate-fade-up">
          ॐ गौमाता नमः
        </p>
        <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold leading-tight drop-shadow-xl animate-fade-up">
          Protecting the Sacred
          <span className="block text-accent">Malenadu Gidda Breed</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-base md:text-lg text-primary-foreground/90 drop-shadow animate-fade-up">
          A traditional gaushala nurturing the endangered indigenous treasure of the Western Ghats —
          one sacred cow at a time.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 animate-fade-up">
          <Button onClick={() => go("donate")} variant="hero" size="lg" className="text-base">
            Donate Now 🙏
          </Button>
          <Button onClick={() => go("cows")} variant="outline" size="lg" className="bg-background/20 border-primary-foreground/60 text-primary-foreground hover:bg-background hover:text-foreground backdrop-blur">
            Meet Our Cows
          </Button>
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};
