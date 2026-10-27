import { ReportedService } from "../src/services/reportedService.js";
import { EntityType, EntityTypeSchema } from "shared";

const args = process.argv.slice(2);
if (args.length < 2) {
  console.log("Usage: npx tsx scripts/hashEntity.ts <type> <value>");
  console.log("Supported types: email, email_domain, phone, upi, domain, url, social_handle, bank_account");
  process.exit(1);
}

const rawType = args[0];
const value = args[1];

const parsedType = EntityTypeSchema.safeParse(rawType);
if (!parsedType.success) {
  console.error(`Invalid entity type: ${rawType}`);
  process.exit(1);
}

const type = parsedType.data;
const normalized = ReportedService.normalizeEntity(type, value);
const hash = ReportedService.hashEntity(type, value);

console.log("\n--- Jaanch Salted Entity Hasher ---");
console.log(`Type:       ${type}`);
console.log(`Original:   ${value}`);
console.log(`Normalized: ${normalized}`);
console.log(`Value Hash: ${hash}\n`);
console.log("SQL to confirm this entity manually in Supabase:");
console.log(`
INSERT INTO public.reported_entities (entity_type, value_hash, status, report_count, confirmed_at, notes)
VALUES ('${type}', '${hash}', 'confirmed', 1, now(), 'Confirmed fraudulent by moderator')
ON CONFLICT (entity_type, value_hash)
DO UPDATE SET status = 'confirmed', confirmed_at = now();
`);
