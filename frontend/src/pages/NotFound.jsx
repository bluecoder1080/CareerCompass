import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, ArrowLeft, Compass, Search } from 'lucide-react'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="card"
        >
          {/* 404 Animation */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <div className="relative">
              <div className="text-8xl font-bold text-transparent bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text">
                404
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              >
                <Compass className="w-16 h-16 text-primary-500/30" />
              </motion.div>
            </div>
          </motion.div>

          <h1 className="text-2xl font-bold text-white mb-4">
            Page Not Found
          </h1>
          
          <p className="text-gray-400 mb-8">
            Looks like you've wandered off the career path! The page you're looking for doesn't exist.
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <Link
              to="/"
              className="btn-primary flex-1 flex items-center justify-center"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="btn-secondary flex-1 flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </button>
          </div>

          {/* Search suggestion */}
          <div className="bg-dark-700/50 border border-dark-600 rounded-lg p-4">
            <div className="flex items-center justify-center mb-3">
              <Search className="w-5 h-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-300">Looking for something specific?</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link 
                to="/app/dashboard" 
                className="text-primary-400 hover:text-primary-300 transition-colors"
              >
                Dashboard
              </Link>
              <Link 
                to="/app/chat" 
                className="text-primary-400 hover:text-primary-300 transition-colors"
              >
                AI Chat
              </Link>
              <Link 
                to="/app/profile" 
                className="text-primary-400 hover:text-primary-300 transition-colors"
              >
                Profile
              </Link>
              <Link 
                to="/app/resume" 
                className="text-primary-400 hover:text-primary-300 transition-colors"
              >
                Resume
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default NotFound
