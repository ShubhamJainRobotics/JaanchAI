import { Shield, EyeOff, Lock, Trash2 } from "lucide-react";

export function Privacy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Privacy Policy & Data Handling
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Plain-language explanation of how Jaanch processes your inputs, protects your identity, and enforces data minimization.
        </p>
      </div>

      <div className="space-y-6">
        {/* 1. Client-Side File Extraction */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <EyeOff className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Your Files Never Leave Your Browser
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            When you upload a WhatsApp screenshot or PDF offer letter, Optical Character Recognition (OCR) and PDF page rendering run 100% inside your browser using WebAssembly. The actual image or document is <strong>never uploaded to our backend server</strong> or shared with third parties.
          </p>
        </div>

        {/* 2. PII Redaction Before AI */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Automated PII Redaction Before Any AI Context
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Even if you consent to using Google Gemini AI for contextual analysis, our server executes automated regex redactions before dispatching data. Indian phone numbers, email addresses, Aadhaar numbers, PAN cards, UPI IDs, and bank account numbers are replaced with placeholders like <code>[PHONE]</code> or <code>[UPI_ID]</code>.
          </p>
        </div>

        {/* 3. Raw Text Opt-Out */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              "Don't Store My Raw Text" Option
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            You can uncheck "Store raw input text" on the analyzer at any time. When disabled, our database stores only a one-way cryptographic SHA-256 hash and character length for audit purposes, alongside your structured risk findings. The text itself is discarded immediately after analysis.
          </p>
        </div>

        {/* 4. Guest Mode & Data Deletion */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Guest Mode & Permanent Deletion
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Unauthenticated guest analyses are held in ephemeral session storage and never saved to our database. Registered users retain complete control: you can delete single analyses or trigger a complete account data purge from your Settings page at any time.
          </p>
        </div>
      </div>
    </div>
  );
}
