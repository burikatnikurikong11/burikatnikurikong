import type { Place } from '../types/place'

/**
 * Map GeoJSON type to category ID
 */
const TYPE_TO_CATEGORY: Record<string, string> = {
  'BEACHES': 'beaches',
  'BEACH': 'beaches',
  'HOTELS & RESORTS': 'accommodation',
  'RESORTS': 'accommodation',
  'HOTELS': 'accommodation',
  'RESTAURANTS & CAFES': 'food',
  'RESTAURANTS': 'food',
  'CAFES': 'food',
  'FALLS': 'nature',
  'WATERFALLS': 'nature',
  'VIEWPOINTS': 'nature',
  'PARKS': 'nature',
  'HIKING': 'activities',
  'SURFING': 'activities',
  'DIVING': 'activities',
  'CHURCHES': 'culture',
  'MUSEUMS': 'culture',
  'HISTORICAL': 'culture',
}

/**
 * Get category from GeoJSON type field
 */
function getCategoryFromType(type: string): string | null {
  const upperType = type.toUpperCase()
  return TYPE_TO_CATEGORY[upperType] || null
}

/**
 * Load tourist spots from all municipality GeoJSON files
 */
export async function loadAllTouristSpots(): Promise<Place[]> {
  const municipalities = [
    'VIRAC',
    'BATO',
    'bagamanoc',
    'baras',
    'caramoran',
    'gigmoto',
    'pandan',
    'panganiban',
    'san_andres',
    'san_miguel',
    'viga'
  ]

  const allSpots: Place[] = []

  for (const municipality of municipalities) {
    try {
      const response = await fetch(`/municipalities/${municipality}.geojson`)
      if (!response.ok) continue

      const geojson: GeoJSON.FeatureCollection = await response.json()

      geojson.features.forEach((feature: any) => {
        if (feature.geometry.type === 'Point' && feature.properties) {
          const category = getCategoryFromType(feature.properties.type || '')
          
          const place: Place = {
            name: feature.properties.name || 'Unknown',
            coordinates: feature.geometry.coordinates as [number, number],
            municipality: feature.properties.municipality || municipality.toUpperCase(),
            description: feature.properties.description || '',
            category: category || 'other',
            type: feature.properties.type || 'Unknown',
            size: feature.properties.size || 0.15,
            showAtZoom: feature.properties.showAtZoom || 10
          }

          allSpots.push(place)
        }
      })
    } catch (error) {
      console.warn(`Failed to load ${municipality}.geojson:`, error)
    }
  }

  return allSpots
}
