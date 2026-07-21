import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import dotenv from "dotenv";

const envLocal = dotenv.parse(fs.readFileSync(".env.local"));

const supabase = createClient(
  envLocal.VITE_SUPABASE_URL,
  envLocal.VITE_SUPABASE_PUBLISHABLE_KEY
);

async function run() {
  const { data, error } = await supabase.from("cotacoes").select("status");
  if (error) {
    console.error("Error:", error);
    process.exit(1);
  }
  const statuses = new Set(data.map(r => r.status));
  console.log("Distinct statuses:", Array.from(statuses));
}

run();
