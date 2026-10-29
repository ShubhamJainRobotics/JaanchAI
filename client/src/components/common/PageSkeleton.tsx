export function PageSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 animate-pulse" aria-busy="true" role="status">
      <span className="sr-only">Loading content...</span>
      <div className="h-8 bg-surface-raised border border-border rounded-md w-1/3"></div>
      <div className="h-24 bg-surface-raised border border-border rounded-md w-full"></div>
      <div className="space-y-4">
        <div className="h-6 bg-surface-raised border border-border rounded-md w-1/4"></div>
        <div className="h-28 bg-surface-raised border border-border rounded-md w-full"></div>
        <div className="h-28 bg-surface-raised border border-border rounded-md w-full"></div>
      </div>
    </div>
  );
}
