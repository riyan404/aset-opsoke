'use client'

import { useEffect, useState } from 'react'
import { X, Info } from 'lucide-react'

interface InfoModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message: string
  autoClose?: boolean
  autoCloseDelay?: number
}

export default function InfoModal({
  isOpen,
  onClose,
  title = "Information",
  message,
  autoClose = true,
  autoCloseDelay = 3000
}: InfoModalProps) {
  const [progress, setProgress] = useState(100)

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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Progress bar for auto-close */}
        {autoClose && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 rounded-t-xl overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="p-6 pt-8">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center animate-in zoom-in duration-500 delay-200">
              <Info className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
            {title}
          </h3>

          {/* Message */}
          <p className="text-gray-600 text-center mb-6 leading-relaxed">
            {message}
          </p>

          {/* Action button */}
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}