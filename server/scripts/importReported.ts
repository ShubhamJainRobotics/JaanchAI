import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { EntityTypeSchema } from "shared";
import { env } from "../src/config/env.js";
import { ReportedService } from "../src/services/reportedService.js";

const args = process.argv.slice(2);
if (args.length < 1) {
  console.log("Usage: npx tsx scripts/importReported.ts <csv-file-path>");
  console.log("Format: entity_type,value,notes");
  process.exit(1);
}

const filePath = args[0];
if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

if (!env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("SUPABASE_SERVICE_ROLE_KEY is required to import confirmed reported records.");
  process.exit(1);
}

const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function runImport() {
  const fileContent = fs.readFileSync(filePath, "utf8");
  const lines = fileContent.split(/\r?\n/).filter((l) => l.trim().length > 0);

  let successCount = 0;
  for (const line of lines) {
    if (line.startsWith("#") || line.startsWith("entity_type")) continue;
    const [rawType, rawValue, rawNotes] = line.split(",").map((s) => s.trim());
    const parseType = EntityTypeSchema.safeParse(rawType);
    if (!parseType.success) {
      console.warn(`Skipping invalid entity type on line: ${line}`);
      continue;
    }

    const type = parseType.data;
    const valueHash = ReportedService.hashEntity(type, rawValue);
    const notes = rawNotes || "Imported confirmed record";

    const { error } = await supabaseAdmin.from("reported_entities").upsert(
      {
        entity_type: type,
        value_hash: valueHash,
        status: "confirmed",
        report_count: 1,
        confirmed_at: new Date().toISOString(),
        notes,
      },
      { onConflict: "entity_type,value_hash" }
    );

    if (error) {
      console.error(`Failed to upsert entity ${rawValue}:`, error.message);
    } else {
      successCount++;
    }
  }

  console.log(`Successfully imported ${successCount} confirmed entities.`);
}

runImport().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
