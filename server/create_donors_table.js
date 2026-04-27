// Creates the donors table via Supabase pg_dump workaround
// Uses the REST API with service role
const https = require("https");

const PROJECT_REF = "dsmdfwrhvzxdvysepsvm";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzbWRmd3Jodnp4ZHZ5c2Vwc3ZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjkyMzM4NSwiZXhwIjoyMDkyNDk5Mzg1fQ.PfIFCA2kkzBf3H9cfkElwjxE_2QYa4p745WZQjlCZ5U";

// Use Supabase Management API to run SQL
const sql = `
CREATE TABLE IF NOT EXISTS public.donors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'one-time',
  amount NUMERIC NOT NULL DEFAULT 0,
  donated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;
`;

const body = JSON.stringify({ query: sql });

const options = {
  hostname: `db.${PROJECT_REF}.supabase.co`,
  port: 5432,
  // We use the REST endpoint instead
};

// Try via Management API
const reqOpts = {
  hostname: "api.supabase.com",
  path: `/v1/projects/${PROJECT_REF}/database/query`,
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${SERVICE_KEY}`,
    "Content-Length": Buffer.byteLength(body),
  },
};

console.log("Attempting to create donors table via Supabase Management API...");

const req = https.request(reqOpts, (res) => {
  let data = "";
  res.on("data", chunk => data += chunk);
  res.on("end", () => {
    console.log(`Status: ${res.statusCode}`);
    try {
      const parsed = JSON.parse(data);
      console.log("Response:", JSON.stringify(parsed, null, 2));
      if (res.statusCode === 200) {
        console.log("✅ donors table created successfully!");
      } else {
        console.log("❌ Failed. Please create the table manually using the SQL below.");
        printManualSQL();
      }
    } catch {
      console.log("Raw response:", data);
      printManualSQL();
    }
  });
});

req.on("error", e => {
  console.error("Error:", e.message);
  printManualSQL();
});

req.write(body);
req.end();

function printManualSQL() {
  console.log(`
============================================================
MANUAL STEP REQUIRED: Run this in Supabase SQL Editor
============================================================
URL: https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new

CREATE TABLE IF NOT EXISTS public.donors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'one-time',
  amount NUMERIC NOT NULL DEFAULT 0,
  donated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;
============================================================
`);
}
