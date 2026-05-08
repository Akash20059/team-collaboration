const express = require("express");
const router = express.Router();
const { supabase } = require("../supabase");

// GET all gallery images
router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("gallery_images")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });
    
  // If table doesn't exist, we can just return empty array gracefully for now
  if (error && error.code === '42P01') {
    return res.json([]);
  }
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST create gallery image
router.post("/", async (req, res) => {
  const { url, title, display_order } = req.body;
  if (!url) return res.status(400).json({ error: "URL is required (can be base64)" });

  const { data, error } = await supabase
    .from("gallery_images")
    .insert({
      url,
      title: title || "",
      display_order: display_order || 0
    })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// PUT update gallery image
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { url, title, display_order } = req.body;

  const { data, error } = await supabase
    .from("gallery_images")
    .update({ 
      url, 
      title, 
      display_order,
      updated_at: new Date().toISOString() 
    })
    .eq("id", id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// DELETE gallery image
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from("gallery_images").delete().eq("id", id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

module.exports = router;
