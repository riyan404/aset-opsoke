'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import {
  LayoutDashboard,
  Package,
  FileText,
  Image,
  BarChart3,
  Archive,
  Settings,
  Users,
  Tag,
  Droplets,
  FileSearch,
  Menu,
  ChevronRight,
  Bot
} from 'lucide-react'

interface MenuItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  section?: string
  requiresPermission?: string | null
}

interface MenuSection {
  id: string
  label: string
  items: MenuItem[]
}

const menuSections: MenuSection[] = [
  {
    id: 'main',
    label: 'Main',
    items: [
      {
        id: 'dashboard',
        label: 'Dasbor',
        icon: LayoutDashboard,
        href: '/dashboard',
        requiresPermission: null
      },
      {
        id: 'assets',
        label: 'Aset',
        icon: Package,
        href: '/dashboard/assets',
        requiresPermission: 'assets'
      },
      {
        id: 'documents',
        label: 'Dokumen',
        icon: FileText,
        href: '/dashboard/documents',
        requiresPermission: 'documents'
      },
      {
        id: 'digital-assets',
        label: 'Aset Digital',
        icon: Image,
        href: '/dashboard/digital-assets',
        requiresPermission: 'digitalAssets'
      }
    ]
  },
  {
    id: 'reports',
    label: 'Laporan',
    items: [
      {
        id: 'archive-reports',
        label: 'Laporan Arsip',
        icon: Archive,
        href: '/dashboard/archive-reports',
        requiresPermission: null
      },
      {
        id: 'compression-stats',
        label: 'Statistik Kompresi',
        icon: BarChart3,
        href: '/dashboard/compression-stats',
        requiresPermission: null
      }
    ]
  },
  {
    id: 'settings',
    label: 'Pengaturan',
    items: [
      {
        id: 'users',
        label: 'Pengguna',
        icon: Users,
        href: '/dashboard/users',
        requiresPermission: null
      },
      {
        id: 'categories',
        label: 'Kategori',
        icon: Tag,
        href: '/dashboard/categories',
        requiresPermission: null
      },
      {
        id: 'ai-chat',
        label: 'Chat With AI',
        icon: Bot,
        href: '/dashboard/ai-chat',
        requiresPermission: 'ai_chat'
      },
      {
        id: 'watermark',
        label: 'Watermark',
        icon: Droplets,
        href: '/dashboard/watermarks',
        requiresPermission: null
      },
      {
        id: 'audit-logs',
        label: 'Log Audit',
        icon: FileSearch,
        href: '/dashboard/audit',
        requiresPermission: null
      },
      {
        id: 'settings',
        label: 'Pengaturan Umum',
        icon: Settings,
        href: '/dashboard/settings',
        requiresPermission: null
      }
    ]
  }
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const { user, permissions, loading } = useAuth()

  // Filter menu items based on permissions
  const getFilteredMenuSections = () => {
    // If still loading, show only items that don't require permissions
    if (loading) {
      console.log('Sidebar: Loading, showing limited menu')
      return menuSections.map(section => ({
        ...section,
        items: section.items.filter(item => !item.requiresPermission)
      })).filter(section => section.items.length > 0)
    }

    // Admin has access to all menu items
    if (user?.role === 'ADMIN') {
      console.log('Sidebar: Admin user, showing all menu items')
      return menuSections
    }

    // If no permissions, show only items that don't require permissions
    if (!permissions) {
      console.log('Sidebar: No permissions, showing limited menu')
      return menuSections.map(section => ({
        ...section,
        items: section.items.filter(item => !item.requiresPermission)
      })).filter(section => section.items.length > 0)
    }

    console.log('Sidebar: Filtering with permissions:', permissions)
    
    return menuSections.map(section => ({
      ...section,
      items: section.items.filter(item => {
        if (!item.requiresPermission) {
          console.log(`Sidebar: ${item.label} - no permission required, showing`)
          return true
        }
        
        const permission = permissions[item.requiresPermission as keyof typeof permissions]
        const canShow = permission && permission.canRead
        console.log(`Sidebar: ${item.label} - permission: ${item.requiresPermission}, canRead: ${permission?.canRead}, showing: ${canShow}`)
        
        return canShow
      })
    })).filter(section => section.items.length > 0)
  }

  const filteredMenuSections = getFilteredMenuSections()

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  // Update body margin when sidebar collapses/expands
  useEffect(() => {
    const body = document.body
    const mainContent = document.querySelector('.main-content')
    
    if (mainContent) {
      if (isCollapsed) {
        (mainContent as HTMLElement).style.marginLeft = '80px'
      } else {
        (mainContent as HTMLElement).style.marginLeft = '280px'
      }
    }
  }, [isCollapsed])

  const isActiveRoute = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <motion.div
      initial={false}
      animate={{
        width: isCollapsed ? 80 : 280
      }}
      transition={{
        duration: 0.3,
        ease: [0.4, 0.0, 0.2, 1]
      }}
      className={cn(
        "fixed left-0 top-0 z-40 flex flex-col h-screen bg-white border-r border-gray-200 shadow-sm",
        className
      )}
    >
      {/* Header with toggle button */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex items-center space-x-3"
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-text-dark">
                Asset Manager
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <Menu className="w-4 h-4 text-text-medium" />
        </Button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-6">
          {filteredMenuSections.map((section) => (
            <div key={section.id} className="px-3">
              {/* Section Label */}
              <div className="mb-3">
                <AnimatePresence mode="wait">
                  {!isCollapsed ? (
                    <motion.h3
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-xs font-medium text-text-medium uppercase tracking-wider px-3"
                    >
                      {section.label}
                    </motion.h3>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="h-px bg-gray-200 mx-3"
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* Menu Items */}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = isActiveRoute(item.href)
                  const Icon = item.icon

                  return (
                    <Link key={item.id} href={item.href}>
                      <motion.div
                        className={cn(
                          "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                          isActive
                            ? "bg-white shadow-sm font-semibold !text-gray-900 border border-active"
                            : "text-text-medium hover:bg-gray-50 hover:text-text-dark !text-gray-600 hover:!text-gray-900"
                        )}
                      >
                        <Icon className={cn(
                          "flex-shrink-0",
                          isCollapsed ? "w-5 h-5" : "w-5 h-5 mr-3",
                          isActive ? "!text-gray-900" : "!text-gray-600"
                        )} />
                        
                        <AnimatePresence mode="wait">
                          {!isCollapsed && (
                            <motion.span
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              transition={{ duration: 0.2 }}
                              className={cn("truncate", isActive ? "!text-gray-900 font-semibold" : "!text-gray-600")}
                            >
                              {item.label}
                            </motion.span>
                          )}
                        </AnimatePresence>

                        {isActive && !isCollapsed && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                            className="ml-auto"
                          >
                            <ChevronRight 
                              className="w-4 h-4 !text-gray-900"
                            />
                          </motion.div>
                        )}
                      </motion.div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-xs text-text-medium text-center"
            >
              © 2024 Asset Manager
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-8 h-8 bg-gray-100 rounded-lg mx-auto"
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}