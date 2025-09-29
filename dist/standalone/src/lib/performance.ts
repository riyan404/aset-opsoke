// Performance optimization utilities
export class PerformanceOptimizer {
  // Enhanced image optimization with WebP/AVIF support
  static optimizeImageSrc(src: string, width?: number, height?: number): string {
    if (src.startsWith('data:')) {
      return src;
    }
    
    // Add image optimization parameters
    const url = new URL(src, window.location.origin);
    if (width) url.searchParams.set('w', width.toString());
    if (height) url.searchParams.set('h', height.toString());
    url.searchParams.set('q', '85'); // Quality
    
    // Check browser support for modern formats
    if (this.supportsAVIF()) {
      url.searchParams.set('f', 'avif');
    } else if (this.supportsWebP()) {
      url.searchParams.set('f', 'webp');
    }
    
    return url.toString();
  }

  // Check WebP support
  static supportsWebP(): boolean {
    if (typeof window === 'undefined') return false;
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  // Check AVIF support
  static supportsAVIF(): boolean {
    if (typeof window === 'undefined') return false;
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
  }

  // Enhanced preload critical resources
  static preloadCriticalResources() {
    const criticalResources = [
      { href: '/api/digital-assets?page=1&limit=12', as: 'fetch' },
      { href: '/api/permissions/digital-assets', as: 'fetch' },
      { href: '/_next/static/css/app.css', as: 'style' },
      { href: '/_next/static/chunks/main.js', as: 'script' }
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      if (resource.as === 'fetch') {
        link.crossOrigin = 'anonymous';
      }
      document.head.appendChild(link);
    });

    // DNS prefetch for external domains
    const domains = ['orderkuota.cobacoba.id', 'www.orderkuota.cobacoba.id'];
    domains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = `//${domain}`;
      document.head.appendChild(link);
    });
  }

  // Intersection Observer for lazy loading
  static createIntersectionObserver(callback: (entries: IntersectionObserverEntry[]) => void) {
    return new IntersectionObserver(callback, {
      root: null,
      rootMargin: '50px',
      threshold: 0.1
    });
  }

  // Debounce function for search
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Memory-efficient pagination
  static calculateOptimalPageSize(): number {
    const screenHeight = window.innerHeight;
    const cardHeight = 300; // Approximate card height
    const cardsPerRow = window.innerWidth > 1024 ? 4 : window.innerWidth > 768 ? 3 : 2;
    const visibleRows = Math.ceil(screenHeight / cardHeight);
    
    return Math.max(12, visibleRows * cardsPerRow * 2); // Load 2x visible content
  }

  // Service Worker registration for caching
  static async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  // Resource hints
  static addResourceHints() {
    const hints = [
      { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
    ];

    hints.forEach(hint => {
      const link = document.createElement('link');
      Object.assign(link, hint);
      document.head.appendChild(link);
    });
  }
}

// React hook for performance monitoring
export function usePerformanceMonitor() {
  const measurePageLoad = () => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
      
      console.log(`Page load time: ${loadTime}ms`);
      
      // Send to analytics if needed
      if (loadTime > 3000) {
        console.warn('Slow page load detected:', loadTime);
      }
    }
  };

  return { measurePageLoad };
}