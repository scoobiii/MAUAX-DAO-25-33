import React, { useState, useMemo } from 'react';
import { select, group, hierarchy, treemap, scaleSequential, interpolateRdYlGn, extent } from 'd3';
import { Installation } from '../types';
import { SolarPanelIcon, ThIcon, TableIcon, MapIcon } from './icons';
import InstallationTable from './InstallationTable';
import InstallationMap from './InstallationMap';


const Treemap: React.FC<{
    data: Installation[];
    groupBy: keyof Pick<Installation, 'tamanho' | 'orientacao' | 'setor'>;
    colorBy: keyof Pick<Installation, 'efficiency' | 'capacity' | 'age' | 'roi' | 'capex' | 'opex'>;
}> = ({ data, groupBy, colorBy }) => {
    const ref = React.useRef<SVGSVGElement>(null);
    const width = 800;
    const height = 600;

    React.useEffect(() => {
        if (!data || data.length === 0 || !ref.current) return;

        const svg = select(ref.current);
        svg.selectAll("*").remove();
        
        const groupedData = group(data, d => d[groupBy]);
        const rootData = { name: "root", children: Array.from(groupedData.entries()).map(([key, values]) => ({ name: key, children: values })) };

        const root = hierarchy(rootData)
            .sum((d: any) => d.capacity || 0)
            .sort((a, b) => (b.value || 0) - (a.value || 0));

        treemap<any>()
            .size([width, height])
            .padding(2)
            (root);
        
        const colorDomain = extent(data, d => d[colorBy]) as [number, number];
        const colorScale = scaleSequential(interpolateRdYlGn);

        if (['age', 'capex', 'opex'].includes(colorBy)) {
            colorScale.domain([colorDomain[1], colorDomain[0]]);
        } else {
            colorScale.domain(colorDomain);
        }

        const nodes = svg.selectAll("g")
            .data(root.leaves())
            .enter()
            .append("g")
            .attr("transform", (d: any) => `translate(${d.x0},${d.y0})`);

        nodes.append("rect")
            .attr("width", (d: any) => d.x1 - d.x0)
            .attr("height", (d: any) => d.y1 - d.y0)
            .attr("fill", (d: any) => colorScale(d.data[colorBy]))
            .attr("stroke", "#1a202c")
            .style("transition", "fill 0.3s ease");

        nodes.append("text")
            .selectAll("tspan")
            .data((d: any) => d.data.id.split(/(?=[A-Z][^A-Z])/g))
            .enter().append("tspan")
            .attr("x", 4)
            .attr("y", (d, i) => 13 + i * 10)
            .text((d: any) => d)
            .attr("font-size", "10px")
            .attr("fill", "#fff")
            .style("text-shadow", "1px 1px 2px #000");

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

const InstallationsTab: React.FC<InstallationsTabProps> = ({ installations }) => {
    const [groupBy, setGroupBy] = useState<keyof Pick<Installation, 'tamanho' | 'orientacao' | 'setor'>>('setor');
    const [colorBy, setColorBy] = useState<keyof Pick<Installation, 'efficiency' | 'capacity' | 'age' | 'roi' | 'capex' | 'opex'>>('efficiency');
    const [view, setView] = useState<'treemap' | 'table' | 'map'>('treemap');

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
                        <option value="efficiency">Eficiência (%)</option>
                        <option value="roi">ROI (%)</option>
                        <option value="age">Idade (anos)</option>
                        <option value="capacity">Capacidade (Área m²)</option>
                        <option value="capex">CAPEX (R$)</option>
                        <option value="opex">OPEX (R$)</option>
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-dark-card p-4 rounded-lg shadow-md">
                {view === 'treemap' && <Treemap data={installations} groupBy={groupBy} colorBy={colorBy} />}
                {view === 'table' && <InstallationTable installations={installations} />}
                {view === 'map' && <InstallationMap installations={installations} colorBy={colorBy} />}
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