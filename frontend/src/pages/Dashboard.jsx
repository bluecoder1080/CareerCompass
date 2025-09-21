import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  Target, 
  Brain, 
  MessageCircle, 
  FileText, 
  User,
  ArrowRight,
  Calendar,
  Award,
  BookOpen,
  Zap,
  Clock,
  CheckCircle2
} from 'lucide-react'
import { useQuery } from 'react-query'
import { useAuthStore } from '../stores/authStore'
import { api } from '../lib/api'
import { formatDate, cn } from '../lib/utils'

const Dashboard = () => {
  const { user, getUserFullName } = useAuthStore()
  const [greeting, setGreeting] = useState('')

  // Get greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')
  }, [])

  // Fetch dashboard data
  const { data: dashboardData, isLoading } = useQuery(
    'dashboard',
    async () => {
      const [profile, chats, psychotest, techUpdates] = await Promise.all([
        api.get('/profiles/me').catch(() => ({ data: { data: null } })),
        api.get('/chat?limit=3').catch(() => ({ data: { data: [] } })),
        api.get('/psychotest/latest').catch(() => ({ data: { data: null } })),
        api.get('/tech-updates?limit=5').catch(() => ({ data: { data: [] } }))
      ])

      return {
        profile: profile.data.data,
        recentChats: chats.data.data,
        latestPsychotest: psychotest.data.data,
        techUpdates: techUpdates.data.data
      }
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  )

  const quickActions = [
    {
      title: 'Start AI Chat',
      description: 'Get instant career guidance',
      icon: MessageCircle,
      href: '/app/chat',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10 hover:bg-blue-500/20'
    },
    {
      title: 'Take Psychotest',
      description: 'Discover your personality type',
      icon: Brain,
      href: '/app/psychotest',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10 hover:bg-purple-500/20'
    },
    {
      title: 'Build Resume',
      description: 'Create or update your resume',
      icon: FileText,
      href: '/app/resume',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10 hover:bg-green-500/20'
    },
    {
      title: 'Update Profile',
      description: 'Complete your profile',
      icon: User,
      href: '/app/profile',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-500/10 hover:bg-orange-500/20'
    }
  ]

  const careerPaths = [
    {
      title: 'Software Engineer',
      match: 92,
      description: 'Full-stack development with modern frameworks',
      skills: ['React', 'Node.js', 'Python', 'AWS'],
      growth: 'High'
    },
    {
      title: 'Product Manager',
      match: 87,
      description: 'Lead product strategy and development',
      skills: ['Strategy', 'Analytics', 'Leadership', 'Agile'],
      growth: 'Very High'
    },
    {
      title: 'Data Scientist',
      match: 83,
      description: 'Extract insights from complex datasets',
      skills: ['Python', 'Machine Learning', 'SQL', 'Statistics'],
      growth: 'High'
    }
  ]

  const skillGaps = [
    { skill: 'TypeScript', priority: 'High', timeToLearn: '2-3 months' },
    { skill: 'Docker', priority: 'Medium', timeToLearn: '1-2 months' },
    { skill: 'GraphQL', priority: 'Medium', timeToLearn: '1 month' },
    { skill: 'System Design', priority: 'High', timeToLearn: '3-4 months' }
  ]

  const roadmapMilestones = [
    {
      month: 1,
      title: 'Master TypeScript Fundamentals',
      completed: true,
      tasks: ['Complete TypeScript course', 'Build sample project', 'Practice type definitions']
    },
    {
      month: 2,
      title: 'Learn Advanced React Patterns',
      completed: false,
      tasks: ['Study React hooks', 'Implement context patterns', 'Build complex components']
    },
    {
      month: 3,
      title: 'Backend Development Skills',
      completed: false,
      tasks: ['Learn Node.js advanced concepts', 'Database optimization', 'API design patterns']
    }
  ]

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Loading skeletons */}
        <div className="skeleton h-32 rounded-2xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-32 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="skeleton h-96 rounded-2xl"></div>
          <div className="skeleton h-96 rounded-2xl"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-r from-primary-500/10 to-accent-500/10 border-primary-500/20"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {greeting}, {getUserFullName()}! 👋
            </h1>
            <p className="text-gray-400 text-lg">
              Ready to take the next step in your career journey?
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center">
              <Zap className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action, index) => {
          const Icon = action.icon
          return (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={action.href}
                className={cn(
                  'block card-hover transition-all duration-300',
                  action.bgColor
                )}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {action.description}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-200 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Career Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Target className="w-5 h-5 mr-2 text-primary-400" />
                Recommended Career Paths
              </h2>
              <Link
                to="/app/psychotest"
                className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
              >
                Take assessment →
              </Link>
            </div>

            <div className="space-y-4">
              {careerPaths.map((path, index) => (
                <div
                  key={path.title}
                  className="bg-dark-700/50 rounded-xl p-4 border border-dark-600/50 hover:border-dark-500/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-white">{path.title}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-400">Match:</span>
                      <span className="text-sm font-medium text-primary-400">{path.match}%</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-3">{path.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {path.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-primary-500/20 text-primary-400 text-xs rounded-lg border border-primary-500/30"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-success-400" />
                      <span className="text-sm text-success-400">Growth: {path.growth}</span>
                    </div>
                    <button className="text-sm text-primary-400 hover:text-primary-300 transition-colors">
                      Learn more →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* 6-Month Roadmap */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-accent-400" />
                6-Month Development Roadmap
              </h2>
              <Link
                to="/app/psychotest"
                className="text-sm text-accent-400 hover:text-accent-300 transition-colors"
              >
                View full roadmap →
              </Link>
            </div>

            <div className="space-y-4">
              {roadmapMilestones.map((milestone, index) => (
                <div
                  key={milestone.month}
                  className="flex items-start space-x-4 p-4 bg-dark-700/30 rounded-xl border border-dark-600/30"
                >
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                    milestone.completed 
                      ? 'bg-success-500/20 text-success-400 border-2 border-success-500/50'
                      : 'bg-dark-600 text-gray-400 border-2 border-dark-500'
                  )}>
                    {milestone.completed ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      milestone.month
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className={cn(
                      'font-semibold mb-2',
                      milestone.completed ? 'text-success-400' : 'text-white'
                    )}>
                      Month {milestone.month}: {milestone.title}
                    </h3>
                    <ul className="space-y-1">
                      {milestone.tasks.map((task, taskIndex) => (
                        <li key={taskIndex} className="text-sm text-gray-400 flex items-center">
                          <span className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-2"></span>
                          {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Profile Completion */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Profile Completion</h3>
              <span className="text-sm text-primary-400">75%</span>
            </div>
            
            <div className="progress-bar mb-4">
              <div className="progress-fill" style={{ width: '75%' }}></div>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Basic Info</span>
                <CheckCircle2 className="w-4 h-4 text-success-400" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Skills & Experience</span>
                <CheckCircle2 className="w-4 h-4 text-success-400" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Career Goals</span>
                <Clock className="w-4 h-4 text-warning-400" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Resume Upload</span>
                <Clock className="w-4 h-4 text-gray-500" />
              </div>
            </div>
            
            <Link
              to="/app/profile"
              className="btn-primary w-full mt-4 text-sm"
            >
              Complete Profile
            </Link>
          </motion.div>

          {/* Skill Gaps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white flex items-center">
                <BookOpen className="w-4 h-4 mr-2 text-warning-400" />
                Skill Gaps
              </h3>
              <Link
                to="/app/profile"
                className="text-sm text-warning-400 hover:text-warning-300 transition-colors"
              >
                View all →
              </Link>
            </div>
            
            <div className="space-y-3">
              {skillGaps.map((gap, index) => (
                <div
                  key={gap.skill}
                  className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg border border-dark-600/30"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{gap.skill}</p>
                    <p className="text-xs text-gray-400">{gap.timeToLearn}</p>
                  </div>
                  <span className={cn(
                    'px-2 py-1 text-xs rounded-lg border',
                    gap.priority === 'High' 
                      ? 'bg-error-500/20 text-error-400 border-error-500/30'
                      : 'bg-warning-500/20 text-warning-400 border-warning-500/30'
                  )}>
                    {gap.priority}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="card"
          >
            <h3 className="font-semibold text-white mb-4">Recent Activity</h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-dark-700/30 rounded-lg">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white">Started AI chat session</p>
                  <p className="text-xs text-gray-400">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-dark-700/30 rounded-lg">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white">Updated resume</p>
                  <p className="text-xs text-gray-400">1 day ago</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-dark-700/30 rounded-lg">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Brain className="w-4 h-4 text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white">Completed psychotest</p>
                  <p className="text-xs text-gray-400">3 days ago</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tech Updates */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-primary-400" />
                Latest Tech Updates
              </h3>
              <Link
                to="/app/tech-updates"
                className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
              >
                View all →
              </Link>
            </div>
            
            <div className="space-y-3">
              {dashboardData?.techUpdates?.slice(0, 3).map((update, index) => (
                <div
                  key={update._id}
                  className="p-3 bg-dark-700/30 rounded-lg border border-dark-600/30 hover:border-dark-500/50 transition-colors cursor-pointer"
                >
                  <h4 className="text-sm font-medium text-white mb-1 line-clamp-2">
                    {update.title}
                  </h4>
                  <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                    {update.summary}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-primary-400 capitalize">
                      {update.category?.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(update.publishedAt)}
                    </span>
                  </div>
                </div>
              )) || (
                <p className="text-sm text-gray-400 text-center py-4">
                  No updates available
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
