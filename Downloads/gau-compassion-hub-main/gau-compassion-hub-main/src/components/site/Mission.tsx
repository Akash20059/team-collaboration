import { Heart, Sparkles, Leaf } from "lucide-react";

export const Mission = () => (
  <section className="py-12 md:py-16 bg-background">
    <div className="container-page">
      <div className="relative mx-auto max-w-4xl rounded-3xl bg-gradient-saffron p-1 shadow-warm">
        <div className="rounded-[calc(1.5rem-4px)] bg-card p-8 md:p-12 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-divine text-primary-foreground shadow-glow mb-4">
            <Heart className="h-7 w-7" fill="currentColor" />
          </div>
          <p className="font-sanskrit text-primary text-lg mb-2">हमारा संकल्प</p>
          <h3 className="font-display text-2xl md:text-4xl font-bold text-secondary leading-snug">
            "To protect and conserve the Malenadu Gidda cattle breed —
            <span className="text-primary"> an endangered indigenous treasure </span>
            of the Western Ghats."
          </h3>
          <div className="mt-8 grid sm:grid-cols-3 gap-6 text-left">
            <div className="flex items-start gap-3">
              <Leaf className="h-6 w-6 text-secondary shrink-0 mt-1" />
              <div>
                <div className="font-semibold text-foreground">Native Conservation</div>
                <div className="text-sm text-muted-foreground">Preserving genetic heritage</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Sparkles className="h-6 w-6 text-primary shrink-0 mt-1" />
              <div>
                <div className="font-semibold text-foreground">Pure A2 Milk</div>
                <div className="text-sm text-muted-foreground">Healthy & traditional</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Heart className="h-6 w-6 text-maroon shrink-0 mt-1" />
              <div>
                <div className="font-semibold text-foreground">Sacred Care</div>
                <div className="text-sm text-muted-foreground">Loving lifelong shelter</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);
