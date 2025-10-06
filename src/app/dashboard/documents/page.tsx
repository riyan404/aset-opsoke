'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useNotification } from '@/contexts/NotificationContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FileText, Plus, Search, Filter, Eye, Download, Edit, Trash2, AlertCircle } from 'lucide-react'
import { ActionsDropdown, documentActions } from '@/components/ui/actions-dropdown'
import DocumentDetailModal from '@/components/ui/document-detail-modal'
import { DeleteConfirmationModal } from '@/components/ui/delete-confirmation-modal'
import PermissionGuard from '@/components/auth/PermissionGuard'
import { PermissionGuard as PG, usePermission } from '@/components/PermissionGuard'

interface Document {
  id: string
  title: string
  description?: string
  category: string
  subcategory?: string
  fileName: string
  fileSize: number
  mimeType: string
  version: string
  expiryDate?: string
  createdAt: string
  createdBy: {
    firstName: string
    lastName: string
  }
}

interface ApiResponse {
  documents: Document[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function DocumentsPage() {
  const { token } = useAuth()
  const { showSuccess, showError } = useNotification()
  const router = useRouter()
  const canWrite = usePermission('DOCUMENTS', 'canWrite')
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalDocuments, setTotalDocuments] = useState(0)
  
  const [accessDeniedModal, setAccessDeniedModal] = useState({
    isOpen: false,
    message: ''
  })
  
  // Modal states
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, document: null as Document | null, loading: false })

  // Effects
  useEffect(() => {
    fetchDocuments()
  }, [currentPage, searchTerm])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
      })

      const response = await fetch(`/api/documents?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data: ApiResponse = await response.json()
        setDocuments(data.documents)
        setTotalPages(data.pagination.pages)
        setTotalDocuments(data.pagination.total)
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryBadge = (category: string) => {
    const colors = {
      POLICY: 'bg-[#187F7E]/10 text-[#187F7E]',
      PROCEDURE: 'bg-blue-100 text-blue-800',
      WORK_INSTRUCTION: 'bg-green-100 text-green-800',
      FORM: 'bg-yellow-100 text-yellow-800',
      RECORD: 'bg-orange-100 text-orange-800',
      MANUAL: 'bg-indigo-100 text-indigo-800',
      CERTIFICATE: 'bg-pink-100 text-pink-800',
      CONTRACT: 'bg-red-100 text-red-800',
      CORRESPONDENCE: 'bg-teal-100 text-teal-800',
      OTHER: 'bg-gray-100 text-gray-800',
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getCategoryText = (category: string) => {
    const translations = {
      POLICY: 'Kebijakan',
      PROCEDURE: 'Prosedur',
      WORK_INSTRUCTION: 'Instruksi Kerja',
      FORM: 'Formulir',
      RECORD: 'Catatan',
      MANUAL: 'Manual',
      CERTIFICATE: 'Sertifikat',
      CONTRACT: 'Kontrak',
      CORRESPONDENCE: 'Korespondensi',
      OTHER: 'Lainnya',
    }
    return translations[category as keyof typeof translations] || category.replace('_', ' ')
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID')
  }

  const showAccessDenied = (message: string) => {
    setAccessDeniedModal({
      isOpen: true,
      message
    })
  }

  const handleDownload = async (documentId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/download`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Failed to download document:', error)
    }
  }

  const handleViewDocument = (id: string) => {
    setSelectedDocumentId(id)
    setShowDetailModal(true)
  }

  const handleEditDocument = (id: string) => {
    if (canWrite) {
      router.push(`/dashboard/documents/${id}/edit`)
    } else {
      showAccessDenied('Anda tidak memiliki izin untuk mengedit dokumen')
    }
  }

  const handleShareDocument = async (id: string, fileName: string) => {
    if (!canWrite) {
      showAccessDenied('Anda tidak memiliki izin untuk membagikan dokumen')
      return
    }

    try {
      const response = await fetch(`/api/documents/${id}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ expiresIn: 72 }), // 3 days
      })

      if (response.ok) {
        const data = await response.json()
        // Copy to clipboard
        navigator.clipboard.writeText(data.shareUrl)
        showSuccess(`Link berbagi berhasil dibuat dan disalin ke clipboard!\nLink akan kedaluwarsa pada: ${new Date(data.expiresAt).toLocaleString('id-ID')}`)
      } else {
        const data = await response.json()
        showError(data.error || 'Gagal membuat link berbagi')
      }
    } catch (error) {
      console.error('Error sharing document:', error)
      showError('Gagal membuat link berbagi')
    }
  }

  const handleArchiveDocument = async (id: string) => {
    if (!canWrite) {
      showAccessDenied('Anda tidak memiliki izin untuk mengarsipkan dokumen')
      return
    }

    const reason = prompt('Alasan mengarsipkan dokumen:')
    if (reason === null) return // User cancelled
    
    try {
      const response = await fetch(`/api/documents/${id}/archive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      })

      if (response.ok) {
        fetchDocuments()
        showSuccess('Dokumen berhasil diarsipkan')
      } else {
        const data = await response.json()
        showError(data.error || 'Gagal mengarsipkan dokumen')
      }
    } catch (error) {
      console.error('Error archiving document:', error)
      showError('Gagal mengarsipkan dokumen')
    }
  }

  const handleDeleteDocument = (document: Document) => {
    if (!canWrite) {
      showAccessDenied('Anda tidak memiliki izin untuk menghapus dokumen')
      return
    }

    setDeleteModal({ isOpen: true, document, loading: false })
  }

  const confirmDeleteDocument = async () => {
    if (!deleteModal.document) return
    
    setDeleteModal(prev => ({ ...prev, loading: true }))
    
    try {
      const response = await fetch(`/api/documents/${deleteModal.document!.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        fetchDocuments()
        setDeleteModal({ isOpen: false, document: null, loading: false })
        showSuccess('Dokumen berhasil dihapus')
      } else {
        const data = await response.json()
        showError(data.error || 'Gagal menghapus dokumen')
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      showError('Gagal menghapus dokumen')
    } finally {
      setDeleteModal(prev => ({ ...prev, loading: false }))
    }
  }

  return (
    <PG module="DOCUMENTS" permission="canRead">
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Arsip Dokumen</h1>
          <p className="text-gray-600">Kelola dokumen perusahaan Anda mengikuti standar ISO</p>
        </div>
        <PG 
          module="DOCUMENTS" 
          permission="canWrite"
          fallback={
            <Button 
              onClick={() => showAccessDenied('Anda tidak memiliki izin untuk mengunggah dokumen')}
              className="bg-gray-400 hover:bg-gray-500 text-white cursor-not-allowed"
            >
              <Plus className="w-4 h-4 mr-2" />
              Akses Ditolak
            </Button>
          }
        >
          <Button 
            className="bg-teal-600 hover:bg-teal-700 text-white"
            onClick={() => router.push('/dashboard/documents/upload')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Unggah Dokumen
          </Button>
        </PG>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Cari dokumen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Kategori
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Dokumen ({totalDocuments})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-[#187F7E] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Tidak ada dokumen ditemukan</p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((document) => (
                <div key={document.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{document.title}</h3>
                      <p className="text-sm text-gray-500">{document.fileName} • {formatFileSize(document.fileSize)}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadge(document.category)}`}>
                          {getCategoryText(document.category)}
                        </span>
                        <span className="text-xs text-gray-400">
                          Dibuat oleh {document.createdBy.firstName} {document.createdBy.lastName} • {formatDate(document.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ActionsDropdown 
                     items={documentActions(
                       document,
                       handleViewDocument,
                       handleEditDocument,
                       handleDownload,
                       handleShareDocument,
                       handleArchiveDocument,
                       handleDeleteDocument
                     )}
                   />
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-6">
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
        </CardContent>
      </Card>

      {/* Document Detail Modal */}
      {selectedDocumentId && (
        <DocumentDetailModal
          documentId={selectedDocumentId}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedDocumentId(null)
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, document: null, loading: false })}
        onConfirm={confirmDeleteDocument}
        title="Hapus Dokumen"
        message="Apakah Anda yakin ingin menghapus dokumen ini? Tindakan ini tidak dapat dibatalkan."
        itemName={deleteModal.document?.title}
        loading={deleteModal.loading}
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
    </div>
    </PG>
  )
}