import crypto from "node:crypto";
import { getDomain } from "tldts";
import { SupabaseClient } from "@supabase/supabase-js";
import { EntityType, ReportedMatch } from "shared";
import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";

export class ReportedService {
  /**
   * Normalize entity value based on type:
   * - email: lowercase, trim
   * - phone: E.164 (default +91, strip spaces/hyphens/leading 0)
   * - upi: lowercase
   * - domain: registrable domain (tldts), punycode, lowercase
   * - url: lowercase host + path without query/fragment/trailing slash
   * - social handle: lowercase, strip @
   * - bank account: digits only
   */
  public static normalizeEntity(type: EntityType, value: string): string {
    const trimmed = (value || "").trim();
    switch (type) {
      case "email":
        return trimmed.toLowerCase();

      case "email_domain":
        return (getDomain(trimmed) || trimmed).toLowerCase();

      case "phone": {
        // Strip non-digits except initial +
        let digits = trimmed.replace(/[^\d+]/g, "");
        if (digits.startsWith("+")) {
          return digits;
        }
        if (digits.startsWith("0")) {
          digits = digits.replace(/^0+/, "");
        }
        if (digits.length === 10) {
          return `+91${digits}`;
        }
        return `+${digits}`;
      }

      case "upi":
        return trimmed.toLowerCase();

      case "domain": {
        const clean = trimmed.replace(/^https?:\/\//i, "").split("/")[0].split(":")[0];
        return (getDomain(clean) || clean).toLowerCase();
      }

      case "url": {
        try {
          const u = new URL(trimmed);
          return `${u.protocol}//${u.host.toLowerCase()}${u.pathname.replace(/\/$/, "")}`;
        } catch {
          return trimmed.toLowerCase().replace(/\/$/, "");
        }
      }

      case "social_handle":
        return trimmed.toLowerCase().replace(/^@+/, "");

      case "bank_account":
        return trimmed.replace(/\D/g, "");

      default:
        return trimmed.toLowerCase();
    }
  }

  /**
   * Salted SHA-256 hash using server-side pepper:
   * sha256(REPORT_HASH_PEPPER + ":" + type + ":" + normalized)
   */
  public static hashEntity(type: EntityType, value: string): string {
    const normalized = this.normalizeEntity(type, value);
    const payload = `${env.REPORT_HASH_PEPPER}:${type}:${normalized}`;
    return crypto.createHash("sha256").update(payload, "utf8").digest("hex");
  }

  /**
   * Lookup up to 20 entity hashes via check_reported_entities RPC.
   */
  public static async lookupEntities(
    supabase: SupabaseClient,
    items: Array<{ type: EntityType; value: string }>
  ): Promise<ReportedMatch[]> {
    if (!items || items.length === 0) return [];

    const itemsToQuery = items.slice(0, 20).map((it) => ({
      entity_type: it.type,
      value_hash: this.hashEntity(it.type, it.value),
    }));

    try {
      const { data, error } = await supabase.rpc("check_reported_entities", {
        p_items: itemsToQuery,
      });

      if (error) {
        logger.error({ err: error }, "Failed to query check_reported_entities RPC");
        return [];
      }

      if (!Array.isArray(data)) return [];

      return data.map((row: any) => ({
        entityType: row.entity_type as EntityType,
        valueHash: row.value_hash,
        status: row.status,
        reportCount: row.report_count,
        detail:
          row.status === "confirmed"
            ? "Confirmed fraudulent by a moderator"
            : `Reported by ${row.report_count} user(s) (not yet confirmed)`,
      }));
    } catch (err: any) {
      logger.error({ err }, "Exception during reported entities lookup");
      return [];
    }
  }

  /**
   * Submit a scam report via submit_scam_report RPC.
   */
  public static async submitReport(
    supabaseUserClient: SupabaseClient,
    type: EntityType,
    value: string,
    description?: string
  ): Promise<void> {
    const valueHash = this.hashEntity(type, value);

    const { error } = await supabaseUserClient.rpc("submit_scam_report", {
      p_entity_type: type,
      p_value_hash: valueHash,
      p_description: description ? description.slice(0, 1000) : null,
    });

    if (error) {
      logger.error({ err: error }, "Failed to submit scam report");
      throw error;
    }
  }
}
