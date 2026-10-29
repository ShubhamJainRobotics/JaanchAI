import { Link } from "react-router-dom";
import { AlertCircle, HelpCircle, CheckSquare, ArrowRight, ShieldAlert } from "lucide-react";

export function ExampleWalkthrough() {
  const exampleText =
    "Congratulations! You have been selected for an internship. Pay ₹999 as a refundable security deposit within two hours to confirm your position.";

  return (
    <section className="py-16 bg-surface-raised/40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-sm bg-status-review-bg text-status-review-fg border border-status-review-border mb-2">
            Illustrative example — not a real case
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            See How Jaanch Deconstructs an Offer
          </h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto">
            A real-world breakdown of a classic ₹999 security deposit trap received on WhatsApp.
          </p>
        </div>

        {/* Input Message Card */}
        <div className="bg-surface border border-border rounded-md p-5 mb-8 shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2 font-mono">
            <span>INCOMING MESSAGE (WHATSAPP)</span>
            <span>DOMAIN: INTERNSHIP</span>
          </div>
          <div className="p-4 bg-surface-raised rounded-md font-mono text-sm text-foreground border border-border">
            "{exampleText}"
          </div>
        </div>

        {/* Breakdown Output */}
        <div className="space-y-6">
          {/* 1. Risk Level Banner */}
          <div className="p-5 rounded-md border bg-status-high-risk-bg border-status-high-risk-border text-status-high-risk-fg flex items-start gap-3.5 shadow-xs">
            <div className="w-8 h-8 rounded-md bg-status-high-risk-bg border border-status-high-risk-border text-status-high-risk-icon flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-status-high-risk-fg text-sm uppercase tracking-wide">
                  High Concern
                </span>
                <span className="text-xs bg-status-high-risk-fg/10 text-status-high-risk-fg px-2 py-0.5 rounded-sm font-medium">
                  4 serious warning signs detected
                </span>
              </div>
              <p className="text-sm text-status-high-risk-fg mt-1 leading-relaxed">
                We observed 4 serious warning sign(s). Do not pay or share details until you verify independently.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 2. What We Observed */}
            <div className="bg-surface border border-border rounded-md p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 text-status-high-risk-icon" strokeWidth={2} aria-hidden="true" />
                <h3 className="font-bold text-sm text-foreground">What We Observed</h3>
              </div>
              <ul className="space-y-3.5 text-xs">
                <li className="border-l-2 border-status-high-risk-border pl-3">
                  <strong className="block text-foreground">Upfront fee or deposit requested</strong>
                  <span className="text-muted-foreground italic">"Pay ₹999 as a refundable security deposit"</span>
                  <p className="text-muted-foreground mt-0.5">Legitimate employers never charge candidates for onboarding.</p>
                </li>
                <li className="border-l-2 border-warning pl-3">
                  <strong className="block text-foreground">Countdown pressure</strong>
                  <span className="text-muted-foreground italic">"within two hours"</span>
                  <p className="text-muted-foreground mt-0.5">Artificial urgency prevents consulting seniors or placement cells.</p>
                </li>
                <li className="border-l-2 border-warning pl-3">
                  <strong className="block text-foreground">Selection without evaluation</strong>
                  <span className="text-muted-foreground italic">"You have been selected for an internship"</span>
                  <p className="text-muted-foreground mt-0.5">No interview, test, or confirmed application on record.</p>
                </li>
              </ul>
            </div>

            {/* 3. Unknowns & Verify Next */}
            <div className="bg-surface border border-border rounded-md p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <HelpCircle className="w-4 h-4 text-warning" strokeWidth={1.75} aria-hidden="true" />
                  <h3 className="font-bold text-sm text-foreground">What Remains Unverified</h3>
                </div>
                <ul className="space-y-2 text-xs text-muted-foreground mb-6">
                  <li className="flex items-start gap-1.5">
                    <span className="text-warning font-bold">•</span>
                    <span><strong className="text-foreground">Recruiter Identity:</strong> No official corporate email domain provided.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-warning font-bold">•</span>
                    <span><strong className="text-foreground">Company Registration:</strong> CIN or legal entity not verified on MCA portal.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-warning font-bold">•</span>
                    <span><strong className="text-foreground">Application Trail:</strong> Did you initiate contact or apply for this role?</span>
                  </li>
                </ul>

                <div className="flex items-center gap-2 mb-3">
                  <CheckSquare className="w-4 h-4 text-status-verified-icon" strokeWidth={1.75} aria-hidden="true" />
                  <h3 className="font-bold text-sm text-foreground">Next Action</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Do not pay the ₹999. Send a Recruiter Challenge email demanding an official offer letter and check AICTE portal.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex justify-end">
                <Link
                  to="/analyze"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline min-h-[44px]"
                >
                  Test this sample in the Analyzer
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
