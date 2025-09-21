import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, 
  Search, 
  Bell, 
  Settings, 
  User, 
  LogOut,
  Moon,
  Sun,
  Monitor
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useThemeStore } from '../../stores/themeStore'

const Navbar = ({ onMenuClick }) => {
  const [searchOpen, setSearchOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [themeOpen, setThemeOpen] = useState(false)
  
  const searchRef = useRef(null)
  const profileRef = useRef(null)
  const notificationsRef = useRef(null)
  const themeRef = useRef(null)

  const { user, logout, getUserInitials, getUserFullName } = useAuthStore()
  const { theme, setTheme, getThemeIcon } = useThemeStore()

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false)
      }
      if (themeRef.current && !themeRef.current.contains(event.target)) {
        setThemeOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    setProfileOpen(false)
  }

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ]

  const notifications = [
    {
      id: 1,
      title: 'Profile completion',
      message: 'Complete your profile to get better recommendations',
      time: '2 hours ago',
      unread: true,
    },
    {
      id: 2,
      title: 'New tech update',
      message: 'React 18 Features Every Developer Should Know',
      time: '1 day ago',
      unread: false,
    },
  ]

  return (
    <nav className="fixed top-0 right-0 left-0 lg:left-64 z-30 bg-dark-900/80 backdrop-blur-md border-b border-dark-700">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-dark-800 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search */}
            <div className="relative ml-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search..."
                  className="w-64 pl-10 pr-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-sm text-gray-200 placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                  onFocus={() => setSearchOpen(true)}
                  onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                />
              </div>

              {/* Search dropdown */}
              <AnimatePresence>
                {searchOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-dark-800 border border-dark-600 rounded-lg shadow-lg p-4"
                  >
                    <p className="text-sm text-gray-400">
                      Search for chats, projects, or tech updates...
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-2">
            {/* Theme selector */}
            <div className="relative" ref={themeRef}>
              <button
                onClick={() => setThemeOpen(!themeOpen)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-dark-800 transition-colors"
              >
                {getThemeIcon() === 'sun' && <Sun className="w-5 h-5" />}
                {getThemeIcon() === 'moon' && <Moon className="w-5 h-5" />}
                {getThemeIcon() === 'monitor' && <Monitor className="w-5 h-5" />}
              </button>

              <AnimatePresence>
                {themeOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-dark-800 border border-dark-600 rounded-lg shadow-lg py-2"
                  >
                    {themeOptions.map((option) => {
                      const Icon = option.icon
                      return (
                        <button
                          key={option.value}
                          onClick={() => {
                            setTheme(option.value)
                            setThemeOpen(false)
                          }}
                          className={`w-full flex items-center px-4 py-2 text-sm transition-colors ${
                            theme === option.value
                              ? 'text-primary-400 bg-primary-500/10'
                              : 'text-gray-300 hover:text-gray-200 hover:bg-dark-700'
                          }`}
                        >
                          <Icon className="w-4 h-4 mr-3" />
                          {option.label}
                        </button>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-dark-800 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {notifications.some(n => n.unread) && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full"></span>
                )}
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-80 bg-dark-800 border border-dark-600 rounded-lg shadow-lg"
                  >
                    <div className="p-4 border-b border-dark-700">
                      <h3 className="text-sm font-medium text-gray-200">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-dark-700 last:border-b-0 hover:bg-dark-700/50 transition-colors ${
                            notification.unread ? 'bg-primary-500/5' : ''
                          }`}
                        >
                          <div className="flex items-start">
                            {notification.unread && (
                              <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            )}
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-200">
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-400 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-2">
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 border-t border-dark-700">
                      <button className="text-sm text-primary-400 hover:text-primary-300">
                        View all notifications
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center space-x-3 p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-dark-800 transition-colors"
              >
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {getUserInitials()}
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-200">
                  {getUserFullName()}
                </span>
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-dark-800 border border-dark-600 rounded-lg shadow-lg py-2"
                  >
                    <div className="px-4 py-3 border-b border-dark-700">
                      <p className="text-sm font-medium text-gray-200">
                        {getUserFullName()}
                      </p>
                      <p className="text-sm text-gray-400">{user?.email}</p>
                    </div>

                    <Link
                      to="/app/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-gray-200 hover:bg-dark-700 transition-colors"
                    >
                      <User className="w-4 h-4 mr-3" />
                      Profile
                    </Link>

                    <Link
                      to="/app/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-gray-200 hover:bg-dark-700 transition-colors"
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Settings
                    </Link>

                    <div className="border-t border-dark-700 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-sm text-error-400 hover:text-error-300 hover:bg-error-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
