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
  Zap
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { api } from '../lib/api'
import { cn, formatDate } from '../lib/utils'
import toast from 'react-hot-toast'

const Psychotest = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const [currentStep, setCurrentStep] = useState('intro') // intro, test, results
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeSpent, setTimeSpent] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const [selectedOption, setSelectedOption] = useState('')

  // Fetch questions
  const { data: questionsData, isLoading: questionsLoading } = useQuery(
    'psychotest-questions',
    () => api.get('/psychotest/questions').then(res => res.data.data),
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  )

  // Fetch latest result
  const { data: latestResult } = useQuery(
    'latest-psychotest',
    () => api.get('/psychotest/latest').then(res => res.data.data).catch(() => null),
    {
      staleTime: 5 * 60 * 1000,
    }
  )

  // Submit test mutation
  const submitTestMutation = useMutation(
    (data) => api.post('/psychotest/submit', data),
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries('latest-psychotest')
        setCurrentStep('results')
        toast.success('Psychometric test completed!')
      },
      onError: (error) => {
        toast.error('Failed to submit test. Please try again.')
      }
    }
  )

  // Timer effect
  useEffect(() => {
    if (currentStep === 'test' && startTime) {
      const interval = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - startTime) / 1000))
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [currentStep, startTime])

  const questions = questionsData?.questions || []
  const totalQuestions = questions.length

  const handleStartTest = () => {
    setCurrentStep('test')
    setStartTime(Date.now())
    setCurrentQuestion(0)
    setAnswers({})
    setSelectedOption('')
  }

  const handleAnswerSelect = (option) => {
    setSelectedOption(option)
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
        selectedOption,
        question: question.question,
        optionText: question.options[selectedOption]
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
      setSelectedOption(prevAnswer?.selectedOption || '')
    }
  }

  const handleSubmitTest = () => {
    const finalAnswers = {
      ...answers,
      [currentQuestion]: {
        questionId: questions[currentQuestion].id,
        selectedOption,
        question: questions[currentQuestion].question,
        optionText: questions[currentQuestion].options[selectedOption]
      }
    }

    const submissionData = {
      answers: Object.values(finalAnswers),
      timeSpent
    }

    submitTestMutation.mutate(submissionData)
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

  if (questionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading psychometric test...</p>
        </div>
      </div>
    )
  }

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
            Psychometric Assessment
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Discover your personality type and get personalized career recommendations 
            based on your unique traits and preferences.
          </p>
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
        {latestResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Your Latest Result</h3>
              <span className="text-sm text-gray-400">
                {formatDate(latestResult.completedAt)}
              </span>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-dark-700/30 rounded-lg">
              <div className={`w-12 h-12 bg-gradient-to-r ${getPersonalityTypeColor(latestResult.personalityType)} rounded-xl flex items-center justify-center`}>
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white">{latestResult.personalityType}</h4>
                <p className="text-gray-400 text-sm">{latestResult.personalityAnalysis?.summary}</p>
              </div>
              <button
                onClick={() => navigate(`/app/psychotest/results/${latestResult._id}`)}
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
              {question?.options && Object.entries(question.options).map(([key, value]) => (
                <motion.button
                  key={key}
                  onClick={() => handleAnswerSelect(key)}
                  className={cn(
                    'w-full p-4 text-left rounded-xl border-2 transition-all duration-200',
                    selectedOption === key
                      ? 'border-primary-500 bg-primary-500/10 text-white'
                      : 'border-dark-600 bg-dark-700/30 text-gray-300 hover:border-dark-500 hover:bg-dark-700/50'
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      'w-6 h-6 rounded-full border-2 flex items-center justify-center',
                      selectedOption === key
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-gray-500'
                    )}>
                      {selectedOption === key && (
                        <CheckCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span className="flex-1 text-lg">{value}</span>
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
            disabled={!selectedOption || submitTestMutation.isLoading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitTestMutation.isLoading ? (
              <div className="spinner w-4 h-4 mr-2"></div>
            ) : currentQuestion === totalQuestions - 1 ? (
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
  if (currentStep === 'results') {
    return (
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-success-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Assessment Complete!
          </h1>
          <p className="text-xl text-gray-400">
            Your personalized results are being generated. This may take a few moments.
          </p>
        </motion.div>

        <div className="card text-center">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="spinner w-8 h-8"></div>
            <span className="text-lg text-gray-300">Analyzing your responses...</span>
          </div>
          
          <div className="space-y-3 text-sm text-gray-400 mb-8">
            <p>✓ Processing personality traits</p>
            <p>✓ Matching career paths</p>
            <p>✓ Generating skill recommendations</p>
            <p>✓ Creating development roadmap</p>
          </div>

          <p className="text-gray-500">
            You'll be redirected to your results automatically, or you can check them in your dashboard.
          </p>
        </div>
      </div>
    )
  }

  return null
}

export default Psychotest
