const express = require('express');
const router = express.Router();

// Dummy chats storage
let demoChats = [
  {
    _id: '1',
    title: 'Career Guidance Chat',
    category: 'career_guidance',
    status: 'active',
    messages: [
      {
        _id: 'm1',
        role: 'user',
        content: 'What career path should I choose in tech?',
        timestamp: new Date(Date.now() - 3600000)
      },
      {
        _id: 'm2',
        role: 'assistant',
        content: 'Based on current market trends, I recommend considering these exciting tech career paths:\n\n**1. AI/Machine Learning Engineer**\n- High demand and excellent salary prospects\n- Work on cutting-edge AI technologies\n- Average salary: $120k-180k\n\n**2. Full-Stack Developer**\n- Versatile role with broad opportunities\n- Work on both frontend and backend\n- Average salary: $80k-140k\n\n**3. DevOps Engineer**\n- Bridge between development and operations\n- Focus on automation and scalability\n- Average salary: $90k-150k\n\nWhat interests you most about technology?',
        timestamp: new Date(Date.now() - 3500000)
      }
    ],
    analytics: {
      lastActivity: new Date(Date.now() - 3500000)
    },
    settings: {
      model: 'gemini-1.5-flash',
      temperature: 0.7,
      maxTokens: 1000
    }
  }
];

// Fake AI responses for demo
const fakeResponses = [
  "That's a great question! Based on your interests, I'd recommend focusing on developing your technical skills in programming languages like Python, JavaScript, or Java. These are highly sought after in the current job market.",
  
  "Excellent choice! For a career in software development, I suggest starting with these steps:\n\n1. **Learn Programming Fundamentals**\n   - Start with Python or JavaScript\n   - Practice on platforms like LeetCode or HackerRank\n\n2. **Build Projects**\n   - Create a portfolio on GitHub\n   - Build real-world applications\n\n3. **Network and Apply**\n   - Join tech communities\n   - Attend meetups and conferences\n\nWould you like specific resources for any of these areas?",

  "Based on current industry trends, here are the most in-demand skills:\n\n**Technical Skills:**\n- Cloud Computing (AWS, Azure, GCP)\n- Machine Learning & AI\n- Cybersecurity\n- Mobile Development\n- Data Science\n\n**Soft Skills:**\n- Problem-solving\n- Communication\n- Teamwork\n- Adaptability\n\nWhich area interests you most?",

  "Great question! Here's a roadmap for the next 6 months:\n\n**Month 1-2: Foundation**\n- Complete online courses in your chosen field\n- Set up development environment\n\n**Month 3-4: Practice**\n- Build 2-3 small projects\n- Contribute to open source\n\n**Month 5-6: Job Preparation**\n- Update resume and LinkedIn\n- Practice coding interviews\n- Start applying to positions\n\nThis timeline is flexible based on your current experience level!",

  "Absolutely! Remote work has become the norm in tech. Here are some tips for landing remote positions:\n\n**1. Highlight Remote Skills**\n- Self-motivation\n- Communication abilities\n- Time management\n\n**2. Use Remote Job Boards**\n- Remote.co\n- We Work Remotely\n- AngelList\n\n**3. Build Online Presence**\n- Professional LinkedIn profile\n- Active GitHub account\n- Personal website/portfolio\n\nRemote work offers great flexibility and access to global opportunities!"
];

// @desc    Get user's chats (demo)
// @route   GET /api/chat-demo
// @access  Public
router.get('/', (req, res) => {
  try {
    res.status(200).json({
      success: true,
      count: demoChats.length,
      total: demoChats.length,
      data: demoChats.map(chat => ({
        _id: chat._id,
        title: chat.title,
        category: chat.category,
        status: chat.status,
        analytics: chat.analytics,
        lastMessage: chat.messages[chat.messages.length - 1]
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch demo chats'
    });
  }
});

// @desc    Get specific chat (demo)
// @route   GET /api/chat-demo/:id
// @access  Public
router.get('/:id', (req, res) => {
  try {
    const chat = demoChats.find(c => c._id === req.params.id);
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Demo chat not found'
      });
    }

    res.status(200).json({
      success: true,
      data: chat
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch demo chat'
    });
  }
});

// @desc    Create new chat (demo)
// @route   POST /api/chat-demo
// @access  Public
router.post('/', (req, res) => {
  try {
    const { title, initialMessage } = req.body;

    const newChat = {
      _id: Date.now().toString(),
      title: title || 'New Demo Chat',
      category: 'career_guidance',
      status: 'active',
      messages: [],
      analytics: {
        lastActivity: new Date()
      },
      settings: {
        model: 'gemini-1.5-flash',
        temperature: 0.7,
        maxTokens: 1000
      }
    };

    if (initialMessage) {
      // Add user message
      newChat.messages.push({
        _id: 'u' + Date.now(),
        role: 'user',
        content: initialMessage,
        timestamp: new Date()
      });

      // Add AI response
      const aiResponse = fakeResponses[Math.floor(Math.random() * fakeResponses.length)];
      newChat.messages.push({
        _id: 'a' + Date.now(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      });
    }

    demoChats.push(newChat);

    res.status(201).json({
      success: true,
      data: newChat
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create demo chat'
    });
  }
});

// @desc    Send message to chat (demo)
// @route   POST /api/chat-demo/:id/message
// @access  Public
router.post('/:id/message', (req, res) => {
  try {
    const { content } = req.body;
    const chat = demoChats.find(c => c._id === req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Demo chat not found'
      });
    }

    // Add user message
    const userMessage = {
      _id: 'u' + Date.now(),
      role: 'user',
      content,
      timestamp: new Date()
    };
    chat.messages.push(userMessage);

    // Add AI response after a short delay
    setTimeout(() => {
      const aiResponse = fakeResponses[Math.floor(Math.random() * fakeResponses.length)];
      const assistantMessage = {
        _id: 'a' + Date.now(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };
      chat.messages.push(assistantMessage);
      chat.analytics.lastActivity = new Date();
    }, 1000);

    res.status(200).json({
      success: true,
      data: {
        chat,
        lastMessage: userMessage
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send demo message'
    });
  }
});

// @desc    Send message with streaming (demo)
// @route   POST /api/chat-demo/:id/message/stream
// @access  Public
router.post('/:id/message/stream', (req, res) => {
  try {
    const { content } = req.body;
    const chat = demoChats.find(c => c._id === req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Demo chat not found'
      });
    }

    // Add user message
    const userMessage = {
      _id: 'u' + Date.now(),
      role: 'user',
      content,
      timestamp: new Date()
    };
    chat.messages.push(userMessage);

    // Set up Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
    });

    // Send initial response
    res.write(`data: ${JSON.stringify({ type: 'start', message: 'AI is thinking...' })}\n\n`);

    // Simulate streaming response
    const aiResponse = fakeResponses[Math.floor(Math.random() * fakeResponses.length)];
    let currentText = '';
    let index = 0;

    const streamInterval = setInterval(() => {
      if (index < aiResponse.length) {
        // Add characters gradually
        const charsToAdd = Math.min(3, aiResponse.length - index);
        currentText += aiResponse.slice(index, index + charsToAdd);
        index += charsToAdd;

        res.write(`data: ${JSON.stringify({ 
          type: 'chunk', 
          content: aiResponse.slice(index - charsToAdd, index),
          fullContent: currentText 
        })}\n\n`);
      } else {
        // Streaming complete
        clearInterval(streamInterval);

        // Add to chat history
        const assistantMessage = {
          _id: 'a' + Date.now(),
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date()
        };
        chat.messages.push(assistantMessage);
        chat.analytics.lastActivity = new Date();

        res.write(`data: ${JSON.stringify({ 
          type: 'complete', 
          content: aiResponse,
          model: 'demo-ai',
          provider: 'demo'
        })}\n\n`);

        res.write(`data: ${JSON.stringify({ type: 'end' })}\n\n`);
        res.end();
      }
    }, 50); // Stream every 50ms

  } catch (error) {
    res.write(`data: ${JSON.stringify({ 
      type: 'error', 
      content: 'Demo AI temporarily unavailable',
      error: error.message 
    })}\n\n`);
    res.end();
  }
});

module.exports = router;
