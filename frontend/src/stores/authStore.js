import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '../lib/api'
import toast from 'react-hot-toast'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      // Initialize auth state from storage
      initializeAuth: async () => {
        const token = get().token
        if (token) {
          try {
            set({ isLoading: true })
            
            // Add timeout to prevent infinite loading
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Auth timeout')), 5000)
            )
            
            const apiPromise = api.get('/auth/me')
            
            const response = await Promise.race([apiPromise, timeoutPromise])
            set({
              user: response.data.data,
              isAuthenticated: true,
              isLoading: false,
            })
          } catch (error) {
            console.error('Auth initialization failed:', error)
            set({ isLoading: false, isAuthenticated: false, user: null, token: null })
            // Don't call logout here to avoid infinite loops
          }
        } else {
          set({ isLoading: false })
        }
      },

      // Login
      login: async (credentials) => {
        try {
          set({ isLoading: true })
          const response = await api.post('/auth/login', credentials)
          const { token, user } = response.data

          // Set auth header for future requests
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          })

          toast.success(`Welcome back, ${user.firstName}!`)
          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          const message = error.response?.data?.message || 'Login failed'
          toast.error(message)
          return { success: false, error: message }
        }
      },

      // Register
      register: async (userData) => {
        try {
          set({ isLoading: true })
          const response = await api.post('/auth/register', userData)
          const { token, user } = response.data

          // Set auth header for future requests
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          })

          toast.success(`Welcome to CareerCompass, ${user.firstName}!`)
          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          const message = error.response?.data?.message || 'Registration failed'
          toast.error(message)
          return { success: false, error: message }
        }
      },

      // Logout
      logout: () => {
        // Remove auth header
        delete api.defaults.headers.common['Authorization']
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        })

        toast.success('Logged out successfully')
      },

      // Update user data
      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData },
        }))
      },

      // Update user details
      updateUserDetails: async (userData) => {
        try {
          set({ isLoading: true })
          const response = await api.put('/auth/updatedetails', userData)
          
          set((state) => ({
            user: { ...state.user, ...response.data.data },
            isLoading: false,
          }))

          toast.success('Profile updated successfully')
          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          const message = error.response?.data?.message || 'Update failed'
          toast.error(message)
          return { success: false, error: message }
        }
      },

      // Update password
      updatePassword: async (passwordData) => {
        try {
          set({ isLoading: true })
          await api.put('/auth/updatepassword', passwordData)
          
          set({ isLoading: false })
          toast.success('Password updated successfully')
          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          const message = error.response?.data?.message || 'Password update failed'
          toast.error(message)
          return { success: false, error: message }
        }
      },

      // Update preferences
      updatePreferences: async (preferences) => {
        try {
          const response = await api.put('/auth/preferences', preferences)
          
          set((state) => ({
            user: {
              ...state.user,
              preferences: response.data.data.preferences,
            },
          }))

          toast.success('Preferences updated')
          return { success: true }
        } catch (error) {
          const message = error.response?.data?.message || 'Failed to update preferences'
          toast.error(message)
          return { success: false, error: message }
        }
      },

      // Refresh token
      refreshToken: async () => {
        try {
          const response = await api.post('/auth/refresh')
          const { token, user } = response.data

          api.defaults.headers.common['Authorization'] = `Bearer ${token}`

          set({
            user,
            token,
            isAuthenticated: true,
          })

          return { success: true }
        } catch (error) {
          get().logout()
          return { success: false }
        }
      },

      // Check if user has completed profile
      hasCompletedProfile: () => {
        const user = get().user
        return user && user.firstName && user.lastName && user.email
      },

      // Get user initials
      getUserInitials: () => {
        const user = get().user
        if (!user) return 'U'
        return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
      },

      // Get user full name
      getUserFullName: () => {
        const user = get().user
        if (!user) return 'User'
        return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Set auth header if token exists
        if (state?.token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`
        }
      },
    }
  )
)

export { useAuthStore }
