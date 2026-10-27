import { SenderIdentity, Organization } from "shared";
import { Mail, AlertTriangle, CheckCircle2, User, Globe, Phone, DollarSign, AtSign } from "lucide-react";

interface SenderIdentityPanelProps {
  senderIdentity?: SenderIdentity | null;
  matchedOrganization?: Organization | null;
}

export function SenderIdentityPanel({
  senderIdentity,
  matchedOrganization,
}: SenderIdentityPanelProps) {
  if (!senderIdentity && !matchedOrganization) return null;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
          <Mail className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Sender & Channel Identity
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Authenticity and consistency of sender coordinates
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
        {/* Email & Domain */}
        {senderIdentity?.rawEmail && (
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">
              Sender Email
            </span>
            <div className="flex items-center gap-2 font-mono font-semibold text-slate-900 dark:text-slate-100 break-all">
              <span>{senderIdentity.rawEmail}</span>
            </div>
          </div>
        )}

        {/* Free Webmail provider warning */}
        {senderIdentity?.isFreeMail && (
          <div className="p-3 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 space-y-1">
            <div className="flex items-center gap-1.5 text-red-700 dark:text-red-400 font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>Free Personal Email Provider</span>
            </div>
            <p className="text-xs text-red-800/90 dark:text-red-300">
              Sender uses a public personal webmail service ({senderIdentity.domain}). Legitimate organizations hire exclusively via corporate domains.
            </p>
          </div>
        )}

        {/* Matched Registry Org */}
        {matchedOrganization && (
          <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Official Registry Match</span>
            </div>
            <p className="text-xs text-emerald-800/90 dark:text-emerald-300">
              Matched {matchedOrganization.name} with official domains:{" "}
              {matchedOrganization.officialDomains.join(", ")}
            </p>
          </div>
        )}

        {/* Recruiter Name */}
        {senderIdentity?.recruiterName && (
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
              <User className="w-3.5 h-3.5" /> Recruiter Name
            </span>
            <p className="font-semibold text-slate-900 dark:text-slate-100">
              {senderIdentity.recruiterName}
            </p>
          </div>
        )}

        {/* Phone */}
        {senderIdentity?.phone && (
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" /> Contact Phone
            </span>
            <p className="font-mono font-semibold text-slate-900 dark:text-slate-100">
              {senderIdentity.phone}
            </p>
          </div>
        )}

        {/* UPI ID */}
        {senderIdentity?.upiId && (
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" /> UPI ID
            </span>
            <p className="font-mono font-semibold text-slate-900 dark:text-slate-100">
              {senderIdentity.upiId}
            </p>
          </div>
        )}

        {/* Social Handle */}
        {senderIdentity?.socialHandle && (
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
              <AtSign className="w-3.5 h-3.5" /> Social Media Handle
            </span>
            <p className="font-semibold text-slate-900 dark:text-slate-100">
              @{senderIdentity.socialHandle}
            </p>
          </div>
        )}

        {/* Website URL */}
        {senderIdentity?.websiteUrl && (
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" /> Claimed Website
            </span>
            <p className="font-mono text-xs text-slate-700 dark:text-slate-300 break-all">
              {senderIdentity.websiteUrl}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
