import { OpenAI } from 'openai';

// Available AI models based on the screenshot provided
export const AI_MODELS = [
  // Google Models
  { id: 'gemini/gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'google' },
  { id: 'gemini/gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite', provider: 'google' },
  { id: 'gemini/gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'google' },
  { id: 'gemini/gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', provider: 'google' },
  { id: 'gemini/gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'google' },
  
  // OpenAI Models
  { id: 'gpt-4.1', name: 'GPT-4.1', provider: 'openai' },
  { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', provider: 'openai' },
  { id: 'gpt-4.1-nano', name: 'GPT-4.1 Nano', provider: 'openai' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai' },
  { id: 'gpt-4o-mini-transcribe', name: 'GPT-4o Mini Transcribe', provider: 'openai' },
  { id: 'gpt-4o-mini-tts', name: 'GPT-4o Mini TTS', provider: 'openai' },
  { id: 'gpt-4o-transcribe', name: 'GPT-4o Transcribe', provider: 'openai' },
  { id: 'gpt-5', name: 'GPT-5', provider: 'openai' },
  { id: 'gpt-5-chat', name: 'GPT-5 Chat', provider: 'openai' },
  { id: 'gpt-5-mini', name: 'GPT-5 Mini', provider: 'openai' },
] as const;

export type AIModel = typeof AI_MODELS[number];

// Initialize OpenAI client
let openaiClient: OpenAI | null = null;

export function initializeOpenAI(apiKey?: string, baseURL?: string): OpenAI {
  const key = apiKey || process.env.OPENAI_API_KEY;
  const url = baseURL || process.env.OPENAI_BASE_URL;

  if (!key) {
    throw new Error('OpenAI API key is required');
  }

  openaiClient = new OpenAI({
    apiKey: key,
    baseURL: url || 'https://ai.sumopod.com/v1',
  });

  return openaiClient;
}

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    return initializeOpenAI();
  }
  return openaiClient;
}

// Chat completion function
export async function createChatCompletion({
  model = 'gpt-4o-mini',
  messages,
  maxTokens = 150,
  temperature = 0.7,
  apiKey,
  baseURL,
}: {
  model?: string;
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  maxTokens?: number;
  temperature?: number;
  apiKey?: string;
  baseURL?: string;
}) {
  try {
    const client = apiKey || baseURL ? initializeOpenAI(apiKey, baseURL) : getOpenAIClient();
    
    const response = await client.chat.completions.create({
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
    });

    return {
      success: true,
      data: response.choices[0]?.message?.content || '',
      usage: response.usage,
    };
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Test connection function
export async function testOpenAIConnection(apiKey?: string, baseURL?: string, model?: string) {
  try {
    const result = await createChatCompletion({
      model: model || 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Say "Connection successful" if you can read this.' }],
      maxTokens: 50,
      temperature: 1,
      apiKey,
      baseURL,
    });

    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Connection test failed',
    };
  }
}