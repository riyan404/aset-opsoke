'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Package, ArrowLeft, Save, Upload, X, Camera, Loader2 } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import PermissionGuard from '@/components/auth/PermissionGuard'
import { SuccessModal } from '@/components/ui/success-modal'
import ErrorModal from '@/components/ui/error-modal'
import WarningModal from '@/components/ui/warning-modal'


interface Category {
  id: string
  name: string
  description?: string
  isActive: boolean
}

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
  isActive: boolean
}

export default function AssetEditPage() {
  const { token } = useAuth()
  const router = useRouter()
  const params = useParams()
  const [asset, setAsset] = useState<Asset | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [showWarningModal, setShowWarningModal] = useState(false)
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
    barcode: '',
    condition: '',
    location: '',
    department: '',
    assignedTo: '',
    warrantyUntil: '',
    notes: '',
    tags: '',
    isActive: true,
    photo: null as { url: string; filename: string; size: number } | null,
  })

  // Image compression function
  const compressImage = async (file: File, targetSizeKB: number = 500): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()
      
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img
        const maxDimension = 1920 // Maximum width or height
        
        if (width > height && width > maxDimension) {
          height = (height * maxDimension) / width
          width = maxDimension
        } else if (height > maxDimension) {
          width = (width * maxDimension) / height
          height = maxDimension
        }
        
        canvas.width = width
        canvas.height = height
        
        // Draw and compress
        let quality = 0.9
        let compressedFile: File
        
        const compress = () => {
          ctx.clearRect(0, 0, width, height)
          ctx.drawImage(img, 0, 0, width, height)
          
          canvas.toBlob((blob) => {
            if (blob) {
              const sizeKB = blob.size / 1024
              compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              })
              
              // Update progress
              const progress = Math.min(90, ((targetSizeKB - sizeKB) / targetSizeKB) * 100)
              setUploadProgress(Math.max(10, progress))
              
              if (sizeKB <= targetSizeKB || quality <= 0.1) {
                setUploadProgress(100)
                resolve(compressedFile)
              } else {
                quality -= 0.1
                setTimeout(compress, 100) // Small delay to show progress
              }
            }
          }, 'image/jpeg', quality)
        }
        
        compress()
      }
      
      img.src = URL.createObjectURL(file)
    })
  }

  // Handle file upload
   const handleFileUpload = async (file: File) => {
     // Validate file type
     if (!file.type.startsWith('image/')) {
       console.log('Please select an image file')
       return
     }

     // Validate file size (max 10MB)
     if (file.size > 10 * 1024 * 1024) {
       console.log('File size must be less than 10MB')
       return
     }

     try {
       setUploading(true)
       setUploadProgress(0)
       
       // Compress image
       const compressedFile = await compressImage(file)
       
       // Create preview
       const previewUrl = URL.createObjectURL(compressedFile)
       setPreviewImage(previewUrl)
       
       // Update form data
       setFormData(prev => ({
         ...prev,
         photo: {
           url: previewUrl,
           filename: compressedFile.name,
           size: compressedFile.size
         }
       }))
       
       console.log(`Photo compressed successfully! Size reduced to ${(compressedFile.size / 1024).toFixed(1)}KB`)
     } catch (error) {
       console.error('Error processing image:', error)
       console.log('Failed to process image')
     } finally {
       setUploading(false)
       setUploadProgress(0)
     }
   }

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  // Handle remove file
   const handleRemoveFile = () => {
     if (previewImage) {
       URL.revokeObjectURL(previewImage)
     }
     setPreviewImage(null)
     setFormData(prev => ({ ...prev, photo: null }))
     if (fileInputRef.current) {
       fileInputRef.current.value = ''
     }
     console.log('Photo removed')
   }

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  useEffect(() => {
    if (params.id) {
      fetchAsset()
      fetchCategories()
    }
  }, [params.id])

  const fetchAsset = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/assets/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        const assetData = data.asset
        setAsset(assetData)
        
        // Populate form data
        setFormData({
          name: assetData.name || '',
          description: assetData.description || '',
          category: assetData.category || '',
          subcategory: assetData.subcategory || '',
          brand: assetData.brand || '',
          model: assetData.model || '',
          serialNumber: assetData.serialNumber || '',
          barcode: assetData.barcode || '',
          condition: assetData.condition || '',
          location: assetData.location || '',
          department: assetData.department || '',
          assignedTo: assetData.assignedTo || '',
          warrantyUntil: assetData.warrantyUntil ? assetData.warrantyUntil.split('T')[0] : '',
          notes: assetData.notes || '',
          tags: assetData.tags || '',
          isActive: assetData.isActive,
          photo: null,
        })
      } else if (response.status === 404) {
        router.push('/dashboard/assets')
      }
    } catch (error) {
      console.error('Failed to fetch asset:', error)
    } finally {
      setLoading(false)
    }
  }

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.category || !formData.location) {
      setModalMessage('Please fill in all required fields (Name, Category, Location)')
      setShowWarningModal(true)
      return
    }

    try {
      setSaving(true)
      const response = await fetch(`/api/assets/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setShowSuccessModal(true)
      } else {
        const data = await response.json()
        setModalMessage(data.error || 'Failed to update asset')
        setShowErrorModal(true)
      }
    } catch (error) {
      console.error('Error updating asset:', error)
      setModalMessage('Failed to update asset')
      setShowErrorModal(true)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[#187F7E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!asset) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Asset Not Found</h2>
          <p className="text-gray-600">The asset you're trying to edit doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <PermissionGuard module="assets" permission="canWrite">
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
            <h1 className="text-3xl font-bold text-gray-900">Edit Asset</h1>
            <p className="text-gray-600">Update asset information</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Essential asset details and identification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Asset Name *
                </label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
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
                        <SelectValue placeholder="Select Category" />
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subcategory
                  </label>
                  <Input
                    type="text"
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand
                  </label>
                  <Input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Model
                  </label>
                  <Input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Serial Number
                  </label>
                  <Input
                    type="text"
                    name="serialNumber"
                    value={formData.serialNumber}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Barcode
                  </label>
                  <Input
                    type="text"
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condition
                </label>
                <Select 
                  value={formData.condition} 
                  onValueChange={(value: string) => handleChange('condition', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EXCELLENT">Excellent</SelectItem>
                    <SelectItem value="GOOD">Good</SelectItem>
                    <SelectItem value="FAIR">Fair</SelectItem>
                    <SelectItem value="POOR">Poor</SelectItem>
                    <SelectItem value="DAMAGED">Damaged</SelectItem>
                    <SelectItem value="DISPOSED">Disposed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Location & Assignment */}
          <Card>
            <CardHeader>
              <CardTitle>Location & Assignment</CardTitle>
              <CardDescription>
                Location details and assignment information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <Input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <Input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned To
                </label>
                <Input
                  type="text"
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Warranty Until
                </label>
                <Input
                  type="date"
                  name="warrantyUntil"
                  value={formData.warrantyUntil}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <Textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <Input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="Separate tags with commas"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-[#187F7E] focus:ring-[#187F7E] border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Asset is active
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Photo Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Camera className="w-5 h-5 mr-2" />
                Asset Photo
              </CardTitle>
              <CardDescription>
                Upload a photo of the asset (max 10MB, auto-compressed)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!previewImage ? (
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#187F7E] transition-colors cursor-pointer"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  
                  {uploading ? (
                    <div className="space-y-3">
                      <Loader2 className="w-8 h-8 text-[#187F7E] animate-spin mx-auto" />
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">Compressing image...</p>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-[#187F7E] h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500">{uploadProgress}%</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, JPEG up to 10MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <img
                      src={previewImage}
                      alt="Asset preview"
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={handleRemoveFile}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {formData.photo && (
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>📁 {formData.photo.filename}</p>
                      <p>📊 {(formData.photo.size / 1024).toFixed(1)} KB</p>
                    </div>
                  )}
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Change Photo
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="bg-[#187F7E] hover:bg-[#00AAA8]"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </form>
    </div>

    {/* Success Modal */}
    <SuccessModal
      isOpen={showSuccessModal}
      onClose={() => {
        setShowSuccessModal(false)
        router.push(`/dashboard/assets/${params.id}`)
      }}
      title="Berhasil!"
      message="Asset berhasil diperbarui"
    />

    {/* Error Modal */}
    <ErrorModal
      isOpen={showErrorModal}
      onClose={() => setShowErrorModal(false)}
      title="Error"
      message={modalMessage}
    />

    {/* Warning Modal */}
    <WarningModal
      isOpen={showWarningModal}
      onClose={() => setShowWarningModal(false)}
      title="Peringatan"
      message={modalMessage}
    />
    </PermissionGuard>
  )
}