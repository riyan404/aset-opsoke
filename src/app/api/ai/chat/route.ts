import { NextRequest } from 'next/server'
import { withPermission, AuthenticatedRequest } from '@/lib/middleware'
import { logActivity } from '@/lib/audit'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
})

async function chatHandler(req: AuthenticatedRequest) {
  try {
    const { messages, files } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: 'Messages array is required' }, { status: 400 })
    }

    // Prepare messages for OpenAI
    const openaiMessages = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }))

    // Add file context if files are provided
    if (files && files.length > 0) {
      const fileContext = files.map((file: any) => 
        `File: ${file.fileName} (${file.fileType})`
      ).join('\n')
      
      openaiMessages.unshift({
        role: 'system',
        content: `The user has uploaded the following files for context: ${fileContext}`
      })
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: openaiMessages,
      max_tokens: 1000,
      temperature: 0.7,
    })

    const response = completion.choices[0]?.message?.content || 'No response generated'

    // Log the chat interaction
    await logActivity({
      userId: req.user!.id,
      action: 'AI_CHAT',
      module: 'AI_CHAT',
      details: {
        messageCount: messages.length,
        filesAttached: files?.length || 0,
        responseLength: response.length
      }
    })

    return Response.json({ 
      success: true,
      response,
      usage: completion.usage 
    })

  } catch (error) {
    console.error('AI Chat error:', error)
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    return Response.json({ 
      error: 'Failed to process chat request',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}

export const POST = withPermission('AI_CHAT', 'write')(chatHandler)