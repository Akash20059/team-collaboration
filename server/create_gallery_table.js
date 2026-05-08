const https = require("https");

const PROJECT_REF = "dsmdfwrhvzxdvysepsvm";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzbWRmd3Jodnp4ZHZ5c2Vwc3ZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjkyMzM4NSwiZXhwIjoyMDkyNDk5Mzg1fQ.PfIFCA2kkzBf3H9cfkElwjxE_2QYa4p745WZQjlCZ5U";

const sql = `
CREATE TABLE IF NOT EXISTS public.gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  title TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
`;

console.log("============================================================");
console.log("MANUAL STEP REQUIRED: Run this in Supabase SQL Editor");
console.log("============================================================");
console.log("URL: https://supabase.com/dashboard/project/dsmdfwrhvzxdvysepsvm/sql/new\n");
console.log(sql);
console.log("============================================================");
