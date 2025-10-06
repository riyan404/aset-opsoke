'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  FileImage, 
  ExternalLink, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Grid3X3,
  List,
  Download,
  Calendar,
  User,
  Building2,
  Tag,
  ImageIcon
} from 'lucide-react'
import { GoogleDriveButton } from '@/components/ui/google-drive-button'
import { ActionsDropdown } from '@/components/ui/actions-dropdown'
import { PermissionGuard, usePermission } from '@/components/PermissionGuard'

// Helper functions
const parseTags = (tags: string | null): string[] => {
  if (!tags) return []
  try {
    return JSON.parse(tags)
  } catch {
    return []
  }
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Interfaces
interface DigitalAsset {
  id: string
  contentName: string
  description: string | null
  tags: string | null
  aspectRatio: 'RATIO_4_3' | 'RATIO_9_16'
  department: string | null
  googleDriveLink: string | null
  previewFile: string | null
  previewFileName: string | null
  previewFileSize: number | null
  createdAt: string
  updatedAt: string
  createdBy: {
    firstName: string
    lastName: string
  }
}

interface PaginationInfo {
  page: number
  pages: number
  total: number
  limit: number
}

// Enhanced AssetCard component with better styling
const AssetCard = React.memo(({ 
  asset, 
  onView, 
  onEdit, 
  onDelete, 
  canWrite, 
  canDelete, 
  shouldLoadImage 
}: {
  asset: DigitalAsset
  onView: (asset: DigitalAsset) => void
  onEdit: (asset: DigitalAsset) => void
  onDelete: (asset: DigitalAsset) => void
  canWrite: boolean
  canDelete: boolean
  shouldLoadImage: boolean
}) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md hover:shadow-xl hover:-translate-y-1">
      <CardContent className="p-0">
        {/* Image Container */}
        <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-t-lg overflow-hidden">
          {shouldLoadImage && asset.previewFile && !imageError ? (
            <img 
              src={asset.previewFile.startsWith('data:') ? asset.previewFile : `data:image/jpeg;base64,${asset.previewFile}`}
              alt={asset.contentName}
              className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-gray-400" />
            </div>
          )}

          {/* Aspect Ratio Badge */}
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-white/90 text-gray-900 text-xs">
              {asset.aspectRatio === 'RATIO_4_3' ? '4:3' : '9:16'}
            </Badge>
          </div>
        </div>

        {/* Action Buttons - Responsive layout */}
        <div className="px-3 py-3 bg-gray-50 border-b">
          <div className="flex items-center gap-2 w-full min-w-0">
            <GoogleDriveButton 
              size="sm"
              className="flex-1 min-w-0 truncate text-xs sm:text-sm"
              onClick={() => {
                if (asset.googleDriveLink) {
                  window.open(asset.googleDriveLink, '_blank')
                } else {
                  console.log('No Google Drive link available for:', asset.contentName)
                }
              }}
              disabled={!asset.googleDriveLink}
            />
            <div className="flex-shrink-0">
              <ActionsDropdown
                items={[
                  {
                    label: 'Lihat',
                    icon: Eye,
                    onClick: () => onView(asset),
                    variant: 'default'
                  },
                  ...(canWrite ? [{
                    label: 'Edit',
                    icon: Edit,
                    onClick: () => onEdit(asset),
                    variant: 'default' as const
                  }] : []),
                  ...(canDelete ? [{
                    label: 'Hapus',
                    icon: Trash2,
                    onClick: () => onDelete(asset),
                    variant: 'destructive' as const
                  }] : [])
                ]}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm leading-tight">
              {asset.contentName}
            </h3>
            {asset.description && (
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                {asset.description}
              </p>
            )}
          </div>

          {/* Tags */}
          {asset.tags && asset.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {parseTags(asset.tags).slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs px-2 py-0.5">
                  {tag}
                </Badge>
              ))}
              {parseTags(asset.tags).length > 2 && (
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  +{parseTags(asset.tags).length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Meta Info */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              <span className="truncate">{asset.department}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(asset.createdAt)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

// Enhanced LoadingSkeleton
const LoadingSkeleton = () => (
  <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
    {Array.from({ length: 12 }).map((_, i) => (
      <Card key={i} className="border-0 shadow-md">
        <CardContent className="p-0">
          <Skeleton className="aspect-square rounded-t-lg" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-5 w-16" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
)

// Debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Add lazy loading hook
const useLazyLoading = (page: number) => {
  const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set([1]))
  
  const shouldLoadImages = useCallback((currentPage: number) => {
    // Always load images if we have data for the current page
    return true
  }, [])
  
  const markPageAsLoaded = useCallback((pageNum: number) => {
    setLoadedPages(prev => new Set([...prev, pageNum]))
  }, [])
  
  return { shouldLoadImages, markPageAsLoaded }
}

export default function DigitalAssetsPage() {
  const { token } = useAuth()
  
  // Permission hooks
  const canWrite = usePermission('DIGITAL_ASSETS', 'canWrite')
  
  // State management
  const [digitalAssets, setDigitalAssets] = useState<DigitalAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [aspectRatioFilter, setAspectRatioFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [selectedAsset, setSelectedAsset] = useState<DigitalAsset | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [accessDeniedModal, setAccessDeniedModal] = useState({
    isOpen: false,
    message: ''
  })

  // Lazy loading hook
  const { shouldLoadImages, markPageAsLoaded } = useLazyLoading(currentPage)

  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Memoized fetch function with server-side pagination
  const fetchDigitalAssets = useCallback(async (page: number = 1, search: string = '', aspectRatio: string = 'all') => {
    if (!token) return

    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(search && { search }),
        ...(aspectRatio !== 'all' && { aspectRatio })
      })

      const response = await fetch(`/api/digital-assets?${params}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store' // Ensure fresh data
      })

      if (response.ok) {
        const data = await response.json()
        setDigitalAssets(data.digitalAssets || [])
        setPagination(data.pagination)
        // Mark current page as loaded for image lazy loading
        markPageAsLoaded(page)
      } else {
        console.error('Failed to fetch digital assets')
        setDigitalAssets([])
        setPagination(null)
      }
    } catch (error) {
      console.error('Error fetching digital assets:', error)
      setDigitalAssets([])
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }, [token])

  // Effects
  useEffect(() => {
    if (token) {
      fetchDigitalAssets(currentPage, debouncedSearchTerm, aspectRatioFilter)
    }
  }, [token, currentPage, debouncedSearchTerm, aspectRatioFilter, fetchDigitalAssets])

  // Event handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handleFilterChange = (value: string) => {
    setAspectRatioFilter(value)
    setCurrentPage(1) // Reset to first page when filtering
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleViewAsset = (asset: DigitalAsset) => {
    setSelectedAsset(asset)
    setShowDetailModal(true)
  }

  const handleEditAsset = (asset: DigitalAsset) => {
    if (canWrite) {
      window.location.href = `/dashboard/digital-assets/${asset.id}/edit`
    } else {
      showAccessDenied('Anda tidak memiliki izin untuk mengedit aset digital')
    }
  }

  const handleDeleteAsset = async (asset: DigitalAsset) => {
    if (!canWrite) {
      showAccessDenied('Anda tidak memiliki izin untuk menghapus aset digital')
      return
    }

    // Show confirmation dialog
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus aset digital "${asset.name}"?\n\nTindakan ini tidak dapat dibatalkan.`
    )

    if (!confirmed) return

    try {
      const response = await fetch(`/api/digital-assets/${asset.id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      })

      if (response.ok) {
        // Remove asset from local state
        setDigitalAssets(prev => prev.filter(a => a.id !== asset.id))
        
        // Show success message
        alert('Aset digital berhasil dihapus')
        
        // Refresh the list to update pagination
        fetchDigitalAssets(currentPage, debouncedSearchTerm, aspectRatioFilter)
      } else {
        const errorData = await response.json()
        alert(`Gagal menghapus aset digital: ${errorData.error || 'Terjadi kesalahan'}`)
      }
    } catch (error) {
      console.error('Error deleting asset:', error)
      alert('Terjadi kesalahan saat menghapus aset digital')
    }
  }

  const showAccessDenied = (message: string) => {
    setAccessDeniedModal({
      isOpen: true,
      message
    })
  }

  return (
    <PermissionGuard module="DIGITAL_ASSETS" permission="canRead">
      <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Aset Digital
          </h1>
          <p className="text-gray-600">
            Database file design untuk kebutuhan kreatif perusahaan
          </p>
        </div>
        
        <PermissionGuard 
          module="DIGITAL_ASSETS" 
          permission="canWrite"
          showAccessDenied={false}
          fallback={
            <Button 
              onClick={() => showAccessDenied('Anda tidak memiliki izin untuk menambah aset digital')}
              className="bg-gray-400 hover:bg-gray-500 text-white cursor-not-allowed"
            >
              <Plus className="mr-2 h-4 w-4" />
              Tambah Aset Digital
            </Button>
          }
        >
          <Button 
            onClick={() => window.location.href = '/dashboard/digital-assets/new'}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Aset Digital
          </Button>
        </PermissionGuard>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Cari berdasarkan nama, deskripsi, atau tag..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>
        <Select value={aspectRatioFilter} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter Rasio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Rasio</SelectItem>
            <SelectItem value="RATIO_4_3">4:3 (Landscape)</SelectItem>
            <SelectItem value="RATIO_9_16">9:16 (Portrait)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      {pagination && (
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            Menampilkan {digitalAssets.length} dari {pagination.total} aset
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && digitalAssets.length === 0 && <LoadingSkeleton />}

      {/* Content */}
      {!loading && digitalAssets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileImage className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada aset digital</h3>
            <p className="text-gray-600 text-center mb-4">
              Mulai menambahkan file design untuk membangun database kreatif perusahaan
            </p>
            {canWrite && (
              <Button 
                onClick={() => window.location.href = '/dashboard/digital-assets/new'}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah Aset Digital Pertama
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {digitalAssets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                onView={handleViewAsset}
                onEdit={handleEditAsset}
                onDelete={handleDeleteAsset}
                canWrite={canWrite}
                canDelete={canWrite} // Using canWrite for delete permission as well
                shouldLoadImage={shouldLoadImages(currentPage)}
              />
            ))}
          </div>
          
          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="mt-12 mb-6">
              <div className="bg-white rounded-xl shadow-md p-4 max-w-3xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handlePageChange(1)}
                      disabled={pagination.page === 1}
                      variant="outline"
                      size="sm"
                    >
                      First
                    </Button>
                    <Button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      variant="outline"
                      size="sm"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      variant="outline"
                      size="sm"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handlePageChange(pagination.pages)}
                      disabled={pagination.page === pagination.pages}
                      variant="outline"
                      size="sm"
                    >
                      Last
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Asset Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden p-0">
          <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
            <DialogTitle className="text-xl font-bold text-gray-900">
              {selectedAsset?.contentName}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Detail informasi aset digital
            </DialogDescription>
          </DialogHeader>
          
          {selectedAsset && (
            <div className="flex flex-col lg:flex-row h-full overflow-hidden">
              {/* Left Column - Image */}
              <div className="lg:w-1/2 p-6 bg-gray-50 flex flex-col">
                <div className="flex-1 bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-0">
                    {selectedAsset.previewFile ? (
                      <img 
                        src={selectedAsset.previewFile.startsWith('data:') ? selectedAsset.previewFile : `data:image/jpeg;base64,${selectedAsset.previewFile}`}
                        alt={selectedAsset.contentName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-gray-400">
                        <FileImage className="w-20 h-20 mx-auto mb-2" />
                        <p className="text-sm">Tidak ada preview</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Information */}
              <div className="lg:w-1/2 p-6 overflow-y-auto">
                <div className="space-y-6">
                  {/* Informasi Dasar */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
                      <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-3"></div>
                      Informasi Dasar
                    </h3>
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                        <span className="text-gray-600 font-medium">Nama:</span>
                        <span className="font-semibold text-gray-900 break-words">{selectedAsset.contentName}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                        <span className="text-gray-600 font-medium">Rasio Aspek:</span>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${selectedAsset.aspectRatio === 'RATIO_4_3' ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
                          <span className="font-semibold text-gray-900">
                            {selectedAsset.aspectRatio === 'RATIO_4_3' ? '4:3 (Landscape)' : '9:16 (Portrait)'}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                        <span className="text-gray-600 font-medium">Departemen:</span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-gray-800">
                          {selectedAsset.department}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Informasi File */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
                      <div className="w-2 h-6 bg-gradient-to-b from-green-500 to-teal-500 rounded-full mr-3"></div>
                      Informasi File
                    </h3>
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                        <span className="text-gray-600 font-medium">Dibuat oleh:</span>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-semibold text-gray-900">
                            {selectedAsset.createdBy.firstName} {selectedAsset.createdBy.lastName}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                        <span className="text-gray-600 font-medium">Tanggal dibuat:</span>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-semibold text-gray-900">{formatDate(selectedAsset.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                        <span className="text-gray-600 font-medium">Terakhir diupdate:</span>
                        <span className="font-semibold text-gray-900">{formatDate(selectedAsset.updatedAt)}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                        <span className="text-gray-600 font-medium">Nama file:</span>
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded break-all">{selectedAsset.previewFileName}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                        <span className="text-gray-600 font-medium">Ukuran file:</span>
                        <span className="font-semibold text-gray-900">
                          {selectedAsset.previewFileSize ? `${(selectedAsset.previewFileSize / 1024 / 1024).toFixed(2)} MB` : '-'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={() => selectedAsset.googleDriveLink && window.open(selectedAsset.googleDriveLink, '_blank')}
                        className="flex-1 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-lg"
                        disabled={!selectedAsset.googleDriveLink}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Buka di Google Drive
                      </Button>
                      {canWrite && (
                        <Button
                          onClick={() => {
                            setShowDetailModal(false);
                            // Edit functionality would be implemented here
                            console.log('Edit asset:', selectedAsset);
                          }}
                          variant="outline"
                          className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      )}
                      {canWrite && (
                        <Button
                          onClick={() => {
                            setShowDetailModal(false);
                            handleDeleteAsset(selectedAsset);
                          }}
                          variant="outline"
                          className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Hapus
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Access Denied Modal */}
      <Dialog open={accessDeniedModal.isOpen} onOpenChange={(open) => setAccessDeniedModal({ ...accessDeniedModal, isOpen: open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Akses Ditolak
            </DialogTitle>
            <DialogDescription>
              {accessDeniedModal.message}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button 
              onClick={() => setAccessDeniedModal({ ...accessDeniedModal, isOpen: false })}
              variant="outline"
            >
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </PermissionGuard>
  )
}