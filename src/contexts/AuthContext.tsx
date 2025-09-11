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

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  refreshUser: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
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
      localStorage.removeItem('token')
    }
  }

  const refreshUser = async () => {
    if (token) {
      await fetchUser(token)
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, refreshUser, loading }}>
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