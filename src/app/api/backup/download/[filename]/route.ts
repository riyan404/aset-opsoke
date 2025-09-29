import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/middleware'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Token tidak ditemukan' }, { status: 401 })
    }

    const decoded = verifyToken(token) as any
    if (!decoded) {
      return NextResponse.json({ error: 'Token tidak valid' }, { status: 401 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    })

    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
    }

    // Check if user is admin
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak. Hanya admin yang dapat mengunduh backup.' }, { status: 403 })
    }

    const filename = params.filename
    
    // Validate filename to prevent directory traversal
    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json({ error: 'Nama file tidak valid' }, { status: 400 })
    }

    // Check if file exists
    const backupDir = path.join(process.cwd(), 'backups')
    const filePath = path.join(backupDir, filename)

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File backup tidak ditemukan' }, { status: 404 })
    }

    // Read file
    const fileBuffer = fs.readFileSync(filePath)
    const stats = fs.statSync(filePath)

    // Log the download activity
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'DATABASE_BACKUP_DOWNLOAD',
        resource: 'SYSTEM',
        resourceId: null,
        oldValues: null,
        newValues: `Database backup downloaded: ${filename}`,
        ipAddress: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    // Return file as download
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': stats.size.toString(),
      },
    })

  } catch (error) {
    console.error('Download backup error:', error)
    return NextResponse.json({ 
      error: 'Terjadi kesalahan saat mengunduh backup',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}