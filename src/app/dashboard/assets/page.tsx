'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Package, Plus, Search, Eye, Edit, Trash2, AlertCircle } from 'lucide-react'
import { ActionsDropdown, assetActions } from '@/components/ui/actions-dropdown'
import { AssetDetailModal } from '@/components/ui/asset-detail-modal'
import { DeleteConfirmationModal } from '@/components/ui/delete-confirmation-modal'
import DuplicateAssetModal from '@/components/ui/duplicate-asset-modal'
import { NotificationModal, NotificationType } from '@/components/ui/notification-modal'
import { useAuth } from '@/contexts/AuthContext'
import PermissionGuard from '@/components/auth/PermissionGuard'

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
  updatedBy?: {
    firstName: string
    lastName: string
    email: string
  }
}

interface ApiResponse {
  assets: Asset[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function AssetsPage() {
  const { token } = useAuth()
  const router = useRouter()
  
  // State management
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [permissionsLoaded, setPermissionsLoaded] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalAssets, setTotalAssets] = useState(0)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [userPermissions, setUserPermissions] = useState({
    canRead: false,
    canWrite: false,
    canDelete: false
  })
  const [accessDeniedModal, setAccessDeniedModal] = useState({
    isOpen: false,
    message: ''
  })
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    asset: Asset | null
    loading: boolean
  }>({ isOpen: false, asset: null, loading: false })
  const [duplicateModal, setDuplicateModal] = useState<{
    isOpen: boolean
    asset: Asset | null
  }>({ isOpen: false, asset: null })
  const [notificationModal, setNotificationModal] = useState<{
    isOpen: boolean
    type: NotificationType
    title?: string
    message: string
  }>({ isOpen: false, type: 'success', message: '' })

  // Fetch user permissions
  const fetchUserPermissions = useCallback(async () => {
    if (!token) return
    
    try {
      const response = await fetch('/api/permissions/assets', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const permissions = await response.json()
        setUserPermissions(permissions)
      }
    } catch (error) {
      console.error('Error fetching permissions:', error)
    } finally {
      setPermissionsLoaded(true)
    }
  }, [token])

  // Effects
  useEffect(() => {
    if (token) {
      fetchUserPermissions()
    }
  }, [token, fetchUserPermissions])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchAssets()
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [currentPage, searchTerm])

  const fetchAssets = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        _t: Date.now().toString() // Timestamp untuk bypass cache
      })
      
      if (searchTerm) params.append('search', searchTerm)

      const response = await fetch(`/api/assets?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
      })

      if (response.ok) {
        const data: ApiResponse = await response.json()
        setAssets(data.assets)
        setTotalPages(data.pagination.pages)
        setTotalAssets(data.pagination.total)
      }
    } catch (error) {
      console.error('Failed to fetch assets:', error)
    } finally {
      setLoading(false)
    }
  }

  const getConditionBadge = (condition: string) => {
    const colors = {
      EXCELLENT: 'bg-green-100 text-green-800',
      GOOD: 'bg-blue-100 text-blue-800',
      FAIR: 'bg-yellow-100 text-yellow-800',
      POOR: 'bg-orange-100 text-orange-800',
      DAMAGED: 'bg-red-100 text-red-800',
      DISPOSED: 'bg-gray-100 text-gray-800',
    }
    return colors[condition as keyof typeof colors] || 'bg-gray-100 text-gray-800'
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

  const handleViewAsset = async (id: string) => {
    try {
      const response = await fetch(`/api/assets/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setSelectedAsset(data.asset)
        setIsModalOpen(true)
      } else {
        setNotificationModal({
          isOpen: true,
          type: 'error',
          message: 'Asset not found'
        })
      }
    } catch (error) {
      console.error('Error fetching asset details:', error)
      setNotificationModal({
        isOpen: true,
        type: 'error',
        message: 'Failed to load asset details'
      })
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedAsset(null)
  }

  const handleEditAsset = (id: string) => {
    if (userPermissions.canWrite) {
      router.push(`/dashboard/assets/${id}/edit`)
    } else {
      showAccessDenied('Anda tidak memiliki izin untuk mengedit aset')
    }
  }

  const handleDuplicateAsset = async (id: string) => {
    if (!userPermissions.canWrite) {
      showAccessDenied('Anda tidak memiliki izin untuk menduplikasi aset')
      return
    }

    const asset = assets.find(a => a.id === id)
    if (asset) {
      setDuplicateModal({ isOpen: true, asset })
    }
  }

  const confirmDuplicateAsset = async (newName: string) => {
    if (!duplicateModal.asset) return
    
    try {
      const response = await fetch(`/api/assets/${duplicateModal.asset.id}/duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newName })
      })
      
      if (response.ok) {
        const data = await response.json()
        // Force refresh dengan timestamp untuk bypass cache
        await fetchAssets()
        // Reset ke halaman pertama jika diperlukan untuk melihat item baru
        if (currentPage > 1) {
          setCurrentPage(1)
        }
        setDuplicateModal({ isOpen: false, asset: null })
        setNotificationModal({
          isOpen: true,
          type: 'success',
          message: `Aset berhasil diduplikasi: ${data.asset.name}`
        })
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Gagal menduplikasi aset')
      }
    } catch (error) {
      console.error('Error duplicating asset:', error)
      throw error
    }
  }

  const handleDeleteAsset = (id: string) => {
    if (!userPermissions.canDelete) {
      showAccessDenied('Anda tidak memiliki izin untuk menghapus aset')
      return
    }

    const asset = assets.find(a => a.id === id)
    if (asset) {
      setDeleteModal({ isOpen: true, asset, loading: false })
    }
  }

  const confirmDeleteAsset = async () => {
    if (!deleteModal.asset) return

    try {
      setDeleteModal(prev => ({ ...prev, loading: true }))
      
      const response = await fetch(`/api/assets/${deleteModal.asset.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        fetchAssets()
        setDeleteModal({ isOpen: false, asset: null, loading: false })
        setNotificationModal({
          isOpen: true,
          type: 'success',
          message: 'Aset berhasil dihapus'
        })
      } else {
        const data = await response.json()
        setNotificationModal({
          isOpen: true,
          type: 'error',
          message: data.error || 'Gagal menghapus aset'
        })
      }
    } catch (error) {
      console.error('Error deleting asset:', error)
      setNotificationModal({
        isOpen: true,
        type: 'error',
        message: 'Gagal menghapus aset'
      })
    } finally {
      setDeleteModal(prev => ({ ...prev, loading: false }))
    }
  }

  const showAccessDenied = (message: string) => {
    setAccessDeniedModal({
      isOpen: true,
      message
    })
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID')
  }

  return (
    <PermissionGuard module="assets" permission="canRead">
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Kelola dan lacak aset perusahaan Anda</p>
        </div>
        {userPermissions.canWrite ? (
          <Button 
            className="bg-teal-600 hover:bg-teal-700 text-white"
            onClick={() => router.push('/dashboard/assets/new')}
            disabled={!permissionsLoaded}
          >
            <Plus className="w-4 h-4 mr-2" />
            {permissionsLoaded ? 'Tambah Produk' : 'Loading...'}
          </Button>
        ) : (
          <Button 
            onClick={() => showAccessDenied('Anda tidak memiliki izin untuk menambah aset')}
            className="bg-gray-400 hover:bg-gray-500 text-white cursor-not-allowed"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Produk
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Cari produk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Assets List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Produk</h2>
            <p className="text-sm text-gray-500">{totalAssets} item</p>
          </div>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-[#187F7E] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : assets.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            {searchTerm ? (
              <div>
                <p className="text-gray-500 mb-2">Tidak ada hasil pencarian untuk "{searchTerm}"</p>
                <p className="text-sm text-gray-400">Coba gunakan kata kunci yang berbeda atau periksa ejaan</p>
              </div>
            ) : (
              <div>
                <p className="text-gray-500 mb-2">Belum ada produk yang ditambahkan</p>
                <p className="text-sm text-gray-400">Klik tombol "Tambah Produk" untuk menambahkan produk pertama</p>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Table Header - Desktop */}
            <div className="hidden lg:grid lg:grid-cols-10 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700">
              <div className="col-span-5">Nama Produk</div>
              <div className="col-span-2">Kategori</div>
              <div className="col-span-2">Kondisi</div>
              <div className="col-span-1">Aksi</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {assets.map((asset) => (
                <div key={asset.id} className="p-4 lg:p-6 hover:bg-gray-50 transition-colors">
                  {/* Mobile Layout */}
                  <div className="lg:hidden space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{asset.name}</h3>
                        <p className="text-sm text-gray-500 truncate">
                          {asset.brand} {asset.model}
                        </p>
                        {asset.serialNumber && (
                          <p className="text-xs text-gray-400 truncate">SN: {asset.serialNumber}</p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        <ActionsDropdown 
                          items={assetActions(
                            asset,
                            handleViewAsset,
                            handleEditAsset,
                            handleDuplicateAsset,
                            handleDeleteAsset
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Kategori:</span>
                        <p className="font-medium text-gray-900">{asset.category}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Kondisi:</span>
                        <div className="mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            asset.condition === 'EXCELLENT' || asset.condition === 'GOOD' 
                              ? 'bg-green-100 text-green-800' 
                              : asset.condition === 'FAIR'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            ● {getConditionText(asset.condition)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden lg:grid lg:grid-cols-10 gap-4 items-center">
                    {/* Product Info */}
                    <div className="col-span-5">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-gray-900 truncate">{asset.name}</h3>
                          <p className="text-sm text-gray-500 truncate">
                            {asset.brand} {asset.model}
                          </p>
                          {asset.serialNumber && (
                            <p className="text-xs text-gray-400 truncate">SN: {asset.serialNumber}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Category */}
                    <div className="col-span-2">
                      <p className="font-medium text-gray-900 truncate">{asset.category}</p>
                    </div>
                    
                    {/* Condition */}
                    <div className="col-span-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        asset.condition === 'EXCELLENT' || asset.condition === 'GOOD' 
                          ? 'bg-green-100 text-green-800' 
                          : asset.condition === 'FAIR'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        ● {getConditionText(asset.condition)}
                      </span>
                    </div>
                    
                    {/* Actions */}
                    <div className="col-span-1">
                      <ActionsDropdown 
                        items={assetActions(
                          asset,
                          handleViewAsset,
                          handleEditAsset,
                          handleDuplicateAsset,
                          handleDeleteAsset
                        )}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 px-6 py-4 border-t border-gray-200">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 text-sm rounded ${
                    currentPage === pageNum
                      ? 'bg-[#187F7E] text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
            {totalPages > 5 && (
              <span className="text-gray-400">...</span>
            )}
            {totalPages > 5 && (
              <button
                onClick={() => setCurrentPage(totalPages)}
                className={`w-8 h-8 text-sm rounded ${
                  currentPage === totalPages
                    ? 'bg-[#187F7E] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {totalPages}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Asset Detail Modal */}
      {selectedAsset && (
        <AssetDetailModal
          asset={selectedAsset}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, asset: null, loading: false })}
        onConfirm={confirmDeleteAsset}
        title="Delete Asset"
        message="Are you sure you want to delete this asset? This action cannot be undone."
        itemName={deleteModal.asset?.name}
        loading={deleteModal.loading}
      />

      {/* Duplicate Asset Modal */}
      <DuplicateAssetModal
        isOpen={duplicateModal.isOpen}
        onClose={() => setDuplicateModal({ isOpen: false, asset: null })}
        onConfirm={confirmDuplicateAsset}
        asset={duplicateModal.asset}
      />

      {/* Access Denied Modal */}
      <Dialog open={accessDeniedModal.isOpen} onOpenChange={(open) => setAccessDeniedModal({ ...accessDeniedModal, isOpen: open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Akses Ditolak
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700">{accessDeniedModal.message}</p>
          </div>
          <div className="flex justify-end">
            <Button 
              onClick={() => setAccessDeniedModal({ isOpen: false, message: '' })}
              className="bg-gray-500 hover:bg-gray-600 text-white"
            >
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notificationModal.isOpen}
        onClose={() => setNotificationModal({ ...notificationModal, isOpen: false })}
        type={notificationModal.type}
        title={notificationModal.title}
        message={notificationModal.message}
        autoClose={notificationModal.type === 'success'}
        autoCloseDelay={3000}
      />
    </div>
    </PermissionGuard>
  )
}