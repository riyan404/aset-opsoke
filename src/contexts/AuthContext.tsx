'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface User {
  id: string
  email: string
  username: string
  firstName: string
  lastName: string
  role: string
  department?: string
  position?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  lastLogin: string | null
}

interface Permissions {
  assets: {
    canRead: boolean
    canWrite: boolean
    canDelete: boolean
  }
  documents: {
    canRead: boolean
    canWrite: boolean
    canDelete: boolean
  }
  digitalAssets: {
    canRead: boolean
    canWrite: boolean
    canDelete: boolean
  }
  users: {
    canRead: boolean
    canWrite: boolean
    canDelete: boolean
  }
  categories: {
    canRead: boolean
    canWrite: boolean
    canDelete: boolean
  }
  watermarks: {
    canRead: boolean
    canWrite: boolean
    canDelete: boolean
  }
}

interface AuthContextType {
  user: User | null
  token: string | null
  permissions: Permissions | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  refreshUser: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [permissions, setPermissions] = useState<Permissions | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('AuthContext: useEffect triggered')
    const storedToken = localStorage.getItem('token')
    console.log('AuthContext: Checking stored token:', storedToken ? 'Token exists' : 'No token found')
    console.log('AuthContext: Full token value:', storedToken)
    
    if (storedToken) {
      console.log('AuthContext: Setting token and fetching user')
      setToken(storedToken)
      fetchUser(storedToken)
    } else {
      console.log('AuthContext: No token found, setting loading to false')
      setLoading(false)
    }
  }, [])

  const fetchUser = async (authToken: string) => {
    try {
      console.log('AuthContext: Fetching user with token')
      const response = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      console.log('AuthContext: /api/auth/me response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('AuthContext: User data received:', data.user)
        setUser(data.user)
        
        // Fetch permissions after user is set
        await fetchPermissions(authToken)
      } else {
        // Token is invalid, clear it
        console.log('AuthContext: Token invalid, clearing localStorage')
        localStorage.removeItem('token')
        setToken(null)
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
      localStorage.removeItem('token')
      setToken(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchPermissions = async (authToken: string) => {
    try {
      console.log('AuthContext: Fetching permissions')
      
      // Fetch all permissions in parallel
      const [assetsRes, documentsRes, digitalAssetsRes, usersRes, categoriesRes, watermarksRes] = await Promise.all([
        fetch('/api/permissions/assets', {
          headers: { Authorization: `Bearer ${authToken}` }
        }),
        fetch('/api/permissions/documents', {
          headers: { Authorization: `Bearer ${authToken}` }
        }),
        fetch('/api/permissions/digital-assets', {
          headers: { Authorization: `Bearer ${authToken}` }
        }),
        fetch('/api/permissions/users', {
          headers: { Authorization: `Bearer ${authToken}` }
        }),
        fetch('/api/permissions/categories', {
          headers: { Authorization: `Bearer ${authToken}` }
        }),
        fetch('/api/permissions/watermarks', {
          headers: { Authorization: `Bearer ${authToken}` }
        })
      ])

      if (assetsRes.ok && documentsRes.ok && digitalAssetsRes.ok && usersRes.ok && categoriesRes.ok && watermarksRes.ok) {
        const [assets, documents, digitalAssets, users, categories, watermarks] = await Promise.all([
          assetsRes.json(),
          documentsRes.json(),
          digitalAssetsRes.json(),
          usersRes.json(),
          categoriesRes.json(),
          watermarksRes.json()
        ])

        setPermissions({
          assets: {
            canRead: assets.canRead,
            canWrite: assets.canWrite,
            canDelete: assets.canDelete
          },
          documents: {
            canRead: documents.canRead,
            canWrite: documents.canWrite,
            canDelete: documents.canDelete
          },
          digitalAssets: {
            canRead: digitalAssets.canRead,
            canWrite: digitalAssets.canWrite,
            canDelete: digitalAssets.canDelete
          },
          users: {
            canRead: users.canRead,
            canWrite: users.canWrite,
            canDelete: users.canDelete
          },
          categories: {
            canRead: categories.canRead,
            canWrite: categories.canWrite,
            canDelete: categories.canDelete
          },
          watermarks: {
            canRead: watermarks.canRead,
            canWrite: watermarks.canWrite,
            canDelete: watermarks.canDelete
          }
        })
        
        console.log('AuthContext: Permissions loaded:', {
          assets,
          documents,
          digitalAssets,
          users,
          categories,
          watermarks
        })
      }
    } catch (error) {
      console.error('Failed to fetch permissions:', error)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        setToken(data.token)
        localStorage.setItem('token', data.token)
        
        // Fetch permissions after successful login
        await fetchPermissions(data.token)
        
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Network error' }
    }
  }

  const logout = async () => {
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setToken(null)
      setPermissions(null)
      localStorage.removeItem('token')
    }
  }

  const refreshUser = async () => {
    if (token) {
      await fetchUser(token)
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, permissions, login, logout, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}