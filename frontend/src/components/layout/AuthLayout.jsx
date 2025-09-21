import { Outlet, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Compass, Sparkles } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'

const AuthLayout = () => {
  const { isAuthenticated } = useAuthStore()

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/app/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-dark-950 flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-md"
        >
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center">
              <Compass className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold text-gradient">
              CareerCompass
            </span>
          </div>

          {/* Hero content */}
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-white leading-tight">
              Navigate Your Career with{' '}
              <span className="text-gradient-secondary">AI-Powered</span>{' '}
              Guidance
            </h1>
            
            <p className="text-lg text-gray-400 leading-relaxed">
              Discover personalized career paths, build skills, and accelerate your 
              professional growth with intelligent recommendations tailored just for you.
            </p>

            {/* Features */}
            <div className="space-y-4 pt-4">
              {[
                'AI-powered career recommendations',
                'Personalized skill development roadmaps',
                'Interactive psychometric assessments',
                'Smart resume builder and optimizer',
                'Real-time industry insights'
              ].map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-6 h-6 bg-primary-500/20 rounded-full flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-primary-400" />
                  </div>
                  <span className="text-gray-300">{feature}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-20 left-20 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-40 w-24 h-24 bg-accent-500/10 rounded-full blur-2xl"></div>
        </motion.div>
      </div>

      {/* Right side - Auth forms */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 lg:max-w-md lg:mx-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-sm mx-auto"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gradient">
              CareerCompass
            </span>
          </div>

          {/* Auth form container */}
          <div className="card">
            <Outlet />
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              By continuing, you agree to our{' '}
              <a href="#" className="text-primary-400 hover:text-primary-300">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-primary-400 hover:text-primary-300">
                Privacy Policy
              </a>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Background effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-accent-500/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  )
}

export default AuthLayout
