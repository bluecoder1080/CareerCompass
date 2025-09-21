import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  MessageCircle, 
  User, 
  Brain, 
  FileText, 
  Briefcase,
  TrendingUp,
  X,
  Compass
} from 'lucide-react'
import { cn } from '../../lib/utils'

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation()

  const navigation = [
    {
      name: 'Dashboard',
      href: '/app/dashboard',
      icon: LayoutDashboard,
      description: 'Overview and insights'
    },
    {
      name: 'AI Chat',
      href: '/app/chat',
      icon: MessageCircle,
      description: 'Career guidance chat'
    },
    {
      name: 'Profile',
      href: '/app/profile',
      icon: User,
      description: 'Personal information'
    },
    {
      name: 'Psychotest',
      href: '/app/psychotest',
      icon: Brain,
      description: 'Personality assessment'
    },
    {
      name: 'Resume',
      href: '/app/resume',
      icon: FileText,
      description: 'Resume builder'
    },
    {
      name: 'Projects',
      href: '/app/projects',
      icon: Briefcase,
      description: 'Portfolio projects'
    },
    {
      name: 'Tech Updates',
      href: '/app/tech-updates',
      icon: TrendingUp,
      description: 'Industry insights'
    },
  ]

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      x: '-100%',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    }
  }

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-dark-900/50 backdrop-blur-xl border-r border-dark-700 px-6 pb-4">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">
                CareerCompass
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const Icon = item.icon
                    const isActive = location.pathname === item.href || 
                                   (item.href !== '/app/dashboard' && location.pathname.startsWith(item.href))
                    
                    return (
                      <li key={item.name}>
                        <NavLink
                          to={item.href}
                          className={cn(
                            'group flex gap-x-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200',
                            isActive
                              ? 'bg-primary-600/20 text-primary-400 shadow-lg shadow-primary-500/10'
                              : 'text-gray-400 hover:text-gray-200 hover:bg-dark-800/50'
                          )}
                        >
                          <Icon 
                            className={cn(
                              'h-5 w-5 shrink-0 transition-colors',
                              isActive ? 'text-primary-400' : 'text-gray-400 group-hover:text-gray-200'
                            )} 
                          />
                          <div className="flex flex-col">
                            <span>{item.name}</span>
                            <span className="text-xs text-gray-500 group-hover:text-gray-400">
                              {item.description}
                            </span>
                          </div>
                        </NavLink>
                      </li>
                    )
                  })}
                </ul>
              </li>

              {/* Bottom section */}
              <li className="mt-auto">
                <div className="rounded-xl bg-gradient-to-r from-primary-500/10 to-accent-500/10 border border-primary-500/20 p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-200">
                        AI-Powered Insights
                      </p>
                      <p className="text-xs text-gray-400">
                        Get personalized recommendations
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            className="fixed inset-y-0 z-50 flex w-64 flex-col lg:hidden"
          >
            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-dark-900/95 backdrop-blur-xl border-r border-dark-700 px-6 pb-4">
              {/* Header with close button */}
              <div className="flex h-16 shrink-0 items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                    <Compass className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gradient">
                    CareerCompass
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-dark-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                  <li>
                    <ul role="list" className="-mx-2 space-y-1">
                      {navigation.map((item) => {
                        const Icon = item.icon
                        const isActive = location.pathname === item.href || 
                                       (item.href !== '/app/dashboard' && location.pathname.startsWith(item.href))
                        
                        return (
                          <li key={item.name}>
                            <NavLink
                              to={item.href}
                              onClick={onClose}
                              className={cn(
                                'group flex gap-x-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200',
                                isActive
                                  ? 'bg-primary-600/20 text-primary-400 shadow-lg shadow-primary-500/10'
                                  : 'text-gray-400 hover:text-gray-200 hover:bg-dark-800/50'
                              )}
                            >
                              <Icon 
                                className={cn(
                                  'h-5 w-5 shrink-0 transition-colors',
                                  isActive ? 'text-primary-400' : 'text-gray-400 group-hover:text-gray-200'
                                )} 
                              />
                              <div className="flex flex-col">
                                <span>{item.name}</span>
                                <span className="text-xs text-gray-500 group-hover:text-gray-400">
                                  {item.description}
                                </span>
                              </div>
                            </NavLink>
                          </li>
                        )
                      })}
                    </ul>
                  </li>

                  {/* Bottom section */}
                  <li className="mt-auto">
                    <div className="rounded-xl bg-gradient-to-r from-primary-500/10 to-accent-500/10 border border-primary-500/20 p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                          <Brain className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-200">
                            AI-Powered Insights
                          </p>
                          <p className="text-xs text-gray-400">
                            Get personalized recommendations
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Sidebar
