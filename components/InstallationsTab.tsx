import React, { useState, useMemo } from 'react';
// Fix: Import HierarchyRectangularNode to correctly type nodes after treemap layout is applied.
import { select, group, hierarchy, treemap, scaleSequential, interpolateRdYlGn, extent, HierarchyRectangularNode } from 'd3';
import { Installation } from '../types';
import { SolarPanelIcon, ThIcon, TableIcon, MapIcon } from './icons';
import InstallationTable from './InstallationTable';
import InstallationMap from './InstallationMap';
import InteractiveMap from './InteractiveMap'; // New map component

// Fix: Define an interface for the data structure used by the treemap to ensure type safety.
interface TreemapData {
    name: string;
    children?: TreemapData[];
    count?: number;
    capacity?: number;
    carbonOffset?: number;
    [key: string]: any; // Allow for dynamic property from colorBy
}

const Treemap: React.FC<{
    data: Installation[];
    groupBy: keyof Pick<Installation, 'tamanho' | 'orientacao' | 'setor'>;
    colorBy: keyof Pick<Installation, 'efficiency' | 'capacity' | 'age' | 'roi' | 'capex' | 'opex' | 'carbonOffset'>;
}> = ({ data, groupBy, colorBy }) => {
    const ref = React.useRef<SVGSVGElement>(null);
    const width = 800;
    const height = 600;

    React.useEffect(() => {
        if (!data || data.length === 0 || !ref.current) return;

        const svg = select(ref.current);
        svg.selectAll("*").remove();
        
        // --- Data Aggregation Logic ---
        let secondaryGroupBy: keyof Pick<Installation, 'tamanho' | 'setor'> = 'tamanho';
        if (groupBy === 'tamanho') secondaryGroupBy = 'setor';

        const groupedData = group(data, d => d[groupBy]);
        
        const rootData: TreemapData = {
            name: "root",
            children: Array.from(groupedData.entries()).map(([primaryKey, primaryValues]) => {
                const secondaryGroupedData = group(primaryValues, d => d[secondaryGroupBy]);
                return {
                    name: String(primaryKey),
                    children: Array.from(secondaryGroupedData.entries()).map(([secondaryKey, secondaryValues]) => {
                        const totalCapacity = secondaryValues.reduce((acc, d) => acc + d.capacity, 0);
                        const avgColorBy = secondaryValues.reduce((acc, d) => acc + d[colorBy], 0) / secondaryValues.length;
                        const count = secondaryValues.length;
                        return {
                            name: String(secondaryKey),
                            count,
                            capacity: totalCapacity,
                            [colorBy]: avgColorBy,
                        };
                    })
                };
            })
        };

        const root = hierarchy(rootData)
            .sum((d: TreemapData) => d.capacity || 0)
            // Fix: Cast 'a' and 'b' to any to access the 'value' property added by .sum()
            .sort((a, b) => ((b as any).value || 0) - ((a as any).value || 0));

        treemap<TreemapData>()
            .size([width, height])
            .paddingOuter(8)
            .paddingTop(20) // Space for parent label
            .paddingInner(2)
            (root);
        
        const colorDomain = extent(data, d => d[colorBy]) as [number, number];
        const colorScale = scaleSequential(interpolateRdYlGn);

        if (['age', 'capex', 'opex'].includes(colorBy)) {
            colorScale.domain([colorDomain[1], colorDomain[0]]);
        } else {
            colorScale.domain(colorDomain);
        }
        
        // Fix: Cast the root node to HierarchyRectangularNode to access layout properties (x0, y0, x1, y1).
        const rectRoot = root as HierarchyRectangularNode<TreemapData>;

        const nodes = svg.selectAll("g")
            .data(rectRoot.descendants().filter(d => d.depth > 0)) // All nodes except invisible root
            .join("g")
            .attr("transform", d => `translate(${d.x0},${d.y0})`);

        nodes.append("rect")
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => d.y1 - d.y0)
            .attr("fill", d => {
                if (d.depth === 1) return 'rgba(113, 128, 150, 0.1)'; // Primary group background
                return colorScale(d.data[colorBy]); // Leaf node color
            })
            .attr("stroke", "#1a202c");
        
        nodes.append("title")
            .text(d => {
                if (d.depth === 1) {
                    // Fix: Cast 'd' to any to access the 'value' property added by .sum()
                    return `${d.data.name}\nTotal Capacity: ${((d as any).value || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} m²`;
                }
                 // Fix: Cast 'd' and 'd.parent' to any to access the 'value' property. The 'count' property is now correctly typed.
                const percentageOfParent = (((d as any).value || 0) / ((d.parent as any)?.value || 1) * 100).toFixed(1);
                return `${d.parent?.data.name} - ${d.data.name}\nCapacity: ${((d as any).value || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} m² (${percentageOfParent}%)\nAvg ${colorBy}: ${d.data[colorBy].toFixed(2)}\nInstallations in sample: ${d.data.count}`;
            });

        // Add labels
        nodes.each(function(d) {
            const node = select(this);
            const width = d.x1 - d.x0;
            const height = d.y1 - d.y0;

            if (d.depth === 1) { // Primary group labels
                if (height > 20) {
                     node.append("text")
                        .attr("x", 4)
                        .attr("y", 14)
                        .attr("fill", '#e2e8f0')
                        .attr("font-size", "14px")
                        .attr("font-weight", "bold")
                        .text(d.data.name);
                }
            } else { // Leaf node labels
                if (width > 50 && height > 35) {
                    node.append("text")
                        .attr("x", 5)
                        .attr("y", 16)
                        .attr("fill", '#fff')
                        .attr("font-size", "12px")
                        .style("text-shadow", "1px 1px 2px #000")
                        .text(d.data.name);
                    
                    node.append("text")
                        .attr("x", 5)
                        .attr("y", 32)
                        .attr("fill", "#fff")
                        .attr("font-size", "10px")
                        .style("text-shadow", "1px 1px 2px #000")
                        // Fix: Cast 'd' to any to access the 'value' property added by .sum()
                        .text(`${(((d as any).value || 0) / 1000).toFixed(0)}k m²`);
                }
            }
        });

    }, [data, groupBy, colorBy]);

    return (
        <div className="w-full flex justify-center items-center bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
             <svg ref={ref} width={width} height={height}></svg>
        </div>
    );
};


interface InstallationsTabProps {
    installations: Installation[];
}

type MapType = 'density' | 'interactive' | 'potential';

const InstallationsTab: React.FC<InstallationsTabProps> = ({ installations }) => {
    const [groupBy, setGroupBy] = useState<keyof Pick<Installation, 'tamanho' | 'orientacao' | 'setor'>>('setor');
    const [colorBy, setColorBy] = useState<keyof Pick<Installation, 'efficiency' | 'capacity' | 'age' | 'roi' | 'capex' | 'opex' | 'carbonOffset'>>('efficiency');
    const [view, setView] = useState<'treemap' | 'table' | 'map'>('map');
    const [showHeatmap, setShowHeatmap] = useState(true);
    const [mapType, setMapType] = useState<MapType>('interactive');

    const potentialStats = [
        { label: 'Compensação de Carbono', value: '125.609,45', unit: 'toneladas métricas' },
        { label: 'Instalações Qualificadas', value: '77.575', unit: '' },
        { label: 'Potencial Total', value: '1.143.073,6', unit: 'kW' },
        { label: 'Cobertura do Potencial', value: '67,71', unit: '%' },
        { label: 'Qualificação do Potencial', value: '91,93', unit: '%' },
    ];
    
    const ViewButton: React.FC<{
        viewName: 'treemap' | 'table' | 'map';
        Icon: React.ElementType;
        label: string;
    }> = ({ viewName, Icon, label }) => (
        <button
            onClick={() => setView(viewName)}
            className={`px-3 py-1 rounded-md text-sm font-medium flex items-center transition-colors ${
                view === viewName
                    ? 'bg-white dark:bg-dark-card shadow'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
        >
            <Icon className="w-4 h-4 mr-2" />
            {label}
        </button>
    );

    const MapTypeButton: React.FC<{ mapName: MapType; label: string }> = ({ mapName, label }) => (
         <button
            onClick={() => setMapType(mapName)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                mapType === mapName
                    ? 'bg-white dark:bg-dark-card shadow'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
        >
            {label}
        </button>
    );

    const mapDescriptions = {
        density: 'Visualização geoespacial das instalações. Ative o "Mapa de Calor" para ver a densidade da capacidade e use o menu "Colorir por" para alterar os pontos.',
        interactive: 'Mapa interativo com polígonos de setores, marcadores individuais e busca em tempo real. Use o zoom para explorar e clique nos elementos para ver detalhes.',
        potential: 'Análise de potencial solar fornecida pelo Google Sunroof. Explore o potencial de geração de energia em telhados individuais na região de Mauá.',
    };

    const renderMapView = () => (
        <div>
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                <div>
                    <h3 className="text-lg font-semibold">Mapa de Instalações</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl">
                        {mapDescriptions[mapType]}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                     <div className="flex space-x-1 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg">
                         <MapTypeButton mapName="density" label="Densidade" />
                         <MapTypeButton mapName="interactive" label="Interativo" />
                         <MapTypeButton mapName="potential" label="Potencial" />
                    </div>
                    {mapType === 'density' && (
                        <div className="flex items-center">
                            <label htmlFor="heatmap-toggle" className="mr-3 text-sm font-medium">
                                Mapa de Calor
                            </label>
                            <button
                                id="heatmap-toggle"
                                onClick={() => setShowHeatmap(!showHeatmap)}
                                className={`${
                                    showHeatmap ? 'bg-accent' : 'bg-gray-300 dark:bg-gray-600'
                                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2`}
                                role="switch"
                                aria-checked={showHeatmap}
                            >
                                <span
                                    className={`${
                                        showHeatmap ? 'translate-x-6' : 'translate-x-1'
                                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                />
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            {mapType === 'density' && <InstallationMap installations={installations} colorBy={colorBy} showHeatmap={showHeatmap} />}
            {mapType === 'interactive' && <InteractiveMap installations={installations} />}
            {mapType === 'potential' && (
                <div className="w-full h-[600px] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <iframe 
                        src="https://solar-potential-296769475687.us-central1.run.app/?_gl=1*1y6hw4y*_ga*OTMwMDQxNTI3LjE3NTgxOTk2NDM.*_ga_NRWSTWS78N*czE3NTgxOTk2NDUkbzEkZzAkdDE3NTgxOTk2NDYkajU5JGwwJGgw"
                        title="Potencial Solar"
                        className="w-full h-full border-0"
                        allow="geolocation"
                    ></iframe>
                </div>
            )}
        </div>
    );

    return (
        <section>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold flex items-center"><SolarPanelIcon className="w-6 h-6 mr-3"/>Mapa de Instalações</h2>
                 <div className="flex space-x-1 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg">
                    <ViewButton viewName="treemap" Icon={ThIcon} label="Treemap" />
                    <ViewButton viewName="table" Icon={TableIcon} label="Tabela" />
                    <ViewButton viewName="map" Icon={MapIcon} label="Mapa" />
                </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-4 p-4 bg-white dark:bg-dark-card rounded-lg">
                <div className="filter-group">
                    <label className="mr-2 text-sm font-medium">Agrupar por:</label>
                    <select value={groupBy} onChange={e => setGroupBy(e.target.value as any)} className="filter-select px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
                        <option value="setor">Setor</option>
                        <option value="tamanho">Tamanho</option>
                        <option value="orientacao">Orientação</option>
                    </select>
                </div>
                 <div className="filter-group">
                    <label className="mr-2 text-sm font-medium">Colorir por:</label>
                     <select value={colorBy} onChange={e => setColorBy(e.target.value as any)} className="filter-select px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
                        <option value="efficiency">Eficiência Média (%)</option>
                        <option value="roi">ROI Médio (%)</option>
                        <option value="age">Idade Média (anos)</option>
                        <option value="capacity">Capacidade (m²)</option>
                        <option value="carbonOffset">Compensação de Carbono (kg CO₂/ano)</option>
                        <option value="capex">CAPEX Médio (R$)</option>
                        <option value="opex">OPEX Médio (R$)</option>
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-dark-card p-4 rounded-lg shadow-md">
                {view === 'treemap' && <Treemap data={installations} groupBy={groupBy} colorBy={colorBy} />}
                {view === 'table' && <InstallationTable installations={installations} />}
                {view === 'map' && renderMapView()}
            </div>

            <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Potencial de Produção em Telhados (Estimativas)</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-4xl">
                    As estimativas de compensação de carbono usam taxas de emissão de alta demanda equivalente de CO₂ da sub-região eGRID.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {potentialStats.map(stat => (
                        <div key={stat.label} className="bg-white dark:bg-dark-card p-4 rounded-lg shadow-sm text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400 h-10">{stat.label}</p>
                            <p className="text-3xl font-bold">{stat.value}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{stat.unit}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default InstallationsTab;