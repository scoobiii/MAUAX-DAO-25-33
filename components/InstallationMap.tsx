import React, { useMemo } from 'react';
import { Installation } from '../types';
import {
    scaleLinear,
    scaleSequential,
    interpolateRdYlGn,
    extent,
    contourDensity,
    geoPath,
    max as d3Max,
    interpolateYlOrRd
} from 'd3';

interface InstallationMapProps {
    installations: Installation[];
    colorBy: keyof Pick<Installation, 'efficiency' | 'capacity' | 'age' | 'roi' | 'capex' | 'opex' | 'carbonOffset'>;
    showHeatmap: boolean;
}

const InstallationMap: React.FC<InstallationMapProps> = ({ installations, colorBy, showHeatmap }) => {
    const width = 800;
    const height = 600;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };

    const { xScale, yScale, colorScale, densityData, heatmapColorScale } = useMemo(() => {
        if (!installations || installations.length === 0) {
            return { xScale: () => 0, yScale: () => 0, colorScale: () => '#ccc', densityData: [], heatmapColorScale: () => '#ccc' };
        }

        const [minLng, maxLng] = extent(installations, d => d.lng) as [number, number];
        const [minLat, maxLat] = extent(installations, d => d.lat) as [number, number];

        const xScale = scaleLinear()
            .domain([minLng, maxLng])
            .range([margin.left, width - margin.right]);

        const yScale = scaleLinear()
            .domain([maxLat, minLat]) // Invert latitude for typical map projection
            .range([margin.top, height - margin.bottom]);

        // Color scale for individual points
        const colorDomain = extent(installations, d => d[colorBy]) as [number, number];
        const colorScale = scaleSequential(interpolateRdYlGn);

        if (['age', 'capex', 'opex'].includes(colorBy)) {
            colorScale.domain([colorDomain[1], colorDomain[0]]); // Invert for "bad" metrics
        } else {
            colorScale.domain(colorDomain);
        }

        // --- Heatmap Calculation ---
        const densityEstimator = contourDensity<Installation>()
            .x(d => xScale(d.lng))
            .y(d => yScale(d.lat))
            .weight(d => d.capacity) // Weight by capacity as requested
            .size([width, height])
            .bandwidth(35)
            .thresholds(25);

        const densityData = densityEstimator(installations);

        const maxDensity = d3Max(densityData, d => d.value) || 1;
        
        const heatmapColorScale = scaleSequential(interpolateYlOrRd)
            .domain([0, maxDensity]);
        
        return { xScale, yScale, colorScale, densityData, heatmapColorScale };

    }, [installations, colorBy, width, height]);

    if (!installations || installations.length === 0) {
        return <div className="text-center p-8">Nenhum dado de instalação para exibir no mapa.</div>;
    }

    const pathGenerator = geoPath();

    return (
        <div className="w-full flex justify-center items-center bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            <svg width={width} height={height}>
                <rect width={width} height={height} fill="#e2e8f0" className="dark:fill-gray-900" />
                
                {/* Heatmap Layer */}
                {showHeatmap && (
                    <g fill="none" stroke="none">
                        {densityData.map((contour, i) => (
                            <path
                                key={i}
                                d={pathGenerator(contour) || ''}
                                fill={heatmapColorScale(contour.value)}
                                fillOpacity={0.6}
                            />
                        ))}
                    </g>
                )}

                {/* Installation Points Layer */}
                <g>
                    {installations.map(inst => (
                        <circle
                            key={inst.id}
                            cx={xScale(inst.lng)}
                            cy={yScale(inst.lat)}
                            r={3}
                            fill={colorScale(inst[colorBy])}
                            stroke="#1a202c"
                            strokeWidth={0.5}
                            style={{ transition: 'fill 0.3s ease' }}
                        >
                            <title>
                                {`ID: ${inst.id}\nSetor: ${inst.setor}\n${colorBy}: ${inst[colorBy].toFixed(2)}`}
                            </title>
                        </circle>
                    ))}
                </g>
            </svg>
        </div>
    );
};

export default InstallationMap;