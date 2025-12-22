# Municipality Click Zoom Animation Fix

## Required Changes in `frontend/src/routes/Discover.tsx`

### Step 1: Add Import (at the top with other imports)

```typescript
import { calculateFeatureBounds, calculateCameraOptions } from '../utils/municipalityBounds'
```

### Step 2: Replace `handleMunicipalityClick` Function

Find the `handleMunicipalityClick` function (around line 632, inside the `fetch('/CATANDUANES.geojson')` block) and replace it with:

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
        
        // Fly to the municipality with dynamic zoom and 40-degree tilt
        mapInstance.flyTo({
          center: cameraOptions.center,
          zoom: cameraOptions.zoom,
          pitch: 40,  // 40-degree camera tilt
          bearing: 0,
          padding: sidebarPadding,
          duration: ANIMATION_CONFIG.FLY_TO_DURATION,  // Smooth animation duration (usually 2000ms)
          essential: true,
          // Optional: Add easing for smoother animation
          easing: (t) => t * (2 - t)  // Ease-out quadratic
        })
      }
    }
  }
}
```

## What This Does

### Zoom Animation Features:
1. **Dynamic Zoom** - Each municipality gets its own perfect zoom level based on size
   - Larger municipalities (Virac, Bato) = zooms out more
   - Smaller municipalities (Pandan, Caramoran) = zooms in closer

2. **40-Degree Tilt** - Camera tilts to 40 degrees for a 3D perspective view
   - Shows terrain elevation
   - Gives depth to buildings and 3D models
   - Creates cinematic effect

3. **Smooth Animation** - Uses `flyTo` with easing function
   - Duration: 2 seconds (from `ANIMATION_CONFIG.FLY_TO_DURATION`)
   - Easing: Ease-out quadratic for natural deceleration
   - Essential: true (animation won't be interrupted)

4. **Smart Padding** - Accounts for open itinerary sidebar
   - Centers municipality considering sidebar width
   - POIs remain visible and not hidden by sidebar

## Visual Effect

**Before Click:**
- Camera at default position (looking down)
- Whole province visible

**After Click:**
- Camera smoothly flies to municipality
- Tilts to 40° angle
- Zooms to show all POIs in that municipality
- Border highlights around municipality

## Testing

1. Pull changes: `git pull origin main`
2. Add the import and function above to `Discover.tsx`
3. Restart: `npm run dev`
4. Click any municipality on the map
5. Watch the smooth zoom + tilt animation

## Animation Parameters Explained

```typescript
pitch: 40          // Camera tilt (0 = top-down, 60 = max tilt)
bearing: 0         // North-facing (0°)
duration: 2000     // 2 seconds animation
easing: (t) => ... // Smooth deceleration curve
```

## Customization Options

### Want faster animation?
```typescript
duration: 1500  // 1.5 seconds
```

### Want more dramatic tilt?
```typescript
pitch: 50  // Even more 3D perspective
```

### Want different easing?
```typescript
// Ease-in-out (starts slow, speeds up, slows down)
easing: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t

// Linear (constant speed)
easing: (t) => t

// Ease-out cubic (faster start, slower end)
easing: (t) => (--t) * t * t + 1
```

## Troubleshooting

**Animation not smooth?**
- Check if terrain is enabled (3D terrain affects animation)
- Disable terrain temporarily to test

**Camera angle looks wrong?**
- Verify pitch is set to 40 (not 45 or other value)
- Check if pitch is being overridden elsewhere

**Zoom level too close/far?**
- The `calculateCameraOptions` function automatically adjusts
- Smaller municipalities will naturally zoom in more
- Larger municipalities will zoom out more

**Municipality not centering correctly?**
- Check padding calculations in `getPaddingForSidebar()`
- Ensure itinerary sidebar width is correct
