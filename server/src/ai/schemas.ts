export const ANALYSIS_JSON_SCHEMA: Record<string, unknown> = {
  type: "object",
  required: [
    "additionalSignals",
    "unverified",
    "extraVerificationSteps",
    "overview",
    "textOnlyConfidence",
  ],
  properties: {
    additionalSignals: {
      type: "array",
      maxItems: 5,
      items: {
        type: "object",
        required: [
          "title",
          "category",
          "severity",
          "whyItMatters",
          "evidenceQuote",
        ],
        properties: {
          title: { type: "string", maxLength: 100 },
          category: {
            type: "string",
            enum: [
              "payment",
              "urgency",
              "data_request",
              "missing_details",
              "channel",
              "too_good_to_be_true",
              "sender_identity",
              "source_authenticity",
              "content_quality",
            ],
          },
          severity: { type: "string", enum: ["high", "medium", "low"] },
          whyItMatters: { type: "string", maxLength: 300 },
          evidenceQuote: { type: "string", minLength: 3, maxLength: 300 },
        },
      },
    },
    unverified: {
      type: "array",
      maxItems: 6,
      items: {
        type: "object",
        required: ["item", "howToVerify"],
        properties: {
          item: { type: "string", maxLength: 120 },
          howToVerify: { type: "string", maxLength: 300 },
        },
      },
    },
    extraVerificationSteps: {
      type: "array",
      maxItems: 4,
      items: { type: "string", maxLength: 200 },
    },
    overview: { type: "string", maxLength: 400 },
    textOnlyConfidence: {
      type: "string",
      enum: ["low", "medium", "high"],
    },
  },
};

export const EXTRACTION_JSON_SCHEMA: Record<string, unknown> = {
  type: "object",
  required: ["fields"],
  properties: {
    fields: {
      type: "object",
      properties: {
        organization: { $ref: "#/$defs/f" },
        roleOrProgram: { $ref: "#/$defs/f" },
        eligibility: { $ref: "#/$defs/f" },
        locationOrMode: { $ref: "#/$defs/f" },
        duration: { $ref: "#/$defs/f" },
        compensation: { $ref: "#/$defs/f" },
        selectionProcess: { $ref: "#/$defs/f" },
        deadline: { $ref: "#/$defs/f" },
        contactChannel: { $ref: "#/$defs/f" },
        officialLink: { $ref: "#/$defs/f" },
      },
    },
  },
  $defs: {
    f: {
      anyOf: [
        { type: "null" },
        {
          type: "object",
          required: ["value", "evidenceQuote"],
          properties: {
            value: { type: "string", maxLength: 200 },
            evidenceQuote: { type: "string", minLength: 3, maxLength: 300 },
          },
        },
      ],
    },
  },
};

export const LISTING_DISCREPANCY_JSON_SCHEMA: Record<string, unknown> = {
  type: "object",
  required: ["plainExplanation", "whatToAskTheRecruiter"],
  properties: {
    plainExplanation: { type: "string", maxLength: 400 },
    whatToAskTheRecruiter: {
      type: "array",
      maxItems: 4,
      items: { type: "string", maxLength: 200 },
    },
  },
};

export const CHALLENGE_JSON_SCHEMA: Record<string, unknown> = {
  type: "object",
  required: ["subject", "body"],
  properties: {
    subject: { type: "string", minLength: 5, maxLength: 120 },
    body: { type: "string", minLength: 80, maxLength: 1200 },
  },
};

export const LINK_EXPLAIN_JSON_SCHEMA: Record<string, unknown> = {
  type: "object",
  required: ["plainExplanation", "whatToCheckNext"],
  properties: {
    plainExplanation: { type: "string", maxLength: 400 },
    whatToCheckNext: {
      type: "array",
      maxItems: 4,
      items: { type: "string", maxLength: 160 },
    },
  },
};
