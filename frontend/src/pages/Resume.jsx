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

  // Fetch resumes list
  const { data: resumes = [], isLoading: resumesLoading } = useQuery(
    'resumes',
    () => api.get('/resumes').then(res => res.data.data),
    {
      staleTime: 2 * 60 * 1000,
    }
  )

  // Fetch current resume
  const { data: currentResume, isLoading: resumeLoading } = useQuery(
    ['resume', resumeId],
    () => resumeId ? api.get(`/resumes/${resumeId}`).then(res => res.data.data) : null,
    {
      enabled: !!resumeId,
      staleTime: 30 * 1000,
    }
  )

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

            {currentResume.aiAnalysis.suggestions?.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Suggestions</h4>
                <div className="space-y-2">
                  {currentResume.aiAnalysis.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-dark-700/30 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-warning-400 mt-0.5 flex-shrink-0" />
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

      {resumesLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton h-64 rounded-2xl"></div>
          ))}
        </div>
      ) : resumes.length === 0 ? (
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

  if (resumeLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="skeleton h-32 rounded-2xl mb-8"></div>
        <div className="skeleton h-96 rounded-2xl"></div>
      </div>
    )
  }

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
