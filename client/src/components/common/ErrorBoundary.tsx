import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught application error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-surface border border-status-high-risk-border rounded-md p-8 text-center shadow-elevation-1">
            <div className="w-12 h-12 bg-status-high-risk-bg text-status-high-risk-icon rounded-md flex items-center justify-center mx-auto mb-4 border border-status-high-risk-border">
              <AlertTriangle className="w-6 h-6" strokeWidth={2} aria-hidden="true" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Something went wrong</h2>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              An unexpected error occurred while rendering this view. Your input has not been lost.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="min-h-[44px] inline-flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm rounded-md shadow-xs transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <RefreshCw className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
