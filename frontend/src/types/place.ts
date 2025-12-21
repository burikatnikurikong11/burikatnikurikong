export interface PlaceProperties {
  name: string
  type: string
  description: string
  municipality: string
  size: number
  showAtZoom: number
  image?: string
}

export interface PlaceFeature {
  type: 'Feature'
  properties: PlaceProperties
  geometry: {
    type: 'Point'
    coordinates: [number, number]
  }
}

export interface PlaceCollection {
  type: 'FeatureCollection'
  features: PlaceFeature[]
}

export interface Place {
  id: string
  name: string
  type: string
  description: string
  municipality: string
  coordinates: [number, number]
  size: number
  showAtZoom: number
  image?: string
}

export type PlaceCategory = 
  | 'surfing' 
  | 'waterfall' 
  | 'beach' 
  | 'cultural' 
  | 'restaurant'
  | 'viewpoint'
  | 'cave'
  | 'general';

export interface PlaceProperties {
  name: string
  type: string
  category: PlaceCategory
  description: string
  municipality: string
  size: number
  showAtZoom: number
  image?: string
  thumbnail?: string
}

export interface PlaceFeature {
  type: 'Feature'
  properties: PlaceProperties
  geometry: {
    type: 'Point'
    coordinates: [number, number]
  }
}

export interface PlaceCollection {
  type: 'FeatureCollection'
  features: PlaceFeature[]
}

export interface Place {
  id: string
  name: string
  type: string
  category: PlaceCategory
  description: string
  municipality: string
  coordinates: [number, number]
  size: number
  showAtZoom: number
  image?: string
  thumbnail?: string
}

export interface ClusterProperties {
  cluster: boolean
  cluster_id: number
  point_count: number
  point_count_abbreviated: string
  dominantCategory?: PlaceCategory
}
