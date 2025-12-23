import { FlyToInterpolator } from '@deck.gl/core';

export interface ZoomConfig {
  coordinates: [number, number];
  zoomLevel?: number;
  pitch?: number;
  bearing?: number;
  duration?: number;
}

export const DEFAULT_ZOOM_CONFIG = {
  zoomLevel: 16,
  pitch: 45,
  bearing: 0,
  duration: 1000
};

/**
 * Creates a zoom function for map markers
 * @param mapRef Reference to the DeckGL map instance
 * @returns Function to zoom to specific coordinates
 */
export function createZoomToMarker(mapRef: React.RefObject<any>) {
  return (config: ZoomConfig) => {
    const map = mapRef.current;
    if (!map) {
      console.warn('Map reference not available');
      return;
    }

    const { coordinates, zoomLevel, pitch, bearing, duration } = {
      ...DEFAULT_ZOOM_CONFIG,
      ...config
    };

    try {
      map.setProps({
        initialViewState: {
          longitude: coordinates[0],
          latitude: coordinates[1],
          zoom: zoomLevel,
          pitch,
          bearing,
          transitionDuration: duration,
          transitionInterpolator: new FlyToInterpolator()
        }
      });
    } catch (error) {
      console.error('Error zooming to marker:', error);
    }
  };
}

/**
 * Zoom configurations for different POI types
 */
export const POI_ZOOM_LEVELS = {
  beach: {
    zoomLevel: 16,
    pitch: 45,
    bearing: 0,
    duration: 1200
  },
  mountain: {
    zoomLevel: 15,
    pitch: 60,
    bearing: 0,
    duration: 1400
  },
  cultural: {
    zoomLevel: 17,
    pitch: 50,
    bearing: 0,
    duration: 1000
  },
  default: {
    zoomLevel: 16,
    pitch: 45,
    bearing: 0,
    duration: 1000
  }
};

/**
 * Get zoom configuration based on POI category
 * @param category POI category (Beach, Mountain, Cultural, etc.)
 * @returns Zoom configuration object
 */
export function getZoomConfigForCategory(category?: string): Partial<ZoomConfig> {
  if (!category) return POI_ZOOM_LEVELS.default;
  
  const normalizedCategory = category.toLowerCase();
  
  if (normalizedCategory.includes('beach')) return POI_ZOOM_LEVELS.beach;
  if (normalizedCategory.includes('mountain') || normalizedCategory.includes('hill')) return POI_ZOOM_LEVELS.mountain;
  if (normalizedCategory.includes('cultural') || normalizedCategory.includes('heritage')) return POI_ZOOM_LEVELS.cultural;
  
  return POI_ZOOM_LEVELS.default;
}
