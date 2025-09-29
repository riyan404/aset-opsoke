import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'

const execAsync = promisify(exec)
const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // Check if this is a valid cron request (you might want to add authentication for cron jobs)
    const cronSecret = request.headers.get('x-cron-secret')
    const expectedSecret = process.env.CRON_SECRET || 'default-cron-secret'
    
    if (cronSecret !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized cron request' }, { status: 401 })
    }

    // Get auto backup configuration
    const config = await prisma.autoBackupConfig.findFirst()
    
    if (!config || !config.isEnabled) {
      return NextResponse.json({ 
        success: false, 
        message: 'Auto backup is disabled' 
      })
    }

    // Check if backup should run based on schedule
    const now = new Date()
    const currentTime = now.toTimeString().slice(0, 5) // HH:MM format
    
    // Allow some flexibility in timing (±5 minutes)
    const scheduleTime = config.scheduleTime
    const shouldRun = isTimeToRun(currentTime, scheduleTime)
    
    if (!shouldRun) {
      return NextResponse.json({ 
        success: false, 
        message: `Not time to run backup. Current: ${currentTime}, Scheduled: ${scheduleTime}` 
      })
    }

    // Check if backup already ran today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (config.lastRunAt && config.lastRunAt >= today) {
      return NextResponse.json({ 
        success: false, 
        message: 'Backup already ran today' 
      })
    }

    // Create backup directory if it doesn't exist
    const backupDir = path.join(process.cwd(), 'backups')
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupFilename = `backup-${timestamp}.db`
    const backupPath = path.join(backupDir, backupFilename)
    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')

    // Create backup by copying the database file
    try {
      await execAsync(`cp "${dbPath}" "${backupPath}"`)
    } catch (error) {
      console.error('Backup creation failed:', error)
      return NextResponse.json({ 
        error: 'Failed to create backup',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }

    // Cleanup old backups based on retention policy
    await cleanupOldBackups(backupDir, config.retentionDays)

    // Update last run timestamp
    await prisma.autoBackupConfig.update({
      where: { id: config.id },
      data: { lastRunAt: new Date() }
    })

    // Log the backup creation
    await prisma.auditLog.create({
      data: {
        userId: 'system',
        action: 'AUTO_BACKUP_CREATED',
        resource: 'SYSTEM',
        resourceId: 'auto-backup',
        oldValues: null,
        newValues: `Auto backup created: ${backupFilename}`,
        ipAddress: 'system',
        userAgent: 'cron-job'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Auto backup completed successfully',
      backup: {
        filename: backupFilename,
        path: backupPath,
        size: fs.statSync(backupPath).size,
        createdAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Auto backup cron error:', error)
    
    // Log the error
    try {
      await prisma.auditLog.create({
        data: {
          userId: 'system',
          action: 'AUTO_BACKUP_ERROR',
          resource: 'SYSTEM',
          resourceId: 'auto-backup',
          oldValues: null,
          newValues: `Auto backup failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          ipAddress: 'system',
          userAgent: 'cron-job'
        }
      })
    } catch (logError) {
      console.error('Failed to log backup error:', logError)
    }

    return NextResponse.json({ 
      error: 'Auto backup failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// Manual trigger endpoint for testing
export async function GET(request: NextRequest) {
  try {
    // Verify authentication for manual trigger
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Token tidak ditemukan' }, { status: 401 })
    }

    // For manual trigger, we'll skip the time check and just run the backup
    const config = await prisma.autoBackupConfig.findFirst()
    
    if (!config) {
      return NextResponse.json({ 
        error: 'Auto backup configuration not found' 
      }, { status: 404 })
    }

    // Create backup directory if it doesn't exist
    const backupDir = path.join(process.cwd(), 'backups')
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupFilename = `manual-backup-${timestamp}.db`
    const backupPath = path.join(backupDir, backupFilename)
    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')

    // Create backup by copying the database file
    try {
      await execAsync(`cp "${dbPath}" "${backupPath}"`)
    } catch (error) {
      console.error('Manual backup creation failed:', error)
      return NextResponse.json({ 
        error: 'Failed to create manual backup',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }

    // Cleanup old backups if enabled
    if (config.isEnabled) {
      await cleanupOldBackups(backupDir, config.retentionDays)
    }

    return NextResponse.json({
      success: true,
      message: 'Manual backup completed successfully',
      backup: {
        filename: backupFilename,
        path: backupPath,
        size: fs.statSync(backupPath).size,
        createdAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Manual backup error:', error)
    return NextResponse.json({ 
      error: 'Manual backup failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// Helper function to check if it's time to run backup
function isTimeToRun(currentTime: string, scheduleTime: string): boolean {
  const [currentHour, currentMinute] = currentTime.split(':').map(Number)
  const [scheduleHour, scheduleMinute] = scheduleTime.split(':').map(Number)
  
  const currentMinutes = currentHour * 60 + currentMinute
  const scheduleMinutes = scheduleHour * 60 + scheduleMinute
  
  // Allow ±5 minutes flexibility
  const diff = Math.abs(currentMinutes - scheduleMinutes)
  return diff <= 5
}

// Helper function to cleanup old backups
async function cleanupOldBackups(backupDir: string, retentionDays: number): Promise<void> {
  try {
    const files = fs.readdirSync(backupDir)
    const now = new Date()
    const cutoffDate = new Date(now.getTime() - (retentionDays * 24 * 60 * 60 * 1000))
    
    let deletedCount = 0
    
    for (const file of files) {
      if (file.endsWith('.db')) {
        const filePath = path.join(backupDir, file)
        const stats = fs.statSync(filePath)
        
        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath)
          deletedCount++
          console.log(`Deleted old backup: ${file}`)
        }
      }
    }
    
    if (deletedCount > 0) {
      // Log cleanup activity
      await prisma.auditLog.create({
        data: {
          userId: 'system',
          action: 'AUTO_BACKUP_CLEANUP',
          resource: 'SYSTEM',
          resourceId: 'auto-backup',
          oldValues: null,
          newValues: `Cleaned up ${deletedCount} old backup files (retention: ${retentionDays} days)`,
          ipAddress: 'system',
          userAgent: 'cron-job'
        }
      })
    }
  } catch (error) {
    console.error('Cleanup error:', error)
    throw error
  }
}