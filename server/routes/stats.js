const express = require("express");
const router = express.Router();
const { supabase } = require("../supabase");

// GET dashboard stats
router.get("/", async (req, res) => {
  try {
    const [
      { count: totalProducts },
      { count: inStock },
      { count: lowStock },
      { count: outOfStock },
      { count: totalCows },
      { count: adoptedCows },
      { count: totalPosts },
      { count: totalOrders },
      { count: pendingOrders },
      { count: shippedOrders },
      { count: totalDonors },
    ] = await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("products").select("*", { count: "exact", head: true }).eq("stock_status", "in_stock"),
      supabase.from("products").select("*", { count: "exact", head: true }).eq("stock_status", "low_stock"),
      supabase.from("products").select("*", { count: "exact", head: true }).eq("stock_status", "out_of_stock"),
      supabase.from("cows").select("*", { count: "exact", head: true }),
      supabase.from("cows").select("*", { count: "exact", head: true }).eq("is_adopted", true),
      supabase.from("blog_posts").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("*", { count: "exact", head: true }).eq("order_status", "order_placed"),
      supabase.from("orders").select("*", { count: "exact", head: true }).eq("order_status", "shipped"),
      supabase.from("donors").select("*", { count: "exact", head: true }).then(r => ({ count: r.count || 0 })).catch(() => ({ count: 0 })),
    ]);

    res.json({
      products: { total: totalProducts || 0, inStock: inStock || 0, lowStock: lowStock || 0, outOfStock: outOfStock || 0 },
      cows: { total: totalCows || 0, adopted: adoptedCows || 0 },
      posts: { total: totalPosts || 0 },
      orders: { total: totalOrders || 0, pending: pendingOrders || 0, shipped: shippedOrders || 0 },
      donors: { total: totalDonors || 0 },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
