'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Shield } from 'lucide-react'

interface PermissionGuardProps {
  module: string
  permission: 'canRead' | 'canWrite'
  children: React.ReactNode
  fallback?: React.ReactNode
  showAccessDenied?: boolean
}

export function PermissionGuard({ 
  module, 
  permission, 
  children, 
  fallback = null,
  showAccessDenied = true 
}: PermissionGuardProps) {
  const { user, permissions } = useAuth()

  // Check if user has the required permission for the module
  const hasPermission = () => {
    if (!user || !permissions) return false
    
    // Admin has all permissions
    if (user.role === 'ADMIN') return true
    
    // Map module names to permissions object keys
    const moduleMap: Record<string, keyof typeof permissions> = {
      'ASSETS': 'assets',
      'DOCUMENTS': 'documents', 
      'DIGITAL_ASSETS': 'digitalAssets',
      'USERS': 'users',
      'CATEGORIES': 'categories',
      'WATERMARKS': 'watermarks',
      'AUDIT_LOGS': 'assets', // fallback to assets
      'REPORTS': 'assets', // fallback to assets
      'SETTINGS': 'watermarks' // use watermarks permissions for settings
    }
    
    const permissionKey = moduleMap[module] || module.toLowerCase()
    
    // Check specific module permission
    const modulePermissions = permissions[permissionKey as keyof typeof permissions]
    if (!modulePermissions) return false
    
    return modulePermissions[permission] === true
  }

  if (!hasPermission()) {
    // If fallback is provided, show it instead of access denied
    if (fallback !== null) {
      return <>{fallback}</>
    }
    
    // If showAccessDenied is false, render nothing
    if (!showAccessDenied) {
      return null
    }
    
    // Default access denied message
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Akses Ditolak</h2>
          <p className="text-gray-600">
            Anda tidak memiliki izin untuk mengakses halaman ini.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Hook untuk mengecek permission tanpa rendering
export function usePermission(module: string, permission: 'canRead' | 'canWrite') {
  const { user, permissions } = useAuth()
  
  if (!user || !permissions) return false
  
  // Admin has all permissions
  if (user.role === 'ADMIN') return true
  
  // Map module names to permissions object keys
  const moduleMap: Record<string, keyof typeof permissions> = {
    'ASSETS': 'assets',
    'DOCUMENTS': 'documents', 
    'DIGITAL_ASSETS': 'digitalAssets',
    'USERS': 'users',
    'CATEGORIES': 'categories',
    'WATERMARKS': 'watermarks',
    'AUDIT_LOGS': 'assets', // fallback to assets
    'REPORTS': 'assets', // fallback to assets
    'SETTINGS': 'watermarks' // use watermarks permissions for settings
  }
  
  const permissionKey = moduleMap[module] || module.toLowerCase()
  
  // Check specific module permission
  const modulePermissions = permissions[permissionKey as keyof typeof permissions]
  if (!modulePermissions) return false
  
  return modulePermissions[permission] === true
}