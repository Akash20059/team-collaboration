const express = require("express");
const router = express.Router();
const { supabase } = require("../supabase");

// POST login — verify against Supabase Auth
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).json({ error: "Invalid credentials" });

  // Check if user has admin role
  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", data.user.id)
    .single();

  if (!roleData || roleData.role !== "admin") {
    return res.status(403).json({ error: "Access denied: not an admin" });
  }

  res.json({
    success: true,
    user: { id: data.user.id, email: data.user.email },
    access_token: data.session.access_token,
  });
});

// POST logout
router.post("/logout", async (req, res) => {
  await supabase.auth.signOut();
  res.json({ success: true });
});

// GET check if admin account exists, create if not
router.post("/ensure-admin", async (req, res) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return res.status(500).json({ error: "Admin credentials not configured" });
  }

  // Try to sign in first
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: adminEmail,
    password: adminPassword,
  });

  if (!signInError && signInData?.user) {
    // Ensure user_roles entry exists
    await supabase.from("user_roles").upsert({
      user_id: signInData.user.id,
      role: "admin",
    }, { onConflict: "user_id" });
    return res.json({ success: true, message: "Admin already exists" });
  }

  // Create the admin user
  const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
  });

  if (createError) return res.status(500).json({ error: createError.message });

  // Assign admin role
  await supabase.from("user_roles").insert({ user_id: newUser.user.id, role: "admin" });

  res.json({ success: true, message: "Admin user created" });
});

module.exports = router;
