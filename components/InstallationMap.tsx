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

        // Clear previous layers
        layerGroup.current.clearLayers();

        const colorDomain = extent(installations, d => d[colorBy]) as [number, number];
        const colorScale = scaleSequential(interpolateRdYlGn);
        if (['age', 'capex', 'opex'].includes(colorBy)) {
            colorScale.domain([colorDomain[1], colorDomain[0]]);
        } else {
            colorScale.domain(colorDomain);
        }

        installations.forEach(inst => {
            const area = inst.capacity; // in m^2
            const aspectRatio = 0.7 + Math.random() * 0.6; // Keep it somewhat squarish
            const widthMeters = Math.sqrt(area * aspectRatio);
            const heightMeters = area / widthMeters;

            const metersPerDegreeLat = 111132;
            const metersPerDegreeLng = 111320 * Math.cos(inst.lat * Math.PI / 180);

            const widthDeg = widthMeters / metersPerDegreeLng;
            const heightDeg = heightMeters / metersPerDegreeLat;

            const angle = Math.random() * Math.PI;
            const cosAngle = Math.cos(angle);
            const sinAngle = Math.sin(angle);
            
            const rotate = (x_deg: number, y_deg: number) => ({
                lng: x_deg * cosAngle - y_deg * sinAngle,
                lat: x_deg * sinAngle + y_deg * cosAngle,
            });

            const halfWidth = widthDeg / 2;
            const halfHeight = heightDeg / 2;
            
            const p1 = rotate(-halfWidth, -halfHeight);
            const p2 = rotate(halfWidth, -halfHeight);
            const p3 = rotate(halfWidth, halfHeight);
            const p4 = rotate(-halfWidth, halfHeight);

            const polygonCoords: L.LatLngExpression[] = [
                [inst.lat + p1.lat, inst.lng + p1.lng],
                [inst.lat + p2.lat, inst.lng + p2.lng],
                [inst.lat + p3.lat, inst.lng + p3.lng],
                [inst.lat + p4.lat, inst.lng + p4.lng],
            ];
            
            const polygon = L.polygon(polygonCoords, {
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
            polygon.bindPopup(popupContent);
            
            layerGroup.current?.addLayer(polygon);
        });
    }, [installations, colorBy]);

    return <div ref={mapRef} className="w-full h-[600px] rounded-lg bg-gray-800" />;
};

export default InstallationMap;