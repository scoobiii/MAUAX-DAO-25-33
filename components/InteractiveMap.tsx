import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as L from 'leaflet';
import { Installation } from '../types';
import { group, polygonHull, scaleOrdinal, schemeCategory10 } from 'd3';
import { SearchIcon } from './icons';

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
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ installations }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markersLayerRef = useRef<L.LayerGroup>(L.layerGroup());
    const polygonsLayerRef = useRef<L.LayerGroup>(L.layerGroup());
    const [searchTerm, setSearchTerm] = useState('');

    const filteredInstallations = useMemo(() => {
        if (!searchTerm) return installations;
        const lowercasedTerm = searchTerm.toLowerCase();
        return installations.filter(inst => 
            inst.id.toLowerCase().includes(lowercasedTerm) ||
            inst.setor.toLowerCase().includes(lowercasedTerm) ||
            inst.tamanho.toLowerCase().includes(lowercasedTerm)
        );
    }, [installations, searchTerm]);

    // Efeito para inicializar o mapa
    useEffect(() => {
        if (mapContainerRef.current && !mapInstanceRef.current) {
            const map = L.map(mapContainerRef.current).setView([-23.6675, -46.4608], 13); // Centro de Mauá
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
            mapInstanceRef.current = map;
            markersLayerRef.current.addTo(map);
            polygonsLayerRef.current.addTo(map);
        }
        // Função de limpeza para remover o mapa ao desmontar o componente
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Efeito para atualizar polígonos e marcadores quando os dados mudam
    useEffect(() => {
        if (!mapInstanceRef.current) return;

        // Atualiza Polígonos (baseado em todas as instalações, não filtrado)
        polygonsLayerRef.current.clearLayers();
        const sectorGroups = group(installations, d => d.setor);
        const sectorColors = scaleOrdinal(schemeCategory10).domain(Array.from(sectorGroups.keys()));

        sectorGroups.forEach((insts, setor) => {
            if (insts.length < 3) return; // Precisa de pelo menos 3 pontos para um polígono
            const points: [number, number][] = insts.map(i => [i.lng, i.lat]);
            const hull = polygonHull(points);
            if (hull) {
                const leafletCoords: [number, number][] = hull.map(([lng, lat]) => [lat, lng]); // Inverte para o formato [lat, lng] do Leaflet
                L.polygon(leafletCoords, { color: sectorColors(setor), weight: 2, fillOpacity: 0.1 })
                    .bindPopup(`<b>Setor: ${setor}</b><br>${insts.length} instalações na amostra`)
                    .addTo(polygonsLayerRef.current);
            }
        });

        // Atualiza Marcadores (baseado nas instalações filtradas)
        markersLayerRef.current.clearLayers();
        filteredInstallations.forEach(inst => {
            L.marker([inst.lat, inst.lng])
                .bindPopup(`
                    <b>ID:</b> ${inst.id}<br>
                    <b>Setor:</b> ${inst.setor}<br>
                    <b>Tamanho:</b> ${inst.tamanho}<br>
                    <b>Capacidade:</b> ${inst.capacity.toFixed(0)} m²
                `)
                .addTo(markersLayerRef.current);
        });

    }, [installations, filteredInstallations]);

    return (
        <div className="relative h-[600px] w-full">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-md px-4">
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por ID, setor, tamanho..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-md bg-white dark:bg-dark-card shadow-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                </div>
            </div>
            <div ref={mapContainerRef} className="h-full w-full rounded-lg" />
        </div>
    );
};

export default InteractiveMap;