import { Component } from 'react';

/**
 * Wraps the app so a crash in any one page (an unhandled render-time error —
 * e.g. reading a property on data that arrived in an unexpected shape)
 * doesn't take down the whole screen with a raw stack trace. Shows a plain
 * "something went wrong" message with a reload button instead.
 *
 * This does NOT fix the underlying bug that caused a crash — it's a safety
 * net so the person gets a recoverable screen rather than a blank one while
 * the real cause gets tracked down.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Caught render error:', error, info?.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="max-w-md w-full bg-white border border-gray-200 rounded-xl shadow-sm p-8 text-center">
            <h1 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-sm text-gray-500 mb-6">
              This page ran into an unexpected error. Reloading usually fixes it.
            </p>
            <button
              onClick={this.handleReload}
              className="px-6 py-2.5 bg-primaryGreen text-white text-sm font-medium rounded-full hover:opacity-90 transition-opacity"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;