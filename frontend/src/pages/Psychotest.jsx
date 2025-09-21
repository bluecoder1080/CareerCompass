import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  Target,
  TrendingUp,
  Award,
  Calendar,
  BookOpen,
  Zap,
  Star,
  Users,
  Lightbulb
} from 'lucide-react'
import { cn } from '../lib/utils'
import toast from 'react-hot-toast'

const Psychotest = () => {
  const navigate = useNavigate()
  
  const [currentStep, setCurrentStep] = useState('intro') // intro, test, results
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeSpent, setTimeSpent] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const [selectedOption, setSelectedOption] = useState('')

  // DUMMY QUESTIONS - No API calls needed!
  const dummyQuestions = [
    {
      id: 1,
      question: "What motivates you most in your career?",
      options: [
        { id: 'a', text: "Solving complex problems and challenges", weight: { analytical: 3, creative: 1, leadership: 1 } },
        { id: 'b', text: "Creating something new and innovative", weight: { creative: 3, analytical: 1, leadership: 1 } },
        { id: 'c', text: "Leading and inspiring teams", weight: { leadership: 3, analytical: 1, creative: 1 } },
        { id: 'd', text: "Helping others achieve their goals", weight: { leadership: 2, creative: 2, analytical: 1 } }
      ]
    },
    {
      id: 2,
      question: "How do you prefer to work?",
      options: [
        { id: 'a', text: "Independently with minimal supervision", weight: { analytical: 3, creative: 2, leadership: 1 } },
        { id: 'b', text: "In collaborative team environments", weight: { leadership: 3, creative: 2, analytical: 1 } },
        { id: 'c', text: "With clear structure and processes", weight: { analytical: 2, leadership: 2, creative: 1 } },
        { id: 'd', text: "In dynamic, fast-changing situations", weight: { creative: 3, leadership: 2, analytical: 1 } }
      ]
    },
    {
      id: 3,
      question: "What type of problems do you enjoy solving?",
      options: [
        { id: 'a', text: "Technical and logical challenges", weight: { analytical: 3, creative: 1, leadership: 1 } },
        { id: 'b', text: "Creative and design challenges", weight: { creative: 3, analytical: 1, leadership: 1 } },
        { id: 'c', text: "Strategic and organizational challenges", weight: { leadership: 3, analytical: 2, creative: 1 } },
        { id: 'd', text: "People and communication challenges", weight: { leadership: 2, creative: 2, analytical: 1 } }
      ]
    },
    {
      id: 4,
      question: "What work environment suits you best?",
      options: [
        { id: 'a', text: "Quiet, focused spaces for deep work", weight: { analytical: 3, creative: 1, leadership: 1 } },
        { id: 'b', text: "Open, collaborative spaces", weight: { leadership: 3, creative: 2, analytical: 1 } },
        { id: 'c', text: "Creative studios or flexible spaces", weight: { creative: 3, analytical: 1, leadership: 1 } },
        { id: 'd', text: "Meeting rooms and presentation areas", weight: { leadership: 3, analytical: 1, creative: 1 } }
      ]
    },
    {
      id: 5,
      question: "How do you handle stress and pressure?",
      options: [
        { id: 'a', text: "Break down problems systematically", weight: { analytical: 3, leadership: 1, creative: 1 } },
        { id: 'b', text: "Find creative solutions and alternatives", weight: { creative: 3, analytical: 1, leadership: 1 } },
        { id: 'c', text: "Rally the team and delegate effectively", weight: { leadership: 3, analytical: 1, creative: 1 } },
        { id: 'd', text: "Stay calm and think strategically", weight: { analytical: 2, leadership: 2, creative: 1 } }
      ]
    }
  ]

  // DUMMY LATEST RESULT - Shows previous test if needed
  const dummyLatestResult = null // Set to null to show fresh test

  // DUMMY RESULTS STATE
  const [testResults, setTestResults] = useState(null)

  // Calculate dummy results
  const calculateResults = () => {
    const scores = { analytical: 0, creative: 0, leadership: 0 }
    
    // Calculate scores based on answers
    Object.values(answers).forEach(answer => {
      const question = dummyQuestions.find(q => q.id === answer.questionId)
      const option = question.options.find(opt => opt.id === answer.optionId)
      
      Object.entries(option.weight).forEach(([trait, weight]) => {
        scores[trait] += weight
      })
    })
    
    // Determine primary trait
    const maxScore = Math.max(...Object.values(scores))
    const primaryTrait = Object.keys(scores).find(key => scores[key] === maxScore)
    
    // Generate results based on primary trait
    const traitResults = {
      analytical: {
        type: "Analytical Thinker",
        description: "You excel at logical reasoning, problem-solving, and data analysis. You approach challenges systematically and enjoy working with complex information.",
        strengths: ["Problem Solving", "Data Analysis", "Critical Thinking", "Research Skills", "Attention to Detail"],
        careers: ["Data Scientist", "Software Engineer", "Research Analyst", "Financial Analyst", "Systems Architect"],
        score: Math.round((scores.analytical / 15) * 100)
      },
      creative: {
        type: "Creative Innovator", 
        description: "You thrive on creativity, innovation, and bringing new ideas to life. You see possibilities where others see obstacles and love to create unique solutions.",
        strengths: ["Creative Thinking", "Innovation", "Design Skills", "Adaptability", "Vision"],
        careers: ["UX/UI Designer", "Marketing Manager", "Product Manager", "Creative Director", "Entrepreneur"],
        score: Math.round((scores.creative / 15) * 100)
      },
      leadership: {
        type: "Natural Leader",
        description: "You have strong leadership qualities and excel at motivating teams, making decisions, and driving results. People naturally look to you for guidance.",
        strengths: ["Leadership", "Communication", "Team Building", "Strategic Thinking", "Decision Making"],
        careers: ["Project Manager", "Team Lead", "Business Manager", "Consultant", "Executive"],
        score: Math.round((scores.leadership / 15) * 100)
      }
    }
    
    return {
      id: Date.now(),
      primaryTrait: traitResults[primaryTrait],
      scores,
      completedAt: new Date(),
      timeSpent: Math.floor((Date.now() - startTime) / 1000),
      totalQuestions: dummyQuestions.length
    }
  }

  // Timer effect
  useEffect(() => {
    if (currentStep === 'test' && startTime) {
      const interval = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - startTime) / 1000))
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [currentStep, startTime])

  const questions = dummyQuestions // Use dummy questions
  const totalQuestions = questions.length

  const handleStartTest = () => {
    setCurrentStep('test')
    setStartTime(Date.now())
    setCurrentQuestion(0)
    setAnswers({})
    setSelectedOption('')
    toast.success('🎭 Demo Psychometric Test Started!')
  }

  const handleAnswerSelect = (optionId) => {
    setSelectedOption(optionId)
  }

  const handleNextQuestion = () => {
    if (!selectedOption) {
      toast.error('Please select an answer before continuing')
      return
    }

    const question = questions[currentQuestion]
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: {
        questionId: question.id,
        optionId: selectedOption,
        question: question.question,
        optionText: question.options.find(opt => opt.id === selectedOption)?.text
      }
    }))

    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(prev => prev + 1)
      setSelectedOption('')
    } else {
      handleSubmitTest()
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
      const prevAnswer = answers[currentQuestion - 1]
      setSelectedOption(prevAnswer?.optionId || '')
    }
  }

  const handleSubmitTest = () => {
    const finalAnswers = {
      ...answers,
      [currentQuestion]: {
        questionId: questions[currentQuestion].id,
        optionId: selectedOption,
        question: questions[currentQuestion].question,
        optionText: questions[currentQuestion].options.find(opt => opt.id === selectedOption)?.text
      }
    }

    setAnswers(finalAnswers)
    
    // Calculate results immediately (no API call)
    const results = calculateResults()
    setTestResults(results)
    setCurrentStep('results')
    
    toast.success('🎉 Psychometric Test Completed! Results calculated instantly!')
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getPersonalityTypeColor = (type) => {
    const colors = {
      'Innovative Analyst': 'from-blue-500 to-cyan-500',
      'Strategic Implementer': 'from-green-500 to-emerald-500',
      'Visionary Leader': 'from-purple-500 to-pink-500',
      'Collaborative Problem Solver': 'from-orange-500 to-red-500',
      'Inspiring Communicator': 'from-yellow-500 to-orange-500',
      'Creative Implementer': 'from-pink-500 to-rose-500',
      'Innovative Leader': 'from-indigo-500 to-purple-500',
      'People Leader': 'from-teal-500 to-cyan-500',
      'Team Builder': 'from-emerald-500 to-teal-500',
      'Operational Leader': 'from-slate-500 to-gray-500'
    }
    return colors[type] || 'from-primary-500 to-accent-500'
  }

  // No loading needed - using dummy data!

  // Intro Step
  if (currentStep === 'intro') {
    return (
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            🎭 Demo Psychometric Assessment
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Experience our AI-powered personality assessment! Get instant results and personalized career recommendations 
            based on your unique traits and preferences.
          </p>
          <div className="mt-4 inline-block bg-green-900/20 border border-green-500/30 rounded-lg px-4 py-2">
            <p className="text-green-300 text-sm">✨ Demo Mode: Instant results, no data saved</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Test Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <h2 className="text-2xl font-bold text-white mb-6">What You'll Get</h2>
            <div className="space-y-4">
              {[
                {
                  icon: Target,
                  title: 'Personality Analysis',
                  description: 'Detailed breakdown of your personality traits and work style'
                },
                {
                  icon: TrendingUp,
                  title: 'Career Recommendations',
                  description: '3-5 career paths that match your personality profile'
                },
                {
                  icon: BookOpen,
                  title: 'Skill Gap Analysis',
                  description: 'Identify skills you need to develop for your target roles'
                },
                {
                  icon: Calendar,
                  title: '6-Month Roadmap',
                  description: 'Personalized development plan with actionable milestones'
                }
              ].map((item, index) => {
                const Icon = item.icon
                return (
                  <div key={item.title} className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                      <p className="text-gray-400 text-sm">{item.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Test Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="card"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Test Details</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-dark-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-accent-400" />
                  <span className="text-gray-300">Duration</span>
                </div>
                <span className="text-white font-medium">10-15 minutes</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-dark-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Brain className="w-5 h-5 text-purple-400" />
                  <span className="text-gray-300">Questions</span>
                </div>
                <span className="text-white font-medium">{totalQuestions} questions</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-dark-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Award className="w-5 h-5 text-yellow-400" />
                  <span className="text-gray-300">Accuracy</span>
                </div>
                <span className="text-white font-medium">95%+ reliable</span>
              </div>

              <div className="bg-primary-500/10 border border-primary-500/20 rounded-lg p-4">
                <h3 className="font-semibold text-primary-400 mb-2">Instructions</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Answer honestly for accurate results</li>
                  <li>• Choose the option that best describes you</li>
                  <li>• There are no right or wrong answers</li>
                  <li>• Take your time to consider each question</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Previous Results */}
        {dummyLatestResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Your Latest Result</h3>
              <span className="text-sm text-gray-400">
                Demo Mode
              </span>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-dark-700/30 rounded-lg">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white">Demo Result</h4>
                <p className="text-gray-400 text-sm">Previous demo results would appear here</p>
              </div>
              <button
                onClick={() => toast.info('Demo mode - no saved results')}
                className="btn-secondary text-sm"
              >
                View Results
              </button>
            </div>
          </motion.div>
        )}

        {/* Start Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <button
            onClick={handleStartTest}
            className="btn-primary text-lg px-8 py-4 group"
          >
            <Brain className="w-5 h-5 mr-2" />
            Start Assessment
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-sm text-gray-500 mt-4">
            This assessment is completely free and your data is kept private
          </p>
        </motion.div>
      </div>
    )
  }

  // Test Step
  if (currentStep === 'test') {
    const question = questions[currentQuestion]
    const progress = ((currentQuestion + 1) / totalQuestions) * 100

    return (
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  Question {currentQuestion + 1} of {totalQuestions}
                </h1>
                <p className="text-gray-400 text-sm">
                  Time: {formatTime(timeSpent)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400 mb-1">Progress</div>
              <div className="text-lg font-bold text-primary-400">{Math.round(progress)}%</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="progress-bar">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="card mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-8 leading-relaxed">
              {question?.question}
            </h2>

            <div className="space-y-4">
              {question?.options?.map((option) => (
                <motion.button
                  key={option.id}
                  onClick={() => handleAnswerSelect(option.id)}
                  className={cn(
                    'w-full p-4 text-left rounded-xl border-2 transition-all duration-200',
                    selectedOption === option.id
                      ? 'border-primary-500 bg-primary-500/10 text-white'
                      : 'border-dark-600 bg-dark-700/30 text-gray-300 hover:border-dark-500 hover:bg-dark-700/50'
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      'w-6 h-6 rounded-full border-2 flex items-center justify-center',
                      selectedOption === option.id
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-gray-500'
                    )}>
                      {selectedOption === option.id && (
                        <CheckCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span className="flex-1 text-lg">{option.text}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestion === 0}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </button>

          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span>{currentQuestion + 1}</span>
            <span>/</span>
            <span>{totalQuestions}</span>
          </div>

          <button
            onClick={handleNextQuestion}
            disabled={!selectedOption}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentQuestion === totalQuestions - 1 ? (
              <>
                Complete Test
                <CheckCircle className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </div>
      </div>
    )
  }

  // Results Step
  if (currentStep === 'results' && testResults) {
    const { primaryTrait, scores, timeSpent, totalQuestions } = testResults
    
    return (
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-success-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Award className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            🎉 Your Personality Profile
          </h1>
          <p className="text-xl text-gray-400">
            Based on your responses, here's your personalized career guidance
          </p>
        </motion.div>

        {/* Primary Result */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card mb-8 text-center"
        >
          <div className={`w-24 h-24 bg-gradient-to-br ${getPersonalityTypeColor(primaryTrait.type)} rounded-3xl flex items-center justify-center mx-auto mb-6`}>
            <Star className="w-12 h-12 text-white" />
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-4">
            {primaryTrait.type}
          </h2>
          
          <div className="text-6xl font-bold text-primary-400 mb-2">
            {primaryTrait.score}%
          </div>
          <p className="text-gray-400 mb-6">Match Score</p>
          
          <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            {primaryTrait.description}
          </p>
        </motion.div>

        {/* Strengths */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card mb-8"
        >
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Lightbulb className="w-6 h-6 mr-3 text-yellow-400" />
            Your Key Strengths
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {primaryTrait.strengths.map((strength, index) => (
              <div key={index} className="bg-dark-700/50 rounded-lg p-4 text-center">
                <div className="text-primary-400 font-semibold">{strength}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Career Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card mb-8"
        >
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Target className="w-6 h-6 mr-3 text-green-400" />
            Recommended Careers
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {primaryTrait.careers.map((career, index) => (
              <div key={index} className="bg-dark-700/50 rounded-lg p-4 flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center mr-4">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-semibold">{career}</div>
                  <div className="text-gray-400 text-sm">High compatibility</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Test Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card mb-8"
        >
          <h3 className="text-2xl font-bold text-white mb-6">Test Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-400">{totalQuestions}</div>
              <div className="text-gray-400">Questions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">{Math.floor(timeSpent / 60)}m</div>
              <div className="text-gray-400">Time Taken</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">{Object.keys(scores).length}</div>
              <div className="text-gray-400">Traits Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">100%</div>
              <div className="text-gray-400">Completion</div>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={() => setCurrentStep('intro')}
            className="btn-secondary px-8 py-3"
          >
            Take Test Again
          </button>
          <button
            onClick={() => navigate('/app/chat')}
            className="btn-primary px-8 py-3"
          >
            Get Career Guidance
          </button>
        </motion.div>
      </div>
    )
  }

  return null
}

export default Psychotest
