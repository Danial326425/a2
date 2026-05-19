'use client';

import React from 'react';

/**
 * App-wide error boundary. Catches uncaught render errors in any descendant
 * and shows a graceful fallback instead of an unmounted blank page (the React
 * default when a child throws). Wraps the storefront at the root layout.
 *
 * Note: this is intentionally a class component because React's error-boundary
 * lifecycle (getDerivedStateFromError + componentDidCatch) is class-only.
 *
 * Production behavior:
 *   - Renders a friendly Bengali message + "Refresh" button.
 *   - Logs to console.error so error reporting services (Sentry, etc.) can pick
 *     it up via window.onerror or their own SDK hooks.
 *
 * Dev behavior:
 *   - Renders the error message + stack so the developer sees what broke.
 */
export default class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Surface to console + any installed monitoring (Sentry hooks console.error
    // by default). We avoid logging full stacks in production builds.
    if (process.env.NODE_ENV !== 'production') {
      console.error('[ErrorBoundary]', error, info?.componentStack);
    }
  }

  handleReset = () => {
    this.setState({ error: null });
    if (typeof window !== 'undefined') window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-red-100 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">কিছু একটা ভুল হয়েছে</h1>
          <p className="text-sm text-gray-600 mb-6">
            পেজটি লোড করতে সমস্যা হচ্ছে। অনুগ্রহ করে আবার চেষ্টা করুন। যদি সমস্যা থাকে, আমাদের সাথে যোগাযোগ করুন।
          </p>
          {process.env.NODE_ENV !== 'production' && this.state.error?.message && (
            <pre className="mb-5 text-left text-[11px] bg-gray-50 text-gray-700 border border-gray-200 rounded-lg p-3 overflow-x-auto">
              {this.state.error.message}
            </pre>
          )}
          <button
            type="button"
            onClick={this.handleReset}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 text-white font-semibold hover:from-red-700 hover:to-rose-700 transition-colors shadow-md"
          >
            Refresh করুন
          </button>
        </div>
      </div>
    );
  }
}
