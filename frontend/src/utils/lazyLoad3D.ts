/**
 * Lazy loading utility for 3D models
 * Only loads models when they're in viewport or near it
 */

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

interface Model3DLoadOptions {
  modelPath: string;
  onProgress?: (progress: number) => void;
  useDraco?: boolean;
}

interface LoadedModel {
  scene: any;
  animations: any[];
}

// Model cache to avoid re-downloading
const modelCache = new Map<string, Promise<LoadedModel>>();

// Setup DRACO loader for compressed models
let dracoLoader: DRACOLoader | null = null;

function getDracoLoader(): DRACOLoader {
  if (!dracoLoader) {
    dracoLoader = new DRACOLoader();
    // Use CDN for DRACO decoder
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    dracoLoader.setDecoderConfig({ type: 'js' });
  }
  return dracoLoader;
}

/**
 * Load a 3D model with caching and progress tracking
 */
export async function load3DModel({
  modelPath,
  onProgress,
  useDraco = true,
}: Model3DLoadOptions): Promise<LoadedModel> {
  // Check cache first
  if (modelCache.has(modelPath)) {
    return modelCache.get(modelPath)!;
  }

  // Create new loader
  const loader = new GLTFLoader();
  
  // Enable DRACO compression support
  if (useDraco) {
    loader.setDRACOLoader(getDracoLoader());
  }

  // Load with retry logic
  const loadPromise = loadWithRetry(() => {
    return new Promise<LoadedModel>((resolve, reject) => {
      loader.load(
        modelPath,
        (gltf) => {
          resolve({
            scene: gltf.scene,
            animations: gltf.animations,
          });
        },
        (progress) => {
          if (onProgress && progress.total > 0) {
            const percent = (progress.loaded / progress.total) * 100;
            onProgress(percent);
          }
        },
        (error) => {
          reject(error);
        }
      );
    });
  }, 3);

  // Cache the promise
  modelCache.set(modelPath, loadPromise);

  return loadPromise;
}

/**
 * Retry logic with exponential backoff
 */
async function loadWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        // Wait with exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }

  throw lastError!;
}

/**
 * Check if element is in viewport (with offset for pre-loading)
 */
export function isInViewport(
  coordinates: [number, number],
  map: any,
  offsetPixels: number = 500
): boolean {
  if (!map) return false;

  const point = map.project(coordinates);
  const bounds = map.getCanvas().getBoundingClientRect();

  return (
    point.x >= -offsetPixels &&
    point.x <= bounds.width + offsetPixels &&
    point.y >= -offsetPixels &&
    point.y <= bounds.height + offsetPixels
  );
}

/**
 * Clear model cache (useful for memory management)
 */
export function clearModelCache() {
  modelCache.clear();
  if (dracoLoader) {
    dracoLoader.dispose();
    dracoLoader = null;
  }
}

/**
 * Preload models that are likely to be viewed next
 */
export function preloadNearbyModels(
  models: Array<{ modelPath: string; coordinates: [number, number] }>,
  map: any,
  maxDistance: number = 1000
) {
  const center = map.getCenter();
  
  models
    .filter(model => {
      const distance = map.project(model.coordinates).dist(map.project([center.lng, center.lat]));
      return distance < maxDistance;
    })
    .forEach(model => {
      // Start loading but don't wait
      load3DModel({ modelPath: model.modelPath }).catch(() => {
        // Silently fail preloading
      });
    });
}
