'use client';

import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Global Error Boundary
 * 
 * Prevents unrecoverable React hydration failures from cascading
 * and killing the entire client-side router (which freezes all <Link> navigation).
 * 
 * When a child component throws, this wrapper catches it and renders a
 * graceful fallback instead of crashing the entire page.
 */
export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught render error:', error.message);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div style={{
          padding: '40px', textAlign: 'center',
          background: '#fef2f2', borderRadius: '16px',
          border: '1px solid rgba(218,41,28,0.15)',
          margin: '20px',
        }}>
          <p style={{ fontSize: '16px', color: '#da291c', fontWeight: 700, margin: '0 0 8px' }}>
            ⚠️ Something went wrong loading this section.
          </p>
          <p style={{ fontSize: '13px', color: '#888', margin: '0 0 16px' }}>
            The data source may be temporarily unavailable.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            style={{
              padding: '10px 24px', background: '#da291c', color: 'white',
              border: 'none', borderRadius: '8px', fontSize: '14px',
              fontWeight: 700, cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
