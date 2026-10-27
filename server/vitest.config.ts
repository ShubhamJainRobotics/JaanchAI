import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    testTimeout: 15000,
    env: {
      NODE_ENV: "test",
      SUPABASE_URL: "https://dummy-project.supabase.co",
      SUPABASE_ANON_KEY: "dummy-anon-key-placeholder-for-dev",
      REPORT_HASH_PEPPER: "dummy-test-report-hash-pepper-must-be-24-chars",
    },
  },
});
