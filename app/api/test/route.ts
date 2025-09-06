import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, inputImage } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!process.env.GOOGLE_AI_API_KEY) {
      return NextResponse.json(
        { error: 'Google AI API key not configured' },
        { status: 500 }
      );
    }

    console.log('Starting image generation with Gemini 2.5 Flash Image');

    // Initialize Google Gen AI
    const ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_AI_API_KEY
    });

    // Prepare the prompt content
    let contents;
    
    if (inputImage) {
      // Image editing mode - text + image to image
      contents = [
        { text: prompt },
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

    // Generate content using Gemini's native image generation
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image-preview",
      contents: contents,
    });

    console.log('Image generation response received');

    // Process the response parts
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
      prompt: prompt,
      textResponse: textResponse,
      images: generatedImages,
      metadata: {
        model: 'gemini-2.5-flash-image-preview',
        numberOfImages: generatedImages.length,
        mode: inputImage ? 'image-editing' : 'text-to-image',
        generatedAt: new Date().toISOString()
      }
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Image generation error:', error);
    
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
          { error: 'Prompt violates safety guidelines. Please modify your prompt.' },
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
        { error: `Image generation failed: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Unknown error occurred during image generation' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Post Factory AI Image Generation API - Gemini Native',
    status: 'active',
    version: '3.0.0',
    model: 'gemini-2.5-flash-image-preview',
    endpoints: {
      generateImage: 'POST /api/test',
      requiredFields: ['prompt'],
      optionalFields: ['inputImage']
    },
    capabilities: [
      'Text-to-Image generation',
      'Image editing with text prompts',
      'Multi-turn conversational editing',
      'High-fidelity text rendering'
    ]
  });
}
