'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import NotificationPopup, { NotificationData, NotificationType } from '@/components/ui/notification-popup'

interface NotificationContextType {
  showNotification: (type: NotificationType, title: string, message: string, duration?: number) => void
  showSuccess: (message: string, title?: string) => void
  showError: (message: string, title?: string) => void
  showWarning: (message: string, title?: string) => void
  showInfo: (message: string, title?: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: ReactNode
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([])

  const showNotification = (
    type: NotificationType,
    title: string,
    message: string,
    duration: number = 5000
  ) => {
    const id = Date.now().toString()
    const notification: NotificationData = {
      id,
      type,
      title,
      message,
      duration
    }

    setNotifications(prev => [...prev, notification])
  }

  const showSuccess = (message: string, title: string = 'Berhasil') => {
    showNotification('success', title, message)
  }

  const showError = (message: string, title: string = 'Error') => {
    showNotification('error', title, message, 7000) // Error messages stay longer
  }

  const showWarning = (message: string, title: string = 'Peringatan') => {
    showNotification('warning', title, message)
  }

  const showInfo = (message: string, title: string = 'Informasi') => {
    showNotification('info', title, message)
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  const contextValue: NotificationContextType = {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <div className="fixed top-0 right-0 z-50 p-4 space-y-2">
        {notifications.map((notification, index) => (
          <div
            key={notification.id}
            style={{ 
              transform: `translateY(${index * 80}px)` 
            }}
          >
            <NotificationPopup
              notification={notification}
              onClose={removeNotification}
            />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  )
}