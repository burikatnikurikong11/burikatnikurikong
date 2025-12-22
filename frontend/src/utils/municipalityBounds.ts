/**
 * Calculate bounding box for a GeoJSON feature (Polygon or MultiPolygon)
 * Returns [minLng, minLat, maxLng, maxLat]
 */
export function calculateFeatureBounds(feature: GeoJSON.Feature): [number, number, number, number] | null {
  if (!feature.geometry) return null

  let minLng = Infinity
  let minLat = Infinity
  let maxLng = -Infinity
  let maxLat = -Infinity

  const processCoordinates = (coords: any) => {
    if (typeof coords[0] === 'number') {
      // This is a coordinate pair [lng, lat]
      const [lng, lat] = coords
      minLng = Math.min(minLng, lng)
      maxLng = Math.max(maxLng, lng)
      minLat = Math.min(minLat, lat)
      maxLat = Math.max(maxLat, lat)
    } else {
      // This is an array of coordinates, recurse
      coords.forEach(processCoordinates)
    }
  }

  processCoordinates(feature.geometry.coordinates)

  if (minLng === Infinity || minLat === Infinity || maxLng === -Infinity || maxLat === -Infinity) {
    return null
  }

  return [minLng, minLat, maxLng, maxLat]
}

/**
 * Calculate center point and optimal zoom level for a bounding box
 */
export function calculateCameraOptions(
  bounds: [number, number, number, number],
  mapWidth: number,
  mapHeight: number,
  padding: { top: number; bottom: number; left: number; right: number } = { top: 50, bottom: 50, left: 50, right: 50 }
): { center: [number, number]; zoom: number } {
  const [minLng, minLat, maxLng, maxLat] = bounds

  // Calculate center
  const centerLng = (minLng + maxLng) / 2
  const centerLat = (minLat + maxLat) / 2

  // Calculate bounds width and height
  const lngDiff = maxLng - minLng
  const latDiff = maxLat - minLat

  // Account for padding
  const effectiveWidth = mapWidth - padding.left - padding.right
  const effectiveHeight = mapHeight - padding.top - padding.bottom

  // Calculate zoom to fit bounds
  // MapLibre zoom levels: each zoom level doubles the scale
  // At zoom 0, the world is 256 pixels wide
  const WORLD_DIM = { height: 256, width: 256 }
  const ZOOM_MAX = 21

  function latRad(lat: number) {
    const sin = Math.sin((lat * Math.PI) / 180)
    const radX2 = Math.log((1 + sin) / (1 - sin)) / 2
    return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2
  }

  function zoom(mapPx: number, worldPx: number, fraction: number) {
    return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2)
  }

  const latFraction = (latRad(maxLat) - latRad(minLat)) / Math.PI
  const lngFraction = lngDiff / 360

  const latZoom = zoom(effectiveHeight, WORLD_DIM.height, latFraction)
  const lngZoom = zoom(effectiveWidth, WORLD_DIM.width, lngFraction)

  const calculatedZoom = Math.min(latZoom, lngZoom, ZOOM_MAX)

  // Add a bit of buffer (reduce zoom by 0.5 to show more context)
  const finalZoom = Math.max(10, calculatedZoom - 0.5)

  return {
    center: [centerLng, centerLat],
    zoom: finalZoom
  }
}
