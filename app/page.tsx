export default function Home() {
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
          <button className="text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-md transition-colors">
            Sign in
          </button>
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

        {/* Email Signup */}
        <div className="mb-16">
          <div className="max-w-md mx-auto">
            <div className="flex border border-gray-300 rounded-full overflow-hidden hover:shadow-md transition-shadow">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 outline-none text-gray-700"
              />
              <button className="px-8 py-4 bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium">
                Get Started
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Join the waitlist • No spam, ever
            </p>
          </div>
        </div>

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
        <div className="bg-gray-50 rounded-lg p-8">
          <h3 className="text-2xl font-light text-gray-900 mb-4">
            Ready to transform your social media?
          </h3>
          <button className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium">
            Join Waitlist
          </button>
        </div>
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
