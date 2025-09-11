'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, FileText, Users, Activity, TrendingUp, AlertTriangle, Clock, Calendar, BarChart3, PieChart as PieChartIcon, RefreshCw, Palette } from 'lucide-react'
import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { Button } from '@/components/ui/button'

interface DashboardStats {
  totalAssets: number
  activeAssets: number
  totalDocuments: number
  activeDocuments: number
  totalDigitalAssets: number
  activeDigitalAssets: number
  totalUsers: number
  activeUsers: number
  recentActivities: number
  assetsByCategory: Array<{ name: string; count: number; color: string }>
  documentsOverTime: Array<{ month: string; count: number }>
  recentAuditActivities: Array<{ date: string; action: string; resource: string; count: number }>
  digitalAssetsByAspectRatio: Array<{ name: string; count: number; color: string }>
}

export default function DashboardPage() {
  const { user, token } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchDashboardStats()
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardStats(true) // Show refreshing indicator for auto-refresh
    }, 30000)
    
    // Cleanup interval on unmount
    return () => clearInterval(interval)
  }, [token])

  const fetchDashboardStats = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      
      // Fetch real-time dashboard statistics
      const response = await fetch('/api/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats')
      }
      
      const data = await response.json()
      setStats(data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
      // Fallback to empty stats
      setStats({
        totalAssets: 0,
        activeAssets: 0,
        totalDocuments: 0,
        activeDocuments: 0,
        totalDigitalAssets: 0,
        activeDigitalAssets: 0,
        totalUsers: 0,
        activeUsers: 0,
        recentActivities: 0,
        assetsByCategory: [],
        documentsOverTime: [],
        recentAuditActivities: [],
        digitalAssetsByAspectRatio: [],
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="bg-gradient-to-br from-[#1a3c3c] via-[#2d6f6f] to-[#187F7E] rounded-2xl p-10 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-pattern opacity-5"></div>
          <div className="relative animate-pulse space-y-6">
            <div className="h-10 bg-white/20 rounded-lg w-2/5"></div>
            <div className="space-y-3">
              <div className="h-4 bg-white/20 rounded-lg w-1/3"></div>
              <div className="h-4 bg-white/20 rounded-lg w-1/2"></div>
            </div>
          </div>
        </div>
        
        {/* Stats Cards Skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-lg">
              <div className="animate-pulse space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 rounded-xl bg-gray-200"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Charts Skeleton */}
        <div className="grid gap-6 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border-0 p-6 shadow-lg">
              <div className="animate-pulse space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="h-5 w-5 rounded bg-gray-200"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="h-[300px] bg-gray-100 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const getCurrentGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Selamat Pagi'
    if (hour < 17) return 'Selamat Siang'
    if (hour < 21) return 'Selamat Sore'
    return 'Selamat Malam'
  }

  const getCurrentDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }
    return new Date().toLocaleDateString('id-ID', options)
  }

  const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6B7280']

  const statCards = [
    {
      title: 'Total Aset',
      value: stats?.totalAssets || 0,
      icon: Package,
      color: 'text-[#187F7E]',
      bgColor: 'bg-[#0EB6B4]/10',
    },
    {
      title: 'Dokumen',
      value: stats?.totalDocuments || 0,
      icon: FileText,
      color: 'text-[#00AAA8]',
      bgColor: 'bg-[#00AAA8]/10',
    },
    {
      title: 'Aset Digital',
      value: stats?.totalDigitalAssets || 0,
      icon: Palette,
      color: 'text-[#0EB6B4]',
      bgColor: 'bg-[#0EB6B4]/10',
    },
    ...(user?.role === 'ADMIN' ? [{
      title: 'Pengguna',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'text-[#D4AF37]',
      bgColor: 'bg-[#D4AF37]/10',
    }] : []),
    ...(user?.role === 'ADMIN' ? [{
      title: 'Aktivitas',
      value: stats?.recentActivities || 0,
      icon: Activity,
      color: 'text-[#6B7280]',
      bgColor: 'bg-[#6B7280]/10',
    }] : []),
  ]

  return (
    <div className="space-y-8">
      {/* Elegant Greeting Header */}
      <div className="bg-gradient-to-br from-[#1a3c3c] via-[#2d6f6f] to-[#187F7E] rounded-2xl p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-5"></div>
        <div className="relative flex items-center justify-between">
          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight">
                {getCurrentGreeting()},
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-200 to-white ml-2">
                  {user?.firstName} {user?.lastName}! 👋
                </span>
              </h1>
              <p className="text-teal-100 flex items-center text-lg">
                <Calendar className="w-5 h-5 mr-2 text-teal-300" />
                {getCurrentDate()}
              </p>
            </div>
            <p className="text-teal-100 text-lg max-w-2xl leading-relaxed">
              Selamat datang kembali di sistem manajemen aset perusahaan. Pantau dan kelola semua aset Anda dalam satu dashboard.
            </p>
            {lastUpdated && (
              <p className="text-teal-200/80 text-sm flex items-center mt-4">
                <Clock className="w-4 h-4 mr-2" />
                Terakhir diperbarui: {lastUpdated.toLocaleTimeString('id-ID')}
              </p>
            )}
          </div>
          <div className="hidden xl:block">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 shadow-inner">
              <div className="flex items-center space-x-8">
                <div className="text-center px-6">
                  <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-teal-200">
                    {stats?.totalAssets || 0}
                  </div>
                  <div className="text-sm text-teal-200 font-medium mt-1">Total Aset</div>
                </div>
                <div className="w-px h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
                <div className="text-center px-6">
                  <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-teal-200">
                    {stats?.totalDocuments || 0}
                  </div>
                  <div className="text-sm text-teal-200 font-medium mt-1">Dokumen</div>
                </div>
                <div className="w-px h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
                <div className="text-center px-6">
                  <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-teal-200">
                    {stats?.totalDigitalAssets || 0}
                  </div>
                  <div className="text-sm text-teal-200 font-medium mt-1">Aset Digital</div>
                </div>
                <div className="ml-6 flex items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fetchDashboardStats(true)}
                    disabled={refreshing}
                    className="text-teal-200 hover:text-white hover:bg-white/10 transition-all duration-200"
                  >
                    <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-medium text-emerald-600">+12%</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2 group-hover:text-gray-700 transition-colors">{stat.title}</h3>
                  <div className="flex items-baseline">
                    <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">{stat.value}</p>
                    <p className="text-sm text-gray-500 ml-2">total</p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Assets by Category Chart */}
        <Card className="shadow-lg rounded-2xl border-0 hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center text-lg font-semibold">
                  <PieChartIcon className="w-5 h-5 mr-2 text-[#187F7E]" />
                  Aset Berdasarkan Kategori
                </CardTitle>
                <CardDescription className="text-gray-500 mt-1">Distribusi aset berdasarkan jenis kategori</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.assetsByCategory || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    innerRadius={60}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {(stats?.assetsByCategory || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="white" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      border: 'none',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Digital Assets by Aspect Ratio Chart */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Palette className="w-5 h-5 mr-2 text-[#0EB6B4]" />
                  Aset Digital berdasarkan Rasio
                </CardTitle>
                <CardDescription>Distribusi aset digital berdasarkan rasio aspek</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.digitalAssetsByAspectRatio || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {(stats?.digitalAssetsByAspectRatio || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Documents Over Time Chart */}
        <Card className="shadow-sm">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center text-lg font-semibold">
                  <BarChart3 className="w-5 h-5 mr-2 text-[#00AAA8]" />
                  Dokumen Bulanan
                </CardTitle>
                <CardDescription className="text-gray-500 mt-1">Jumlah dokumen yang diunggah per bulan</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.documentsOverTime || []}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#187F7E" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#187F7E" stopOpacity={0.4}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      border: 'none',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar dataKey="count" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline */}
      {user?.role === 'ADMIN' && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2 text-[#D4AF37]" />
              Aktivitas Terkini
            </CardTitle>
            <CardDescription>Log aktivitas sistem dalam 24 jam terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.recentAuditActivities || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#D4AF37" strokeWidth={3} dot={{ fill: '#D4AF37', strokeWidth: 2, r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Access Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-[#187F7E]" />
              <CardTitle>Manajemen Aset</CardTitle>
            </div>
            <CardDescription>Kelola aset fisik perusahaan Anda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-[#187F7E] hover:bg-[#0EB6B4]/10"
              asChild
            >
              <a href="/dashboard/assets">Lihat Semua Aset</a>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-[#187F7E] hover:bg-[#0EB6B4]/10"
              asChild
            >
              <a href="/dashboard/assets/new">Tambah Aset Baru</a>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-[#00AAA8]" />
              <CardTitle>Arsip Dokumen</CardTitle>
            </div>
            <CardDescription>Manajemen dokumen standar ISO</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-[#00AAA8] hover:bg-[#00AAA8]/10"
              asChild
            >
              <a href="/dashboard/documents">Lihat Dokumen</a>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-[#00AAA8] hover:bg-[#00AAA8]/10"
              asChild
            >
              <a href="/dashboard/documents/upload">Unggah Dokumen</a>
            </Button>
          </CardContent>
        </Card>

        {user?.role === 'ADMIN' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <Users className="h-5 w-5 mr-2 text-[#0EB6B4]" />
                <h3 className="text-lg font-semibold text-gray-900">Manajemen Pengguna</h3>
              </div>
              <p className="text-sm text-gray-600">
                Kelola pengguna sistem dan izin
              </p>
            </div>
            <div className="space-y-2">
              <a
                href="/dashboard/users"
                className="block px-3 py-2 text-sm text-[#0EB6B4] hover:bg-[#0EB6B4]/10 rounded transition-colors"
              >
                Lihat Pengguna
              </a>
              <a
                href="/dashboard/users/new"
                className="block px-3 py-2 text-sm text-[#0EB6B4] hover:bg-[#0EB6B4]/10 rounded transition-colors"
              >
                Tambah Pengguna Baru
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      {user?.role === 'ADMIN' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <Activity className="h-5 w-5 mr-2 text-[#D4AF37]" />
              <h3 className="text-lg font-semibold text-gray-900">Aktivitas Terkini</h3>
            </div>
            <p className="text-sm text-gray-600">
              Aktivitas sistem terbaru dan log audit
            </p>
          </div>
          <div className="text-center py-6">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              <a href="/dashboard/audit" className="text-[#D4AF37] hover:underline">
                Lihat log audit
              </a>
              {' '}untuk melihat riwayat aktivitas detail
            </p>
          </div>
        </div>
      )}
    </div>
  )
}