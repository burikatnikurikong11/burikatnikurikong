import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useMap3DModels } from '../hooks/useMap3DModels'
import { useMap3DMarkers, offsetCoordinates } from '../hooks/useMap3DMarkers'
import { usePlaceMarkers } from '../hooks/usePlaceMarkers'
import { touristSpotModels } from '../config/touristSpots'
import { Model3DConfig } from '../types/model'
import { MUNICIPALITY_GEOCODES, MUNICIPALITY_NAMES } from '../config/municipalities'
import { isViewportInCatanduanes } from '../utils/catanduanesBounds'
import { calculateFeatureBounds, calculateCameraOptions } from '../utils/municipalityBounds'
import { getMapTilerKey } from '../utils/env'
import { useStore } from '../state/store'
import TouristSpotInfo from '../components/TouristSpotInfo'
import PlaceInfo from '../components/PlaceInfo'
import MunicipalityTooltip from '../components/MunicipalityTooltip'
import MapControls from '../components/MapControls'
import MapStyleSwitcher from '../components/MapStyleSwitcher'
import CategoryPills from '../components/CategoryPills'
import { MAP_CONFIG, MODEL_CONFIG, ANIMATION_CONFIG, UI_CONFIG } from '../constants/map'
import { calculateDistanceDegrees, isPointInGeoJSONFeature } from '../utils/coordinates'
import toast from 'react-hot-toast'
import { matchPlaceToModel } from '../utils/matchPlaceToModel'
import { loadAllTouristSpots } from '../utils/loadGeoJsonSpots'
import type { PlaceInfo as PlaceInfoType } from '../types/api'
import type { Place } from '../types/place'

type MapStyle = 'satellite' | 'standard' | 'transport'

interface DiscoverProps {
  isSidebarOpen?: boolean
  isMobile?: boolean
  onPlaceSelectFromAI?: (handler: (place: PlaceInfoType) => void) => void
  isItineraryExpanded?: boolean
}

export default function Discover({ 
  isSidebarOpen = false, 
  isMobile = false, 
  onPlaceSelectFromAI,
  isItineraryExpanded = false 
}: DiscoverProps) {
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
  const [mapStyle, setMapStyle] = useState<MapStyle>('satellite')
  const [isMapStyleOpen, setIsMapStyleOpen] = useState(false)
  
  // Hovered 3D model marker state
  const [hoveredModel, setHoveredModel] = useState<Model3DConfig | null>(null)
  
  // Category filter state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  
  // All tourist spots loaded from GeoJSON
  const [allTouristSpots, setAllTouristSpots] = useState<Place[]>([])
  
  // Municipality tooltip state
  const [hoveredMunicipalityName, setHoveredMunicipalityName] = useState<string | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isTooltipVisible, setIsTooltipVisible] = useState(true)
  
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
  
  // Get selected or hovered spot data for info card display
  const displayedSpot = useMemo(() => {
    // Priority: selected spot > hovered model
    if (selectedTouristSpot) {
      return touristSpotModels.find(m => m.id === selectedTouristSpot) || null
    }
    return hoveredModel
  }, [selectedTouristSpot, hoveredModel])
  
  // Load all tourist spots from GeoJSON files on mount
  useEffect(() => {
    loadAllTouristSpots()
      .then(spots => {
        setAllTouristSpots(spots)
        console.log(`Loaded ${spots.length} tourist spots from GeoJSON files`)
      })
      .catch(error => {
        console.error('Failed to load tourist spots:', error)
      })
  }, [])
  
  // Helper function to calculate padding for sidebar offset
  const getPaddingForSidebar = useCallback(() => {
    if (!map || isMobile || !isSidebarOpen) {
      return { left: 0, right: 0, top: 0, bottom: 0 }
    }
    
    const itineraryWidthPercent = isItineraryExpanded ? 60 : 30
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight
    const minimalistSidebarWidth = 80
    const availableWidth = windowWidth - minimalistSidebarWidth - 8
    const itineraryWidth = (availableWidth * itineraryWidthPercent) / 100
    
    return {
      left: itineraryWidth / 2,
      right: 0,
      top: 0,
      bottom: windowHeight * 0.1
    }
  }, [map, isMobile, isSidebarOpen, isItineraryExpanded])
  
  // Handle category selection
  const handleCategorySelect = useCallback((categoryId: string | null) => {
    setSelectedCategory(categoryId)
    
    if (categoryId) {
      const categoryNames: Record<string, string> = {
        beaches: 'Beaches',
        nature: 'Nature',
        food: 'Food & Dining',
        accommodation: 'Hotels & Accommodation',
        activities: 'Activities',
        culture: 'Culture & Heritage'
      }
      
      const filteredCount = allTouristSpots.filter(spot => spot.category === categoryId).length
      
      toast.success(
        `Found ${filteredCount} ${categoryNames[categoryId] || categoryId} spot${filteredCount === 1 ? '' : 's'}`,
        {
          duration: 2000,
          icon: '🔍',
          style: {
            background: 'linear-gradient(135deg, var(--forest-green) 0%, var(--ocean-blue) 100%)',
            color: 'white',
            fontWeight: '600'
          }
        }
      )
    } else {
      toast.success(
        `Showing all ${allTouristSpots.length} attractions`,
        {
          duration: 2000,
          icon: '🌍',
          style: {
            background: 'linear-gradient(135deg, var(--forest-green) 0%, var(--ocean-blue) 100%)',
            color: 'white',
            fontWeight: '600'
          }
        }
      )
    }
  }, [allTouristSpots])
  
  // Handle closing tourist spot info
  const handleCloseSpotInfo = useCallback(() => {
    setSelectedTouristSpot(null)
    setHoveredModel(null)
    setIsTooltipVisible(true)
  }, [setSelectedTouristSpot])
  
  // Handle 3D model marker hover
  const handleModelHover = useCallback((model: Model3DConfig | null) => {
    setHoveredModel(model)
    if (model) {
      setIsTooltipVisible(false)
    } else {
      // Only show tooltip if nothing else is selected/hovered
      if (!selectedPlace && !selectedTouristSpot && !selectedMunicipalityGeocode) {
        setIsTooltipVisible(true)
      }
    }
  }, [selectedPlace, selectedTouristSpot, selectedMunicipalityGeocode])

  // Handle reset camera to initial view
  const handleResetCamera = useCallback(() => {
    if (!map) return

    setSelectedMunicipalityGeocode(null)
    setSelectedPlace(null)
    setHoveredPlace(null)
    setHoveredModel(null)
    setSelectedPlaceMunicipalityGeocode(null)
    setSelectedTouristSpot(null)
    selectedMunicipalityRef.current = null
    setIsTooltipVisible(true)

    map.flyTo({
      center: MAP_CONFIG.DEFAULT_CENTER,
      zoom: MAP_CONFIG.DEFAULT_ZOOM,
      pitch: MAP_CONFIG.DEFAULT_PITCH,
      bearing: MAP_CONFIG.DEFAULT_BEARING,
      duration: ANIMATION_CONFIG.FLY_TO_DURATION,
      essential: true
    })
  }, [map, setSelectedTouristSpot])

  // Handle map style change
  const handleMapStyleChange = useCallback((newStyle: MapStyle) => {
    if (!map) return
    
    setMapStyle(newStyle)
    const apiKey = getMapTilerKey()
    
    let styleUrl = ''
    switch (newStyle) {
      case 'satellite':
        styleUrl = `https://api.maptiler.com/maps/satellite/style.json?key=${apiKey}`
        break
      case 'standard':
        styleUrl = `https://api.maptiler.com/maps/streets-v2/style.json?key=${apiKey}`
        break
      case 'transport':
        styleUrl = `https://api.maptiler.com/maps/basic-v2/style.json?key=${apiKey}`
        break
    }
    
    map.setStyle(styleUrl)
    
    map.once('style.load', () => {
      if (!map) return
      
      if (!map.getSource('terrainSource')) {
        map.addSource('terrainSource', {
          type: 'raster-dem',
          url: `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${apiKey}`,
          tileSize: 256,
          maxzoom: 14
        })
      }
      
      if (municipalityGeoJson && !map.getSource('provinceBoundaries')) {
        map.addSource('provinceBoundaries', {
          type: 'geojson',
          data: municipalityGeoJson
        })
        
        const layers = map.getStyle().layers
        const firstSymbolLayerId = layers?.find(layer => layer.type === 'symbol')?.id

        if (!map.getLayer('provinceHoverLayer')) {
          map.addLayer({
            id: 'provinceHoverLayer',
            type: 'fill',
            source: 'provinceBoundaries',
            paint: {
              'fill-color': 'transparent',
              'fill-opacity': 0
            }
          }, firstSymbolLayerId)
        }

        if (!map.getLayer('provinceBordersLayer')) {
          map.addLayer({
            id: 'provinceBordersLayer',
            type: 'line',
            source: 'provinceBoundaries',
            paint: {
              'line-color': '#ffffff',
              'line-width': 2,
              'line-opacity': 0
            },
            filter: ['==', 'GEOCODE', '']
          }, firstSymbolLayerId)
        }
      }
      
      if (terrainEnabled && isViewportInCatanduanes(map)) {
        try {
          map.setTerrain({
            source: 'terrainSource',
            exaggeration: MAP_CONFIG.TERRAIN_EXAGGERATION
          })
        } catch (error) {
          // Terrain source might not be ready yet
        }
      }
    })
  }, [map, municipalityGeoJson, terrainEnabled])

  // Toggle map style switcher
  const handleToggleMapStyle = useCallback(() => {
    setIsMapStyleOpen(!isMapStyleOpen)
  }, [isMapStyleOpen])

  // Handle place selection and zoom
  const handlePlaceClick = useCallback((place: Place) => {
    if (!map) return

    setSelectedPlace(place)
    setIsTooltipVisible(false)

    const municipalityName = place.municipality.toUpperCase().replace(/\s+/g, '_')
    const geocodeKey = Object.keys(MUNICIPALITY_GEOCODES).find(
      key => key === municipalityName
    ) as keyof typeof MUNICIPALITY_GEOCODES | undefined

    if (geocodeKey) {
      setSelectedPlaceMunicipalityGeocode(MUNICIPALITY_GEOCODES[geocodeKey])
    }

    map.flyTo({
      center: place.coordinates,
      zoom: 17,
      pitch: 45,
      bearing: 0,
      padding: getPaddingForSidebar(),
      duration: ANIMATION_CONFIG.FLY_TO_DURATION,
      essential: true,
    })
  }, [map, getPaddingForSidebar])

  // Handle place hover
  const handlePlaceHover = useCallback((place: Place | null) => {
    setHoveredPlace(place)
    if (place) {
      setIsTooltipVisible(false)
    } else {
      if (!selectedPlace && !selectedTouristSpot && !selectedMunicipalityGeocode && !hoveredModel) {
        setIsTooltipVisible(true)
      }
    }
  }, [selectedPlace, selectedTouristSpot, selectedMunicipalityGeocode, hoveredModel])

  // Handle closing place info
  const handleClosePlaceInfo = useCallback(() => {
    setSelectedPlace(null)
    setHoveredPlace(null)
    setIsTooltipVisible(true)
  }, [])

  // Handle place selection from AI chatbot
  const handlePlaceFromAI = useCallback((place: PlaceInfoType) => {
    const modelId = matchPlaceToModel(place)
    
    if (!modelId) {
      console.log('Place from AI does not match any 3D model:', place)
      return
    }
    
    const model = touristSpotModels.find(m => m.id === modelId)
    if (!model || !map) {
      return
    }
    
    setSelectedTouristSpot(modelId)
    setIsTooltipVisible(false)
    
    const geoOffset: [number, number] = [45, 25]
    const [metersNorth, metersEast] = geoOffset
    const markerCoordinates = offsetCoordinates(
      model.coordinates[0],
      model.coordinates[1],
      metersNorth,
      metersEast
    )
    
    const modelScale = model.scale ?? MODEL_CONFIG.DEFAULT_SCALE
    const modelAltitude = model.altitude ?? MODEL_CONFIG.DEFAULT_ALTITUDE
    const scaleAdjustment = modelScale > 2 ? 1.0 : 0.5
    const altitudeAdjustment = modelAltitude > 20 ? 0.3 : 0
    const targetZoom = Math.max(19, ANIMATION_CONFIG.DEFAULT_ZOOM_ON_SELECT - scaleAdjustment - altitudeAdjustment)

    map.flyTo({
      center: markerCoordinates,
      zoom: targetZoom,
      pitch: 45,
      bearing: MAP_CONFIG.DEFAULT_BEARING,
      padding: getPaddingForSidebar(),
      duration: ANIMATION_CONFIG.FLY_TO_DURATION,
      essential: true
    })
  }, [map, setSelectedTouristSpot, getPaddingForSidebar])
  
  // Expose the handler to parent component
  useEffect(() => {
    if (onPlaceSelectFromAI) {
      onPlaceSelectFromAI(handlePlaceFromAI)
    }
  }, [onPlaceSelectFromAI, handlePlaceFromAI])
  
  // Hide tooltip when a tourist spot is selected or hovered
  useEffect(() => {
    if (selectedTouristSpot || hoveredModel) {
      setIsTooltipVisible(false)
    } else {
      if (!selectedPlace && !selectedMunicipalityGeocode) {
        setIsTooltipVisible(true)
      }
    }
  }, [selectedTouristSpot, hoveredModel, selectedPlace, selectedMunicipalityGeocode])

  // Filter models by category
  const categoryFilteredModels = useMemo(() => {
    if (!selectedCategory) {
      return touristSpotModels
    }
    
    return touristSpotModels.filter(model => {
      if (!model.categories || model.categories.length === 0) {
        return false
      }
      return model.categories.includes(selectedCategory)
    })
  }, [selectedCategory])

  // Initialize the map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return

    let mapInstance: maplibregl.Map | null = null
    let loadingTimeout: ReturnType<typeof setTimeout> | null = null

    try {
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

      mapInstance.on('error', (e) => {
        const errorMessage = `Map error: ${e.error?.message || 'Unknown error'}`
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

      mapInstance.once('load', () => {
        setIsLoading(false)
        setError(null)
        setLoadingState('map', false)
        if (loadingTimeout) {
          clearTimeout(loadingTimeout)
          loadingTimeout = null
        }
      })
      
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
        
        mapInstance.on('click', (e) => {
          const target = e.originalEvent?.target as HTMLElement
          if (target?.closest('.maplibregl-ctrl') || 
              target?.closest('.maplibregl-control-container') ||
              target?.closest('[style*="z-index: 1000"]') ||
              target?.closest('[class*="z-[1000]"]')) {
            return
          }
          
          const clickedLng = e.lngLat.lng
          const clickedLat = e.lngLat.lat
          
          for (const model of touristSpotModels) {
            const distance = calculateDistanceDegrees(
              [clickedLng, clickedLat],
              model.coordinates
            )
            if (distance < MAP_CONFIG.MODEL_CLICK_THRESHOLD && mapInstance) {
              setSelectedTouristSpot(model.id)
              setIsTooltipVisible(false)
              const modelScale = model.scale ?? MODEL_CONFIG.DEFAULT_SCALE
              const modelAltitude = model.altitude ?? MODEL_CONFIG.DEFAULT_ALTITUDE
              const scaleAdjustment = modelScale > 2 ? 1.0 : 0.5
              const altitudeAdjustment = modelAltitude > 20 ? 0.3 : 0
              const targetZoom = Math.max(19, ANIMATION_CONFIG.DEFAULT_ZOOM_ON_SELECT - scaleAdjustment - altitudeAdjustment)

              const padding = isSidebarOpen && !isMobile ? getPaddingForSidebar() : { left: 0, right: 0, top: 0, bottom: 0 }

              mapInstance.flyTo({
                center: model.coordinates,
                zoom: targetZoom,
                pitch: 45,
                bearing: MAP_CONFIG.DEFAULT_BEARING,
                padding: padding,
                duration: ANIMATION_CONFIG.FLY_TO_DURATION,
                essential: true
              })
              break
            }
          }
        })
      }

      loadingTimeout = setTimeout(() => {
        setIsLoading(false)
        loadingTimeout = null
      }, UI_CONFIG.LOADING_TIMEOUT)

      mapInstance.once('style.load', () => {
        if (!mapInstance) return
        
        if (!mapInstance.getSource('terrainSource')) {
          mapInstance.addSource('terrainSource', {
            type: 'raster-dem',
            url: `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${apiKey}`,
            tileSize: 256,
            maxzoom: 14
          })
        }

        fetch('/CATANDUANES.geojson')
          .then(response => response.json())
          .then((provinceGeoJson) => {
            if (!mapInstance) return

            const caramoranFeatures: any[] = []
            const otherFeatures: any[] = []            
            provinceGeoJson.features.forEach((feature: any) => {
              if (feature.properties && feature.properties.GEOCODE === '052004000') {
                caramoranFeatures.push(feature)
              } else {
                otherFeatures.push(feature)
              }
            })

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

              mergedCaramoran = {
                type: 'Feature',
                properties: caramoranFeatures[0].properties,
                geometry: {
                  type: 'MultiPolygon',
                  coordinates: polygons.map(poly => [poly])
                }
              }
            }

            const processedGeoJson: GeoJSON.FeatureCollection = {
              type: 'FeatureCollection',
              features: mergedCaramoran 
                ? [mergedCaramoran, ...otherFeatures]
                : otherFeatures
            }

            if (!mapInstance.getSource('provinceBoundaries')) {
              mapInstance.addSource('provinceBoundaries', {
                type: 'geojson',
                data: processedGeoJson
              })
            } else {
              const source = mapInstance.getSource('provinceBoundaries')
              if (source && source.type === 'geojson') {
                (source as maplibregl.GeoJSONSource).setData(processedGeoJson)
              }
            }

            const layers = mapInstance.getStyle().layers
            const firstSymbolLayerId = layers?.find(layer => layer.type === 'symbol')?.id

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

            if (!mapInstance.getLayer('provinceBordersLayer')) {
              mapInstance.addLayer({
                id: 'provinceBordersLayer',
                type: 'line',
                source: 'provinceBoundaries',
                paint: {
                  'line-color': '#ffffff',
                  'line-width': 2,
                  'line-opacity': 0
                },
                filter: ['==', 'GEOCODE', '']
              }, firstSymbolLayerId)
            }

            let hoveredMunicipalityGeocode: string | null = null

            const hideBorders = () => {
              if (!mapInstance) return
              hoveredMunicipalityGeocode = null
              mapInstance.setFilter('provinceBordersLayer', ['==', 'GEOCODE', ''])
              mapInstance.setPaintProperty('provinceBordersLayer', 'line-opacity', 0)
              mapInstance.getCanvas().style.cursor = ''
              setHoveredMunicipalityName(null)
            }

            const showBorders = (geocode: string, feature: any) => {
              if (!mapInstance) return
              hoveredMunicipalityGeocode = geocode

              if (feature.properties.GEOCODE) {
                mapInstance.setFilter('provinceBordersLayer', ['==', 'GEOCODE', geocode])
              } else {
                mapInstance.setFilter('provinceBordersLayer', ['==', 'OBJECTID', feature.properties.OBJECTID])
              }
              mapInstance.setPaintProperty('provinceBordersLayer', 'line-opacity', 1)
              mapInstance.getCanvas().style.cursor = 'pointer'
              
              if (isTooltipVisible) {
                const municipalityName = MUNICIPALITY_NAMES[geocode]
                if (municipalityName) {
                  setHoveredMunicipalityName(municipalityName)
                }
              }
            }

            const updateBordersForSelection = () => {
              if (!mapInstance) return
              const currentSelected = selectedMunicipalityRef.current
              if (currentSelected) {
                mapInstance.setFilter('provinceBordersLayer', ['==', 'GEOCODE', currentSelected])
                mapInstance.setPaintProperty('provinceBordersLayer', 'line-opacity', 1)
              }
            }

            const handleMouseMove = (e: maplibregl.MapMouseEvent) => {
              if (!mapInstance) return

              setMousePosition({ x: e.point.x, y: e.point.y })

              const features = mapInstance.queryRenderedFeatures(e.point, {
                layers: ['provinceHoverLayer']
              })

              const hoveredFeature = features[0]

              if (hoveredFeature && hoveredFeature.properties) {
                const municipalityGeocode = hoveredFeature.properties.GEOCODE || hoveredFeature.properties.OBJECTID?.toString()

                if (hoveredMunicipalityGeocode !== municipalityGeocode) {
                  showBorders(municipalityGeocode, hoveredFeature)
                }
              } else {
                if (hoveredMunicipalityGeocode !== null) {
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

            const handleMouseLeave = () => {
              if (selectedMunicipalityRef.current) {
                updateBordersForSelection()
                hoveredMunicipalityGeocode = null
                setHoveredMunicipalityName(null)
              } else {
                hideBorders()
              }
            }

            setMunicipalityGeoJson(processedGeoJson)

            const handleMunicipalityClick = (e: maplibregl.MapMouseEvent) => {
              if (!mapInstance) return

              const features = mapInstance.queryRenderedFeatures(e.point, {
                layers: ['provinceHoverLayer']
              })

              const clickedFeature = features[0]

              if (clickedFeature && clickedFeature.properties) {
                const municipalityGeocode = clickedFeature.properties.GEOCODE || clickedFeature.properties.OBJECTID?.toString()

                if (municipalityGeocode) {
                  setSelectedMunicipalityGeocode(municipalityGeocode)
                  selectedMunicipalityRef.current = municipalityGeocode
                  updateBordersForSelection()
                  setHoveredMunicipalityName(null)
                  setIsTooltipVisible(false)

                  // Calculate bounds for the clicked municipality feature
                  const bounds = calculateFeatureBounds(clickedFeature)
                  
                  if (bounds) {
                    // Get map container dimensions
                    const container = mapInstance.getContainer()
                    const width = container.clientWidth
                    const height = container.clientHeight
                    
                    // Calculate padding for sidebar
                    const sidebarPadding = isSidebarOpen && !isMobile ? getPaddingForSidebar() : { left: 0, right: 0, top: 0, bottom: 0 }
                    const paddingObj = {
                      top: sidebarPadding.top || 50,
                      bottom: sidebarPadding.bottom || 50,
                      left: sidebarPadding.left || 50,
                      right: sidebarPadding.right || 50
                    }
                    
                    // Calculate optimal camera position
                    const cameraOptions = calculateCameraOptions(bounds, width, height, paddingObj)
                    
                    // Fly to the municipality with dynamic zoom and 40-degree tilt
                    mapInstance.flyTo({
                      center: cameraOptions.center,
                      zoom: cameraOptions.zoom,
                      pitch: 40,  // 40-degree camera tilt
                      bearing: 0,
                      padding: sidebarPadding,
                      duration: ANIMATION_CONFIG.FLY_TO_DURATION,
                      essential: true,
                      // Ease-out quadratic for smooth animation
                      easing: (t) => t * (2 - t)
                    })
                  }
                }
              }
            }

            eventHandlersRef.current = {
              handleMouseMove,
              handleMouseLeave,
              handleMunicipalityClick
            }

            mapInstance.on('mousemove', handleMouseMove)
            mapInstance.on('mouseleave', 'provinceHoverLayer', handleMouseLeave)
            mapInstance.getCanvas().addEventListener('mouseleave', handleMouseLeave)
            mapInstance.on('click', 'provinceHoverLayer', handleMunicipalityClick)
          })
          .catch((error) => {
            console.warn('Failed to load province boundaries:', error)
          })

        if (terrainEnabled && isViewportInCatanduanes(mapInstance)) {
          try {
            mapInstance.setTerrain({
              source: 'terrainSource',
              exaggeration: MAP_CONFIG.TERRAIN_EXAGGERATION
            })
          } catch (error) {
            // Terrain source might not be ready yet
          }
        }
      })

      mapRef.current = mapInstance
      setMap(mapInstance)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize map'
      setError(errorMessage)
      setStoreError('map', errorMessage)
      toast.error(errorMessage)
      setIsLoading(false)
    }

    const handleResize = () => {
      if (mapInstance) {
        mapInstance.resize()
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (loadingTimeout) {
        clearTimeout(loadingTimeout)
        loadingTimeout = null
      }
      if (mapInstance) {
        try {
          const handlers = eventHandlersRef.current
          if (handlers.handleMouseMove) {
            mapInstance.off('mousemove', handlers.handleMouseMove)
          }
          if (mapInstance.getLayer('provinceHoverLayer')) {
            if (handlers.handleMouseLeave) {
              mapInstance.off('mouseleave', 'provinceHoverLayer', handlers.handleMouseLeave)
            }
            if (handlers.handleMunicipalityClick) {
              mapInstance.off('click', 'provinceHoverLayer', handlers.handleMunicipalityClick)
            }
          }
          if (handlers.handleMouseLeave) {
            mapInstance.getCanvas().removeEventListener('mouseleave', handlers.handleMouseLeave)
          }
        } catch (e) {
          // Layers might not exist
        }
        mapInstance.remove()
        mapRef.current = null
        setMap(null)
        eventHandlersRef.current = {}
      }
    }
  }, [])

  // Update terrain when terrainEnabled changes
  useEffect(() => {
    if (!map || !map.isStyleLoaded()) return
    
    const updateTerrainState = () => {
      if (!map) return
      
      if (!map.getSource('terrainSource')) {
        return
      }
      
      const hasTerrain = map.getTerrain() !== null
      const inCatanduanes = isViewportInCatanduanes(map)

      if (terrainEnabled && inCatanduanes && !hasTerrain) {
        try {
          map.setTerrain({
            source: 'terrainSource',
            exaggeration: MAP_CONFIG.TERRAIN_EXAGGERATION
          })
        } catch (error) {
          // Terrain not ready
        }
      } else if ((!terrainEnabled || !inCatanduanes) && hasTerrain) {
        map.setTerrain(null)
      }
    }

    updateTerrainState()

    map.on('moveend', updateTerrainState)
    map.on('zoomend', updateTerrainState)
    map.on('data', updateTerrainState)

    return () => {
      map.off('moveend', updateTerrainState)
      map.off('zoomend', updateTerrainState)
      map.off('data', updateTerrainState)
    }
  }, [map, terrainEnabled])

  // Pass category-filtered models to 3D rendering (always call hook, let it handle modelsEnabled internally)
  useMap3DModels(map, categoryFilteredModels, modelsEnabled)

  useEffect(() => {
    selectedMunicipalityRef.current = selectedMunicipalityGeocode
  }, [selectedMunicipalityGeocode])

  const activeMarkersGeocode = selectedMunicipalityGeocode || selectedPlaceMunicipalityGeocode

  // Filter tourist spots from GeoJSON by category and municipality
  const filteredTouristSpots = useMemo(() => {
    let filtered = allTouristSpots

    // Filter by category if selected
    if (selectedCategory) {
      filtered = filtered.filter(spot => spot.category === selectedCategory)
    }

    // Filter by municipality if selected
    if (activeMarkersGeocode && municipalityGeoJson) {
      const municipalityFeatures = municipalityGeoJson.features.filter(
        (feature) => {
          const geocode = feature.properties?.GEOCODE || feature.properties?.OBJECTID?.toString()
          return geocode === activeMarkersGeocode
        }
      )

      if (municipalityFeatures.length > 0) {
        filtered = filtered.filter((spot) => {
          return municipalityFeatures.some((feature) => {
            return isPointInGeoJSONFeature(spot.coordinates, feature)
          })
        })
      }
    }

    return filtered
  }, [allTouristSpots, selectedCategory, activeMarkersGeocode, municipalityGeoJson])
  
  // Filter 3D models by municipality
  const filteredModels = useMemo(() => {
    if (!activeMarkersGeocode || !municipalityGeoJson) {
      return []
    }

    const municipalityFeatures = municipalityGeoJson.features.filter(
      (feature) => {
        const geocode = feature.properties?.GEOCODE || feature.properties?.OBJECTID?.toString()
        return geocode === activeMarkersGeocode
      }
    )

    if (municipalityFeatures.length === 0) {
      return []
    }

    let filtered = categoryFilteredModels.filter((model) => {
      return municipalityFeatures.some((feature) => {
        return isPointInGeoJSONFeature(model.coordinates, feature)
      })
    })

    return filtered
  }, [activeMarkersGeocode, municipalityGeoJson, categoryFilteredModels])
  
  // Show toast notification when municipality is selected
  useEffect(() => {
    if (selectedMunicipalityGeocode && (filteredModels.length > 0 || filteredTouristSpots.length > 0)) {
      const municipalityName = MUNICIPALITY_NAMES[selectedMunicipalityGeocode] || 'Unknown'
      const totalCount = filteredModels.length + filteredTouristSpots.length
      
      const categoryInfo = selectedCategory ? ` (${selectedCategory})` : ''
      toast.success(
        `Showing ${totalCount} attraction${totalCount === 1 ? '' : 's'}${categoryInfo} in ${municipalityName}`,
        {
          duration: 3000,
          icon: '📍',
          style: {
            background: 'linear-gradient(135deg, var(--forest-green) 0%, var(--ocean-blue) 100%)',
            color: 'white',
            fontWeight: '600'
          }
        }
      )
    }
  }, [selectedMunicipalityGeocode, filteredModels.length, filteredTouristSpots.length, selectedCategory])

  // Use 3D markers with hover support
  useMap3DMarkers(
    map, 
    filteredModels, 
    (modelId) => {
      setSelectedTouristSpot(modelId)
      setIsTooltipVisible(false)
    }, 
    [45, 25], 
    0,
    handleModelHover // Pass hover handler
  )

  // Pass filtered tourist spots to usePlaceMarkers
  usePlaceMarkers(map, activeMarkersGeocode, handlePlaceClick, handlePlaceHover, filteredTouristSpots)

  useEffect(() => {
    if (!map || !mapContainer.current) return

    const resizeObserver = new ResizeObserver(() => {
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
    <div className="absolute inset-0 w-full h-full" style={{ zIndex: 0, overflow: 'hidden', borderRadius: isMobile ? '0' : '16px' }}>
      <div ref={mapContainer} className="w-full h-full" style={{ borderRadius: isMobile ? '0' : '16px' }} />

      {/* Category Filter Pills */}
      <CategoryPills
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
        isMobile={isMobile}
        isSidebarOpen={isSidebarOpen}
        isItineraryOpen={isSidebarOpen}
        isItineraryExpanded={isItineraryExpanded}
      />

      {/* Map Style Switcher */}
      <MapStyleSwitcher 
        currentStyle={mapStyle}
        onStyleChange={handleMapStyleChange}
        isMobile={isMobile}
        isOpen={isMapStyleOpen}
        onClose={() => setIsMapStyleOpen(false)}
      />

      {/* Map Controls */}
      <MapControls 
        onResetCamera={handleResetCamera}
        onToggleMapStyle={handleToggleMapStyle}
        isSidebarOpen={isSidebarOpen}
        isMobile={isMobile}
      />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-90" style={{ zIndex: 1, pointerEvents: 'auto' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}

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
      
      <MunicipalityTooltip 
        municipalityName={hoveredMunicipalityName}
        mouseX={mousePosition.x}
        mouseY={mousePosition.y}
        isVisible={isTooltipVisible}
      />

      {/* Show TouristSpotInfo for selected or hovered model */}
      <TouristSpotInfo spot={displayedSpot} map={map} onClose={handleCloseSpotInfo} />

      {/* Show PlaceInfo for selected or hovered place */}
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