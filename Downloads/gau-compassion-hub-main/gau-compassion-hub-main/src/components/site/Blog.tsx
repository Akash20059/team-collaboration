import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CalendarDays } from "lucide-react";
import cow1 from "@/assets/cow-1.jpg";
import cow2 from "@/assets/cow-2.jpg";
import cow3 from "@/assets/cow-3.jpg";

const FALLBACK = [cow1, cow2, cow3];

const CATEGORY_LABELS: Record<string, string> = {
  new_born_calf: "New Born Calf 🐮",
  program: "Program 📅",
  function: "Function 🎉",
  general_update: "General Update 📢",
};

interface Post {
  id: string;
  title: string;
  category: keyof typeof CATEGORY_LABELS;
  post_date: string;
  cover_image_url: string | null;
  content: string | null;
}

export const Blog = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("blog_posts")
      .select("id, title, category, post_date, cover_image_url, content")
      .order("post_date", { ascending: false })
      .limit(6)
      .then(({ data }) => {
        if (data) setPosts(data as Post[]);
        setLoading(false);
      });
  }, []);

  return (
    <section id="blog" className="section-pad bg-gradient-warm">
      <div className="container-page">
        <div className="text-center mb-12">
          <p className="font-sanskrit text-primary text-lg">समाचार</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-secondary">Latest from Goumandira</h2>
          <div className="divider-lotus"><span className="text-primary text-xl">📰</span></div>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground">Loading updates...</div>
        ) : posts.length === 0 ? (
          <div className="text-center text-muted-foreground">No updates yet. Check back soon 🙏</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {posts.map((p, i) => (
              <article key={p.id} className="bg-card rounded-2xl overflow-hidden border border-border/60 shadow-soft hover:shadow-warm transition-smooth flex flex-col">
                <div className="aspect-[16/10] overflow-hidden">
                  <img src={p.cover_image_url || FALLBACK[i % FALLBACK.length]} alt={p.title} loading="lazy" className="h-full w-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="bg-primary/15 text-primary px-2 py-1 rounded-full font-medium">{CATEGORY_LABELS[p.category]}</span>
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
