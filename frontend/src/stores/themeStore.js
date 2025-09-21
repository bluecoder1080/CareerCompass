import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'dark',
      reducedMotion: false,
      highContrast: false,

      // Initialize theme
      initializeTheme: () => {
        const state = get()
        
        // Apply theme to document
        document.documentElement.classList.toggle('dark', state.theme === 'dark')
        
        // Apply accessibility preferences
        if (state.reducedMotion) {
          document.documentElement.style.setProperty('--motion-reduce', 'reduce')
        }
        
        if (state.highContrast) {
          document.documentElement.classList.add('high-contrast')
        }

        // Listen for system theme changes
        if (state.theme === 'system') {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
          const handleChange = (e) => {
            document.documentElement.classList.toggle('dark', e.matches)
          }
          mediaQuery.addEventListener('change', handleChange)
          handleChange(mediaQuery)
        }

        // Listen for reduced motion preference
        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
        const handleMotionChange = (e) => {
          if (!state.reducedMotion) {
            document.documentElement.style.setProperty(
              '--motion-reduce', 
              e.matches ? 'reduce' : 'no-preference'
            )
          }
        }
        motionQuery.addEventListener('change', handleMotionChange)
        handleMotionChange(motionQuery)
      },

      // Set theme
      setTheme: (theme) => {
        set({ theme })
        
        if (theme === 'system') {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
          document.documentElement.classList.toggle('dark', mediaQuery.matches)
        } else {
          document.documentElement.classList.toggle('dark', theme === 'dark')
        }
      },

      // Toggle theme
      toggleTheme: () => {
        const currentTheme = get().theme
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
        get().setTheme(newTheme)
      },

      // Set reduced motion
      setReducedMotion: (enabled) => {
        set({ reducedMotion: enabled })
        document.documentElement.style.setProperty(
          '--motion-reduce', 
          enabled ? 'reduce' : 'no-preference'
        )
      },

      // Set high contrast
      setHighContrast: (enabled) => {
        set({ highContrast: enabled })
        document.documentElement.classList.toggle('high-contrast', enabled)
      },

      // Get current theme (resolved from system if needed)
      getCurrentTheme: () => {
        const theme = get().theme
        if (theme === 'system') {
          return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        }
        return theme
      },

      // Check if dark mode is active
      isDarkMode: () => {
        return get().getCurrentTheme() === 'dark'
      },

      // Get theme icon
      getThemeIcon: () => {
        const theme = get().theme
        switch (theme) {
          case 'light':
            return 'sun'
          case 'dark':
            return 'moon'
          case 'system':
            return 'monitor'
          default:
            return 'moon'
        }
      },

      // Update accessibility preferences
      updateAccessibility: (preferences) => {
        const { reducedMotion, highContrast } = preferences
        
        if (reducedMotion !== undefined) {
          get().setReducedMotion(reducedMotion)
        }
        
        if (highContrast !== undefined) {
          get().setHighContrast(highContrast)
        }
      },

      // Reset to defaults
      resetTheme: () => {
        set({
          theme: 'dark',
          reducedMotion: false,
          highContrast: false,
        })
        get().initializeTheme()
      },
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({
        theme: state.theme,
        reducedMotion: state.reducedMotion,
        highContrast: state.highContrast,
      }),
    }
  )
)

export { useThemeStore }
