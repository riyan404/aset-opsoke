'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { ExternalLink, FolderOpen } from 'lucide-react'

interface GoogleDriveButtonProps {
  onClick?: () => void
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

export function GoogleDriveButton({ 
  onClick, 
  className = '', 
  variant = 'outline',
  size = 'md',
  disabled = false
}: GoogleDriveButtonProps) {
  const sizeClasses = {
    sm: 'px-2 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  return (
    <Button
      onClick={onClick}
      variant={variant}
      disabled={disabled}
      className={`
        bg-white 
        border 
        border-gray-300 
        hover:bg-gray-50 
        hover:border-gray-400
        text-gray-700 
        font-medium 
        rounded-lg 
        shadow-sm 
        transition-all 
        duration-200 
        flex 
        items-center 
        gap-1
        w-full
        min-w-0
        ${sizeClasses[size]}
        ${className}
      `}
    >
      <FolderOpen className="w-3 h-3 flex-shrink-0" />
      <span className="truncate">Download</span>
      <ExternalLink className="w-3 h-3 flex-shrink-0" />
    </Button>
  )
}

export default GoogleDriveButton