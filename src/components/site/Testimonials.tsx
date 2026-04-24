import { useState } from "react";
import { Star, ChevronDown, ChevronUp, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Review {
  id: string;
  name: string;
  place: string;
  rating: number;
  quote: string;
  date: string;
}

const STORAGE_KEY = "goumandira_reviews";

const DEFAULT_REVIEWS: Review[] = [
  { id: "1", name: "Anjali Sharma",   place: "Bengaluru, KA",  rating: 5, quote: "Visiting Goumandira felt like stepping into another era — peaceful, sacred and full of love for these gentle cows.", date: "2026-04-10" },
  { id: "2", name: "Ramesh Kulkarni", place: "Shivamogga, KA", rating: 5, quote: "The dedication to preserving Malenadu Gidda is inspiring. Their A2 ghee is pure divinity.", date: "2026-04-08" },
  { id: "3", name: "Priya Nair",      place: "Mumbai, MH",     rating: 5, quote: "I adopted a cow last month. The updates and photos make me feel deeply connected to this noble cause.", date: "2026-04-05" },
  { id: "4", name: "Suresh Hegde",    place: "Sirsi, KA",      rating: 5, quote: "A model gaushala. Clean, ethical, and rooted in our beautiful tradition.", date: "2026-04-01" },
];

function getReviews(): Review[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_REVIEWS;
  } catch {
    return DEFAULT_REVIEWS;
  }
}

function saveReviews(reviews: Review[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
}

const StarPicker = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-125"
        >
          <Star
            className="h-7 w-7"
            fill={(hovered || value) >= s ? "hsl(45 95% 55%)" : "none"}
            stroke={(hovered || value) >= s ? "hsl(45 95% 55%)" : "hsl(var(--muted-foreground))"}
          />
        </button>
      ))}
    </div>
  );
};

export const Testimonials = () => {
  const [reviews, setReviews]       = useState<Review[]>(getReviews);
  const [showAll, setShowAll]       = useState(false);
  const [name, setName]             = useState("");
  const [place, setPlace]           = useState("");
  const [quote, setQuote]           = useState("");
  const [rating, setRating]         = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating)       return toast.error("Please select a star rating");
    if (!name.trim())  return toast.error("Please enter your name");
    if (!quote.trim()) return toast.error("Please enter your opinion");

    const newReview: Review = {
      id: Date.now().toString(),
      name: name.trim(),
      place: place.trim() || "India",
      rating,
      quote: quote.trim(),
      date: new Date().toISOString().slice(0, 10),
    };

    const updated = [newReview, ...reviews];
    setReviews(updated);
    saveReviews(updated);
    setName(""); setPlace(""); setQuote(""); setRating(0);
    toast.success("🙏 Thank you for your feedback!");
  };

  const featured = reviews.slice(0, 4);
  const extra    = reviews.slice(4);

  return (
    <section className="section-pad bg-gradient-warm">
      <div className="container-page max-w-6xl">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="font-sanskrit text-primary text-lg">अनुभव</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-secondary">What Our Visitors Say</h2>
          <div className="divider-lotus"><span className="text-primary text-xl">💬</span></div>
        </div>

        {/* Featured reviews grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featured.map((t) => (
            <ReviewCard key={t.id} review={t} />
          ))}
        </div>

        {/* Dropdown: show all reviews */}
        {extra.length > 0 && (
          <div className="mt-6">
            {!showAll && (
              <div className="flex justify-center">
                <button
                  onClick={() => setShowAll(true)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-transparent border border-primary/40 rounded-full text-primary font-semibold hover:bg-primary/5 transition-colors text-sm"
                >
                  <span>Show all {reviews.length} reviews</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            )}

            {showAll && (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {extra.map((t) => (
                    <ReviewCard key={t.id} review={t} />
                  ))}
                </div>
                <div className="flex justify-center mt-5">
                  <button
                    onClick={() => setShowAll(false)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-transparent border border-primary/40 rounded-full text-primary font-semibold hover:bg-primary/5 transition-colors text-sm"
                  >
                    <span>Hide</span>
                    <ChevronUp className="h-4 w-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Submit review form */}
        <div className="mt-12 bg-white/80 backdrop-blur border border-border/60 rounded-3xl shadow-soft p-6 md:p-8 max-w-2xl mx-auto">
          <h3 className="font-display text-2xl font-bold text-secondary mb-1">Share Your Experience</h3>
          <p className="text-sm text-muted-foreground mb-6">Have you visited us or used our products? We'd love to hear from you! 🙏</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Star rating */}
            <div>
              <label className="text-sm font-semibold text-secondary mb-2 block">Your Rating *</label>
              <StarPicker value={rating} onChange={setRating} />
            </div>

            {/* Name + Place */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-secondary mb-1 block">Your Name *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-secondary mb-1 block">City / Place</label>
                <input
                  value={place}
                  onChange={(e) => setPlace(e.target.value)}
                  placeholder="e.g. Bengaluru, KA"
                  className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            {/* Opinion */}
            <div>
              <label className="text-sm font-semibold text-secondary mb-1 block">Your Opinion *</label>
              <textarea
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="Share your thoughts about Shreemata Goumandira..."
                rows={3}
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
              />
            </div>

            <Button type="submit" variant="hero" className="w-full">
              <Send className="h-4 w-4" /> Submit Review
            </Button>
          </form>
        </div>

      </div>
    </section>
  );
};

const ReviewCard = ({ review }: { review: Review }) => (
  <div className="bg-card rounded-2xl p-6 shadow-soft hover:shadow-warm transition-smooth border border-border/60 flex flex-col min-h-[220px]">
    <div className="flex gap-0.5 text-accent mb-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className="h-4 w-4"
          fill={i < review.rating ? "currentColor" : "none"}
          stroke="currentColor"
        />
      ))}
    </div>
    <p className="text-sm text-foreground/85 italic flex-1">"{review.quote}"</p>
    <div className="mt-5 flex items-center gap-3 pt-4 border-t border-border/60">
      <div className="h-10 w-10 rounded-full bg-gradient-saffron text-primary-foreground flex items-center justify-center font-bold shrink-0">
        {review.name.charAt(0)}
      </div>
      <div>
        <div className="font-semibold text-secondary text-sm">{review.name}</div>
        <div className="text-xs text-muted-foreground">{review.place}</div>
      </div>
    </div>
  </div>
);
