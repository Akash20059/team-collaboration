import { MessageCircle, Heart } from "lucide-react";

export const FloatingActions = () => {
  const goDonate = () => document.getElementById("donate")?.scrollIntoView({ behavior: "smooth" });
  return (
    <>
      <a
        href="#"
        aria-label="WhatsApp chat"
        className="fixed bottom-5 left-5 z-40 h-14 w-14 rounded-full bg-[hsl(142_70%_45%)] text-white shadow-warm hover:scale-110 transition-smooth flex items-center justify-center animate-float"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
      <button
        onClick={goDonate}
        aria-label="Donate now"
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-gradient-saffron text-primary-foreground font-semibold px-5 h-14 shadow-glow hover:scale-105 transition-smooth"
      >
        <Heart className="h-5 w-5" fill="currentColor" />
        Donate 🙏
      </button>
    </>
  );
};
