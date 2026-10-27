import {
  OpportunityDomain,
  Channel,
  SignalCategory,
  Severity,
  UnknownItem,
} from "../schemas/index.js";

export interface RuleContext {
  rawText: string;
  normalizedText: string;
  domain: OpportunityDomain;
  channel: Channel;
  claimedOrg?: string;
  senderEmail?: string;
  senderDomain?: string;
}

export interface RuleHit {
  ruleId: string;
  category: SignalCategory;
  severity: Severity;
  title: string;
  whyItMatters: string;
  evidenceQuote: string;
  hardDisqualifier?: boolean;
  unknowns?: UnknownItem[];
}

export type RuleDefinition = (ctx: RuleContext) => RuleHit[];
