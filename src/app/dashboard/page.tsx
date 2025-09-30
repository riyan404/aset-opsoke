'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Users, 
  Package, 
  FileText,
  Image,
  TrendingUp, 
  AlertTriangle,
  RefreshCw,
  Calendar,
  Clock,
  CheckCircle2,
  Plus,
  Filter,
  BarChart3,
  Activity,
  Archive,
  PieChart,
  Download,
  Upload,
  Eye,
  Settings
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface DashboardStats {
  totalUsers: number
  totalAssets: number
  activeAssets: number
  totalDocuments: number
  activeDocuments: number
  totalDigitalAssets: number
  activeDigitalAssets: number
  maintenanceAssets: number
  recentActivities: Array<{
    id: string
    type: string
    description: string
    timestamp: string
    user: string
  }>
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardStats()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Selamat Pagi'
    if (hour < 17) return 'Selamat Siang'
    return 'Selamat Sore'
  }

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-blue-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-blue-100 rounded w-1/2 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-white/70 backdrop-blur-sm rounded-lg shadow-sm"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {getGreeting()}, {user?.firstName}!
          </h1>
          <p className="text-gray-600 mt-1">
            {getCurrentDate()}
          </p>
        </div>
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardStats}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <p className="text-sm text-gray-500">
            Terakhir diperbarui: {lastUpdated.toLocaleTimeString('id-ID')}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Aset */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 hover:shadow-xl hover:bg-white/90 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Aset</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats?.totalAssets?.toLocaleString('id-ID') || '0'}
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-600">
                Aktif: {stats?.activeAssets?.toLocaleString('id-ID') || '0'}
              </p>
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                <Activity className="h-3 w-3 mr-1" />
                {stats?.activeAssets && stats?.totalAssets 
                  ? Math.round((stats.activeAssets / stats.totalAssets) * 100)
                  : 0}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Total Dokumen */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 hover:shadow-xl hover:bg-white/90 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Dokumen</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.totalDocuments?.toLocaleString('id-ID') || '0'}
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-600">
                Aktif: {stats?.activeDocuments?.toLocaleString('id-ID') || '0'}
              </p>
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                <Activity className="h-3 w-3 mr-1" />
                {stats?.activeDocuments && stats?.totalDocuments 
                  ? Math.round((stats.activeDocuments / stats.totalDocuments) * 100)
                  : 0}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Total Aset Digital */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 hover:shadow-xl hover:bg-white/90 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Aset Digital</CardTitle>
            <Image className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats?.totalDigitalAssets?.toLocaleString('id-ID') || '0'}
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-600">
                Aktif: {stats?.activeDigitalAssets?.toLocaleString('id-ID') || '0'}
              </p>
              <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                <Activity className="h-3 w-3 mr-1" />
                {stats?.activeDigitalAssets && stats?.totalDigitalAssets 
                  ? Math.round((stats.activeDigitalAssets / stats.totalDigitalAssets) * 100)
                  : 0}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Section */}
      <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            Ringkasan Sistem
          </CardTitle>
          <CardDescription className="text-gray-600">
            Gambaran umum status sistem manajemen aset
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200/50 hover:shadow-md transition-all duration-300">
              <Package className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-blue-900 mb-2">Aset Fisik</h3>
              <p className="text-3xl font-bold text-blue-600 mb-1">
                {stats?.totalAssets || 0}
              </p>
              <p className="text-sm text-blue-700 bg-blue-100/70 px-3 py-1 rounded-full">
                {stats?.activeAssets || 0} aktif
              </p>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl border border-green-200/50 hover:shadow-md transition-all duration-300">
              <FileText className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-green-900 mb-2">Dokumen</h3>
              <p className="text-3xl font-bold text-green-600 mb-1">
                {stats?.totalDocuments || 0}
              </p>
              <p className="text-sm text-green-700 bg-green-100/70 px-3 py-1 rounded-full">
                {stats?.activeDocuments || 0} aktif
              </p>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl border border-purple-200/50 hover:shadow-md transition-all duration-300">
              <Image className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-purple-900 mb-2">Aset Digital</h3>
              <p className="text-3xl font-bold text-purple-600 mb-1">
                {stats?.totalDigitalAssets || 0}
              </p>
              <p className="text-sm text-purple-700 bg-purple-100/70 px-3 py-1 rounded-full">
                {stats?.activeDigitalAssets || 0} aktif
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}