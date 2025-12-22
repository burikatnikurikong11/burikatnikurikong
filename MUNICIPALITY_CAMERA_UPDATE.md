# Municipality Dynamic Camera Positioning Update

## Changes Required in `frontend/src/routes/Discover.tsx`

### 1. Add Import at Top of File

```typescript
import { calculateFeatureBounds, calculateCameraOptions } from '../utils/municipalityBounds'
```

### 2. Update the `handleMunicipalityClick` Function (around line 632)

Replace the existing `handleMunicipalityClick` function with:

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

      // Calculate bounds for the clicked municipality
      const bounds = calculateFeatureBounds(clickedFeature)
      
      if (bounds && mapInstance) {
        // Get map container dimensions
        const container = mapInstance.getContainer()
        const width = container.clientWidth
        const height = container.clientHeight
        
        // Calculate padding for sidebar
        const padding = getPaddingForSidebar()
        const paddingObj = {
          top: padding.top || 50,
          bottom: padding.bottom || 50,
          left: padding.left || 50,
          right: padding.right || 50
        }
        
        // Calculate optimal camera position
        const cameraOptions = calculateCameraOptions(bounds, width, height, paddingObj)
        
        // Fly to the municipality with dynamic zoom
        mapInstance.flyTo({
          center: cameraOptions.center,
          zoom: cameraOptions.zoom,
          pitch: 45,
          bearing: 0,
          padding: padding,
          duration: ANIMATION_CONFIG.FLY_TO_DURATION,
          essential: true
        })
      }
    }
  }
}
```

## Why This Works

1. **`calculateFeatureBounds`** - Calculates the bounding box [minLng, minLat, maxLng, maxLat] for any municipality polygon
2. **`calculateCameraOptions`** - Determines the optimal center point and zoom level to fit all POIs
3. **Dynamic zoom** - Each municipality will have its own perfect zoom level based on its size
4. **Respects sidebar** - Uses `getPaddingForSidebar()` to account for the itinerary panel

## Expected Behavior

- Click Virac (capital, larger area) → Zooms out more to show the whole municipality
- Click Pandan (smaller) → Zooms in closer to show details
- Click Bagamanoc (coastal) → Centers properly showing coastline and inland areas
- All POIs within the municipality will be visible on screen

## Testing

1. Pull the changes: `git pull origin main`
2. Start dev server: `npm run dev`
3. Navigate to Discover page
4. Click different municipalities
5. Verify each municipality shows all its POIs with appropriate zoom level

## Already Working

✅ Hover info cards - `PlaceInfo` component shows when you hover over or click a marker
✅ Click to select - Clicking a marker opens its info card
✅ Municipality filtering - Markers are filtered by selected municipality

The hover and click info cards are already implemented and working in the current code!
