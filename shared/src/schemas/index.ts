import { z } from "zod";
import { VerificationStatus } from "../config/status.js";

export { VerificationStatus };

export const VerificationStatusSchema = VerificationStatus;
export type VerificationStatusType = z.infer<typeof VerificationStatusSchema>;

export const OpportunityDomain = z.enum([
  "internship",
  "scholarship",
  "job",
  "freelance",
  "competition",
  "website",
  "message_other",
]);
export type OpportunityDomain = z.infer<typeof OpportunityDomain>;

export const InputTypeSchema = z.enum(["text", "screenshot", "pdf"]);
export type InputType = z.infer<typeof InputTypeSchema>;

export const ChannelSchema = z.enum([
  "whatsapp",
  "telegram",
  "email",
  "sms",
  "linkedin",
  "instagram",
  "website",
  "phone_call",
  "other",
]);
export type Channel = z.infer<typeof ChannelSchema>;

// Link checks keep the 3-level RiskLevel
export const RiskLevelSchema = z.enum([
  "HIGH_CONCERN",
  "NEEDS_VERIFICATION",
  "NO_MAJOR_WARNING_SIGNS",
]);
export type RiskLevel = z.infer<typeof RiskLevelSchema>;

export const SeveritySchema = z.enum([
  "critical",
  "high",
  "medium",
  "low",
  "info",
]);
export type Severity = z.infer<typeof SeveritySchema>;

export const CategorySchema = z.enum([
  "payment",
  "urgency",
  "data_request",
  "missing_details",
  "channel",
  "too_good_to_be_true",
  "link",
  "sender_identity",
  "source_authenticity",
  "reported_record",
  "content_quality",
]);
export type SignalCategory = z.infer<typeof CategorySchema>;

export const SourceSchema = z.enum([
  "rule",
  "ai",
  "link_check",
  "header_parse",
  "dns",
  "rdap",
  "ct_log",
  "safe_browsing",
  "registry",
  "reported_db",
  "listing_compare",
  "user_attested",
]);
export type SignalSource = z.infer<typeof SourceSchema>;

export const CheckOutcomeSchema = z.enum([
  "pass",
  "fail",
  "unknown",
  "not_run",
  "user_attested",
  "none_found",
]);
export type CheckOutcome = z.infer<typeof CheckOutcomeSchema>;

export const EntityTypeSchema = z.enum([
  "email",
  "email_domain",
  "phone",
  "upi",
  "domain",
  "url",
  "social_handle",
  "bank_account",
]);
export type EntityType = z.infer<typeof EntityTypeSchema>;

export const EntityStatusSchema = z.enum(["reported", "confirmed", "cleared"]);
export type EntityStatus = z.infer<typeof EntityStatusSchema>;

export const OrgKindSchema = z.enum([
  "company",
  "university",
  "government",
  "event_platform",
  "nonprofit",
]);
export type OrgKind = z.infer<typeof OrgKindSchema>;

export const ExtractedFieldItemSchema = z.object({
  value: z.string(),
  evidenceQuote: z.string(),
  source: z.enum(["rule", "ai"]),
});
export type ExtractedFieldItem = z.infer<typeof ExtractedFieldItemSchema>;

export const ExtractedCompensationSchema = z.object({
  kind: z.enum(["stipend", "salary", "scholarship", "prize"]),
  amountInr: z.number().optional(),
  period: z.enum(["month", "year", "day", "hour", "one_time"]).optional(),
  raw: z.string(),
});
export type ExtractedCompensation = z.infer<typeof ExtractedCompensationSchema>;

export const ExtractedFieldsSchema = z.object({
  organization: ExtractedFieldItemSchema.nullable(),
  roleOrProgram: ExtractedFieldItemSchema.nullable(),
  eligibility: ExtractedFieldItemSchema.nullable(),
  locationOrMode: ExtractedFieldItemSchema.nullable(),
  duration: ExtractedFieldItemSchema.nullable(),
  compensation: z
    .object({
      value: ExtractedCompensationSchema,
      evidenceQuote: z.string(),
      source: z.enum(["rule", "ai"]),
    })
    .nullable(),
  selectionProcess: ExtractedFieldItemSchema.nullable(),
  deadline: ExtractedFieldItemSchema.nullable(),
  contactChannel: ExtractedFieldItemSchema.nullable(),
  officialLink: ExtractedFieldItemSchema.nullable(),
});
export type ExtractedFields = z.infer<typeof ExtractedFieldsSchema>;

export const ExtractedEntityItemSchema = z.object({
  value: z.string(),
  evidenceQuote: z.string(),
});
export type ExtractedEntityItem = z.infer<typeof ExtractedEntityItemSchema>;

export const OrganizationCandidateSchema = z.object({
  name: z.string(),
  confidence: z.enum(["high", "medium", "low"]),
  evidenceQuote: z.string(),
  count: z.number().int().min(1).default(1),
});
export type OrganizationCandidate = z.infer<typeof OrganizationCandidateSchema>;

export const ExtractedEntitiesSchema = z.object({
  emails: z.array(ExtractedEntityItemSchema),
  phones: z.array(ExtractedEntityItemSchema),
  urls: z.array(ExtractedEntityItemSchema),
  upiIds: z.array(ExtractedEntityItemSchema),
  socialHandles: z.array(ExtractedEntityItemSchema),
  organizationCandidates: z.array(OrganizationCandidateSchema),
});
export type ExtractedEntities = z.infer<typeof ExtractedEntitiesSchema>;


export const CheckRowSchema = z.object({
  id: z.string().uuid().optional(),
  checkKey: z.string().max(80),
  label: z.string().max(160),
  outcome: CheckOutcomeSchema,
  detail: z.string().min(1).max(600),
  source: z.enum([
    "rule",
    "header_parse",
    "dns",
    "rdap",
    "ct_log",
    "safe_browsing",
    "registry",
    "reported_db",
    "listing_compare",
    "user_attested",
    "ai",
  ]),
});
export type CheckRow = z.infer<typeof CheckRowSchema>;

export const StatusReasonSchema = z.object({
  checkKey: z.string(),
  effect: z.string(),
  detail: z.string(),
});
export type StatusReason = z.infer<typeof StatusReasonSchema>;

export const HeaderAnalysisSchema = z.object({
  from: z.string().nullable(),
  replyTo: z.string().nullable(),
  returnPath: z.string().nullable(),
  receivedChainCount: z.number().int().nonnegative(),
  firstHost: z.string().nullable(),
  lastHost: z.string().nullable(),
  authResults: z.object({
    spf: z.enum([
      "pass",
      "fail",
      "softfail",
      "neutral",
      "none",
      "temperror",
      "permerror",
      "unknown",
    ]),
    dkim: z.enum([
      "pass",
      "fail",
      "softfail",
      "neutral",
      "none",
      "temperror",
      "permerror",
      "unknown",
    ]),
    dmarc: z.enum([
      "pass",
      "fail",
      "softfail",
      "neutral",
      "none",
      "temperror",
      "permerror",
      "unknown",
    ]),
  }),
  dkimDomain: z.string().nullable(),
  alignment: z.object({
    spf: z.boolean().nullable(),
    dkim: z.boolean().nullable(),
  }),
  mismatches: z.array(z.string()),
  dnsPolicy: z
    .object({
      spfRecordFound: z.boolean(),
      dmarcPolicy: z.string().nullable(),
    })
    .optional(),
});
export type HeaderAnalysis = z.infer<typeof HeaderAnalysisSchema>;

export const SenderIdentitySchema = z.object({
  rawEmail: z.string().nullable(),
  displayName: z.string().nullable(),
  localPart: z.string().nullable(),
  domain: z.string().nullable(),
  registrableDomain: z.string().nullable(),
  isFreeMail: z.boolean(),
  matchesRegistryOrg: z.boolean(),
  isLookalike: z.boolean(),
  lookalikeDetails: z.string().nullable(),
  phone: z.string().nullable(),
  upiId: z.string().nullable(),
  socialHandle: z.string().nullable(),
  websiteUrl: z.string().nullable(),
  recruiterName: z.string().nullable(),
  consistencyIssue: z.string().nullable(),
});
export type SenderIdentity = z.infer<typeof SenderIdentitySchema>;

export const ListingFieldComparisonSchema = z.object({
  field: z.string(),
  offerValue: z.string().nullable(),
  listingValue: z.string().nullable(),
  outcome: z.enum(["match", "mismatch", "unknown"]),
  detail: z.string(),
});
export type ListingFieldComparison = z.infer<
  typeof ListingFieldComparisonSchema
>;

export const ListingComparisonSchema = z.object({
  status: z.enum([
    "not_checked",
    "unknown",
    "match",
    "partial",
    "mismatch",
    "user_supplied",
  ]),
  sourceType: z.enum(["platform_fetch", "pasted_text"]).nullable(),
  listingUrl: z.string().nullable(),
  organizationMatched: z.boolean(),
  roleMatched: z.boolean(),
  hasMismatches: z.boolean(),
  matchedFieldsCount: z.number().int().nonnegative(),
  comparedFields: z.array(ListingFieldComparisonSchema),
  notes: z.string().nullable(),
});
export type ListingComparison = z.infer<typeof ListingComparisonSchema>;

export const ReportedMatchSchema = z.object({
  entityType: EntityTypeSchema,
  valueHash: z.string(),
  status: EntityStatusSchema,
  reportCount: z.number().int().nonnegative(),
  detail: z.string().optional(),
});
export type ReportedMatch = z.infer<typeof ReportedMatchSchema>;

export const OrganizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  aliases: z.array(z.string()),
  kind: OrgKindSchema,
  officialDomains: z.array(z.string()),
  careersUrl: z.string().nullable(),
  scholarshipsUrl: z.string().nullable(),
  isGovernment: z.boolean(),
  isDemo: z.boolean(),
  needsTeamReview: z.boolean(),
});
export type Organization = z.infer<typeof OrganizationSchema>;

export const SenderInputSchema = z
  .object({
    email: z.string().trim().max(254).optional(),
    displayName: z.string().trim().max(120).optional(),
    phone: z.string().trim().max(20).optional(),
    upiId: z.string().trim().max(80).optional(),
    socialHandle: z.string().trim().max(80).optional(),
    websiteUrl: z.string().trim().max(2048).url().optional(),
    recruiterName: z.string().trim().max(120).optional(),
  })
  .strict();
export type SenderInput = z.infer<typeof SenderInputSchema>;

export const OfficialListingInputSchema = z
  .object({
    url: z.string().url().max(2048).optional(),
    text: z.string().max(20000).optional(),
  })
  .refine(
    (v) => Boolean(v.url || v.text),
    "Either url or text must be provided"
  );
export type OfficialListingInput = z.infer<typeof OfficialListingInputSchema>;

export const AnalyzeRequestSchema = z
  .object({
    text: z.string().trim().min(20).max(8000),
    inputType: InputTypeSchema.default("text"),
    domain: OpportunityDomain,
    channel: ChannelSchema.default("other"),
    claimedOrg: z.string().trim().max(120).optional(),
    sender: SenderInputSchema.optional(),
    emailHeaders: z.string().max(20000).optional(),
    organizationId: z.string().uuid().optional(),
    officialListing: OfficialListingInputSchema.optional(),
    runThirdPartyChecks: z.boolean().default(false),
    useAi: z.boolean().default(false),
    saveToHistory: z.boolean().default(true),
    storeRawText: z.boolean().default(true),
  })
  .strict();
export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;

export const SignalSchema = z.object({
  ruleId: z.string().max(20),
  category: CategorySchema,
  severity: SeveritySchema,
  source: SourceSchema,
  title: z.string().max(100),
  whyItMatters: z.string().max(300),
  evidenceQuote: z.string().max(300).nullable(),
  hardDisqualifier: z.boolean().optional(),
});
export type Signal = z.infer<typeof SignalSchema>;

export const UnknownSchema = z.object({
  item: z.string().max(120),
  howToVerify: z.string().max(300),
});
export type UnknownItem = z.infer<typeof UnknownSchema>;

export const ChecklistItemSchema = z.object({
  id: z.string().uuid().optional(),
  stepKey: z.string().optional(),
  position: z.number().int().min(0),
  label: z.string().max(240),
  portalKey: z.string().nullable(),
  completed: z.boolean().default(false),
  completedAt: z.string().datetime().nullable().optional(),
});
export type ChecklistItem = z.infer<typeof ChecklistItemSchema>;

export const NextStepActionSchema = z.object({
  label: z.string(),
  url: z.string().optional(),
  kind: z.enum(["link", "safe_reply", "tel"]).optional(),
});
export type NextStepAction = z.infer<typeof NextStepActionSchema>;

export const NextStepSubCheckSchema = z.object({
  key: z.string(),
  label: z.string(),
  completed: z.boolean().default(false),
});
export type NextStepSubCheck = z.infer<typeof NextStepSubCheckSchema>;

export const NextStepSchema = z.object({
  id: z.string().optional(),
  stepKey: z.string(),
  title: z.string(),
  whyItMatters: z.string(),
  howToVerify: z.string(),
  priority: z.number().int(),
  completed: z.boolean().default(false),
  completedAt: z.string().nullable().optional(),
  actions: z.array(NextStepActionSchema).optional(),
  subChecks: z.array(NextStepSubCheckSchema).optional(),
});
export type NextStep = z.infer<typeof NextStepSchema>;

export const NextStepsSchema = z.object({
  alreadyChecked: z.array(CheckRowSchema),
  yourTurn: z.array(NextStepSchema),
  more: z.array(NextStepSchema),
  banner: z.array(z.string()),
  variant: z.enum(["standard", "protect"]),
});
export type NextSteps = z.infer<typeof NextStepsSchema>;

export const LinkCheckRequestSchema = z
  .object({
    url: z
      .string()
      .trim()
      .max(2048)
      .url()
      .refine(
        (u) => /^https?:\/\//i.test(u),
        "Only http(s) links are supported"
      ),
    analysisId: z.string().uuid().optional(),
  })
  .strict();
export type LinkCheckRequest = z.infer<typeof LinkCheckRequestSchema>;

export const LinkCheckResultSchema = z.object({
  url: z.string(),
  hostname: z.string(),
  registrableDomain: z.string().nullable(),
  riskLevel: RiskLevelSchema,
  observations: z.array(z.string().max(240)).max(12),
  unverified: z.array(z.string().max(240)).max(8),
  rdapStatus: z.enum(["not_run", "ok", "unavailable", "not_found", "timeout"]),
  domainRegisteredAt: z.string().datetime().nullable(),
  disclaimer: z.string(),
});
export type LinkCheckResult = z.infer<typeof LinkCheckResultSchema>;

export const ReportGuidanceSchema = z.object({
  show: z.boolean(),
  helpline: z.string(),
  portalUrl: z.string().url(),
  keepAsEvidence: z.array(z.string()),
});
export type ReportGuidance = z.infer<typeof ReportGuidanceSchema>;

export const CompletenessDetailSchema = z.object({
  key: z.string(),
  label: z.string(),
  present: z.boolean(),
  evidenceQuote: z.string().optional(),
  reason: z.string().optional(),
});
export type CompletenessDetail = z.infer<typeof CompletenessDetailSchema>;

export const CompletenessResultSchema = z.object({
  present: z.array(z.string()),
  missing: z.array(z.string()),
  score: z.number().min(0).max(10),
  details: z.array(CompletenessDetailSchema).optional(),
});
export type CompletenessResult = z.infer<typeof CompletenessResultSchema>;

export const PatternInsightSchema = z.object({
  id: z.string(),
  heading: z.string(),
  description: z.string(),
  dontSendYet: z.array(z.string()),
});
export type PatternInsight = z.infer<typeof PatternInsightSchema>;

export const AnalysisResultSchema = z.object({
  id: z.string().uuid().nullable(),
  saved: z.boolean(),
  domain: OpportunityDomain,
  status: VerificationStatusSchema,
  claimedOrg: z.string().nullable().optional(),
  reasons: z.array(StatusReasonSchema),
  ruleScore: z.number().int().min(0).max(100),
  internalRuleScore: z.number().int().min(0).max(100).optional(),
  summary: z.string().max(600),
  signals: z.array(SignalSchema),
  checks: z.array(CheckRowSchema),
  extractedFields: ExtractedFieldsSchema.nullable().optional(),
  extractedEntities: ExtractedEntitiesSchema.nullable().optional(),
  completeness: CompletenessResultSchema.nullable().optional(),
  senderIdentity: SenderIdentitySchema.nullable().optional(),
  headerAnalysis: HeaderAnalysisSchema.nullable().optional(),
  listingComparison: ListingComparisonSchema.nullable().optional(),
  reportedMatches: z.array(ReportedMatchSchema).default([]),
  matchedOrganization: OrganizationSchema.nullable().optional(),
  patternInsight: PatternInsightSchema.nullable().optional(),
  unknowns: z.array(UnknownSchema).min(1),
  checklist: z.array(ChecklistItemSchema).min(1),
  nextSteps: NextStepsSchema.optional(),
  links: z.array(LinkCheckResultSchema).max(10),
  reportGuidance: ReportGuidanceSchema,
  aiUsed: z.boolean(),
  aiStatus: z.enum([
    "not_requested",
    "ok",
    "failed",
    "invalid_output",
    "timeout",
  ]),
  textOnlyConfidence: z.enum(["low", "medium", "high"]).nullable(),
  durationMs: z.number().int().nonnegative(),
  disclaimer: z.string(),
  createdAt: z.string().datetime(),
});
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

export const GeminiAnalysisOutputSchema = z
  .object({
    additionalSignals: z
      .array(
        z.object({
          title: z.string().max(100),
          category: z.enum([
            "payment",
            "urgency",
            "data_request",
            "missing_details",
            "channel",
            "too_good_to_be_true",
            "sender_identity",
            "source_authenticity",
            "content_quality",
          ]),
          severity: z.enum(["high", "medium", "low"]),
          whyItMatters: z.string().max(300),
          evidenceQuote: z.string().min(3).max(300),
        })
      )
      .max(5),
    unverified: z.array(UnknownSchema).max(6),
    extraVerificationSteps: z.array(z.string().max(200)).max(4),
    overview: z.string().max(400),
    textOnlyConfidence: z.enum(["low", "medium", "high"]),
  })
  .strict();
export type GeminiAnalysisOutput = z.infer<typeof GeminiAnalysisOutputSchema>;

export const ExtractionFieldItemNullableSchema = z
  .object({
    value: z.string().max(200),
    evidenceQuote: z.string().min(3).max(300),
  })
  .nullable();

export const ExtractionOutputSchema = z
  .object({
    fields: z
      .object({
        organization: ExtractionFieldItemNullableSchema,
        roleOrProgram: ExtractionFieldItemNullableSchema,
        eligibility: ExtractionFieldItemNullableSchema,
        locationOrMode: ExtractionFieldItemNullableSchema,
        duration: ExtractionFieldItemNullableSchema,
        compensation: ExtractionFieldItemNullableSchema,
        selectionProcess: ExtractionFieldItemNullableSchema,
        deadline: ExtractionFieldItemNullableSchema,
        contactChannel: ExtractionFieldItemNullableSchema,
        officialLink: ExtractionFieldItemNullableSchema,
      })
      .strict(),
  })
  .strict();
export type ExtractionOutput = z.infer<typeof ExtractionOutputSchema>;

export const ListingDiscrepancyOutputSchema = z
  .object({
    plainExplanation: z.string().max(400),
    whatToAskTheRecruiter: z.array(z.string().max(200)).max(4),
  })
  .strict();
export type ListingDiscrepancyOutput = z.infer<
  typeof ListingDiscrepancyOutputSchema
>;

export const ChallengeRequestSchema = z
  .object({
    kind: z.enum(["challenge", "safe_reply"]).default("challenge"),
    domain: OpportunityDomain,
    claimedOrg: z.string().trim().max(120).optional(),
    tone: z.enum(["polite", "firm"]).default("polite"),
    senderName: z.string().trim().max(40).optional(),
    analysisId: z.string().uuid().optional(),
    useAi: z.boolean().default(false),
    includeQuestions: z.array(z.string()).optional(),
  })
  .strict();
export type ChallengeRequest = z.infer<typeof ChallengeRequestSchema>;

export const ChallengeOutputSchema = z
  .object({
    subject: z.string().min(5).max(120),
    body: z.string().min(80).max(2500),
  })
  .strict();
export type ChallengeOutput = z.infer<typeof ChallengeOutputSchema>;

export const SafeReplyOutputSchema = ChallengeOutputSchema;
export type SafeReplyOutput = ChallengeOutput;

export const SAFE_REPLY_JSON_SCHEMA = {
  type: "object",
  properties: {
    subject: {
      type: "string",
      description: "Polite, conditional email subject line",
    },
    body: {
      type: "string",
      description: "Safe reply email body (90-150 words) confirming interest conditionally without sharing personal data, requesting verification details",
    },
  },
  required: ["subject", "body"],
};

export const LinkExplainOutputSchema = z
  .object({
    plainExplanation: z.string().max(400),
    whatToCheckNext: z.array(z.string().max(160)).max(4),
  })
  .strict();
export type LinkExplainOutput = z.infer<typeof LinkExplainOutputSchema>;

export const FeedbackSchema = z
  .object({
    analysisId: z.string().uuid().optional(),
    helpful: z.boolean(),
    comment: z.string().trim().max(1000).optional(),
  })
  .strict();
export type FeedbackInput = z.infer<typeof FeedbackSchema>;

export const ChecklistPatchSchema = z
  .object({ completed: z.boolean() })
  .strict();
export type ChecklistPatch = z.infer<typeof ChecklistPatchSchema>;

export const DeleteAllSchema = z
  .object({ confirm: z.literal("DELETE_ALL") })
  .strict();
export type DeleteAllInput = z.infer<typeof DeleteAllSchema>;

export const HistoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  status: VerificationStatusSchema.optional(),
  domain: OpportunityDomain.optional(),
});
export type HistoryQuery = z.infer<typeof HistoryQuerySchema>;

export const ReportRequestSchema = z
  .object({
    type: EntityTypeSchema,
    value: z.string().trim().min(1).max(2048),
    description: z.string().trim().max(1000).optional(),
  })
  .strict();
export type ReportRequest = z.infer<typeof ReportRequestSchema>;

export const ReportLookupItemSchema = z
  .object({
    type: EntityTypeSchema,
    value: z.string().trim().min(1).max(2048),
  })
  .strict();

export const ReportLookupRequestSchema = z
  .object({
    items: z.array(ReportLookupItemSchema).min(1).max(10),
  })
  .strict();
export type ReportLookupRequest = z.infer<typeof ReportLookupRequestSchema>;

export const AttestationKeySchema = z.enum([
  "found_independently_on_official_portal",
  "found_on_official_site",
  "recruiter_linkedin",
  "recruiter_phone_official",
  "contacted_via_official_channel",
]);
export type AttestationKey = z.infer<typeof AttestationKeySchema>;

export const AttestationRequestSchema = z
  .object({
    checkKey: AttestationKeySchema,
    outcome: z.enum(["user_attested", "unknown"]),
  })
  .strict();
export type AttestationRequest = z.infer<typeof AttestationRequestSchema>;

export const OfficialListingRequestSchema = z
  .object({
    url: z.string().url().max(2048).optional(),
    text: z.string().max(20000).optional(),
  })
  .refine(
    (v) => Boolean(v.url || v.text),
    "Either url or text must be provided"
  );
export type OfficialListingRequest = z.infer<
  typeof OfficialListingRequestSchema
>;

export const EvidenceReportSchema = z.object({
  analysisId: z.string().uuid().nullable(),
  status: VerificationStatusSchema,
  statusCopy: z.object({
    label: z.string(),
    meaning: z.string(),
    tone: z.string(),
  }),
  claimedOrganization: z.string().nullable(),
  matchedOrganization: OrganizationSchema.nullable(),
  domain: OpportunityDomain,
  senderDomain: z.string().nullable(),
  domainCheckSummary: z.string(),
  headerAuthSummary: z.string(),
  domainAgeCertSummary: z.string(),
  officialListingSummary: z.string(),
  recruiterCheckSummary: z.string(),
  reportedRecordsSummary: z.string(),
  paymentRequestSummary: z.string(),
  sensitiveDataSummary: z.string(),
  urgencyLanguageSummary: z.string(),
  guaranteeSummary: z.string(),
  completenessSummary: z.string(),
  reasons: z.array(StatusReasonSchema),
  checks: z.array(CheckRowSchema),
  extractedFields: ExtractedFieldsSchema.nullable(),
  createdAt: z.string().datetime(),
});
export type EvidenceReport = z.infer<typeof EvidenceReportSchema>;
