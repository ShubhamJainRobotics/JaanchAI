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

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 sm:p-5 text-left bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100/60 transition-colors cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-brand-100 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Add Sender & Authenticity Details (Optional)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Supply headers, recruiter name, or official listing to unlock higher verification certainty
            </p>
          </div>
        </div>

        <div className="text-slate-400">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 sm:p-6 space-y-4 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-sm">
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
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Sender Email Address
              </label>
              <input
                type="email"
                value={senderDetails.email}
                onChange={(e) => onChangeSenderDetails({ email: e.target.value })}
                placeholder="e.g. careers@company.com"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100"
              />
              {isFreeMail && (
                <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 pt-0.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Free personal provider detected (Gmail/Yahoo/Outlook). Legitimate corporate offers come from corporate domains.</span>
                </div>
              )}
            </div>

            {/* Recruiter Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Recruiter / Sender Name
              </label>
              <input
                type="text"
                value={senderDetails.recruiterName}
                onChange={(e) => onChangeSenderDetails({ recruiterName: e.target.value })}
                placeholder="e.g. Priya Sharma, HR Lead"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100"
              />
            </div>

            {/* Sender Phone */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> Contact Phone (WhatsApp / Call)
              </label>
              <input
                type="tel"
                value={senderDetails.phone}
                onChange={(e) => onChangeSenderDetails({ phone: e.target.value })}
                placeholder="e.g. +91 98765 43210"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100"
              />
            </div>

            {/* UPI ID */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" /> UPI ID (if payment requested)
              </label>
              <input
                type="text"
                value={senderDetails.upiId}
                onChange={(e) => onChangeSenderDetails({ upiId: e.target.value })}
                placeholder="e.g. company@okhdfcbank"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100"
              />
            </div>

            {/* Social Handle */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <AtSign className="w-3.5 h-3.5" /> Social Media / Channel Handle
              </label>
              <input
                type="text"
                value={senderDetails.socialHandle}
                onChange={(e) => onChangeSenderDetails({ socialHandle: e.target.value })}
                placeholder="e.g. @tele_recruiter"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100"
              />
            </div>

            {/* Website URL */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" /> Claimed Website
              </label>
              <input
                type="url"
                value={senderDetails.websiteUrl}
                onChange={(e) => onChangeSenderDetails({ websiteUrl: e.target.value })}
                placeholder="https://example.com"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Raw Email Headers Paste */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5" /> Raw Email Headers
              </label>
              <button
                type="button"
                onClick={() => setHelpOpen(true)}
                className="inline-flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                How to copy headers
              </button>
            </div>
            <textarea
              value={senderDetails.emailHeaders}
              onChange={(e) => onChangeSenderDetails({ emailHeaders: e.target.value })}
              rows={4}
              placeholder="Paste complete raw email headers (Received, Authentication-Results, DKIM-Signature)..."
              className="w-full font-mono text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Headers are parsed locally and evaluated for SPF/DKIM/DMARC pass/fail results. Raw headers are never stored without explicit opt-in.
            </p>
          </div>

          {/* Official Listing Input */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Official Listing Cross-Check
              </label>
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setListingMode("url")}
                  className={`px-2.5 py-0.5 rounded-md font-semibold cursor-pointer ${
                    listingMode === "url"
                      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  Official URL
                </button>
                <button
                  type="button"
                  onClick={() => setListingMode("text")}
                  className={`px-2.5 py-0.5 rounded-md font-semibold cursor-pointer ${
                    listingMode === "text"
                      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100"
                />
                <p className="text-[11px] text-amber-700 dark:text-amber-400">
                  Pasted listing text is user-attested and cannot satisfy top-level Verified status outside demo mode.
                </p>
              </div>
            )}
          </div>

          {/* Third-Party Reputation Checks Consent Toggle */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-start gap-3">
            <input
              type="checkbox"
              id="thirdPartyToggle"
              checked={senderDetails.runThirdPartyChecks}
              onChange={(e) => onChangeSenderDetails({ runThirdPartyChecks: e.target.checked })}
              className="mt-1 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
            />
            <label htmlFor="thirdPartyToggle" className="cursor-pointer space-y-0.5">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Run optional third-party reputation checks (Certificate Transparency & Safe Browsing)
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
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
