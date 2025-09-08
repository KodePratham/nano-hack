import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { prompt, inputImage, logoImage, mode, userName, postDescription, brandColors, apiKey } = requestBody;

    console.log('Request mode:', mode);
    console.log('Has prompt:', !!prompt);
    console.log('Has inputImage:', !!inputImage);
    console.log('Has userName:', !!userName);
    console.log('Has postDescription:', !!postDescription);
    console.log('Has apiKey:', !!apiKey);

    // Check for API key - either from user or environment
    const googleApiKey = apiKey || process.env.GOOGLE_AI_API_KEY;
    if (!googleApiKey) {
      return NextResponse.json(
        { error: 'Google AI API key is required. Please add your API key in your profile settings.' },
        { status: 400 }
      );
    }

    if (!prompt && mode !== 'social-media-post' && mode !== 'social-media-post-with-logo') {
      return NextResponse.json(
        { error: 'Prompt is required for image editing mode' },
        { status: 400 }
      );
    }

    if ((mode === 'social-media-post' || mode === 'social-media-post-with-logo') && (!userName || !postDescription)) {
      return NextResponse.json(
        { error: 'Name and post description are required for social media post generation' },
        { status: 400 }
      );
    }

    if (mode === 'social-media-post-with-logo' && !logoImage) {
      return NextResponse.json(
        { error: 'Logo image is required for logo mode' },
        { status: 400 }
      );
    }

    if (mode === 'image-editing' && !inputImage) {
      return NextResponse.json(
        { error: 'Input image is required for editing mode' },
        { status: 400 }
      );
    }

    console.log(`Starting ${mode || 'image'} generation with Gemini`);

    // Initialize Google Gen AI with user's API key or environment fallback
    const ai = new GoogleGenAI({
      apiKey: googleApiKey
    });

    let contents;
    let modelName = "gemini-2.5-flash-image-preview";
    let textModelName = "gemini-1.5-flash";

    // Generate caption and description for social media posts
    let generatedCaption = '';
    let generatedDescription = '';

    if (mode === 'social-media-post' || mode === 'social-media-post-with-logo') {
      // Generate text content first
      const textPrompt = `Create engaging social media content for "${userName}" based on this post description: "${postDescription}"

Please generate:
1. A short, catchy caption (1-2 sentences, under 100 characters) that would work well as a social media post caption
2. A longer description (2-3 sentences, 150-250 characters) that provides more context and engagement

Make the content:
- Engaging and attention-grabbing
- Appropriate for the business/brand "${userName}"
- Suitable for multiple social media platforms (Instagram, LinkedIn, Facebook)
- Include relevant hashtags if appropriate
- Professional yet approachable tone

Format your response as:
CAPTION: [your caption here]
DESCRIPTION: [your description here]`;

      try {
        const textResponse = await ai.models.generateContent({
          model: textModelName,
          contents: [textPrompt],
        });

        const textContent = textResponse.candidates[0].content.parts[0].text;
        
        // Parse the response to extract caption and description
        const captionMatch = textContent.match(/CAPTION:\s*([\s\S]*?)(?=\nDESCRIPTION:|\n|$)/);
        const descriptionMatch = textContent.match(/DESCRIPTION:\s*([\s\S]*?)$/);
        
        generatedCaption = captionMatch ? captionMatch[1].trim() : '';
        generatedDescription = descriptionMatch ? descriptionMatch[1].trim() : '';

        console.log('Generated caption:', generatedCaption);
        console.log('Generated description:', generatedDescription);
      } catch (error) {
        console.error('Error generating text content:', error);
        // Continue with image generation even if text generation fails
        generatedCaption = `Check out this post from ${userName}!`;
        generatedDescription = `${userName} shares: ${postDescription}`;
      }
    }

    if (mode === 'social-media-post') {
      // Use image model for social media post generation
      const colorScheme = brandColors && brandColors.length > 0 
        ? `Use these brand colors in the design: ${brandColors.join(', ')}. Incorporate these colors harmoniously throughout the design.`
        : 'Use an attractive, professional color scheme that matches the content theme.';

      const socialMediaPrompt = `Create a professional social media post image for "${userName}". 

Post topic/description: ${postDescription}

Design requirements:
- Modern, clean, and visually appealing layout
- Include the name/brand "${userName}" prominently in the design
- Professional typography with readable fonts
- ${colorScheme}
- Visual elements, icons, or graphics that relate to the post description
- Optimized for social media platforms (Instagram, LinkedIn, Facebook)
- Square or portrait orientation preferred
- High contrast for text readability
- Professional but engaging aesthetic
- Include relevant visual metaphors or symbols related to the content

Make it look like a professional social media post that someone would actually want to share.`;

      contents = [socialMediaPrompt];
    } else if (mode === 'social-media-post-with-logo') {
      // Use image model for social media post with logo generation
      const colorScheme = brandColors && brandColors.length > 0 
        ? `Use these brand colors in the design: ${brandColors.join(', ')}. Incorporate these colors harmoniously throughout the design, ensuring they complement the logo.`
        : 'Use an attractive, professional color scheme that matches the content theme and complements the logo.';

      const logoPostPrompt = `Create a professional social media post image for "${userName}" that incorporates the provided logo image. 

Post topic/description: ${postDescription}

Design requirements:
- Modern, clean, and visually appealing layout
- Include the name/brand "${userName}" prominently in the design
- Professional typography with readable fonts
- ${colorScheme}
- Visual elements, icons, or graphics that relate to the post description
- Optimized for social media platforms (Instagram, LinkedIn, Facebook)
- Square or portrait orientation preferred
- High contrast for text readability
- Professional but engaging aesthetic
- IMPORTANT: Incorporate the provided logo image seamlessly into the design, preferably in the bottom right corner
- Ensure the logo is visible but not overwhelming the main content
- Make sure the logo placement looks natural and professional
- The logo should complement the overall design aesthetic

Create a cohesive design that combines the post content with the brand logo professionally.`;

      contents = [
        { text: logoPostPrompt },
        {
          inlineData: {
            mimeType: logoImage.mimeType || "image/png",
            data: logoImage.data,
          },
        },
      ];
    } else if (mode === 'image-editing') {
      // Image editing mode - enhance the prompt for better results
      const editPrompt = `Edit this image based on the following instructions: ${prompt}

Please make the requested changes while maintaining the overall quality and professional appearance of the image. Keep the existing style and composition unless specifically asked to change them.

Instructions: ${prompt}`;

      contents = [
        { text: editPrompt },
        {
          inlineData: {
            mimeType: inputImage.mimeType || "image/png",
            data: inputImage.data,
          },
        },
      ];
    } else {
      // Text-to-image mode
      contents = [prompt];
    }

    // Generate content
    const response = await ai.models.generateContent({
      model: modelName,
      contents: contents,
    });

    console.log('Generation response received');

    // Handle all responses as image generation (including social media posts)
    const generatedImages = [];
    let textResponse = '';

    for (const part of response.candidates[0].content.parts) {
      if (part.text) {
        textResponse += part.text;
        console.log('Text response:', part.text);
      } else if (part.inlineData) {
        const imageDataUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        
        generatedImages.push({
          id: generatedImages.length + 1,
          imageUrl: imageDataUrl,
          imageBytes: part.inlineData.data,
          mimeType: part.inlineData.mimeType || 'image/png'
        });
      }
    }

    const result = {
      success: true,
      prompt: mode === 'image-editing' 
        ? `Edit: ${prompt}`
        : (mode === 'social-media-post' || mode === 'social-media-post-with-logo') 
          ? `Social media post image for ${userName}: ${postDescription}` 
          : prompt,
      textResponse: textResponse,
      images: generatedImages,
      userName: (mode === 'social-media-post' || mode === 'social-media-post-with-logo') ? userName : undefined,
      postDescription: (mode === 'social-media-post' || mode === 'social-media-post-with-logo') ? postDescription : undefined,
      hasLogo: mode === 'social-media-post-with-logo',
      generatedCaption: generatedCaption,
      generatedDescription: generatedDescription,
      metadata: {
        model: modelName,
        textModel: textModelName,
        numberOfImages: generatedImages.length,
        mode: mode || (inputImage ? 'image-editing' : 'text-to-image'),
        generatedAt: new Date().toISOString()
      }
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Generation error:', error);
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      if (error.message.includes('quota') || error.message.includes('429')) {
        return NextResponse.json(
          { error: 'API quota exceeded. Please try again later.' },
          { status: 429 }
        );
      }
      if (error.message.includes('safety') || error.message.includes('policy')) {
        return NextResponse.json(
          { error: 'Content violates safety guidelines. Please modify your input.' },
          { status: 400 }
        );
      }
      if (error.message.includes('401') || error.message.includes('authentication')) {
        return NextResponse.json(
          { error: 'Invalid API key. Please check your Google AI API key.' },
          { status: 401 }
        );
      }
      if (error.message.includes('403') || error.message.includes('permission')) {
        return NextResponse.json(
          { error: 'API access denied. Please check your API key permissions.' },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { error: `Generation failed: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Unknown error occurred during generation' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Post Machine AI Generation API - Gemini Native',
    status: 'active',
    version: '4.2.0',
    models: {
      image: 'gemini-2.5-flash-image-preview'
    },
    endpoints: {
      generateContent: 'POST /api/test',
      requiredFields: ['prompt OR (userName + postDescription for social media posts)'],
      optionalFields: ['inputImage', 'logoImage', 'mode']
    },
    capabilities: [
      'Text-to-Image generation',
      'Image editing with text prompts',
      'Social media post image generation',
      'Branded social media post generation with logo',
      'Multi-turn conversational editing',
      'High-fidelity text rendering'
    ]
  });
}