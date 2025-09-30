import { writeFile, mkdir } from 'fs/promises'
import { existsSync, createWriteStream } from 'fs'
import path from 'path'

export async function saveFile(file: File, directory: string): Promise<string> {
  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(process.cwd(), 'uploads', directory)
  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true })
  }

  // Generate unique filename
  const timestamp = Date.now()
  const filename = `${timestamp}-${file.name}`
  const filepath = path.join(uploadsDir, filename)

  // Memory-optimized file saving using streams for large files
  if (file.size > 10 * 1024 * 1024) { // Files larger than 10MB
    // Use streaming for large files to avoid memory issues
    const stream = createWriteStream(filepath)
    const reader = file.stream().getReader()
    
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        await new Promise<void>((resolve, reject) => {
          stream.write(Buffer.from(value), (err: Error | null | undefined) => {
            if (err) reject(err)
            else resolve()
          })
        })
      }
      
      await new Promise<void>((resolve, reject) => {
        stream.end((err: Error | null | undefined) => {
          if (err) reject(err)
          else resolve()
        })
      })
    } finally {
      reader.releaseLock()
    }
  } else {
    // Use buffer for smaller files (more efficient for small files)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)
    
    // Explicitly clear buffer reference for garbage collection
    ;(bytes as any).constructor = null
  }

  // Return relative path
  return path.join('uploads', directory, filename)
}

export function getFileExtension(filename: string): string {
  return path.extname(filename).toLowerCase()
}

export function isValidFileType(filename: string, allowedTypes: string[]): boolean {
  const extension = getFileExtension(filename)
  return allowedTypes.includes(extension)
}

export function getFileSize(file: File): number {
  return file.size
}

export const ALLOWED_DOCUMENT_TYPES = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx']
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB