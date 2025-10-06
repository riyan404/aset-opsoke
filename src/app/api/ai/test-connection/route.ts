import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/middleware'
import { testOpenAIConnection } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token) as any
    if (!decoded) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 })
    }

    const user = decoded

    // Only admin can test AI connection
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const { selectedModel } = body

    // Get API key and base URL from environment
    const apiKey = process.env.OPENAI_API_KEY
    const baseURL = process.env.OPENAI_BASE_URL || 'https://ai.sumopod.com/v1'

    // Validation
    if (!apiKey || !apiKey.trim()) {
      return NextResponse.json({ success: false, error: 'API Key not configured in environment' }, { status: 500 })
    }

    if (!selectedModel || !selectedModel.trim()) {
      return NextResponse.json({ success: false, error: 'Selected model is required' }, { status: 400 })
    }

    // Test the connection
    const testResult = await testOpenAIConnection(apiKey.trim(), baseURL.trim(), selectedModel.trim())

    if (testResult.success) {
      return NextResponse.json({
        success: true,
        message: 'Connection successful',
        data: testResult.data,
        usage: testResult.usage
      })
    } else {
      return NextResponse.json({
        success: false,
        error: testResult.error
      }, { status: 400 })
    }

  } catch (error) {
    console.error('AI connection test error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}