import React from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { ChartData, Phase } from '../types';
import ChartCard from './ChartCard';
import { ChartAreaIcon } from './icons';

interface DashboardTabProps {
    chartData: ChartData;
    phases: Phase[];
}

const DashboardTab: React.FC<DashboardTabProps> = ({ chartData, phases }) => {
    
    const COLORS = ['#4299e1', '#48bb78', '#ed8936'];

    return (
        <section>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold flex items-center"><ChartAreaIcon className="w-6 h-6 mr-3"/>Dashboard Executivo</h2>
                <select className="px-3 py-2 bg-white dark:bg-dark-card border border-gray-300 dark:border-gray-600 rounded-md">
                    <option>Últimas 24h</option>
                    <option>Últimos 7 dias</option>
                    <option>Últimos 30 dias</option>
                </select>
            </div>
            
            {/* Primary Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <ChartCard title="Geração vs Demanda" className="lg:col-span-2">
                    <ResponsiveContainer>
                        <LineChart data={chartData.generation}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2}/>
                            <XAxis dataKey="time" stroke="currentColor" />
                            <YAxis stroke="currentColor" unit="MW" />
                            <Tooltip contentStyle={{ backgroundColor: '#2d3748', border: 'none' }} formatter={(value: number) => `${value.toFixed(0)} MW`} />
                            <Legend />
                            <Line type="monotone" dataKey="geracao" stroke="#4299e1" strokeWidth={2} name="Geração" unit="MW"/>
                            <Line type="monotone" dataKey="demanda" stroke="#ed8936" strokeWidth={2} name="Demanda" unit="MW"/>
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>
                
                {chartData.efficiency && chartData.efficiency.length > 0 && (
                    <ChartCard title="Eficiência por Setor">
                        <ResponsiveContainer>
                            <PieChart>
                               <Pie data={chartData.efficiency} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                   {chartData.efficiency.map((entry, index) => (
                                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                   ))}
                               </Pie>
                               <Tooltip contentStyle={{ backgroundColor: '#2d3748', border: 'none' }} formatter={(value: number) => `${value.toFixed(1)}%`} />
                               <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartCard>
                )}
            </div>

            {/* Secondary Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <ChartCard title="Preços de Energia (R$/MWh)">
                    <ResponsiveContainer>
                        <BarChart data={chartData.prices}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2}/>
                            <XAxis dataKey="time" stroke="currentColor"/>
                            <YAxis stroke="currentColor"/>
                            <Tooltip contentStyle={{ backgroundColor: '#2d3748', border: 'none' }} cursor={{fill: 'rgba(113, 128, 150, 0.2)'}} formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                            <Bar dataKey="price" fill="#48bb78" name="Preço" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                 {chartData.weather && chartData.weather.length > 0 && (
                     <ChartCard title="Condições Climáticas">
                        <ResponsiveContainer>
                            <LineChart data={chartData.weather}>
                                 <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2}/>
                                 <XAxis dataKey="time" stroke="currentColor"/>
                                 <YAxis yAxisId="left" stroke="#facc15" label={{ value: 'Irradiação (W/m²)', angle: -90, position: 'insideLeft', fill: '#facc15' }}/>
                                 <YAxis yAxisId="right" orientation="right" stroke="#f87171" label={{ value: 'Temp (°C)', angle: 90, position: 'insideRight', fill: '#f87171' }}/>
                                 <Tooltip contentStyle={{ backgroundColor: '#2d3748', border: 'none' }}/>
                                 <Legend />
                                 <Line yAxisId="left" type="monotone" dataKey="irradiacao" stroke="#facc15" strokeWidth={2} name="Irradiação"/>
                                 <Line yAxisId="right" type="monotone" dataKey="temp" stroke="#f87171" strokeWidth={2} name="Temperatura"/>
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartCard>
                )}
            </div>

            {phases && phases.length > 0 && (
                <div>
                    <h3 className="text-xl font-semibold mb-4">Progresso das Fases</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {phases.map(phase => (
                             <div key={phase.id} className="bg-white dark:bg-dark-card p-4 rounded-lg shadow-sm">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-semibold">{phase.title}</h4>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                        phase.status === 'Concluída' ? 'bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-100' :
                                        phase.status === 'Em Andamento' ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100' :
                                        'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-100'
                                    }`}>{phase.status}</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                    <div className="bg-accent h-2.5 rounded-full" style={{ width: `${phase.progress}%` }}></div>
                                </div>
                                <p className="text-right text-sm mt-1">{phase.progress}%</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
};

export default DashboardTab;
