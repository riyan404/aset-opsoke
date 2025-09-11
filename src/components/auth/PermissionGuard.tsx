'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Shield, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface PermissionGuardProps {
  children: React.ReactNode
  module: string
  permission: 'canRead' | 'canWrite' | 'canDelete'
  fallbackPath?: string
}

export default function PermissionGuard({ 
  children, 
  module, 
  permission, 
  fallbackPath = '/dashboard' 
}: PermissionGuardProps) {
  const { user, token, loading } = useAuth()
  const router = useRouter()
  const [userPermissions, setUserPermissions] = useState<{ [key: string]: { canRead: boolean, canWrite: boolean, canDelete: boolean } }>({})
  const [permissionsLoaded, setPermissionsLoaded] = useState(false)
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }

    if (user && user.role !== 'ADMIN' && token && user.department) {
      fetchUserPermissions()
    } else if (user) {
      // Admin has access to everything
      setHasAccess(true)
      setPermissionsLoaded(true)
    }
  }, [user, loading, token, router])

  useEffect(() => {
    if (permissionsLoaded && user) {
      checkAccess()
    }
  }, [permissionsLoaded, userPermissions, user, module, permission])

  const fetchUserPermissions = async () => {
    if (!user?.department) {
      setPermissionsLoaded(true)
      return
    }
    
    try {
      const response = await fetch(`/api/permissions?department=${encodeURIComponent(user.department)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (response.ok) {
        const data = await response.json()
        const permissionMap: { [key: string]: { canRead: boolean, canWrite: boolean, canDelete: boolean } } = {}
        
        data.permissions.forEach((perm: any) => {
          permissionMap[perm.module] = {
            canRead: perm.canRead,
            canWrite: perm.canWrite,
            canDelete: perm.canDelete
          }
        })
        
        setUserPermissions(permissionMap)
      } else {
        console.error('Failed to fetch permissions, status:', response.status)
      }
    } catch (error) {
      console.error('Failed to fetch user permissions:', error)
    } finally {
      setPermissionsLoaded(true)
    }
  }

  const checkAccess = () => {
    // Admin has access to everything
    if (user?.role === 'ADMIN') {
      setHasAccess(true)
      return
    }

    // Check user permissions for the module
    if (module && userPermissions[module]) {
      setHasAccess(userPermissions[module][permission])
    } else {
      setHasAccess(false)
    }
  }

  // Show loading state
  if (loading || !permissionsLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  // Show access denied if user doesn't have permission
  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="w-16 h-16 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Akses Ditolak</h2>
            <p className="text-gray-600 text-center mb-6">
              Anda tidak memiliki izin untuk mengakses halaman ini. Silakan hubungi administrator untuk mendapatkan akses.
            </p>
            <Button 
              onClick={() => router.push(fallbackPath)}
              className="bg-[#187F7E] hover:bg-[#00AAA8] text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render children if user has access
  return <>{children}</>
}