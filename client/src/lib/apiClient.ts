import {
  AnalyzeRequest,
  AnalysisResult,
  HistoryQuery,
  LinkCheckRequest,
  LinkCheckResult,
  ChallengeRequest,
  ChallengeOutput,
  ChecklistPatch,
  FeedbackInput,
} from "shared";
import { supabase } from "./supabaseClient";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  // Attach session JWT if available
  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData?.session?.access_token) {
    headers["Authorization"] = `Bearer ${sessionData.session.access_token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = res.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    const error: ApiError = data?.error || {
      code: "REQUEST_FAILED",
      message: res.statusText || "Network request failed",
    };
    throw error;
  }

  return data as T;
}

export const apiClient = {
  // Analyze
  analyze: (body: AnalyzeRequest) =>
    request<AnalysisResult>("/analyze", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // History
  getAnalyses: (params: HistoryQuery) => {
    const query = new URLSearchParams();
    if (params.page) query.set("page", params.page.toString());
    if (params.pageSize) query.set("pageSize", params.pageSize.toString());
    if (params.status) query.set("status", params.status);
    if (params.domain) query.set("domain", params.domain);
    return request<{
      items: any[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }>(`/analyses?${query.toString()}`);
  },

  getAnalysis: (id: string) =>
    request<AnalysisResult & { challenges: any[] }>(`/analyses/${id}`),

  deleteAnalysis: (id: string) =>
    request<{ success: boolean }>(`/analyses/${id}`, {
      method: "DELETE",
    }),

  deleteAllAnalyses: () =>
    request<{ success: boolean }>("/analyses", {
      method: "DELETE",
      body: JSON.stringify({ confirm: "DELETE_ALL" }),
    }),

  // Organizations registry autocomplete
  getOrganizations: (q: string = "") => {
    const query = new URLSearchParams();
    if (q) query.set("q", q);
    return request<{ items: any[] }>(`/organizations?${query.toString()}`);
  },

  // Email headers analyzer
  analyzeHeaders: (headers: string, claimedOrgId?: string) =>
    request<{ analysis: any; checks: any[] }>("/email-headers/analyze", {
      method: "POST",
      body: JSON.stringify({ headers, claimedOrgId }),
    }),

  // Attach official listing to saved analysis
  attachOfficialListing: (id: string, body: { url?: string; text?: string }) =>
    request<{ result: AnalysisResult }>(`/analyses/${id}/official-listing`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // Update attestation
  saveAttestation: (
    id: string,
    body: {
      checkKey:
        | "recruiter_linkedin"
        | "recruiter_phone_official"
        | "found_on_official_site"
        | "found_independently_on_official_portal"
        | "contacted_via_official_channel";
      outcome: "user_attested" | "unknown";
    }
  ) =>
    request<{ result: AnalysisResult }>(`/analyses/${id}/attestations`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  // Evidence Report JSON
  getEvidenceReport: (id: string) =>
    request<any>(`/analyses/${id}/evidence-report`),

  // Scam Reports Lookup
  lookupReported: (items: Array<{ type: string; value: string }>) =>
    request<{ matches: any[] }>("/reports/lookup", {
      method: "POST",
      body: JSON.stringify({ items }),
    }),

  // Submit Scam Report
  submitScamReport: (body: {
    type: string;
    value: string;
    description?: string;
  }) =>
    request<{ success: boolean; message: string }>("/reports", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // Checklist
  patchChecklist: (itemId: string, patch: ChecklistPatch) =>
    request<any>(`/checklist/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),

  // Link Check
  checkLink: (body: LinkCheckRequest) =>
    request<LinkCheckResult>("/link-check", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // Challenge Email
  generateChallenge: (body: ChallengeRequest) =>
    request<ChallengeOutput & { aiUsed: boolean }>("/challenge-email", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // Resources
  getResources: () =>
    request<{
      portals: any[];
      helpline: any;
      evidenceToKeep: string[];
      domainGuides: Record<string, any>;
    }>("/resources"),

  // Feedback
  sendFeedback: (body: FeedbackInput) =>
    request<{ success: boolean }>("/feedback", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // Local Guest Session Storage Helpers
  saveLocalResult: (result: AnalysisResult) => {
    try {
      sessionStorage.setItem("jaanch_local_result", JSON.stringify(result));
    } catch {
      // Ignore sessionStorage quota error
    }
  },

  getLocalResult: (): AnalysisResult | null => {
    try {
      const stored = sessionStorage.getItem("jaanch_local_result");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  saveLocalRequest: (req: AnalyzeRequest) => {
    try {
      sessionStorage.setItem("jaanch_local_request", JSON.stringify(req));
    } catch {
      // Ignore
    }
  },

  getLocalRequest: (): AnalyzeRequest | null => {
    try {
      const stored = sessionStorage.getItem("jaanch_local_request");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  clearLocalResult: () => {
    try {
      sessionStorage.removeItem("jaanch_local_result");
      sessionStorage.removeItem("jaanch_local_request");
    } catch {
      // Ignore
    }
  },
};
