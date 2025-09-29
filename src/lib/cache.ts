import { LRUCache } from 'lru-cache'

// Cache for permissions - expires after 5 minutes
const permissionsCache = new LRUCache<string, any>({
  max: 1000, // Maximum 1000 entries
  ttl: 5 * 60 * 1000, // 5 minutes TTL
})

// Cache for user data - expires after 10 minutes
const userCache = new LRUCache<string, any>({
  max: 500, // Maximum 500 entries
  ttl: 10 * 60 * 1000, // 10 minutes TTL
})

// Cache for digital assets - expires after 2 minutes
const digitalAssetsCache = new LRUCache<string, any>({
  max: 100, // Maximum 100 entries
  ttl: 2 * 60 * 1000, // 2 minutes TTL
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