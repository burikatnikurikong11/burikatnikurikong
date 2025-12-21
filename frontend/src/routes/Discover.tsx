import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useMap3DModels } from '../hooks/useMap3DModels'
import { useMap3DMarkers, offsetCoordinates } from '../hooks/useMap3DMarkers'
import { usePlaceMarkers } from '../hooks/usePlaceMarkers'
import { touristSpotModels } from '../config/touristSpots'
import { MUNICIPALITY_GEOCODES, MUNICIPALITY_NAMES } from '../config/municipalities'
import { isViewportInCatanduanes } from '../utils/catanduanesBounds'
import { getMapTilerKey } from '../utils/env'
import { useStore } from '../state/store'
import TouristSpotInfo from '../components/TouristSpotInfo'
import PlaceInfo from '../components/PlaceInfo'
import MunicipalityTooltip from '../components/MunicipalityTooltip'
import ItineraryButton from '../components/ItineraryButton'
import ResetCameraButton from '../components/ResetCameraButton'
import { MAP_CONFIG, MODEL_CONFIG, ANIMATION_CONFIG, UI_CONFIG } from '../constants/map'
import { calculateDistanceDegrees, isPointInGeoJSONFeature } from '../utils/coordinates'
import toast from 'react-hot-toast'
import { matchPlaceToModel } from '../utils/matchPlaceToModel'
import type { PlaceInfo as PlaceInfoType } from '../types/api'
import type { Place } from '../types/place'

interface DiscoverProps {
  isSidebarOpen?: boolean
  onPlaceSelectFromAI?: (handler: (place: PlaceInfoType) => void) => void
}

export default function Discover({ isSidebarOpen = false, onPlaceSelectFromAI }: DiscoverProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const [map, setMap] = useState<maplibregl.Map | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMunicipalityGeocode, setSelectedMunicipalityGeocode] = useState<string | null>(null)
  const [municipalityGeoJson, setMunicipalityGeoJson] = useState<GeoJSON.FeatureCollection | null>(null)
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [hoveredPlace, setHoveredPlace] = useState<Place | null>(null)
  const [selectedPlaceMunicipalityGeocode, setSelectedPlaceMunicipalityGeocode] = useState<string | null>(null)
  const selectedMunicipalityRef = useRef<string | null>(null)
  
  // Municipality tooltip state
  const [hoveredMunicipalityName, setHoveredMunicipalityName] = useState<string | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isTooltipVisible, setIsTooltipVisible] = useState(true) // Add visibility state
  
  // Detect mobile screen size
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768 // md breakpoint
    }
    return false
  })

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  // Store event handlers for cleanup
  const eventHandlersRef = useRef<{
    handleMouseMove?: (e: maplibregl.MapMouseEvent) => void
    handleMouseLeave?: () => void
    handleMunicipalityClick?: (e: maplibregl.MapMouseEvent) => void
  }>({})
  
  // Store state
  const {
    selectedTouristSpot,
    setSelectedTouristSpot,
    setMapViewport,
    setLoadingState,
    setError: setStoreError,
    terrainEnabled,
    modelsEnabled
  } = useStore()
  
  // Get selected spot data
  const selectedSpot = useMemo(() => {
    return touristSpotModels.find(m => m.id === selectedTouristSpot) || null
  }, [selectedTouristSpot])
  
  // Handle closing tourist spot info
  const handleCloseSpotInfo = useCallback(() => {
    setSelectedTouristSpot(null)
    // Re-enable tooltip when closing info panel
    setIsTooltipVisible(true)
  }, [setSelectedTouristSpot])

  // Handle reset camera to initial view
  const handleResetCamera = useCallback(() => {
    if (!map) return

    // Clear all selections
    setSelectedMunicipalityGeocode(null)
    setSelectedPlace(null)
    setSelectedPlaceMunicipalityGeocode(null)
    selectedMunicipalityRef.current = null
    // Re-enable tooltip when resetting
    setIsTooltipVisible(true)

    map.flyTo({
      center: MAP_CONFIG.DEFAULT_CENTER,
      zoom: MAP_CONFIG.DEFAULT_ZOOM,
      pitch: MAP_CONFIG.DEFAULT_PITCH,
      bearing: MAP_CONFIG.DEFAULT_BEARING,
      duration: ANIMATION_CONFIG.FLY_TO_DURATION,
      essential: true
    })
  }, [map])

  // Handle itinerary button click
  const handleItineraryClick = useCallback(() => {
    toast.success('Itinerary planner coming soon!')
    // TODO: Open itinerary modal/sidebar
  }, [])

  // Handle place selection and zoom
  const handlePlaceClick = useCallback((place: Place) => {
    if (!map) return

    setSelectedPlace(place)
    // Hide tooltip when a place is selected
    setIsTooltipVisible(false)

    // Find and store the geocode for this place's municipality
    const municipalityName = place.municipality.toUpperCase().replace(/\s+/g, '_')
    const geocodeKey = Object.keys(MUNICIPALITY_GEOCODES).find(
      key => key === municipalityName
    ) as keyof typeof MUNICIPALITY_GEOCODES | undefined

    if (geocodeKey) {
      setSelectedPlaceMunicipalityGeocode(MUNICIPALITY_GEOCODES[geocodeKey])
    }

    // Zoom in, center on marker with 45-degree angle
    map.flyTo({
      center: place.coordinates,
      zoom: 17,
      pitch: 45,
      bearing: 0,
      duration: ANIMATION_CONFIG.FLY_TO_DURATION,
      essential: true,
    })
  }, [map])

  // Handle place hover
  const handlePlaceHover = useCallback((place: Place | null) => {
    setHoveredPlace(place)
    // Hide tooltip when hovering over a place marker
    if (place) {
      setIsTooltipVisible(false)
    } else {
      // Only show tooltip again if no selections are active
      if (!selectedPlace && !selectedTouristSpot && !selectedMunicipalityGeocode) {
        setIsTooltipVisible(true)
      }
    }
  }, [selectedPlace, selectedTouristSpot, selectedMunicipalityGeocode])

  // Handle closing place info
  const handleClosePlaceInfo = useCallback(() => {
    setSelectedPlace(null)
    setHoveredPlace(null)
    // Re-enable tooltip when closing place info
    setIsTooltipVisible(true)
  }, [])

  // Handle place selection from AI chatbot
  const handlePlaceFromAI = useCallback((place: PlaceInfoType) => {
    // Match place to model
    const modelId = matchPlaceToModel(place)
    
    if (!modelId) {
      // Place doesn't match any model, just log it
      console.log('Place from AI does not match any 3D model:', place)
      return
    }
    
    // Find the model
    const model = touristSpotModels.find(m => m.id === modelId)
    if (!model || !map) {
      return
    }
    
    // Select the model (this will show the info card)
    setSelectedTouristSpot(modelId)
    // Hide tooltip when a tourist spot is selected
    setIsTooltipVisible(false)
    
    // Calculate marker coordinates with the same offset as markers use
    // This matches the marker click animation behavior exactly
    const geoOffset: [number, number] = [45, 25] // metersNorth, metersEast - same as useMap3DMarkers
    const [metersNorth, metersEast] = geoOffset
    const markerCoordinates = offsetCoordinates(
      model.coordinates[0],
      model.coordinates[1],
      metersNorth,
      metersEast
    )
    
    // Fly to marker with 45-degree angle, centered on the marker
    // Adjust zoom based on model scale and altitude for optimal visibility
    const modelScale = model.scale ?? MODEL_CONFIG.DEFAULT_SCALE
    const modelAltitude = model.altitude ?? MODEL_CONFIG.DEFAULT_ALTITUDE
    const scaleAdjustment = modelScale > 2 ? 1.0 : 0.5
    const altitudeAdjustment = modelAltitude > 20 ? 0.3 : 0
    const targetZoom = Math.max(19, ANIMATION_CONFIG.DEFAULT_ZOOM_ON_SELECT - scaleAdjustment - altitudeAdjustment)

    // Center on the marker coordinates with fixed 45-degree pitch
    map.flyTo({
      center: markerCoordinates,
      zoom: targetZoom,
      pitch: 45,
      bearing: MAP_CONFIG.DEFAULT_BEARING,
      duration: ANIMATION_CONFIG.FLY_TO_DURATION,
      essential: true
    })
  }, [map, setSelectedTouristSpot])
  
  // Expose the handler to parent component
  useEffect(() => {
    if (onPlaceSelectFromAI) {
      onPlaceSelectFromAI(handlePlaceFromAI)
    }
  }, [onPlaceSelectFromAI, handlePlaceFromAI])
  
  // Hide tooltip when a tourist spot is selected
  useEffect(() => {
    if (selectedTouristSpot) {
      setIsTooltipVisible(false)
    } else {
      // Only show tooltip if no other selections are active
      if (!selectedPlace && !selectedMunicipalityGeocode) {
        setIsTooltipVisible(true)
      }
    }
  }, [selectedTouristSpot, selectedPlace, selectedMunicipalityGeocode])

  // Initialize the map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return

    let mapInstance: maplibregl.Map | null = null
    let loadingTimeout: ReturnType<typeof setTimeout> | null = null

    try {
      // Get MapTiler API key from environment variables
      const apiKey = getMapTilerKey()

      mapInstance = new maplibregl.Map({
        container: mapContainer.current,
        style: `https://api.maptiler.com/maps/satellite/style.json?key=${apiKey}`,
        zoom: MAP_CONFIG.DEFAULT_ZOOM,
        center: MAP_CONFIG.DEFAULT_CENTER,
        pitch: MAP_CONFIG.DEFAULT_PITCH,
        bearing: MAP_CONFIG.DEFAULT_BEARING,
        minZoom: MAP_CONFIG.MIN_ZOOM,
        maxZoom: MAP_CONFIG.MAX_ZOOM,
        canvasContextAttributes: { antialias: true }
      })

      // Handle map errors
      mapInstance.on('error', (e) => {
        const errorMessage = `Map error: ${e.error?.message || 'Unknown error'}`
        // Use proper error handling instead of console.error
        setError(errorMessage)
        setStoreError('map', errorMessage)
        setLoadingState('map', false)
        toast.error('Failed to load map')
        setIsLoading(false)
        if (loadingTimeout) {
          clearTimeout(loadingTimeout)
          loadingTimeout = null
        }
      })

      // Handle successful load - ensure loading state is cleared
      mapInstance.once('load', () => {
        setIsLoading(false)
        setError(null)
        setLoadingState('map', false)
        if (loadingTimeout) {
          clearTimeout(loadingTimeout)
          loadingTimeout = null
        }
      })
      
      // Update viewport state on map movement
      const updateViewport = () => {
        if (!mapInstance) return
        setMapViewport({
          center: mapInstance.getCenter().toArray() as [number, number],
          zoom: mapInstance.getZoom(),
          pitch: mapInstance.getPitch(),
          bearing: mapInstance.getBearing()
        })
      }
      
      if (mapInstance) {
        mapInstance.on('moveend', updateViewport)
        mapInstance.on('zoomend', updateViewport)
        
        // Handle map clicks for model interaction
        mapInstance.on('click', (e) => {
          // Don't handle clicks on controls or UI elements
          const target = e.originalEvent?.target as HTMLElement
          if (target?.closest('.maplibregl-ctrl') || 
              target?.closest('.maplibregl-control-container') ||
              target?.closest('[style*="z-index: 1000"]') ||
              target?.closest('[class*="z-[1000]"]')) {
            return
          }
          
          // Check if click is near any model coordinates
          const clickedLng = e.lngLat.lng
          const clickedLat = e.lngLat.lat
          
          // Find nearest model within reasonable distance (rough check)
          for (const model of touristSpotModels) {
            const distance = calculateDistanceDegrees(
              [clickedLng, clickedLat],
              model.coordinates
            )
            // If click is within threshold distance, consider it a hit
            if (distance < MAP_CONFIG.MODEL_CLICK_THRESHOLD && mapInstance) {
              setSelectedTouristSpot(model.id)
              // Hide tooltip when a model is clicked
              setIsTooltipVisible(false)
              // Fly to marker with 45-degree angle, centered on the model
              // Adjust zoom based on model scale and altitude for optimal visibility
              const modelScale = model.scale ?? MODEL_CONFIG.DEFAULT_SCALE
              const modelAltitude = model.altitude ?? MODEL_CONFIG.DEFAULT_ALTITUDE
              const scaleAdjustment = modelScale > 2 ? 1.0 : 0.5
              const altitudeAdjustment = modelAltitude > 20 ? 0.3 : 0
              const targetZoom = Math.max(19, ANIMATION_CONFIG.DEFAULT_ZOOM_ON_SELECT - scaleAdjustment - altitudeAdjustment)

              // Center on model coordinates with fixed 45-degree pitch
              mapInstance.flyTo({
                center: model.coordinates,
                zoom: targetZoom,
                pitch: 45,
                bearing: MAP_CONFIG.DEFAULT_BEARING,
                duration: ANIMATION_CONFIG.FLY_TO_DURATION,
                essential: true
              })
              break
            }
          }
        })
      }

      // Fallback: clear loading state after a timeout if load event doesn't fire
      loadingTimeout = setTimeout(() => {
        // Silently clear loading state if timeout occurs
        setIsLoading(false)
        loadingTimeout = null
      }, UI_CONFIG.LOADING_TIMEOUT)

      // Add terrain sources and configuration after style loads
      mapInstance.once('style.load', () => {
        if (!mapInstance) return
        
        // Add terrain source using MapTiler's terrain tiles
        if (!mapInstance.getSource('terrainSource')) {
          mapInstance.addSource('terrainSource', {
            type: 'raster-dem',
            url: `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${apiKey}`,
            tileSize: 256,
            maxzoom: 14
          })
        }

        // Load province GeoJSON and add white border outlines
        fetch('/CATANDUANES.geojson')
          .then(response => response.json())
          .then((provinceGeoJson) => {
            if (!mapInstance) return

            // Merge Caramoran and Palumbanes Island into a single feature
            // Find all Caramoran features (GEOCODE: "052004000")
            const caramoranFeatures: any[] = []
            const otherFeatures: any[] = []            
            provinceGeoJson.features.forEach((feature: any) => {
              if (feature.properties && feature.properties.GEOCODE === '052004000') {
                caramoranFeatures.push(feature)
              } else {
                otherFeatures.push(feature)
              }
            })

            // Combine all Caramoran polygons into a MultiPolygon
            let mergedCaramoran: any = null
            if (caramoranFeatures.length > 0) {
              const polygons: number[][][] = []
              caramoranFeatures.forEach((feature: any) => {
                if (feature.geometry.type === 'Polygon') {
                  polygons.push(feature.geometry.coordinates[0])
                } else if (feature.geometry.type === 'MultiPolygon') {
                  feature.geometry.coordinates.forEach((polygon: number[][][]) => {
                    polygons.push(polygon[0])
                  })
                }
              })

              // Create merged feature with first feature's properties
              mergedCaramoran = {
                type: 'Feature',
                properties: caramoranFeatures[0].properties,
                geometry: {
                  type: 'MultiPolygon',
                  coordinates: polygons.map(poly => [poly])
                }
              }
            }

            // Create new feature collection with merged Caramoran
            const processedGeoJson: GeoJSON.FeatureCollection = {
              type: 'FeatureCollection',
              features: mergedCaramoran 
                ? [mergedCaramoran, ...otherFeatures]
                : otherFeatures
            }

            // Add the province boundaries source
            if (!mapInstance.getSource('provinceBoundaries')) {
              mapInstance.addSource('provinceBoundaries', {
                type: 'geojson',
                data: processedGeoJson
              })
            } else {
              // Update existing source
              const source = mapInstance.getSource('provinceBoundaries')
              if (source && source.type === 'geojson') {
                (source as maplibregl.GeoJSONSource).setData(processedGeoJson)
              }
            }

            // Get layer insertion point
            const layers = mapInstance.getStyle().layers
            const firstSymbolLayerId = layers?.find(layer => layer.type === 'symbol')?.id

            // Add invisible fill layer for hover detection
            if (!mapInstance.getLayer('provinceHoverLayer')) {
              mapInstance.addLayer({
                id: 'provinceHoverLayer',
                type: 'fill',
                source: 'provinceBoundaries',
                paint: {
                  'fill-color': 'transparent',
                  'fill-opacity': 0
                }
              }, firstSymbolLayerId)
            }

            // Add the province borders layer (white outlines) - invisible by default
            if (!mapInstance.getLayer('provinceBordersLayer')) {
              mapInstance.addLayer({
                id: 'provinceBordersLayer',
                type: 'line',
                source: 'provinceBoundaries',
                paint: {
                  'line-color': '#ffffff',
                  'line-width': 2,
                  'line-opacity': 0 // Invisible by default, will be shown on hover
                },
                filter: ['==', 'GEOCODE', ''] // Filter to show nothing by default
              }, firstSymbolLayerId) // Insert before first symbol layer if it exists
            }

            // Track currently hovered municipality (using GEOCODE for consistency)
            let hoveredMunicipalityGeocode: string | null = null

            // Helper function to hide borders
            const hideBorders = () => {
              if (!mapInstance) return
              hoveredMunicipalityGeocode = null
              mapInstance.setFilter('provinceBordersLayer', ['==', 'GEOCODE', ''])
              mapInstance.setPaintProperty('provinceBordersLayer', 'line-opacity', 0)
              mapInstance.getCanvas().style.cursor = ''
              // Hide tooltip
              setHoveredMunicipalityName(null)
            }

            // Helper function to show borders for a municipality
            const showBorders = (geocode: string, feature: any) => {
              if (!mapInstance) return
              hoveredMunicipalityGeocode = geocode

              // Update filter to show only the hovered or selected municipality
              if (feature.properties.GEOCODE) {
                mapInstance.setFilter('provinceBordersLayer', ['==', 'GEOCODE', geocode])
              } else {
                mapInstance.setFilter('provinceBordersLayer', ['==', 'OBJECTID', feature.properties.OBJECTID])
              }
              mapInstance.setPaintProperty('provinceBordersLayer', 'line-opacity', 1)
              mapInstance.getCanvas().style.cursor = 'pointer'
              
              // Show tooltip with municipality name (only if tooltip is visible)
              if (isTooltipVisible) {
                const municipalityName = MUNICIPALITY_NAMES[geocode]
                if (municipalityName) {
                  setHoveredMunicipalityName(municipalityName)
                }
              }
            }

            // Helper function to update borders based on current state
            const updateBordersForSelection = () => {
              if (!mapInstance) return
              const currentSelected = selectedMunicipalityRef.current
              if (currentSelected) {
                // Keep selected municipality border visible
                mapInstance.setFilter('provinceBordersLayer', ['==', 'GEOCODE', currentSelected])
                mapInstance.setPaintProperty('provinceBordersLayer', 'line-opacity', 1)
              }
            }

            // Handle mouse move to detect municipality hover
            // Use global mousemove to ensure consistent behavior
            const handleMouseMove = (e: maplibregl.MapMouseEvent) => {
              if (!mapInstance) return

              // Update mouse position for tooltip
              setMousePosition({ x: e.point.x, y: e.point.y })

              // Check if we're over a municipality
              const features = mapInstance.queryRenderedFeatures(e.point, {
                layers: ['provinceHoverLayer']
              })

              const hoveredFeature = features[0]

              if (hoveredFeature && hoveredFeature.properties) {
                // Use GEOCODE for filtering (more reliable for merged features)
                const municipalityGeocode = hoveredFeature.properties.GEOCODE || hoveredFeature.properties.OBJECTID?.toString()

                // Only update if hovering a different municipality
                if (hoveredMunicipalityGeocode !== municipalityGeocode) {
                  showBorders(municipalityGeocode, hoveredFeature)
                }
              } else {
                // No municipality under cursor
                if (hoveredMunicipalityGeocode !== null) {
                  // If a municipality is selected, keep its border visible
                  if (selectedMunicipalityRef.current) {
                    updateBordersForSelection()
                    hoveredMunicipalityGeocode = null
                    mapInstance.getCanvas().style.cursor = ''
                    setHoveredMunicipalityName(null)
                  } else {
                    hideBorders()
                  }
                }
              }
            }

            // Handle mouse leave from the map to hide borders
            const handleMouseLeave = () => {
              // If a municipality is selected, keep its border visible
              if (selectedMunicipalityRef.current) {
                updateBordersForSelection()
                hoveredMunicipalityGeocode = null
                setHoveredMunicipalityName(null)
              } else {
                hideBorders()
              }
            }

            // Store GeoJSON for point-in-polygon checks
            setMunicipalityGeoJson(processedGeoJson)

            // Handle click on municipality boundary
            const handleMunicipalityClick = (e: maplibregl.MapMouseEvent) => {
              if (!mapInstance) return

              const features = mapInstance.queryRenderedFeatures(e.point, {
                layers: ['provinceHoverLayer']
              })

              const clickedFeature = features[0]

              if (clickedFeature && clickedFeature.properties) {
                const municipalityGeocode = clickedFeature.properties.GEOCODE || clickedFeature.properties.OBJECTID?.toString()

                // Always select the municipality when clicked
                if (municipalityGeocode) {
                  setSelectedMunicipalityGeocode(municipalityGeocode)
                  selectedMunicipalityRef.current = municipalityGeocode
                  // Update border to keep it visible
                  updateBordersForSelection()
                  // Hide tooltip when clicked
                  setHoveredMunicipalityName(null)
                  setIsTooltipVisible(false)
                }
              }
            }

            // Store handlers for cleanup
            eventHandlersRef.current = {
              handleMouseMove,
              handleMouseLeave,
              handleMunicipalityClick
            }

            // Add event listeners
            // Use global mousemove for more reliable hover detection
            mapInstance.on('mousemove', handleMouseMove)
            // Also listen to mouseleave on the layer as backup
            mapInstance.on('mouseleave', 'provinceHoverLayer', handleMouseLeave)
            // Listen to mouseleave on the map canvas as well
            mapInstance.getCanvas().addEventListener('mouseleave', handleMouseLeave)
            mapInstance.on('click', 'provinceHoverLayer', handleMunicipalityClick)
          })
          .catch((error) => {
            console.warn('Failed to load province boundaries:', error)
          })

        // Enable terrain immediately if terrainEnabled is true and viewport is in Catanduanes
        // This ensures terrain appears on initial load
        if (terrainEnabled && isViewportInCatanduanes(mapInstance)) {
          try {
            mapInstance.setTerrain({
              source: 'terrainSource',
              exaggeration: MAP_CONFIG.TERRAIN_EXAGGERATION
            })
          } catch (error) {
            // Terrain source might not be ready yet, will be handled by useEffect
          }
        }
      })

      mapRef.current = mapInstance
      setMap(mapInstance)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize map'
      // Use proper error handling instead of console.error
      setError(errorMessage)
      setStoreError('map', errorMessage)
      toast.error(errorMessage)
      setIsLoading(false)
    }

    // Handle window resize
    const handleResize = () => {
      if (mapInstance) {
        mapInstance.resize()
      }
    }
    window.addEventListener('resize', handleResize)

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize)
      if (loadingTimeout) {
        clearTimeout(loadingTimeout)
        loadingTimeout = null
      }
      if (mapInstance) {
        // Remove event listeners
        try {
          const handlers = eventHandlersRef.current
          // Remove global mousemove listener
          if (handlers.handleMouseMove) {
            mapInstance.off('mousemove', handlers.handleMouseMove)
          }
          // Remove layer-specific listeners
          if (mapInstance.getLayer('provinceHoverLayer')) {
            if (handlers.handleMouseLeave) {
              mapInstance.off('mouseleave', 'provinceHoverLayer', handlers.handleMouseLeave)
            }
            if (handlers.handleMunicipalityClick) {
              mapInstance.off('click', 'provinceHoverLayer', handlers.handleMunicipalityClick)
            }
          }
          // Remove canvas mouseleave listener
          if (handlers.handleMouseLeave) {
            mapInstance.getCanvas().removeEventListener('mouseleave', handlers.handleMouseLeave)
          }
        } catch (e) {
          // Layers might not exist, ignore
        }
        mapInstance.remove()
        mapRef.current = null
        setMap(null)
        // Clear handlers
        eventHandlersRef.current = {}
      }
    }
  }, [])

  // Update terrain when terrainEnabled changes or map moves
  useEffect(() => {
    if (!map || !map.isStyleLoaded()) return
    
    const updateTerrainState = () => {
      if (!map) return
      
      // Check if terrain source exists
      if (!map.getSource('terrainSource')) {
        // Wait for terrain source to be added
        return
      }
      
      const hasTerrain = map.getTerrain() !== null
      const inCatanduanes = isViewportInCatanduanes(map)

      if (terrainEnabled && inCatanduanes && !hasTerrain) {
        // Enable terrain when terrainEnabled is true and viewport is in Catanduanes
        try {
          map.setTerrain({
            source: 'terrainSource',
            exaggeration: MAP_CONFIG.TERRAIN_EXAGGERATION
          })
        } catch (error) {
          // Terrain source might not be ready yet, ignore
        }
      } else if ((!terrainEnabled || !inCatanduanes) && hasTerrain) {
        // Disable terrain when terrainEnabled is false or viewport is outside Catanduanes
        map.setTerrain(null)
      }
    }

    // Update immediately
    updateTerrainState()

    // Also update on map movement and when data loads (terrain source might load later)
    map.on('moveend', updateTerrainState)
    map.on('zoomend', updateTerrainState)
    map.on('data', updateTerrainState) // Trigger when new data (like terrain source) loads

    return () => {
      map.off('moveend', updateTerrainState)
      map.off('zoomend', updateTerrainState)
      map.off('data', updateTerrainState)
    }
  }, [map, terrainEnabled])

  // Add all 3D models to the map using the reusable hook (only if models are enabled)
  useMap3DModels(modelsEnabled ? map : null, touristSpotModels)

  // Update ref when state changes
  useEffect(() => {
    selectedMunicipalityRef.current = selectedMunicipalityGeocode
  }, [selectedMunicipalityGeocode])

  // Determine which municipality's markers to show
  // Show markers for:
  // 1. The municipality border that was clicked (selectedMunicipalityGeocode)
  // 2. OR the municipality of the currently selected place (selectedPlaceMunicipalityGeocode)
  const activeMarkersGeocode = selectedMunicipalityGeocode || selectedPlaceMunicipalityGeocode

  // Filter models based on selected municipality
  const filteredModels = useMemo(() => {
    // If no municipality is selected, show no markers
    if (!activeMarkersGeocode || !municipalityGeoJson) {
      return []
    }

    // Find ALL municipality features with the matching GEOCODE
    // (Municipalities can have multiple polygons for different barangays/areas)
    const isDev = import.meta.env.DEV
    if (isDev) {
      console.log('Available GEOCODEs in GeoJSON:', municipalityGeoJson.features.map(f => ({
        geocode: f.properties?.GEOCODE || f.properties?.OBJECTID?.toString(),
        name: f.properties?.MUNICIPALI || f.properties?.NAME || f.properties?.MUNICIPALITY || 'unknown'
      })))
      console.log('Looking for GEOCODE:', activeMarkersGeocode)
    }

    const municipalityFeatures = municipalityGeoJson.features.filter(
      (feature) => {
        const geocode = feature.properties?.GEOCODE || feature.properties?.OBJECTID?.toString()
        return geocode === activeMarkersGeocode
      }
    )

    if (municipalityFeatures.length === 0) {
      console.warn('Municipality features not found for GEOCODE:', activeMarkersGeocode)
      if (isDev) {
        console.log('Available features:', municipalityGeoJson.features.map(f => ({
          geocode: f.properties?.GEOCODE || f.properties?.OBJECTID?.toString(),
          municipality: f.properties?.MUNICIPALI || f.properties?.MUNICIPALITY,
          properties: f.properties
        })))
      }
      return []
    }

    if (isDev) {
      console.log(`Found ${municipalityFeatures.length} municipality feature(s) for GEOCODE ${activeMarkersGeocode}`)
    }

    // Filter models that are within ANY of the municipality features using point-in-polygon
    const filtered = touristSpotModels.filter((model) => {
      // Check if point is inside ANY of the municipality features
      const isInside = municipalityFeatures.some((feature) => {
        return isPointInGeoJSONFeature(model.coordinates, feature)
      })

      if (isDev) {
        console.log(`Checking ${model.name || model.id} at [${model.coordinates[0]}, ${model.coordinates[1]}] for municipality ${activeMarkersGeocode}: ${isInside ? 'INSIDE' : 'OUTSIDE'}`)
      }
      return isInside
    })

    if (isDev) {
      console.log(`Found ${filtered.length} models in municipality ${activeMarkersGeocode}:`, filtered.map(m => m.name || m.id))
    }

    return filtered
  }, [activeMarkersGeocode, municipalityGeoJson])

  // Add circular markers with gradient at independent geographic coordinates
  // Parameters: (map, models, onClick, [metersNorth, metersEast], verticalPixelOffset)
  // Using 0 vertical offset so marker position is independent of camera zoom/angle
  // Only show markers when a municipality is selected
  useMap3DMarkers(map, filteredModels, (modelId) => {
    setSelectedTouristSpot(modelId)
    // Hide tooltip when a marker is clicked
    setIsTooltipVisible(false)
  }, [45, 25], 0)

  // Add place markers from GeoJSON files
  // Only show place markers when a municipality is selected or a place card is open
  usePlaceMarkers(map, activeMarkersGeocode, handlePlaceClick, handlePlaceHover)

  // Resize map when container size changes (e.g., when sidebar toggles)
  useEffect(() => {
    if (!map || !mapContainer.current) return

    const resizeObserver = new ResizeObserver(() => {
      // Use setTimeout to ensure the DOM has fully updated
      setTimeout(() => {
        if (map) {
          map.resize()
        }
      }, 100)
    })

    resizeObserver.observe(mapContainer.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [map])

  return (
    <div className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
      {/* Map container - always rendered so useEffect can access it */}
      <div
        ref={mapContainer}
        className="w-full h-full"
      />

      {/* Reset Camera Button */}
      <ResetCameraButton onClick={handleResetCamera} isSidebarOpen={isSidebarOpen} isMobile={isMobile} />

      {/* Bookmark-style Itinerary Button */}
      <ItineraryButton onClick={handleItineraryClick} count={0} />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-90" style={{ zIndex: 1, pointerEvents: 'auto' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-90" style={{ zIndex: 1, pointerEvents: 'auto' }}>
          <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Map</h2>
            <p className="text-gray-700 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      )}
      
      {/* Municipality Tooltip (Europa Universalis IV-style) - now with visibility control */}
      <MunicipalityTooltip 
        municipalityName={hoveredMunicipalityName}
        mouseX={mousePosition.x}
        mouseY={mousePosition.y}
        isVisible={isTooltipVisible}
      />

      {/* Tourist Spot Info Panel */}
      <TouristSpotInfo spot={selectedSpot} map={map} onClose={handleCloseSpotInfo} />

      {/* Place Info Panel */}
      {(hoveredPlace || selectedPlace) && (
        <PlaceInfo
          place={hoveredPlace || selectedPlace}
          map={map}
          onClose={handleClosePlaceInfo}
        />
      )}

    </div>
  )
}
