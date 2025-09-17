
import React from 'react';
import ChartCard from './ChartCard';
import { ChartData, EnergySource } from '../types';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { BoltIcon } from './icons';

interface EnergyMatrixTabProps {
    chartData: ChartData;
    energySources: EnergySource[];
}

const EnergyMatrixTab: React.FC<EnergyMatrixTabProps> = ({ chartData, energySources }) => {
    return (
        <section>
             <h2 className="text-2xl font-bold flex items-center mb-6"><BoltIcon className="w-6 h-6 mr-3"/>Matriz Energética</h2>
             <div className="flex flex-col gap-8">
                <ChartCard title="Composição da Matriz" chartHeight="h-[400px]">
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie 
                                data={chartData.energyMix} 
                                dataKey="value" 
                                nameKey="name" 
                                cx="50%" 
                                cy="50%" 
                                innerRadius={100} 
                                outerRadius={160} 
                                paddingAngle={5}
                            >
                            {
                                chartData.energyMix.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)
                            }
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#2d3748', border: 'none' }}/>
                            <Legend wrapperStyle={{ paddingTop: '20px' }}/>
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>

                <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-4">Detalhes das Fontes</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {energySources.map(source => {
                            const Icon = source.icon;
                            const bgColor = source.color.replace('text-', 'bg-') + '/20';
                            return (
                                <div key={source.name} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm flex items-center transition-all hover:shadow-md hover:-translate-y-1">
                                    <div className={`p-3 rounded-full mr-4 ${bgColor}`}>
                                        <Icon className={`w-8 h-8 ${source.color}`}/>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">{source.name}</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{source.capacity}</p>
                                        <p className="text-xl font-bold">{source.percentage}%</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default EnergyMatrixTab;