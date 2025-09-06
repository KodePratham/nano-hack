'use client'
import { useState } from 'react'

export default function TestPage() {
  const [prompt, setPrompt] = useState('')
  const [mode, setMode] = useState<'text-to-image' | 'image-editing' | 'reference-generation'>('text-to-image')
  const [inputImage, setInputImage] = useState<string | null>(null)
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const base64 = event.target?.result as string
        const base64Data = base64.split(',')[1] // Remove data:image/...;base64, prefix
        setInputImage(base64Data)
      }
      reader.readAsDataURL(file)
    }
  }

  const loadReferenceImage = async () => {
    try {
      const response = await fetch('/test/ref1.jpg')
      const blob = await response.blob()
      const reader = new FileReader()
      reader.onload = (event) => {
        const base64 = event.target?.result as string
        const base64Data = base64.split(',')[1]
        setInputImage(base64Data)
      }
      reader.readAsDataURL(blob)
    } catch (err) {
      console.error('Failed to load reference image:', err)
      setError('Failed to load reference image. Please check if /public/test/ref1.jpg exists.')
    }
  }

  const generateImage = async () => {
    if (mode === 'reference-generation') {
      if (!userName.trim()) {
        setError('Please enter a name')
        return
      }
      // Load reference image if not already loaded
      if (!inputImage) {
        await loadReferenceImage()
      }
    } else {
      if (!prompt.trim()) {
        setError('Please enter a prompt')
        return
      }
      if (mode === 'image-editing' && !inputImage) {
        setError('Please upload an image for editing mode')
        return
      }
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const requestBody: any = {}
      
      if (mode === 'reference-generation') {
        requestBody.prompt = `Create an image for ${userName.trim()}, use the provided reference image as a style and composition guide. Make it personalized for ${userName.trim()} while maintaining the aesthetic and visual elements of the reference image.`
        requestBody.inputImage = {
          data: inputImage,
          mimeType: 'image/jpeg'
        }
      } else {
        requestBody.prompt = prompt.trim()
        if (mode === 'image-editing' && inputImage) {
          requestBody.inputImage = {
            data: inputImage,
            mimeType: 'image/png'
          }
        }
      }

      const response = await fetch('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image')
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const downloadImage = (imageBytes: string, index: number) => {
    const link = document.createElement('a')
    link.href = `data:image/png;base64,${imageBytes}`
    link.download = `gemini-generated-image-${index + 1}.png`
    link.click()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-light mb-2">
            <span className="text-blue-500">Post</span>
            <span className="text-red-500">Factory</span>
            <span className="text-gray-700"> Gemini</span>
          </h1>
          <p className="text-gray-600">Test AI image generation with Gemini 2.5 Flash Image</p>
        </div>

        {/* Input Form */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="space-y-4">
            {/* Mode Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Generation Mode
              </label>
              <div className="flex space-x-4 flex-wrap">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="text-to-image"
                    checked={mode === 'text-to-image'}
                    onChange={(e) => setMode(e.target.value as 'text-to-image')}
                    className="mr-2"
                  />
                  Text to Image
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="image-editing"
                    checked={mode === 'image-editing'}
                    onChange={(e) => setMode(e.target.value as 'image-editing')}
                    className="mr-2"
                  />
                  Image Editing
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="reference-generation"
                    checked={mode === 'reference-generation'}
                    onChange={(e) => setMode(e.target.value as 'reference-generation')}
                    className="mr-2"
                  />
                  Reference Generation
                </label>
              </div>
            </div>

            {/* Reference Generation Mode */}
            {mode === 'reference-generation' && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Name
                  </label>
                  <input
                    id="userName"
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g., John, Sarah, Alex"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                
                {/* Reference Image Preview */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reference Image
                  </label>
                  <div className="flex items-center space-x-4">
                    <img
                      src="/test/ref1.jpg"
                      alt="Reference image"
                      className="w-32 h-32 object-cover rounded-lg border"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        setError('Reference image not found. Please add ref1.jpg to /public/test/ folder.')
                      }}
                    />
                    <div className="text-sm text-gray-600">
                      <p>Using reference image: <code>/public/test/ref1.jpg</code></p>
                      <p>The AI will create a personalized version for the entered name using this image as style reference.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Image Upload for Editing Mode */}
            {mode === 'image-editing' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Image to Edit
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                {inputImage && (
                  <div className="mt-2">
                    <img
                      src={`data:image/png;base64,${inputImage}`}
                      alt="Input image"
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Prompt Input - Only for text-to-image and image-editing modes */}
            {mode !== 'reference-generation' && (
              <div>
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                  {mode === 'text-to-image' ? 'Describe the image you want to create' : 'Describe how to edit the image'}
                </label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    mode === 'text-to-image' 
                      ? "e.g., A photorealistic close-up of a coffee cup on a wooden table with warm morning light"
                      : "e.g., Add a rainbow in the sky, change the car color to red, remove the person from the background"
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  rows={3}
                />
              </div>
            )}

            <button
              onClick={generateImage}
              disabled={loading}
              className="w-full px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? 'Generating...' : 
               mode === 'text-to-image' ? 'Generate Image' : 
               mode === 'image-editing' ? 'Edit Image' : 
               'Generate with Reference'}
            </button>
          </div>

          {error && (
            <p className="text-red-600 text-sm mt-4">{error}</p>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">
              {mode === 'reference-generation' 
                ? `Generating personalized image for ${userName}...` 
                : 'Generating with Gemini 2.5 Flash Image...'}
            </p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Generated Results</h2>
            
            {/* Text Response */}
            {result.textResponse && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">AI Response:</h3>
                <p className="text-gray-700 text-sm">{result.textResponse}</p>
              </div>
            )}

            {/* Generated Images */}
            {result.images && result.images.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {result.images.map((image: any, index: number) => (
                  <div key={index} className="space-y-3">
                    <img
                      src={image.imageUrl}
                      alt={`Generated image ${index + 1}`}
                      className="w-full rounded-lg shadow-md"
                    />
                    <button
                      onClick={() => downloadImage(image.imageBytes, index)}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                    >
                      Download Image {index + 1}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Metadata */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Generation Details</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Prompt:</strong> {result.prompt}</p>
                {mode === 'reference-generation' && <p><strong>Name:</strong> {userName}</p>}
                <p><strong>Model:</strong> {result.metadata.model}</p>
                <p><strong>Mode:</strong> {result.metadata.mode}</p>
                <p><strong>Images Generated:</strong> {result.metadata.numberOfImages}</p>
                <p><strong>Generated:</strong> {new Date(result.metadata.generatedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Back to Home */}
        <div className="text-center mt-8">
          <a
            href="/"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}
