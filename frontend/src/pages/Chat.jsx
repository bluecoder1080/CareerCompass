import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Bot, 
  User, 
  Plus, 
  MessageCircle, 
  Trash2, 
  Archive,
  MoreVertical,
  Copy,
  RefreshCw,
  Sparkles
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useAuthStore } from '../stores/authStore'
import { api } from '../lib/api'
import { formatDate, copyToClipboard, cn } from '../lib/utils'
import toast from 'react-hot-toast'

const Chat = () => {
  const { chatId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  
  const [selectedChat, setSelectedChat] = useState(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState('')
  const [streamingContent, setStreamingContent] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(null)
  const [eventSource, setEventSource] = useState(null)
  
  const { user, getUserInitials } = useAuthStore()
  
  const { register, handleSubmit, reset, watch } = useForm()
  const message = watch('message', '')

  // Fetch chat list
  const { data: chats = [], isLoading: chatsLoading } = useQuery(
    'chats',
    () => api.get('/chat').then(res => res.data.data),
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  )

  // Fetch current chat
  const { data: currentChat, isLoading: chatLoading } = useQuery(
    ['chat', chatId],
    () => chatId ? api.get(`/chat/${chatId}`).then(res => res.data.data) : null,
    {
      enabled: !!chatId,
      staleTime: 30 * 1000, // 30 seconds
    }
  )

  // Create new chat mutation
  const createChatMutation = useMutation(
    (data) => api.post('/chat', data),
    {
      onSuccess: (response) => {
        const newChat = response.data.data
        queryClient.invalidateQueries('chats')
        navigate(`/app/chat/${newChat._id}`)
      },
      onError: (error) => {
        toast.error('Failed to create chat')
      }
    }
  )

  // Send message mutation (regular)
  const sendMessageMutation = useMutation(
    ({ chatId, message }) => api.post(`/chat/${chatId}/message`, { content: message }),
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries(['chat', chatId])
        queryClient.invalidateQueries('chats')
        reset()
        setIsStreaming(false)
        setStreamingMessage('')
        setStreamingContent('')
      },
      onError: (error) => {
        toast.error('Failed to send message')
        setIsStreaming(false)
        setStreamingMessage('')
        setStreamingContent('')
      }
    }
  )

  // Send streaming message
  const sendStreamingMessage = async (chatId, message) => {
    setIsStreaming(true)
    setStreamingMessage('AI is thinking...')
    setStreamingContent('')
    
    try {
      const token = localStorage.getItem('token')
      
      // Use fetch with ReadableStream for streaming
      const apiBaseUrl = import.meta.env.VITE_API_URL || 
                        (import.meta.env.PROD ? 'https://careercompass-backend-mssq.onrender.com/api' : 'http://localhost:5000/api')
      const response = await fetch(`${apiBaseUrl.replace('/api', '')}/api/chat/${chatId}/message/stream`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({ content: message }),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) {
          setIsStreaming(false)
          setStreamingMessage('')
          setStreamingContent('')
          break
        }
        
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              switch (data.type) {
                case 'start':
                  setStreamingMessage(data.message)
                  break
                case 'chunk':
                  setStreamingContent(data.fullContent)
                  setStreamingMessage('')
                  break
                case 'complete':
                  setStreamingContent('')
                  setStreamingMessage('')
                  setIsStreaming(false)
                  queryClient.invalidateQueries(['chat', chatId])
                  queryClient.invalidateQueries('chats')
                  return
                case 'error':
                  toast.error(data.error || 'Failed to get AI response')
                  setIsStreaming(false)
                  setStreamingMessage('')
                  setStreamingContent('')
                  return
                case 'end':
                  return
              }
            } catch (parseError) {
              console.error('Failed to parse SSE data:', parseError)
            }
          }
        }
      }
      
    } catch (error) {
      console.error('Streaming error:', error)
      toast.error('Failed to send message')
      setIsStreaming(false)
      setStreamingMessage('')
      setStreamingContent('')
    }
  }

  // Delete chat mutation
  const deleteChatMutation = useMutation(
    (chatId) => api.delete(`/chat/${chatId}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('chats')
        if (chatId === selectedChat) {
          navigate('/app/chat')
        }
        toast.success('Chat deleted')
      }
    }
  )

  // Archive chat mutation
  const archiveChatMutation = useMutation(
    (chatId) => api.put(`/chat/${chatId}/archive`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('chats')
        toast.success('Chat archived')
      }
    }
  )

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentChat?.messages, streamingMessage, streamingContent])
  
  // Cleanup event source on unmount
  useEffect(() => {
    return () => {
      if (eventSource) {
        eventSource.close()
      }
    }
  }, [eventSource])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [message])

  // Set selected chat
  useEffect(() => {
    if (chatId) {
      setSelectedChat(chatId)
    }
  }, [chatId])

  const onSubmit = async (data) => {
    console.log('Form submitted with data:', data)
    if (!data.message?.trim()) {
      console.log('Empty message, returning')
      return
    }

    if (!chatId) {
      // Create new chat
      console.log('Creating new chat')
      setIsStreaming(true)
      createChatMutation.mutate({
        title: data.message.substring(0, 50),
        initialMessage: data.message
      })
    } else {
      // Send streaming message to existing chat
      console.log('Sending message to existing chat:', chatId)
      const messageContent = data.message
      reset()
      await sendStreamingMessage(chatId, messageContent)
    }
  }

  const handleNewChat = () => {
    navigate('/app/chat')
  }

  const handleSendMessage = async () => {
    const messageContent = message?.trim()
    console.log('🚀 Send button clicked! Message:', messageContent)
    
    if (!messageContent) {
      console.log('❌ No message content')
      return
    }

    if (isStreaming) {
      console.log('❌ Already streaming')
      return
    }

    console.log('✅ Sending dummy message...')
    
    // Clear the input immediately
    reset()
    
    // Set streaming state
    setIsStreaming(true)
    setStreamingMessage('AI is thinking...')
    
    // Smart response system - matches user input to appropriate response
    setTimeout(() => {
      const smartResponses = {
        // Greetings
        'hi': "Hello! 👋 I'm your AI Career Advisor. How are you doing today? I'm here to help you with career guidance, skill development, and job search strategies!",
        'hello': "Hi there! 😊 Great to meet you! I'm excited to help you navigate your career journey. What would you like to explore today?",
        'hey': "Hey! 🌟 Welcome to CareerCompass! I'm your personal AI career coach. How can I assist you in achieving your professional goals?",
        'good morning': "Good morning! ☀️ Hope you're having a wonderful day! I'm here to help you make great career decisions. What's on your mind?",
        'how are you': "I'm doing fantastic, thank you for asking! 🤖 I'm energized and ready to help you with your career questions. How are you feeling about your career path?",
        
        // Career questions
        'career': "Excellent question! 🚀 Career planning is crucial for success. Here are the key areas I can help you with:\n\n**📊 Career Assessment**\n- Identify your strengths and interests\n- Explore suitable career paths\n\n**🎯 Skill Development**\n- In-demand technical skills\n- Soft skills that matter\n\n**💼 Job Search Strategy**\n- Resume optimization\n- Interview preparation\n\nWhat specific area interests you most?",
        
        'skills': "Great focus on skills! 💪 Here are the most in-demand skills for 2024:\n\n**🔥 Technical Skills:**\n- **AI/Machine Learning** - Highest demand\n- **Cloud Computing** (AWS, Azure, GCP)\n- **Cybersecurity** - Critical need\n- **Data Science & Analytics**\n- **Mobile App Development**\n\n**🌟 Soft Skills:**\n- **Problem-solving** - Most valued\n- **Communication** - Essential everywhere\n- **Adaptability** - Key in changing markets\n- **Leadership** - Opens doors\n\nWhich area would you like to dive deeper into?",
        
        'job': "Job searching can be exciting! 🎯 Here's my proven strategy:\n\n**📝 Phase 1: Preparation (Week 1-2)**\n- Polish your resume with keywords\n- Create compelling LinkedIn profile\n- Build portfolio/GitHub presence\n\n**🔍 Phase 2: Search & Apply (Week 3-6)**\n- Use multiple job boards (LinkedIn, Indeed, AngelList)\n- Network actively (70% of jobs are hidden!)\n- Apply to 10-15 positions weekly\n\n**🎤 Phase 3: Interview (Week 7+)**\n- Practice common questions\n- Research companies thoroughly\n- Follow up professionally\n\nWhat's your current stage in the job search?",
        
        'salary': "Smart to think about compensation! 💰 Here's how to approach salary:\n\n**📊 Research Market Rates:**\n- Use Glassdoor, PayScale, levels.fyi\n- Consider location and experience\n- Factor in total compensation (benefits, equity)\n\n**💡 Negotiation Tips:**\n- Wait for the offer before discussing salary\n- Highlight your unique value\n- Be prepared to justify your ask\n- Consider non-salary benefits\n\n**🎯 Salary Ranges by Role:**\n- **Software Engineer**: $80k-$180k\n- **Data Scientist**: $90k-$200k\n- **Product Manager**: $100k-$220k\n- **DevOps Engineer**: $85k-$170k\n\nWhat role are you targeting?"
      }
      
      // Find the best matching response
      const userMessage = messageContent.toLowerCase()
      let selectedResponse = null
      
      // Check for exact matches first
      for (const [key, response] of Object.entries(smartResponses)) {
        if (userMessage.includes(key)) {
          selectedResponse = response
          break
        }
      }
      
      // Default responses if no match found
      if (!selectedResponse) {
        const defaultResponses = [
          "That's a fascinating question! 🤔 Let me share some insights that might help you:\n\n**Key Considerations:**\n- Industry trends are constantly evolving\n- Your personal interests and strengths matter most\n- Continuous learning is essential for success\n\nCould you tell me more about your specific situation so I can provide more targeted advice?",
          
          "I love your curiosity! 🌟 Here's what I'd recommend:\n\n**Immediate Steps:**\n1. **Assess your current skills** - What are you good at?\n2. **Research market demand** - What's hiring now?\n3. **Create a learning plan** - Bridge any skill gaps\n4. **Start networking** - Connect with industry professionals\n\nWhat aspect would you like to explore further?",
          
          "Excellent point! 💡 Success in today's market requires:\n\n**🎯 Strategic Thinking:**\n- Set clear, measurable goals\n- Create timeline with milestones\n- Regularly review and adjust\n\n**🚀 Continuous Growth:**\n- Stay updated with industry trends\n- Invest in learning new technologies\n- Build a strong professional network\n\nWhat's your biggest career challenge right now?"
        ]
        selectedResponse = defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
      }
      
      // Simulate streaming by showing content gradually
      let currentText = ''
      let index = 0
      
      const streamInterval = setInterval(() => {
        if (index < selectedResponse.length) {
          const charsToAdd = Math.min(3, selectedResponse.length - index)
          currentText += selectedResponse.slice(index, index + charsToAdd)
          index += charsToAdd
          
          setStreamingContent(currentText)
          setStreamingMessage('')
        } else {
          // Streaming complete
          clearInterval(streamInterval)
          setIsStreaming(false)
          setStreamingContent('')
          setStreamingMessage('')
          
          console.log('✅ Smart response complete!')
        }
      }, 50)
      
    }, 1000)
  }

  const handleCopyMessage = (content) => {
    copyToClipboard(content)
    toast.success('Message copied to clipboard')
  }

  const handleDeleteChat = (chatId) => {
    if (window.confirm('Are you sure you want to delete this chat?')) {
      deleteChatMutation.mutate(chatId)
    }
    setDropdownOpen(null)
  }

  const handleArchiveChat = (chatId) => {
    archiveChatMutation.mutate(chatId)
    setDropdownOpen(null)
  }

  const renderMessage = (msg, index) => {
    const isUser = msg.role === 'user'
    const isLast = index === currentChat.messages.length - 1

    return (
      <motion.div
        key={msg._id || index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'flex gap-4 p-4',
          isUser ? 'flex-row-reverse' : 'flex-row'
        )}
      >
        {/* Avatar */}
        <div className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0',
          isUser 
            ? 'bg-primary-600 text-white' 
            : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
        )}>
          {isUser ? getUserInitials() : <Bot className="w-4 h-4" />}
        </div>

        {/* Message content */}
        <div className={cn(
          'flex-1 max-w-3xl',
          isUser ? 'text-right' : 'text-left'
        )}>
          <div className={cn(
            'inline-block p-4 rounded-2xl',
            isUser 
              ? 'bg-primary-600 text-white rounded-br-md' 
              : 'bg-dark-700 text-gray-200 rounded-bl-md border border-dark-600'
          )}>
            {isUser ? (
              <p className="whitespace-pre-wrap">{msg.content}</p>
            ) : (
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '')
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-lg my-2"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className="bg-dark-600 px-1 py-0.5 rounded text-sm" {...props}>
                        {children}
                      </code>
                    )
                  }
                }}
              >
                {msg.content}
              </ReactMarkdown>
            )}
          </div>

          {/* Message actions */}
          {!isUser && (
            <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleCopyMessage(msg.content)}
                className="p-1 text-gray-400 hover:text-gray-200 transition-colors"
                title="Copy message"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Timestamp */}
          <div className={cn(
            'text-xs text-gray-500 mt-1',
            isUser ? 'text-right' : 'text-left'
          )}>
            {formatDate(msg.timestamp, 'h:mm a')}
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-dark-950">
      {/* Sidebar - Chat List */}
      <div className="w-80 bg-dark-900/50 border-r border-dark-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-dark-700">
          <button
            onClick={handleNewChat}
            className="w-full btn-primary flex items-center justify-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {chatsLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton h-16 rounded-lg"></div>
              ))}
            </div>
          ) : chats.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No chats yet</p>
              <p className="text-xs">Start a conversation with AI</p>
            </div>
          ) : (
            <div className="p-2">
              {chats.map((chat) => (
                <div
                  key={chat._id}
                  className={cn(
                    'group relative p-3 rounded-lg cursor-pointer transition-colors mb-2',
                    selectedChat === chat._id
                      ? 'bg-primary-600/20 border border-primary-500/30'
                      : 'hover:bg-dark-800/50'
                  )}
                  onClick={() => navigate(`/app/chat/${chat._id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-white truncate">
                        {chat.title}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1 truncate">
                        {chat.lastMessage?.content || 'No messages yet'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(chat.analytics.lastActivity)}
                      </p>
                    </div>

                    {/* Dropdown menu */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setDropdownOpen(dropdownOpen === chat._id ? null : chat._id)
                        }}
                        className="p-1 rounded opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-200 transition-all"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      <AnimatePresence>
                        {dropdownOpen === chat._id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-0 top-full mt-1 w-32 bg-dark-800 border border-dark-600 rounded-lg shadow-lg py-1 z-10"
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleArchiveChat(chat._id)
                              }}
                              className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-dark-700 transition-colors flex items-center"
                            >
                              <Archive className="w-4 h-4 mr-2" />
                              Archive
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteChat(chat._id)
                              }}
                              className="w-full px-3 py-2 text-left text-sm text-error-400 hover:bg-error-500/10 transition-colors flex items-center"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {chatId && currentChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-dark-700 bg-dark-900/30">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-semibold text-white">
                    {currentChat.title}
                  </h1>
                  <p className="text-sm text-gray-400">
                    {currentChat.messages?.length || 0} messages • {currentChat.category}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    AI Model: {currentChat.settings?.model || 'gemma-2b'}
                  </span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto">
              {chatLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="spinner w-8 h-8"></div>
                </div>
              ) : (
                <div className="max-w-4xl mx-auto">
                  {currentChat.messages?.map((msg, index) => (
                    <div key={msg._id || index} className="group">
                      {renderMessage(msg, index)}
                    </div>
                  ))}

                  {/* Streaming message */}
                  {isStreaming && (streamingMessage || streamingContent) && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-4 p-4"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="inline-block p-4 rounded-2xl rounded-bl-md bg-dark-700 border border-dark-600">
                          {streamingContent ? (
                            <ReactMarkdown
                              components={{
                                code({ node, inline, className, children, ...props }) {
                                  const match = /language-(\w+)/.exec(className || '')
                                  return !inline && match ? (
                                    <SyntaxHighlighter
                                      style={vscDarkPlus}
                                      language={match[1]}
                                      PreTag="div"
                                      className="rounded-lg my-2"
                                      {...props}
                                    >
                                      {String(children).replace(/\n$/, '')}
                                    </SyntaxHighlighter>
                                  ) : (
                                    <code className="bg-dark-600 px-1 py-0.5 rounded text-sm" {...props}>
                                      {children}
                                    </code>
                                  )
                                }
                              }}
                            >
                              {streamingContent}
                            </ReactMarkdown>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              </div>
                              <span className="text-sm text-gray-400">{streamingMessage}</span>
                            </div>
                          )}
                          {streamingContent && (
                            <div className="mt-2 flex items-center space-x-1">
                              <div className="w-1 h-4 bg-primary-500 animate-pulse"></div>
                              <span className="text-xs text-gray-500">AI is typing...</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </>
        ) : (
          /* Welcome Screen */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Welcome to AI Career Chat
              </h2>
              <p className="text-gray-400 mb-8">
                Get personalized career guidance, skill recommendations, and answers to your professional questions.
              </p>
              <button
                onClick={handleNewChat}
                className="btn-primary"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Start New Conversation
              </button>
            </div>
          </div>
        )}

        {/* Message Input */}
        {(chatId || !chatId) && (
          <div className="p-4 border-t border-dark-700 bg-dark-900/30">
            <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto">
              <div className="flex items-end space-x-3">
                <div className="flex-1 relative">
                  <textarea
                    {...register('message', { required: true })}
                    ref={textareaRef}
                    placeholder="Ask me about your career, skills, or professional goals..."
                    className="w-full resize-none input py-3 pr-12 min-h-[44px] max-h-32"
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSubmit(onSubmit)()
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="absolute right-2 bottom-2 p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors cursor-pointer"
                    onClick={handleSendMessage}
                  >
                    {isStreaming ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Press Enter to send, Shift+Enter for new line
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default Chat
