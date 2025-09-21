import axios from 'axios'
import toast from 'react-hot-toast'

// Create axios instance
const api = axios.create({
  baseURL: 'https://careercompass-backend-mssq.onrender.com/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add timestamp to prevent caching
    config.params = {
      ...config.params,
      _t: Date.now(),
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Handle network errors
    if (!error.response) {
      toast.error('Network error. Please check your connection.')
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
            window.location.href = '/auth/login'
          }
        }
        break

      case 403:
        toast.error('Access denied. You don\'t have permission to perform this action.')
        break

      case 404:
        if (!originalRequest.url.includes('/auth/me')) {
          toast.error('Resource not found.')
        }
        break

      case 429:
        toast.error('Too many requests. Please try again later.')
        break

      case 500:
        toast.error('Server error. Please try again later.')
        break

      default:
        // Show error message from server or generic message
        const message = data?.message || data?.error || 'An unexpected error occurred'
        if (status >= 400 && status < 500) {
          toast.error(message)
        } else {
          toast.error('Something went wrong. Please try again.')
        }
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
      toast.error('Download failed')
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
