import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
    role: string
    department?: string
  }
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!)
  } catch (error) {
    return null
  }
}

export function generateToken(payload: any) {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '1d' })
}

export function withAuth(handler: (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>) {
  return async (req: AuthenticatedRequest, context?: any) => {
    const authHeader = req.headers.get('authorization')
    console.log('Middleware: Authorization header:', authHeader)
    
    const token = authHeader?.replace('Bearer ', '')
    console.log('Middleware: Extracted token:', token ? 'Token exists' : 'No token')
    
    if (!token) {
      console.log('Middleware: No token provided')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token) as any
    console.log('Middleware: Token verification result:', decoded ? 'Valid' : 'Invalid')
    
    if (!decoded) {
      console.log('Middleware: Invalid token')
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    req.user = decoded
    return handler(req, context)
  }
}

export function withRole(roles: string[]) {
  return function(handler: (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>) {
    return withAuth(async (req: AuthenticatedRequest, context?: any) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      return handler(req, context)
    })
  }
}