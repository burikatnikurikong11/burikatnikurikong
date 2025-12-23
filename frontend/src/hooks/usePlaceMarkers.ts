import { useEffect, useState, useRef } from 'react'
import type maplibregl from 'maplibre-gl'
import type { Place, PlaceCollection } from '../types/place'
import { MUNICIPALITY_FILES } from '../config/municipalities'

const PLACE_SOURCE_ID = 'place-markers-source'
const PLACE_LAYER_ID = 'place-markers-layer'
const PLACE_LAYER_HALO_ID = 'place-markers-halo-layer'

export function usePlaceMarkers(
  map: maplibregl.Map | null,
  selectedMunicipalityGeocode: string | null,
  onPlaceClick?: (place: Place) => void,
  onPlaceHover?: (place: Place | null) => void,
  filteredPlaces?: Place[] // Optional: if provided, use these instead of loading from files
) {
  const [places, setPlaces] = useState<Place[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const hoveredStateIdRef = useRef<string | null>(null)
  const placesRef = useRef<Place[]>([])

  // Keep placesRef in sync with places
  useEffect(() => {
    placesRef.current = places
  }, [places])

  // If filteredPlaces are provided, use them directly instead of loading from files
  useEffect(() => {
    if (filteredPlaces !== undefined) {
      console.log(`Using ${filteredPlaces.length} pre-filtered places`)
      setPlaces(filteredPlaces)
      return
    }

    // Otherwise, load from municipality files (original behavior)
    if (!selectedMunicipalityGeocode) {
      setPlaces([])
      return
    }

    const fileName = MUNICIPALITY_FILES[selectedMunicipalityGeocode]
    if (!fileName) {
      console.warn('No file found for geocode:', selectedMunicipalityGeocode)
      setPlaces([])
      return
    }

    console.log('Loading places from:', fileName)
    setIsLoading(true)
    fetch(`/municipalities/${fileName}`)
      .then(response => response.json())
      .then((data: PlaceCollection) => {
        const loadedPlaces: Place[] = data.features.map((feature, index) => ({
          id: `${feature.properties.municipality}-${index}`,
          name: feature.properties.name,
          type: feature.properties.type,
          description: feature.properties.description,
          municipality: feature.properties.municipality,
          coordinates: feature.geometry.coordinates,
          size: feature.properties.size,
          showAtZoom: feature.properties.showAtZoom,
          image: feature.properties.image,
        }))
        console.log(`Loaded ${loadedPlaces.length} places:`, loadedPlaces.map(p => p.name))
        setPlaces(loadedPlaces)
        setIsLoading(false)
      })
      .catch((error) => {
        console.error(`Failed to load places for municipality ${selectedMunicipalityGeocode}:`, error)
        setPlaces([])
        setIsLoading(false)
      })
  }, [selectedMunicipalityGeocode, filteredPlaces])

  useEffect(() => {
    if (!map) return

    const cleanupLayers = () => {
      try {
        if (map.getLayer(PLACE_LAYER_HALO_ID)) {
          map.removeLayer(PLACE_LAYER_HALO_ID)
        }
      } catch (e) {}

      try {
        if (map.getLayer(PLACE_LAYER_ID)) {
          map.removeLayer(PLACE_LAYER_ID)
        }
      } catch (e) {}

      try {
        if (map.getSource(PLACE_SOURCE_ID)) {
          map.removeSource(PLACE_SOURCE_ID)
        }
      } catch (e) {}
    }

    const handleMouseMove = (e: any) => {
      if (e.features && e.features.length > 0) {
        if (hoveredStateIdRef.current !== null) {
          try {
            map.setFeatureState(
              { source: PLACE_SOURCE_ID, id: hoveredStateIdRef.current },
              { hover: 0 }
            )
          } catch (e) {}
        }
        hoveredStateIdRef.current = e.features[0].properties.id
        try {
          map.setFeatureState(
            { source: PLACE_SOURCE_ID, id: hoveredStateIdRef.current },
            { hover: 1 }
          )
        } catch (e) {}
        map.getCanvas().style.cursor = 'pointer'

        if (onPlaceHover) {
          const feature = e.features[0]
          // Use placesRef.current to get the latest places array
          const coords = placesRef.current.find(p => p.id === feature.properties.id)?.coordinates || [0, 0]
          const place: Place = {
            id: feature.properties.id,
            name: feature.properties.name,
            type: feature.properties.type,
            description: feature.properties.description,
            municipality: feature.properties.municipality,
            coordinates: coords,
            size: 0.15,
            showAtZoom: 10,
            image: feature.properties.image || undefined,
          }
          onPlaceHover(place)
        }
      }
    }

    const handleMouseLeave = () => {
      if (hoveredStateIdRef.current !== null) {
        try {
          map.setFeatureState(
            { source: PLACE_SOURCE_ID, id: hoveredStateIdRef.current },
            { hover: 0 }
          )
        } catch (e) {}
      }
      hoveredStateIdRef.current = null
      map.getCanvas().style.cursor = ''

      if (onPlaceHover) {
        onPlaceHover(null)
      }
    }

    const handleClick = (e: any) => {
      if (e.features && e.features.length > 0 && onPlaceClick) {
        const feature = e.features[0]
        const place: Place = {
          id: feature.properties.id,
          name: feature.properties.name,
          type: feature.properties.type,
          description: feature.properties.description,
          municipality: feature.properties.municipality,
          coordinates: feature.geometry.coordinates,
          size: 0.15,
          showAtZoom: 10,
          image: feature.properties.image || undefined,
        }
        onPlaceClick(place)
      }
    }

    const setupLayers = () => {
      if (!map.isStyleLoaded()) return

      const sourceExists = map.getSource(PLACE_SOURCE_ID)
      const layerExists = map.getLayer(PLACE_LAYER_ID)

      if (places.length === 0) {
        console.log('No places to display, cleaning up layers')
        if (sourceExists || layerExists) {
          cleanupLayers()
        }
        return
      }

      // Update existing source if it exists, otherwise create new layers
      if (sourceExists) {
        console.log(`Updating place markers with ${places.length} places`)
        const geojson: GeoJSON.FeatureCollection<GeoJSON.Point> = {
          type: 'FeatureCollection',
          features: places.map((place) => ({
            type: 'Feature',
            id: place.id,
            geometry: {
              type: 'Point',
              coordinates: place.coordinates,
            },
            properties: {
              id: place.id,
              name: place.name,
              type: place.type,
              description: place.description,
              municipality: place.municipality,
              image: place.image || '',
            },
          })),
        }

        const source = map.getSource(PLACE_SOURCE_ID) as maplibregl.GeoJSONSource
        if (source) {
          source.setData(geojson)
        }
        return
      }

      console.log(`Setting up place markers layer with ${places.length} places`)

      const geojson: GeoJSON.FeatureCollection<GeoJSON.Point> = {
        type: 'FeatureCollection',
        features: places.map((place) => ({
          type: 'Feature',
          id: place.id,
          geometry: {
            type: 'Point',
            coordinates: place.coordinates,
          },
          properties: {
            id: place.id,
            name: place.name,
            type: place.type,
            description: place.description,
            municipality: place.municipality,
            image: place.image || '',
          },
        })),
      }

      try {
        map.addSource(PLACE_SOURCE_ID, {
          type: 'geojson',
          data: geojson,
          promoteId: 'id',
        })

        // CRITICAL FIX: Add POI marker layers WITHOUT specifying beforeId
        // This ensures they are added on TOP of all existing layers (including GeoJSON)
        // Making them the highest priority for click/hover events
        map.addLayer({
          id: PLACE_LAYER_HALO_ID,
          type: 'circle',
          source: PLACE_SOURCE_ID,
          maxzoom: 24,
          paint: {
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['number', ['feature-state', 'hover'], 0],
              0, 12,
              1, 16
            ],
            'circle-color': 'rgba(59, 130, 246, 0.3)',
            'circle-blur': 0.5,
            'circle-pitch-alignment': 'viewport',
            'circle-pitch-scale': 'viewport',
            'circle-radius-transition': {
              duration: 200,
              delay: 0,
            },
          },
        }) // No beforeId parameter - adds to top!

        map.addLayer({
          id: PLACE_LAYER_ID,
          type: 'circle',
          source: PLACE_SOURCE_ID,
          maxzoom: 24,
          paint: {
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['number', ['feature-state', 'hover'], 0],
              0, 8,
              1, 12
            ],
            'circle-color': '#3b82f6',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
            'circle-pitch-alignment': 'viewport',
            'circle-pitch-scale': 'viewport',
            'circle-radius-transition': {
              duration: 200,
              delay: 0,
            },
          },
        }) // No beforeId parameter - adds to top!

        console.log('Place markers layers added successfully ON TOP of all layers')

        map.on('mousemove', PLACE_LAYER_ID, handleMouseMove)
        map.on('mouseleave', PLACE_LAYER_ID, handleMouseLeave)
        map.on('click', PLACE_LAYER_ID, handleClick)
      } catch (e) {
        console.error('Error setting up place markers:', e)
      }
    }

    map.on('styledata', setupLayers)

    if (map.isStyleLoaded()) {
      setupLayers()
    }

    return () => {
      map.off('styledata', setupLayers)
      try {
        map.off('mousemove', PLACE_LAYER_ID, handleMouseMove)
        map.off('mouseleave', PLACE_LAYER_ID, handleMouseLeave)
        map.off('click', PLACE_LAYER_ID, handleClick)
      } catch (e) {}
      cleanupLayers()
    }
  }, [map, places, onPlaceClick, onPlaceHover])

  return { places, isLoading }
}
