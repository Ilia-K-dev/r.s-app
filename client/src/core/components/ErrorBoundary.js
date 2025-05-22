import React from 'react';
import PropTypes from 'prop-types';
import { logger } from '@/shared/utils/logger';
import { Button } from '@/shared/components/forms/Button';
import { Alert } from '@/shared/components/ui/Alert';
import { RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  
  componentDidCatch(error, errorInfo) {
    // Log the error
    logger.error("Error Boundary caught an error:", {
      error: error,
      errorInfo: errorInfo,
      componentStack: errorInfo.componentStack
    });

    this.setState({
      errorInfo: errorInfo
    });

    // Report to error reporting service if needed
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleNavigateHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">
                Something went wrong
              </h2>
              <p className="mt-2 text-gray-600">
                We're sorry for the inconvenience. This error has been logged
                and will be addressed.
              </p>
            </div>

            <Alert
              type="error"
              message={this.state.error?.message || "An unexpected error occurred"}
            />

            {/* Show error details in development */}
            {process.env.NODE_ENV === "development" && this.state.errorInfo && (
              <div className="mt-4">
                <details className="cursor-pointer">
                  <summary className="text-sm text-gray-500 hover:text-gray-700">
                    Error Details
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-4 rounded-lg overflow-auto max-h-96">
                    {this.state.error?.toString()}
                    <br />
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              </div>
            )}

            <div className="flex flex-col space-y-4">
              <Button onClick={this.handleReload} icon={RefreshCw} fullWidth>
                Try Again
              </Button>

              <Button
                onClick={this.handleNavigateHome}
                variant="secondary"
                icon={Home}
                fullWidth
              >
                Go to Homepage
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  onError: PropTypes.func,
  fallback: PropTypes.element
};

export default ErrorBoundary;
