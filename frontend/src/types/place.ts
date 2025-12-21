export interface Place {
  name: string
  coordinates: [number, number]
  municipality: string
  description?: string
  category?: string // beaches, nature, food, accommodation, activities, culture
  type?: string // Original type from GeoJSON (HOTELS & RESORTS, RESTAURANTS & CAFES, etc.)
  size?: number
  showAtZoom?: number
}
