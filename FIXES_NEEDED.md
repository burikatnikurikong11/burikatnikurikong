# Fixes Needed for Municipality Zoom & Marker Info Cards

## Issue 1: Municipality Click Not Zooming

### Fix Required in `frontend/src/routes/Discover.tsx`

**Line 1:** Add this import at the top with other imports:
```typescript
import { calculateFeatureBounds, calculateCameraOptions } from '../utils/municipalityBounds'
```

**Line ~632:** Find the `handleMunicipalityClick` function inside the `fetch('/CATANDUANES.geojson')` section and replace it with:

```typescript
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
        
        // Fly to the municipality with dynamic zoom
        mapInstance.flyTo({
          center: cameraOptions.center,
          zoom: cameraOptions.zoom,
          pitch: 45,
          bearing: 0,
          padding: sidebarPadding,
          duration: ANIMATION_CONFIG.FLY_TO_DURATION,
          essential: true
        })
      }
    }
  }
}
```

## Issue 2: Marker Info Cards Not Showing

### Debug Steps:

1. **Check if markers are being created**: Open browser console and check for errors
2. **Verify usePlaceMarkers is being called**: Look for the line around 870:
   ```typescript
   usePlaceMarkers(map, activeMarkersGeocode, handlePlaceClick, handlePlaceHover, filteredTouristSpots)
   ```

3. **Check if PlaceInfo is rendering**: The component is at lines 925-930, verify it's there:
   ```typescript
   {(hoveredPlace || selectedPlace) && (
     <PlaceInfo
       place={hoveredPlace || selectedPlace}
       map={map}
       onClose={handleClosePlaceInfo}
     />
   )}
   ```

### Potential Fix: Ensure handlers are defined

Verify these handlers exist (around lines 215-245):

```typescript
// Handle place selection and zoom
const handlePlaceClick = useCallback((place: Place) => {
  if (!map) return

  setSelectedPlace(place)  // This is critical!
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
  setHoveredPlace(place)  // This is critical!
  if (place) {
    setIsTooltipVisible(false)
  } else {
    if (!selectedPlace && !selectedTouristSpot && !selectedMunicipalityGeocode) {
      setIsTooltipVisible(true)
    }
  }
}, [selectedPlace, selectedTouristSpot, selectedMunicipalityGeocode])
```

## Testing After Changes

1. Pull changes: `git pull origin main`
2. Make the edits above to `Discover.tsx`
3. Restart dev server: `npm run dev`
4. Test:
   - Click a municipality → Should zoom in dynamically
   - Hover over a marker → Should show info card
   - Click a marker → Should show info card and zoom

## Quick Verification

In browser console, type:
```javascript
// Check if handlers exist
console.log(typeof handlePlaceClick)  // should be 'function'
console.log(typeof handlePlaceHover)  // should be 'function'

// Check if state is updating
// Hover a marker and check:
console.log(document.querySelector('[data-place-marker]'))  // should show marker elements
```

## Common Issues

1. **Municipality bounds not calculating**: Make sure `municipalityBounds.ts` is imported
2. **Markers not clickable**: Check z-index and pointer-events in marker styles
3. **Info card not visible**: Check z-index is set to 1000 in PlaceInfo component (it is)
4. **Handlers not firing**: Verify `usePlaceMarkers` hook is correctly passing the handlers
