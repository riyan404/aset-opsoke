import { NextRequest, NextResponse } from 'next/server'
import { readFile, stat } from 'fs/promises'
import { createReadStream } from 'fs'
import path from 'path'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/middleware'
import { createArchiveReport } from '@/lib/archive-helper'

export const GET = withAuth(async (
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    const params = await context.params
    
    // Get document info
    const document = await prisma.document.findUnique({
      where: { id: params.id },
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Check department access
    const user = (request as any).user
    if (user.role !== 'ADMIN' && document.department !== user.department) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    const filePath = path.join(process.cwd(), document.filePath)
    const fileStats = await stat(filePath)

    // Create archive report for document access
    await createArchiveReport(
      document.id,
      document.department || 'Unknown',
      'VIEWED',
      user.id,
      'Document downloaded',
      `Document '${document.title}' was downloaded by ${user.firstName} ${user.lastName}`
    )

    // Set headers for file download
    const headers = new Headers()
    headers.set('Content-Type', document.mimeType)
    headers.set('Content-Disposition', `attachment; filename="${document.fileName}"`)
    headers.set('Content-Length', fileStats.size.toString())

    // Use streaming for large files (>5MB) to avoid memory issues
    if (fileStats.size > 5 * 1024 * 1024) {
      const stream = createReadStream(filePath)
      
      // Convert Node.js stream to Web Stream
       const readableStream = new ReadableStream({
         start(controller) {
           stream.on('data', (chunk: Buffer) => {
             controller.enqueue(new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength))
           })
           
           stream.on('end', () => {
             controller.close()
           })
           
           stream.on('error', (err) => {
             controller.error(err)
           })
         }
       })

      return new NextResponse(readableStream, {
        status: 200,
        headers,
      })
    } else {
      // Use buffer for smaller files
      const fileBuffer = await readFile(filePath)
      return new NextResponse(new Uint8Array(fileBuffer), {
        status: 200,
        headers,
      })
    }
  } catch (error) {
    console.error('Download document error:', error)
    return NextResponse.json(
      { error: 'File not found or internal server error' },
      { status: 500 }
    )
  }
})