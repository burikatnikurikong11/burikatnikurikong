/**
 * Map-specific optimization utilities
 */

import { throttle, debounce } from './debounce';

/**
 * Optimize map event handlers
 */
export function createOptimizedMapHandlers() {
  return {
    // Throttle move events (fires frequently during pan)
    onMove: throttle((callback: () => void) => callback(), 100),
    
    // Throttle zoom events
    onZoom: throttle((callback: () => void) => callback(), 150),
    
    // Debounce idle events (fires when user stops interacting)
    onIdle: debounce((callback: () => void) => callback(), 300),
    
    // Debounce resize events
    onResize: debounce((callback: () => void) => callback(), 200),
  };
}

/**
 * Reduce tile quality on mobile for better performance
 */
export function getOptimalTileSize(): number {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isLowEnd = navigator.hardwareConcurrency ? navigator.hardwareConcurrency <= 4 : false;
  
  if (isMobile && isLowEnd) {
    return 256; // Lower resolution tiles
  }
  return 512; // Standard resolution
}

/**
 * Check if device can handle 3D models
 */
export function canHandle3DModels(): boolean {
  // Check WebGL support
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  
  if (!gl) return false;

  // Check device capabilities
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isLowEnd = navigator.hardwareConcurrency ? navigator.hardwareConcurrency <= 4 : false;
  const hasLowMemory = (navigator as any).deviceMemory ? (navigator as any).deviceMemory < 4 : false;

  // Disable 3D on low-end mobile devices
  if (isMobile && (isLowEnd || hasLowMemory)) {
    return false;
  }

  return true;
}

/**
 * Get optimal zoom limits based on device
 */
export function getOptimalZoomLimits(): { min: number; max: number } {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  return {
    min: 8,
    max: isMobile ? 18 : 20, // Limit max zoom on mobile
  };
}

/**
 * Batch map updates for better performance
 */
export class MapUpdateBatcher {
  private updates: Map<string, () => void> = new Map();
  private rafId: number | null = null;

  add(key: string, update: () => void) {
    this.updates.set(key, update);
    this.schedule();
  }

  private schedule() {
    if (this.rafId !== null) return;

    this.rafId = requestAnimationFrame(() => {
      this.flush();
    });
  }

  private flush() {
    this.updates.forEach(update => update());
    this.updates.clear();
    this.rafId = null;
  }

  clear() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.updates.clear();
  }
}
