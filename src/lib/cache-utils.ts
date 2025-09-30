import { revalidateTag } from 'next/cache'
import { CACHE_TAGS } from './cache-headers'

/**
 * Utility functions for cache management
 */
export class CacheManager {
  /**
   * Invalidate all user-related caches
   */
  static invalidateUserCaches() {
    revalidateTag(CACHE_TAGS.USERS)
    revalidateTag(CACHE_TAGS.PERMISSIONS)
  }

  /**
   * Invalidate all asset-related caches
   */
  static invalidateAssetCaches() {
    revalidateTag(CACHE_TAGS.ASSETS)
    revalidateTag(CACHE_TAGS.CATEGORIES)
    revalidateTag(CACHE_TAGS.DASHBOARD)
  }

  /**
   * Invalidate all document-related caches
   */
  static invalidateDocumentCaches() {
    revalidateTag(CACHE_TAGS.DOCUMENTS)
    revalidateTag(CACHE_TAGS.DASHBOARD)
  }

  /**
   * Invalidate all digital asset-related caches
   */
  static invalidateDigitalAssetCaches() {
    revalidateTag(CACHE_TAGS.DIGITAL_ASSETS)
    revalidateTag(CACHE_TAGS.DASHBOARD)
  }

  /**
   * Invalidate dashboard-related caches
   */
  static invalidateDashboardCaches() {
    revalidateTag(CACHE_TAGS.DASHBOARD)
  }

  /**
   * Invalidate all caches (use with caution)
   */
  static invalidateAllCaches() {
    Object.values(CACHE_TAGS).forEach(tag => {
      revalidateTag(tag)
    })
  }

  /**
   * Get cache version for API versioning
   */
  static getCacheVersion(): string {
    return Date.now().toString()
  }

  /**
   * Generate versioned API URL
   */
  static getVersionedUrl(baseUrl: string, version?: string): string {
    const url = new URL(baseUrl, window.location.origin)
    url.searchParams.set('v', version || this.getCacheVersion())
    return url.toString()
  }
}

/**
 * Cache invalidation hooks for specific operations
 */
export const CacheInvalidation = {
  /**
   * After user operations (create, update, delete)
   */
  onUserChange: () => {
    CacheManager.invalidateUserCaches()
  },

  /**
   * After asset operations (create, update, delete)
   */
  onAssetChange: () => {
    CacheManager.invalidateAssetCaches()
  },

  /**
   * After document operations (create, update, delete)
   */
  onDocumentChange: () => {
    CacheManager.invalidateDocumentCaches()
  },

  /**
   * After digital asset operations (create, update, delete)
   */
  onDigitalAssetChange: () => {
    CacheManager.invalidateDigitalAssetCaches()
  },

  /**
   * After permission changes
   */
  onPermissionChange: () => {
    revalidateTag(CACHE_TAGS.PERMISSIONS)
    CacheManager.invalidateUserCaches()
  },

  /**
   * After category changes
   */
  onCategoryChange: () => {
    revalidateTag(CACHE_TAGS.CATEGORIES)
    CacheManager.invalidateAssetCaches()
  }
}