'use client'

import { useEffect, useState } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

interface NotificationModalProps {
  isOpen: boolean
  onClose: () => void
  type: NotificationType
  title?: string
  message: string
  autoClose?: boolean
  autoCloseDelay?: number
  showCloseButton?: boolean
}

const typeConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconColor: 'text-green-600',
    titleColor: 'text-green-900',
    messageColor: 'text-green-700',
    buttonColor: 'bg-green-600 hover:bg-green-700',
    defaultTitle: 'Berhasil!'
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    iconColor: 'text-red-600',
    titleColor: 'text-red-900',
    messageColor: 'text-red-700',
    buttonColor: 'bg-red-600 hover:bg-red-700',
    defaultTitle: 'Error!'
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    iconColor: 'text-yellow-600',
    titleColor: 'text-yellow-900',
    messageColor: 'text-yellow-700',
    buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
    defaultTitle: 'Peringatan!'
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-600',
    titleColor: 'text-blue-900',
    messageColor: 'text-blue-700',
    buttonColor: 'bg-blue-600 hover:bg-blue-700',
    defaultTitle: 'Informasi'
  }
}

export function NotificationModal({
  isOpen,
  onClose,
  type,
  title,
  message,
  autoClose = false,
  autoCloseDelay = 3000,
  showCloseButton = true
}: NotificationModalProps) {
  const [progress, setProgress] = useState(100)
  const config = typeConfig[type]
  const Icon = config.icon
  const displayTitle = title || config.defaultTitle

  useEffect(() => {
    if (!isOpen) {
      setProgress(100)
      return
    }

    if (autoClose) {
      const timer = setTimeout(() => {
        onClose()
      }, autoCloseDelay)

      const progressTimer = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - (100 / (autoCloseDelay / 100))
          return newProgress <= 0 ? 0 : newProgress
        })
      }, 100)

      return () => {
        clearTimeout(timer)
        clearInterval(progressTimer)
      }
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 ${config.bgColor} border-2 ${config.borderColor} rounded-xl flex items-center justify-center`}>
              <Icon className={`w-6 h-6 ${config.iconColor}`} />
            </div>
            <div>
              <h2 className={`text-xl font-semibold ${config.titleColor}`}>{displayTitle}</h2>
              <p className="text-sm text-gray-500 mt-0.5">Notifikasi sistem</p>
            </div>
          </div>
          {showCloseButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className={`${config.bgColor} border ${config.borderColor} rounded-lg p-4`}>
            <p className={`text-sm ${config.messageColor} leading-relaxed`}>{message}</p>
          </div>

          {/* Progress bar for auto-close */}
          {autoClose && (
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div 
                className={`h-1 rounded-full transition-all duration-100 ${config.buttonColor.split(' ')[0]}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
          <Button
            onClick={onClose}
            className={`${config.buttonColor} text-white px-6 shadow-lg hover:shadow-xl transition-all duration-200`}
          >
            OK
          </Button>
        </div>
      </div>
    </div>
  )
}