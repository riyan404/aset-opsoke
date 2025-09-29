'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import PermissionGuard from '@/components/auth/PermissionGuard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Plus, 
  Upload, 
  X, 
  FileImage, 
  ImageIcon,
  Info,
  CheckCircle,
  AlertCircle,
  Loader2,
  Tag,
  Link,
  RectangleHorizontal,
  FileText
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

function NewDigitalAssetPageContent() {
  const router = useRouter()
  const { user, token } = useAuth()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [formData, setFormData] = useState({
    contentName: '',
    description: '',
    aspectRatio: 'RATIO_4_3',
    googleDriveLink: '',
    tags: '',
    previewFile: null as File | null,
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
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
      toast({
        title: 'Error',
        description: 'Hanya file gambar yang diperbolehkan',
        variant: 'destructive',
      })
      return
    }

    // Check file size (max 20MB for original file, will be compressed to 500KB)
    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'Ukuran file maksimal 20MB',
        variant: 'destructive',
      })
      return
    }

    try {
      setUploading(true)
      setUploadProgress(10)
      
      // Compress image
      const compressedFile = await compressImage(file)
      
      // Create preview
      const previewUrl = URL.createObjectURL(compressedFile)
      setPreviewImage(previewUrl)
      
      // Update form data
      setFormData(prev => ({
        ...prev,
        previewFile: compressedFile
      }))
      
      toast({
        title: 'Berhasil',
        description: `File berhasil dikompres dari ${(file.size / 1024 / 1024).toFixed(2)}MB menjadi ${(compressedFile.size / 1024).toFixed(0)}KB`,
      })
    } catch (error) {
      console.error('Error compressing image:', error)
      toast({
        title: 'Error',
        description: 'Gagal mengompres gambar',
        variant: 'destructive',
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
      previewFile: null
    }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      // Simulate file input change event
      const event = {
        target: { files: [file] }
      } as any
      handleFileUpload(event)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.contentName.trim()) {
      toast({
        title: 'Error',
        description: 'Nama konten harus diisi',
        variant: 'destructive',
      })
      return
    }

    try {
      setLoading(true)
      
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean)

      // Prepare form data for submission
      const submitFormData = new FormData()
      submitFormData.append('contentName', formData.contentName)
      submitFormData.append('description', formData.description)
      submitFormData.append('aspectRatio', formData.aspectRatio)
      submitFormData.append('googleDriveLink', formData.googleDriveLink)
      submitFormData.append('tags', JSON.stringify(tagsArray))
      submitFormData.append('department', user?.department || 'Digital')
      
      // Add compressed preview file if exists
      if (formData.previewFile) {
        submitFormData.append('previewFile', formData.previewFile)
      }

      const response = await fetch('/api/digital-assets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: submitFormData,
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Failed to create digital asset: ${response.status} - ${errorData}`)
      }

      toast({
        title: 'Berhasil',
        description: 'Aset digital berhasil ditambahkan',
      })

      router.push('/dashboard/digital-assets')
    } catch (error) {
      console.error('Failed to create digital asset:', error)
      toast({
        title: 'Error',
        description: 'Gagal menambahkan aset digital',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2 border-gray-200 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 rounded-lg">
                <Plus className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Tambah Aset Digital</h1>
                <p className="text-gray-600">
                  Tambahkan file design baru ke dalam database kreatif perusahaan
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Form */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-teal-50 to-teal-100/50 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileImage className="w-5 h-5 text-teal-600" />
              Informasi Aset Digital
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Informasi Dasar</h3>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Content Name */}
                  <div className="space-y-3">
                    <Label htmlFor="contentName" className="text-sm font-medium flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      Nama Konten <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="contentName"
                      value={formData.contentName}
                      onChange={(e) => handleInputChange('contentName', e.target.value)}
                      placeholder="Masukkan nama konten"
                      required
                      className="h-12 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                    />
                  </div>

                  {/* Aspect Ratio */}
                  <div className="space-y-3">
                    <Label htmlFor="aspectRatio" className="text-sm font-medium flex items-center gap-2">
                      <RectangleHorizontal className="w-4 h-4 text-gray-500" />
                      Rasio Aspek
                    </Label>
                    <Select
                      value={formData.aspectRatio}
                      onValueChange={(value) => handleInputChange('aspectRatio', value)}
                    >
                      <SelectTrigger className="h-12 border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RATIO_4_3">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">4:3</Badge>
                            <span>Landscape</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="RATIO_9_16">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">9:16</Badge>
                            <span>Portrait</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-3">
                  <Label htmlFor="description" className="text-sm font-medium">Deskripsi</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Masukkan deskripsi aset digital"
                    rows={4}
                    className="border-gray-200 focus:border-teal-500 focus:ring-teal-500 resize-none"
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 my-8"></div>

              {/* File Upload Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Upload className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Upload Preview File</h3>
                </div>
                
                <div 
                  className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 ${
                    isDragOver 
                      ? 'border-teal-500 bg-teal-50 scale-[1.02]' 
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {previewImage ? (
                    <div className="space-y-6">
                      <div className="relative max-w-md mx-auto">
                        <Card className="border-0 shadow-md overflow-hidden">
                          <img
                            src={previewImage}
                            alt="Preview"
                            className="w-full h-64 object-cover"
                          />
                        </Card>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 rounded-full w-8 h-8 p-0 shadow-lg"
                          onClick={handleRemoveFile}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-center space-y-2">
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <p className="text-sm font-medium text-gray-900">
                            {formData.previewFile?.name}
                          </p>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          Ukuran: {formData.previewFile ? (formData.previewFile.size / 1024).toFixed(0) : '0'}KB
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-6">
                      <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                        <ImageIcon className="h-10 w-10 text-gray-400" />
                      </div>
                      
                      {uploading ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
                            <span className="text-sm font-medium text-gray-700">
                              Mengompres gambar...
                            </span>
                          </div>
                          <div className="max-w-xs mx-auto">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-teal-600 h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${uploadProgress}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 text-center">
                              {uploadProgress}% selesai
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-teal-300 hover:border-teal-500 hover:bg-teal-50 text-teal-700 hover:text-teal-800"
                            size="lg"
                          >
                            <Upload className="mr-2 h-5 w-5" />
                            Pilih File
                          </Button>
                          <p className="text-sm text-gray-600">
                            atau drag & drop file disini
                          </p>
                        </div>
                      )}
                      
                      <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
                        <div className="flex items-start gap-2">
                          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="text-xs text-blue-700 space-y-1">
                            <p className="font-medium">Format yang didukung:</p>
                            <p>PNG, JPG, GIF hingga 20MB</p>
                            <p>File akan dikompres otomatis menjadi maksimal 500KB untuk preview</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 my-8"></div>

              {/* Additional Information Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Link className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Informasi Tambahan</h3>
                </div>

                {/* Google Drive Link */}
                <div className="space-y-3">
                  <Label htmlFor="googleDriveLink" className="text-sm font-medium flex items-center gap-2">
                    <Link className="w-4 h-4 text-gray-500" />
                    Link Google Drive
                  </Label>
                  <Input
                    id="googleDriveLink"
                    type="url"
                    value={formData.googleDriveLink}
                    onChange={(e) => handleInputChange('googleDriveLink', e.target.value)}
                    placeholder="https://drive.google.com/file/d/..."
                    className="h-12 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>

                {/* Tags */}
                <div className="space-y-3">
                  <Label htmlFor="tags" className="text-sm font-medium flex items-center gap-2">
                    <Tag className="w-4 h-4 text-gray-500" />
                    Tags
                  </Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    placeholder="logo, branding, marketing"
                    className="h-12 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                  />
                  <div className="bg-amber-50 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-amber-700">
                        Pisahkan tag dengan koma untuk memudahkan pencarian dan kategorisasi aset
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Submit Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-8 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                  className="border-gray-200 hover:bg-gray-50"
                  size="lg"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={loading || uploading}
                  className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-5 w-5" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-5 w-5" />
                      Tambah Aset Digital
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function NewDigitalAssetPage() {
  return (
    <PermissionGuard module="DIGITAL_ASSETS" permission="canWrite">
      <NewDigitalAssetPageContent />
    </PermissionGuard>
  )
}
