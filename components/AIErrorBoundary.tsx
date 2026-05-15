'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  /** Human-readable name of the panel, shown in the error UI */
  panelName?: string;
  /** Optional manual entry fallback URL or handler */
  onFallback?: () => void;
  fallbackLabel?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * AIErrorBoundary
 * Wraps AI-powered panels (ShiftTracker, ReceiptVault, VoiceCommandCenter).
 * If an unhandled exception propagates up from the AI component, this boundary
 * catches it and renders a friendly fallback instead of crashing the dashboard.
 */
export default class AIErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log to console in dev; in production this is where Sentry would capture
    console.error(`[AIErrorBoundary] Caught error in "${this.props.panelName ?? 'AI Panel'}":`, error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const { panelName = 'AI Panel', onFallback, fallbackLabel = 'Manual Entry' } = this.props;

      return (
        <div className="bg-card border border-red-500/20 rounded-3xl p-6 flex flex-col items-center justify-center gap-4 text-center min-h-[160px]">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertTriangle size={22} className="text-red-400" />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-black text-white uppercase tracking-widest">
              {panelName} Unavailable
            </p>
            <p className="text-xs text-gray-500 max-w-[260px]">
              The AI component encountered an unexpected error. Your data is safe.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-center">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-black uppercase tracking-widest transition-all"
            >
              <RefreshCw size={13} />
              Retry
            </button>

            {onFallback && (
              <button
                onClick={onFallback}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand/10 hover:bg-brand/20 border border-brand/20 text-brand text-xs font-black uppercase tracking-widest transition-all"
              >
                {fallbackLabel}
              </button>
            )}
          </div>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="text-left w-full mt-2">
              <summary className="text-[10px] text-gray-600 cursor-pointer uppercase tracking-widest font-bold">
                Dev: Error Details
              </summary>
              <pre className="text-[9px] text-red-400/70 mt-2 overflow-x-auto p-2 bg-black/30 rounded-lg">
                {this.state.error.message}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
