import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import { createRoot, Root } from 'react-dom/client'
import { Place, PlaceCategory } from '../types/place'
import { AnimatedMarker } from '../components/AnimatedMarker'
import { ClusterMarker } from '../components/ClusterMarker'

interface UseEnhancedMarkersOptions {
  map: maplibregl.Map | null
  places: Place[]
  onMarkerClick?: (place: Place) => void
  enableClustering?: boolean
}

export const useEnhancedMarkers = ({
  map,
  places,
  onMarkerClick,
  enableClustering = true
}: UseEnhancedMarkersOptions) => {
  const markersRef = useRef<maplibregl.Marker[]>([])
  const cleanupRef = useRef<(() => void) | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!map || places.length === 0) {
      setIsLoaded(false)
      return
    }

    // Wait for map to be fully loaded
    if (!map.isStyleLoaded()) {
      const onLoad = () => {
        map.off('load', onLoad)
      }
      map.on('load', onLoad)
      return
    }

    // Clear existing markers and cleanup
    markersRef.current.forEach(marker => {
      try {
        marker.remove()
      } catch (e) {
        console.warn('Error removing marker:', e)
      }
    })
    markersRef.current = []
    
    if (cleanupRef.current) {
      try {
        cleanupRef.current()
      } catch (e) {
        console.warn('Error in cleanup:', e)
      }
      cleanupRef.current = null
    }

    try {
      if (enableClustering) {
        // Add or update source for clustering
        const sourceId = 'enhanced-places'
        
        const geoJsonData: GeoJSON.FeatureCollection = {
          type: 'FeatureCollection',
          features: places.map(place => ({
            type: 'Feature',
            properties: {
              id: place.id,
              name: place.name,
              category: place.category,
              thumbnail: place.thumbnail
            },
            geometry: {
              type: 'Point',
              coordinates: place.coordinates
            }
          }))
        }

        if (!map.getSource(sourceId)) {
          map.addSource(sourceId, {
            type: 'geojson',
            data: geoJsonData,
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 50
          })
        } else {
          const source = map.getSource(sourceId) as maplibregl.GeoJSONSource
          source.setData(geoJsonData)
        }

        // Render markers with clustering
        cleanupRef.current = renderClusteredMarkers(map, sourceId, places, onMarkerClick)
      } else {
        // Render individual markers without clustering
        markersRef.current = renderIndividualMarkers(map, places, onMarkerClick)
      }

      setIsLoaded(true)
    } catch (error) {
      console.error('Error in useEnhancedMarkers:', error)
      setIsLoaded(false)
    }

    return () => {
      markersRef.current.forEach(marker => {
        try {
          marker.remove()
        } catch (e) {
          // Ignore errors during cleanup
        }
      })
      markersRef.current = []
      
      if (cleanupRef.current) {
        try {
          cleanupRef.current()
        } catch (e) {
          // Ignore errors during cleanup
        }
        cleanupRef.current = null
      }
    }
  }, [map, places, enableClustering, onMarkerClick])

  return { isLoaded }
}

function renderIndividualMarkers(
  map: maplibregl.Map,
  places: Place[],
  onMarkerClick?: (place: Place) => void
): maplibregl.Marker[] {
  const markers: maplibregl.Marker[] = []

  places.forEach(place => {
    try {
      const el = document.createElement('div')
      el.style.width = '60px'
      el.style.height = '60px'
      
      const root = createRoot(el)
      
      root.render(
        <AnimatedMarker
          category={place.category}
          name={place.name}
          thumbnail={place.thumbnail}
          onClick={() => onMarkerClick?.(place)}
        />
      )

      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat(place.coordinates)
        .addTo(map)

      markers.push(marker)
    } catch (error) {
      console.error('Error creating marker for place:', place.name, error)
    }
  })

  return markers
}

function renderClusteredMarkers(
  map: maplibregl.Map,
  sourceId: string,
  places: Place[],
  onMarkerClick?: (place: Place) => void
): () => void {
  const markers: Record<string, maplibregl.Marker> = {}
  const markersOnScreen: Record<string, maplibregl.Marker> = {}
  const roots: Record<string, Root> = {}

  function updateMarkers() {
    try {
      const newMarkers: Record<string, maplibregl.Marker> = {}
      const features = map.querySourceFeatures(sourceId)

      features.forEach(feature => {
        const geometry = feature.geometry as GeoJSON.Point
        const props = feature.properties

        if (!geometry?.coordinates || !props) return

        const coords = geometry.coordinates as [number, number]
        const id = props.cluster 
          ? `cluster-${props.cluster_id}`
          : `point-${props.id}`

        let marker = markers[id]
        
        if (!marker) {
          const el = document.createElement('div')
          el.style.width = '100px'
          el.style.height = '100px'
          
          const root = createRoot(el)
          roots[id] = root

          if (props.cluster) {
            root.render(
              <ClusterMarker
                pointCount={props.point_count || 0}
                dominantCategory={'general'}
                onClick={() => {
                  map.easeTo({
                    center: coords,
                    zoom: map.getZoom() + 2,
                    duration: 500
                  })
                }}
              />
            )
          } else {
            const place = places.find(p => p.id === props.id)
            if (place) {
              root.render(
                <AnimatedMarker
                  category={place.category}
                  name={place.name}
                  thumbnail={place.thumbnail}
                  onClick={() => onMarkerClick?.(place)}
                />
              )
            }
          }

          marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
            .setLngLat(coords)
          
          markers[id] = marker
        }

        newMarkers[id] = marker

        if (!markersOnScreen[id]) {
          marker.addTo(map)
        }
      })

      // Remove markers that are no longer visible
      for (const id in markersOnScreen) {
        if (!newMarkers[id]) {
          markersOnScreen[id].remove()
          if (roots[id]) {
            roots[id].unmount()
            delete roots[id]
          }
          delete markers[id]
          delete markersOnScreen[id]
        }
      }

      Object.assign(markersOnScreen, newMarkers)
    } catch (error) {
      console.error('Error updating markers:', error)
    }
  }

  map.on('render', updateMarkers)
  updateMarkers()
  
  return () => {
    try {
      map.off('render', updateMarkers)
      Object.values(markersOnScreen).forEach(marker => marker.remove())
      Object.values(roots).forEach(root => root.unmount())
    } catch (e) {
      console.warn('Error in cleanup:', e)
    }
  }
}
