import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, 
  Download, 
  Share2, 
  Edit3, 
  Plus, 
  Upload,
  Eye,
  Trash2,
  Copy,
  CheckCircle,
  AlertCircle,
  Zap,
  Palette,
  Settings,
  Save
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import { useDropzone } from 'react-dropzone'
import { api } from '../lib/api'
import { formatDate, formatFileSize, cn } from '../lib/utils'
import toast from 'react-hot-toast'

const Resume = () => {
  const { resumeId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const [activeTab, setActiveTab] = useState('builder')
  const [editingSection, setEditingSection] = useState(null)
  const [selectedTemplate, setSelectedTemplate] = useState('modern')
  const [uploadProgress, setUploadProgress] = useState(0)

  // Dummy resumes data for immediate display
  const resumes = [
    {
      _id: '1',
      title: 'Senior Developer Resume',
      version: 2,
      updatedAt: new Date().toISOString(),
      aiAnalysis: { atsScore: 92 },
      settings: { template: 'modern', colorScheme: 'blue' }
    },
    {
      _id: '2',
      title: 'Product Manager Resume',
      version: 1,
      updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      aiAnalysis: { atsScore: 87 },
      settings: { template: 'classic', colorScheme: 'green' }
    },
    {
      _id: '3',
      title: 'Data Scientist Resume',
      version: 3,
      updatedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      aiAnalysis: { atsScore: 95 },
      settings: { template: 'creative', colorScheme: 'purple' }
    }
  ]

  // Dummy current resume data
  const currentResume = resumeId ? {
    _id: resumeId,
    title: 'Senior Full-Stack Developer Resume',
    version: 2,
    updatedAt: new Date().toISOString(),
    personalInfo: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      linkedin: 'linkedin.com/in/johndoe',
      github: 'github.com/johndoe',
      website: 'johndoe.dev'
    },
    summary: 'Experienced Full-Stack Developer with 8+ years of expertise in building scalable web applications. Proficient in React, Node.js, and cloud technologies. Passionate about creating elegant solutions to complex problems and mentoring junior developers.',
    experience: [
      {
        _id: 'exp1',
        title: 'Senior Full-Stack Developer',
        company: 'Tech Innovation Inc.',
        location: 'San Francisco, CA',
        startDate: '2022-01-01',
        current: true,
        description: '• Led development of microservices architecture serving 1M+ users\n• Mentored team of 5 junior developers\n• Improved application performance by 40%\n• Implemented CI/CD pipeline reducing deployment time by 60%',
        highlights: ['React', 'Node.js', 'AWS', 'Docker', 'MongoDB']
      },
      {
        _id: 'exp2',
        title: 'Full-Stack Developer',
        company: 'StartupXYZ',
        location: 'Remote',
        startDate: '2019-06-01',
        endDate: '2021-12-31',
        description: '• Developed RESTful APIs handling 10K+ requests/day\n• Built responsive web applications using React and Redux\n• Collaborated with design team to implement pixel-perfect UIs\n• Optimized database queries reducing load time by 50%',
        highlights: ['React', 'Express.js', 'PostgreSQL', 'Redux']
      },
      {
        _id: 'exp3',
        title: 'Junior Developer',
        company: 'Digital Solutions Co.',
        location: 'New York, NY',
        startDate: '2017-07-01',
        endDate: '2019-05-31',
        description: '• Built and maintained client websites\n• Implemented new features based on client requirements\n• Fixed bugs and improved code quality\n• Participated in code reviews and agile ceremonies',
        highlights: ['JavaScript', 'HTML/CSS', 'Git', 'Agile']
      }
    ],
    education: [
      {
        _id: 'edu1',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        institution: 'University of California, Berkeley',
        location: 'Berkeley, CA',
        startDate: '2013-09-01',
        endDate: '2017-05-31',
        gpa: '3.8',
        achievements: ['Dean\'s List (3 years)', 'Computer Science Award 2017', 'ACM President']
      }
    ],
    skills: {
      technical: [
        { name: 'JavaScript/TypeScript', level: 'expert' },
        { name: 'React.js', level: 'expert' },
        { name: 'Node.js', level: 'expert' },
        { name: 'Python', level: 'advanced' },
        { name: 'MongoDB', level: 'advanced' },
        { name: 'PostgreSQL', level: 'advanced' },
        { name: 'AWS', level: 'intermediate' },
        { name: 'Docker/Kubernetes', level: 'intermediate' }
      ],
      soft: [
        'Leadership',
        'Communication',
        'Problem Solving',
        'Team Collaboration',
        'Project Management'
      ]
    },
    projects: [
      {
        _id: 'proj1',
        name: 'E-Commerce Platform',
        description: 'Full-stack MERN application with payment integration',
        technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
        link: 'github.com/johndoe/ecommerce'
      },
      {
        _id: 'proj2',
        name: 'AI Chatbot Assistant',
        description: 'Intelligent chatbot using OpenAI API and NLP',
        technologies: ['Python', 'FastAPI', 'OpenAI', 'React'],
        link: 'github.com/johndoe/ai-chatbot'
      }
    ],
    certifications: [
      {
        name: 'AWS Certified Solutions Architect',
        issuer: 'Amazon Web Services',
        date: '2023-06-01'
      },
      {
        name: 'MongoDB Certified Developer',
        issuer: 'MongoDB University',
        date: '2022-11-01'
      }
    ],
    settings: {
      template: 'modern',
      colorScheme: 'blue'
    },
    fileInfo: {
      originalName: 'John_Doe_Resume.pdf',
      fileSize: 245760,
      uploadedAt: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    aiAnalysis: {
      atsScore: 92,
      lastAnalyzed: new Date(Date.now() - 3600000 * 2).toISOString(),
      strengthAreas: [
        'Clear and concise professional summary',
        'Quantified achievements with metrics',
        'Relevant technical skills well-highlighted',
        'Strong action verbs used throughout',
        'Consistent formatting and structure'
      ],
      improvementAreas: [
        'Add more specific project outcomes',
        'Include industry-specific keywords',
        'Add volunteer or leadership activities'
      ],
      suggestions: [
        'Consider adding more quantifiable metrics to your achievements (e.g., "increased revenue by X%")',
        'Include keywords like "microservices", "scalable architecture", and "cloud-native" to improve ATS score',
        'Add a skills section with proficiency levels for each technology',
        'Consider adding relevant certifications or training courses',
        'Include links to your portfolio or GitHub projects'
      ],
      keywords: [
        'Full-Stack Development',
        'React.js',
        'Node.js',
        'Cloud Computing',
        'Microservices',
        'Agile/Scrum',
        'Leadership',
        'Team Management'
      ]
    }
  } : null

  // Create resume mutation
  const createResumeMutation = useMutation(
    (data) => api.post('/resumes', data),
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries('resumes')
        navigate(`/app/resume/${response.data.data._id}`)
        toast.success('Resume created successfully')
      }
    }
  )

  // Update resume mutation
  const updateResumeMutation = useMutation(
    ({ id, data }) => api.put(`/resumes/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['resume', resumeId])
        queryClient.invalidateQueries('resumes')
        setEditingSection(null)
        toast.success('Resume updated successfully')
      }
    }
  )

  // Upload resume mutation
  const uploadResumeMutation = useMutation(
    ({ id, file }) => {
      const formData = new FormData()
      formData.append('resume', file)
      return api.post(`/resumes/${id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(progress)
        }
      })
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['resume', resumeId])
        setUploadProgress(0)
        toast.success('Resume uploaded and analyzed successfully')
      },
      onError: () => {
        setUploadProgress(0)
        toast.error('Failed to upload resume')
      }
    }
  )

  // Generate resume mutation
  const generateResumeMutation = useMutation(
    ({ id, format }) => api.post(`/resumes/${id}/generate`, { format }),
    {
      onSuccess: (response) => {
        const { downloadUrl } = response.data.data
        window.open(downloadUrl, '_blank')
        toast.success('Resume generated successfully')
      }
    }
  )

  const templates = [
    { id: 'modern', name: 'Modern', preview: '/templates/modern.png' },
    { id: 'classic', name: 'Classic', preview: '/templates/classic.png' },
    { id: 'creative', name: 'Creative', preview: '/templates/creative.png' },
    { id: 'minimal', name: 'Minimal', preview: '/templates/minimal.png' },
  ]

  const colorSchemes = [
    { id: 'blue', name: 'Blue', color: 'bg-blue-500' },
    { id: 'green', name: 'Green', color: 'bg-green-500' },
    { id: 'purple', name: 'Purple', color: 'bg-purple-500' },
    { id: 'red', name: 'Red', color: 'bg-red-500' },
    { id: 'orange', name: 'Orange', color: 'bg-orange-500' },
    { id: 'gray', name: 'Gray', color: 'bg-gray-500' },
  ]

  // File drop zone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0 && resumeId) {
        uploadResumeMutation.mutate({
          id: resumeId,
          file: acceptedFiles[0]
        })
      }
    }
  })

  const handleCreateResume = () => {
    createResumeMutation.mutate({
      title: 'My Resume',
      settings: {
        template: selectedTemplate,
        colorScheme: 'blue'
      }
    })
  }

  const handleGenerateResume = (format) => {
    if (resumeId) {
      generateResumeMutation.mutate({ id: resumeId, format })
    }
  }

  const ResumeBuilder = () => {
    const { register, handleSubmit } = useForm({
      defaultValues: {
        personalInfo: currentResume?.personalInfo || {},
        summary: currentResume?.summary || '',
        settings: currentResume?.settings || {}
      }
    })

    const onSubmit = (data) => {
      if (resumeId) {
        updateResumeMutation.mutate({ id: resumeId, data })
      }
    }

    return (
      <div className="space-y-8">
        {/* Personal Information */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Personal Information</h3>
            <button
              onClick={() => setEditingSection(editingSection === 'personal' ? null : 'personal')}
              className="btn-secondary"
            >
              {editingSection === 'personal' ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
            </button>
          </div>

          {editingSection === 'personal' ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    First Name
                  </label>
                  <input
                    {...register('personalInfo.firstName')}
                    type="text"
                    className="input"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Last Name
                  </label>
                  <input
                    {...register('personalInfo.lastName')}
                    type="text"
                    className="input"
                    placeholder="Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    {...register('personalInfo.email')}
                    type="email"
                    className="input"
                    placeholder="john.doe@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone
                  </label>
                  <input
                    {...register('personalInfo.phone')}
                    type="tel"
                    className="input"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Professional Summary
                </label>
                <textarea
                  {...register('summary')}
                  rows={4}
                  className="input"
                  placeholder="Write a compelling summary of your professional background..."
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={updateResumeMutation.isLoading}
                  className="btn-primary"
                >
                  {updateResumeMutation.isLoading ? (
                    <div className="spinner w-4 h-4 mr-2"></div>
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-400">Name:</span>
                  <p className="text-white">
                    {currentResume?.personalInfo?.firstName} {currentResume?.personalInfo?.lastName || 'Not set'}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Email:</span>
                  <p className="text-white">{currentResume?.personalInfo?.email || 'Not set'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Phone:</span>
                  <p className="text-white">{currentResume?.personalInfo?.phone || 'Not set'}</p>
                </div>
              </div>
              {currentResume?.summary && (
                <div>
                  <span className="text-sm text-gray-400">Summary:</span>
                  <p className="text-white mt-1">{currentResume.summary}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Template & Design */}
        <div className="card">
          <h3 className="text-xl font-bold text-white mb-6">Template & Design</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Choose Template</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={cn(
                      'p-4 rounded-lg border-2 transition-all',
                      selectedTemplate === template.id
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-dark-600 bg-dark-700/30 hover:border-dark-500'
                    )}
                  >
                    <div className="aspect-[3/4] bg-dark-600 rounded mb-2 flex items-center justify-center">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-sm text-white">{template.name}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Color Scheme</h4>
              <div className="flex flex-wrap gap-3">
                {colorSchemes.map((scheme) => (
                  <button
                    key={scheme.id}
                    className={cn(
                      'flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors',
                      currentResume?.settings?.colorScheme === scheme.id
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-dark-600 hover:border-dark-500'
                    )}
                  >
                    <div className={cn('w-4 h-4 rounded-full', scheme.color)}></div>
                    <span className="text-sm text-white">{scheme.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div className="card">
          <h3 className="text-xl font-bold text-white mb-6">Upload Existing Resume</h3>
          
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
              isDragActive
                ? 'border-primary-500 bg-primary-500/10'
                : 'border-dark-600 hover:border-dark-500'
            )}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            {uploadProgress > 0 ? (
              <div className="space-y-2">
                <p className="text-white">Uploading... {uploadProgress}%</p>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-white mb-2">
                  {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume here'}
                </p>
                <p className="text-gray-400 text-sm">
                  Supports PDF, DOC, DOCX files up to 10MB
                </p>
              </div>
            )}
          </div>

          {currentResume?.fileInfo && (
            <div className="mt-4 p-4 bg-dark-700/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{currentResume.fileInfo.originalName}</p>
                  <p className="text-gray-400 text-sm">
                    {formatFileSize(currentResume.fileInfo.fileSize)} • 
                    Uploaded {formatDate(currentResume.fileInfo.uploadedAt)}
                  </p>
                </div>
                <CheckCircle className="w-5 h-5 text-success-400" />
              </div>
            </div>
          )}
        </div>

        {/* Experience */}
        {currentResume?.experience && currentResume.experience.length > 0 && (
          <div className="card">
            <h3 className="text-xl font-bold text-white mb-6">Work Experience</h3>
            <div className="space-y-6">
              {currentResume.experience.map((exp) => (
                <div key={exp._id} className="border-l-2 border-primary-500 pl-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-lg font-semibold text-white">{exp.title}</h4>
                      <p className="text-primary-400">{exp.company}</p>
                      <p className="text-gray-400 text-sm">{exp.location}</p>
                    </div>
                    <span className="text-sm text-gray-400">
                      {new Date(exp.startDate).getFullYear()} - {exp.current ? 'Present' : new Date(exp.endDate).getFullYear()}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm whitespace-pre-line mb-3">{exp.description}</p>
                  {exp.highlights && exp.highlights.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {exp.highlights.map((highlight, idx) => (
                        <span key={idx} className="px-2 py-1 bg-primary-500/10 text-primary-400 text-xs rounded border border-primary-500/20">
                          {highlight}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {currentResume?.education && currentResume.education.length > 0 && (
          <div className="card">
            <h3 className="text-xl font-bold text-white mb-6">Education</h3>
            <div className="space-y-6">
              {currentResume.education.map((edu) => (
                <div key={edu._id} className="border-l-2 border-success-500 pl-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-lg font-semibold text-white">{edu.degree} in {edu.field}</h4>
                      <p className="text-success-400">{edu.institution}</p>
                      <p className="text-gray-400 text-sm">{edu.location}</p>
                    </div>
                    <span className="text-sm text-gray-400">
                      {new Date(edu.startDate).getFullYear()} - {new Date(edu.endDate).getFullYear()}
                    </span>
                  </div>
                  {edu.gpa && (
                    <p className="text-gray-300 text-sm mb-2">GPA: {edu.gpa}</p>
                  )}
                  {edu.achievements && edu.achievements.length > 0 && (
                    <ul className="space-y-1">
                      {edu.achievements.map((achievement, idx) => (
                        <li key={idx} className="text-sm text-gray-300 flex items-start">
                          <CheckCircle className="w-4 h-4 text-success-400 mr-2 mt-0.5 flex-shrink-0" />
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {currentResume?.skills && (
          <div className="card">
            <h3 className="text-xl font-bold text-white mb-6">Skills</h3>
            <div className="space-y-6">
              {currentResume.skills.technical && currentResume.skills.technical.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Technical Skills</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentResume.skills.technical.map((skill, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg">
                        <span className="text-white">{skill.name}</span>
                        <span className={cn(
                          'px-2 py-1 text-xs rounded border',
                          skill.level === 'expert' && 'bg-success-500/20 text-success-400 border-success-500/30',
                          skill.level === 'advanced' && 'bg-primary-500/20 text-primary-400 border-primary-500/30',
                          skill.level === 'intermediate' && 'bg-warning-500/20 text-warning-400 border-warning-500/30'
                        )}>
                          {skill.level}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {currentResume.skills.soft && currentResume.skills.soft.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Soft Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentResume.skills.soft.map((skill, idx) => (
                      <span key={idx} className="px-3 py-2 bg-accent-500/10 text-accent-400 text-sm rounded-lg border border-accent-500/20">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Projects */}
        {currentResume?.projects && currentResume.projects.length > 0 && (
          <div className="card">
            <h3 className="text-xl font-bold text-white mb-6">Featured Projects</h3>
            <div className="space-y-4">
              {currentResume.projects.map((project) => (
                <div key={project._id} className="p-4 bg-dark-700/30 rounded-lg border border-dark-600/30">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-lg font-semibold text-white">{project.name}</h4>
                    {project.link && (
                      <a href={`https://${project.link}`} target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300">
                        <Share2 className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm mb-3">{project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, idx) => (
                      <span key={idx} className="px-2 py-1 bg-primary-500/10 text-primary-400 text-xs rounded border border-primary-500/20">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {currentResume?.certifications && currentResume.certifications.length > 0 && (
          <div className="card">
            <h3 className="text-xl font-bold text-white mb-6">Certifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentResume.certifications.map((cert, idx) => (
                <div key={idx} className="flex items-start space-x-3 p-4 bg-dark-700/30 rounded-lg border border-dark-600/30">
                  <div className="w-10 h-10 bg-gradient-to-br from-warning-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{cert.name}</h4>
                    <p className="text-gray-400 text-sm">{cert.issuer}</p>
                    <p className="text-gray-500 text-xs">{new Date(cert.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Analysis */}
        {currentResume?.aiAnalysis && (
          <div className="card">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">AI Analysis</h3>
                <p className="text-gray-400 text-sm">
                  Last analyzed {formatDate(currentResume.aiAnalysis.lastAnalyzed)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-400 mb-2">
                  {currentResume.aiAnalysis.atsScore || 0}%
                </div>
                <p className="text-gray-400">ATS Score</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-success-400 mb-2">
                  {currentResume.aiAnalysis.strengthAreas?.length || 0}
                </div>
                <p className="text-gray-400">Strengths</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-warning-400 mb-2">
                  {currentResume.aiAnalysis.improvementAreas?.length || 0}
                </div>
                <p className="text-gray-400">Improvements</p>
              </div>
            </div>

            {/* Strength Areas */}
            {currentResume.aiAnalysis.strengthAreas?.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <CheckCircle className="w-5 h-5 text-success-400 mr-2" />
                  Strengths
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentResume.aiAnalysis.strengthAreas.map((strength, index) => (
                    <div key={index} className="flex items-start space-x-2 p-3 bg-success-500/10 rounded-lg border border-success-500/30">
                      <CheckCircle className="w-4 h-4 text-success-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-300 text-sm">{strength}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Improvement Areas */}
            {currentResume.aiAnalysis.improvementAreas?.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <AlertCircle className="w-5 h-5 text-warning-400 mr-2" />
                  Areas for Improvement
                </h4>
                <div className="space-y-2">
                  {currentResume.aiAnalysis.improvementAreas.map((area, index) => (
                    <div key={index} className="flex items-start space-x-2 p-3 bg-warning-500/10 rounded-lg border border-warning-500/30">
                      <AlertCircle className="w-4 h-4 text-warning-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-300 text-sm">{area}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Keywords */}
            {currentResume.aiAnalysis.keywords?.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-white mb-3">Detected Keywords</h4>
                <div className="flex flex-wrap gap-2">
                  {currentResume.aiAnalysis.keywords.map((keyword, index) => (
                    <span key={index} className="px-3 py-2 bg-primary-500/10 text-primary-400 text-sm rounded-lg border border-primary-500/20">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* AI Suggestions */}
            {currentResume.aiAnalysis.suggestions?.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <Zap className="w-5 h-5 text-purple-400 mr-2" />
                  AI Suggestions
                </h4>
                <div className="space-y-2">
                  {currentResume.aiAnalysis.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                      <Zap className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-300 text-sm">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  const ResumesList = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">My Resumes</h2>
        <button
          onClick={handleCreateResume}
          className="btn-primary"
          disabled={createResumeMutation.isLoading}
        >
          {createResumeMutation.isLoading ? (
            <div className="spinner w-4 h-4 mr-2"></div>
          ) : (
            <Plus className="w-4 h-4 mr-2" />
          )}
          Create New Resume
        </button>
      </div>

      {resumes.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No resumes yet</h3>
          <p className="text-gray-400 mb-6">Create your first resume to get started</p>
          <button
            onClick={handleCreateResume}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Resume
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume, index) => (
            <motion.div
              key={resume._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card-hover cursor-pointer"
              onClick={() => navigate(`/app/resume/${resume._id}`)}
            >
              <div className="aspect-[3/4] bg-dark-700 rounded-lg mb-4 flex items-center justify-center">
                <FileText className="w-12 h-12 text-gray-400" />
              </div>
              
              <h3 className="text-lg font-semibold text-white mb-2">{resume.title}</h3>
              
              <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                <span>Updated {formatDate(resume.updatedAt)}</span>
                <span>v{resume.version}</span>
              </div>

              {resume.aiAnalysis?.atsScore && (
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-sm text-gray-400">ATS Score:</span>
                  <span className="text-sm font-medium text-primary-400">
                    {resume.aiAnalysis.atsScore}%
                  </span>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleGenerateResume('pdf')
                  }}
                  className="btn-secondary text-xs flex-1"
                >
                  <Download className="w-3 h-3 mr-1" />
                  PDF
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    // Handle share
                  }}
                  className="btn-secondary text-xs flex-1"
                >
                  <Share2 className="w-3 h-3 mr-1" />
                  Share
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )

  if (!resumeId) {
    return <ResumesList />
  }

  // Removed loading skeleton - show content immediately

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="card mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {currentResume?.title || 'Resume Builder'}
            </h1>
            <p className="text-gray-400">
              Create and customize your professional resume
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleGenerateResume('pdf')}
              disabled={generateResumeMutation.isLoading}
              className="btn-secondary"
            >
              {generateResumeMutation.isLoading ? (
                <div className="spinner w-4 h-4 mr-2"></div>
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Download PDF
            </button>
            
            <button className="btn-secondary">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </button>
            
            <button className="btn-primary">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Resume Builder */}
      <ResumeBuilder />
    </div>
  )
}

export default Resume
