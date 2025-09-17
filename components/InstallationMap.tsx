import React, { useMemo } from 'react';
import { Installation } from '../types';
import { scaleLinear, scaleSequential, interpolateRdYlGn, extent } from 'd3';

interface InstallationMapProps {
    installations: Installation[];
    colorBy: keyof Pick<Installation, 'efficiency' | 'capacity' | 'age' | 'roi' | 'capex' | 'opex'>;
}

const InstallationMap: React.FC<InstallationMapProps> = ({ installations, colorBy }) => {
    const width = 800;
    const height = 600;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };

    const { xScale, yScale, colorScale } = useMemo(() => {
        if (!installations || installations.length === 0) {
            return { xScale: () => 0, yScale: () => 0, colorScale: () => '#ccc' };
        }

        const [minLng, maxLng] = extent(installations, d => d.lng) as [number, number];
        const [minLat, maxLat] = extent(installations, d => d.lat) as [number, number];

        const xScale = scaleLinear()
            .domain([minLng, maxLng])
            .range([margin.left, width - margin.right]);

        const yScale = scaleLinear()
            .domain([maxLat, minLat]) // Invert latitude for typical map projection
            .range([margin.top, height - margin.bottom]);

        const colorDomain = extent(installations, d => d[colorBy]) as [number, number];
        const colorScale = scaleSequential(interpolateRdYlGn);

        if (['age', 'capex', 'opex'].includes(colorBy)) {
            colorScale.domain([colorDomain[1], colorDomain[0]]); // Invert for "bad" metrics
        } else {
            colorScale.domain(colorDomain);
        }

        return { xScale, yScale, colorScale };
    }, [installations, colorBy, width, height]);

    if (!installations || installations.length === 0) {
        return <div className="text-center p-8">Nenhum dado de instalação para exibir no mapa.</div>;
    }

    return (
        <div className="w-full flex justify-center items-center bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            <svg width={width} height={height}>
                <rect width={width} height={height} fill="#e2e8f0" className="dark:fill-gray-900" />
                {installations.map(inst => (
                    <circle
                        key={inst.id}
                        cx={xScale(inst.lng)}
                        cy={yScale(inst.lat)}
                        r={4}
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
            </svg>
        </div>
    );
};

export default InstallationMap;
