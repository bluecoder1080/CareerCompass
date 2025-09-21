import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '../../stores/authStore'
import { validationUtils } from '../../lib/utils'

const Register = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()
  
  const { register: registerUser, isLoading } = useAuthStore()
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  const password = watch('password', '')
  const passwordStrength = validationUtils.getPasswordStrength(password)

  const onSubmit = async (data) => {
    const { confirmPassword, ...userData } = data
    const result = await registerUser(userData)
    
    if (result.success) {
      navigate('/app/dashboard')
    }
  }

  const getStrengthColor = (score) => {
    if (score <= 1) return 'text-error-400'
    if (score <= 2) return 'text-warning-400'
    if (score <= 3) return 'text-yellow-400'
    if (score <= 4) return 'text-success-400'
    return 'text-success-400'
  }

  const getStrengthText = (score) => {
    if (score <= 1) return 'Very Weak'
    if (score <= 2) return 'Weak'
    if (score <= 3) return 'Fair'
    if (score <= 4) return 'Good'
    return 'Strong'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Create your account
        </h2>
        <p className="text-gray-400">
          Start your personalized career journey today
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
              First name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('firstName', {
                  required: 'First name is required',
                  minLength: {
                    value: 2,
                    message: 'First name must be at least 2 characters',
                  },
                })}
                type="text"
                className={`input pl-10 ${errors.firstName ? 'input-error' : ''}`}
                placeholder="First name"
                autoComplete="given-name"
              />
            </div>
            {errors.firstName && (
              <p className="mt-1 text-sm text-error-400">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
              Last name
            </label>
            <input
              {...register('lastName', {
                required: 'Last name is required',
                minLength: {
                  value: 2,
                  message: 'Last name must be at least 2 characters',
                },
              })}
              type="text"
              className={`input ${errors.lastName ? 'input-error' : ''}`}
              placeholder="Last name"
              autoComplete="family-name"
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-error-400">{errors.lastName.message}</p>
            )}
          </div>
        </div>

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
                validate: (value) => 
                  validationUtils.isValidEmail(value) || 'Please enter a valid email address',
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
                validate: (value) => {
                  const strength = validationUtils.getPasswordStrength(value)
                  return strength.score >= 3 || 'Password is too weak'
                },
              })}
              type={showPassword ? 'text' : 'password'}
              className={`input pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
              placeholder="Create a password"
              autoComplete="new-password"
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
          
          {/* Password strength indicator */}
          {password && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">Password strength:</span>
                <span className={`text-xs font-medium ${getStrengthColor(passwordStrength.score)}`}>
                  {getStrengthText(passwordStrength.score)}
                </span>
              </div>
              <div className="w-full bg-dark-700 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    passwordStrength.score <= 1 ? 'bg-error-500' :
                    passwordStrength.score <= 2 ? 'bg-warning-500' :
                    passwordStrength.score <= 3 ? 'bg-yellow-500' :
                    'bg-success-500'
                  }`}
                  style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                />
              </div>
              {passwordStrength.feedback.length > 0 && (
                <ul className="mt-1 text-xs text-gray-400 space-y-1">
                  {passwordStrength.feedback.map((feedback, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-1 h-1 bg-gray-400 rounded-full mr-2" />
                      {feedback}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          
          {errors.password && (
            <p className="mt-1 text-sm text-error-400">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm password field */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
            Confirm password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === password || 'Passwords do not match',
              })}
              type={showConfirmPassword ? 'text' : 'password'}
              className={`input pl-10 pr-10 ${errors.confirmPassword ? 'input-error' : ''}`}
              placeholder="Confirm your password"
              autoComplete="new-password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-error-400">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Terms and conditions */}
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              {...register('acceptTerms', {
                required: 'You must accept the terms and conditions',
              })}
              id="acceptTerms"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-dark-600 bg-dark-800 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="acceptTerms" className="text-gray-300">
              I agree to the{' '}
              <Link to="/terms" className="text-primary-400 hover:text-primary-300">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-primary-400 hover:text-primary-300">
                Privacy Policy
              </Link>
            </label>
          </div>
        </div>
        {errors.acceptTerms && (
          <p className="text-sm text-error-400">{errors.acceptTerms.message}</p>
        )}

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
              Create account
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        {/* Benefits */}
        <div className="bg-dark-700/50 border border-dark-600 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-300 mb-3">
            What you'll get with CareerCompass:
          </p>
          <div className="space-y-2">
            {[
              'Personalized AI career guidance',
              'Skill gap analysis and roadmaps',
              'Resume optimization tools',
              'Industry insights and trends'
            ].map((benefit, index) => (
              <div key={index} className="flex items-center text-sm text-gray-400">
                <CheckCircle className="w-4 h-4 text-success-400 mr-2 flex-shrink-0" />
                {benefit}
              </div>
            ))}
          </div>
        </div>

        {/* Sign in link */}
        <div className="text-center">
          <p className="text-sm text-gray-400">
            Already have an account?{' '}
            <Link
              to="/auth/login"
              className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </motion.div>
  )
}

export default Register
