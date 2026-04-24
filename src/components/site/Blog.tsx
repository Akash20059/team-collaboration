import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { getBlogPosts, type BlogPost } from "@/lib/adminStore";

const CATEGORY_LABELS: Record<string, string> = {
  new_born_calf: "New Born Calf",
  program: "Program",
  function: "Function",
  general_update: "General Update",
};

export const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = getBlogPosts().slice(0, 6); // Show latest 6
    setPosts(data);
    setLoading(false);
  }, []);

  return (
    <section id="blog" className="section-pad bg-gradient-warm">
      <div className="container-page">
        <div className="text-center mb-12">
          <p className="font-sanskrit text-primary text-lg">समाचार</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-secondary">Latest from Goumandira</h2>
          <div className="divider-lotus"><span className="text-primary/40 text-xl">—</span></div>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground">Loading updates...</div>
        ) : posts.length === 0 ? (
          <div className="text-center text-muted-foreground">No updates yet. Check back soon 🙏</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {posts.map((p) => (
              <article key={p.id} className="bg-card rounded-2xl overflow-hidden border border-border/60 shadow-soft hover:shadow-warm transition-smooth flex flex-col">
                <div className="aspect-[16/10] overflow-hidden">
                  {p.cover_image_url ? (
                    <img src={p.cover_image_url} alt={p.title} loading="lazy" className="h-full w-full object-cover hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="h-full w-full bg-muted flex items-center justify-center text-4xl">📰</div>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="bg-primary/15 text-primary px-2 py-1 rounded-full font-medium">{CATEGORY_LABELS[p.category] || p.category}</span>
                    <span className="flex items-center gap-1 text-muted-foreground"><CalendarDays className="h-3 w-3" />{new Date(p.post_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-secondary mt-3">{p.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2 flex-1 line-clamp-3">{p.content}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
