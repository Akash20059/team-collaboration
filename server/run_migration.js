// Direct SQL migration via Supabase service role
// Runs the SQL via the Postgres REST endpoint

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://dsmdfwrhvzxdvysepsvm.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzbWRmd3Jodnp4ZHZ5c2Vwc3ZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjkyMzM4NSwiZXhwIjoyMDkyNDk5Mzg1fQ.PfIFCA2kkzBf3H9cfkElwjxE_2QYa4p745WZQjlCZ5U",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function runMigration() {
  console.log("🔄 Running database migration...\n");

  // Test connection first
  const { data: test, error: testErr } = await supabase
    .from("products")
    .select("id")
    .limit(1);

  if (testErr) {
    console.error("❌ Connection failed:", testErr.message);
    process.exit(1);
  }
  console.log("✅ Supabase connection OK");

  // Check which tables already exist
  const tables = ["donors", "one_time_donations", "monthly_donors"];
  
  for (const table of tables) {
    const { error } = await supabase.from(table).select("id").limit(1);
    if (error && error.code === "42P01") {
      console.log(`⚠️  Table '${table}' does not exist — needs to be created`);
    } else if (error) {
      console.log(`❓ Table '${table}' check error: ${error.message}`);
    } else {
      console.log(`✅ Table '${table}' already exists`);
    }
  }

  // Use Supabase rpc to create tables via raw SQL
  // We use a stored procedure approach via the postgres endpoint
  const { data, error } = await supabase.rpc("exec_sql", {
    query: `
      CREATE TABLE IF NOT EXISTS public.donors (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'one-time',
        amount NUMERIC NOT NULL DEFAULT 0,
        donated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        message TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS public.one_time_donations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address_line1 TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        pincode TEXT NOT NULL,
        message TEXT,
        amount NUMERIC NOT NULL DEFAULT 12000,
        donated_at DATE NOT NULL DEFAULT CURRENT_DATE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS public.monthly_donors (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        amount NUMERIC NOT NULL,
        last_payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
        next_reminder_date DATE NOT NULL DEFAULT CURRENT_DATE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `
  });

  if (error) {
    console.log("\n⚠️  RPC exec_sql not available — this is expected.");
    console.log("📋 Please run this SQL manually in the Supabase SQL Editor:");
    console.log("   https://supabase.com/dashboard/project/dsmdfwrhvzxdvysepsvm/sql/new\n");
    console.log("--- COPY THIS SQL ---");
    console.log(`
CREATE TABLE IF NOT EXISTS public.donors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'one-time',
  amount NUMERIC NOT NULL DEFAULT 0,
  donated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.one_time_donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address_line1 TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  message TEXT,
  amount NUMERIC NOT NULL DEFAULT 12000,
  donated_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.monthly_donors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  amount NUMERIC NOT NULL,
  last_payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  next_reminder_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
`);
    console.log("--- END SQL ---\n");
  } else {
    console.log("✅ Tables created successfully via RPC!");
  }

  console.log("\nMigration script done.");
}

runMigration().catch(console.error);
