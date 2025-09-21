import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Briefcase, 
  GraduationCap,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Target,
  Award,
  Clock,
  TrendingUp
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm, useFieldArray } from 'react-hook-form'
import { api } from '../lib/api'
import { useAuthStore } from '../stores/authStore'
import { formatDate, formatExperience, formatSkillLevel, cn } from '../lib/utils'
import toast from 'react-hot-toast'

const Profile = () => {
  const [activeTab, setActiveTab] = useState('personal')
  const [editingSection, setEditingSection] = useState(null)
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  // Fetch profile data
  const { data: profile, isLoading } = useQuery(
    'profile',
    () => api.get('/profiles/me').then(res => res.data.data),
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  )

  // Update profile mutation
  const updateProfileMutation = useMutation(
    (data) => api.put('/profiles/me', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('profile')
        setEditingSection(null)
        toast.success('Profile updated successfully')
      },
      onError: (error) => {
        toast.error('Failed to update profile')
      }
    }
  )

  // Add experience mutation
  const addExperienceMutation = useMutation(
    (data) => api.post('/profiles/me/experience', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('profile')
        setEditingSection(null)
        toast.success('Experience added successfully')
      }
    }
  )

  // Add education mutation
  const addEducationMutation = useMutation(
    (data) => api.post('/profiles/me/education', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('profile')
        setEditingSection(null)
        toast.success('Education added successfully')
      }
    }
  )

  // Add skill mutation
  const addSkillMutation = useMutation(
    (data) => api.post('/profiles/me/skills', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('profile')
        setEditingSection(null)
        toast.success('Skill added successfully')
      }
    }
  )

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Award },
    { id: 'goals', label: 'Career Goals', icon: Target },
  ]

  const skillCategories = [
    { value: 'technical', label: 'Technical' },
    { value: 'soft', label: 'Soft Skills' },
    { value: 'language', label: 'Languages' },
    { value: 'tool', label: 'Tools' },
    { value: 'framework', label: 'Frameworks' },
  ]

  const skillLevels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'expert', label: 'Expert' },
  ]

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="skeleton h-32 rounded-2xl mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="skeleton h-96 rounded-2xl"></div>
          <div className="lg:col-span-3 skeleton h-96 rounded-2xl"></div>
        </div>
      </div>
    )
  }

  const PersonalInfoSection = () => {
    const { register, handleSubmit, formState: { errors } } = useForm({
      defaultValues: {
        phone: profile?.phone || '',
        location: {
          city: profile?.location?.city || '',
          state: profile?.location?.state || '',
          country: profile?.location?.country || '',
        },
        currentRole: {
          title: profile?.currentRole?.title || '',
          company: profile?.currentRole?.company || '',
        }
      }
    })

    const onSubmit = (data) => {
      updateProfileMutation.mutate(data)
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Personal Information</h2>
          <button
            onClick={() => setEditingSection(editingSection === 'personal' ? null : 'personal')}
            className="btn-secondary"
          >
            {editingSection === 'personal' ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
          </button>
        </div>

        {editingSection === 'personal' ? (
          <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  {...register('phone')}
                  type="tel"
                  className="input"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  City
                </label>
                <input
                  {...register('location.city')}
                  type="text"
                  className="input"
                  placeholder="San Francisco"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  State/Province
                </label>
                <input
                  {...register('location.state')}
                  type="text"
                  className="input"
                  placeholder="California"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Country
                </label>
                <input
                  {...register('location.country')}
                  type="text"
                  className="input"
                  placeholder="United States"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Current Job Title
                </label>
                <input
                  {...register('currentRole.title')}
                  type="text"
                  className="input"
                  placeholder="Software Engineer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Current Company
                </label>
                <input
                  {...register('currentRole.company')}
                  type="text"
                  className="input"
                  placeholder="Tech Corp"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setEditingSection(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateProfileMutation.isLoading}
                className="btn-primary"
              >
                {updateProfileMutation.isLoading ? (
                  <div className="spinner w-4 h-4 mr-2"></div>
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="card space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className="text-gray-400">{profile?.currentRole?.title || 'No job title set'}</p>
                <p className="text-gray-500 text-sm">{profile?.currentRole?.company || 'No company set'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-gray-300">{user?.email}</span>
              </div>

              {profile?.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">{profile.phone}</span>
                </div>
              )}

              {profile?.location?.city && (
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">
                    {profile.location.city}, {profile.location.state}, {profile.location.country}
                  </span>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-gray-300">
                  Joined {formatDate(user?.createdAt, 'MMM yyyy')}
                </span>
              </div>
            </div>

            {/* Profile Completion */}
            <div className="bg-dark-700/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">Profile Completion</span>
                <span className="text-sm text-primary-400">{profile?.completionScore || 0}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${profile?.completionScore || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const ExperienceSection = () => {
    const { register, handleSubmit, control, reset } = useForm()

    const onSubmit = (data) => {
      addExperienceMutation.mutate(data)
      reset()
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Work Experience</h2>
          <button
            onClick={() => setEditingSection(editingSection === 'experience' ? null : 'experience')}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Experience
          </button>
        </div>

        {editingSection === 'experience' && (
          <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6">
            <h3 className="text-lg font-semibold text-white">Add Work Experience</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Job Title *
                </label>
                <input
                  {...register('title', { required: true })}
                  type="text"
                  className="input"
                  placeholder="Software Engineer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Company *
                </label>
                <input
                  {...register('company', { required: true })}
                  type="text"
                  className="input"
                  placeholder="Tech Corp"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Start Date *
                </label>
                <input
                  {...register('startDate', { required: true })}
                  type="date"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  End Date
                </label>
                <input
                  {...register('endDate')}
                  type="date"
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  {...register('isCurrentRole')}
                  type="checkbox"
                  className="rounded border-dark-600 bg-dark-800 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-gray-300">This is my current role</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="input"
                placeholder="Describe your role and responsibilities..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setEditingSection(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addExperienceMutation.isLoading}
                className="btn-primary"
              >
                {addExperienceMutation.isLoading ? (
                  <div className="spinner w-4 h-4 mr-2"></div>
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Add Experience
              </button>
            </div>
          </form>
        )}

        {/* Experience List */}
        <div className="space-y-4">
          {profile?.experience?.length > 0 ? (
            profile.experience.map((exp, index) => (
              <motion.div
                key={exp._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{exp.title}</h3>
                      {exp.isCurrentRole && (
                        <span className="badge-success">Current</span>
                      )}
                    </div>
                    <p className="text-primary-400 font-medium mb-2">{exp.company}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                      <span>{formatDate(exp.startDate, 'MMM yyyy')}</span>
                      <span>-</span>
                      <span>{exp.endDate ? formatDate(exp.endDate, 'MMM yyyy') : 'Present'}</span>
                      <span>•</span>
                      <span>{formatExperience(exp.startDate, exp.endDate)}</span>
                    </div>
                    {exp.description && (
                      <p className="text-gray-300 text-sm">{exp.description}</p>
                    )}
                  </div>
                  <button className="p-2 text-gray-400 hover:text-gray-200 transition-colors">
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="card text-center py-12">
              <Briefcase className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">No work experience added</h3>
              <p className="text-gray-500 mb-4">Add your work experience to showcase your career journey</p>
              <button
                onClick={() => setEditingSection('experience')}
                className="btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Experience
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  const SkillsSection = () => {
    const { register, handleSubmit, reset } = useForm()

    const onSubmit = (data) => {
      addSkillMutation.mutate(data)
      reset()
    }

    const groupedSkills = profile?.skills?.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = []
      }
      acc[skill.category].push(skill)
      return acc
    }, {}) || {}

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Skills</h2>
          <button
            onClick={() => setEditingSection(editingSection === 'skills' ? null : 'skills')}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Skill
          </button>
        </div>

        {editingSection === 'skills' && (
          <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6">
            <h3 className="text-lg font-semibold text-white">Add New Skill</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Skill Name *
                </label>
                <input
                  {...register('name', { required: true })}
                  type="text"
                  className="input"
                  placeholder="React, Python, Leadership..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  {...register('category', { required: true })}
                  className="input"
                >
                  <option value="">Select category</option>
                  {skillCategories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Proficiency Level *
                </label>
                <select
                  {...register('level', { required: true })}
                  className="input"
                >
                  <option value="">Select level</option>
                  {skillLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Years of Experience
              </label>
              <input
                {...register('yearsOfExperience')}
                type="number"
                min="0"
                max="50"
                className="input"
                placeholder="3"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setEditingSection(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addSkillMutation.isLoading}
                className="btn-primary"
              >
                {addSkillMutation.isLoading ? (
                  <div className="spinner w-4 h-4 mr-2"></div>
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Add Skill
              </button>
            </div>
          </form>
        )}

        {/* Skills Display */}
        {Object.keys(groupedSkills).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedSkills).map(([category, skills]) => (
              <div key={category} className="card">
                <h3 className="text-lg font-semibold text-white mb-4 capitalize">
                  {category.replace('_', ' ')} Skills
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {skills.map((skill, index) => {
                    const levelInfo = formatSkillLevel(skill.level)
                    return (
                      <motion.div
                        key={skill._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium text-white">{skill.name}</h4>
                          <div className="flex items-center space-x-2 text-sm">
                            <span className={levelInfo.color}>{levelInfo.label}</span>
                            {skill.yearsOfExperience && (
                              <>
                                <span className="text-gray-500">•</span>
                                <span className="text-gray-400">
                                  {skill.yearsOfExperience} years
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <button className="p-1 text-gray-400 hover:text-gray-200 transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <Award className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No skills added</h3>
            <p className="text-gray-500 mb-4">Add your skills to showcase your expertise</p>
            <button
              onClick={() => setEditingSection('skills')}
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Skill
            </button>
          </div>
        )}
      </div>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return <PersonalInfoSection />
      case 'experience':
        return <ExperienceSection />
      case 'skills':
        return <SkillsSection />
      default:
        return <PersonalInfoSection />
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="card mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
            <p className="text-gray-400">
              Manage your personal information and career details
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-400">Profile Completion</div>
              <div className="text-2xl font-bold text-primary-400">
                {profile?.completionScore || 0}%
              </div>
            </div>
            <div className="w-16 h-16 relative">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-dark-600"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-primary-500"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${profile?.completionScore || 0}, 100`}
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-0 overflow-hidden">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors',
                      activeTab === tab.id
                        ? 'bg-primary-600/20 text-primary-400 border-r-2 border-primary-500'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-dark-800/50'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default Profile
