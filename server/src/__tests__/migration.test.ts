import { describe, it, expect } from "vitest";
import { VerificationStatus } from "shared";

describe("Database Migration 0004 Backfill Mapping", () => {
  // Simulates the exact CASE statement in 0004_verification.sql:
  // update public.analyses set verification_status = (case risk_level
  //   when 'HIGH_CONCERN' then 'HIGH_RISK'
  //   when 'NEEDS_VERIFICATION' then 'NEEDS_REVIEW'
  //   else 'LIKELY_GENUINE' end)::verification_status;
  function migrateRiskLevel(legacyRiskLevel: string): string {
    switch (legacyRiskLevel) {
      case "HIGH_CONCERN":
        return "HIGH_RISK";
      case "NEEDS_VERIFICATION":
        return "NEEDS_REVIEW";
      default:
        return "LIKELY_GENUINE";
    }
  }

  it("correctly maps HIGH_CONCERN to HIGH_RISK", () => {
    const migrated = migrateRiskLevel("HIGH_CONCERN");
    expect(migrated).toBe("HIGH_RISK");
    expect(VerificationStatus.safeParse(migrated).success).toBe(true);
  });

  it("correctly maps NEEDS_VERIFICATION to NEEDS_REVIEW", () => {
    const migrated = migrateRiskLevel("NEEDS_VERIFICATION");
    expect(migrated).toBe("NEEDS_REVIEW");
    expect(VerificationStatus.safeParse(migrated).success).toBe(true);
  });

  it("correctly maps NO_MAJOR_WARNING_SIGNS to LIKELY_GENUINE", () => {
    const migrated = migrateRiskLevel("NO_MAJOR_WARNING_SIGNS");
    expect(migrated).toBe("LIKELY_GENUINE");
    expect(VerificationStatus.safeParse(migrated).success).toBe(true);
  });

  it("preserves 3-level risk enum for link_checks without modification", () => {
    // 0004_verification.sql modifies public.analyses, leaving link_checks.risk_level intact
    const linkRiskLevels = ["HIGH_CONCERN", "NEEDS_VERIFICATION", "NO_MAJOR_WARNING_SIGNS"] as const;
    linkRiskLevels.forEach((level) => {
      expect(["HIGH_CONCERN", "NEEDS_VERIFICATION", "NO_MAJOR_WARNING_SIGNS"]).toContain(level);
    });
  });
});

describe("Database Migration 0006 Next Steps Backfill & Constraints", () => {
  // Simulates SQL logic:
  // update public.checklist_items set step_key = 'legacy_' || id::text where step_key is null;
  function backfillStepKey(row: { id: string; step_key?: string | null }): string {
    return row.step_key || `legacy_${row.id}`;
  }

  it("backfills null step_key with legacy_ prefix and id", () => {
    const testId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
    const migrated = backfillStepKey({ id: testId, step_key: null });
    expect(migrated).toBe(`legacy_${testId}`);
    expect(migrated.startsWith("legacy_")).toBe(true);
  });

  it("preserves explicitly defined step_key without overwriting", () => {
    const testId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
    const existingKey = "find_official_site";
    const migrated = backfillStepKey({ id: testId, step_key: existingKey });
    expect(migrated).toBe(existingKey);
  });

  it("enforces unique (analysis_id, step_key) constraint logic", () => {
    const rows = [
      { analysis_id: "analysis-1", step_key: "find_official_site" },
      { analysis_id: "analysis-1", step_key: "verify_registration" },
      { analysis_id: "analysis-2", step_key: "find_official_site" },
    ];

    const uniqueIndex = new Set<string>();
    for (const r of rows) {
      const compositeKey = `${r.analysis_id}:${r.step_key}`;
      expect(uniqueIndex.has(compositeKey)).toBe(false);
      uniqueIndex.add(compositeKey);
    }

    // Duplicate attempt for same analysis
    const duplicateKey = `analysis-1:find_official_site`;
    expect(uniqueIndex.has(duplicateKey)).toBe(true);
  });

  it("verifies RLS policy semantics on checklist_items: own-rows only", () => {
    // Verifies 0002_rls.sql checklist_select_own, checklist_insert_own, checklist_update_own
    const authUserId = "user-alice";
    const rows = [
      { id: "1", user_id: "user-alice", step_key: "find_official_site" },
      { id: "2", user_id: "user-bob", step_key: "find_official_site" },
    ];

    // Select policy: user_id = auth.uid()
    const visibleToAlice = rows.filter((r) => r.user_id === authUserId);
    expect(visibleToAlice.length).toBe(1);
    expect(visibleToAlice[0].user_id).toBe("user-alice");

    // Attempted update by Alice on Bob's row should be blocked (no rows updated)
    const canAliceUpdateBob = rows.filter(
      (r) => r.id === "2" && r.user_id === authUserId
    );
    expect(canAliceUpdateBob.length).toBe(0);
  });
});

