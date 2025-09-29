import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/middleware'

const prisma = new PrismaClient()

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
      return NextResponse.json({ error: 'Akses ditolak. Hanya admin yang dapat mengakses konfigurasi backup.' }, { status: 403 })
    }

    // Get auto backup configuration
    let config = await prisma.autoBackupConfig.findFirst()
    
    // If no config exists, create default one
    if (!config) {
      config = await prisma.autoBackupConfig.create({
        data: {
          isEnabled: false,
          scheduleTime: '02:00',
          retentionDays: 7
        }
      })
    }

    return NextResponse.json({
      success: true,
      config: {
        id: config.id,
        isEnabled: config.isEnabled,
        scheduleTime: config.scheduleTime,
        retentionDays: config.retentionDays,
        lastRunAt: config.lastRunAt,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt
      }
    })

  } catch (error) {
    console.error('Get auto backup config error:', error)
    return NextResponse.json({ 
      error: 'Terjadi kesalahan saat mengambil konfigurasi backup',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function PUT(request: NextRequest) {
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
      return NextResponse.json({ error: 'Akses ditolak. Hanya admin yang dapat mengubah konfigurasi backup.' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { isEnabled, scheduleTime, retentionDays } = body

    // Validate input
    if (typeof isEnabled !== 'boolean') {
      return NextResponse.json({ error: 'isEnabled harus berupa boolean' }, { status: 400 })
    }

    if (scheduleTime && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(scheduleTime)) {
      return NextResponse.json({ error: 'scheduleTime harus dalam format HH:MM (24 jam)' }, { status: 400 })
    }

    if (retentionDays && (typeof retentionDays !== 'number' || retentionDays < 1 || retentionDays > 365)) {
      return NextResponse.json({ error: 'retentionDays harus berupa angka antara 1-365' }, { status: 400 })
    }

    // Get existing config or create new one
    let config = await prisma.autoBackupConfig.findFirst()
    
    if (!config) {
      config = await prisma.autoBackupConfig.create({
        data: {
          isEnabled,
          scheduleTime: scheduleTime || '02:00',
          retentionDays: retentionDays || 7
        }
      })
    } else {
      config = await prisma.autoBackupConfig.update({
        where: { id: config.id },
        data: {
          isEnabled,
          ...(scheduleTime && { scheduleTime }),
          ...(retentionDays && { retentionDays })
        }
      })
    }

    // Log the configuration change
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'AUTO_BACKUP_CONFIG_UPDATE',
        resource: 'SYSTEM',
        resourceId: config.id,
        oldValues: null,
        newValues: `Auto backup config updated: enabled=${isEnabled}, schedule=${scheduleTime || config.scheduleTime}, retention=${retentionDays || config.retentionDays} days`,
        ipAddress: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Konfigurasi auto backup berhasil diperbarui',
      config: {
        id: config.id,
        isEnabled: config.isEnabled,
        scheduleTime: config.scheduleTime,
        retentionDays: config.retentionDays,
        lastRunAt: config.lastRunAt,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt
      }
    })

  } catch (error) {
    console.error('Update auto backup config error:', error)
    return NextResponse.json({ 
      error: 'Terjadi kesalahan saat memperbarui konfigurasi backup',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}