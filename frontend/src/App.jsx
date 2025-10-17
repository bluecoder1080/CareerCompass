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
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import Profile from './pages/Profile'
import Psychotest from './pages/Psychotest'
import Resume from './pages/Resume'
import Projects from './pages/Projects'
import TechUpdates from './pages/TechUpdates'
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
      // DEMO MODE: Skip auth initialization to prevent network errors
      console.log('🎭 DEMO MODE: Skipping auth initialization')
      initializeTheme()
      
      // Force auth state to not loading
      useAuthStore.setState({ isLoading: false, isAuthenticated: false })
    } catch (error) {
      console.error('App initialization failed:', error)
    }
  }, [initializeTheme])

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
              <Route path="projects" element={<Projects />} />
              <Route path="tech-updates" element={<TechUpdates />} />
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
