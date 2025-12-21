# Discover.tsx Update Instructions

## Changes Required

To complete the implementation, manually update `frontend/src/routes/Discover.tsx`:

### 1. Update Imports (Lines 1-22)

**REMOVE these imports:**
```typescript
import MunicipalityInfoBadge from '../components/MunicipalityInfoBadge'
import MunicipalityInfoModal from '../components/MunicipalityInfoModal'
import ResetCameraButton from '../components/ResetCameraButton'
```

**ADD this import:**
```typescript
import MapControls from '../components/MapControls'
```

### 2. Remove State (Around line 47)

**REMOVE this line:**
```typescript
const [isMunicipalityModalOpen, setIsMunicipalityModalOpen] = useState(false)
```

### 3. Update handleResetCamera function (Around line 116)

**REMOVE this line from the function:**
```typescript
setIsMunicipalityModalOpen(false)
```

The function should look like:
```typescript
const handleResetCamera = useCallback(() => {
  if (!map) return

  setSelectedMunicipalityGeocode(null)
  setSelectedPlace(null)
  setHoveredPlace(null)
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
```

### 4. Replace Components in JSX (Around lines 700-730)

**REMOVE:**
```typescript
<ResetCameraButton onClick={handleResetCamera} isSidebarOpen={isSidebarOpen} isMobile={isMobile} />

{/* Municipality Info Badge */}
{selectedMunicipalityGeocode && !isMobile && (
  <MunicipalityInfoBadge
    geocode={selectedMunicipalityGeocode}
    touristSpotCount={filteredModels.length}
    onViewInfo={() => setIsMunicipalityModalOpen(true)}
    onClose={() => {
      setSelectedMunicipalityGeocode(null)
      selectedMunicipalityRef.current = null
      setIsTooltipVisible(true)
    }}
  />
)}

{/* Municipality Info Modal */}
{isMunicipalityModalOpen && selectedMunicipalityGeocode && (
  <MunicipalityInfoModal
    geocode={selectedMunicipalityGeocode}
    touristSpots={filteredModels}
    onClose={() => setIsMunicipalityModalOpen(false)}
    onSpotClick={(spotId) => {
      setSelectedTouristSpot(spotId)
      setIsTooltipVisible(false)
    }}
  />
)}
```

**REPLACE WITH:**
```typescript
{/* Map Controls (Map Style, Current Location, Reset Camera) */}
<MapControls 
  onResetCamera={handleResetCamera}
  isSidebarOpen={isSidebarOpen}
  isMobile={isMobile}
/>
```

## Summary

These changes will:
- ✅ Remove the annoying municipality info modal/badge
- ✅ Add the new vertical map controls (Map Style, Current Location, Reset Camera)
- ✅ Keep municipality selection for filtering attractions
- ✅ Keep toast notifications when selecting municipalities

## Result

After these changes:
- Clicking a municipality will still filter and show attractions via toast notification
- No modal/badge will appear
- Clean map controls in top-right corner
- Chatbot is now a bubble in bottom-right
- Itinerary sidebar replaces the old chatbot sidebar
