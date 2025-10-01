import React, { useEffect, useRef, useMemo } from 'react';
import * as L from 'leaflet';
import { Installation } from '../types';
import { mauaGeoJson } from './maua-geojson';
import { scaleQuantize, interpolateYlOrRd, extent, geoContains } from 'd3';
import { Feature, FeatureCollection } from 'geojson';

// Fix for default Leaflet icon path issues with bundlers
try {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
} catch (e) {
    console.error("Could not apply Leaflet icon fix", e);
}

type Metric = keyof Pick<Installation, 'efficiency' | 'capacity' | 'age' | 'roi' | 'capex' | 'opex' | 'carbonOffset'>;

interface ChoroplethMapProps {
    installations: Installation[];
    metric: Metric;
}

const METRIC_CONFIG = {
    capacity: { label: 'Capacidade Total (m²)', type: 'sum', format: (v: number) => v.toLocaleString('pt-BR', { maximumFractionDigits: 0 }) },
    efficiency: { label: 'Eficiência Média (%)', type: 'avg', format: (v: number) => v.toFixed(1) },
    age: { label: 'Idade Média (anos)', type: 'avg', format: (v: number) => v.toFixed(1) },
    roi: { label: 'ROI Médio (%)', type: 'avg', format: (v: number) => v.toFixed(1) },
    capex: { label: 'CAPEX Médio (R$)', type: 'avg', format: (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) },
    opex: { label: 'OPEX Médio (R$)', type: 'avg', format: (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) },
    carbonOffset: { label: 'CO₂ Offset Total (kg)', type: 'sum', format: (v: number) => v.toLocaleString('pt-BR', { maximumFractionDigits: 0 }) },
};


const ChoroplethMap: React.FC<ChoroplethMapProps> = ({ installations, metric }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
    const legendControlRef = useRef<L.Control | null>(null);

    const processedGeoData = useMemo(() => {
        // Deep copy to avoid mutating the original geojson object
        const geoJson: FeatureCollection = JSON.parse(JSON.stringify(mauaGeoJson));
        
        // Initialize aggregation properties on each feature
        geoJson.features.forEach(feature => {
            if (!feature.properties) feature.properties = {};
            feature.properties.count = 0;
            Object.keys(METRIC_CONFIG).forEach(key => {
                feature.properties![`total_${key}`] = 0;
            });
        });

        // Aggregate data
        installations.forEach(inst => {
            const point: [number, number] = [inst.lng, inst.lat];
            const containingFeature = geoJson.features.find(feature => geoContains(feature, point));

            if (containingFeature) {
                containingFeature.properties!.count++;
                Object.keys(METRIC_CONFIG).forEach(key => {
                    containingFeature.properties![`total_${key}`] += inst[key as Metric] || 0;
                });
            }
        });
        
        // Calculate final metric value for each feature
        geoJson.features.forEach(feature => {
            const props = feature.properties!;
            const config = METRIC_CONFIG[metric];
            if (config.type === 'avg' && props.count > 0) {
                props.metricValue = props[`total_${metric}`] / props.count;
            } else {
                props.metricValue = props[`total_${metric}`];
            }
        });
        
        const featuresWithData = geoJson.features.filter(f => f.properties!.count > 0 && f.properties!.metricValue !== undefined);
        const metricDomain = extent(featuresWithData, f => f.properties!.metricValue) as [number, number];

        const colorScale = scaleQuantize<string>()
            .domain(metricDomain[0] === undefined ? [0,1] : metricDomain)
            .range(interpolateYlOrRd(0.9).split(',').slice(1,8)); // Use D3 9-color scheme, skipping lightest colors

        return { geoJson, colorScale };

    }, [installations, metric]);

    useEffect(() => {
        if (mapContainerRef.current && !mapInstanceRef.current) {
            const map = L.map(mapContainerRef.current, {
                center: [-23.6675, -46.4608],
                zoom: 13,
                attributionControl: false,
            });
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            }).addTo(map);
            mapInstanceRef.current = map;
        }

        const map = mapInstanceRef.current;
        if (!map) return;

        // Remove old layers and controls
        if (geoJsonLayerRef.current) {
            map.removeLayer(geoJsonLayerRef.current);
        }
        if (legendControlRef.current) {
            map.removeControl(legendControlRef.current);
        }

        const { geoJson, colorScale } = processedGeoData;
        
        // Add GeoJSON Layer
        geoJsonLayerRef.current = L.geoJSON(geoJson, {
            style: (feature) => {
                const value = feature?.properties.metricValue;
                const count = feature?.properties.count;
                const color = (count > 0 && value !== undefined) ? colorScale(value) : '#4A5568'; // Dark gray for no data
                return {
                    fillColor: color,
                    weight: 1.5,
                    opacity: 1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.7
                };
            },
            onEachFeature: (feature, layer) => {
                const props = feature.properties;
                const config = METRIC_CONFIG[metric];
                const valueText = props.count > 0 && props.metricValue !== undefined ? config.format(props.metricValue) : 'N/A';
                
                const popupContent = `
                    <div class="p-1">
                        <h3 class="font-bold text-base mb-1">${props.NM_BAIRRO || 'Bairro Desconhecido'}</h3>
                        <p><strong>${config.label}:</strong> ${valueText}</p>
                        <p><strong>Instalações na amostra:</strong> ${props.count}</p>
                    </div>
                `;
                layer.bindPopup(popupContent);

                layer.on({
                    mouseover: (e) => e.target.setStyle({ weight: 3, color: '#4299e1', fillOpacity: 0.9 }),
                    mouseout: (e) => geoJsonLayerRef.current?.resetStyle(e.target)
                });
            }
        }).addTo(map);

        // Add Legend Control
        const legend = new L.Control({ position: 'bottomright' });
        legend.onAdd = () => {
            const div = L.DomUtil.create('div', 'info legend bg-gray-800 bg-opacity-80 p-3 rounded-md text-white');
            const grades = colorScale.thresholds();
            const colors = colorScale.range();
            const config = METRIC_CONFIG[metric];
            
            let legendHtml = `<h4 class="font-bold text-sm mb-2">${config.label}</h4>`;

            if (grades && grades.length > 0) {
                // Lower bound
                legendHtml += `<div class="flex items-center my-1"><i class="w-4 h-4 mr-2" style="background:${colors[0]}"></i> &lt; ${config.format(grades[0])}</div>`;

                // Middle ranges
                for (let i = 0; i < grades.length - 1; i++) {
                    legendHtml += `<div class="flex items-center my-1"><i class="w-4 h-4 mr-2" style="background:${colors[i + 1]}"></i> ${config.format(grades[i])} &ndash; ${config.format(grades[i + 1])}</div>`;
                }

                // Upper bound
                const lastGradeIndex = grades.length - 1;
                legendHtml += `<div class="flex items-center my-1"><i class="w-4 h-4 mr-2" style="background:${colors[lastGradeIndex + 1]}"></i> &ge; ${config.format(grades[lastGradeIndex])}</div>`;
            } else {
                 // Handle case with no thresholds (e.g., all data is the same value)
                 const domain = colorScale.domain();
                 if (domain[0] !== undefined && domain[1] !== undefined) {
                     const valueText = domain[0] === domain[1] 
                        ? config.format(domain[0]) 
                        : `${config.format(domain[0])} &ndash; ${config.format(domain[1])}`;
                    legendHtml += `<div class="flex items-center my-1"><i class="w-4 h-4 mr-2" style="background:${colors[0]}"></i> ${valueText}</div>`;
                 }
            }

            legendHtml += `<div class="flex items-center my-1"><i class="w-4 h-4 mr-2 bg-gray-600"></i> Sem Dados</div>`;
            div.innerHTML = legendHtml;

            return div;
        };
        legend.addTo(map);
        legendControlRef.current = legend;

    }, [processedGeoData, metric]);

    return <div ref={mapContainerRef} className="h-[600px] w-full rounded-lg" />;
};

export default ChoroplethMap;