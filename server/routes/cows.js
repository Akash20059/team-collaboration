const express = require("express");
const router = express.Router();
const { supabase } = require("../supabase");

// GET all cows
router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("cows")
    .select("*")
    .order("cow_number", { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST create cow
router.post("/", async (req, res) => {
  const { cow_number, name, age, weight_kg, breed, father_name, mother_name, milk_yield_litres, health_status, is_adopted, photo_url, notes } = req.body;
  if (!name || !cow_number) return res.status(400).json({ error: "Cow number and name are required" });

  const { data, error } = await supabase
    .from("cows")
    .insert({
      cow_number, name, age: age || null, weight_kg: weight_kg || null,
      breed: breed || "Malenadu Gidda",
      father_name: father_name || null, mother_name: mother_name || null,
      milk_yield_litres: milk_yield_litres || null,
      health_status: health_status || "healthy",
      is_adopted: is_adopted || false,
      photo_url: photo_url || null,
      notes: notes || null,
    })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// PUT update cow
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { cow_number, name, age, weight_kg, breed, father_name, mother_name, milk_yield_litres, health_status, is_adopted, photo_url, notes } = req.body;

  const { data, error } = await supabase
    .from("cows")
    .update({
      cow_number, name, age: age || null, weight_kg: weight_kg || null,
      breed: breed || "Malenadu Gidda",
      father_name: father_name || null, mother_name: mother_name || null,
      milk_yield_litres: milk_yield_litres || null,
      health_status, is_adopted,
      photo_url: photo_url || null,
      notes: notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// DELETE cow
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from("cows").delete().eq("id", id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

module.exports = router;
