const express = require("express");
const router = express.Router();
const { supabase } = require("../supabase");

// GET all blog posts
router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("post_date", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST create blog post
router.post("/", async (req, res) => {
  const { title, category, post_date, cover_image_url, content } = req.body;
  if (!title) return res.status(400).json({ error: "Title is required" });

  const { data, error } = await supabase
    .from("blog_posts")
    .insert({
      title, category: category || "general_update",
      post_date: post_date || new Date().toISOString().slice(0, 10),
      cover_image_url: cover_image_url || null,
      content: content || null,
    })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// PUT update blog post
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, category, post_date, cover_image_url, content } = req.body;

  const { data, error } = await supabase
    .from("blog_posts")
    .update({ title, category, post_date, cover_image_url: cover_image_url || null, content: content || null, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// DELETE blog post
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

module.exports = router;
