'use client'

import React, { useState, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface NotificationData {
  id: string
  type: NotificationType
  title: string
  message: string
  duration?: number
}

interface NotificationPopupProps {
  notification: NotificationData
  onClose: (id: string) => void
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, notification.duration)
      
      return () => clearTimeout(timer)
    }
  }, [notification])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      onClose(notification.id)
    }, 300) // Wait for animation to complete
  }

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'info':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  const getTitleColor = () => {
    switch (notification.type) {
      case 'success':
        return 'text-green-800'
      case 'error':
        return 'text-red-800'
      case 'warning':
        return 'text-yellow-800'
      case 'info':
        return 'text-blue-800'
      default:
        return 'text-blue-800'
    }
  }

  const getMessageColor = () => {
    switch (notification.type) {
      case 'success':
        return 'text-green-700'
      case 'error':
        return 'text-red-700'
      case 'warning':
        return 'text-yellow-700'
      case 'info':
        return 'text-blue-700'
      default:
        return 'text-blue-700'
    }
  }

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-sm w-full
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className={`
        rounded-lg border shadow-lg p-4 ${getBackgroundColor()}
      `}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 flex-1">
            <h3 className={`text-sm font-medium ${getTitleColor()}`}>
              {notification.title}
            </h3>
            <p className={`mt-1 text-sm ${getMessageColor()}`}>
              {notification.message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={handleClose}
              className={`
                inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2
                ${notification.type === 'success' ? 'text-green-400 hover:bg-green-100 focus:ring-green-600' : ''}
                ${notification.type === 'error' ? 'text-red-400 hover:bg-red-100 focus:ring-red-600' : ''}
                ${notification.type === 'warning' ? 'text-yellow-400 hover:bg-yellow-100 focus:ring-yellow-600' : ''}
                ${notification.type === 'info' ? 'text-blue-400 hover:bg-blue-100 focus:ring-blue-600' : ''}
              `}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationPopup