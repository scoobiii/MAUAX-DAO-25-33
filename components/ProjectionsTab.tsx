import React, { useState } from 'react';
import ChartCard from './ChartCard';
import { ChartData } from '../types';
import { ResponsiveContainer, ComposedChart, Area, Bar, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Brush } from 'recharts';
import { ChartLineIcon } from './icons';

interface ProjectionsTabProps {
    chartData: ChartData;
}

const ProjectionsTab: React.FC<ProjectionsTabProps> = ({ chartData }) => {
    const [view, setView] = useState<'annual' | 'max'>('max');

    const handleViewChange = (newView: 'annual' | 'max') => {
        setView(newView);
        // In a real app, this might trigger a data refetch for monthly/daily data
    };

    const formatGdpTick = (value: number) => `$${(value / 1000).toLocaleString('en-US')}k`;
    const formatEnergyTick = (value: number) => `${value.toLocaleString('pt-BR')}`;
    const formatGwhTick = (value: number) => `${(value / 1000).toLocaleString('pt-BR')} TWh`;

    return (
        <section>
            <h2 className="text-2xl font-bold flex items-center mb-6"><ChartLineIcon className="w-6 h-6 mr-3"/>Projeções Estratégicas (2023-2033)</h2>
            <div className="grid grid-cols-1 gap-6">
                <ChartCard 
                    title="Evolução da Matriz Energética e Socioeconomia de Mauá" 
                    className="lg:col-span-2"
                    chartHeight="h-[600px]"
                    controls={
                        <div className="flex space-x-1 bg-gray-200 dark:bg-gray-800 p-1 rounded-lg">
                            <button onClick={() => handleViewChange('annual')} className={`px-3 py-1 text-sm rounded-md ${view === 'annual' ? 'bg-white dark:bg-dark-card shadow' : ''}`}>Anual</button>
                            <button onClick={() => handleViewChange('max')} className={`px-3 py-1 text-sm rounded-md ${view === 'max' ? 'bg-white dark:bg-dark-card shadow' : ''}`}>Máximo</button>
                        </div>
                    }
                >
                    <ResponsiveContainer>
                        <ComposedChart data={chartData.annualProjections}>
                             <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2}/>
                             <XAxis dataKey="year" stroke="currentColor" />
                             
                             <YAxis 
                                yAxisId="left" 
                                stroke="#facc15" 
                                label={{ value: 'Produção / Consumo (GWh)', angle: -90, position: 'insideLeft', fill: '#facc15' }}
                                tickFormatter={formatGwhTick}
                             />
                             <YAxis 
                                yAxisId="right" 
                                orientation="right" 
                                stroke="#82ca9d" 
                                label={{ value: 'PIB / Consumo per Capita', angle: 90, position: 'insideRight', fill: '#82ca9d' }}
                                tickFormatter={formatGdpTick}
                              />

                             <Tooltip 
                                contentStyle={{ backgroundColor: '#2d3748', border: 'none' }}
                                formatter={(value: number, name: string) => {
                                    if (name.includes('Produção') || name.includes('Consumo Total')) return [`${value.toLocaleString('pt-BR')} GWh`, name];
                                    if (name.includes('PIB')) return [`$${value.toLocaleString('en-US')}`, name];
                                    if (name.includes('Energia')) return [`${value.toLocaleString('pt-BR')} kWh`, name];
                                    return [value, name];
                                }}
                             />
                             <Legend wrapperStyle={{ paddingTop: '40px' }} />
                             
                             <Area yAxisId="left" type="monotone" dataKey="solarProduction" stackId="1" stroke="#facc15" fill="#facc15" name="Produção Solar (GWh)" />
                             <Area yAxisId="left" type="monotone" dataKey="otherProduction" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Produção Outras Fontes (GWh)" />
                             <Line yAxisId="left" type="monotone" dataKey="totalConsumption" stroke="#ed8936" strokeWidth={3} dot={false} name="Consumo Total (GWh)"/>

                             <Line yAxisId="right" type="monotone" dataKey="gdpPerCapita" stroke="#82ca9d" strokeWidth={2} name="PIB per capita (US$)"/>
                             <Line yAxisId="right" type="monotone" dataKey="energyPerCapita" stroke="#8884d8" strokeWidth={2} name="Consumo de Energia per capita (kWh)"/>

                             <Brush dataKey="year" height={30} stroke="#4299e1" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </ChartCard>
                <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-2">Análise da Projeção</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Este gráfico demonstra a transição energética e o crescimento econômico projetado para Mauá. A linha de <strong>Produção Solar</strong> (amarela) mostra uma adoção acelerada, seguindo uma curva-S típica para novas tecnologias, até se tornar uma parte substancial da matriz energética.
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                        A área azul representa a <strong>Produção de Outras Fontes</strong> (hidrelétrica, eólica, biocombustíveis), que se ajusta para complementar a geração solar e atender ao <strong>Consumo Total</strong> (laranja) crescente da cidade. O crescimento do <strong>PIB per capita</strong> (verde) e do <strong>Consumo de Energia per capita</strong> (roxo) estão interligados, refletindo o desenvolvimento sustentável impulsionado por energia limpa e acessível.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default ProjectionsTab;
