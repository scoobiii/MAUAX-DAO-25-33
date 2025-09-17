import React, { useState, useMemo } from 'react';
import {
    ResponsiveContainer,
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    Area
} from 'recharts';
import { ChartData } from '../types';
import ChartCard from './ChartCard';
import { ChartLineIcon } from './icons';

interface ProjectionsTabProps {
    chartData: ChartData;
}

const ProjectionsTab: React.FC<ProjectionsTabProps> = ({ chartData }) => {
    const { annualProjections } = chartData;
    const [timeRange, setTimeRange] = useState<'max' | '5y'>('max');

    const filteredProjections = useMemo(() => {
        if (!annualProjections) return [];
        switch (timeRange) {
            case '5y':
                return annualProjections.slice(-5);
            case 'max':
            default:
                return annualProjections;
        }
    }, [annualProjections, timeRange]);

    if (!annualProjections || annualProjections.length === 0) {
        return <p>Dados de projeção não disponíveis.</p>;
    }

    const TimeRangeSelector = (
        <div className="flex space-x-1 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg">
            <button
                onClick={() => setTimeRange('5y')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    timeRange === '5y' ? 'bg-white dark:bg-dark-card shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
            >
                Últimos 5 Anos
            </button>
            <button
                onClick={() => setTimeRange('max')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    timeRange === 'max' ? 'bg-white dark:bg-dark-card shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
            >
                Período Completo
            </button>
        </div>
    );

    return (
        <section>
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold flex items-center">
                    <ChartLineIcon className="w-6 h-6 mr-3" />
                    Projeções Anuais (2023-2033)
                </h2>
                {TimeRangeSelector}
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <ChartCard title="Projeção de Geração e Consumo de Energia" chartHeight="h-96">
                    <ResponsiveContainer>
                        <ComposedChart data={filteredProjections}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                            <XAxis dataKey="year" stroke="currentColor" />
                            <YAxis stroke="currentColor" unit=" GWh" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#2d3748', border: 'none' }}
                                formatter={(value: number) => `${value.toLocaleString('pt-BR')} GWh`}
                            />
                            <Legend />
                            <Bar dataKey="solarProduction" stackId="a" fill="#facc15" name="Produção Solar (GWh)" />
                            <Bar dataKey="otherProduction" stackId="a" fill="#60a5fa" name="Outras Fontes (GWh)" />
                            <Line type="monotone" dataKey="totalConsumption" stroke="#f87171" strokeWidth={3} name="Consumo Total (GWh)" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Projeção de Indicadores Socioeconômicos" chartHeight="h-96">
                    <ResponsiveContainer>
                        <ComposedChart data={filteredProjections}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                            <XAxis dataKey="year" stroke="currentColor" />
                            <YAxis
                                yAxisId="left"
                                orientation="left"
                                stroke="#48bb78"
                                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                                label={{ value: 'PIB per Capita (USD)', angle: -90, position: 'insideLeft', fill: '#48bb78' }}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                stroke="#ed8936"
                                unit=" kWh"
                                label={{ value: 'Energia per Capita (kWh)', angle: 90, position: 'insideRight', fill: '#ed8936' }}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#2d3748', border: 'none' }}
                                formatter={(value: number, name: string) => [
                                    value.toLocaleString('pt-BR'),
                                    name === 'gdpPerCapita' ? 'PIB per Capita (USD)' : 'Energia per Capita (kWh)',
                                ]}
                            />
                            <Legend />
                            <Area yAxisId="left" type="monotone" dataKey="gdpPerCapita" fill="#48bb78" stroke="#48bb78" fillOpacity={0.3} name="PIB per Capita (USD)" />
                            <Line yAxisId="right" type="monotone" dataKey="energyPerCapita" stroke="#ed8936" strokeWidth={2} name="Energia per Capita (kWh)" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </ChartCard>

                <div className="xl:col-span-2 bg-white dark:bg-dark-card p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-4">Análise das Projeções</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                        As projeções indicam uma transição energética acelerada em Mauá ao longo da próxima década. A adoção de energia solar, impulsionada pelo projeto, deve crescer exponencialmente, visando suprir 35% do consumo total até 2033. Este crescimento está alinhado com o desenvolvimento socioeconômico esperado, refletido no aumento do PIB per Capita e do consumo de energia por habitante. O modelo preditivo utiliza uma curva S para simular uma adoção tecnológica realista, com um crescimento inicial lento, seguido por uma rápida aceleração e uma eventual estabilização à medida que o mercado atinge a saturação. O desafio será gerenciar a rede para acomodar a intermitência da geração solar, uma tarefa que será cada vez mais dependente das otimizações de IA.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default ProjectionsTab;
