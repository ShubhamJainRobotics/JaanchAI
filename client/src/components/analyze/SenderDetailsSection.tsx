import { useState } from "react";
import { isFreeMailDomain } from "shared";
import { OrganizationAutocomplete } from "./OrganizationAutocomplete";
import { HeadersHelpDialog } from "./HeadersHelpDialog";
import {
  ChevronDown,
  ChevronUp,
  Mail,
  User,
  Phone,
  DollarSign,
  AtSign,
  Globe,
  FileCode,
  HelpCircle,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

export interface SenderDetailsState {
  email: string;
  recruiterName: string;
  phone: string;
  upiId: string;
  socialHandle: string;
  websiteUrl: string;
  emailHeaders: string;
  organizationId?: string;
  officialListingUrl: string;
  officialListingText: string;
  runThirdPartyChecks: boolean;
}

interface SenderDetailsSectionProps {
  claimedOrg: string;
  onChangeClaimedOrg: (name: string, orgId?: string) => void;
  senderDetails: SenderDetailsState;
  onChangeSenderDetails: (details: Partial<SenderDetailsState>) => void;
}

export function SenderDetailsSection({
  claimedOrg,
  onChangeClaimedOrg,
  senderDetails,
  onChangeSenderDetails,
}: SenderDetailsSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [listingMode, setListingMode] = useState<"url" | "text">("url");

  const isFreeMail = senderDetails.email ? isFreeMailDomain(senderDetails.email) : false;

  const detailsCount = [
    claimedOrg,
    senderDetails.email,
    senderDetails.recruiterName,
    senderDetails.phone,
    senderDetails.upiId,
    senderDetails.emailHeaders,
    senderDetails.officialListingUrl,
    senderDetails.officialListingText,
  ].filter((v) => Boolean(v && v.trim())).length;

  return (
    <div className="rounded-md border border-border bg-surface shadow-2xs overflow-hidden">
      <button
        id="sender-details-header"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full min-h-[52px] flex items-center justify-between p-4 sm:p-5 text-left bg-surface-raised/60 hover:bg-surface-raised transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-primary/10 text-primary">
            <ShieldCheck className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">
                Add details for stronger checks (optional)
              </h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                detailsCount > 0
                  ? "bg-primary/15 text-primary border border-primary/30 font-semibold"
                  : "bg-surface-raised text-muted-foreground border border-border"
              }`}>
                {detailsCount > 0 ? `${detailsCount} added` : "Optional"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Adding the sender's email and headers lets Jaanch run more independent checks.
            </p>
          </div>
        </div>

        <div className="text-muted-foreground shrink-0 ml-2">
          {isOpen ? (
            <ChevronUp className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
          ) : (
            <ChevronDown className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 sm:p-6 space-y-4 border-t border-border text-xs sm:text-sm">
          {/* Organization Registry Autocomplete */}
          <OrganizationAutocomplete
            value={claimedOrg}
            selectedOrgId={senderDetails.organizationId}
            onChange={(name, orgId) => {
              onChangeClaimedOrg(name, orgId);
              onChangeSenderDetails({ organizationId: orgId });
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sender Email with Live Free-Provider Hint */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.75} aria-hidden="true" />
                Sender Email Address
              </label>
              <input
                type="email"
                value={senderDetails.email}
                onChange={(e) => onChangeSenderDetails({ email: e.target.value })}
                placeholder="e.g. careers@company.com"
                className="w-full min-h-[44px] px-3 py-2 rounded-md border border-border bg-surface text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {isFreeMail && (
                <div className="flex items-center gap-1.5 text-xs text-warning bg-warning/10 border border-warning/30 p-2 rounded-sm pt-0.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" strokeWidth={2} aria-hidden="true" />
                  <span>Free personal provider detected (Gmail/Yahoo/Outlook). Legitimate corporate offers come from corporate domains.</span>
                </div>
              )}
            </div>

            {/* Recruiter Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.75} aria-hidden="true" />
                Recruiter / Sender Name
              </label>
              <input
                type="text"
                value={senderDetails.recruiterName}
                onChange={(e) => onChangeSenderDetails({ recruiterName: e.target.value })}
                placeholder="e.g. Priya Sharma, HR Lead"
                className="w-full min-h-[44px] px-3 py-2 rounded-md border border-border bg-surface text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Sender Phone */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.75} aria-hidden="true" />
                Contact Phone (WhatsApp / Call)
              </label>
              <input
                type="tel"
                value={senderDetails.phone}
                onChange={(e) => onChangeSenderDetails({ phone: e.target.value })}
                placeholder="e.g. +91 98765 43210"
                className="w-full min-h-[44px] px-3 py-2 rounded-md border border-border bg-surface text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* UPI ID */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.75} aria-hidden="true" />
                UPI ID (if payment requested)
              </label>
              <input
                type="text"
                value={senderDetails.upiId}
                onChange={(e) => onChangeSenderDetails({ upiId: e.target.value })}
                placeholder="e.g. company@okhdfcbank"
                className="w-full min-h-[44px] px-3 py-2 rounded-md border border-border bg-surface text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Social Handle */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <AtSign className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.75} aria-hidden="true" />
                Social Media / Channel Handle
              </label>
              <input
                type="text"
                value={senderDetails.socialHandle}
                onChange={(e) => onChangeSenderDetails({ socialHandle: e.target.value })}
                placeholder="e.g. @tele_recruiter"
                className="w-full min-h-[44px] px-3 py-2 rounded-md border border-border bg-surface text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Website URL */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.75} aria-hidden="true" />
                Claimed Website
              </label>
              <input
                type="url"
                value={senderDetails.websiteUrl}
                onChange={(e) => onChangeSenderDetails({ websiteUrl: e.target.value })}
                placeholder="https://example.com"
                className="w-full min-h-[44px] px-3 py-2 rounded-md border border-border bg-surface text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Raw Email Headers Paste */}
          <div className="space-y-2 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.75} aria-hidden="true" />
                Raw Email Headers
              </label>
              <button
                type="button"
                onClick={() => setHelpOpen(true)}
                className="min-h-[44px] inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
                How to copy headers
              </button>
            </div>
            <textarea
              value={senderDetails.emailHeaders}
              onChange={(e) => onChangeSenderDetails({ emailHeaders: e.target.value })}
              rows={4}
              placeholder="Paste complete raw email headers (Received, Authentication-Results, DKIM-Signature)..."
              className="w-full font-mono text-xs px-3 py-2 rounded-md border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="text-[11px] text-muted-foreground">
              Headers are parsed locally and evaluated for SPF/DKIM/DMARC pass/fail results. Raw headers are never stored without explicit opt-in.
            </p>
          </div>

          {/* Official Listing Input */}
          <div className="space-y-2 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground">
                Official Listing Cross-Check
              </label>
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setListingMode("url")}
                  className={`min-h-[36px] px-3 py-1 rounded-md font-semibold cursor-pointer transition-colors ${
                    listingMode === "url"
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface-raised text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Official URL
                </button>
                <button
                  type="button"
                  onClick={() => setListingMode("text")}
                  className={`min-h-[36px] px-3 py-1 rounded-md font-semibold cursor-pointer transition-colors ${
                    listingMode === "text"
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface-raised text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Pasted Text
                </button>
              </div>
            </div>

            {listingMode === "url" ? (
              <div className="space-y-1">
                <input
                  type="url"
                  value={senderDetails.officialListingUrl}
                  onChange={(e) => onChangeSenderDetails({ officialListingUrl: e.target.value })}
                  placeholder="https://official-company.com/careers/listing"
                  className="w-full min-h-[44px] px-3 py-2 rounded-md border border-border bg-surface text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <p className="text-[11px] text-muted-foreground">
                  URLs matching registry official domains will be fetched and compared securely by the server.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <textarea
                  value={senderDetails.officialListingText}
                  onChange={(e) => onChangeSenderDetails({ officialListingText: e.target.value })}
                  rows={3}
                  placeholder="Paste official job description, stipend, and qualifications..."
                  className="w-full px-3 py-2 rounded-md border border-border bg-surface text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <p className="text-[11px] text-warning bg-warning/10 border border-warning/30 p-2 rounded-sm">
                  Pasted listing text is user-attested and cannot satisfy top-level Verified status outside demo mode.
                </p>
              </div>
            )}
          </div>

          {/* Third-Party Reputation Checks Consent Toggle */}
          <div className="pt-2 border-t border-border flex items-start gap-3">
            <input
              type="checkbox"
              id="thirdPartyToggle"
              checked={senderDetails.runThirdPartyChecks}
              onChange={(e) => onChangeSenderDetails({ runThirdPartyChecks: e.target.checked })}
              className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-ring cursor-pointer"
            />
            <label htmlFor="thirdPartyToggle" className="cursor-pointer space-y-0.5">
              <span className="text-xs font-bold text-foreground block">
                Run optional third-party reputation checks (Certificate Transparency & Safe Browsing)
              </span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Queries crt.sh (Certificate Transparency logs) by hostname and Google Safe Browsing if configured. Suspect hosts are never directly contacted.
              </p>
            </label>
          </div>
        </div>
      )}

      <HeadersHelpDialog isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
