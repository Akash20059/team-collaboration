require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { supabase } = require("./supabase");

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ─────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ─── Routes ─────────────────────────────────────────────────────────────────
app.use("/api/products", require("./routes/products"));
app.use("/api/cows",     require("./routes/cows"));
app.use("/api/blog",     require("./routes/blog"));
app.use("/api/donors",   require("./routes/donors"));
app.use("/api/orders",   require("./routes/orders"));
app.use("/api/auth",     require("./routes/auth"));
app.use("/api/stats",    require("./routes/stats"));

// ─── Health check ───────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

// ─── Seed database on startup ────────────────────────────────────────────────
async function seedDatabase() {
  console.log("🌱 Checking if database needs seeding...");

  // Seed products if empty
  const { count: productCount } = await supabase.from("products").select("*", { count: "exact", head: true });
  if (productCount === 0) {
    console.log("  Seeding products...");
    await supabase.from("products").insert([
      { name: "Pure Desi Ghee", description: "Traditional A2 ghee from our Malenadu Gidda cows, made using the bilona method.", price: 850, mrp: 1000, quantity_available: 25, stock_status: "in_stock", display_order: 1 },
      { name: "Cow Dung Dhoopa Sticks", description: "Natural incense sticks made from cow dung, ideal for daily puja.", price: 150, mrp: 200, quantity_available: 50, stock_status: "in_stock", display_order: 2 },
      { name: "Herbal Cow Soap", description: "Handmade soap with cow milk and ayurvedic herbs for soft, glowing skin.", price: 120, mrp: 150, quantity_available: 3, stock_status: "low_stock", display_order: 3 },
    ]);
    console.log("  ✅ Products seeded");
  }

  // Seed cows if empty
  const { count: cowCount } = await supabase.from("cows").select("*", { count: "exact", head: true });
  if (cowCount === 0) {
    console.log("  Seeding cows...");
    await supabase.from("cows").insert([
      { cow_number: 1, name: "Gowri",     age: "4 years", weight_kg: 210, breed: "Malenadu Gidda", milk_yield_litres: 3.5, health_status: "healthy",  is_adopted: false, notes: "Gentle and calm, loves morning grazing in the forest meadow." },
      { cow_number: 2, name: "Kamadhenu", age: "6 years", weight_kg: 245, breed: "Malenadu Gidda", milk_yield_litres: 4.2, health_status: "pregnant", is_adopted: true,  notes: "Expecting her second calf. She enjoys the evening temple bells." },
      { cow_number: 3, name: "Nandini",   age: "3 years", weight_kg: 185, breed: "Malenadu Gidda", milk_yield_litres: 2.8, health_status: "healthy",  is_adopted: false, notes: "Young and spirited — the youngest of our sacred herd." },
    ]);
    console.log("  ✅ Cows seeded");
  }

  // Seed blog posts if empty
  const { count: blogCount } = await supabase.from("blog_posts").select("*", { count: "exact", head: true });
  if (blogCount === 0) {
    console.log("  Seeding blog posts...");
    await supabase.from("blog_posts").insert([
      { title: "New Calf Born at Goumandira!", category: "new_born_calf", post_date: "2026-04-15", content: "We are blessed to welcome a healthy new calf to our gaushala family. Mother and baby are both doing well. 🐮🙏" },
      { title: "Annual Go Puja Celebration 2026", category: "function", post_date: "2026-04-10", content: "Our annual Go Puja was celebrated with great devotion. Over 200 devotees participated. 🎉" },
      { title: "Organic Fodder Program Launched", category: "program", post_date: "2026-04-01", content: "We have initiated a new organic fodder cultivation program on 2 acres of land. 🌿" },
    ]);
    console.log("  ✅ Blog posts seeded");
  }

  // Ensure admin user exists
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (adminEmail && adminPassword) {
      const { data: signIn } = await supabase.auth.signInWithPassword({ email: adminEmail, password: adminPassword });
      if (!signIn?.user) {
        const { data: newUser } = await supabase.auth.admin.createUser({ email: adminEmail, password: adminPassword, email_confirm: true });
        if (newUser?.user) {
          await supabase.from("user_roles").insert({ user_id: newUser.user.id, role: "admin" });
          console.log("  ✅ Admin user created in Supabase Auth");
        }
      } else {
        // Ensure admin role exists
        await supabase.from("user_roles").upsert({ user_id: signIn.user.id, role: "admin" }, { onConflict: "user_id" });
        console.log("  ✅ Admin user verified");
      }
    }
  } catch (e) {
    console.warn("  ⚠️  Could not ensure admin user:", e.message);
  }

  console.log("✅ Database ready!");
}

// ─── Start server ────────────────────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`\n🚀 Goumandira API Server running at http://localhost:${PORT}`);
  console.log(`   Supabase URL: ${process.env.SUPABASE_URL}`);
  await seedDatabase();
});
