import axios from 'axios'
import toast from 'react-hot-toast'

// Create axios instance
const baseURL = import.meta.env.VITE_API_URL || 
                (import.meta.env.PROD ? 'https://careercompass-backend-mssq.onrender.com/api' : 'http://localhost:5000/api')

console.log('🔗 API Base URL:', baseURL)
console.log('🌍 Environment:', import.meta.env.MODE)

const api = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for CORS with credentials
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add timestamp to prevent caching
    config.params = {
      ...config.params,
      _t: Date.now(),
    }
    
    // Add authorization header if token exists
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - DEMO MODE: No error popups
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Handle network errors - SILENTLY in demo mode
    if (!error.response) {
      console.log('🎭 DEMO MODE: Network error silenced')
      return Promise.reject(error)
    }

    const { status, data } = error.response

    // Handle different error status codes
    switch (status) {
      case 401:
        // Unauthorized - token expired or invalid
        if (!originalRequest._retry) {
          originalRequest._retry = true
          
          // Try to refresh token
          try {
            const authStore = await import('../stores/authStore')
            const result = await authStore.useAuthStore.getState().refreshToken()
            
            if (result.success) {
              // Retry original request
              return api(originalRequest)
            }
          } catch (refreshError) {
            // Refresh failed, logout user
            const authStore = await import('../stores/authStore')
            authStore.useAuthStore.getState().logout()
            // Use history API for SPA routing instead of window.location
            window.history.pushState({}, '', '/auth/login')
            // Trigger a popstate event to notify React Router
            window.dispatchEvent(new PopStateEvent('popstate'))
          }
        }
        break

      case 403:
        console.log('🎭 DEMO MODE: 403 error silenced')
        break

      case 404:
        console.log('🎭 DEMO MODE: 404 error silenced')
        break

      case 429:
        console.log('🎭 DEMO MODE: 429 error silenced')
        break

      case 500:
        console.log('🎭 DEMO MODE: 500 error silenced')
        break

      default:
        // Silence all error messages in demo mode
        console.log('🎭 DEMO MODE: Error silenced:', status, data?.message || 'Unknown error')
    }

    return Promise.reject(error)
  }
)

// API utility functions
export const apiUtils = {
  // Upload file with progress
  uploadFile: (url, file, onProgress = () => {}) => {
    const formData = new FormData()
    formData.append('file', file)

    return api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        )
        onProgress(progress)
      },
    })
  },

  // Download file
  downloadFile: async (url, filename) => {
    try {
      const response = await api.get(url, {
        responseType: 'blob',
      })

      // Create blob link to download
      const blob = new Blob([response.data])
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = filename || 'download'
      link.click()

      // Cleanup
      window.URL.revokeObjectURL(link.href)
    } catch (error) {
      console.log('🎭 DEMO MODE: Download error silenced')
      throw error
    }
  },

  // Paginated request
  getPaginated: async (url, params = {}) => {
    const response = await api.get(url, { params })
    return {
      data: response.data.data,
      pagination: response.data.pagination,
      total: response.data.total,
      count: response.data.count,
    }
  },

  // Batch requests
  batch: (requests) => {
    return Promise.allSettled(requests.map(req => api(req)))
  },
}

export { api }
