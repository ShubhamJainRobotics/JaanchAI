import { Link } from "react-router-dom";
import { AlertCircle, HelpCircle, CheckSquare, ArrowRight, ShieldAlert } from "lucide-react";

export function ExampleWalkthrough() {
  const exampleText =
    "Congratulations! You have been selected for an internship. Pay ₹999 as a refundable security deposit within two hours to confirm your position.";

  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 mb-2">
            Illustrative example — not a real case
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            See How Jaanch Deconstructs an Offer
          </h2>
          <p className="mt-2 text-sm text-slate-600 max-w-xl mx-auto">
            A real-world breakdown of a classic ₹999 security deposit trap received on WhatsApp.
          </p>
        </div>

        {/* Input Message Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-8 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-mono">
            <span>INCOMING MESSAGE (WHATSAPP)</span>
            <span>DOMAIN: INTERNSHIP</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl font-mono text-sm text-slate-800 border border-slate-200/80">
            "{exampleText}"
          </div>
        </div>

        {/* Breakdown Output */}
        <div className="space-y-6">
          {/* 1. Risk Level Banner */}
          <div className="p-5 rounded-xl border bg-red-50 border-red-200 text-red-900 flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-red-800 text-sm uppercase tracking-wide">
                  High Concern
                </span>
                <span className="text-xs bg-red-200/60 text-red-800 px-2 py-0.5 rounded-full font-medium">
                  4 serious warning signs detected
                </span>
              </div>
              <p className="text-sm text-red-950 mt-1">
                We observed 4 serious warning sign(s). Do not pay or share details until you verify independently.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 2. What We Observed */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <h3 className="font-bold text-sm text-slate-900">What We Observed</h3>
              </div>
              <ul className="space-y-3.5 text-xs">
                <li className="border-l-2 border-red-500 pl-3">
                  <strong className="block text-slate-900">Upfront fee or deposit requested</strong>
                  <span className="text-slate-500 italic">"Pay ₹999 as a refundable security deposit"</span>
                  <p className="text-slate-600 mt-0.5">Legitimate employers never charge candidates for onboarding.</p>
                </li>
                <li className="border-l-2 border-amber-500 pl-3">
                  <strong className="block text-slate-900">Countdown pressure</strong>
                  <span className="text-slate-500 italic">"within two hours"</span>
                  <p className="text-slate-600 mt-0.5">Artificial urgency prevents consulting seniors or placement cells.</p>
                </li>
                <li className="border-l-2 border-amber-500 pl-3">
                  <strong className="block text-slate-900">Selection without evaluation</strong>
                  <span className="text-slate-500 italic">"You have been selected for an internship"</span>
                  <p className="text-slate-600 mt-0.5">No interview, test, or confirmed application on record.</p>
                </li>
              </ul>
            </div>

            {/* 3. Unknowns & Verify Next */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <HelpCircle className="w-4 h-4 text-amber-600" />
                  <h3 className="font-bold text-sm text-slate-900">What Remains Unverified</h3>
                </div>
                <ul className="space-y-2 text-xs text-slate-600 mb-6">
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-500 font-bold">•</span>
                    <span><strong>Recruiter Identity:</strong> No official corporate email domain provided.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-500 font-bold">•</span>
                    <span><strong>Company Registration:</strong> CIN or legal entity not verified on MCA portal.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-500 font-bold">•</span>
                    <span><strong>Application Trail:</strong> Did you initiate contact or apply for this role?</span>
                  </li>
                </ul>

                <div className="flex items-center gap-2 mb-3">
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-sm text-slate-900">Next Action</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Do not pay the ₹999. Send a Recruiter Challenge email demanding an official offer letter and check AICTE portal.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                <Link
                  to="/analyze"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
                >
                  Test this sample in the Analyzer
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
