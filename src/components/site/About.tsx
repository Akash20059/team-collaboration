import { Calendar, Shield, Home } from "lucide-react";

export const About = () => (
  <section id="about" className="section-pad bg-gradient-warm">
    <div className="container-page max-w-5xl">
      <div className="text-center mb-10">
        <p className="font-sanskrit text-primary text-lg">परिचय</p>
        <h2 className="font-display text-3xl md:text-5xl font-bold text-secondary">About Shreemata Goumandira</h2>
        <div className="divider-lotus"><span className="text-primary text-xl">🪷</span></div>
        <p className="text-muted-foreground max-w-3xl mx-auto text-base md:text-lg leading-relaxed">
          Goumandira was founded in <strong className="text-secondary">November 2025</strong>. Our gaushala's primary
          objective is to conserve the endangered indigenous breed,{" "}
          <strong className="text-primary">Malenadu Gidda</strong>, and develop cows that yield high-quality{" "}
          <strong className="text-secondary">A2 milk</strong> — naturally, ethically and with reverence.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-5 md:gap-6">
        {[
          { Icon: Calendar, title: "Year Founded", value: "November 2025", color: "text-primary" },
          { Icon: Shield, title: "Breed Conserved", value: "Malenadu Gidda", color: "text-secondary" },
          { Icon: Home, title: "Cows Sheltered", value: "28 Sacred Cows", color: "text-maroon" },
        ].map(({ Icon, title, value, color }) => (
          <div
            key={title}
            className="bg-card rounded-2xl p-6 text-center shadow-soft hover:shadow-warm transition-smooth border border-border/60"
          >
            <div className={`mx-auto h-14 w-14 rounded-full bg-muted flex items-center justify-center ${color}`}>
              <Icon className="h-7 w-7" />
            </div>
            <div className="mt-4 text-sm font-medium text-muted-foreground uppercase tracking-wide">{title}</div>
            <div className="mt-1 font-display text-xl font-bold text-foreground">{value}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
