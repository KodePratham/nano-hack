'use client'
import { useState, useEffect } from 'react'

interface UserProfile {
  name: string
  industry: string
  goal: string
  brandPersonality: string[]
  visualStyle: string
  targetAudience: string[]
  postTypes: string[]
  businessDescription: string
  logo?: string
  completedAt: string
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [otherInputs, setOtherInputs] = useState({
    industry: '',
    goal: '',
    targetAudience: ''
  })

  useEffect(() => {
    // Load user profile from localStorage
    const savedProfile = localStorage.getItem('postMachineProfile')
    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile)
      setProfile(parsedProfile)
      setEditedProfile({ ...parsedProfile })
    }
  }, [])

  const handleEditToggle = () => {
    if (isEditing && profile) {
      // Cancel editing - restore original profile
      setEditedProfile({ ...profile })
      setOtherInputs({ industry: '', goal: '', targetAudience: '' })
      setLogoFile(null)
    }
    setIsEditing(!isEditing)
  }

  const handleSaveProfile = () => {
    if (editedProfile) {
      localStorage.setItem('postMachineProfile', JSON.stringify(editedProfile))
      setProfile({ ...editedProfile })
      setIsEditing(false)
      setOtherInputs({ industry: '', goal: '', targetAudience: '' })
      setLogoFile(null)
    }
  }

  const handleInputChange = (field: string, value: string | string[]) => {
    if (editedProfile) {
      setEditedProfile(prev => prev ? {
        ...prev,
        [field]: value
      } : null)
    }
  }

  const handlePersonalityToggle = (personality: string) => {
    if (editedProfile) {
      setEditedProfile(prev => prev ? {
        ...prev,
        brandPersonality: prev.brandPersonality.includes(personality)
          ? prev.brandPersonality.filter(p => p !== personality)
          : prev.brandPersonality.length < 3
          ? [...prev.brandPersonality, personality]
          : prev.brandPersonality
      } : null)
    }
  }

  const handleTargetAudienceToggle = (audience: string) => {
    if (editedProfile) {
      if (audience === 'Other') {
        setEditedProfile(prev => prev ? {
          ...prev,
          targetAudience: prev.targetAudience.includes('Other')
            ? prev.targetAudience.filter(a => a !== 'Other')
            : [...prev.targetAudience.filter(a => a !== 'Other'), 'Other']
        } : null)
      } else {
        setEditedProfile(prev => prev ? {
          ...prev,
          targetAudience: prev.targetAudience.includes(audience)
            ? prev.targetAudience.filter(a => a !== audience)
            : [...prev.targetAudience, audience]
        } : null)
      }
    }
  }

  const handlePostTypeToggle = (postType: string) => {
    if (editedProfile) {
      setEditedProfile(prev => prev ? {
        ...prev,
        postTypes: prev.postTypes.includes(postType)
          ? prev.postTypes.filter(p => p !== postType)
          : prev.postTypes.length < 3
          ? [...prev.postTypes, postType]
          : prev.postTypes
      } : null)
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && editedProfile) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        const base64 = event.target?.result as string
        setEditedProfile(prev => prev ? {
          ...prev,
          logo: base64
        } : null)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleOtherInput = (field: string, value: string) => {
    setOtherInputs(prev => ({
      ...prev,
      [field]: value
    }))
    
    if (editedProfile) {
      if (field === 'targetAudience') {
        setEditedProfile(prev => prev ? {
          ...prev,
          targetAudience: prev.targetAudience.includes('Other')
            ? prev.targetAudience.map(a => a === 'Other' ? value : a)
            : [...prev.targetAudience.filter(a => a !== 'Other'), value]
        } : null)
      } else {
        setEditedProfile(prev => prev ? {
          ...prev,
          [field]: value
        } : null)
      }
    }
  }

  const industries = [
    'Food & Beverage', 'Fashion & Beauty', 'Health & Fitness', 'Technology & Software',
    'Retail & E-commerce', 'Education & Coaching', 'Entertainment & Media', 'Other'
  ]

  const goals = [
    'Build brand awareness', 'Drive sales or leads', 'Showcase products/services',
    'Educate or share expertise', 'Build community & engagement', 'Other'
  ]

  const personalities = [
    'Professional', 'Friendly', 'Playful', 'Bold', 'Minimalist', 'Elegant', 'Innovative', 'Fun & quirky'
  ]

  const visualStyles = [
    'Clean & minimalist', 'Vibrant & energetic', 'Modern & techy', 'Elegant & premium', 'Fun & creative'
  ]

  const targetAudiences = [
    'Gen Z (under 25)', 'Millennials (25–40)', 'Gen X (40–55)', 'Parents & families',
    'Small business owners', 'Professionals & executives', 'Fitness/wellness enthusiasts', 'Other'
  ]

  const postTypes = [
    'Product highlights', 'Promotions/discounts', 'Tips & educational posts',
    'Lifestyle/inspirational', 'Behind-the-scenes', 'Quotes & mottos', 'Memes & fun posts'
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-normal">
              <span className="text-blue-500">Post</span>
              <span className="text-red-500">Machine</span>
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600 text-sm">Welcome, {profile?.name || 'User'}!</span>
            <a
              href="/"
              className="text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-md transition-colors"
            >
              Home
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Coming Soon Section */}
        <div className="text-center mb-12">
          <div className="mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-white text-4xl">🚀</span>
            </div>
            <h1 className="text-4xl font-light text-gray-900 mb-4">
              Dashboard Coming Soon
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're building something amazing for you! Your personalized dashboard will be ready soon.
            </p>
          </div>

          {/* Profile Section */}
          {profile && editedProfile && (
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8 text-left max-w-4xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Your Profile</h2>
                <div className="flex space-x-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSaveProfile}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={handleEditToggle}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleEditToggle}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>
              
              {!isEditing ? (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name/Business</p>
                    <p className="font-medium text-gray-900">{profile.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Industry</p>
                    <p className="font-medium text-gray-900">{profile.industry}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Goal</p>
                    <p className="font-medium text-gray-900">{profile.goal}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Visual Style</p>
                    <p className="font-medium text-gray-900">{profile.visualStyle}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">Brand Personality</p>
                    <p className="font-medium text-gray-900">{profile.brandPersonality.join(', ')}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">Target Audience</p>
                    <p className="font-medium text-gray-900">{profile.targetAudience.join(', ')}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">Content Types</p>
                    <p className="font-medium text-gray-900">{profile.postTypes.join(', ')}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">Business Description</p>
                    <p className="font-medium text-gray-900">{profile.businessDescription}</p>
                  </div>
                  {profile.logo && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500">Logo</p>
                      <img src={profile.logo} alt="Business logo" className="w-16 h-16 object-contain border rounded mt-2" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name/Business</label>
                    <input
                      type="text"
                      value={editedProfile.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  {/* Industry */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {industries.map((industry) => (
                        <button
                          key={industry}
                          onClick={() => handleInputChange('industry', industry)}
                          className={`p-2 text-sm rounded-md border transition-colors ${
                            editedProfile.industry === industry
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {industry}
                        </button>
                      ))}
                    </div>
                    {editedProfile.industry === 'Other' && (
                      <input
                        type="text"
                        placeholder="Specify your industry"
                        value={otherInputs.industry}
                        onChange={(e) => handleOtherInput('industry', e.target.value)}
                        className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    )}
                  </div>

                  {/* Goal */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Main Goal</label>
                    <div className="space-y-2">
                      {goals.map((goal) => (
                        <button
                          key={goal}
                          onClick={() => handleInputChange('goal', goal)}
                          className={`w-full p-2 text-sm text-left rounded-md border transition-colors ${
                            editedProfile.goal === goal
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {goal}
                        </button>
                      ))}
                    </div>
                    {editedProfile.goal === 'Other' && (
                      <input
                        type="text"
                        placeholder="Specify your goal"
                        value={otherInputs.goal}
                        onChange={(e) => handleOtherInput('goal', e.target.value)}
                        className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    )}
                  </div>

                  {/* Brand Personality */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Brand Personality (up to 3)</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {personalities.map((personality) => (
                        <button
                          key={personality}
                          onClick={() => handlePersonalityToggle(personality)}
                          disabled={!editedProfile.brandPersonality.includes(personality) && editedProfile.brandPersonality.length >= 3}
                          className={`p-2 text-sm rounded-md border transition-colors ${
                            editedProfile.brandPersonality.includes(personality)
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300 disabled:opacity-50'
                          }`}
                        >
                          {personality}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Target Audience */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {targetAudiences.map((audience) => (
                        <button
                          key={audience}
                          onClick={() => handleTargetAudienceToggle(audience)}
                          className={`p-2 text-sm rounded-md border transition-colors ${
                            editedProfile.targetAudience.includes(audience)
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {audience}
                        </button>
                      ))}
                    </div>
                    {editedProfile.targetAudience.includes('Other') && (
                      <input
                        type="text"
                        placeholder="Specify your target audience"
                        value={otherInputs.targetAudience}
                        onChange={(e) => handleOtherInput('targetAudience', e.target.value)}
                        className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    )}
                  </div>

                  {/* Post Types */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content Types (up to 3)</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {postTypes.map((postType) => (
                        <button
                          key={postType}
                          onClick={() => handlePostTypeToggle(postType)}
                          disabled={!editedProfile.postTypes.includes(postType) && editedProfile.postTypes.length >= 3}
                          className={`p-2 text-sm rounded-md border transition-colors ${
                            editedProfile.postTypes.includes(postType)
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300 disabled:opacity-50'
                          }`}
                        >
                          {postType}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Visual Style */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Visual Style</label>
                    <div className="space-y-2">
                      {visualStyles.map((style) => (
                        <button
                          key={style}
                          onClick={() => handleInputChange('visualStyle', style)}
                          className={`w-full p-2 text-sm text-left rounded-md border transition-colors ${
                            editedProfile.visualStyle === style
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Business Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Description</label>
                    <textarea
                      value={editedProfile.businessDescription}
                      onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                      rows={3}
                    />
                  </div>

                  {/* Logo Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Logo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    {(logoFile || editedProfile.logo) && (
                      <div className="mt-2 flex items-center space-x-3">
                        <img
                          src={editedProfile.logo}
                          alt="Logo preview"
                          className="w-16 h-16 object-contain rounded border bg-white p-1"
                        />
                        <div className="text-sm text-gray-600">
                          <p>✅ Logo {logoFile ? 'updated' : 'current'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Features Preview */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-blue-600 text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics</h3>
              <p className="text-gray-600 text-sm">Track your post performance and engagement metrics</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-green-600 text-2xl">🎨</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Content Library</h3>
              <p className="text-gray-600 text-sm">Access all your generated images and posts in one place</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-purple-600 text-2xl">📅</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Scheduling</h3>
              <p className="text-gray-600 text-sm">Plan and schedule your social media posts</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/test"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Try Generator Now
            </a>
            <button className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
              Get Notified When Ready
            </button>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">Development Timeline</h3>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Profile Setup</p>
                <p className="text-sm text-gray-600">Complete ✓</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">AI Image Generation</p>
                <p className="text-sm text-gray-600">Complete ✓</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Dashboard Interface</p>
                <p className="text-sm text-gray-600">In Development 🛠️</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Content Library</p>
                <p className="text-sm text-gray-600">Coming Soon</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Social Media Scheduling</p>
                <p className="text-sm text-gray-600">Coming Soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
