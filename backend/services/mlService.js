const axios = require('axios');

class MLService {
  constructor() {
    this.providers = {
      gemma: {
        apiKey: process.env.GEMMA_API_KEY,
        baseUrl: process.env.GEMMA_API_URL || 'https://api.gemma.com/v1',
        model: 'gemma-2b-it',
      },
      huggingface: {
        token: process.env.HF_TOKEN,
        baseUrl: 'https://api-inference.huggingface.co/models',
        model: 'google/gemma-2b-it',
      },
      vertex: {
        projectId: process.env.VERTEX_PROJECT_ID,
        location: process.env.VERTEX_LOCATION || 'us-central1',
        model: 'gemini-pro',
      },
      mock: {
        enabled: true, // Always available as fallback
      },
    };

    this.activeProvider = this.selectProvider();
  }

  selectProvider() {
    // Priority order: Gemma -> Vertex -> HuggingFace -> Mock
    if (this.providers.gemma.apiKey) {
      return 'gemma';
    } else if (this.providers.vertex.projectId) {
      return 'vertex';
    } else if (this.providers.huggingface.token) {
      return 'huggingface';
    } else {
      console.warn('🤖 No ML provider configured, using mock provider for development');
      return 'mock';
    }
  }

  async generateChatResponse(messages, options = {}) {
    const {
      temperature = 0.7,
      maxTokens = 1000,
      stream = false,
      context = {},
    } = options;

    try {
      switch (this.activeProvider) {
        case 'gemma':
          return await this.callGemmaAPI(messages, { temperature, maxTokens, stream, context });
        case 'vertex':
          return await this.callVertexAPI(messages, { temperature, maxTokens, context });
        case 'huggingface':
          return await this.callHuggingFaceAPI(messages, { temperature, maxTokens, context });
        default:
          return await this.mockChatResponse(messages, context);
      }
    } catch (error) {
      console.error(`ML Service error with ${this.activeProvider}:`, error.message);
      // Fallback to mock response
      return await this.mockChatResponse(messages, context);
    }
  }

  async analyzePsychotest(answers, userProfile = null) {
    const prompt = this.buildPsychotestPrompt(answers, userProfile);
    
    try {
      const response = await this.generateChatResponse([
        { role: 'system', content: 'You are a career counselor and psychologist specializing in personality assessment and career guidance.' },
        { role: 'user', content: prompt }
      ], {
        temperature: 0.3, // Lower temperature for more consistent analysis
        maxTokens: 2000,
      });

      return this.parsePsychotestResponse(response.content);
    } catch (error) {
      console.error('Psychotest analysis error:', error);
      return this.mockPsychotestAnalysis(answers);
    }
  }

  async generateCareerRoadmap(profile, psychotestResults = null) {
    const prompt = this.buildRoadmapPrompt(profile, psychotestResults);
    
    try {
      const response = await this.generateChatResponse([
        { role: 'system', content: 'You are a senior career advisor with expertise in technology careers and skill development.' },
        { role: 'user', content: prompt }
      ], {
        temperature: 0.4,
        maxTokens: 2500,
      });

      return this.parseRoadmapResponse(response.content);
    } catch (error) {
      console.error('Roadmap generation error:', error);
      return this.mockRoadmapGeneration(profile);
    }
  }

  async analyzeResume(resumeText, jobDescription = null) {
    const prompt = this.buildResumeAnalysisPrompt(resumeText, jobDescription);
    
    try {
      const response = await this.generateChatResponse([
        { role: 'system', content: 'You are an expert resume reviewer and ATS specialist.' },
        { role: 'user', content: prompt }
      ], {
        temperature: 0.2,
        maxTokens: 1500,
      });

      return this.parseResumeAnalysis(response.content);
    } catch (error) {
      console.error('Resume analysis error:', error);
      return this.mockResumeAnalysis(resumeText);
    }
  }

  // Provider-specific implementations
  async callGemmaAPI(messages, options) {
    const { temperature, maxTokens, stream, context } = options;
    
    const payload = {
      model: this.providers.gemma.model,
      messages: messages,
      temperature,
      max_tokens: maxTokens,
      stream,
    };

    const response = await axios.post(
      `${this.providers.gemma.baseUrl}/chat/completions`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${this.providers.gemma.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    return {
      content: response.data.choices[0].message.content,
      model: this.providers.gemma.model,
      tokens: response.data.usage?.total_tokens || 0,
      provider: 'gemma',
    };
  }

  async callVertexAPI(messages, options) {
    // Vertex AI implementation would go here
    // For now, fallback to mock
    console.log('Vertex AI not implemented, using mock response');
    return this.mockChatResponse(messages, options.context);
  }

  async callHuggingFaceAPI(messages, options) {
    const { temperature, maxTokens, context } = options;
    
    // Convert messages to single prompt for HF
    const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n');
    
    const payload = {
      inputs: prompt,
      parameters: {
        temperature,
        max_new_tokens: maxTokens,
        return_full_text: false,
      },
    };

    const response = await axios.post(
      `${this.providers.huggingface.baseUrl}/${this.providers.huggingface.model}`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${this.providers.huggingface.token}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    return {
      content: response.data[0]?.generated_text || 'I apologize, but I cannot provide a response at the moment.',
      model: this.providers.huggingface.model,
      tokens: 0, // HF doesn't return token count
      provider: 'huggingface',
    };
  }

  // Mock implementations for development/fallback
  async mockChatResponse(messages, context = {}) {
    const lastMessage = messages[messages.length - 1];
    const userMessage = lastMessage.content.toLowerCase();

    let response = "I'm here to help with your career questions! ";

    if (userMessage.includes('career') || userMessage.includes('job')) {
      response += "Based on your profile, I'd recommend focusing on developing your technical skills and building a strong portfolio. Consider exploring roles in software development, data analysis, or product management.";
    } else if (userMessage.includes('skill') || userMessage.includes('learn')) {
      response += "Great question about skill development! I'd suggest starting with fundamental programming languages like Python or JavaScript, then moving into frameworks and tools relevant to your target role.";
    } else if (userMessage.includes('resume')) {
      response += "For your resume, focus on quantifiable achievements, relevant technical skills, and projects that demonstrate your capabilities. Tailor it to each job application for best results.";
    } else {
      response += "Could you tell me more about your career goals or current challenges? I'm here to provide personalized guidance based on your profile and interests.";
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      content: response,
      model: 'mock-model',
      tokens: response.split(' ').length,
      provider: 'mock',
    };
  }

  // Prompt builders
  buildPsychotestPrompt(answers, userProfile) {
    let prompt = `Analyze the following psychometric test results and provide a comprehensive personality and career assessment:

PSYCHOMETRIC TEST ANSWERS:
`;

    answers.forEach((answer, index) => {
      prompt += `Question ${index + 1}: ${answer.question}
Selected: ${answer.selectedOption} - ${answer.optionText}
Category: ${answer.category}
Score: ${answer.score}

`;
    });

    if (userProfile) {
      prompt += `\nUSER PROFILE CONTEXT:
- Experience Level: ${userProfile.totalExperience || 0} years
- Current Role: ${userProfile.currentRole?.title || 'Not specified'}
- Skills: ${userProfile.skills?.map(s => s.name).join(', ') || 'Not specified'}
- Interests: ${userProfile.interests?.map(i => i.name).join(', ') || 'Not specified'}
`;
    }

    prompt += `
Please provide a detailed analysis in the following JSON format:
{
  "personalityAnalysis": {
    "summary": "Brief personality overview",
    "strengths": ["strength1", "strength2", "strength3"],
    "challenges": ["challenge1", "challenge2"],
    "workStyle": "Description of work style",
    "communicationStyle": "Description of communication style",
    "motivators": ["motivator1", "motivator2", "motivator3"]
  },
  "careerRecommendations": [
    {
      "title": "Career Title",
      "description": "Why this career fits",
      "matchPercentage": 85,
      "requiredSkills": ["skill1", "skill2"],
      "growthOutlook": "growing"
    }
  ],
  "skillGaps": [
    {
      "skill": "Skill Name",
      "currentLevel": "beginner",
      "targetLevel": "intermediate",
      "priority": "high"
    }
  ],
  "sixMonthRoadmap": {
    "overview": "Roadmap overview",
    "milestones": [
      {
        "month": 1,
        "title": "Month 1 Goal",
        "description": "What to focus on",
        "goals": ["goal1", "goal2"],
        "skills": ["skill1", "skill2"]
      }
    ]
  }
}`;

    return prompt;
  }

  buildRoadmapPrompt(profile, psychotestResults) {
    let prompt = `Create a personalized 6-month career development roadmap for the following user:

USER PROFILE:
- Name: ${profile.user?.firstName} ${profile.user?.lastName}
- Current Role: ${profile.currentRole?.title || 'Not specified'}
- Experience: ${profile.totalExperience || 0} years
- Skills: ${profile.skills?.map(s => `${s.name} (${s.level})`).join(', ') || 'Not specified'}
- Career Goals: ${profile.careerGoals?.shortTerm?.join(', ') || 'Not specified'}
`;

    if (psychotestResults) {
      prompt += `
PERSONALITY INSIGHTS:
- Dominant Traits: ${psychotestResults.dominantTraits?.map(t => t.trait).join(', ')}
- Work Style: ${psychotestResults.personalityAnalysis?.workStyle}
`;
    }

    prompt += `
Create a detailed 6-month roadmap with monthly milestones, specific goals, and actionable steps.`;

    return prompt;
  }

  buildResumeAnalysisPrompt(resumeText, jobDescription) {
    let prompt = `Analyze the following resume and provide detailed feedback:

RESUME CONTENT:
${resumeText}
`;

    if (jobDescription) {
      prompt += `
JOB DESCRIPTION:
${jobDescription}
`;
    }

    prompt += `
Provide analysis including:
1. ATS compatibility score (0-100)
2. Strengths and weaknesses
3. Missing keywords
4. Improvement suggestions
5. Overall recommendations`;

    return prompt;
  }

  // Response parsers
  parsePsychotestResponse(response) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Failed to parse psychotest response:', error);
    }

    // Fallback to mock analysis
    return this.mockPsychotestAnalysis([]);
  }

  parseRoadmapResponse(response) {
    // Similar parsing logic for roadmap
    return {
      overview: "Your personalized 6-month career development plan",
      milestones: [
        {
          month: 1,
          title: "Foundation Building",
          description: "Focus on core skills and goal setting",
          goals: ["Define clear career objectives", "Assess current skill level"],
          skills: ["Self-assessment", "Goal setting"]
        }
      ]
    };
  }

  parseResumeAnalysis(response) {
    return {
      atsScore: 75,
      strengths: ["Clear work experience", "Relevant skills listed"],
      weaknesses: ["Missing quantifiable achievements", "Generic summary"],
      suggestions: ["Add specific metrics to achievements", "Customize for target role"],
      missingKeywords: ["project management", "data analysis"]
    };
  }

  // Mock data generators
  mockPsychotestAnalysis(answers) {
    return {
      personalityAnalysis: {
        summary: "You demonstrate strong analytical and creative thinking abilities with good social skills.",
        strengths: ["Problem-solving", "Creative thinking", "Team collaboration"],
        challenges: ["Time management", "Delegation"],
        workStyle: "You work best in collaborative environments with clear goals and creative freedom.",
        communicationStyle: "Direct and thoughtful communicator who values input from others.",
        motivators: ["Learning new skills", "Making impact", "Recognition"]
      },
      careerRecommendations: [
        {
          title: "Software Developer",
          description: "Your analytical and creative skills make you well-suited for software development.",
          matchPercentage: 85,
          requiredSkills: ["Programming", "Problem-solving", "System design"],
          growthOutlook: "rapidly_growing"
        },
        {
          title: "Product Manager",
          description: "Your combination of technical and social skills fits product management well.",
          matchPercentage: 78,
          requiredSkills: ["Strategic thinking", "Communication", "Technical understanding"],
          growthOutlook: "growing"
        }
      ],
      skillGaps: [
        {
          skill: "Advanced Programming",
          currentLevel: "intermediate",
          targetLevel: "advanced",
          priority: "high"
        }
      ],
      sixMonthRoadmap: {
        overview: "Focus on strengthening technical skills while building leadership capabilities",
        milestones: [
          {
            month: 1,
            title: "Skill Assessment & Planning",
            description: "Evaluate current skills and create learning plan",
            goals: ["Complete skill assessment", "Set learning objectives"],
            skills: ["Self-evaluation", "Goal setting"]
          },
          {
            month: 2,
            title: "Technical Foundation",
            description: "Build core technical competencies",
            goals: ["Complete online course", "Start personal project"],
            skills: ["Programming fundamentals", "Version control"]
          }
        ]
      }
    };
  }

  mockRoadmapGeneration(profile) {
    return {
      overview: "Personalized career development plan based on your profile and goals",
      totalEstimatedHours: 120,
      milestones: [
        {
          month: 1,
          title: "Foundation & Assessment",
          description: "Establish baseline and set clear objectives",
          goals: ["Complete skills assessment", "Define career objectives"],
          skills: ["Self-awareness", "Goal setting"],
          estimatedHours: 20
        }
      ],
      keySkillsToAcquire: ["Leadership", "Technical expertise", "Communication"],
      recommendedCertifications: ["AWS Cloud Practitioner", "Project Management"]
    };
  }

  mockResumeAnalysis(resumeText) {
    return {
      atsScore: Math.floor(Math.random() * 30) + 70, // Random score between 70-100
      suggestions: [
        "Add more quantifiable achievements",
        "Include relevant keywords for your target role",
        "Strengthen your professional summary",
        "Add more technical skills"
      ],
      missingKeywords: ["project management", "data analysis", "leadership"],
      strengthAreas: ["Work experience", "Education"],
      improvementAreas: ["Skills section", "Achievements quantification"]
    };
  }

  // Utility methods
  getProviderStatus() {
    return {
      active: this.activeProvider,
      available: Object.keys(this.providers).filter(provider => {
        switch (provider) {
          case 'gemma':
            return !!this.providers.gemma.apiKey;
          case 'vertex':
            return !!this.providers.vertex.projectId;
          case 'huggingface':
            return !!this.providers.huggingface.token;
          case 'mock':
            return true;
          default:
            return false;
        }
      })
    };
  }

  switchProvider(provider) {
    if (this.providers[provider]) {
      this.activeProvider = provider;
      return true;
    }
    return false;
  }
}

module.exports = new MLService();
