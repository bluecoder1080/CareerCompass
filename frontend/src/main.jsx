import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: 1,
    },
  },
})

// Robust App wrapper with error boundaries
function AppWrapper() {
  try {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1e293b',
                color: '#e2e8f0',
                border: '1px solid #334155',
                borderRadius: '0.75rem',
              },
              success: {
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#1e293b',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#1e293b',
                },
              },
            }}
          />
        </BrowserRouter>
        {import.meta.env.DEV && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    )
  } catch (error) {
    console.error('App component error:', error)
    return (
      <div style={{ 
        backgroundColor: '#0b0f13', 
        color: '#ffffff', 
        minHeight: '100vh', 
        padding: '20px',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h1>⚠️ CareerCompass - Component Error</h1>
        <p>There was an error loading the app components:</p>
        <pre style={{ background: '#1e293b', padding: '10px', borderRadius: '5px', fontSize: '14px' }}>
          {error.message}
        </pre>
        <p>Please check the browser console for more details.</p>
      </div>
    )
  }
}

// Add error handling for React rendering
try {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <AppWrapper />
    </React.StrictMode>
  )
} catch (error) {
  console.error('React rendering failed:', error)
  // Fallback rendering
  document.getElementById('root').innerHTML = `
    <div style="background: #0b0f13; color: white; padding: 20px; min-height: 100vh;">
      <h1>❌ React Failed to Load</h1>
      <p>There was an error loading React:</p>
      <pre style="background: #1e293b; padding: 10px; border-radius: 5px; white-space: pre-wrap;">${error.message}</pre>
      <p>Stack trace:</p>
      <pre style="background: #1e293b; padding: 10px; border-radius: 5px; white-space: pre-wrap; font-size: 12px;">${error.stack}</pre>
    </div>
  `
}

// Original complex render (commented out for testing)
/*
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#e2e8f0',
              border: '1px solid #334155',
              borderRadius: '0.75rem',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#1e293b',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#1e293b',
              },
            },
          }}
        />
      </BrowserRouter>
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  </React.StrictMode>,
)
*/
