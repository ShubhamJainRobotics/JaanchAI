export function PageSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 animate-pulse" aria-busy="true">
      <div className="h-8 bg-slate-200 rounded-md w-1/3"></div>
      <div className="h-24 bg-slate-200 rounded-xl w-full"></div>
      <div className="space-y-4">
        <div className="h-6 bg-slate-200 rounded w-1/4"></div>
        <div className="h-32 bg-slate-200 rounded-xl w-full"></div>
        <div className="h-32 bg-slate-200 rounded-xl w-full"></div>
      </div>
    </div>
  );
}
