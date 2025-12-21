/**
 * Coordinate validation and manipulation utilities
 */

/**
 * Validates if coordinates are within valid ranges
 * @param lng - Longitude (-180 to 180)
 * @param lat - Latitude (-90 to 90)
 * @returns True if coordinates are valid
 */
export function isValidCoordinate(lng: number, lat: number): boolean {
  return (
    typeof lng === 'number' &&
    typeof lat === 'number' &&
    !isNaN(lng) &&
    !isNaN(lat) &&
    lng >= -180 &&
    lng <= 180 &&
    lat >= -90 &&
    lat <= 90
  )
}

/**
 * Validates a coordinate pair [longitude, latitude]
 * @param coords - Coordinate pair
 * @returns True if coordinates are valid
 */
export function isValidCoordinatePair(
  coords: [number, number] | number[]
): coords is [number, number] {
  return (
    Array.isArray(coords) &&
    coords.length === 2 &&
    isValidCoordinate(coords[0], coords[1])
  )
}

/**
 * Calculates the distance between two coordinates using Haversine formula
 * @param coord1 - First coordinate [lng, lat]
 * @param coord2 - Second coordinate [lng, lat]
 * @returns Distance in meters
 */
export function calculateDistance(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const [lng1, lat1] = coord1
  const [lng2, lat2] = coord2

  if (!isValidCoordinate(lng1, lat1) || !isValidCoordinate(lng2, lat2)) {
    return Infinity
  }

  const R = 6371000 // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Calculates simple Euclidean distance in degrees (for quick comparisons)
 * @param coord1 - First coordinate [lng, lat]
 * @param coord2 - Second coordinate [lng, lat]
 * @returns Distance in degrees (approximate)
 */
export function calculateDistanceDegrees(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const [lng1, lat1] = coord1
  const [lng2, lat2] = coord2
  return Math.sqrt(Math.pow(lng2 - lng1, 2) + Math.pow(lat2 - lat1, 2))
}

/**
 * Formats coordinates for display
 * @param coord - Coordinate [lng, lat]
 * @param precision - Number of decimal places (default: 6)
 * @returns Formatted string
 */
export function formatCoordinate(
  coord: [number, number],
  precision: number = 6
): string {
  const [lng, lat] = coord
  return `${lat.toFixed(precision)}, ${lng.toFixed(precision)}`
}

/**
 * Formats distance for display
 * @param meters - Distance in meters
 * @returns Formatted string (meters or kilometers)
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`
  }
  return `${(meters / 1000).toFixed(2)}km`
}

/**
 * Checks if a point is inside a polygon using ray casting algorithm
 * @param point - Point coordinates [lng, lat]
 * @param polygon - Array of polygon coordinates [[lng, lat], ...]
 * @returns True if point is inside polygon
 */
function isPointInPolygon(point: [number, number], polygon: number[][]): boolean {
  if (!polygon || polygon.length < 3) {
    return false // Need at least 3 points for a valid polygon
  }

  const [x, y] = point
  let inside = false

  // Ray casting algorithm: count intersections with horizontal ray from point
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const pi = polygon[i]
    const pj = polygon[j]
    
    // Skip if coordinates are not properly formatted
    if (!Array.isArray(pi) || !Array.isArray(pj) || pi.length < 2 || pj.length < 2) {
      continue
    }
    
    const [xi, yi] = pi
    const [xj, yj] = pj

    // Check if edge crosses the horizontal line at y
    const crosses = (yi > y) !== (yj > y)
    if (crosses) {
      // Calculate x-coordinate of intersection
      const denominator = yj - yi
      if (Math.abs(denominator) > 1e-10) { // Avoid division by zero
        const intersectionX = (xj - xi) * (y - yi) / denominator + xi
        if (x < intersectionX) {
          inside = !inside
        }
      }
    }
  }

  return inside
}

/**
 * Checks if a point is inside a GeoJSON feature (Polygon or MultiPolygon)
 * @param point - Point coordinates [lng, lat]
 * @param feature - GeoJSON feature with Polygon or MultiPolygon geometry
 * @returns True if point is inside the feature
 */
export function isPointInGeoJSONFeature(
  point: [number, number],
  feature: GeoJSON.Feature
): boolean {
  if (!feature.geometry) return false

  const geometry = feature.geometry

  if (geometry.type === 'Polygon') {
    // GeoJSON Polygon: coordinates[0] is the outer ring (array of [lng, lat] pairs)
    // Each ring is an array of coordinate pairs: [[lng, lat], [lng, lat], ...]
    const outerRing = geometry.coordinates[0] as number[][]
    
    // Ensure outerRing is properly formatted (array of [lng, lat] pairs)
    if (!outerRing || outerRing.length === 0) return false
    
    // Check if point is in the outer ring
    if (!isPointInPolygon(point, outerRing)) {
      return false
    }
    
    // Check if point is in any hole (inner rings)
    for (let i = 1; i < geometry.coordinates.length; i++) {
      const hole = geometry.coordinates[i] as number[][]
      if (isPointInPolygon(point, hole)) {
        return false // Point is in a hole
      }
    }
    return true
  }

  if (geometry.type === 'MultiPolygon') {
    // GeoJSON MultiPolygon: array of polygons, each polygon has rings
    // coordinates = [[[[lng, lat], ...], [[lng, lat], ...]], ...]
    for (const polygon of geometry.coordinates) {
      // polygon is an array of rings: [[[lng, lat], ...], [[lng, lat], ...]]
      const outerRing = polygon[0] as number[][]
      
      if (!outerRing || outerRing.length === 0) continue
      
      if (isPointInPolygon(point, outerRing)) {
        // Check if point is in any hole
        let inHole = false
        for (let i = 1; i < polygon.length; i++) {
          const hole = polygon[i] as number[][]
          if (isPointInPolygon(point, hole)) {
            inHole = true
            break
          }
        }
        if (!inHole) {
          return true
        }
      }
    }
    return false
  }

  return false
}

