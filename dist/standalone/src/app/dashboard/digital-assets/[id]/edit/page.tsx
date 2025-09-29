'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import PermissionGuard from '@/components/auth/PermissionGuard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  Edit3,
  FileImage,
  Info,
  AlertCircle,
  Loader2,
  Tag,
  Link,
  RectangleHorizontal,
  FileText,
  Calendar,
  User
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface DigitalAsset {
  id: string
  contentName: string
  description?: string
  aspectRatio: 'RATIO_4_3' | 'RATIO_9_16'
  googleDriveLink?: string
  previewFile?: string
  previewFileName?: string
  previewFileSize?: number
  tags?: string
  department?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdBy: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  updatedBy: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
}

function EditDigitalAssetPageContent() {
  const router = useRouter()
  const params = useParams()
  const { user, token } = useAuth()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [asset, setAsset] = useState<DigitalAsset | null>(null)
  const [formData, setFormData] = useState({
    contentName: '',
    description: '',
    aspectRatio: 'RATIO_4_3',
    googleDriveLink: '',
    tags: '',
  })

  const [userPermissions, setUserPermissions] = useState({
    canRead: true,
    canWrite: false,
    canDelete: false
  })

  useEffect(() => {
    fetchAsset()
    fetchUserPermissions()
  }, [params.id, token])

  const fetchUserPermissions = async () => {
    try {
      const response = await fetch('/api/digital-assets', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setUserPermissions(data.permissions)
        
        if (!data.permissions.canWrite) {
          toast({
            title: 'Akses Ditolak',
            description: 'Anda tidak memiliki izin untuk mengedit aset digital',
            variant: 'destructive',
          })
          router.push('/dashboard/digital-assets')
        }
      }
    } catch (error) {
      console.error('Failed to fetch user permissions:', error)
      // Set default permissions if API fails
      setUserPermissions({
        canRead: true,
        canWrite: true,
        canDelete: false
      })
    }
  }

  const fetchAsset = async () => {
    try {
      setFetchLoading(true)
      const response = await fetch(`/api/digital-assets/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch digital asset')
      }

      const data = await response.json()
      setAsset(data.digitalAsset)
      
      // Parse tags back to string format
      let tagsString = ''
      if (data.digitalAsset.tags) {
        try {
          const parsedTags = JSON.parse(data.digitalAsset.tags)
          tagsString = Array.isArray(parsedTags) ? parsedTags.join(', ') : data.digitalAsset.tags
        } catch {
          tagsString = data.digitalAsset.tags
        }
      }
      
      setFormData({
        contentName: data.digitalAsset.contentName || '',
        description: data.digitalAsset.description || '',
        aspectRatio: data.digitalAsset.aspectRatio || 'RATIO_4_3',
        googleDriveLink: data.digitalAsset.googleDriveLink || '',
        tags: tagsString,
      })
    } catch (error) {
      console.error('Failed to fetch digital asset:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat aset digital',
        variant: 'destructive',
      })
      router.push('/dashboard/digital-assets')
    } finally {
      setFetchLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
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

    if (!userPermissions.canWrite) {
      toast({
        title: 'Akses Ditolak',
        description: 'Anda tidak memiliki izin untuk mengedit aset digital',
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

      const response = await fetch(`/api/digital-assets/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          tags: JSON.stringify(tagsArray),
          department: asset?.department, // Keep existing department
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update digital asset')
      }

      toast({
        title: 'Berhasil',
        description: 'Aset digital berhasil diperbarui',
      })

      router.push('/dashboard/digital-assets')
    } catch (error: any) {
      console.error('Failed to update digital asset:', error)
      toast({
        title: 'Error',
        description: error.message || 'Gagal memperbarui aset digital',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50">
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Loading Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            <Skeleton className="h-10 w-20" />
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div>
                  <Skeleton className="h-8 w-48 mb-2" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
            </div>
          </div>

          {/* Loading Form */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-teal-50 to-teal-100/50 rounded-t-lg">
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!asset) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50 flex items-center justify-center">
        <Card className="border-0 shadow-lg max-w-md w-full mx-4">
          <CardContent className="p-8 text-center space-y-6">
            <div className="p-4 bg-red-100 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aset Digital Tidak Ditemukan</h3>
              <p className="text-gray-600">Aset digital yang Anda cari tidak dapat ditemukan atau telah dihapus.</p>
            </div>
            <Button 
              onClick={() => router.push('/dashboard/digital-assets')}
              className="bg-teal-600 hover:bg-teal-700"
            >
              Kembali ke Daftar Aset Digital
            </Button>
          </CardContent>
        </Card>
      </div>
    )
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
              <div className="p-2 bg-orange-100 rounded-lg">
                <Edit3 className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Aset Digital</h1>
                <p className="text-gray-600">
                  Perbarui informasi aset digital: {asset.contentName}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Asset Info Card */}
        <Card className="border-0 shadow-md bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Preview Image */}
              {asset.previewFile && (
                <div className="flex-shrink-0">
                  <Card className="border-0 shadow-sm overflow-hidden">
                    <img
                      src={asset.previewFile}
                      alt={asset.contentName}
                      className="w-32 h-32 object-cover"
                    />
                  </Card>
                </div>
              )}
              
              {/* Asset Details */}
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Dibuat</p>
                      <p className="text-sm font-medium">{formatDate(asset.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Dibuat oleh</p>
                      <p className="text-sm font-medium">
                        {asset.createdBy.firstName} {asset.createdBy.lastName}
                      </p>
                    </div>
                  </div>
                </div>
                
                {asset.updatedAt !== asset.createdAt && (
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <Edit3 className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Terakhir diperbarui</p>
                        <p className="text-sm font-medium">
                          {formatDate(asset.updatedAt)} oleh {asset.updatedBy.firstName} {asset.updatedBy.lastName}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Form */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100/50 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileImage className="w-5 h-5 text-orange-600" />
              Edit Informasi Aset Digital
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
                      className="h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
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
                    className="border-gray-200 focus:border-orange-500 focus:ring-orange-500 resize-none"
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
                    className="h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
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
                    className="h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
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
                  disabled={loading || !userPermissions.canWrite}
                  className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-5 w-5" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" />
                      Simpan Perubahan
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

export default function EditDigitalAssetPage() {
  return (
    <PermissionGuard module="DIGITAL_ASSETS" permission="canWrite">
      <EditDigitalAssetPageContent />
    </PermissionGuard>
  )
}