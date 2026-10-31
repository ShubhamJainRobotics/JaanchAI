import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { LinkCheckResult } from "shared";
import { apiClient } from "../lib/apiClient";
import { LinkInspectorCard } from "../components/results/LinkInspectorCard";
import { Search, Link2, AlertTriangle, Loader2, ShieldCheck, Clock, HelpCircle } from "lucide-react";

export function LinkCheck() {
  const [searchParams] = useSearchParams();
  const initialUrl = searchParams.get("url") || "";

  const [url, setUrl] = useState(initialUrl);
  const [result, setResult] = useState<LinkCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkMutation = useMutation({
    mutationFn: (targetUrl: string) => apiClient.checkLink({ url: targetUrl }),
    onSuccess: (data) => {
      setResult(data);
      setError(null);
    },
    onError: (err: any) => {
      setError(err.message || "Failed to inspect link.");
    },
  });

  useEffect(() => {
    if (initialUrl && /^https?:\/\//i.test(initialUrl)) {
      checkMutation.mutate(initialUrl);
    }
  }, [initialUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;

    if (!/^https?:\/\//i.test(trimmed)) {
      setError("Please include http:// or https:// at the beginning of the web address.");
      return;
    }

    checkMutation.mutate(trimmed);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-subtle block mb-1.5 select-none">
          DOMAIN REPUTATION & LOOKALIKE AUDIT
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-normal text-foreground tracking-tight flex items-center gap-2.5">
          <Link2 className="w-7 h-7 text-terracotta" strokeWidth={1.75} aria-hidden="true" />
          Link &amp; Domain Inspector
        </h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Verify domain age, brand lookalikes, and hidden redirects before opening an unfamiliar link. We check official domain registration records directly and <strong>never visit or download content from the target website</strong>.
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-surface rounded-2xl border border-border shadow-xs p-6 sm:p-8 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <label htmlFor="url-input" className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            Enter Web Address to Inspect
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <Search className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
              </div>
              <input
                id="url-input"
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="https://example.com/apply"
                className="w-full min-h-[44px] pl-10 pr-4 py-2.5 bg-surface border border-border rounded-md text-sm font-mono text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={checkMutation.isPending || !url.trim()}
              className="min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm rounded-md shadow-xs transition-colors disabled:opacity-50 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {checkMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} aria-hidden="true" />
                  Inspecting...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
                  Inspect Link
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-status-high-risk-bg text-status-high-risk-fg text-xs rounded-md border border-status-high-risk-border">
              <AlertTriangle className="w-4 h-4 shrink-0" strokeWidth={2} aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}
        </form>

        {/* Educational hints */}
        <div className="pt-3 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-muted-foreground">
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <strong className="text-foreground block font-semibold">Domain Age Check</strong>
              <span>Brand-new domains (less than 30 days old) are a frequent sign of temporary scam campaigns.</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <strong className="text-foreground block font-semibold">Lookalike Protection</strong>
              <span>Detects deceptive spellings that pretend to be legitimate companies or government bodies.</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <strong className="text-foreground block font-semibold">Zero-Visit Privacy</strong>
              <span>Queries official internet registries only. The target site never gets your IP address.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Result Display */}
      {result && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground tracking-tight">
            Inspection Findings
          </h2>
          <LinkInspectorCard initialLink={result} />
        </div>
      )}
    </div>
  );
}
