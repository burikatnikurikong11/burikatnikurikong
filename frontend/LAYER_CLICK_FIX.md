# Fix: GeoJSON Layer Blocking POI Marker Clicks

## Problem

The GeoJSON municipality boundary layers (`provinceHoverLayer` and `provinceBordersLayer`) are rendering on top of POI markers, preventing users from clicking on the markers.

## Root Cause

In MapLibre GL, layers are rendered in the order they're added. Even though the layers have transparent fills, they still capture mouse/click events, blocking interaction with underlying 3D models and markers.

## Solution

Modify the GeoJSON layers in `Discover.tsx` to allow click events to pass through to the POI markers below.

### Option 1: Reduce Interactive Layer Area (Recommended)

Modify the `provinceHoverLayer` to only capture events in specific areas, not covering POI markers:

```typescript
// In Discover.tsx, around line 440 where you add the layer
if (!mapInstance.getLayer('provinceHoverLayer')) {
  mapInstance.addLayer({
    id: 'provinceHoverLayer',
    type: 'fill',
    source: 'provinceBoundaries',
    paint: {
      'fill-color': 'transparent',
      'fill-opacity': 0
    },
    // Add a filter to reduce clickable area
    // This makes the layer interactive but allows clicks through in most areas
  }, firstSymbolLayerId)
}
```

### Option 2: Use Line Layer for Interaction Instead

Replace the fill layer with a wider line that users can click:

```typescript
// Remove or modify provinceHoverLayer
if (!mapInstance.getLayer('provinceClickLayer')) {
  mapInstance.addLayer({
    id: 'provinceClickLayer',
    type: 'line',
    source: 'provinceBoundaries',
    paint: {
      'line-color': 'transparent',
      'line-width': 10, // Wide enough to click easily
      'line-opacity': 0
    }
  }, firstSymbolLayerId)
}

// Update event handlers to use 'provinceClickLayer' instead of 'provinceHoverLayer'
mapInstance.on('mousemove', (e) => {
  const features = mapInstance.queryRenderedFeatures(e.point, {
    layers: ['provinceClickLayer']  // Change this
  })
  // ... rest of handler
})
```

### Option 3: Implement Smart Click Detection (Best Solution)

Check if a POI marker is under the cursor before triggering municipality selection:

```typescript
const handleMunicipalityClick = (e: maplibregl.MapMouseEvent) => {
  if (!mapInstance) return

  const clickedLng = e.lngLat.lng
  const clickedLat = e.lngLat.lat
  
  // First, check if user clicked on a POI marker
  for (const model of touristSpotModels) {
    const distance = calculateDistanceDegrees(
      [clickedLng, clickedLat],
      model.coordinates
    )
    if (distance < MAP_CONFIG.MODEL_CLICK_THRESHOLD) {
      // POI marker was clicked, don't handle municipality click
      return
    }
  }
  
  // Also check for place markers
  for (const place of filteredTouristSpots) {
    const distance = calculateDistanceDegrees(
      [clickedLng, clickedLat],
      place.coordinates
    )
    if (distance < 0.002) { // Adjust threshold as needed
      // Place marker was clicked, don't handle municipality click
      return
    }
  }

  // No POI clicked, proceed with municipality selection
  const features = mapInstance.queryRenderedFeatures(e.point, {
    layers: ['provinceHoverLayer']
  })

  const clickedFeature = features[0]
  // ... rest of existing code
}
```

## Implementation Steps

### Step 1: Update the Municipality Click Handler (Recommended)

Find this section in `Discover.tsx` (around line 670):

```typescript
const handleMunicipalityClick = (e: maplibregl.MapMouseEvent) => {
  if (!mapInstance) return

  const features = mapInstance.queryRenderedFeatures(e.point, {
    layers: ['provinceHoverLayer']
  })
  // ...
}
```

Replace it with:

```typescript
const handleMunicipalityClick = (e: maplibregl.MapMouseEvent) => {
  if (!mapInstance) return

  const clickedLng = e.lngLat.lng
  const clickedLat = e.lngLat.lat
  
  // Check if a 3D model marker was clicked
  for (const model of touristSpotModels) {
    const distance = calculateDistanceDegrees(
      [clickedLng, clickedLat],
      model.coordinates
    )
    if (distance < MAP_CONFIG.MODEL_CLICK_THRESHOLD) {
      // Don't handle municipality click if POI was clicked
      return
    }
  }
  
  // Check if a place marker was clicked
  const placeThreshold = 0.002 // ~200 meters
  for (const place of allTouristSpots) {
    const distance = calculateDistanceDegrees(
      [clickedLng, clickedLat],
      place.coordinates
    )
    if (distance < placeThreshold) {
      // Don't handle municipality click if place marker was clicked
      return
    }
  }

  // No POI clicked, proceed with municipality selection
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
          pitch: 40,
          bearing: 0,
          padding: sidebarPadding,
          duration: ANIMATION_CONFIG.FLY_TO_DURATION,
          essential: true,
          easing: (t) => t * (2 - t)
        })
      }
    }
  }
}
```

### Step 2: Ensure Dependencies are Available

Make sure `allTouristSpots` is accessible in the closure where `handleMunicipalityClick` is defined. It should already be in scope.

### Step 3: Test the Fix

1. ✅ Click on municipality borders - should select municipality
2. ✅ Click on POI markers - should select POI, not municipality
3. ✅ Click on place markers - should select place, not municipality
4. ✅ Hover over municipalities - border should still highlight
5. ✅ Hover over POIs - tooltip should appear

## Alternative: Z-Index Management

If the above doesn't work, you can also try adjusting the layer order by ensuring POI markers are rendered after boundary layers:

```typescript
// When adding markers, specify they should be above boundaries
marker.getElement().style.zIndex = '1000';
```

## Why This Happens

MapLibre GL renders layers in order:
1. Base map style layers
2. Custom layers (in the order added)
3. Markers and controls

Even transparent layers capture click events by default. The fix ensures clicks on POIs are detected first before municipality layer handles them.

## Related Files

- `frontend/src/routes/Discover.tsx` - Main map component
- `frontend/src/hooks/useMap3DMarkers.ts` - 3D marker rendering
- `frontend/src/hooks/usePlaceMarkers.ts` - Place marker rendering
- `frontend/src/constants/map.ts` - Map configuration

---

**Last Updated:** December 23, 2025
**Version:** 1.0
