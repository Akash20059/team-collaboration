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
