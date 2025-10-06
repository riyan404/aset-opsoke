import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
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

    // Only admin can access AI settings
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 })
    }

    // Get AI settings from database or environment variables
    let aiSettings = await prisma.systemSetting.findFirst({
      where: { key: 'ai_config' }
    })

    if (!aiSettings) {
      // Return default settings from environment variables
      return NextResponse.json({
        success: true,
        settings: {
          apiKey: process.env.OPENAI_API_KEY ? '••••••••••••••••••••••••••••••••••••••••' : '',
          baseURL: process.env.OPENAI_BASE_URL || 'https://ai.sumopod.com/v1',
          selectedModel: 'gpt-4o-mini',
        }
      })
    }

    const config = JSON.parse(aiSettings.value)
    
    // Mask the API key for security
    const maskedConfig = {
      ...config,
      apiKey: config.apiKey ? '••••••••••••••••••••••••••••••••••••••••' : '',
    }

    return NextResponse.json({
      success: true,
      settings: maskedConfig
    })

  } catch (error) {
    console.error('AI settings GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    // Only admin can modify AI settings
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const { selectedModel } = body

    // Validation - only selectedModel is required now since apiKey and baseURL come from environment
    if (!selectedModel || !selectedModel.trim()) {
      return NextResponse.json({ success: false, error: 'Selected model is required' }, { status: 400 })
    }

    // Get API key and base URL from environment variables
    const apiKey = process.env.OPENAI_API_KEY
    const baseURL = process.env.OPENAI_BASE_URL || 'https://ai.sumopod.com/v1'

    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'API Key not configured in environment' }, { status: 500 })
    }

    const aiConfig = {
      apiKey: apiKey,
      baseURL: baseURL,
      selectedModel: selectedModel.trim(),
      updatedAt: new Date().toISOString()
    }

    // Save or update AI settings in database
    await prisma.systemSetting.upsert({
      where: { key: 'ai_config' },
      update: {
        value: JSON.stringify(aiConfig),
        updatedAt: new Date()
      },
      create: {
        key: 'ai_config',
        value: JSON.stringify(aiConfig),
        description: 'AI service configuration including API key, base URL, and selected model'
      }
    })

    // Log the configuration change
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        resource: 'AI_SETTINGS',
        resourceId: 'ai_config',
        userId: user.id,
        newValues: JSON.stringify({
          baseURL: baseURL.trim(),
          selectedModel: selectedModel.trim(),
          // Don't log the actual API key for security
          apiKeyChanged: true
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'AI settings saved successfully'
    })

  } catch (error) {
    console.error('AI settings POST error:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}