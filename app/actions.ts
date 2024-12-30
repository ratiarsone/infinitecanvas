'use server'

import { openai } from '../lib/openai'
import { GenerationType, PromptHistory } from '@/types/canvas'

export async function generateImageFromPrompt(
  prompt: string, 
  type: GenerationType,
  previousPrompts: PromptHistory[] = []
) {
  try {
    // Construct a prompt that includes the history
    const promptHistory = previousPrompts
      .map(p => `v${p.version}: ${p.prompt}`)
      .join('\n')
    
    const fullPrompt = previousPrompts.length > 0
      ? `Previous versions:\n${promptHistory}\n\nNew version: ${prompt}`
      : prompt

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: fullPrompt,
      size: "1024x1024",
      quality: "standard",
      n: 1,
    });

    const imageUrl = response.data[0].url;
    
    if (!imageUrl) {
      throw new Error('No image URL returned from OpenAI');
    }

    return {
      success: true,
      image: imageUrl,
      prompt,
      type
    }
  } catch (error) {
    console.error('Error generating image:', error);
    return {
      success: false,
      error: 'Failed to generate image'
    }
  }
}

