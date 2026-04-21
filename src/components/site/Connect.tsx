import { MessageCircle, Facebook, Instagram, MapPin, Mail } from "lucide-react";

const links = [
  { label: "WhatsApp Group", Icon: MessageCircle, color: "bg-[hsl(142_70%_45%)] text-white" },
  { label: "Facebook", Icon: Facebook, color: "bg-[hsl(220_75%_50%)] text-white" },
  { label: "Instagram", Icon: Instagram, color: "bg-gradient-to-br from-[hsl(330_80%_55%)] to-[hsl(25_95%_55%)] text-white" },
  { label: "Google Maps", Icon: MapPin, color: "bg-[hsl(0_70%_50%)] text-white" },
  { label: "Email Us", Icon: Mail, color: "bg-secondary text-secondary-foreground" },
];

export const Connect = () => (
  <section id="connect" className="section-pad bg-background">
    <div className="container-page max-w-5xl">
      <div className="text-center mb-12">
        <p className="font-sanskrit text-primary text-lg">सत्संग</p>
        <h2 className="font-display text-3xl md:text-5xl font-bold text-secondary">Join Our Community</h2>
        <div className="divider-lotus"><span className="text-primary text-xl">🔗</span></div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
        {links.map(({ label, Icon, color }) => (
          <a
            key={label}
            href="#"
            className={`inline-flex items-center gap-2 rounded-full px-5 py-3 font-medium shadow-soft hover:shadow-warm hover:-translate-y-0.5 transition-smooth ${color}`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </a>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden shadow-warm border border-border/60 aspect-[16/9]">
        <iframe
          title="Goumandira location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d62421.36!2d75.2!3d13.3!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDE4JzAwLjAiTiA3NcKwMTInMDAuMCJF!5e0!3m2!1sen!2sin!4v1700000000000"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  </section>
);
