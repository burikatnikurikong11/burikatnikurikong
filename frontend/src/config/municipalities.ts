export const MUNICIPALITY_GEOCODES = {
  BAGAMANOC: '052001000',
  BARAS: '052002000',
  BATO: '083707000',
  CARAMORAN: '052004000',
  GIGMOTO: '052005000',
  PANDAN: '060611000',
  PANGANIBAN: '052007000',
  SAN_ANDRES: '175912000',
  SAN_MIGUEL: '166816000',
  VIGA: '052010000',
  VIRAC: '052011000',
} as const

export const MUNICIPALITY_FILES: Record<string, string> = {
  '052001000': 'bagamanoc.geojson',
  '052002000': 'baras.geojson',
  '083707000': 'BATO.geojson',
  '052004000': 'caramoran.geojson',
  '052005000': 'gigmoto.geojson',
  '060611000': 'pandan.geojson',
  '052007000': 'panganiban.geojson',
  '175912000': 'san_andres.geojson',
  '166816000': 'san_miguel.geojson',
  '052010000': 'viga.geojson',
  '052011000': 'VIRAC.geojson',
}

export const MUNICIPALITY_NAMES: Record<string, string> = {
  '052001000': 'BAGAMANOC',
  '052002000': 'BARAS',
  '083707000': 'BATO',
  '052004000': 'CARAMORAN',
  '052005000': 'GIGMOTO',
  '060611000': 'PANDAN',
  '052007000': 'PANGANIBAN',
  '175912000': 'SAN ANDRES',
  '166816000': 'SAN MIGUEL',
  '052010000': 'VIGA',
  '052011000': 'VIRAC',
}
