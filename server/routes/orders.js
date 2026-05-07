const express = require("express");
const router = express.Router();
const { supabase } = require("../supabase");

// GET all orders (with optional filter)
router.get("/", async (req, res) => {
  const { status } = req.query;
  let query = supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("order_status", status);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST create order and decrement inventory
router.post("/place", async (req, res) => {
  const { items, ...orderPayload } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Order items are required" });
  }

  try {
    // 1. Validate stock availability for every item before placing the order
    const productIds = items.map((i) => i.id);
    const { data: products, error: fetchErr } = await supabase
      .from("products")
      .select("id, name, quantity_available")
      .in("id", productIds);

    if (fetchErr) return res.status(500).json({ error: fetchErr.message });

    // Build a lookup map for quick access
    const productMap = {};
    for (const p of products) productMap[p.id] = p;

    // Check each item has sufficient stock
    for (const item of items) {
      const product = productMap[item.id];
      if (!product) {
        return res.status(400).json({ error: `Product "${item.name || item.id}" not found` });
      }
      if (product.quantity_available < (item.quantity || 1)) {
        return res.status(400).json({
          error: `"${product.name}" has only ${product.quantity_available} left in stock`,
        });
      }
    }

    // 2. Insert the order
    const { data, error } = await supabase
      .from("orders")
      .insert({
        ...orderPayload,
        items,
      })
      .select("order_id")
      .single();

    if (error) return res.status(500).json({ error: error.message });

    // 3. Decrement stock for each purchased product
    for (const item of items) {
      const product = productMap[item.id];
      const qty = item.quantity || 1;
      const newQty = Math.max(0, product.quantity_available - qty);
      const newStatus = newQty <= 0 ? "out_of_stock" : newQty < 5 ? "low_stock" : "in_stock";

      await supabase
        .from("products")
        .update({
          quantity_available: newQty,
          stock_status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.id);
    }

    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message || "Could not place order" });
  }
});

// PUT mark order as dispatched/shipped
router.put("/:orderId/dispatch", async (req, res) => {
  const { orderId } = req.params;
  const { tracking_number, courier_partner } = req.body;

  if (!tracking_number) {
    return res.status(400).json({ error: "Tracking number is required" });
  }

  // Get current order to append status_history
  const { data: existing, error: fetchErr } = await supabase
    .from("orders")
    .select("status_history")
    .eq("order_id", orderId)
    .single();

  if (fetchErr) return res.status(500).json({ error: fetchErr.message });

  const history = Array.isArray(existing.status_history) ? existing.status_history : [];
  history.push({
    status: "shipped",
    timestamp: new Date().toISOString(),
    note: `Dispatched with ${courier_partner || "India Post"} — Tracking: ${tracking_number}`,
  });

  const { data, error } = await supabase
    .from("orders")
    .update({
      order_status: "shipped",
      awb_number: tracking_number,
      courier_partner: courier_partner || "India Post",
      payment_status: "verified",
      status_history: history,
      updated_at: new Date().toISOString(),
    })
    .eq("order_id", orderId)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// PUT update tracking number only
router.put("/:orderId/tracking", async (req, res) => {
  const { orderId } = req.params;
  const { tracking_number } = req.body;

  const { data, error } = await supabase
    .from("orders")
    .update({ awb_number: tracking_number, updated_at: new Date().toISOString() })
    .eq("order_id", orderId)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// PUT update order status
router.put("/:orderId/status", async (req, res) => {
  const { orderId } = req.params;
  const { order_status, internal_notes, expected_delivery } = req.body;

  const { data: existing } = await supabase
    .from("orders")
    .select("status_history")
    .eq("order_id", orderId)
    .single();

  const history = Array.isArray(existing?.status_history) ? existing.status_history : [];
  history.push({ status: order_status, timestamp: new Date().toISOString() });

  const updates = { order_status, status_history: history, updated_at: new Date().toISOString() };
  if (internal_notes !== undefined) updates.internal_notes = internal_notes;
  if (expected_delivery !== undefined) updates.expected_delivery = expected_delivery;

  const { data, error } = await supabase
    .from("orders")
    .update(updates)
    .eq("order_id", orderId)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;
