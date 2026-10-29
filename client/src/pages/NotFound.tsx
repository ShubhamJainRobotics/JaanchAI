import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-4">
        <div className="w-16 h-16 bg-surface-raised text-muted-foreground rounded-md flex items-center justify-center mx-auto border border-border">
          <ShieldAlert className="w-8 h-8" strokeWidth={1.75} aria-hidden="true" />
        </div>
        <h1 className="text-4xl font-extrabold text-foreground tracking-tight">404</h1>
        <h2 className="text-lg font-bold text-foreground">Page Not Found</h2>
        <p className="text-xs text-muted-foreground">
          The page or verification report you are looking for does not exist or has been removed.
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-xs font-bold transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
