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
  brandColors: string[]
  logo?: string
  completedAt: string
}

export default function Home() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    goal: '',
    brandPersonality: [] as string[],
    visualStyle: '',
    targetAudience: [] as string[],
    postTypes: [] as string[],
    businessDescription: '',
    brandColors: [] as string[],
    logo: ''
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [hasProfile, setHasProfile] = useState(false)
  const [otherInputs, setOtherInputs] = useState({
    industry: '',
    goal: '',
    targetAudience: ''
  })

  useEffect(() => {
    // Check if user already has a profile
    const existingProfile = localStorage.getItem('postMachineProfile')
    if (existingProfile) {
      setHasProfile(true)
    }
  }, [])

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleTargetAudienceToggle = (audience: string) => {
    if (audience === 'Other') {
      // Handle "Other" selection - replace with custom input
      setFormData(prev => ({
        ...prev,
        targetAudience: prev.targetAudience.includes('Other')
          ? prev.targetAudience.filter(a => a !== 'Other')
          : [...prev.targetAudience.filter(a => a !== 'Other'), 'Other']
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        targetAudience: prev.targetAudience.includes(audience)
          ? prev.targetAudience.filter(a => a !== audience)
          : [...prev.targetAudience, audience]
      }))
    }
  }

  const handleOtherInput = (field: string, value: string) => {
    setOtherInputs(prev => ({
      ...prev,
      [field]: value
    }))
    
    if (field === 'targetAudience') {
      setFormData(prev => ({
        ...prev,
        targetAudience: prev.targetAudience.includes('Other')
          ? prev.targetAudience.map(a => a === 'Other' ? value : a)
          : [...prev.targetAudience.filter(a => a !== 'Other'), value]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handlePersonalityToggle = (personality: string) => {
    setFormData(prev => ({
      ...prev,
      brandPersonality: prev.brandPersonality.includes(personality)
        ? prev.brandPersonality.filter(p => p !== personality)
        : prev.brandPersonality.length < 3
        ? [...prev.brandPersonality, personality]
        : prev.brandPersonality
    }))
  }

  const handlePostTypeToggle = (postType: string) => {
    setFormData(prev => ({
      ...prev,
      postTypes: prev.postTypes.includes(postType)
        ? prev.postTypes.filter(p => p !== postType)
        : prev.postTypes.length < 3
        ? [...prev.postTypes, postType]
        : prev.postTypes
    }))
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        const base64 = event.target?.result as string
        setFormData(prev => ({
          ...prev,
          logo: base64
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleNext = () => {
    if (currentStep < 9) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    const profile: UserProfile = {
      ...formData,
      completedAt: new Date().toISOString()
    }
    
    localStorage.setItem('postMachineProfile', JSON.stringify(profile))
    setHasProfile(true)
    setShowOnboarding(false)
    
    // Reset form
    setCurrentStep(1)
    setFormData({
      name: '',
      industry: '',
      goal: '',
      brandPersonality: [],
      visualStyle: '',
      targetAudience: [],
      postTypes: [],
      businessDescription: '',
      brandColors: [],
      logo: ''
    })
    setOtherInputs({
      industry: '',
      goal: '',
      targetAudience: ''
    })
    setLogoFile(null)
  }

  const clearProfile = () => {
    localStorage.removeItem('postMachineProfile')
    setHasProfile(false)
  }

  const handleBrandColorToggle = (color: string) => {
    setFormData(prev => ({
      ...prev,
      brandColors: prev.brandColors.includes(color)
        ? prev.brandColors.filter(c => c !== color)
        : prev.brandColors.length < 5
        ? [...prev.brandColors, color]
        : prev.brandColors
    }))
  }

  const handleCustomColorAdd = (color: string) => {
    if (color && !formData.brandColors.includes(color) && formData.brandColors.length < 5) {
      setFormData(prev => ({
        ...prev,
        brandColors: [...prev.brandColors, color]
      }))
    }
  }

  const handleCustomColorRemove = (color: string) => {
    setFormData(prev => ({
      ...prev,
      brandColors: prev.brandColors.filter(c => c !== color)
    }))
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.name.trim() !== ''
      case 2: return formData.industry !== ''
      case 3: return formData.goal !== ''
      case 4: return formData.brandPersonality.length > 0
      case 5: return formData.targetAudience.length > 0
      case 6: return formData.postTypes.length > 0
      case 7: return formData.visualStyle !== ''
      case 8: return formData.brandColors.length > 0
      case 9: return formData.businessDescription.trim() !== ''
      default: return false
    }
  }

  const industries = [
    'Food & Beverage',
    'Fashion & Beauty', 
    'Health & Fitness',
    'Technology & Software',
    'Retail & E-commerce',
    'Education & Coaching',
    'Entertainment & Media',
    'Other'
  ]

  const goals = [
    'Build brand awareness',
    'Drive sales or leads',
    'Showcase products/services',
    'Educate or share expertise',
    'Build community & engagement',
    'Other'
  ]

  const personalities = [
    'Professional',
    'Friendly',
    'Playful',
    'Bold',
    'Minimalist',
    'Elegant',
    'Innovative',
    'Fun & quirky'
  ]

  const visualStyles = [
    'Clean & minimalist',
    'Vibrant & energetic',
    'Modern & techy',
    'Elegant & premium',
    'Fun & creative'
  ]

  const targetAudiences = [
    'Gen Z (under 25)',
    'Millennials (25–40)',
    'Gen X (40–55)',
    'Parents & families',
    'Small business owners',
    'Professionals & executives',
    'Fitness/wellness enthusiasts',
    'Other'
  ]

  const postTypes = [
    'Product highlights',
    'Promotions/discounts',
    'Tips & educational posts',
    'Lifestyle/inspirational',
    'Behind-the-scenes',
    'Quotes & mottos',
    'Memes & fun posts'
  ]

  const predefinedColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2',
    '#A3E4D7', '#F9E79F', '#FADBD8', '#D5DBDB', '#2C3E50',
    '#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6'
  ]

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-normal">
              <span className="text-blue-500">Post</span>
              <span className="text-red-500">Machine</span>
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            {hasProfile && (
              <>
                <a
                  href="/dashboard"
                  className="text-gray-600 hover:text-gray-800 text-sm"
                >
                  Dashboard
                </a>
                <button
                  onClick={clearProfile}
                  className="text-gray-600 hover:text-gray-800 text-sm"
                >
                  Clear Profile
                </button>
              </>
            )}
            <button className="text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-md transition-colors">
              Sign in
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-6xl font-light mb-4">
            <span className="text-blue-500">Post</span>
            <span className="text-red-500">Machine</span>
          </h1>
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        </div>

        {/* Main Headline */}
        <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-6 leading-tight">
          AI-powered image generation<br />
          for social media
        </h2>

        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto font-light">
          Create stunning visuals for your social media platforms in seconds. 
          Perfect for brands, companies, and individuals.
        </p>

        {/* Onboarding Form or CTA */}
        {!showOnboarding ? (
          <div className="mb-16">
            <div className="max-w-md mx-auto">
              {hasProfile ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-center mb-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-green-800 mb-2">Profile Complete!</h3>
                  <p className="text-green-700 text-sm mb-4">
                    Your business profile is set up and ready to create amazing social media content.
                  </p>
                  <a
                    href="/dashboard"
                    className="block w-full px-8 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
                  >
                    Go to Dashboard
                  </a>
                </div>
              ) : (
                <button
                  onClick={() => setShowOnboarding(true)}
                  className="w-full px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
                >
                  Get Started - Create Your Profile
                </button>
              )}
              <p className="text-sm text-gray-500 mt-3">
                {hasProfile ? 'Profile saved locally' : 'Quick setup • Takes 2 minutes'}
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-16">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg border p-8">
                {/* Progress Bar */}
                <div className="mb-8">
                  <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span>Step {currentStep} of 9</span>
                    <span>{Math.round((currentStep / 9) * 100)}% complete</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(currentStep / 9) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Step 1: Name */}
                {currentStep === 1 && (
                  <div className="text-left">
                    <h3 className="text-2xl font-medium text-gray-900 mb-2">Welcome! Let's get started</h3>
                    <p className="text-gray-600 mb-6">What's your name or business name?</p>
                    
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., Sarah, TechCorp, Sarah's Bakery"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-lg"
                      autoFocus
                    />
                    
                    <p className="text-sm text-gray-500 mt-2">
                      This will be used to personalize your content and posts.
                    </p>
                  </div>
                )}

                {/* Step 2: Industry */}
                {currentStep === 2 && (
                  <div className="text-left">
                    <h3 className="text-2xl font-medium text-gray-900 mb-2">About Your Business</h3>
                    <p className="text-gray-600 mb-6">What industry is your business in?</p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {industries.map((industry) => (
                        <button
                          key={industry}
                          onClick={() => handleInputChange('industry', industry)}
                          className={`p-4 text-left rounded-lg border-2 transition-colors ${
                            formData.industry === industry
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {industry}
                        </button>
                      ))}
                    </div>
                    
                    {formData.industry === 'Other' && (
                      <div className="mt-4">
                        <input
                          type="text"
                          placeholder="Please specify your industry"
                          value={otherInputs.industry}
                          onChange={(e) => handleOtherInput('industry', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Goal */}
                {currentStep === 3 && (
                  <div className="text-left">
                    <h3 className="text-2xl font-medium text-gray-900 mb-2">Your Goals</h3>
                    <p className="text-gray-600 mb-6">What's your main goal with social media?</p>
                    
                    <div className="space-y-3">
                      {goals.map((goal) => (
                        <button
                          key={goal}
                          onClick={() => handleInputChange('goal', goal)}
                          className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                            formData.goal === goal
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {goal}
                        </button>
                      ))}
                    </div>
                    
                    {formData.goal === 'Other' && (
                      <div className="mt-4">
                        <input
                          type="text"
                          placeholder="Please specify your goal"
                          value={otherInputs.goal}
                          onChange={(e) => handleOtherInput('goal', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Step 4: Brand Personality */}
                {currentStep === 4 && (
                  <div className="text-left">
                    <h3 className="text-2xl font-medium text-gray-900 mb-2">Brand Personality</h3>
                    <p className="text-gray-600 mb-2">Which best describes your brand personality?</p>
                    <p className="text-sm text-blue-600 mb-6">Choose up to 3 options</p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {personalities.map((personality) => (
                        <button
                          key={personality}
                          onClick={() => handlePersonalityToggle(personality)}
                          disabled={!formData.brandPersonality.includes(personality) && formData.brandPersonality.length >= 3}
                          className={`p-4 text-left rounded-lg border-2 transition-colors ${
                            formData.brandPersonality.includes(personality)
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed'
                          }`}
                        >
                          {personality}
                        </button>
                      ))}
                    </div>
                    {formData.brandPersonality.length > 0 && (
                      <p className="text-sm text-gray-500 mt-3">
                        Selected: {formData.brandPersonality.join(', ')}
                      </p>
                    )}
                  </div>
                )}

                {/* Step 5: Target Audience */}
                {currentStep === 5 && (
                  <div className="text-left">
                    <h3 className="text-2xl font-medium text-gray-900 mb-2">Target Audience</h3>
                    <p className="text-gray-600 mb-2">Who is your target audience?</p>
                    <p className="text-sm text-blue-600 mb-6">Select all that apply</p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {targetAudiences.map((audience) => (
                        <button
                          key={audience}
                          onClick={() => handleTargetAudienceToggle(audience)}
                          className={`p-4 text-left rounded-lg border-2 transition-colors ${
                            formData.targetAudience.includes(audience) || 
                            (audience === 'Other' && formData.targetAudience.some(a => !targetAudiences.slice(0, -1).includes(a)))
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {audience}
                        </button>
                      ))}
                    </div>
                    
                    {(formData.targetAudience.includes('Other') || 
                      formData.targetAudience.some(a => !targetAudiences.slice(0, -1).includes(a))) && (
                      <div className="mt-4">
                        <input
                          type="text"
                          placeholder="Please specify your target audience"
                          value={otherInputs.targetAudience}
                          onChange={(e) => handleOtherInput('targetAudience', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    )}
                    
                    {formData.targetAudience.length > 0 && (
                      <p className="text-sm text-gray-500 mt-3">
                        Selected: {formData.targetAudience.join(', ')}
                      </p>
                    )}
                  </div>
                )}

                {/* Step 6: Post Types */}
                {currentStep === 6 && (
                  <div className="text-left">
                    <h3 className="text-2xl font-medium text-gray-900 mb-2">Content Preferences</h3>
                    <p className="text-gray-600 mb-2">Which types of posts do you want to create most often?</p>
                    <p className="text-sm text-blue-600 mb-6">Choose up to 3 options</p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {postTypes.map((postType) => (
                        <button
                          key={postType}
                          onClick={() => handlePostTypeToggle(postType)}
                          disabled={!formData.postTypes.includes(postType) && formData.postTypes.length >= 3}
                          className={`p-4 text-left rounded-lg border-2 transition-colors ${
                            formData.postTypes.includes(postType)
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed'
                          }`}
                        >
                          {postType}
                        </button>
                      ))}
                    </div>
                    {formData.postTypes.length > 0 && (
                      <p className="text-sm text-gray-500 mt-3">
                        Selected: {formData.postTypes.join(', ')}
                      </p>
                    )}
                  </div>
                )}

                {/* Step 7: Visual Style + Logo */}
                {currentStep === 7 && (
                  <div className="text-left">
                    <h3 className="text-2xl font-medium text-gray-900 mb-2">Visual Preferences</h3>
                    <p className="text-gray-600 mb-6">What visual style do you prefer for your posts?</p>
                    
                    <div className="space-y-3 mb-8">
                      {visualStyles.map((style) => (
                        <button
                          key={style}
                          onClick={() => handleInputChange('visualStyle', style)}
                          className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                            formData.visualStyle === style
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>

                    {/* Logo Upload */}
                    <div className="border-t pt-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Business Logo (Optional)</h4>
                      <p className="text-gray-600 text-sm mb-4">Upload your logo to include it in branded posts</p>
                      
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      
                      {logoFile && (
                        <div className="mt-4 flex items-center space-x-3">
                          <img
                            src={formData.logo}
                            alt="Logo preview"
                            className="w-16 h-16 object-contain rounded-lg border bg-white p-1"
                          />
                          <div className="text-sm text-gray-600">
                            <p className="font-medium">{logoFile.name}</p>
                            <p>✅ Logo uploaded successfully</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 8: Brand Colors */}
                {currentStep === 8 && (
                  <div className="text-left">
                    <h3 className="text-2xl font-medium text-gray-900 mb-2">Brand Colors</h3>
                    <p className="text-gray-600 mb-2">Select colors that represent your brand</p>
                    <p className="text-sm text-blue-600 mb-6">Choose up to 5 colors that will be used in your posts</p>
                    
                    {/* Predefined Colors */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Popular Brand Colors</h4>
                      <div className="grid grid-cols-10 gap-2">
                        {predefinedColors.map((color) => (
                          <button
                            key={color}
                            onClick={() => handleBrandColorToggle(color)}
                            disabled={!formData.brandColors.includes(color) && formData.brandColors.length >= 5}
                            className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                              formData.brandColors.includes(color)
                                ? 'border-gray-900 scale-110 shadow-lg'
                                : 'border-gray-300 hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed'
                            }`}
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Custom Color Input */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Add Custom Color</h4>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          onChange={(e) => handleCustomColorAdd(e.target.value.toUpperCase())}
                          className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                          disabled={formData.brandColors.length >= 5}
                        />
                        <span className="text-sm text-gray-500">
                          {formData.brandColors.length >= 5 ? 'Maximum 5 colors selected' : 'Click to add a custom color'}
                        </span>
                      </div>
                    </div>

                    {/* Selected Colors */}
                    {formData.brandColors.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Selected Brand Colors</h4>
                        <div className="flex flex-wrap gap-3">
                          {formData.brandColors.map((color, index) => (
                            <div key={index} className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2">
                              <div
                                className="w-6 h-6 rounded-full border border-gray-300"
                                style={{ backgroundColor: color }}
                              />
                              <span className="text-sm font-mono text-gray-700">{color}</span>
                              <button
                                onClick={() => handleCustomColorRemove(color)}
                                className="text-red-500 hover:text-red-700 text-sm"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          These colors will be used to create cohesive, on-brand social media posts.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 9: Business Description */}
                {currentStep === 9 && (
                  <div className="text-left">
                    <h3 className="text-2xl font-medium text-gray-900 mb-2">Tell Us About Your Business</h3>
                    <p className="text-gray-600 mb-6">Describe your business in a few words</p>
                    
                    <textarea
                      value={formData.businessDescription}
                      onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                      placeholder="e.g., We create handmade jewelry for modern women who value unique, sustainable accessories..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[120px]"
                      rows={5}
                    />
                    
                    <p className="text-sm text-gray-500 mt-2">
                      This helps us create more personalized and relevant content for your brand.
                    </p>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t">
                  <button
                    onClick={handleBack}
                    disabled={currentStep === 1}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Back
                  </button>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowOnboarding(false)}
                      className="px-6 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Skip for now
                    </button>
                    
                    {currentStep < 9 ? (
                      <button
                        onClick={handleNext}
                        disabled={!canProceed()}
                        className="px-8 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmit}
                        disabled={!canProceed()}
                        className="px-8 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Complete Setup
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="grid md:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <div className="w-8 h-8 bg-blue-500 rounded"></div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">AI Generation</h3>
            <p className="text-gray-600 text-sm">Create images from text prompts</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <div className="w-8 h-8 bg-red-500 rounded"></div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Brand Ready</h3>
            <p className="text-gray-600 text-sm">Perfect for all social platforms</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <div className="w-8 h-8 bg-yellow-500 rounded"></div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Fast & Easy</h3>
            <p className="text-gray-600 text-sm">Generate images in seconds</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <div className="w-8 h-8 bg-green-500 rounded"></div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Professional</h3>
            <p className="text-gray-600 text-sm">High-quality results every time</p>
          </div>
        </div>

        {/* CTA */}
        {!showOnboarding && hasProfile && (
          <div className="bg-gray-50 rounded-lg p-8">
            <h3 className="text-2xl font-light text-gray-900 mb-4">
              Ready to transform your social media?
            </h3>
            <a
              href="/dashboard"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Go to Dashboard
            </a>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-gray-500 text-sm mb-4">© 2024 Post Machine</p>
          <div className="flex justify-center space-x-8 text-sm">
            <a href="#" className="text-gray-600 hover:text-blue-600">Privacy</a>
            <a href="#" className="text-gray-600 hover:text-blue-600">Terms</a>
            <a href="#" className="text-gray-600 hover:text-blue-600">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  )
}
