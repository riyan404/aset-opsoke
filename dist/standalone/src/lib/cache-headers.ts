/**
 * Cache Headers Utility
 * Provides standardized cache control headers for different types of data
 */

export interface CacheConfig {
  maxAge?: number;
  sMaxAge?: number;
  staleWhileRevalidate?: number;
  mustRevalidate?: boolean;
  noCache?: boolean;
  noStore?: boolean;
  private?: boolean;
  public?: boolean;
}

export class CacheHeaders {
  /**
   * No cache - for sensitive or frequently changing data
   * Use for: user data, permissions, real-time data
   */
  static noCache(): Headers {
    const headers = new Headers();
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, private');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');
    return headers;
  }

  /**
   * Short cache - for data that changes moderately
   * Use for: dashboard stats, notifications
   */
  static shortCache(maxAge: number = 300): Headers {
    const headers = new Headers();
    headers.set('Cache-Control', `public, max-age=${maxAge}, s-maxage=${maxAge}, stale-while-revalidate=60`);
    return headers;
  }

  /**
   * Medium cache - for semi-static data
   * Use for: categories, departments, configurations
   */
  static mediumCache(maxAge: number = 1800): Headers {
    const headers = new Headers();
    headers.set('Cache-Control', `public, max-age=${maxAge}, s-maxage=${maxAge}, stale-while-revalidate=300`);
    return headers;
  }

  /**
   * Long cache - for static data
   * Use for: static assets, rarely changing configurations
   */
  static longCache(maxAge: number = 86400): Headers {
    const headers = new Headers();
    headers.set('Cache-Control', `public, max-age=${maxAge}, s-maxage=${maxAge}, immutable`);
    return headers;
  }

  /**
   * Custom cache configuration
   */
  static custom(config: CacheConfig): Headers {
    const headers = new Headers();
    const directives: string[] = [];

    if (config.noCache) {
      directives.push('no-cache');
    }
    if (config.noStore) {
      directives.push('no-store');
    }
    if (config.mustRevalidate) {
      directives.push('must-revalidate');
    }
    if (config.private) {
      directives.push('private');
    }
    if (config.public) {
      directives.push('public');
    }
    if (config.maxAge !== undefined) {
      directives.push(`max-age=${config.maxAge}`);
    }
    if (config.sMaxAge !== undefined) {
      directives.push(`s-maxage=${config.sMaxAge}`);
    }
    if (config.staleWhileRevalidate !== undefined) {
      directives.push(`stale-while-revalidate=${config.staleWhileRevalidate}`);
    }

    headers.set('Cache-Control', directives.join(', '));
    
    if (config.noCache) {
      headers.set('Pragma', 'no-cache');
      headers.set('Expires', '0');
    }

    return headers;
  }

  /**
   * Merge cache headers with existing response headers
   */
  static mergeHeaders(response: Response, cacheHeaders: Headers): Response {
    const newHeaders = new Headers(response.headers);
    cacheHeaders.forEach((value, key) => {
      newHeaders.set(key, value);
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  }
}

/**
 * Cache Tags for Next.js revalidation
 */
export const CACHE_TAGS = {
  USERS: 'users',
  USER_PROFILE: 'user-profile',
  PERMISSIONS: 'permissions',
  DEPARTMENTS: 'departments',
  CATEGORIES: 'categories',
  ASSETS: 'assets',
  DIGITAL_ASSETS: 'digital-assets',
  DOCUMENTS: 'documents',
  DASHBOARD: 'dashboard',
  DASHBOARD_STATS: 'dashboard-stats',
  AUDIT_LOGS: 'audit-logs',
  NOTIFICATIONS: 'notifications',
  WATERMARKS: 'watermarks',
} as const;

export type CacheTag = typeof CACHE_TAGS[keyof typeof CACHE_TAGS];