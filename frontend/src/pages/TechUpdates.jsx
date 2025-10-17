import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  Filter,
  Search,
  Calendar,
  Tag,
  ExternalLink,
  Rocket,
  Code,
  Briefcase,
  Zap
} from 'lucide-react'
import { formatDate, cn } from '../lib/utils'

const TechUpdates = () => {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const categories = [
    { id: 'all', label: 'All Updates', icon: Zap },
    { id: 'framework_update', label: 'Framework Updates', icon: Code },
    { id: 'trending_technology', label: 'Trending Tech', icon: Rocket },
    { id: 'job_market', label: 'Job Market', icon: Briefcase },
  ]

  const techUpdates = [
    {
      id: '1',
      title: 'React 19 Released with Major Performance Improvements',
      summary: 'The latest version includes automatic batching, transitions, and improved concurrent rendering capabilities. Developers can now build faster and more responsive applications with minimal code changes.',
      content: 'React 19 brings significant performance enhancements including automatic batching of state updates, improved Suspense support, and new concurrent features that make applications more responsive.',
      category: 'framework_update',
      publishedAt: new Date().toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
      source: 'React Blog',
      tags: ['React', 'JavaScript', 'Frontend', 'Performance']
    },
    {
      id: '2',
      title: 'AI-Powered Development Tools Gain Traction',
      summary: 'GitHub Copilot and similar AI assistants are becoming essential tools for modern developers, boosting productivity by 30%. Companies are increasingly adopting AI pair programming tools.',
      content: 'AI coding assistants are revolutionizing software development. Studies show developers using these tools complete tasks 30% faster while maintaining code quality.',
      category: 'trending_technology',
      publishedAt: new Date(Date.now() - 86400000).toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400',
      source: 'TechCrunch',
      tags: ['AI', 'Developer Tools', 'Productivity', 'Automation']
    },
    {
      id: '3',
      title: 'TypeScript 5.5 Introduces Enhanced Type Safety',
      summary: 'New features include improved inference, better error messages, and performance optimizations for large codebases. The update focuses on developer experience improvements.',
      content: 'TypeScript 5.5 delivers enhanced type inference, clearer error messages, and significant performance gains for large-scale applications, making it easier to catch bugs early.',
      category: 'framework_update',
      publishedAt: new Date(Date.now() - 172800000).toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400',
      source: 'TypeScript Blog',
      tags: ['TypeScript', 'JavaScript', 'Type Safety', 'Development']
    },
    {
      id: '4',
      title: 'Demand for Full-Stack Developers Increases 40%',
      summary: 'Industry reports show growing demand for developers with both frontend and backend expertise, with competitive salaries reaching new highs. Remote positions are particularly abundant.',
      content: 'The job market for full-stack developers is booming with a 40% increase in job postings. Average salaries have increased to $120,000-$180,000 for experienced developers.',
      category: 'job_market',
      publishedAt: new Date(Date.now() - 259200000).toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
      source: 'Indeed Career Trends',
      tags: ['Job Market', 'Full-Stack', 'Careers', 'Salary']
    },
    {
      id: '5',
      title: 'Docker & Kubernetes Skills in High Demand',
      summary: 'Container orchestration expertise continues to be one of the most sought-after skills in DevOps and cloud computing. Companies are willing to pay premium salaries for these skills.',
      content: 'DevOps engineers with Docker and Kubernetes expertise are among the highest-paid professionals in tech, with demand outpacing supply by a significant margin.',
      category: 'trending_technology',
      publishedAt: new Date(Date.now() - 345600000).toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=400',
      source: 'Stack Overflow Survey',
      tags: ['Docker', 'Kubernetes', 'DevOps', 'Cloud Computing']
    },
    {
      id: '6',
      title: 'Next.js 15 Introduces Revolutionary App Router',
      summary: 'The new App Router brings server components, improved data fetching, and better performance optimization capabilities to Next.js applications.',
      content: 'Next.js 15 revolutionizes React development with server components, streaming, and improved caching strategies that make applications faster and more efficient.',
      category: 'framework_update',
      publishedAt: new Date(Date.now() - 432000000).toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=400',
      source: 'Vercel Blog',
      tags: ['Next.js', 'React', 'Server Components', 'Performance']
    },
    {
      id: '7',
      title: 'Web3 Development Skills Command Premium Salaries',
      summary: 'Blockchain and Web3 developers are earning 60% more than traditional web developers as demand for decentralized applications grows.',
      content: 'The Web3 ecosystem is expanding rapidly, with companies offering substantial salaries for developers skilled in Solidity, blockchain, and smart contract development.',
      category: 'job_market',
      publishedAt: new Date(Date.now() - 518400000).toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400',
      source: 'Web3 Career Report',
      tags: ['Web3', 'Blockchain', 'Cryptocurrency', 'Smart Contracts']
    },
    {
      id: '8',
      title: 'Serverless Architecture Adoption Reaches 70%',
      summary: 'More companies are moving to serverless architectures to reduce costs and improve scalability. AWS Lambda and Azure Functions lead the market.',
      content: 'Serverless computing has become mainstream with 70% of organizations using or planning to use serverless technologies for cost savings and improved scalability.',
      category: 'trending_technology',
      publishedAt: new Date(Date.now() - 604800000).toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400',
      source: 'Cloud Native Report',
      tags: ['Serverless', 'AWS', 'Azure', 'Cloud Computing']
    }
  ]

  const filteredUpdates = techUpdates.filter(update => {
    const matchesCategory = selectedCategory === 'all' || update.category === selectedCategory
    const matchesSearch = searchQuery === '' || 
      update.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      update.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      update.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-r from-primary-500/10 to-accent-500/10 border-primary-500/20"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
              <TrendingUp className="w-8 h-8 mr-3 text-primary-400" />
              Tech Updates & Industry News
            </h1>
            <p className="text-gray-400 text-lg">
              Stay ahead with the latest technology trends and industry insights
            </p>
          </div>
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
              placeholder="Search updates, technologies, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 whitespace-nowrap',
                  selectedCategory === category.id
                    ? 'bg-primary-600/20 text-primary-400 border-2 border-primary-500/30'
                    : 'bg-dark-700/30 text-gray-400 border-2 border-dark-600/30 hover:border-dark-500/50'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{category.label}</span>
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* Results Count */}
      <div className="text-sm text-gray-400">
        Showing {filteredUpdates.length} {filteredUpdates.length === 1 ? 'update' : 'updates'}
      </div>

      {/* Updates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredUpdates.map((update, index) => (
          <motion.div
            key={update.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="card-hover"
          >
            {/* Image */}
            <div className="relative h-48 rounded-t-xl overflow-hidden bg-dark-800 mb-4">
              <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent z-10"></div>
              <div className="w-full h-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
                <TrendingUp className="w-16 h-16 text-primary-400/30" />
              </div>
              
              {/* Category Badge */}
              <div className="absolute top-3 left-3 z-20">
                <span className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm',
                  update.category === 'framework_update' && 'bg-blue-500/20 text-blue-400 border-blue-500/30',
                  update.category === 'trending_technology' && 'bg-purple-500/20 text-purple-400 border-purple-500/30',
                  update.category === 'job_market' && 'bg-green-500/20 text-green-400 border-green-500/30'
                )}>
                  {update.category.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-white line-clamp-2 hover:text-primary-400 transition-colors">
                {update.title}
              </h3>
              
              <p className="text-gray-400 text-sm line-clamp-3">
                {update.summary}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {update.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-dark-700/50 text-gray-400 text-xs rounded-lg border border-dark-600/30 flex items-center"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-dark-700">
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(update.publishedAt)}</span>
                  </div>
                  <span>•</span>
                  <span>{update.source}</span>
                </div>
                
                <button className="text-primary-400 hover:text-primary-300 transition-colors text-sm font-medium flex items-center space-x-1">
                  <span>Read more</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredUpdates.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card text-center py-12"
        >
          <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No updates found</h3>
          <p className="text-gray-400">
            Try adjusting your filters or search query
          </p>
        </motion.div>
      )}
    </div>
  )
}

export default TechUpdates
