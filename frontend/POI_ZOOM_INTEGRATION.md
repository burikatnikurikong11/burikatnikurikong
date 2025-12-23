# POI Marker Zoom Functionality Integration Guide

This guide explains how to integrate the zoom-in functionality for POI markers across all municipalities in Catanduanes.

## Overview

The zoom functionality has been added to allow users to zoom into specific POI (Point of Interest) markers when clicked. This feature works for all 11 municipalities in Catanduanes:

- Bagamanoc
- Baras
- Bato
- Caramoran
- Gigmoto
- Pandan
- Panganiban (Payo)
- San Andres
- San Miguel
- Viga
- Virac (Capital)

## Files Added/Modified

### New Files
1. **`frontend/src/utils/mapZoom.ts`** - Core zoom utility functions

### Modified Files
1. **`frontend/src/components/MunicipalityModal.tsx`** - Updated to pass coordinates and category

## Integration Steps

### Step 1: Import Required Dependencies in App.tsx

Add the following imports to your `App.tsx` file:

```typescript
import { useRef } from 'react';
import { createZoomToMarker, getZoomConfigForCategory } from './utils/mapZoom';
```

### Step 2: Create Map Reference and Zoom Function

Add a ref for the map and create the zoom function:

```typescript
function App() {
  const mapRef = useRef<any>(null);
  const zoomToMarker = createZoomToMarker(mapRef);

  // ... rest of your code
}
```

### Step 3: Update the Spot Click Handler

Modify your `onSpotClick` handler to support zoom functionality:

```typescript
const handleSpotClick = (
  modelId: string, 
  coordinates?: [number, number], 
  category?: string
) => {
  // Zoom to the marker if coordinates are provided
  if (coordinates) {
    const zoomConfig = getZoomConfigForCategory(category);
    zoomToMarker({
      coordinates,
      ...zoomConfig
    });
  }
  
  // Handle other spot click logic (e.g., show info panel)
  setSelectedSpotId(modelId);
};
```

### Step 4: Pass the Handler to MunicipalityModal

Ensure your `MunicipalityModal` component receives the updated handler:

```typescript
<MunicipalityModal
  municipalityGeocode={selectedMunicipality}
  models={municipalityModels}
  onClose={() => setSelectedMunicipality(null)}
  onSpotClick={handleSpotClick}
/>
```

### Step 5: Add Map Reference to DeckGL Component

Attach the ref to your DeckGL component:

```typescript
<DeckGL
  ref={mapRef}
  // ... other props
/>
```

## Zoom Configuration Options

The zoom utility supports different configurations based on POI category:

### Beach POIs
- Zoom Level: 16
- Pitch: 45°
- Duration: 1200ms

### Mountain POIs
- Zoom Level: 15
- Pitch: 60°
- Duration: 1400ms

### Cultural POIs
- Zoom Level: 17
- Pitch: 50°
- Duration: 1000ms

### Default (Other Categories)
- Zoom Level: 16
- Pitch: 45°
- Duration: 1000ms

## Custom Zoom Configuration

You can override the default zoom settings:

```typescript
zoomToMarker({
  coordinates: [124.2345, 13.6789],
  zoomLevel: 18,      // Closer zoom
  pitch: 70,          // Steeper angle
  bearing: 45,        // Rotate map
  duration: 1500      // Slower animation
});
```

## Testing

After integration, test the following:

1. ✅ Click on POI markers in the MunicipalityModal
2. ✅ Verify smooth zoom animation occurs
3. ✅ Test across all 11 municipalities
4. ✅ Test different POI categories (Beach, Mountain, Cultural)
5. ✅ Verify zoom level is appropriate for each category
6. ✅ Check that the map centers correctly on the POI

## Example Complete Implementation

```typescript
import { useRef, useState } from 'react';
import DeckGL from '@deck.gl/react';
import { createZoomToMarker, getZoomConfigForCategory } from './utils/mapZoom';
import MunicipalityModal from './components/MunicipalityModal';

function App() {
  const mapRef = useRef<any>(null);
  const [selectedMunicipality, setSelectedMunicipality] = useState<string | null>(null);
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  
  const zoomToMarker = createZoomToMarker(mapRef);

  const handleSpotClick = (
    modelId: string, 
    coordinates?: [number, number], 
    category?: string
  ) => {
    // Zoom to marker
    if (coordinates) {
      const zoomConfig = getZoomConfigForCategory(category);
      zoomToMarker({
        coordinates,
        ...zoomConfig
      });
    }
    
    // Update selected spot
    setSelectedSpotId(modelId);
  };

  return (
    <div className="app">
      <DeckGL
        ref={mapRef}
        initialViewState={{
          longitude: 124.2,
          latitude: 13.7,
          zoom: 10,
          pitch: 0,
          bearing: 0
        }}
        controller={true}
      >
        {/* Your map layers */}
      </DeckGL>

      {selectedMunicipality && (
        <MunicipalityModal
          municipalityGeocode={selectedMunicipality}
          models={municipalityModels}
          onClose={() => setSelectedMunicipality(null)}
          onSpotClick={handleSpotClick}
        />
      )}
    </div>
  );
}

export default App;
```

## Troubleshooting

### Zoom Not Working
- Ensure `mapRef` is properly attached to the DeckGL component
- Verify coordinates are in `[longitude, latitude]` format
- Check browser console for error messages

### Incorrect Zoom Level
- Verify the POI category is correctly set
- Check the zoom level in the configuration matches your needs
- Use custom zoom configuration if defaults don't work

### Animation Too Fast/Slow
- Adjust the `duration` parameter in milliseconds
- Try values between 800-2000ms for best results

## Additional Features

You can extend the functionality by:

1. Adding zoom buttons to individual POI cards
2. Implementing "fly to" animation from current position
3. Adding zoom history/breadcrumbs
4. Supporting zoom on search results
5. Adding zoom controls to the map interface

## Support

For issues or questions, check:
- `frontend/src/utils/mapZoom.ts` - Core implementation
- `frontend/src/components/MunicipalityModal.tsx` - Modal integration
- DeckGL documentation: https://deck.gl/

---

**Last Updated:** December 23, 2025
**Version:** 1.0
