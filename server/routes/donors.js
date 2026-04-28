const express = require("express");
const router = express.Router();
const { supabase } = require("../supabase");

// GET all donors
router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("donors")
    .select("*")
    .order("donated_at", { ascending: false });
  if (error) {
    // Return empty array if table doesn't exist yet
    if (error.code === "42P01" || error.message?.includes("schema cache")) {
      return res.json([]);
    }
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

// POST create donor
router.post("/", async (req, res) => {
  const { name, type, amount, donated_at, message } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });
  if (!amount || amount <= 0) return res.status(400).json({ error: "Amount must be > 0" });

  const { data, error } = await supabase
    .from("donors")
    .insert({
      name, type: type || "one-time", amount,
      donated_at: donated_at || new Date().toISOString(),
      message: message || null,
    })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// PUT update donor
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, type, amount, donated_at, message } = req.body;

  const { data, error } = await supabase
    .from("donors")
    .update({ name, type, amount, donated_at, message: message || null })
    .eq("id", id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// DELETE donor
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from("donors").delete().eq("id", id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

module.exports = router;
