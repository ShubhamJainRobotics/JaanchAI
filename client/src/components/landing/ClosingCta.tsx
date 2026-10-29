import { Link } from "react-router-dom";
import { ShieldCheck, Search } from "lucide-react";

export function ClosingCta() {
  return (
    <section className="py-14 sm:py-20 bg-primary text-primary-foreground text-center">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary-foreground">
          Ready to verify an offer message?
        </h2>
        <p className="text-sm sm:text-base text-primary-foreground/85 max-w-xl mx-auto leading-relaxed">
          Take 30 seconds to paste the message and review the evidence before you pay or share sensitive documents.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/analyze"
            className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-md bg-surface text-primary hover:bg-surface-raised font-bold text-sm sm:text-base shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2"
          >
            <ShieldCheck className="w-5 h-5 text-primary" strokeWidth={1.75} aria-hidden="true" />
            <span>Check an offer</span>
          </Link>

          <Link
            to="/link-check"
            className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-md bg-primary-hover hover:bg-primary-pressed text-primary-foreground font-semibold text-sm sm:text-base border border-primary-foreground/20 transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2"
          >
            <Search className="w-4 h-4 text-primary-foreground" strokeWidth={1.75} aria-hidden="true" />
            <span>Inspect a link</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
