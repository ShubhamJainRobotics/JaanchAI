import { z } from "zod";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(8080),
  CLIENT_ORIGINS: z
    .string()
    .default("http://localhost:5173")
    .transform((val) => val.split(",").map((s) => s.trim())),
  SUPABASE_URL: z.string().min(1, "SUPABASE_URL is required"),
  SUPABASE_ANON_KEY: z.string().min(1, "SUPABASE_ANON_KEY is required"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default(""),
  GEMINI_API_KEY: z.string().optional().default(""),
  GEMINI_MODEL: z.string().default("gemini-3.5-flash"),
  RDAP_BASE_URL: z.string().url().default("https://rdap.org/domain"),
  RDAP_TIMEOUT_MS: z.coerce.number().default(4000),
  LOG_LEVEL: z.string().default("info"),

  // Verification upgrade
  REPORT_HASH_PEPPER: z
    .string()
    .min(24, "REPORT_HASH_PEPPER is required and must be at least 24 characters"),
  DEMO_MODE: z
    .preprocess((val) => val === "true" || val === true, z.boolean())
    .default(false),
  SAFE_BROWSING_API_KEY: z.string().optional().default(""),
  CT_LOG_BASE_URL: z.string().url().default("https://crt.sh"),
  CT_LOG_TIMEOUT_MS: z.coerce.number().default(5000),
  DNS_TIMEOUT_MS: z.coerce.number().default(2000),
  LISTING_FETCH_TIMEOUT_MS: z.coerce.number().default(5000),
  LISTING_MAX_BYTES: z.coerce.number().default(500000),
  ENABLE_THIRD_PARTY_CHECKS: z
    .preprocess((val) => val === "true" || val === true, z.boolean())
    .default(false),
  RATE_LIMIT_LISTING_PER_HOUR: z.coerce.number().default(10),
  RATE_LIMIT_REPORTS_PER_DAY: z.coerce.number().default(20),
  RATE_LIMIT_LOOKUP_PER_HOUR: z.coerce.number().default(60),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "❌ Invalid server environment configuration:\n",
    JSON.stringify(parsed.error.format(), null, 2)
  );
  process.exit(1);
}

export const env = parsed.data;
