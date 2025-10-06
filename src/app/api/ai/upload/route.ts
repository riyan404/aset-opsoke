import { NextRequest } from 'next/server'
import { withPermission, AuthenticatedRequest } from '@/lib/middleware'
import { logActivity } from '@/lib/audit'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp'
]

async function uploadHandler(req: AuthenticatedRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return Response.json({ 
        error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` 
      }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return Response.json({ 
        error: 'File type not allowed. Supported: PDF, Word, Text, Images' 
      }, { status: 400 })
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'ai-chat')
    await mkdir(uploadDir, { recursive: true })

    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${timestamp}_${sanitizedName}`
    const filePath = path.join(uploadDir, fileName)

    // Save file
    const bytes = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(bytes))

    // Save file info to database
    const chatFile = await prisma.chatFile.create({
      data: {
        fileName: file.name,
        filePath: `/uploads/ai-chat/${fileName}`,
        fileSize: file.size,
        fileType: file.type,
        uploadedBy: req.user!.id
      }
    })

    // Log the upload activity
    await logActivity({
      userId: req.user!.id,
      action: 'FILE_UPLOAD',
      module: 'AI_CHAT',
      details: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      }
    })

    return Response.json({
      id: chatFile.id,
      fileName: chatFile.fileName,
      filePath: chatFile.filePath,
      fileSize: chatFile.fileSize,
      fileType: chatFile.fileType
    })

  } catch (error) {
    console.error('File upload error:', error)
    return Response.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}

export const POST = withPermission('AI_CHAT', 'write')(uploadHandler)