import { SupabaseClient, User } from "@supabase/supabase-js";
import {
  HistoryQuery,
  EvidenceReport,
  CheckRow,
  STATUS_COPY,
  computeStatus,
  buildNextSteps,
} from "shared";
import { ListingService } from "./listingService.js";
import { env } from "../config/env.js";

const ATTESTATION_LABELS: Record<string, string> = {
  recruiter_linkedin: "Recruiter LinkedIn profile linked to organization",
  recruiter_phone_official: "Recruiter phone number matches official business listing",
  found_on_official_site: "Opportunity found independently on official site",
  found_independently_on_official_portal: "Opportunity found independently on official site",
  contacted_via_official_channel: "Contact initiated via official corporate channel",
};

export class HistoryService {
  public static async getAnalyses(
    user: User,
    supabase: SupabaseClient,
    query: HistoryQuery
  ) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let queryBuilder = supabase
      .from("analyses")
      .select(
        "id, domain, input_type, channel, claimed_org, verification_status, rule_score, summary, ai_used, created_at",
        { count: "exact" }
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (query.status) {
      queryBuilder = queryBuilder.eq("verification_status", query.status);
    }
    if (query.domain) {
      queryBuilder = queryBuilder.eq("domain", query.domain);
    }

    const { data, count, error } = await queryBuilder;
    if (error) throw error;

    return {
      items: data || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    };
  }

  public static async getAnalysisById(
    id: string,
    user: User,
    supabase: SupabaseClient
  ) {
    const { data: analysis, error } = await supabase
      .from("analyses")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !analysis) {
      const notFoundErr = new Error("Analysis not found.");
      (notFoundErr as any).statusCode = 404;
      (notFoundErr as any).code = "NOT_FOUND";
      throw notFoundErr;
    }

    // Retrieve live checklist items
    const { data: checklistRows } = await supabase
      .from("checklist_items")
      .select("*")
      .eq("analysis_id", id)
      .order("position", { ascending: true });

    // Retrieve live analysis checks
    const { data: checkRows } = await supabase
      .from("analysis_checks")
      .select("*")
      .eq("analysis_id", id);

    // Retrieve associated link checks
    const { data: linkRows } = await supabase
      .from("link_checks")
      .select("*")
      .eq("analysis_id", id);

    // Retrieve associated recruiter challenges
    const { data: challengeRows } = await supabase
      .from("recruiter_challenges")
      .select("*")
      .eq("analysis_id", id);

    const fullResult = {
      ...analysis.result,
      id: analysis.id,
      saved: true,
      status: analysis.verification_status,
      createdAt: analysis.created_at,
    };

    if (checkRows && checkRows.length > 0) {
      fullResult.checks = checkRows.map((c) => ({
        id: c.id,
        checkKey: c.check_key,
        label: c.label,
        outcome: c.outcome,
        detail: c.detail,
        source: c.source,
      }));
    }

    const checklistCompletions: Record<string, boolean> = {};
    const checklistRowMap = new Map<string, any>();
    if (checklistRows) {
      for (const row of checklistRows) {
        if (row.step_key) {
          checklistCompletions[row.step_key] = row.completed;
          checklistRowMap.set(row.step_key, row);
        }
      }
    }

    if (checklistRows && checklistRows.length > 0) {
      fullResult.checklist = checklistRows.map((r) => ({
        id: r.id,
        stepKey: r.step_key,
        position: r.position,
        label: r.label,
        portalKey: r.portal_key,
        completed: r.completed,
        completedAt: r.completed_at,
      }));
    }

    const nextSteps = buildNextSteps(fullResult, {
      checklistCompletions,
    });

    for (const step of [...nextSteps.yourTurn, ...nextSteps.more]) {
      const row = checklistRowMap.get(step.stepKey);
      if (row) {
        step.id = row.id;
        step.completed = row.completed;
        step.completedAt = row.completed_at;
      }
    }

    fullResult.nextSteps = nextSteps;

    if (linkRows && linkRows.length > 0) {
      fullResult.links = linkRows.map((l) => ({
        url: l.url,
        hostname: l.hostname,
        registrableDomain: l.registrable_domain,
        riskLevel: l.risk_level,
        observations: l.observations,
        unverified: l.unverified,
        rdapStatus: l.rdap_status,
        domainRegisteredAt: l.domain_registered_at,
        disclaimer: "Still not confirmation that the offer is genuine.",
      }));
    }

    return {
      ...fullResult,
      challenges: challengeRows || [],
    };
  }

  /**
   * Attach an official listing, recompute verification status, and persist updated checks.
   */
  public static async attachOfficialListing(
    id: string,
    user: User,
    supabase: SupabaseClient,
    listingInput: { url?: string; text?: string }
  ) {
    const analysis = await this.getAnalysisById(id, user, supabase);

    const matchedOrg = analysis.matchedOrganization || null;
    const extractedFields = analysis.extractedFields || {};

    const { comparison, check } = await ListingService.processOfficialListing(
      extractedFields,
      matchedOrg,
      listingInput,
      env.DEMO_MODE
    );

    // Upsert official_listing check in analysis_checks
    await supabase.from("analysis_checks").upsert(
      {
        analysis_id: id,
        user_id: user.id,
        check_key: "official_listing",
        label: check.label,
        outcome: check.outcome,
        detail: check.detail.slice(0, 600),
        source: check.source,
      },
      { onConflict: "analysis_id,check_key" }
    );

    // Re-fetch all checks
    const { data: updatedChecks } = await supabase
      .from("analysis_checks")
      .select("*")
      .eq("analysis_id", id);

    const currentChecks: CheckRow[] = (updatedChecks || []).map((c) => ({
      checkKey: c.check_key,
      label: c.label,
      outcome: c.outcome,
      detail: c.detail,
      source: c.source,
    }));

    // Recompute verification status
    const recomputed = computeStatus({
      signals: analysis.signals || [],
      ruleScore: analysis.ruleScore || 0,
      textLength: analysis.input_length || 100,
      reportedMatches: analysis.reportedMatches || [],
      matchedOrganization: matchedOrg,
      senderIdentity: analysis.senderIdentity || null,
      headerAnalysis: analysis.headerAnalysis || null,
      listingComparison: comparison,
      completeness: analysis.completeness || null,
      checks: currentChecks,
      isDemoMode: env.DEMO_MODE,
    });

    const updatedResult = {
      ...analysis,
      status: recomputed.status,
      reasons: recomputed.reasons,
      listingComparison: comparison,
      checks: currentChecks,
    };

    await this.regenerateChecklistItems(id, user, supabase, updatedResult);

    // Update analyses record
    await supabase
      .from("analyses")
      .update({
        verification_status: recomputed.status,
        listing_match_status: comparison.status,
        result: updatedResult,
      })
      .eq("id", id)
      .eq("user_id", user.id);

    return updatedResult;
  }

  /**
   * Save user attestation, trigger recompute, and return updated checks.
   */
  public static async saveAttestation(
    id: string,
    user: User,
    supabase: SupabaseClient,
    checkKey: string,
    outcome: "user_attested" | "unknown"
  ) {
    const analysis = await this.getAnalysisById(id, user, supabase);

    const label = ATTESTATION_LABELS[checkKey] || "User-attested check";
    const detail =
      outcome === "user_attested"
        ? "Confirmed by you, not by Jaanch."
        : "Not confirmed by you yet.";

    await supabase.from("analysis_checks").upsert(
      {
        analysis_id: id,
        user_id: user.id,
        check_key: checkKey,
        label,
        outcome,
        detail,
        source: "user_attested",
      },
      { onConflict: "analysis_id,check_key" }
    );

    const { data: updatedChecks } = await supabase
      .from("analysis_checks")
      .select("*")
      .eq("analysis_id", id);

    const currentChecks: CheckRow[] = (updatedChecks || []).map((c) => ({
      checkKey: c.check_key,
      label: c.label,
      outcome: c.outcome,
      detail: c.detail,
      source: c.source,
    }));

    // Recompute verification status
    const recomputed = computeStatus({
      signals: analysis.signals || [],
      ruleScore: analysis.ruleScore || 0,
      textLength: analysis.input_length || 100,
      reportedMatches: analysis.reportedMatches || [],
      matchedOrganization: analysis.matchedOrganization || null,
      senderIdentity: analysis.senderIdentity || null,
      headerAnalysis: analysis.headerAnalysis || null,
      listingComparison: analysis.listingComparison || null,
      completeness: analysis.completeness || null,
      checks: currentChecks,
      isDemoMode: env.DEMO_MODE,
    });

    const updatedResult = {
      ...analysis,
      status: recomputed.status,
      reasons: recomputed.reasons,
      checks: currentChecks,
    };

    const nextSteps = buildNextSteps(updatedResult, {
      checklistCompletions: analysis.checklist
        ? Object.fromEntries(
            analysis.checklist
              .filter((c: any) => c.stepKey)
              .map((c: any) => [c.stepKey, c.completed])
          )
        : {},
    });
    updatedResult.nextSteps = nextSteps;

    await supabase
      .from("analyses")
      .update({
        verification_status: recomputed.status,
        result: updatedResult,
      })
      .eq("id", id)
      .eq("user_id", user.id);

    return updatedResult;
  }

  /**
   * Produce the complete EvidenceReport structure for print/PDF or JSON export.
   */
  public static async getEvidenceReport(
    id: string,
    user: User,
    supabase: SupabaseClient
  ): Promise<EvidenceReport> {
    const analysis = await this.getAnalysisById(id, user, supabase);

    const checks: CheckRow[] = analysis.checks || [];

    const getDetail = (key: string, fallback: string) => {
      const chk = checks.find((c) => c.checkKey === key);
      return chk?.detail || fallback;
    };

    const statusCopy = STATUS_COPY[analysis.status as keyof typeof STATUS_COPY] || {
      label: analysis.status,
      meaning: "",
      tone: "amber",
    };

    return {
      analysisId: analysis.id,
      status: analysis.status,
      statusCopy,
      claimedOrganization: analysis.claimed_org || analysis.claimedOrg || null,
      matchedOrganization: analysis.matchedOrganization || null,
      domain: analysis.domain,
      senderDomain: analysis.senderIdentity?.domain || null,
      domainCheckSummary: getDetail("sender_domain_match", "Domain check not run"),
      headerAuthSummary: getDetail("header_authentication", "Headers not supplied"),
      domainAgeCertSummary: getDetail("domain_age", "Domain age unknown"),
      officialListingSummary: getDetail("official_listing", "Not checked"),
      recruiterCheckSummary: getDetail("recruiter_linkedin", "Not confirmed by you yet"),
      reportedRecordsSummary: getDetail("reported_records", "None found"),
      paymentRequestSummary: getDetail("payment_request", "None detected"),
      sensitiveDataSummary: getDetail("sensitive_data_request", "None detected"),
      urgencyLanguageSummary: getDetail("urgency_language", "None detected"),
      guaranteeSummary: getDetail("guarantee_unrealistic", "None detected"),
      completenessSummary: analysis.completeness
        ? `${analysis.completeness.present.length} of 10 details present`
        : "Completeness not assessed",
      reasons: analysis.reasons || [],
      checks,
      extractedFields: analysis.extractedFields || null,
      createdAt: analysis.createdAt,
    };
  }

  public static async deleteAnalysis(
    id: string,
    user: User,
    supabase: SupabaseClient
  ) {
    const { error } = await supabase
      .from("analyses")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;
    return { success: true };
  }

  public static async deleteAllData(user: User, supabase: SupabaseClient) {
    await supabase.from("analyses").delete().eq("user_id", user.id);
    await supabase.from("link_checks").delete().eq("user_id", user.id);
    await supabase.from("recruiter_challenges").delete().eq("user_id", user.id);
    await supabase.from("feedback").delete().eq("user_id", user.id);

    return { success: true };
  }

  public static async patchChecklist(
    itemId: string,
    completed: boolean,
    user: User,
    supabase: SupabaseClient
  ) {
    const completedAt = completed ? new Date().toISOString() : null;
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        itemId
      );

    let query = supabase
      .from("checklist_items")
      .update({
        completed,
        completed_at: completedAt,
      })
      .eq("user_id", user.id);

    if (isUuid) {
      query = query.eq("id", itemId);
    } else {
      query = query.eq("step_key", itemId);
    }

    const { data, error } = await query.select().single();

    if (error || !data) {
      const err = new Error("Checklist item not found or update failed.");
      (err as any).statusCode = 404;
      (err as any).code = "NOT_FOUND";
      throw err;
    }

    return data;
  }

  /**
   * Regenerates next steps upon listing/sender input change, preserving completion state
   * and dropping steps that no longer apply.
   */
  public static async regenerateChecklistItems(
    analysisId: string,
    user: User,
    supabase: SupabaseClient,
    updatedResult: any
  ) {
    const { data: existingRows } = await supabase
      .from("checklist_items")
      .select("*")
      .eq("analysis_id", analysisId);

    const completionMap = new Map<
      string,
      { completed: boolean; completedAt: string | null }
    >();
    if (existingRows) {
      for (const row of existingRows) {
        if (row.step_key) {
          completionMap.set(row.step_key, {
            completed: Boolean(row.completed),
            completedAt: row.completed_at || null,
          });
        }
      }
    }

    const checklistCompletions: Record<string, boolean> = {};
    for (const [key, val] of completionMap.entries()) {
      checklistCompletions[key] = val.completed;
    }

    const nextSteps = buildNextSteps(updatedResult, { checklistCompletions });
    const allNewSteps = [...nextSteps.yourTurn, ...nextSteps.more];
    const newStepKeys = new Set(allNewSteps.map((s) => s.stepKey));

    if (existingRows && existingRows.length > 0) {
      const idsToDelete = existingRows
        .filter((r) => r.step_key && !newStepKeys.has(r.step_key))
        .map((r) => r.id);
      if (idsToDelete.length > 0) {
        await supabase.from("checklist_items").delete().in("id", idsToDelete);
      }
    }

    for (let i = 0; i < allNewSteps.length; i++) {
      const step = allNewSteps[i];
      const prev = completionMap.get(step.stepKey);
      const isDone = prev ? prev.completed : Boolean(step.completed);
      const doneAt = prev
        ? prev.completedAt
        : isDone
        ? new Date().toISOString()
        : null;

      await supabase.from("checklist_items").upsert(
        {
          analysis_id: analysisId,
          user_id: user.id,
          step_key: step.stepKey,
          position: i,
          label: step.title,
          completed: isDone,
          completed_at: doneAt,
        },
        { onConflict: "analysis_id,step_key" }
      );
    }

    updatedResult.nextSteps = nextSteps;
    return nextSteps;
  }
}

