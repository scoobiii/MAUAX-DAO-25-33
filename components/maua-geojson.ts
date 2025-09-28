import { FeatureCollection } from 'geojson';

// Simplified GeoJSON for Mauá neighborhoods, sourced from open data and adapted for this application.
// Original data may be under an open license. Ensure compliance if used in production.
export const mauaGeoJson: FeatureCollection = {
  "type": "FeatureCollection",
  "name": "maua_bairros",
  "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
  "features": [
    { "type": "Feature", "properties": { "NM_BAIRRO": "Jardim Zaíra" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -46.467, -23.69 ], [ -46.452, -23.702 ], [ -46.441, -23.693 ], [ -46.454, -23.681 ], [ -46.467, -23.69 ] ] ] } },
    { "type": "Feature", "properties": { "NM_BAIRRO": "Parque São Vicente" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -46.48, -23.673 ], [ -46.468, -23.688 ], [ -46.456, -23.679 ], [ -46.45, -23.665 ], [ -46.469, -23.657 ], [ -46.48, -23.673 ] ] ] } },
    { "type": "Feature", "properties": { "NM_BAIRRO": "Vila Magini" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -46.467, -23.656 ], [ -46.449, -23.664 ], [ -46.44, -23.656 ], [ -46.457, -23.646 ], [ -46.467, -23.656 ] ] ] } },
    { "type": "Feature", "properties": { "NM_BAIRRO": "Jardim Itapark" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -46.448, -23.665 ], [ -46.43, -23.675 ], [ -46.425, -23.663 ], [ -46.44, -23.655 ], [ -46.448, -23.665 ] ] ] } },
    { "type": "Feature", "properties": { "NM_BAIRRO": "Centro" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -46.46, -23.67 ], [ -46.457, -23.665 ], [ -46.46, -23.66 ], [ -46.465, -23.667 ], [ -46.46, -23.67 ] ] ] } },
    { "type": "Feature", "properties": { "NM_BAIRRO": "Vila Assis Brasil" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -46.472, -23.65 ], [ -46.46, -23.655 ], [ -46.458, -23.645 ], [ -46.47, -23.64 ], [ -46.472, -23.65 ] ] ] } },
    { "type": "Feature", "properties": { "NM_BAIRRO": "Jardim Sônia Maria" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -46.495, -23.645 ], [ -46.48, -23.65 ], [ -46.471, -23.639 ], [ -46.485, -23.63 ], [ -46.495, -23.645 ] ] ] } },
    { "type": "Feature", "properties": { "NM_BAIRRO": "Parque das Américas" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -46.44, -23.64 ], [ -46.43, -23.645 ], [ -46.425, -23.635 ], [ -46.435, -23.63 ], [ -46.44, -23.64 ] ] ] } },
    { "type": "Feature", "properties": { "NM_BAIRRO": "Jardim Guapituba" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -46.424, -23.662 ], [ -46.41, -23.67 ], [ -46.405, -23.66 ], [ -46.42, -23.652 ], [ -46.424, -23.662 ] ] ] } },
    { "type": "Feature", "properties": { "NM_BAIRRO": "Sertãozinho" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -46.44, -23.71 ], [ -46.42, -23.72 ], [ -46.41, -23.705 ], [ -46.43, -23.695 ], [ -46.44, -23.71 ] ] ] } }
  ]
}
