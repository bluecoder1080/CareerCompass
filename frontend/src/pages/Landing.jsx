import { Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowRight, 
  Compass, 
  Brain, 
  Target, 
  TrendingUp, 
  Users, 
  MessageCircle,
  FileText,
  Sparkles,
  CheckCircle,
  Star
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'

const Landing = () => {
  const { isAuthenticated } = useAuthStore()

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/app/dashboard" replace />
  }

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Insights',
      description: 'Get personalized career recommendations based on your skills, interests, and goals.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Target,
      title: 'Skill Gap Analysis',
      description: 'Identify what skills you need to develop to reach your career objectives.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: TrendingUp,
      title: 'Market Insights',
      description: 'Stay updated with the latest industry trends and job market demands.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: FileText,
      title: 'Smart Resume Builder',
      description: 'Create ATS-optimized resumes with AI-powered suggestions and feedback.',
      color: 'from-orange-500 to-red-500'
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Software Engineer',
      company: 'TechCorp',
      content: 'CareerCompass helped me transition from marketing to tech. The personalized roadmap was incredibly valuable.',
      rating: 5
    },
    {
      name: 'Michael Rodriguez',
      role: 'Product Manager',
      company: 'StartupXYZ',
      content: 'The psychometric test gave me insights I never had about myself. It completely changed my career direction.',
      rating: 5
    },
    {
      name: 'Alex Johnson',
      role: 'Data Scientist',
      company: 'DataCorp',
      content: 'The AI chat feature is like having a personal career coach available 24/7. Highly recommended!',
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-950/80 backdrop-blur-md border-b border-dark-800">
        <div className="container-responsive">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">
                CareerCompass
              </span>
            </Link>

            {/* Navigation links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-400 hover:text-gray-200 transition-colors">
                Features
              </a>
              <a href="#testimonials" className="text-gray-400 hover:text-gray-200 transition-colors">
                Testimonials
              </a>
              <a href="#pricing" className="text-gray-400 hover:text-gray-200 transition-colors">
                Pricing
              </a>
            </div>

            {/* Auth buttons */}
            <div className="flex items-center space-x-4">
              <Link
                to="/auth/login"
                className="btn-primary"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="container-responsive">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                Navigate Your Career with{' '}
                <span className="text-gradient">AI Guidance</span>
              </h1>
              
              <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                Discover personalized career paths, build essential skills, and accelerate your 
                professional growth with intelligent recommendations powered by advanced AI.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                <Link
                  to="/auth/login"
                  className="btn-primary text-lg px-8 py-4 group"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Quick stats */}
              <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-primary-400" />
                  <span>10,000+ Users</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-success-400" />
                  <span>95% Success Rate</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-accent-400" />
                  <span>AI-Powered</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Background effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-dark-900/30">
        <div className="container-responsive">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                Powerful Features for Your Success
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Everything you need to take control of your career journey and make informed decisions.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card-hover text-center"
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400">
                    {feature.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Quick Chat Card */}
      <section className="py-20">
        <div className="container-responsive">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="card bg-gradient-to-r from-primary-500/10 to-accent-500/10 border-primary-500/20 text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-4">
                Try Our AI Career Assistant
              </h2>
              
              <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
                Get instant career advice, skill recommendations, and personalized guidance. 
                Start a conversation with our AI assistant right now.
              </p>

              <Link
                to="/auth/login"
                className="btn-primary text-lg px-8 py-4 inline-flex items-center group"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Start Chatting
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-dark-900/30">
        <div className="container-responsive">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                What Our Users Say
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Join thousands of professionals who have transformed their careers with CareerCompass.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-300 mb-6 italic">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-white font-medium">{testimonial.name}</p>
                    <p className="text-gray-400 text-sm">
                      {testimonial.role} at {testimonial.company}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container-responsive">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Career?
            </h2>
            
            <p className="text-xl text-gray-400 mb-8">
              Join thousands of professionals who are already using CareerCompass to 
              accelerate their career growth and achieve their goals.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/auth/login"
                className="btn-primary text-lg px-8 py-4 group"
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-dark-800">
        <div className="container-responsive">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">
                CareerCompass
              </span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-gray-200 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-gray-200 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-gray-200 transition-colors">
                Contact
              </a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-dark-800 text-center text-sm text-gray-500">
            <p>&copy; 2024 CareerCompass. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing
