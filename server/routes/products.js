const express = require("express");
const router = express.Router();
const { supabase } = require("../supabase");

// GET all products
router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST create product
router.post("/", async (req, res) => {
  const { name, description, price, mrp, quantity_available, image_url, order_link, display_order } = req.body;
  if (!name || price == null) return res.status(400).json({ error: "Name and price are required" });

  const stock_status = quantity_available <= 0 ? "out_of_stock" : quantity_available < 5 ? "low_stock" : "in_stock";

  const { data, error } = await supabase
    .from("products")
    .insert({ name, description, price, mrp: mrp || null, quantity_available: quantity_available || 0, stock_status, image_url: image_url || null, order_link: order_link || null, display_order: display_order || null })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// PUT update product
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, description, price, mrp, quantity_available, image_url, order_link, display_order } = req.body;

  const stock_status = quantity_available <= 0 ? "out_of_stock" : quantity_available < 5 ? "low_stock" : "in_stock";

  const { data, error } = await supabase
    .from("products")
    .update({ name, description, price, mrp: mrp || null, quantity_available, stock_status, image_url: image_url || null, order_link: order_link || null, display_order: display_order || null, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// DELETE product
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

module.exports = router;
