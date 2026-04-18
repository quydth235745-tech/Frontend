import React from 'react';
import { toast } from 'react-toastify';

const isDev = import.meta.env.DEV;

/**
 * Error Boundary Component
 * Catches React component errors and displays fallback UI
 */
class ChanRaLoi extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ Component Error Caught:', error, errorInfo);
    toast.error('Something went wrong. Please try refreshing the page.');
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            backgroundColor: '#f8f9fa',
            color: '#333',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          <div
            style={{
              textAlign: 'center',
              padding: '40px',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              maxWidth: '500px',
            }}
          >
            <h1 style={{ fontSize: '2em', marginBottom: '20px', color: '#e74c3c' }}>
              🚨 Oops! Something went wrong
            </h1>
            <p style={{ fontSize: '1em', marginBottom: '20px', color: '#666' }}>
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            {isDev && (
              <div
                style={{
                  backgroundColor: '#f5f5f5',
                  padding: '15px',
                  borderRadius: '4px',
                  marginBottom: '20px',
                  textAlign: 'left',
                  overflowX: 'auto',
                  fontSize: '0.85em',
                  color: '#d32f2f',
                }}
              >
                <strong>Error Details (Development Only):</strong>
                <pre style={{ margin: '10px 0 0 0' }}>
                  {this.state.error?.toString()}
                </pre>
              </div>
            )}
            <button
              onClick={this.handleReset}
              style={{
                padding: '10px 30px',
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1em',
                marginRight: '10px',
              }}
            >
              Try Again
            </button>
            <button
              onClick={() => (window.location.href = '/')}
              style={{
                padding: '10px 30px',
                backgroundColor: '#95a5a6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1em',
              }}
            >
              Go Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ChanRaLoi;
