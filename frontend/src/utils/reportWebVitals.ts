import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

/**
 * Web Vitals Performance Monitoring
 * Reports Core Web Vitals metrics for performance tracking
 */

interface Metric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

function sendToAnalytics(metric: Metric) {
  // Log to console in development
  if (import.meta.env.DEV) {
    console.log('📊 Web Vitals:', {
      name: metric.name,
      value: Math.round(metric.value),
      rating: metric.rating,
    });
  }

  // Send to your analytics service in production
  // Example: Google Analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      event_category: 'Web Vitals',
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_label: metric.id,
      non_interaction: true,
    });
  }

  // Example: Custom analytics endpoint
  if (import.meta.env.PROD) {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    fetch(`${apiUrl}/analytics/vitals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metric),
      keepalive: true,
    }).catch(() => {
      // Silently fail - don't break the app for analytics
    });
  }
}

export function reportWebVitals(onPerfEntry?: (metric: Metric) => void) {
  const callback = onPerfEntry || sendToAnalytics;

  // Cumulative Layout Shift (CLS) - visual stability
  onCLS(callback);
  
  // First Input Delay (FID) - interactivity
  onFID(callback);
  
  // First Contentful Paint (FCP) - loading performance
  onFCP(callback);
  
  // Largest Contentful Paint (LCP) - loading performance
  onLCP(callback);
  
  // Time to First Byte (TTFB) - server response time
  onTTFB(callback);
}

// Export individual metric reporters for custom usage
export { onCLS, onFID, onFCP, onLCP, onTTFB };
