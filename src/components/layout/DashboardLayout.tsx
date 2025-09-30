'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sidebar } from '@/components/ui/sidebar'
import { 
  Settings,
  LogOut,
  ChevronDown,
} from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, logout, loading, token } = useAuth()
  const router = useRouter()
  const [userPermissions, setUserPermissions] = useState<{ [key: string]: { canRead: boolean, canWrite: boolean, canDelete: boolean } }>({})
  const [permissionsLoaded, setPermissionsLoaded] = useState(false)

  useEffect(() => {
    console.log('DashboardLayout: useEffect - loading:', loading, 'user:', user)
    if (!loading && !user) {
      console.log('DashboardLayout: Redirecting to login - no user found')
      router.push('/login')
    }
  }, [user, loading, router])

  // Fetch user permissions
  useEffect(() => {
    if (user && user.role !== 'ADMIN' && token && user.department) {
      fetchUserPermissions()
    } else if (user) {
      setPermissionsLoaded(true)
    }
  }, [user, token])

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
        const errorText = await response.text()
        console.error('Error details:', errorText)
      }
    } catch (error) {
      console.error('Failed to fetch user permissions:', error)
    } finally {
      setPermissionsLoaded(true)
    }
  }

  if (loading || !permissionsLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area with left margin to account for fixed sidebar */}
      <div className="main-content ml-[280px] flex flex-col min-h-screen transition-all duration-300 ease-in-out">
        {/* Top bar */}
        <div className="flex h-16 items-center justify-between bg-white px-6 shadow-sm border-b border-gray-200">
          {/* Spacer for centering when needed */}
          <div className="flex-1"></div>
          
          {/* Profile Menu - Top Right */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-50">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </span>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-text-dark">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-text-medium">{user.role}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-text-medium" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div>
                  <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-text-medium">{user.role}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Pengaturan
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Page content */}
        <main className="flex-1 p-8 bg-background-light">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}