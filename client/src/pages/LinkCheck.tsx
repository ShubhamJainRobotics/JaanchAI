import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { LinkCheckResult } from "shared";
import { apiClient } from "../lib/apiClient";
import { LinkInspectorCard } from "../components/results/LinkInspectorCard";
import { Search, Link2, AlertTriangle, Loader2 } from "lucide-react";

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
      setError("Please include http:// or https:// at the beginning of the URL.");
      return;
    }

    checkMutation.mutate(trimmed);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Link2 className="w-8 h-8 text-brand-600" />
          Link & Domain Inspector
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Check domain age, lookalike impersonations, and shorteners. We query RDAP registries directly and <strong>never fetch or visit the target website</strong>.
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <label htmlFor="url-input" className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
            Enter URL to Inspect
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
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
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-mono text-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={checkMutation.isPending || !url.trim()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {checkMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Inspecting...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Inspect Domain
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </form>
      </div>

      {/* Result Display */}
      {result && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Inspection Findings
          </h2>
          <LinkInspectorCard initialLink={result} />
        </div>
      )}
    </div>
  );
}
