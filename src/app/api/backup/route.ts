import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/middleware'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)
const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
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
      return NextResponse.json({ error: 'Akses ditolak. Hanya admin yang dapat melakukan backup.' }, { status: 403 })
    }

    // Create backup directory if it doesn't exist
    const backupDir = path.join(process.cwd(), 'backups')
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupFileName = `database-backup-${timestamp}.db`
    const backupPath = path.join(backupDir, backupFileName)

    // Get database path from environment or use default
    const dbPath = process.env.DATABASE_URL?.replace('file:', '') || './prisma/dev.db'
    const fullDbPath = path.resolve(process.cwd(), dbPath.replace('./', ''))

    // Copy database file to backup location
    try {
      fs.copyFileSync(fullDbPath, backupPath)
    } catch (error) {
      console.error('Error creating backup:', error)
      return NextResponse.json({ 
        error: 'Gagal membuat backup database',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }

    // Get backup file stats
    const stats = fs.statSync(backupPath)
    const fileSizeInBytes = stats.size
    const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2)

    // Log the backup activity
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'DATABASE_BACKUP',
        resource: 'SYSTEM',
        resourceId: null,
        oldValues: null,
        newValues: `Manual database backup created: ${backupFileName}`,
        ipAddress: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Backup database berhasil dibuat',
      backup: {
        fileName: backupFileName,
        filePath: `/api/backup/download/${backupFileName}`,
        size: fileSizeInMB + ' MB',
        createdAt: new Date().toISOString(),
        createdBy: user.username
      }
    })

  } catch (error) {
    console.error('Backup error:', error)
    return NextResponse.json({ 
      error: 'Terjadi kesalahan saat membuat backup',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET(request: NextRequest) {
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
      return NextResponse.json({ error: 'Akses ditolak. Hanya admin yang dapat melihat backup.' }, { status: 403 })
    }

    // Get backup directory
    const backupDir = path.join(process.cwd(), 'backups')
    
    if (!fs.existsSync(backupDir)) {
      return NextResponse.json({
        success: true,
        backups: []
      })
    }

    // Read backup files
    const files = fs.readdirSync(backupDir)
    const backupFiles = files
      .filter(file => file.endsWith('.db'))
      .map(file => {
        const filePath = path.join(backupDir, file)
        const stats = fs.statSync(filePath)
        const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2)
        
        return {
          fileName: file,
          filePath: `/api/backup/download/${file}`,
          size: fileSizeInMB + ' MB',
          createdAt: stats.birthtime.toISOString(),
          modifiedAt: stats.mtime.toISOString()
        }
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({
      success: true,
      backups: backupFiles
    })

  } catch (error) {
    console.error('Get backups error:', error)
    return NextResponse.json({ 
      error: 'Terjadi kesalahan saat mengambil daftar backup',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}