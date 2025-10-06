'use client'

import { useState } from 'react'
import { X, Package, MapPin, Calendar, User, Info, Tag, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Asset {
  id: string
  name: string
  description?: string
  category: string
  subcategory?: string
  brand?: string
  model?: string
  serialNumber?: string
  barcode?: string
  condition: string
  location: string
  department?: string
  assignedTo?: string
  warrantyUntil?: string
  notes?: string
  tags?: string
  photoPath?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdBy: {
    firstName: string
    lastName: string
    email: string
  }
}

interface AssetDetailModalProps {
  asset: Asset
  isOpen: boolean
  onClose: () => void
}

export function AssetDetailModal({ asset, isOpen, onClose }: AssetDetailModalProps) {
  if (!isOpen) return null

  const getConditionBadge = (condition: string) => {
    const colors = {
      EXCELLENT: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      GOOD: 'bg-blue-50 text-blue-700 border-blue-200',
      FAIR: 'bg-amber-50 text-amber-700 border-amber-200',
      POOR: 'bg-orange-50 text-orange-700 border-orange-200',
      DAMAGED: 'bg-red-50 text-red-700 border-red-200',
      DISPOSED: 'bg-gray-50 text-gray-700 border-gray-200',
    }
    return colors[condition as keyof typeof colors] || 'bg-gray-50 text-gray-700 border-gray-200'
  }

  const getConditionText = (condition: string) => {
    const translations = {
      EXCELLENT: 'Sangat Baik',
      GOOD: 'Baik',
      FAIR: 'Cukup',
      POOR: 'Buruk',
      DAMAGED: 'Rusak',
      DISPOSED: 'Dibuang',
    }
    return translations[condition as keyof typeof translations] || condition
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-[#0EB6B4]/5 to-[#187F7E]/5">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#0EB6B4] to-[#187F7E] rounded-xl flex items-center justify-center shadow-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{asset.name}</h2>
              <p className="text-sm text-gray-600 font-medium">{asset.brand} {asset.model}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-10 w-10 p-0 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-140px)]">
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Photo and Basic Info */}
              <div className="space-y-8">
                {/* Photo Section */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-6 border border-gray-200/50">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <Package className="w-6 h-6 mr-3 text-[#187F7E]" />
                    Foto Produk
                  </h3>
                  <div className="flex justify-center">
                    {asset.photoPath ? (
                      <div className="relative group">
                        <img
                          src={asset.photoPath}
                          alt={asset.name}
                          className="w-full h-64 object-cover rounded-lg border border-gray-200 shadow-sm group-hover:shadow-md transition-shadow duration-200"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const placeholder = target.nextElementSibling as HTMLElement;
                            if (placeholder) placeholder.style.display = 'flex';
                          }}
                        />
                        <div className="hidden w-full h-64 bg-gray-100 rounded-lg border border-gray-200 flex-col items-center justify-center">
                          <Package className="w-16 h-16 text-gray-400 mb-3" />
                          <p className="text-gray-500 font-medium">Foto tidak dapat dimuat</p>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200/50 rounded-lg border border-gray-200 flex flex-col items-center justify-center">
                        <Package className="w-16 h-16 text-gray-400 mb-3" />
                        <p className="text-gray-500 font-medium">Foto tidak tersedia</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Basic Information */}
                <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-xl p-6 border border-gray-200/50 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <Info className="w-6 h-6 mr-3 text-[#187F7E]" />
                    Basic Information
                  </h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Category</span>
                        <p className="text-gray-900 font-medium">{asset.category}</p>
                      </div>
                      {asset.subcategory && (
                        <div className="space-y-2">
                          <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Subcategory</span>
                          <p className="text-gray-900 font-medium">{asset.subcategory}</p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Condition</span>
                      <div>
                        <span className={`inline-flex px-4 py-2 text-sm font-semibold rounded-full border ${getConditionBadge(asset.condition)}`}>
                          {getConditionText(asset.condition)}
                        </span>
                      </div>
                    </div>
                    {asset.serialNumber && (
                      <div className="space-y-2">
                        <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Serial Number</span>
                        <p className="text-gray-900 font-mono bg-gray-100 px-4 py-3 rounded-lg">{asset.serialNumber}</p>
                      </div>
                    )}
                    {asset.barcode && (
                      <div className="space-y-2">
                        <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Barcode</span>
                        <p className="text-gray-900 font-mono bg-gray-100 px-4 py-3 rounded-lg">{asset.barcode}</p>
                      </div>
                    )}
                    {asset.description && (
                      <div className="space-y-2">
                        <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Description</span>
                        <p className="text-gray-900 leading-relaxed">{asset.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Other Information */}
              <div className="space-y-8">
                {/* Location & Assignment */}
                <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-xl p-6 border border-gray-200/50 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <MapPin className="w-6 h-6 mr-3 text-[#187F7E]" />
                    Location & Assignment
                  </h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Location</span>
                      <p className="text-gray-900 font-medium">{asset.location}</p>
                    </div>
                    {asset.department && (
                      <div className="space-y-2">
                        <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Department</span>
                        <p className="text-gray-900 font-medium">{asset.department}</p>
                      </div>
                    )}
                    {asset.assignedTo && (
                      <div className="space-y-2">
                        <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Assigned To</span>
                        <p className="text-gray-900 font-medium">{asset.assignedTo}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Important Dates */}
                <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-xl p-6 border border-gray-200/50 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <Calendar className="w-6 h-6 mr-3 text-[#187F7E]" />
                    Important Dates
                  </h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Warranty Until</span>
                      <p className="text-gray-900 font-medium">{formatDate(asset.warrantyUntil)}</p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Created At</span>
                      <p className="text-gray-900 font-medium">{formatDate(asset.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Creator Information */}
                <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-xl p-6 border border-gray-200/50 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <User className="w-6 h-6 mr-3 text-[#187F7E]" />
                    Creator Information
                  </h3>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#0EB6B4] to-[#187F7E] rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">
                        {asset.createdBy.firstName.charAt(0)}{asset.createdBy.lastName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-lg">
                        {asset.createdBy.firstName} {asset.createdBy.lastName}
                      </p>
                      <p className="text-gray-500">{asset.createdBy.email}</p>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                {(asset.notes || asset.tags) && (
                  <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-xl p-6 border border-gray-200/50 shadow-sm">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                      <FileText className="w-6 h-6 mr-3 text-[#187F7E]" />
                      Additional Information
                    </h3>
                    <div className="space-y-6">
                      {asset.notes && (
                        <div className="space-y-2">
                          <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Notes</span>
                          <p className="text-gray-900 leading-relaxed bg-gray-50 p-4 rounded-lg">{asset.notes}</p>
                        </div>
                      )}
                      {asset.tags && (
                        <div className="space-y-2">
                          <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide flex items-center">
                            <Tag className="w-4 h-4 mr-2" />
                            Tags
                          </span>
                          <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{asset.tags}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-100 bg-gray-50/50">
          <Button 
            onClick={onClose} 
            variant="outline"
            className="px-6 py-2 font-medium hover:bg-gray-100 transition-colors"
          >
            Tutup
          </Button>
        </div>
      </div>
    </div>
  )
}