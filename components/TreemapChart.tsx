import React, { useMemo } from 'react';
import { ResponsiveContainer, Treemap, Tooltip } from 'recharts';
import { Installation } from '../types';
import { scaleLinear, interpolateRdYlGn } from 'd3';

interface TreemapChartProps {
    installations: Installation[];
}

const CustomTooltip: React.FC<any> = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        if (data.name && data.size && data.roi) {
             return (
                <div className="bg-gray-800 text-white p-3 rounded-md border border-gray-600 shadow-lg">
                    <p className="font-bold">{`${data.parentName ? data.parentName + ' - ' : ''}${data.name}`}</p>
                    <p>Capacidade Total: {data.size.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} m²</p>
                    <p>ROI Médio: {data.roi.toFixed(1)}%</p>
                    {data.count && <p>Nº de Instalações: {data.count}</p>}
                    {data.avgCapacity && <p>Capacidade Média: {data.avgCapacity.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} m²</p>}
                </div>
            );
        }
    }
    return null;
};

const CustomizedContent: React.FC<any> = (props) => {
    const { depth, x, y, width, height, name, roi } = props;
    const colorScale = useMemo(() => {
        return scaleLinear<string>().domain([2, 17]).range([0, 1]).clamp(true);
    }, []);

    const isParent = depth === 1;
    const isLeaf = depth === 2;
    const textColor = '#ffffff';

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: isParent ? '#2d3748' : interpolateRdYlGn(colorScale(roi)),
                    stroke: '#1a202c',
                    strokeWidth: 2 / (depth + 1e-10),
                    strokeOpacity: 1 / (depth + 1e-10),
                }}
            />
            {isLeaf && width > 80 && height > 25 ? (
                <text x={x + width / 2} y={y + height / 2 + 7} textAnchor="middle" fill={textColor} fontSize={14}>
                    {name}
                </text>
            ) : null}
            {isParent && width > 80 ? (
                 <text x={x + 4} y={y + 18} fill={textColor} fontSize={16} fillOpacity={0.9}>
                    {name}
                 </text>
            ) : null}
        </g>
    );
};

const TreemapChart: React.FC<TreemapChartProps> = ({ installations }) => {
    const treemapData = useMemo(() => {
        // Fix: Use a generic type argument for `reduce` to correctly type the accumulator.
        // This resolves issues with type inference that caused downstream properties to be 'unknown'.
        const groupedBySector = installations.reduce<Record<string, Installation[]>>((acc, inst) => {
            if (!acc[inst.setor]) {
                acc[inst.setor] = [];
            }
            acc[inst.setor].push(inst);
            return acc;
        }, {});

        return Object.entries(groupedBySector).map(([sectorName, sectorInstallations]) => {
            type GroupedBySizeData = { totalCapacity: number; totalRoi: number; count: number };
            
            // Fix: Apply the same generic type argument pattern to the nested reduce call.
            // This correctly types `groupedBySize`, allowing its properties to be accessed safely.
            const groupedBySize = sectorInstallations.reduce<Record<string, GroupedBySizeData>>((acc, inst) => {
                if (!acc[inst.tamanho]) {
                    acc[inst.tamanho] = { totalCapacity: 0, totalRoi: 0, count: 0 };
                }
                acc[inst.tamanho].totalCapacity += inst.capacity;
                acc[inst.tamanho].totalRoi += inst.roi;
                acc[inst.tamanho].count++;
                return acc;
            }, {});

            return {
                name: sectorName,
                children: Object.entries(groupedBySize).map(([sizeName, data]) => ({
                    name: sizeName,
                    size: data.totalCapacity,
                    roi: data.totalRoi / data.count,
                    parentName: sectorName,
                    count: data.count,
                    avgCapacity: data.totalCapacity / data.count,
                })),
            };
        });
    }, [installations]);

    if (!installations || installations.length === 0) {
        return <div className="text-center p-8">Não há dados suficientes para exibir o Treemap.</div>;
    }

    return (
        <div className="h-[600px] w-full">
            <ResponsiveContainer>
                <Treemap
                    data={treemapData}
                    dataKey="size"
                    ratio={4 / 3}
                    stroke="#fff"
                    fill="#8884d8"
                    content={<CustomizedContent />}
                    isAnimationActive={true}
                    animationDuration={500}
                >
                  <Tooltip content={<CustomTooltip />} />
                </Treemap>
            </ResponsiveContainer>
        </div>
    );
};

export default TreemapChart;