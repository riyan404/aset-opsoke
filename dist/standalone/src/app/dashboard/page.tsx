'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package, FileText, Users, Activity, TrendingUp, AlertTriangle, Clock, Calendar, BarChart3, PieChart as PieChartIcon, RefreshCw, Palette, ArrowUpRight, Plus } from 'lucide-react'
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
      <div className="space-y-6 p-6">
        {/* Header Skeleton */}
        <Card className="border-0 bg-gradient-to-br from-slate-50 to-slate-100/50">
          <CardContent className="p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-slate-200 rounded-lg w-2/5"></div>
              <div className="space-y-3">
                <div className="h-4 bg-slate-200 rounded-lg w-1/3"></div>
                <div className="h-4 bg-slate-200 rounded-lg w-1/2"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Stats Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-lg bg-slate-200"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                    <div className="h-8 bg-slate-200 rounded w-3/4"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Charts Skeleton */}
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="h-5 w-5 rounded bg-slate-200"></div>
                      <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                    </div>
                    <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                  </div>
                  <div className="h-[280px] bg-slate-100 rounded-lg"></div>
                </div>
              </CardContent>
            </Card>
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

  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  const statCards = [
    {
      title: 'Total Aset',
      value: stats?.totalAssets || 0,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+12%',
      changeType: 'positive' as const,
    },
    {
      title: 'Dokumen',
      value: stats?.totalDocuments || 0,
      icon: FileText,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      change: '+8%',
      changeType: 'positive' as const,
    },
    {
      title: 'Aset Digital',
      value: stats?.totalDigitalAssets || 0,
      icon: Palette,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '+15%',
      changeType: 'positive' as const,
    },
    ...(user?.role === 'ADMIN' ? [{
      title: 'Pengguna',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      change: '+3%',
      changeType: 'positive' as const,
    }] : []),
  ]

  return (
    <div className="space-y-6 p-6">
      {/* Modern Header */}
      <Card className="border-0 bg-gradient-to-br from-slate-50 to-slate-100/50 shadow-sm">
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">
                  {getCurrentGreeting()}, {user?.firstName}! 👋
                </h1>
                <div className="flex items-center text-slate-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="text-sm lg:text-base">{getCurrentDate()}</span>
                </div>
              </div>
              <p className="text-slate-600 max-w-2xl leading-relaxed">
                Selamat datang kembali di sistem manajemen aset perusahaan. Pantau dan kelola semua aset Anda dalam satu dashboard.
              </p>
              {lastUpdated && (
                <div className="flex items-center text-xs text-slate-500">
                  <Clock className="w-3 h-3 mr-1" />
                  Terakhir diperbarui: {lastUpdated.toLocaleTimeString('id-ID')}
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchDashboardStats(true)}
                disabled={refreshing}
                className="border-slate-200 hover:bg-slate-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                Online
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-all duration-200 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2.5 rounded-lg ${stat.bgColor} group-hover:scale-105 transition-transform duration-200`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${stat.changeType === 'positive' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}
                  >
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {stat.change}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {/* Assets by Category Chart */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center text-lg font-semibold text-slate-900">
                  <PieChartIcon className="w-5 h-5 mr-2 text-blue-600" />
                  Aset Berdasarkan Kategori
                </CardTitle>
                <CardDescription className="text-slate-500">Distribusi aset berdasarkan jenis kategori</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.assetsByCategory || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    innerRadius={50}
                    paddingAngle={2}
                    dataKey="count"
                  >
                    {(stats?.assetsByCategory || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="white" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Documents Over Time Chart */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-4">
            <div className="space-y-1">
              <CardTitle className="flex items-center text-lg font-semibold text-slate-900">
                <BarChart3 className="w-5 h-5 mr-2 text-emerald-600" />
                Dokumen Bulanan
              </CardTitle>
              <CardDescription className="text-slate-500">Jumlah dokumen yang diunggah per bulan</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.documentsOverTime || []}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.3}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Bar dataKey="count" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Digital Assets by Aspect Ratio Chart */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-4">
            <div className="space-y-1">
              <CardTitle className="flex items-center text-lg font-semibold text-slate-900">
                <Palette className="w-5 h-5 mr-2 text-purple-600" />
                Aset Digital berdasarkan Rasio
              </CardTitle>
              <CardDescription className="text-slate-500">Distribusi aset digital berdasarkan rasio aspek</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.digitalAssetsByAspectRatio || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    innerRadius={50}
                    paddingAngle={2}
                    dataKey="count"
                  >
                    {(stats?.digitalAssetsByAspectRatio || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="white" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline for Admin */}
      {user?.role === 'ADMIN' && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-semibold text-slate-900">
              <Activity className="w-5 h-5 mr-2 text-amber-600" />
              Aktivitas Terkini
            </CardTitle>
            <CardDescription className="text-slate-500">Log aktivitas sistem dalam 24 jam terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.recentAuditActivities || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#f59e0b" 
                    strokeWidth={3} 
                    dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200 group">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Manajemen Aset</CardTitle>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </div>
            <CardDescription>Kelola aset fisik perusahaan Anda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="ghost"
              className="w-full justify-start text-blue-600 hover:bg-blue-50 hover:text-blue-700"
              asChild
            >
              <a href="/dashboard/assets">
                <Package className="w-4 h-4 mr-2" />
                Lihat Semua Aset
              </a>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-blue-600 hover:bg-blue-50 hover:text-blue-700"
              asChild
            >
              <a href="/dashboard/assets/new">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Aset Baru
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200 group">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-emerald-600" />
                <CardTitle className="text-lg">Arsip Dokumen</CardTitle>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </div>
            <CardDescription>Manajemen dokumen standar ISO</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="ghost"
              className="w-full justify-start text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
              asChild
            >
              <a href="/dashboard/documents">
                <FileText className="w-4 h-4 mr-2" />
                Lihat Dokumen
              </a>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
              asChild
            >
              <a href="/dashboard/documents/upload">
                <Plus className="w-4 h-4 mr-2" />
                Unggah Dokumen
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200 group">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Palette className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-lg">Aset Digital</CardTitle>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </div>
            <CardDescription>Kelola aset digital dan media</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="ghost"
              className="w-full justify-start text-purple-600 hover:bg-purple-50 hover:text-purple-700"
              asChild
            >
              <a href="/dashboard/digital-assets">
                <Palette className="w-4 h-4 mr-2" />
                Lihat Aset Digital
              </a>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-purple-600 hover:bg-purple-50 hover:text-purple-700"
              asChild
            >
              <a href="/dashboard/digital-assets/upload">
                <Plus className="w-4 h-4 mr-2" />
                Upload Media Baru
              </a>
            </Button>
          </CardContent>
        </Card>

        {user?.role === 'ADMIN' && (
          <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200 group md:col-span-2 lg:col-span-1">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-amber-600" />
                  <CardTitle className="text-lg">Manajemen Pengguna</CardTitle>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </div>
              <CardDescription>Kelola pengguna sistem dan izin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="ghost"
                className="w-full justify-start text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                asChild
              >
                <a href="/dashboard/users">
                  <Users className="w-4 h-4 mr-2" />
                  Lihat Pengguna
                </a>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                asChild
              >
                <a href="/dashboard/users/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Pengguna Baru
                </a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}