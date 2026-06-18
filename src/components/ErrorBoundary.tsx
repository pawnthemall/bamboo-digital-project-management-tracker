"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="border border-accent-red bg-surface p-6 max-w-md">
            <h2 className="text-lg font-bold text-accent-red mb-2 text-glow">SYSTEM ERROR</h2>
            <p className="text-xs text-muted mb-4">Something went wrong in the application.</p>
            {this.state.error && (
              <pre className="text-xs text-accent-red bg-background p-2 border border-border overflow-auto max-h-[200px]">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={() => this.setState({ hasError: false })}
              className="mt-4 bg-accent-green text-background px-4 py-2 text-xs font-bold hover:bg-foreground transition-colors"
            >
              RETRY
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
