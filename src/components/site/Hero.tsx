import heroImg from "@/assets/hero-cow.jpg";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play } from "lucide-react";

export const Hero = () => {
  const [showVideo, setShowVideo] = useState(false);
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  
  return (
    <section id="home" className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-20 group">
      <img
        src={heroImg}
        alt="Sacred Malenadu Gidda cow at a Western Ghats temple at golden hour"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        width={1920}
        height={1080}
      />
      
      {/* Dark overlay to make text readable */}
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

      {/* Play Button Overlay */}
      <button 
        onClick={() => setShowVideo(true)}
        className="absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-20 w-20 md:h-24 md:w-24 bg-primary hover:bg-primary/90 text-white rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-xl"
        aria-label="Play video"
      >
        <Play className="h-10 w-10 md:h-12 md:w-12 ml-2" fill="currentColor" />
      </button>

      <div className="container-page relative z-10 text-center text-primary-foreground py-20 mt-40">
        <p className="font-sanskrit text-xl md:text-2xl text-primary drop-shadow-lg mb-3 animate-fade-up font-bold">
          ॐ गौमाता नमः
        </p>
        <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold leading-tight drop-shadow-xl animate-fade-up">
          Protecting the Sacred
          <span className="block text-primary">Malenadu Gidda Breed</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-base md:text-lg text-primary-foreground/90 drop-shadow animate-fade-up">
          A traditional gaushala nurturing the endangered indigenous treasure of the Western Ghats —
          one sacred cow at a time.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 animate-fade-up">
          <Button onClick={() => go("donate")} variant="hero" size="lg" className="text-base shadow-lg">
            Donate Now 🙏
          </Button>
          <Button onClick={() => go("cows")} variant="outline" size="lg" className="bg-white/10 backdrop-blur-md border-white/50 text-white hover:bg-white/20 hover:text-white font-bold shadow-lg">
            Meet Our Cows
          </Button>
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-background to-transparent" />

      {/* Video Modal */}
      <Dialog open={showVideo} onOpenChange={setShowVideo}>
        <DialogContent className="max-w-4xl p-0 bg-black border-none overflow-hidden aspect-video">
          <DialogHeader className="sr-only">
            <DialogTitle>Goumandira Video</DialogTitle>
          </DialogHeader>
          {showVideo && (
            <iframe 
              width="100%" 
              height="100%" 
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" 
              title="Shreemata Goumandira Video" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};
