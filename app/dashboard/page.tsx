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
  apiKey?: string
  completedAt: string
}

interface GeneratedImage {
  id: number
  imageUrl: string
  imageBytes: string
  mimeType: string
}

interface GenerationResult {
  success: boolean
  prompt: string
  textResponse: string
  images: GeneratedImage[]
  userName?: string
  postDescription?: string
  hasLogo: boolean
  generatedCaption?: string
  generatedDescription?: string
  metadata: {
    model: string
    textModel?: string
    numberOfImages: number
    mode: string
    generatedAt: string
  }
}

interface SavedImage {
  id: string
  imageUrl: string
  prompt: string
  userName?: string
  postDescription?: string
  hasLogo: boolean
  createdAt: string
  originalPrompt?: string
  isEdit?: boolean
  generatedCaption?: string
  generatedDescription?: string
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
  
  // Updated states for sections
  const [activeSection, setActiveSection] = useState<'new' | 'images' | 'library'>('new')
  const [postDescription, setPostDescription] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // New states for editing functionality
  const [editingImageId, setEditingImageId] = useState<number | null>(null)
  const [editPrompt, setEditPrompt] = useState('')
  const [isEditingImage, setIsEditingImage] = useState(false)

  // New state for saved images
  const [savedImages, setSavedImages] = useState<SavedImage[]>([])

  // New states for content library
  const [isRemasteringImage, setIsRemasteringImage] = useState<string | null>(null)
  const [contentLibraryImages] = useState([
    { 
      id: 'cantiffin', 
      src: '/content/cantiffin.png', 
      name: 'Cantiffin',
      description: 'Food delivery service design'
    },
    { 
      id: 'mockup', 
      src: '/content/mockup.png', 
      name: 'Mockup Design',
      description: 'Product mockup template'
    },
    { 
      id: 'newyear', 
      src: '/content/newyear.jpg', 
      name: 'New Year',
      description: 'New Year celebration design'
    }
  ])

  useEffect(() => {
    // Load user profile from localStorage
    const savedProfile = localStorage.getItem('postMachineProfile')
    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile)
      setProfile(parsedProfile)
      setEditedProfile({ ...parsedProfile })
    }

    // Load saved images from localStorage
    const storedImages = localStorage.getItem('postMachineImages')
    if (storedImages) {
      try {
        const parsedImages = JSON.parse(storedImages)
        setSavedImages(parsedImages)
      } catch (error) {
        console.error('Error loading saved images:', error)
        setSavedImages([])
      }
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

  const handleBrandColorToggle = (color: string) => {
    if (editedProfile) {
      setEditedProfile(prev => prev ? {
        ...prev,
        brandColors: (prev.brandColors || []).includes(color)
          ? (prev.brandColors || []).filter(c => c !== color)
          : (prev.brandColors || []).length < 5
          ? [...(prev.brandColors || []), color]
          : prev.brandColors || []
      } : null)
    }
  }

  const handleCustomColorAdd = (color: string) => {
    if (editedProfile && color && !(editedProfile.brandColors || []).includes(color) && (editedProfile.brandColors?.length || 0) < 5) {
      setEditedProfile(prev => prev ? {
        ...prev,
        brandColors: [...(prev.brandColors || []), color]
      } : null)
    }
  }

  const handleCustomColorRemove = (color: string) => {
    if (editedProfile) {
      setEditedProfile(prev => prev ? {
        ...prev,
        brandColors: (prev.brandColors || []).filter(c => c !== color)
      } : null)
    }
  }

  const saveImageToStorage = (image: GeneratedImage, result: GenerationResult, isEdit: boolean = false, originalPrompt?: string) => {
    const savedImage: SavedImage = {
      id: `${Date.now()}-${image.id}`,
      imageUrl: image.imageUrl,
      prompt: result.prompt,
      userName: result.userName,
      postDescription: result.postDescription,
      hasLogo: result.hasLogo,
      createdAt: new Date().toISOString(),
      originalPrompt: originalPrompt,
      isEdit: isEdit,
      generatedCaption: result.generatedCaption,
      generatedDescription: result.generatedDescription
    }

    const updatedImages = [savedImage, ...savedImages]
    setSavedImages(updatedImages)
    localStorage.setItem('postMachineImages', JSON.stringify(updatedImages))
  }

  const deleteImageFromStorage = (imageId: string) => {
    const updatedImages = savedImages.filter(img => img.id !== imageId)
    setSavedImages(updatedImages)
    localStorage.setItem('postMachineImages', JSON.stringify(updatedImages))
  }

  const clearAllImages = () => {
    setSavedImages([])
    localStorage.removeItem('postMachineImages')
  }

  const handleRemasterImage = async (imageId: string, imageSrc: string) => {
    if (!profile) {
      setError('Please complete your profile first')
      return
    }

    if (!profile.apiKey) {
      setError('Please add your Google AI API key in your profile settings')
      return
    }

    setIsRemasteringImage(imageId)
    setError(null)

    try {
      console.log('Starting remaster for image:', imageId, imageSrc)
      
      // Convert image to base64
      const response = await fetch(imageSrc)
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`)
      }
      
      const blob = await response.blob()
      console.log('Image blob size:', blob.size, 'type:', blob.type)
      
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result as string
          if (result) {
            resolve(result.split(',')[1]) // Remove data:image/type;base64, prefix
          } else {
            reject(new Error('Failed to convert image to base64'))
          }
        }
        reader.onerror = () => reject(new Error('Failed to read image file'))
        reader.readAsDataURL(blob)
      })

      console.log('Base64 conversion successful, length:', base64.length)

      // Create a concise prompt
      const remasterPrompt = `Remaster this image for ${profile.name}, a ${profile.industry} business. Style: ${profile.visualStyle}. Brand: ${profile.brandPersonality.join(', ')}. Target: ${profile.targetAudience.join(', ')}. Make it professional and on-brand.`

      const requestBody = {
        prompt: remasterPrompt,
        inputImage: {
          data: base64,
          mimeType: imageSrc.endsWith('.jpg') || imageSrc.endsWith('.jpeg') ? 'image/jpeg' : 'image/png'
        },
        mode: 'image-editing',
        brandColors: profile.brandColors || [],
        apiKey: profile.apiKey,
        logoImage: profile.logo ? {
          data: profile.logo.split(',')[1],
          mimeType: 'image/png'
        } : null
      }

      console.log('Sending request with prompt length:', remasterPrompt.length)

      const remasterResponse = await fetch('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      console.log('Response status:', remasterResponse.status)

      let result
      try {
        const responseText = await remasterResponse.text()
        console.log('Raw response:', responseText.substring(0, 200) + '...')
        result = JSON.parse(responseText)
      } catch (jsonError) {
        console.error('JSON parse error:', jsonError)
        throw new Error('Invalid response format from server. Please try again.')
      }

      if (!remasterResponse.ok) {
        console.error('API error:', result)
        throw new Error(result.error || `Server error: ${remasterResponse.status}`)
      }

      if (result.success && result.images && result.images.length > 0) {
        console.log('Remaster successful, saving images:', result.images.length)
        // Save remastered images to localStorage
        result.images.forEach((image: GeneratedImage) => {
          saveImageToStorage(image, result, false)
        })
        
        // Switch to images tab to show results
        setActiveSection('images')
      } else {
        console.error('Remaster failed:', result)
        throw new Error(result.error || 'Remaster failed - no images generated')
      }
    } catch (err) {
      console.error('Remaster error details:', err)
      if (err instanceof Error) {
        setError(`Remaster failed: ${err.message}`)
      } else {
        setError('An unknown error occurred during remastering. Please try again.')
      }
    } finally {
      setIsRemasteringImage(null)
    }
  }

  const handleGeneratePost = async () => {
    if (!profile || !postDescription.trim()) {
      setError('Please enter a post description')
      return
    }

    if (!profile.apiKey) {
      setError('Please add your Google AI API key in your profile settings')
      return
    }

    setIsGenerating(true)
    setError(null)
    setGenerationResult(null)

    try {
      const requestBody = {
        userName: profile.name,
        postDescription: postDescription.trim(),
        mode: profile.logo ? 'social-media-post-with-logo' : 'social-media-post',
        brandColors: profile.brandColors || [],
        apiKey: profile.apiKey,
        logoImage: profile.logo ? {
          data: profile.logo.split(',')[1], // Remove data:image/type;base64, prefix
          mimeType: 'image/png'
        } : null
      }

      const response = await fetch('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate post')
      }

      if (result.success) {
        setGenerationResult(result)
        setPostDescription('') // Clear the input
        
        // Save all generated images to localStorage
        result.images.forEach((image: GeneratedImage) => {
          saveImageToStorage(image, result, false)
        })
      } else {
        throw new Error(result.error || 'Generation failed')
      }
    } catch (err) {
      console.error('Generation error:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadImage = (imageUrl: string, filename: string) => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleEditImage = async (imageId: number, imageUrl: string) => {
    if (!editPrompt.trim()) {
      setError('Please enter edit instructions')
      return
    }

    if (!profile?.apiKey) {
      setError('Please add your Google AI API key in your profile settings')
      return
    }

    setIsEditingImage(true)
    setError(null)

    try {
      // Convert image URL to base64 data
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result as string
          resolve(result.split(',')[1]) // Remove data:image/type;base64, prefix
        }
        reader.readAsDataURL(blob)
      })

      const requestBody = {
        prompt: editPrompt.trim(),
        inputImage: {
          data: base64,
          mimeType: 'image/png'
        },
        mode: 'image-editing',
        apiKey: profile.apiKey
      }

      const editResponse = await fetch('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const result = await editResponse.json()

      if (!editResponse.ok) {
        throw new Error(result.error || 'Failed to edit image')
      }

      if (result.success && result.images.length > 0) {
        // Add edited images to the current generation result
        setGenerationResult(prev => prev ? {
          ...prev,
          images: [...prev.images, ...result.images.map((img: any, index: number) => ({
            ...img,
            id: prev.images.length + index + 1
          }))]
        } : null)
        
        // Save edited images to localStorage
        result.images.forEach((image: GeneratedImage) => {
          saveImageToStorage(image, result, true, generationResult?.prompt)
        })
        
        setEditPrompt('')
        setEditingImageId(null)
      } else {
        throw new Error(result.error || 'Edit failed')
      }
    } catch (err) {
      console.error('Edit error:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred during editing')
    } finally {
      setIsEditingImage(false)
    }
  }

  const startEditing = (imageId: number) => {
    setEditingImageId(imageId)
    setEditPrompt('')
    setError(null)
  }

  const cancelEditing = () => {
    setEditingImageId(null)
    setEditPrompt('')
    setError(null)
  }

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // You could add a toast notification here if desired
      console.log(`${type} copied to clipboard`)
    } catch (err) {
      console.error('Failed to copy text: ', err)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
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

  const predefinedColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2',
    '#A3E4D7', '#F9E79F', '#FADBD8', '#D5DBDB', '#2C3E50',
    '#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6'
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
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Section Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveSection('new')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeSection === 'new'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Create New Post
              </button>
              <button
                onClick={() => setActiveSection('images')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeSection === 'images'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Generated Images
                {savedImages.length > 0 && (
                  <span className="ml-2 bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                    {savedImages.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveSection('library')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeSection === 'library'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Content Library
              </button>
            </nav>
          </div>
        </div>

        {/* New Post Section */}
        {activeSection === 'new' && (
          <div className="space-y-8">
            {/* Profile Preview Card */}
            {profile && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Your Profile</h2>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Edit Profile
                  </button>
                </div>
                <div className="grid md:grid-cols-3 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-gray-500">Business:</span>
                    <span className="ml-2 font-medium">{profile.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Industry:</span>
                    <span className="ml-2 font-medium">{profile.industry}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Style:</span>
                    <span className="ml-2 font-medium">{profile.visualStyle}</span>
                  </div>
                </div>
                
                {/* Brand Colors Preview */}
                {profile.brandColors && profile.brandColors.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500 text-sm">Brand Colors:</span>
                    <div className="flex space-x-1">
                      {profile.brandColors.map((color, index) => (
                        <div
                          key={index}
                          className="w-6 h-6 rounded-full border border-gray-300"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Post Creation Form */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Post</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What would you like to post about?
                  </label>
                  <textarea
                    value={postDescription}
                    onChange={(e) => setPostDescription(e.target.value)}
                    placeholder={`Example: "Share a motivational quote about ${profile?.industry || 'business'} success" or "Highlight our new product launch with customer benefits"`}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    rows={4}
                    disabled={isGenerating}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Describe what you want your post to be about. The AI will create a professional image based on your profile and description.
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleGeneratePost}
                  disabled={!postDescription.trim() || isGenerating || !profile || !profile.apiKey}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isGenerating ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Generating Post...
                    </div>
                  ) : !profile?.apiKey ? (
                    'Add API Key to Generate'
                  ) : (
                    `Generate Post ${profile?.logo ? 'with Logo' : ''}`
                  )}
                </button>
                
                {!profile?.apiKey && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-sm">
                      <strong>API Key Required:</strong> Please add your Google AI API key in your profile to generate images.{' '}
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-blue-600 hover:text-blue-700 underline"
                      >
                        Add API Key
                      </button>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Generation Result */}
            {generationResult && generationResult.images.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Posts</h3>
                
                <div className="grid gap-6">
                  {generationResult.images.map((image) => (
                    <div key={image.id} className="relative border rounded-lg p-4 bg-gray-50">
                      <img
                        src={image.imageUrl}
                        alt={`Generated post for ${generationResult.userName}`}
                        className="w-full max-w-lg mx-auto rounded-lg shadow-sm mb-4"
                      />
                      
                      {/* Caption and Description */}
                      {(generationResult.generatedCaption || generationResult.generatedDescription) && (
                        <div className="mb-4 bg-white rounded-lg p-4 border">
                          <h4 className="text-sm font-medium text-gray-900 mb-3">Generated Content</h4>
                          
                          {generationResult.generatedCaption && (
                            <div className="mb-3">
                              <div className="flex justify-between items-center mb-2">
                                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Caption</label>
                                <button
                                  onClick={() => copyToClipboard(generationResult.generatedCaption!, 'Caption')}
                                  className="text-xs text-blue-600 hover:text-blue-700"
                                >
                                  Copy
                                </button>
                              </div>
                              <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded border">
                                {generationResult.generatedCaption}
                              </p>
                            </div>
                          )}
                          
                          {generationResult.generatedDescription && (
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Description</label>
                                <button
                                  onClick={() => copyToClipboard(generationResult.generatedDescription!, 'Description')}
                                  className="text-xs text-blue-600 hover:text-blue-700"
                                >
                                  Copy
                                </button>
                              </div>
                              <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded border">
                                {generationResult.generatedDescription}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      <div className="flex justify-center space-x-3 mb-4">
                        <button
                          onClick={() => downloadImage(
                            image.imageUrl, 
                            `${profile?.name || 'post'}-${Date.now()}.png`
                          )}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                        >
                          Download Image
                        </button>
                        <button
                          onClick={() => startEditing(image.id)}
                          disabled={editingImageId === image.id || isEditingImage}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
                        >
                          Edit Image
                        </button>
                      </div>

                      {/* Edit Interface */}
                      {editingImageId === image.id && (
                        <div className="border-t pt-4 mt-4">
                          <h4 className="text-md font-medium text-gray-900 mb-3">Edit this image</h4>
                          <div className="space-y-3">
                            <textarea
                              value={editPrompt}
                              onChange={(e) => setEditPrompt(e.target.value)}
                              placeholder="Describe the changes you want to make... (e.g., 'Change the background to blue', 'Add more text', 'Make it more vibrant', 'Remove the text at the bottom')"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                              rows={3}
                              disabled={isEditingImage}
                            />
                            
                            {error && editingImageId === image.id && (
                              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-red-700 text-sm">{error}</p>
                              </div>
                            )}

                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditImage(image.id, image.imageUrl)}
                                disabled={!editPrompt.trim() || isEditingImage}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex items-center"
                              >
                                {isEditingImage ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Editing...
                                  </>
                                ) : (
                                  'Apply Edit'
                                )}
                              </button>
                              <button
                                onClick={cancelEditing}
                                disabled={isEditingImage}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Overall Actions */}
                <div className="mt-6 pt-4 border-t flex justify-center">
                  <button
                    onClick={() => setGenerationResult(null)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Create New Post
                  </button>
                </div>

                {generationResult.textResponse && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{generationResult.textResponse}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Images Section */}
        {activeSection === 'images' && (
          <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Generated Images</h2>
                <p className="text-gray-600">All your AI-generated images in one place</p>
              </div>
              {savedImages.length > 0 && (
                <button
                  onClick={clearAllImages}
                  className="px-4 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors text-sm"
                >
                  Clear All Images
                </button>
              )}
            </div>

            {/* Stats */}
            {savedImages.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow-sm border p-4">
                  <div className="text-2xl font-bold text-blue-600">{savedImages.length}</div>
                  <div className="text-sm text-gray-500">Total Images</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {savedImages.filter(img => !img.isEdit).length}
                  </div>
                  <div className="text-sm text-gray-500">Original Posts</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border p-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {savedImages.filter(img => img.isEdit).length}
                  </div>
                  <div className="text-sm text-gray-500">Edited Images</div>
                </div>
              </div>
            )}

            {/* Images Grid */}
            {savedImages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedImages.map((savedImage) => (
                  <div key={savedImage.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    <div className="aspect-square relative">
                      <img
                        src={savedImage.imageUrl}
                        alt="Generated content"
                        className="w-full h-full object-cover"
                      />
                      {savedImage.isEdit && (
                        <div className="absolute top-2 right-2 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                          Edited
                        </div>
                      )}
                      {savedImage.hasLogo && (
                        <div className="absolute top-2 left-2 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                          With Logo
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <div className="mb-3">
                        {savedImage.userName && (
                          <h3 className="font-medium text-gray-900 text-sm mb-1">
                            {savedImage.userName}
                          </h3>
                        )}
                        {savedImage.postDescription && (
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                            {savedImage.postDescription}
                          </p>
                        )}
                        {savedImage.isEdit && savedImage.originalPrompt && (
                          <p className="text-purple-600 text-xs mb-1">
                            Edit: {savedImage.prompt.replace('Edit: ', '')}
                          </p>
                        )}
                      </div>

                      {/* Caption and Description for saved images */}
                      {(savedImage.generatedCaption || savedImage.generatedDescription) && (
                        <div className="mb-3 bg-gray-50 rounded p-3">
                          {savedImage.generatedCaption && (
                            <div className="mb-2">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-medium text-gray-600">Caption</span>
                                <button
                                  onClick={() => copyToClipboard(savedImage.generatedCaption!, 'Caption')}
                                  className="text-xs text-blue-600 hover:text-blue-700"
                                >
                                  Copy
                                </button>
                              </div>
                              <p className="text-xs text-gray-800 line-clamp-2">
                                {savedImage.generatedCaption}
                              </p>
                            </div>
                          )}
                          {savedImage.generatedDescription && (
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-medium text-gray-600">Description</span>
                                <button
                                  onClick={() => copyToClipboard(savedImage.generatedDescription!, 'Description')}
                                  className="text-xs text-blue-600 hover:text-blue-700"
                                >
                                  Copy
                                </button>
                              </div>
                              <p className="text-xs text-gray-800 line-clamp-3">
                                {savedImage.generatedDescription}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500 mb-3">
                        {new Date(savedImage.createdAt).toLocaleDateString()} at{' '}
                        {new Date(savedImage.createdAt).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => downloadImage(
                            savedImage.imageUrl,
                            `${savedImage.userName || 'post'}-${savedImage.id}.png`
                          )}
                          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                        >
                          Download
                        </button>
                        <button
                          onClick={() => deleteImageFromStorage(savedImage.id)}
                          className="px-3 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-4xl">🖼️</span>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No images generated yet</h3>
                <p className="text-gray-600 mb-6">
                  Create your first post to see your generated images here
                </p>
                <button
                  onClick={() => setActiveSection('new')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Generate Your First Image
                </button>
              </div>
            )}
          </div>
        )}

        {/* Library Section */}
        {activeSection === 'library' && (
          <div className="space-y-8">
            {/* Header */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Content Library</h2>
              <p className="text-gray-600">Professional templates you can customize for your brand</p>
            </div>

            {/* Content Library Images */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contentLibraryImages.map((image) => (
                <div key={image.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  <div className="aspect-square relative">
                    <img
                      src={image.src}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 text-lg mb-1">
                      {image.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {image.description}
                    </p>
                    
                    <button
                      onClick={() => handleRemasterImage(image.id, image.src)}
                      disabled={isRemasteringImage === image.id || !profile || !profile.apiKey}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                      {isRemasteringImage === image.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Remastering...
                        </>
                      ) : !profile?.apiKey ? (
                        'Add API Key to Remaster'
                      ) : (
                        'Remaster for My Brand'
                      )}
                    </button>
                    
                    {!profile ? (
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        Complete your profile to remaster
                      </p>
                    ) : !profile.apiKey ? (
                      <p className="text-xs text-yellow-600 mt-2 text-center">
                        Add API key in profile to remaster
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Coming Soon Section */}
            <div className="mt-12 text-center py-16 border-t border-gray-200">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-4xl">📚</span>
              </div>
              <h3 className="text-2xl font-light text-gray-900 mb-4">
                More Features Coming Soon
              </h3>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                Soon you'll be able to organize your content into campaigns, create content calendars, and access advanced analytics.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <span className="text-purple-600 text-2xl">📅</span>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Content Calendar</h4>
                  <p className="text-gray-600 text-sm">Plan and schedule your social media content in advance</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <span className="text-blue-600 text-2xl">🎯</span>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Campaign Manager</h4>
                  <p className="text-gray-600 text-sm">Organize images into marketing campaigns and themes</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <span className="text-green-600 text-2xl">📊</span>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Analytics</h4>
                  <p className="text-gray-600 text-sm">Track performance and engagement metrics</p>
                </div>
              </div>

              <div className="mt-8 p-6 bg-blue-50 rounded-lg max-w-2xl mx-auto">
                <p className="text-blue-800 text-sm mb-3">
                  <strong>Note:</strong> Your generated and remastered images are saved in the "Generated Images" section.
                </p>
                <button
                  onClick={() => setActiveSection('images')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  View Generated Images
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Profile Editing Modal/Section */}
        {isEditing && profile && editedProfile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Edit Your Profile</h2>
                  <div className="flex space-x-2">
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
                  </div>
                </div>
                
                {/* Existing profile editing form content goes here */}
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

                  {/* API Key */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Google AI API Key</label>
                    <input
                      type="password"
                      value={editedProfile.apiKey || ''}
                      onChange={(e) => handleInputChange('apiKey', e.target.value)}
                      placeholder="Enter your Google AI API key (AIza...)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <div className="mt-2 text-sm text-gray-600">
                      <p className="mb-1">🔑 <strong>Required:</strong> Get your free API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">Google AI Studio</a></p>
                      <p className="text-gray-500">Your API key is stored locally and never shared. It's used to generate images through Google's AI services.</p>
                    </div>
                    {editedProfile.apiKey && (
                      <div className="mt-2 flex items-center text-sm text-green-600">
                        <span className="mr-1">✅</span>
                        API key configured
                      </div>
                    )}
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

                  {/* Brand Colors */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Brand Colors (up to 5)</label>
                    
                    {/* Predefined Colors */}
                    <div className="mb-4">
                      <h4 className="text-xs font-medium text-gray-600 mb-2">Popular Brand Colors</h4>
                      <div className="grid grid-cols-10 gap-2">
                        {predefinedColors.map((color) => (
                          <button
                            key={color}
                            onClick={() => handleBrandColorToggle(color)}
                            disabled={!(editedProfile.brandColors || []).includes(color) && (editedProfile.brandColors?.length || 0) >= 5}
                            className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                              (editedProfile.brandColors || []).includes(color)
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
                    <div className="mb-4">
                      <h4 className="text-xs font-medium text-gray-600 mb-2">Add Custom Color</h4>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          onChange={(e) => handleCustomColorAdd(e.target.value.toUpperCase())}
                          className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                          disabled={(editedProfile.brandColors?.length || 0) >= 5}
                        />
                        <span className="text-xs text-gray-500">
                          {(editedProfile.brandColors?.length || 0) >= 5 ? 'Maximum 5 colors selected' : 'Click to add a custom color'}
                        </span>
                      </div>
                    </div>

                    {/* Selected Colors */}
                    {(editedProfile.brandColors || []).length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-gray-600 mb-2">Selected Brand Colors</h4>
                        <div className="flex flex-wrap gap-2">
                          {(editedProfile.brandColors || []).map((color, index) => (
                            <div key={index} className="flex items-center space-x-2 bg-gray-50 rounded p-2">
                              <div
                                className="w-4 h-4 rounded-full border border-gray-300"
                                style={{ backgroundColor: color }}
                              />
                              <span className="text-xs font-mono text-gray-700">{color}</span>
                              <button
                                onClick={() => handleCustomColorRemove(color)}
                                className="text-red-500 hover:text-red-700 text-xs"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
