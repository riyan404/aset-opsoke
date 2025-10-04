'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import PermissionGuard from '@/components/auth/PermissionGuard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Package, ArrowLeft, Save, X, Upload, ImageIcon, Trash2, RefreshCw } from 'lucide-react'
import { SuccessModal } from '@/components/ui/success-modal'
import ErrorModal from '@/components/ui/error-modal'
import { toast } from 'sonner'

interface Category {
  id: string
  name: string
  description?: string
  isActive: boolean
}

function NewAssetPageContent() {
  const router = useRouter()
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  
  // Photo upload states
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    subcategory: '',
    brand: '',
    model: '',
    serialNumber: '',
    condition: 'GOOD',
    location: '',
    department: '',
    assignedTo: '',
    warrantyUntil: '',
    notes: '',
    tags: '',
    barcode: '',
    photo: null as File | null,
  })

  // Auto-generate barcode when category changes
  const generateBarcode = async (category: string) => {
    if (!category || !token) return

    try {
      const response = await fetch('/api/assets/generate-barcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ category }),
      })

      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({ ...prev, barcode: data.barcode }))
        toast.success('Barcode berhasil digenerate otomatis')
      }
    } catch (error) {
      console.error('Failed to generate barcode:', error)
      toast.error('Gagal generate barcode otomatis')
    }
  }

  useEffect(() => {
    if (token) {
      fetchCategories()
    }
  }, [token])

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true)
      const response = await fetch('/api/categories?type=ASSET', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setCategoriesLoading(false)
    }
  }

  // Enhanced image compression function with progress tracking
  const compressImage = (file: File, targetSizeKB: number = 500): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        setUploadProgress(30)
        
        // Start with reasonable dimensions and quality
        let maxWidth = 1200
        let quality = 0.9
        let attempts = 0
        const maxAttempts = 10
        
        const tryCompress = () => {
          setUploadProgress(30 + (attempts / maxAttempts) * 50)
          
          // Calculate new dimensions maintaining aspect ratio
          const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
          canvas.width = img.width * ratio
          canvas.height = img.height * ratio
          
          // Clear canvas and draw image
          ctx?.clearRect(0, 0, canvas.width, canvas.height)
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const fileSizeKB = blob.size / 1024
                
                // If file size is acceptable or we've tried enough times
                if (fileSizeKB <= targetSizeKB || attempts >= maxAttempts) {
                  setUploadProgress(100)
                  const compressedFile = new File([blob], file.name, {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                  })
                  resolve(compressedFile)
                } else {
                  // File still too large, reduce quality and/or dimensions
                  attempts++
                  
                  if (quality > 0.3) {
                    // Reduce quality first
                    quality -= 0.1
                  } else {
                    // If quality is already low, reduce dimensions
                    maxWidth = Math.max(400, maxWidth * 0.8)
                    quality = 0.7 // Reset quality when reducing dimensions
                  }
                  
                  // Try again with new settings
                  setTimeout(tryCompress, 10)
                }
              }
            },
            'image/jpeg',
            quality
          )
        }
        
        // Start compression attempts
        tryCompress()
      }
      
      img.src = URL.createObjectURL(file)
    })
  }

  // Handle file upload with enhanced UI feedback
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Hanya file gambar yang diperbolehkan', {
        description: 'Hanya file gambar yang diperbolehkan',
      })
      return
    }

    // Check file size (max 20MB for original file, will be compressed to 500KB)
    if (file.size > 20 * 1024 * 1024) {
      toast.error('File terlalu besar', {
        description: 'Ukuran file maksimal 20MB',
      })
      return
    }

    try {
      setUploading(true)
      setUploadProgress(10)

      // Compress image
      const compressedFile = await compressImage(file)

      // Create preview URL
      const previewUrl = URL.createObjectURL(compressedFile)
      setPreviewImage(previewUrl)

      // Update form data
      setFormData(prev => ({
        ...prev,
        photo: compressedFile
      }))

      toast.success('Foto berhasil dikompres', {
        description: `File berhasil dikompres dari ${(file.size / 1024 / 1024).toFixed(2)}MB menjadi ${(compressedFile.size / 1024).toFixed(0)}KB`,
      })
    } catch (error) {
      console.error('Error compressing image:', error)
      toast.error('Gagal mengkompres gambar', {
        description: 'Terjadi kesalahan saat mengkompres gambar',
      })
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  // Remove uploaded file
  const handleRemoveFile = () => {
    setPreviewImage(null)
    setFormData(prev => ({
      ...prev,
      photo: null
    }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      // Simulate file input change event
      const event = {
        target: { files: [file] }
      } as React.ChangeEvent<HTMLInputElement>
      handleFileUpload(event)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitFormData = new FormData()
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'photo' && value !== null && value !== '') {
          submitFormData.append(key, value as string)
        }
      })

      // Add compressed photo if exists
      if (formData.photo) {
        submitFormData.append('photo', formData.photo)
      }

      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: submitFormData,
      })

      if (response.ok) {
        setShowSuccessModal(true)
      } else {
        const data = await response.json()
        setModalMessage(data.error || 'Failed to create asset')
        setShowErrorModal(true)
      }
    } catch (error) {
      console.error('Error creating asset:', error)
      setModalMessage('Failed to create asset')
      setShowErrorModal(true)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Auto-generate barcode when category changes
    if (field === 'category' && value) {
      generateBarcode(value)
    }
  }

  return (
    <>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tambah Aset Baru</h1>
            <p className="text-gray-600">Buat catatan aset baru</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Informasi Aset
                </CardTitle>
                <CardDescription>
                  Informasi dasar tentang aset
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Aset *
                    </label>
                    <Input
                      required
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="Masukkan nama aset"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategori *
                    </label>
                    {categoriesLoading ? (
                      <div className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#187F7E] mr-2"></div>
                        <span className="text-sm text-gray-500">Loading categories...</span>
                      </div>
                    ) : (
                      <Select 
                        value={formData.category} 
                        onValueChange={(value: string) => handleChange('category', value)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Deskripsikan aset"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subkategori
                    </label>
                    <Input
                      value={formData.subcategory}
                      onChange={(e) => handleChange('subcategory', e.target.value)}
                      placeholder="mis., Laptop, Kursi"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Merek
                    </label>
                    <Input
                      value={formData.brand}
                      onChange={(e) => handleChange('brand', e.target.value)}
                      placeholder="mis., Dell, HP"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Model
                    </label>
                    <Input
                      value={formData.model}
                      onChange={(e) => handleChange('model', e.target.value)}
                      placeholder="mis., Latitude 7420"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nomor Seri
                    </label>
                    <Input
                      value={formData.serialNumber}
                      onChange={(e) => handleChange('serialNumber', e.target.value)}
                      placeholder="Nomor seri unik"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Barcode <span className="text-xs text-gray-500">(Otomatis)</span>
                    </label>
                    <div className="flex space-x-2">
                      <Input
                        value={formData.barcode}
                        readOnly
                        placeholder={formData.category ? "Barcode akan digenerate otomatis" : "Pilih kategori terlebih dahulu"}
                        className="flex-1 bg-gray-50 cursor-not-allowed"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => formData.category && generateBarcode(formData.category)}
                        disabled={!formData.category}
                        className="px-3"
                        title="Generate ulang barcode"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                    {!formData.category ? (
                      <p className="text-xs text-amber-600 mt-1">
                        Pilih kategori untuk generate barcode otomatis
                      </p>
                    ) : (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ Barcode akan digenerate otomatis berdasarkan kategori
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kondisi
                    </label>
                    <select
                      value={formData.condition}
                      onChange={(e) => handleChange('condition', e.target.value)}
                      className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#187F7E] focus:border-[#187F7E]"
                    >
                      <option value="EXCELLENT">Sangat Baik</option>
                      <option value="GOOD">Baik</option>
                      <option value="FAIR">Cukup</option>
                      <option value="POOR">Buruk</option>
                      <option value="DAMAGED">Rusak</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Photo Upload Section */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="w-5 h-5 text-purple-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Upload Foto Aset</h3>
                </CardTitle>
                <CardDescription>
                  Upload foto aset untuk dokumentasi visual
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  {previewImage ? (
                    <div className="space-y-4">
                      <div className="relative inline-block">
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="max-w-full max-h-48 rounded-lg shadow-md"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 rounded-full p-1 h-8 w-8"
                          onClick={handleRemoveFile}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p className="font-medium">{formData.photo?.name}</p>
                        <p className="text-xs text-gray-500">
                          Ukuran: {formData.photo ? (formData.photo.size / 1024).toFixed(0) : '0'}KB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <ImageIcon className="h-10 w-10 text-gray-400 mx-auto" />
                      <div>
                        {uploading ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                              <span className="text-sm text-gray-600">Mengkompres foto...</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500">
                              {uploadProgress}% selesai
                            </p>
                          </div>
                        ) : (
                          <>
                            <Button
                              type="button"
                              variant="outline"
                              className="mb-2"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={uploading}
                            >
                              <Upload className="mr-2 h-5 w-5" />
                              Pilih Foto
                            </Button>
                            <p className="text-sm text-gray-500">
                              atau drag & drop foto disini
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 text-xs text-gray-500 space-y-1">
                  <p>• Format yang didukung: JPG, PNG, GIF, WebP</p>
                  <p>• Ukuran maksimal: 20MB (akan dikompres otomatis)</p>
                  <p>• Foto akan dikompres otomatis menjadi maksimal 500KB untuk preview</p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </CardContent>
            </Card>

            {/* Location & Assignment */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Lokasi & Penugasan</CardTitle>
                <CardDescription>
                  Dimana aset berada dan siapa yang bertanggung jawab
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lokasi *
                    </label>
                    <Input
                      required
                      value={formData.location}
                      onChange={(e) => handleChange('location', e.target.value)}
                      placeholder="mis., Kantor Lantai 1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Departemen
                    </label>
                    <Input
                      value={formData.department}
                      onChange={(e) => handleChange('department', e.target.value)}
                      placeholder="mis., Departemen IT"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ditugaskan Kepada
                  </label>
                  <Input
                    value={formData.assignedTo}
                    onChange={(e) => handleChange('assignedTo', e.target.value)}
                    placeholder="Orang yang bertanggung jawab atas aset ini"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catatan
                  </label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="Catatan tambahan tentang aset"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tag
                  </label>
                  <Input
                    value={formData.tags}
                    onChange={(e) => handleChange('tags', e.target.value)}
                    placeholder="Tag dipisahkan koma"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full bg-[#187F7E] hover:bg-[#00AAA8]"
                    disabled={loading || uploading}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? 'Membuat...' : 'Buat Aset'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => router.back()}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Batal
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>

    {/* Success Modal */}
    <SuccessModal
      isOpen={showSuccessModal}
      onClose={() => {
        setShowSuccessModal(false)
        router.push('/dashboard/assets')
      }}
      title="Berhasil!"
      message="Asset berhasil dibuat"
    />

    {/* Error Modal */}
    <ErrorModal
      isOpen={showErrorModal}
      onClose={() => setShowErrorModal(false)}
      title="Error"
      message={modalMessage}
    />
    </>
  )
}

export default function NewAssetPage() {
  return (
    <PermissionGuard module="ASSETS" permission="canWrite">
      <NewAssetPageContent />
    </PermissionGuard>
  )
}