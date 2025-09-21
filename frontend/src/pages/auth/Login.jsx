import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '../../stores/authStore'
import toast from 'react-hot-toast'

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  
  const { login, isLoading } = useAuthStore()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const from = location.state?.from?.pathname || '/app/dashboard'

  const onSubmit = async (data) => {
    const result = await login(data)
    
    if (result.success) {
      navigate(from, { replace: true })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Welcome back
        </h2>
        <p className="text-gray-400">
          Sign in to continue your career journey
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
            Email address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Please enter a valid email address',
                },
              })}
              type="email"
              className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
              placeholder="Enter your email"
              autoComplete="email"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-error-400">{errors.email.message}</p>
          )}
        </div>

        {/* Password field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
              type={showPassword ? 'text' : 'password'}
              className={`input pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-error-400">{errors.password.message}</p>
          )}
        </div>

        {/* Remember me and forgot password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-dark-600 bg-dark-800 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <Link
              to="/auth/forgot-password"
              className="text-primary-400 hover:text-primary-300 transition-colors"
            >
              Forgot your password?
            </Link>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn-primary py-3 text-base group"
        >
          {isLoading ? (
            <div className="spinner w-5 h-5 mx-auto"></div>
          ) : (
            <>
              Sign in
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-dark-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-dark-800 text-gray-400">Or continue with</span>
          </div>
        </div>

        {/* Demo account */}
        <div className="bg-dark-700/50 border border-dark-600 rounded-lg p-4">
          <p className="text-sm text-gray-300 mb-3">
            Try CareerCompass with a demo account:
          </p>
          <div className="grid grid-cols-1 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Email:</span>
              <span className="text-gray-300 font-mono">alex.johnson@example.com</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Password:</span>
              <span className="text-gray-300 font-mono">password123</span>
            </div>
          </div>
        </div>

        {/* Sign up link */}
        <div className="text-center">
          <p className="text-sm text-gray-400">
            Don't have an account?{' '}
            <Link
              to="/auth/register"
              className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
            >
              Sign up for free
            </Link>
          </p>
        </div>
      </form>
    </motion.div>
  )
}

export default Login
