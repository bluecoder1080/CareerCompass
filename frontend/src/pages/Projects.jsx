import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Briefcase, 
  Plus,
  Filter,
  Search,
  ExternalLink,
  Github,
  Star,
  GitBranch,
  Code,
  Calendar,
  Award,
  Eye,
  Edit3
} from 'lucide-react'
import { cn } from '../lib/utils'

const Projects = () => {
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const statusFilters = [
    { id: 'all', label: 'All Projects' },
    { id: 'completed', label: 'Completed' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'planned', label: 'Planned' },
  ]

  const projects = [
    {
      id: 1,
      title: 'E-Commerce Platform',
      description: 'A full-stack MERN application featuring product management, shopping cart functionality, secure payment integration with Stripe, user authentication, and an admin dashboard for inventory management.',
      longDescription: 'Built with scalability in mind, this platform handles thousands of products and supports multiple payment methods. Features include real-time inventory tracking, automated email notifications, and analytics dashboard.',
      technologies: ['React', 'Node.js', 'MongoDB', 'Stripe', 'Redux', 'Express'],
      status: 'completed',
      stars: 45,
      forks: 12,
      watchers: 23,
      lastUpdated: '2 weeks ago',
      githubUrl: 'https://github.com',
      liveUrl: 'https://demo.com',
      imageUrl: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=600',
      category: 'Full-Stack',
      startDate: 'Jan 2024',
      endDate: 'Mar 2024',
      highlights: [
        'Integrated Stripe payment gateway',
        'Implemented real-time inventory updates',
        'Built admin dashboard with analytics',
        'Optimized for 10k+ concurrent users'
      ]
    },
    {
      id: 2,
      title: 'Task Management App',
      description: 'Real-time collaborative task manager with drag-and-drop functionality, team collaboration features, project boards, and activity tracking powered by Socket.io for instant updates.',
      longDescription: 'A modern project management tool inspired by Trello and Asana. Supports multiple workspaces, custom workflows, file attachments, and integrations with popular tools.',
      technologies: ['Next.js', 'Socket.io', 'PostgreSQL', 'Prisma', 'TailwindCSS', 'TypeScript'],
      status: 'in_progress',
      stars: 28,
      forks: 7,
      watchers: 15,
      lastUpdated: '3 days ago',
      githubUrl: 'https://github.com',
      liveUrl: 'https://demo.com',
      imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600',
      category: 'Full-Stack',
      startDate: 'Mar 2024',
      endDate: 'Ongoing',
      highlights: [
        'Real-time collaboration with Socket.io',
        'Drag-and-drop task management',
        'Custom workflow creation',
        'Team analytics and reporting'
      ]
    },
    {
      id: 3,
      title: 'AI Chatbot Assistant',
      description: 'Intelligent chatbot using OpenAI API and natural language processing for customer support automation, with context-aware responses and multi-language support.',
      longDescription: 'Advanced AI assistant capable of understanding context, maintaining conversation history, and providing intelligent responses. Includes admin panel for training and analytics.',
      technologies: ['Python', 'FastAPI', 'OpenAI', 'React', 'LangChain', 'Redis'],
      status: 'completed',
      stars: 67,
      forks: 19,
      watchers: 34,
      lastUpdated: '1 month ago',
      githubUrl: 'https://github.com',
      liveUrl: 'https://demo.com',
      imageUrl: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=600',
      category: 'AI/ML',
      startDate: 'Nov 2023',
      endDate: 'Feb 2024',
      highlights: [
        'Integrated OpenAI GPT-4 API',
        'Context-aware conversations',
        'Multi-language support (15 languages)',
        'Analytics dashboard for insights'
      ]
    },
    {
      id: 4,
      title: 'Social Media Analytics Dashboard',
      description: 'Comprehensive analytics platform for tracking social media metrics across multiple platforms including Instagram, Twitter, and Facebook with beautiful data visualizations.',
      longDescription: 'Enterprise-grade analytics solution with real-time data processing, custom report generation, and automated insights powered by machine learning.',
      technologies: ['Vue.js', 'Node.js', 'GraphQL', 'Chart.js', 'Docker', 'MySQL'],
      status: 'completed',
      stars: 53,
      forks: 15,
      watchers: 28,
      lastUpdated: '1 week ago',
      githubUrl: 'https://github.com',
      liveUrl: 'https://demo.com',
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600',
      category: 'Full-Stack',
      startDate: 'Aug 2023',
      endDate: 'Dec 2023',
      highlights: [
        'Multi-platform social media tracking',
        'Real-time data visualization',
        'Automated report generation',
        'ML-powered insights and predictions'
      ]
    },
    {
      id: 5,
      title: 'Video Streaming Platform',
      description: 'Netflix-like video streaming service with adaptive bitrate streaming, user profiles, personalized recommendations, and content management system.',
      longDescription: 'Built with scalability for millions of users. Features include CDN integration, video transcoding, subtitle support, and advanced search capabilities.',
      technologies: ['React', 'AWS', 'Lambda', 'DynamoDB', 'CloudFront', 'FFmpeg'],
      status: 'in_progress',
      stars: 89,
      forks: 31,
      watchers: 52,
      lastUpdated: '5 days ago',
      githubUrl: 'https://github.com',
      liveUrl: 'https://demo.com',
      imageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600',
      category: 'Full-Stack',
      startDate: 'Apr 2024',
      endDate: 'Ongoing',
      highlights: [
        'Adaptive bitrate streaming (HLS)',
        'AWS infrastructure for scalability',
        'AI-powered content recommendations',
        'Multi-device support'
      ]
    },
    {
      id: 6,
      title: 'Blockchain Voting System',
      description: 'Decentralized voting application built on Ethereum blockchain ensuring transparency, security, and immutability of voting records.',
      longDescription: 'Secure and transparent voting system using smart contracts. Features voter verification, real-time results, and audit trails.',
      technologies: ['Solidity', 'Web3.js', 'React', 'Ethereum', 'Hardhat', 'IPFS'],
      status: 'planned',
      stars: 0,
      forks: 0,
      watchers: 0,
      lastUpdated: 'Not started',
      githubUrl: '#',
      liveUrl: '#',
      imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600',
      category: 'Web3',
      startDate: 'Q3 2024',
      endDate: 'Q4 2024',
      highlights: [
        'Ethereum smart contracts',
        'Decentralized storage with IPFS',
        'Zero-knowledge proofs for privacy',
        'Transparent audit trail'
      ]
    }
  ]

  const filteredProjects = projects.filter(project => {
    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'completed' && project.status === 'completed') ||
      (selectedStatus === 'in_progress' && project.status === 'in_progress') ||
      (selectedStatus === 'planned' && project.status === 'planned')
    
    const matchesSearch = searchQuery === '' || 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.technologies.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()))
    
    return matchesStatus && matchesSearch
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-success-500/20 text-success-400 border-success-500/30'
      case 'in_progress':
        return 'bg-warning-500/20 text-warning-400 border-warning-500/30'
      case 'planned':
        return 'bg-primary-500/20 text-primary-400 border-primary-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusLabel = (status) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-r from-success-500/10 to-primary-500/10 border-success-500/20"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
              <Briefcase className="w-8 h-8 mr-3 text-success-400" />
              My Projects Portfolio
            </h1>
            <p className="text-gray-400 text-lg">
              Showcase of completed and ongoing development projects
            </p>
          </div>
          <button className="btn-primary flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>New Project</span>
          </button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects, technologies, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
          {statusFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedStatus(filter.id)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                selectedStatus === filter.id
                  ? 'bg-success-600/20 text-success-400 border-2 border-success-500/30'
                  : 'bg-dark-700/30 text-gray-400 border-2 border-dark-600/30 hover:border-dark-500/50'
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Projects', value: projects.length, icon: Briefcase, color: 'from-blue-500 to-cyan-500' },
          { label: 'Completed', value: projects.filter(p => p.status === 'completed').length, icon: Award, color: 'from-green-500 to-emerald-500' },
          { label: 'In Progress', value: projects.filter(p => p.status === 'in_progress').length, icon: Code, color: 'from-orange-500 to-yellow-500' },
          { label: 'Total Stars', value: projects.reduce((sum, p) => sum + p.stars, 0), icon: Star, color: 'from-purple-500 to-pink-500' },
        ].map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              className="card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-400">
        Showing {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="card-hover group"
          >
            {/* Project Image */}
            <div className="relative h-48 rounded-xl overflow-hidden mb-4 bg-dark-800">
              <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent z-10"></div>
              <div className="w-full h-full bg-gradient-to-br from-success-500/20 to-primary-500/20 flex items-center justify-center">
                <Briefcase className="w-16 h-16 text-success-400/30" />
              </div>
              
              {/* Status Badge */}
              <div className="absolute top-3 left-3 z-20">
                <span className={cn('px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm', getStatusColor(project.status))}>
                  {getStatusLabel(project.status)}
                </span>
              </div>

              {/* Category Badge */}
              <div className="absolute top-3 right-3 z-20">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-dark-900/80 text-gray-300 border border-dark-600 backdrop-blur-sm">
                  {project.category}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-3">
              <div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-success-400 transition-colors">
                  {project.title}
                </h3>
                <p className="text-gray-400 text-sm line-clamp-2">
                  {project.description}
                </p>
              </div>

              {/* Technologies */}
              <div className="flex flex-wrap gap-2">
                {project.technologies.slice(0, 5).map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-1 bg-primary-500/10 text-primary-400 text-xs rounded-lg border border-primary-500/20"
                  >
                    {tech}
                  </span>
                ))}
                {project.technologies.length > 5 && (
                  <span className="px-2 py-1 bg-dark-700 text-gray-400 text-xs rounded-lg">
                    +{project.technologies.length - 5} more
                  </span>
                )}
              </div>

              {/* Highlights */}
              <ul className="space-y-1">
                {project.highlights.slice(0, 2).map((highlight, idx) => (
                  <li key={idx} className="text-xs text-gray-400 flex items-start">
                    <span className="w-1.5 h-1.5 bg-success-400 rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
                    {highlight}
                  </li>
                ))}
              </ul>

              {/* Stats */}
              <div className="flex items-center space-x-4 text-xs text-gray-500 pt-2 border-t border-dark-700">
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span>{project.stars}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <GitBranch className="w-3 h-3" />
                  <span>{project.forks}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="w-3 h-3" />
                  <span>{project.watchers}</span>
                </div>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{project.lastUpdated}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 pt-2">
                <a
                  href={project.githubUrl}
                  className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center space-x-2"
                >
                  <Github className="w-4 h-4" />
                  <span>Code</span>
                </a>
                <a
                  href={project.liveUrl}
                  className="flex-1 btn-primary text-sm py-2 flex items-center justify-center space-x-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Live Demo</span>
                </a>
                <button className="btn-secondary text-sm py-2 px-3">
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card text-center py-12"
        >
          <Briefcase className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No projects found</h3>
          <p className="text-gray-400 mb-6">
            Try adjusting your filters or search query
          </p>
          <button className="btn-primary inline-flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Create Your First Project</span>
          </button>
        </motion.div>
      )}
    </div>
  )
}

export default Projects
