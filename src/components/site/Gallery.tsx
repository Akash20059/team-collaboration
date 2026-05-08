import { useEffect, useState, useRef } from "react";
import cow1 from "@/assets/cow-1.jpg";
import cow2 from "@/assets/cow-2.jpg";
import cow3 from "@/assets/cow-3.jpg";
import heroImg from "@/assets/hero-cow.jpg";
import { Play } from "lucide-react";
import { api } from "@/lib/api";

export const Gallery = () => {
  const [items, setItems] = useState<any[]>([]);
  const [videoTriggered, setVideoTriggered] = useState(false);
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVideoTriggered(true);
      },
      { threshold: 0.3 }
    );
    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, [items]);

  useEffect(() => {
    api.getGallery()
      .then(res => {
        if (res && res.length > 0) setItems(res);
        else setItems([
          { url: cow1, title: "Brown Malenadu Gidda calf in green pasture" },
          { url: cow2, title: "Black indigenous cow with calf in gaushala" },
          { url: heroImg, title: "Sacred cow at Western Ghats temple" },
          { url: cow3, title: "White humped cow grazing in Western Ghats" },
        ]);
      })
      .catch(() => {
        setItems([
          { url: cow1, title: "Brown Malenadu Gidda calf in green pasture" },
          { url: cow2, title: "Black indigenous cow with calf in gaushala" },
          { url: heroImg, title: "Sacred cow at Western Ghats temple" },
          { url: cow3, title: "White humped cow grazing in Western Ghats" },
        ]);
      });
  }, []);

  return (
    <section className="section-pad bg-gradient-warm">
      <div className="container-page">
        <div className="text-center mb-12">
          <p className="font-sanskrit text-primary text-lg">गौ दर्शन</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-secondary">Glimpses of Goumandira</h2>
          <div className="divider-lotus"><span className="text-primary">❀</span></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {items.filter(it => !/(youtube\.com|youtu\.be|vimeo\.com)/i.test(it.url)).map((it, i) => {
            return (
            <div
              key={i}
              className={`group relative overflow-hidden rounded-xl shadow-soft hover:shadow-warm transition-smooth ${
                i === 0 ? "col-span-2 row-span-2 md:col-span-2 md:row-span-2 aspect-[4/3] md:aspect-square" : "aspect-square"
              }`}
            >
              <img
                src={it.url}
                alt={it.title}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover group-hover:scale-110 transition-transform duration-700 pointer-events-none"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-secondary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          )})}
        </div>

        {(() => {
          const heroSource = items.find(it => /(youtube\.com|youtu\.be|vimeo\.com)/i.test(it.url));
          if (heroSource) {
            let embedUrl = heroSource.url;
            
            // Robust YouTube URL to Embed conversion
            const ytMatch = embedUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))((\w|-){11})/);
            if (ytMatch && ytMatch[1]) {
              embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=1`;
            } else if (embedUrl.includes("vimeo.com/")) {
               const vimeoId = embedUrl.split("vimeo.com/")[1]?.split(/[?&]/)[0];
               if (vimeoId) embedUrl = `https://player.vimeo.com/video/${vimeoId}?autoplay=1&muted=1`;
            }

            return (
              <div ref={videoRef} className="mt-6 relative aspect-video rounded-2xl overflow-hidden bg-secondary shadow-warm flex items-center justify-center">
                {videoTriggered ? (
                  <iframe
                    src={embedUrl}
                    title={heroSource.title || "Video"}
                    className="absolute inset-0 h-full w-full object-cover z-20 pointer-events-auto"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                    <div className="animate-pulse w-16 h-16 rounded-full bg-primary/40" />
                  </div>
                )}
              </div>
            )
          }

          return (
            <div className="mt-6 relative aspect-video rounded-2xl overflow-hidden bg-secondary shadow-warm flex items-center justify-center">
              <img src={heroImg} alt="Video preview of gaushala life" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-70" />
              <button className="relative z-10 h-20 w-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-glow animate-float hover:scale-110 transition-smooth cursor-default pointer-events-none fade-in">
                <Play className="h-8 w-8 ml-1" />
              </button>
              <div className="absolute bottom-4 left-4 text-primary-foreground font-display text-lg drop-shadow">A day at our gaushala</div>
            </div>
          )
        })()}

      </div>
    </section>
  );
};
