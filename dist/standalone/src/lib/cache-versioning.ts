/**
 * Cache Versioning Strategy
 * Provides versioning mechanism for API responses to handle cache invalidation
 */

export interface VersionedResponse<T = any> {
  data: T;
  version: string;
  timestamp: number;
  etag?: string;
}

export class CacheVersioning {
  private static versionStore = new Map<string, string>();

  /**
   * Generate a new version for a resource
   */
  static generateVersion(resourceKey: string): string {
    const version = Date.now().toString(36) + Math.random().toString(36).substr(2);
    this.versionStore.set(resourceKey, version);
    return version;
  }

  /**
   * Get current version for a resource
   */
  static getCurrentVersion(resourceKey: string): string {
    return this.versionStore.get(resourceKey) || this.generateVersion(resourceKey);
  }

  /**
   * Create versioned response
   */
  static createVersionedResponse<T>(
    data: T,
    resourceKey: string,
    customVersion?: string
  ): VersionedResponse<T> {
    const version = customVersion || this.getCurrentVersion(resourceKey);
    const timestamp = Date.now();
    const etag = this.generateETag(version, timestamp);

    return {
      data,
      version,
      timestamp,
      etag
    };
  }

  /**
   * Generate ETag for response
   */
  static generateETag(version: string, timestamp: number): string {
    return `"${version}-${timestamp}"`;
  }

  /**
   * Check if client version is current
   */
  static isVersionCurrent(resourceKey: string, clientVersion: string): boolean {
    const currentVersion = this.getCurrentVersion(resourceKey);
    return currentVersion === clientVersion;
  }

  /**
   * Invalidate version for a resource
   */
  static invalidateVersion(resourceKey: string): string {
    return this.generateVersion(resourceKey);
  }

  /**
   * Get versioned headers for response
   */
  static getVersionHeaders(version: string, timestamp: number): Headers {
    const headers = new Headers();
    headers.set('ETag', this.generateETag(version, timestamp));
    headers.set('X-Resource-Version', version);
    headers.set('X-Resource-Timestamp', timestamp.toString());
    return headers;
  }

  /**
   * Check if request has matching ETag
   */
  static checkETag(request: Request, version: string, timestamp: number): boolean {
    const ifNoneMatch = request.headers.get('If-None-Match');
    if (!ifNoneMatch) return false;

    const expectedETag = this.generateETag(version, timestamp);
    return ifNoneMatch === expectedETag;
  }
}

/**
 * Resource keys for versioning
 */
export const VERSION_KEYS = {
  USERS: 'users',
  USER_PROFILE: 'user-profile',
  PERMISSIONS: 'permissions',
  ASSETS: 'assets',
  DOCUMENTS: 'documents',
  DIGITAL_ASSETS: 'digital-assets',
  DASHBOARD_STATS: 'dashboard-stats',
  CATEGORIES: 'categories',
  DEPARTMENTS: 'departments',
} as const;

export type VersionKey = typeof VERSION_KEYS[keyof typeof VERSION_KEYS];

/**
 * Middleware helper for versioned responses
 */
export class VersionedResponseHelper {
  /**
   * Create a versioned API response with proper headers
   */
  static createResponse<T>(
    data: T,
    resourceKey: string,
    status: number = 200,
    customHeaders?: Headers
  ): Response {
    const versionedData = CacheVersioning.createVersionedResponse(data, resourceKey);
    const headers = new Headers(customHeaders);
    
    // Add versioning headers
    const versionHeaders = CacheVersioning.getVersionHeaders(
      versionedData.version,
      versionedData.timestamp
    );
    
    versionHeaders.forEach((value, key) => {
      headers.set(key, value);
    });

    // Add JSON content type
    headers.set('Content-Type', 'application/json');

    return new Response(JSON.stringify(versionedData), {
      status,
      headers
    });
  }

  /**
   * Handle conditional requests (304 Not Modified)
   */
  static handleConditionalRequest(
    request: Request,
    resourceKey: string
  ): Response | null {
    const currentVersion = CacheVersioning.getCurrentVersion(resourceKey);
    const timestamp = Date.now();

    if (CacheVersioning.checkETag(request, currentVersion, timestamp)) {
      const headers = new Headers();
      headers.set('ETag', CacheVersioning.generateETag(currentVersion, timestamp));
      
      return new Response(null, {
        status: 304,
        headers
      });
    }

    return null;
  }
}