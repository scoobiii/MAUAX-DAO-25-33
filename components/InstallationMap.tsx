import React, { useEffect, useRef } from 'react';
import * as L from 'leaflet';
import { scaleSequential, interpolateRdYlGn, extent } from 'd3';
import { Installation } from '../types';

type ColorByKey = keyof Pick<Installation, 'efficiency' | 'capacity' | 'age' | 'roi' | 'capex' | 'opex'>;

interface InstallationMapProps {
    installations: Installation[];
    colorBy: ColorByKey;
}

const InstallationMap: React.FC<InstallationMapProps> = ({ installations, colorBy }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);
    const layerGroup = useRef<L.LayerGroup | null>(null);

    useEffect(() => {
        if (!mapRef.current) return;

        // Initialize map only once
        if (!mapInstance.current) {
            mapInstance.current = L.map(mapRef.current).setView([-23.6675, -46.4608], 13);
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 20
            }).addTo(mapInstance.current);
            layerGroup.current = L.layerGroup().addTo(mapInstance.current);
        }
        
        // Cleanup function to run when the component unmounts
        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!mapInstance.current || !layerGroup.current || installations.length === 0) return;

        // Clear previous markers
        layerGroup.current.clearLayers();

        // Create color scale (same as Treemap)
        const colorDomain = extent(installations, d => d[colorBy]) as [number, number];
        const colorScale = scaleSequential(interpolateRdYlGn);
        if (['age', 'capex', 'opex'].includes(colorBy)) {
            colorScale.domain([colorDomain[1], colorDomain[0]]);
        } else {
            colorScale.domain(colorDomain);
        }

        // Add new markers
        installations.forEach(inst => {
            // Calculate the radius of a circle with an area equal to the installation's capacity.
            // Add a scaling factor to make them more visible at city-level zoom.
            const radiusInMeters = Math.sqrt(inst.capacity / Math.PI);
            const scaledRadius = radiusInMeters * 15;

            const marker = L.circle([inst.lat, inst.lng], {
                radius: scaledRadius,
                fillColor: colorScale(inst[colorBy]),
                color: '#1a202c',
                weight: 0.5,
                opacity: 1,
                fillOpacity: 0.7
            });

            const popupContent = `
                <div class="text-gray-800">
                    <b class="text-accent">${inst.id}</b><br>
                    <b>Setor:</b> ${inst.setor}<br>
                    <b>Capacidade:</b> ${inst.capacity.toFixed(0)} m²<br>
                    <b>Eficiência:</b> ${inst.efficiency.toFixed(1)}%<br>
                    <b>ROI:</b> ${inst.roi.toFixed(1)}%
                </div>
            `;
            marker.bindPopup(popupContent);
            
            layerGroup.current?.addLayer(marker);
        });
    }, [installations, colorBy]);

    return <div ref={mapRef} className="w-full h-[600px] rounded-lg bg-gray-800" />;
};

export default InstallationMap;