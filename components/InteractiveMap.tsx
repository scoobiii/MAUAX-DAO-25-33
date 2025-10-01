import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as L from 'leaflet';
import { Installation } from '../types';
import { group, polygonHull, scaleOrdinal, schemeCategory10, contourDensity, scaleSequential, max as d3Max, interpolateYlOrRd } from 'd3';
import { SearchIcon, FireIcon } from './icons';

// Corrige um problema comum com o caminho dos ícones padrão do Leaflet ao usar ESM/bundlers
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


interface InteractiveMapProps {
    installations: Installation[];
    activeSector: string;
    onSectorSelect: (sector: string) => void;
    onInstallationSelect: (installation: Installation) => void;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ installations, activeSector, onSectorSelect, onInstallationSelect }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markersLayerRef = useRef<L.LayerGroup>(L.layerGroup());
    const polygonsLayerRef = useRef<L.LayerGroup>(L.layerGroup());
    const heatmapLayerRef = useRef<L.LayerGroup>(L.layerGroup());
    
    const [searchTerm, setSearchTerm] = useState('');
    const [showHeatmap, setShowHeatmap] = useState(false);

    const filteredInstallations = useMemo(() => {
        let items = installations;

        if (activeSector !== 'all') {
            items = items.filter(inst => inst.setor === activeSector);
        }

        if (searchTerm) {
            const lowercasedTerm = searchTerm.toLowerCase();
            return items.filter(inst => 
                inst.id.toLowerCase().includes(lowercasedTerm) ||
                inst.setor.toLowerCase().includes(lowercasedTerm) ||
                inst.tamanho.toLowerCase().includes(lowercasedTerm)
            );
        }
        return items;
    }, [installations, activeSector, searchTerm]);

    useEffect(() => {
        if (mapContainerRef.current && !mapInstanceRef.current) {
            const map = L.map(mapContainerRef.current).setView([-23.6675, -46.4608], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            // Create a custom pane for the heatmap layer to control its z-index
            if (!map.getPane('heatmapPane')) {
                map.createPane('heatmapPane');
                const pane = map.getPane('heatmapPane');
                if (pane) pane.style.zIndex = 350; // Below markers (400) but above tiles (200)
            }

            mapInstanceRef.current = map;
            polygonsLayerRef.current.addTo(map);
            heatmapLayerRef.current.addTo(map);
            markersLayerRef.current.addTo(map);
        }
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;

        const allPoints: L.LatLngExpression[] = installations.map(i => [i.lat, i.lng]);
        const allInstallationsBounds = L.latLngBounds(allPoints);

        polygonsLayerRef.current.clearLayers();
        const sectorGroups = group(installations, d => d.setor);
        const sectorColors = scaleOrdinal(schemeCategory10).domain(Array.from(sectorGroups.keys()));

        sectorGroups.forEach((insts, setor) => {
            if (insts.length < 3) return;
            const points: [number, number][] = insts.map(i => [i.lng, i.lat]);
            const hull = polygonHull(points);
            if (hull) {
                const isSelected = setor === activeSector;
                const leafletCoords: [number, number][] = hull.map(([lng, lat]) => [lat, lng]);
                const polygon = L.polygon(leafletCoords, {
                    color: sectorColors(setor),
                    weight: isSelected ? 4 : 2,
                    fillOpacity: isSelected ? 0.3 : 0.1,
                    className: 'cursor-pointer'
                })
                    .bindPopup(`<b>Setor: ${setor}</b><br>${insts.length} instalações na amostra<br><em>Clique para filtrar ou clique novamente para limpar</em>`)
                    .addTo(polygonsLayerRef.current);
                
                polygon.on('click', () => {
                    const isCurrentlySelected = setor === activeSector;
                    onSectorSelect(isCurrentlySelected ? 'all' : setor);
                    
                    if (!isCurrentlySelected) {
                        map.fitBounds(polygon.getBounds(), { padding: [50, 50], maxZoom: 15 });
                    } else if (allInstallationsBounds.isValid()) {
                        map.fitBounds(allInstallationsBounds, { padding: [50, 50] });
                    }
                });
            }
        });

        // Handle heatmap layer
        heatmapLayerRef.current.clearLayers();
        if (showHeatmap && installations.length > 2) {
            try {
                const mapSize = map.getSize();
                const densityEstimator = contourDensity<Installation>()
                    .x(d => map.latLngToLayerPoint(L.latLng(d.lat, d.lng)).x)
                    .y(d => map.latLngToLayerPoint(L.latLng(d.lat, d.lng)).y)
                    .weight(d => d.capacity)
                    .size([mapSize.x, mapSize.y])
                    .bandwidth(35)
                    .thresholds(20);

                const densityData = densityEstimator(installations);
                const maxDensity = d3Max(densityData, d => d.value) || 1;
                const heatmapColorScale = scaleSequential(interpolateYlOrRd).domain([0, maxDensity * 0.8]);

                densityData.forEach(contour => {
                    const latLngs = contour.coordinates.map(polygon =>
                        polygon.map(ring =>
                            ring.map(([x, y]) => {
                                const latLng = map.layerPointToLatLng(L.point(x, y));
                                return [latLng.lat, latLng.lng];
                            })
                        )
                    );
                    
                    L.polygon(latLngs as L.LatLngExpression[][][], {
                        fillColor: heatmapColorScale(contour.value),
                        weight: 0,
                        fillOpacity: 0.6,
                        pane: 'heatmapPane'
                    }).addTo(heatmapLayerRef.current);
                });
            } catch(e) {
                console.error("Erro ao gerar o mapa de calor:", e);
            }
        }

        markersLayerRef.current.clearLayers();
        filteredInstallations.forEach(inst => {
            const marker = L.marker([inst.lat, inst.lng]);
            const tooltipContent = `
                <div class="p-1 font-sans">
                    <h3 class="font-bold text-sm mb-1">Instalação ${inst.id}</h3>
                    <p><strong>Setor:</strong> ${inst.setor}</p>
                    <p><strong>Tamanho:</strong> ${inst.tamanho}</p>
                    <hr class="my-1 border-gray-200 dark:border-gray-600">
                    <p><strong>Capacidade:</strong> ${inst.capacity.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} m²</p>
                    <p><strong>Eficiência:</strong> ${inst.efficiency.toFixed(1)}%</p>
                </div>
            `;
            marker.bindPopup(tooltipContent, { closeButton: false, minWidth: 200 });
            marker.on('mouseover', function () { this.openPopup(); });
            marker.on('mouseout', function () { this.closePopup(); });
            marker.on('click', () => onInstallationSelect(inst));
            marker.addTo(markersLayerRef.current);
        });

    }, [installations, filteredInstallations, activeSector, onSectorSelect, onInstallationSelect, showHeatmap]);

    return (
        <div className="relative h-[600px] w-full">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-lg px-4 flex items-center gap-2">
                <div className="relative flex-grow">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por ID, setor, tamanho..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-md bg-white dark:bg-dark-card shadow-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                </div>
                 <button
                    onClick={() => setShowHeatmap(s => !s)}
                    className={`p-2 rounded-md shadow-lg transition-colors ${
                        showHeatmap ? 'bg-accent text-white' : 'bg-white dark:bg-dark-card text-gray-700 dark:text-gray-300'
                    }`}
                    title={showHeatmap ? "Ocultar Mapa de Calor" : "Mostrar Mapa de Calor"}
                    aria-label="Alternar mapa de calor"
                    aria-pressed={showHeatmap}
                >
                    <FireIcon className="w-5 h-5" />
                </button>
            </div>
            <div ref={mapContainerRef} className="h-full w-full rounded-lg" />
        </div>
    );
};

export default InteractiveMap;