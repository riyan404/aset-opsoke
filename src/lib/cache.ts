import { LRUCache } from 'lru-cache'

// Reduced cache sizes for memory optimization
// Cache for permissions - expires after 3 minutes (reduced from 5)
const permissionsCache = new LRUCache<string, any>({
  max: 500, // Reduced from 1000 to 500 entries
  ttl: 3 * 60 * 1000, // Reduced from 5 to 3 minutes TTL
})

// Cache for user data - expires after 5 minutes (reduced from 10)
const userCache = new LRUCache<string, any>({
  max: 200, // Reduced from 500 to 200 entries
  ttl: 5 * 60 * 1000, // Reduced from 10 to 5 minutes TTL
})

// Cache for digital assets - expires after 1 minute (reduced from 2)
const digitalAssetsCache = new LRUCache<string, any>({
  max: 50, // Reduced from 100 to 50 entries
  ttl: 1 * 60 * 1000, // Reduced from 2 to 1 minute TTL
})

export class CacheManager {
  // Permission caching
  static getPermissions(key: string) {
    return permissionsCache.get(key)
  }

  static setPermissions(key: string, value: any) {
    permissionsCache.set(key, value)
  }

  static clearPermissions(key?: string) {
    if (key) {
      permissionsCache.delete(key)
    } else {
      permissionsCache.clear()
    }
  }

  // User caching
  static getUser(key: string) {
    return userCache.get(key)
  }

  static setUser(key: string, value: any) {
    userCache.set(key, value)
  }

  static clearUser(key?: string) {
    if (key) {
      userCache.delete(key)
    } else {
      userCache.clear()
    }
  }

  // Digital assets caching
  static getDigitalAssets(key: string) {
    return digitalAssetsCache.get(key)
  }

  static setDigitalAssets(key: string, value: any) {
    digitalAssetsCache.set(key, value)
  }

  static clearDigitalAssets(key?: string) {
    if (key) {
      digitalAssetsCache.delete(key)
    } else {
      digitalAssetsCache.clear()
    }
  }

  // Clear all caches
  static clearAll() {
    permissionsCache.clear()
    userCache.clear()
    digitalAssetsCache.clear()
  }

  // Automatic cache cleanup - call this periodically to free memory
  static performCleanup() {
    // Force garbage collection on caches
    permissionsCache.purgeStale()
    userCache.purgeStale()
    digitalAssetsCache.purgeStale()
    
    // Log cache sizes for monitoring
    if (process.env.NODE_ENV === 'development') {
      console.log(`Cache sizes - Permissions: ${permissionsCache.size}, Users: ${userCache.size}, Assets: ${digitalAssetsCache.size}`)
    }
  }

  // Get cache statistics for monitoring
  static getCacheStats() {
    return {
      permissions: {
        size: permissionsCache.size,
        max: permissionsCache.max,
        ttl: 3 * 60 * 1000
      },
      users: {
        size: userCache.size,
        max: userCache.max,
        ttl: 5 * 60 * 1000
      },
      digitalAssets: {
        size: digitalAssetsCache.size,
        max: digitalAssetsCache.max,
        ttl: 1 * 60 * 1000
      }
    }
  }

  // Generate cache keys
  static generatePermissionKey(department: string | null, role: string, module: string) {
    return `perm:${department || 'null'}:${role}:${module}`
  }

  static generateUserKey(userId: string) {
    return `user:${userId}`
  }

  static generateDigitalAssetsKey(params: {
    page: number
    limit: number
    search?: string
    aspectRatio?: string
    department?: string
  }) {
    const { page, limit, search = '', aspectRatio = '', department = '' } = params
    return `digital-assets:${page}:${limit}:${search}:${aspectRatio}:${department}`
  }
}