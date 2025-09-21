import { Routes, Route, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from './stores/authStore'
import { useThemeStore } from './stores/themeStore'
import { useEffect } from 'react'

// Layout components
import Layout from './components/layout/Layout'
import AuthLayout from './components/layout/AuthLayout'

// Pages
import Landing from './pages/Landing'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import Profile from './pages/Profile'
import Psychotest from './pages/Psychotest'
import Resume from './pages/Resume'
import NotFound from './pages/NotFound'

// Protected Route component
import ProtectedRoute from './components/auth/ProtectedRoute'

// Error Boundary
import ErrorBoundary from './components/common/ErrorBoundary'

function App() {
  const { user, initializeAuth, isLoading } = useAuthStore()
  const { theme, initializeTheme } = useThemeStore()

  useEffect(() => {
    try {
      initializeAuth()
      initializeTheme()
    } catch (error) {
      console.error('App initialization failed:', error)
    }

    // Timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn('App initialization timeout - forcing load')
        // Force the loading state to false if it takes too long
        useAuthStore.setState({ isLoading: false })
      }
    }, 5000)

    return () => clearTimeout(timeout)
  }, [initializeAuth, initializeTheme])

  // Show loading screen while initializing (with inline styles as fallback)
  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#0b0f13', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: '#e2e8f0'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            border: '3px solid #334155',
            borderTop: '3px solid #0ea5e9',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p>Loading CareerCompass...</p>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className={`min-h-screen bg-dark-950 ${theme}`}>
        <AnimatePresence mode="wait">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            
            {/* Auth routes */}
            <Route path="/auth" element={<AuthLayout />}>
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route index element={<Navigate to="/auth/login" replace />} />
            </Route>

            {/* Protected routes */}
            <Route path="/app" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="chat" element={<Chat />} />
              <Route path="chat/:chatId" element={<Chat />} />
              <Route path="profile" element={<Profile />} />
              <Route path="psychotest" element={<Psychotest />} />
              <Route path="resume" element={<Resume />} />
              <Route path="resume/:resumeId" element={<Resume />} />
            </Route>

            {/* Public shared content */}
            <Route path="/shared">
              <Route path="psychotest/:shareId" element={<div>Shared Psychotest Result</div>} />
              <Route path="resume/:shareId" element={<div>Shared Resume</div>} />
            </Route>

            {/* Catch all - 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  )
}

export default App
