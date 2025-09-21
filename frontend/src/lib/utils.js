import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns'

// Tailwind CSS class merger
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Date formatting utilities
export const dateUtils = {
  // Format date for display
  formatDate: (date, formatStr = 'MMM dd, yyyy') => {
    if (!date) return ''
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return format(dateObj, formatStr)
  },

  // Format date with time
  formatDateTime: (date) => {
    if (!date) return ''
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return format(dateObj, 'MMM dd, yyyy \'at\' h:mm a')
  },

  // Relative time (e.g., "2 hours ago")
  formatRelative: (date) => {
    if (!date) return ''
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return formatDistanceToNow(dateObj, { addSuffix: true })
  },

  // Smart date formatting
  formatSmart: (date) => {
    if (!date) return ''
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    
    if (isToday(dateObj)) {
      return format(dateObj, 'h:mm a')
    } else if (isYesterday(dateObj)) {
      return 'Yesterday'
    } else {
      return format(dateObj, 'MMM dd')
    }
  },

  // Duration between dates
  getDuration: (startDate, endDate = new Date()) => {
    if (!startDate) return ''
    const start = typeof startDate === 'string' ? parseISO(startDate) : startDate
    const end = typeof endDate === 'string' ? parseISO(endDate) : endDate
    
    const diffInMonths = (end.getFullYear() - start.getFullYear()) * 12 + 
                        (end.getMonth() - start.getMonth())
    
    if (diffInMonths < 1) {
      return 'Less than a month'
    } else if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''}`
    } else {
      const years = Math.floor(diffInMonths / 12)
      const months = diffInMonths % 12
      let result = `${years} year${years > 1 ? 's' : ''}`
      if (months > 0) {
        result += ` ${months} month${months > 1 ? 's' : ''}`
      }
      return result
    }
  },
}

// String utilities
export const stringUtils = {
  // Capitalize first letter
  capitalize: (str) => {
    if (!str) return ''
    return str.charAt(0).toUpperCase() + str.slice(1)
  },

  // Convert to title case
  toTitleCase: (str) => {
    if (!str) return ''
    return str.replace(/\w\S*/g, (txt) =>
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    )
  },

  // Truncate text
  truncate: (str, length = 100, suffix = '...') => {
    if (!str || str.length <= length) return str
    return str.substring(0, length) + suffix
  },

  // Generate initials
  getInitials: (name) => {
    if (!name) return ''
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2)
  },

  // Slugify string
  slugify: (str) => {
    if (!str) return ''
    return str
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-')
  },

  // Extract domain from email
  getDomainFromEmail: (email) => {
    if (!email) return ''
    return email.split('@')[1] || ''
  },

  // Mask email
  maskEmail: (email) => {
    if (!email) return ''
    const [username, domain] = email.split('@')
    if (!domain) return email
    const maskedUsername = username.charAt(0) + '*'.repeat(username.length - 2) + username.charAt(username.length - 1)
    return `${maskedUsername}@${domain}`
  },
}

// Number utilities
export const numberUtils = {
  // Format number with commas
  formatNumber: (num) => {
    if (num == null) return '0'
    return new Intl.NumberFormat().format(num)
  },

  // Format currency
  formatCurrency: (amount, currency = 'USD') => {
    if (amount == null) return '$0'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount)
  },

  // Format percentage
  formatPercentage: (value, decimals = 0) => {
    if (value == null) return '0%'
    return `${(value * 100).toFixed(decimals)}%`
  },

  // Format file size
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },

  // Clamp number between min and max
  clamp: (num, min, max) => {
    return Math.min(Math.max(num, min), max)
  },

  // Generate random number between min and max
  random: (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min
  },
}

// Array utilities
export const arrayUtils = {
  // Remove duplicates
  unique: (arr, key) => {
    if (!key) return [...new Set(arr)]
    return arr.filter((item, index, self) =>
      index === self.findIndex(t => t[key] === item[key])
    )
  },

  // Group array by key
  groupBy: (arr, key) => {
    return arr.reduce((groups, item) => {
      const group = item[key]
      groups[group] = groups[group] || []
      groups[group].push(item)
      return groups
    }, {})
  },

  // Sort array by key
  sortBy: (arr, key, direction = 'asc') => {
    return [...arr].sort((a, b) => {
      const aVal = a[key]
      const bVal = b[key]
      if (direction === 'desc') {
        return bVal > aVal ? 1 : -1
      }
      return aVal > bVal ? 1 : -1
    })
  },

  // Chunk array into smaller arrays
  chunk: (arr, size) => {
    const chunks = []
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size))
    }
    return chunks
  },

  // Shuffle array
  shuffle: (arr) => {
    const shuffled = [...arr]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  },
}

// Object utilities
export const objectUtils = {
  // Deep clone object
  deepClone: (obj) => {
    return JSON.parse(JSON.stringify(obj))
  },

  // Pick specific keys from object
  pick: (obj, keys) => {
    return keys.reduce((result, key) => {
      if (key in obj) {
        result[key] = obj[key]
      }
      return result
    }, {})
  },

  // Omit specific keys from object
  omit: (obj, keys) => {
    const result = { ...obj }
    keys.forEach(key => delete result[key])
    return result
  },

  // Check if object is empty
  isEmpty: (obj) => {
    return Object.keys(obj).length === 0
  },

  // Flatten nested object
  flatten: (obj, prefix = '') => {
    const flattened = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = prefix ? `${prefix}.${key}` : key
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          Object.assign(flattened, objectUtils.flatten(obj[key], newKey))
        } else {
          flattened[newKey] = obj[key]
        }
      }
    }
    return flattened
  },
}

// Validation utilities
export const validationUtils = {
  // Email validation
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  // Phone validation
  isValidPhone: (phone) => {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/
    return phoneRegex.test(phone)
  },

  // URL validation
  isValidUrl: (url) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  },

  // Password strength
  getPasswordStrength: (password) => {
    if (!password) return { score: 0, feedback: [] }
    
    let score = 0
    const feedback = []
    
    if (password.length >= 8) score += 1
    else feedback.push('Use at least 8 characters')
    
    if (/[a-z]/.test(password)) score += 1
    else feedback.push('Include lowercase letters')
    
    if (/[A-Z]/.test(password)) score += 1
    else feedback.push('Include uppercase letters')
    
    if (/\d/.test(password)) score += 1
    else feedback.push('Include numbers')
    
    if (/[^a-zA-Z\d]/.test(password)) score += 1
    else feedback.push('Include special characters')
    
    return { score, feedback }
  },
}

// Local storage utilities
export const storageUtils = {
  // Get item from localStorage
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch {
      return defaultValue
    }
  },

  // Set item in localStorage
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  },

  // Remove item from localStorage
  remove: (key) => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Failed to remove from localStorage:', error)
    }
  },

  // Clear all localStorage
  clear: () => {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('Failed to clear localStorage:', error)
    }
  },
}

// Debounce function
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Generate random ID
export const generateId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      return true
    } catch {
      return false
    } finally {
      document.body.removeChild(textArea)
    }
  }
}

// Scroll to element
export const scrollToElement = (elementId, offset = 0) => {
  const element = document.getElementById(elementId)
  if (element) {
    const y = element.getBoundingClientRect().top + window.pageYOffset - offset
    window.scrollTo({ top: y, behavior: 'smooth' })
  }
}

// Check if element is in viewport
export const isInViewport = (element) => {
  const rect = element.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

// Format skill level
export const formatSkillLevel = (level) => {
  const levels = {
    beginner: { label: 'Beginner', color: 'text-yellow-400' },
    intermediate: { label: 'Intermediate', color: 'text-blue-400' },
    advanced: { label: 'Advanced', color: 'text-green-400' },
    expert: { label: 'Expert', color: 'text-purple-400' },
  }
  return levels[level] || { label: 'Unknown', color: 'text-gray-400' }
}

// Format experience years
export const formatExperience = (years) => {
  if (years === 0) return 'No experience'
  if (years < 1) return 'Less than 1 year'
  if (years === 1) return '1 year'
  return `${years} years`
}

// Get career stage
export const getCareerStage = (experience) => {
  if (experience < 1) return 'entry_level'
  if (experience < 3) return 'junior'
  if (experience < 7) return 'mid_level'
  if (experience < 12) return 'senior_level'
  return 'executive'
}

// Format career stage
export const formatCareerStage = (stage) => {
  const stages = {
    student: 'Student',
    entry_level: 'Entry Level',
    junior: 'Junior',
    mid_level: 'Mid Level',
    senior_level: 'Senior Level',
    executive: 'Executive',
    career_change: 'Career Change',
  }
  return stages[stage] || 'Unknown'
}

// Direct exports for backward compatibility
export const formatDate = dateUtils.formatDate
export const formatDateTime = dateUtils.formatDateTime
export const formatRelative = dateUtils.formatRelative
export const formatFileSize = dateUtils.formatFileSize

// Note: copyToClipboard, formatExperience, formatSkillLevel, and validationUtils 
// are already exported above as individual functions/objects
