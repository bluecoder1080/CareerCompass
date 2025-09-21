import React from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    })

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo)
    }

    // In production, you might want to send this to an error reporting service
    // logErrorToService(error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="card">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-error-500/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-error-400" />
                </div>
              </div>
              
              <h1 className="text-2xl font-bold text-white mb-2">
                Oops! Something went wrong
              </h1>
              
              <p className="text-gray-400 mb-6">
                We encountered an unexpected error. Don't worry, our team has been notified.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-dark-900 border border-error-500/20 rounded-lg p-4 mb-6 text-left">
                  <h3 className="text-sm font-medium text-error-400 mb-2">
                    Error Details (Development)
                  </h3>
                  <pre className="text-xs text-gray-300 overflow-auto max-h-32">
                    {this.state.error.toString()}
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={this.handleReload}
                  className="btn-primary flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Page
                </button>
                
                <Link
                  to="/"
                  className="btn-secondary flex-1 flex items-center justify-center"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Link>
              </div>

              <div className="mt-6 pt-6 border-t border-dark-700">
                <p className="text-xs text-gray-500">
                  If this problem persists, please contact support at{' '}
                  <a 
                    href="mailto:support@careercompass.app" 
                    className="text-primary-400 hover:text-primary-300"
                  >
                    support@careercompass.app
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
