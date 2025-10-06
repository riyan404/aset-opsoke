'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { PermissionGuard, usePermission } from '@/components/PermissionGuard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Settings, Plus, Edit, Trash2, Package, FileText, Building, Shield } from 'lucide-react'
import { ActionsDropdown } from '@/components/ui/actions-dropdown'
import { DeleteConfirmationModal } from '@/components/ui/delete-confirmation-modal'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'


interface Category {
  id: string
  name: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface NewCategoryForm {
  name: string
  description: string
}



export default function CategoriesPage() {
  const { token, user } = useAuth()
  const { canWrite } = usePermission('CATEGORIES', 'canWrite')
  const [activeTab, setActiveTab] = useState<'assets' | 'documents' | 'departments'>('assets')
  const [assetCategories, setAssetCategories] = useState<Category[]>([])
  const [documentCategories, setDocumentCategories] = useState<Category[]>([])
  const [departments, setDepartments] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState<Category | null>(null)
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    item: Category | null
    loading: boolean
  }>({ isOpen: false, item: null, loading: false })

  const [permissionModal, setPermissionModal] = useState<{
    isOpen: boolean
    department: Category | null
    loading: boolean
  }>({ isOpen: false, department: null, loading: false })

  const [departmentPermissions, setDepartmentPermissions] = useState<{
    [departmentId: string]: {
      ASSETS: { canRead: boolean; canWrite: boolean }
      DOCUMENTS: { canRead: boolean; canWrite: boolean }
      DIGITAL_ASSETS: { canRead: boolean; canWrite: boolean }
    }
  }>({})


  const [newCategoryForm, setNewCategoryForm] = useState<NewCategoryForm>({
    name: '',
    description: '',
  })

  useEffect(() => {
    if (user?.role === 'ADMIN' && token) {
      fetchCategories()
    }
  }, [user, token])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const [assetsRes, docsRes, deptsRes] = await Promise.all([
        fetch('/api/categories?type=ASSET', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/categories?type=DOCUMENT', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/categories?type=DEPARTMENT', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (assetsRes.ok) {
        const data = await assetsRes.json()
        setAssetCategories(data.categories || [])
      }
      if (docsRes.ok) {
        const data = await docsRes.json()
        setDocumentCategories(data.categories || [])
      }
      if (deptsRes.ok) {
        const data = await deptsRes.json()
        setDepartments(data.categories || [])
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newCategoryForm.name.trim()) {
      alert('Category name is required')
      return
    }

    try {
      const categoryType = activeTab === 'assets' ? 'ASSET' : 
                          activeTab === 'documents' ? 'DOCUMENT' : 
                          'DEPARTMENT'
      
      const endpoint = editingItem 
        ? `/api/categories/${editingItem.id}`
        : `/api/categories?type=${categoryType}`
      
      const method = editingItem ? 'PUT' : 'POST'

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newCategoryForm),
      })

      if (response.ok) {
        alert(`Category ${editingItem ? 'updated' : 'created'} successfully`)
        setNewCategoryForm({ name: '', description: '' })
        setShowAddForm(false)
        setEditingItem(null)
        fetchCategories()
      } else {
        const data = await response.json()
        alert(data.error || `Failed to ${editingItem ? 'update' : 'create'} category`)
      }
    } catch (error) {
      console.error('Error saving category:', error)
      alert(`Failed to ${editingItem ? 'update' : 'create'} category`)
    }
  }

  const handleEdit = (item: Category) => {
    setEditingItem(item)
    setNewCategoryForm({
      name: item.name,
      description: item.description || '',
    })
    setShowAddForm(true)
  }

  const handleDelete = (item: Category) => {
    setDeleteModal({ isOpen: true, item, loading: false })
  }



  const confirmDelete = async () => {
    if (!deleteModal.item) return

    try {
      setDeleteModal(prev => ({ ...prev, loading: true }))
      
      const response = await fetch(`/api/categories/${deleteModal.item.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        alert('Category deleted successfully')
        setDeleteModal({ isOpen: false, item: null, loading: false })
        fetchCategories()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete category')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Failed to delete category')
    } finally {
      setDeleteModal(prev => ({ ...prev, loading: false }))
    }
  }

  const cancelForm = () => {
    setShowAddForm(false)
    setEditingItem(null)
    setNewCategoryForm({ name: '', description: '' })
  }

  const getCurrentCategories = () => {
    switch (activeTab) {
      case 'assets':
        return assetCategories
      case 'documents':
        return documentCategories
      case 'departments':
        return departments
      default:
        return []
    }
  }

  const getTabConfig = (tab: string) => {
    const configs = {
      assets: {
        title: 'Asset Categories',
        icon: Package,
        description: 'Manage categories for asset classification'
      },
      documents: {
        title: 'Document Categories',
        icon: FileText,
        description: 'Manage categories for document classification'
      },
      departments: {
        title: 'Departments',
        icon: Building,
        description: 'Manage organizational departments'
      },

    }
    return configs[tab as keyof typeof configs]
  }

  const fetchDepartmentPermissions = async (departmentId: string) => {
    try {
      const response = await fetch(`/api/departments/${departmentId}/permissions`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (response.ok) {
        const data = await response.json()
        setDepartmentPermissions(prev => ({
          ...prev,
          [departmentId]: data.permissions || {
            ASSETS: { canRead: false, canWrite: false },
            DOCUMENTS: { canRead: false, canWrite: false },
            DIGITAL_ASSETS: { canRead: false, canWrite: false }
          }
        }))
      }
    } catch (error) {
      console.error('Failed to fetch department permissions:', error)
    }
  }

  const handlePermissions = (department: Category) => {
    setPermissionModal({ isOpen: true, department, loading: false })
    fetchDepartmentPermissions(department.id)
  }

  const handlePermissionChange = (departmentId: string, module: string, permission: string, value: boolean) => {
    setDepartmentPermissions(prev => ({
      ...prev,
      [departmentId]: {
        ...prev[departmentId],
        [module]: {
          ...prev[departmentId]?.[module as keyof typeof prev[string]],
          [permission]: value
        }
      }
    }))
  }

  const savePermissions = async () => {
    if (!permissionModal.department) return

    try {
      setPermissionModal(prev => ({ ...prev, loading: true }))
      
      const permissions = departmentPermissions[permissionModal.department.id]
      const response = await fetch(`/api/departments/${permissionModal.department.id}/permissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ permissions }),
      })

      if (response.ok) {
        alert('Permissions updated successfully')
        setPermissionModal({ isOpen: false, department: null, loading: false })
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to update permissions')
      }
    } catch (error) {
      console.error('Error saving permissions:', error)
      alert('Failed to update permissions')
    } finally {
      setPermissionModal(prev => ({ ...prev, loading: false }))
    }
  }

  const categoryActions = (item: Category) => {
    const baseActions = [
      {
        label: 'Edit',
        icon: Edit,
        onClick: () => handleEdit(item),
      },
      {
        label: 'Delete',
        icon: Trash2,
        onClick: () => handleDelete(item),
        variant: 'destructive' as const,
      },
    ]

    // Add Permissions action only for departments
    if (activeTab === 'departments') {
      baseActions.unshift({
        label: 'Permissions',
        icon: Shield,
        onClick: () => handlePermissions(item),
      })
    }

    return baseActions
  }

  return (
    <PermissionGuard module="CATEGORIES" permission="canRead">
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories Management</h1>
          <p className="text-gray-600">Manage categories for assets, documents, and departments</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {(['assets', 'documents', 'departments'] as const).map((tab) => {
            const config = getTabConfig(tab)
            const Icon = config.icon
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab)
                  setShowAddForm(false)
                  setEditingItem(null)
                }}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-[#187F7E] text-[#187F7E]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {config.title}
              </button>
            )
          })}
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {(() => {
                    const config = getTabConfig(activeTab)
                    const Icon = config.icon
                    return <Icon className="w-5 h-5 mr-2" />
                  })()}
                  <div>
                    <CardTitle>{getTabConfig(activeTab).title}</CardTitle>
                    <CardDescription>{getTabConfig(activeTab).description}</CardDescription>
                  </div>
                </div>
                <PermissionGuard 
                  module="CATEGORIES" 
                  permission="canWrite"
                  fallback={
                    <Button disabled className="bg-gray-400 cursor-not-allowed">
                      <Plus className="w-4 h-4 mr-2" />
                      Access Denied
                    </Button>
                  }
                >
                  <Button
                    onClick={() => setShowAddForm(true)}
                    className="bg-[#187F7E] hover:bg-[#00AAA8]"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                  </Button>
                </PermissionGuard>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-4 border-[#187F7E] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : getCurrentCategories().length === 0 ? (
                <div className="text-center py-8">
                  <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No categories found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getCurrentCategories().map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{category.name}</h3>
                        {category.description && (
                          <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            category.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {category.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <span className="text-xs text-gray-500">
                            Created: {new Date(category.createdAt).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                      </div>
                      <ActionsDropdown items={categoryActions(category)} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingItem ? 'Edit Category' : 'Add New Category'}
                </CardTitle>
                <CardDescription>
                  {editingItem ? 'Update category information' : 'Create a new category'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category Name *
                    </label>
                    <Input
                      type="text"
                      value={newCategoryForm.name}
                      onChange={(e) => setNewCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <Textarea
                      value={newCategoryForm.description}
                      onChange={(e) => setNewCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      type="submit"
                      className="bg-[#187F7E] hover:bg-[#00AAA8] flex-1"
                    >
                      {editingItem ? 'Update' : 'Create'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={cancelForm}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, item: null, loading: false })}
        onConfirm={confirmDelete}
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone."
        itemName={deleteModal.item?.name}
        loading={deleteModal.loading}
      />

      {/* Permission Modal */}
      <Dialog open={permissionModal.isOpen} onOpenChange={(open) => {
        if (!open) {
          setPermissionModal({ isOpen: false, department: null, loading: false })
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Department Permissions - {permissionModal.department?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <p className="text-sm text-gray-600">
              Configure access permissions for this department to different modules.
            </p>
            
            {permissionModal.department && (
              <div className="space-y-4">
                {[
                  { key: 'ASSETS', label: 'Assets Management', description: 'Access to asset management module' },
                  { key: 'DOCUMENTS', label: 'Documents Management', description: 'Access to document management module' },
                  { key: 'DIGITAL_ASSETS', label: 'Digital Assets Management', description: 'Access to digital asset management module' }
                ].map((module) => {
                  const permissions = departmentPermissions[permissionModal.department!.id]?.[module.key as keyof typeof departmentPermissions[string]] || { canRead: false, canWrite: false }
                  
                  return (
                    <div key={module.key} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{module.label}</h4>
                          <p className="text-sm text-gray-500">{module.description}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`${module.key}-read`}
                            checked={permissions.canRead}
                            onCheckedChange={(checked) => handlePermissionChange(permissionModal.department!.id, module.key, 'canRead', checked as boolean)}
                          />
                          <label htmlFor={`${module.key}-read`} className="text-sm font-medium">
                            View Only
                          </label>
                          <span className="text-xs text-gray-500">- Can view existing items</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`${module.key}-write`}
                            checked={permissions.canWrite}
                            onCheckedChange={(checked) => handlePermissionChange(permissionModal.department!.id, module.key, 'canWrite', checked as boolean)}
                          />
                          <label htmlFor={`${module.key}-write`} className="text-sm font-medium">
                            Can Add Items
                          </label>
                          <span className="text-xs text-gray-500">- Can create new items</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setPermissionModal({ isOpen: false, department: null, loading: false })}
              >
                Cancel
              </Button>
              <Button
                onClick={savePermissions}
                disabled={permissionModal.loading}
                className="bg-[#187F7E] hover:bg-[#00AAA8]"
              >
                {permissionModal.loading ? 'Saving...' : 'Save Permissions'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>


    </div>
    </PermissionGuard>
  )
}