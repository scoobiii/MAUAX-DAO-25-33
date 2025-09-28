import React from 'react';
import ChartCard from './ChartCard';
import { ChartData } from '../types';
import { ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, Legend } from 'recharts';
import { BrainIcon, ChartLineIcon, BoltIcon, CoinsIcon } from './icons';

interface AiTabProps {
    chartData: ChartData;
}

const AiTab: React.FC<AiTabProps> = ({ chartData }) => {
    
    const currentHour = `${new Date().getHours()}:00`;

    const combinedData = chartData.energyPrediction.map((ep, i) => {
        const demand = chartData.demandPrediction[i]?.value ?? 0;
        const totalGeneration = ep.solar + ep.thermal + ep.hydro + ep.battery + ep.eolica + (ep.nuclear || 0);
        const netDemand = demand - (ep.solar + ep.eolica); // Duck curve is net demand after renewables
        return {
            ...ep,
            demand,
            totalGeneration,
            netDemand: Math.max(0, netDemand),
        };
    });

    return (
        <section>
            <h2 className="text-2xl font-bold flex items-center mb-6"><BrainIcon className="w-6 h-6 mr-3"/>IA & Otimização</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Left Column: Explanations */}
                <div className="space-y-8 lg:col-span-1">
                    <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-4">Entendendo a Curva do Pato</h3>
                        <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
                            <p>A <strong>"Curva do Pato"</strong> (linha rosa pontilhada no gráfico) é o principal desafio da energia renovável. Ela representa a demanda líquida de energia da rede ao longo do dia — ou seja, a demanda total menos a geração de fontes intermitentes como a solar.</p>
                            <p>Durante o meio-dia, a alta produção solar atende a maior parte da demanda, fazendo a demanda líquida cair drasticamente (a "barriga do pato"). Ao entardecer, a produção solar cessa rapidamente, enquanto a demanda residencial atinge seu pico, criando uma rampa de subida extremamente íngreme (o "pescoço do pato") que a rede precisa atender em poucas horas.</p>
                            <h4 className="font-semibold text-base text-gray-800 dark:text-gray-100 pt-2">A Intervenção da IA</h4>
                            <p>Nossa IA atua como uma maestrina, orquestrando diversas fontes para equilibrar a rede de forma proativa, garantindo estabilidade e o menor custo possível:</p>
                            <ul className="list-disc list-inside space-y-2 pl-2">
                                <li><strong>Baterias:</strong> Armazenam o excesso de energia solar do meio-dia e a injetam na rede durante o pico da noite, suavizando a rampa de demanda.</li>
                                <li><strong>Hidrelétrica:</strong> Funciona como uma reserva de energia flexível, sendo acionada rapidamente para acompanhar a subida da demanda no início da noite.</li>
                                <li><strong>Eólica:</strong> Complementa a geração solar, pois seus picos de produção frequentemente ocorrem durante a noite e madrugada.</li>
                                <li><strong>Térmica (Biocombustível):</strong> É despachada pela IA em momentos de altíssima demanda ou quando outras fontes não são suficientes, garantindo a segurança energética do sistema.</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-4">Métricas de Performance da IA</h3>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <div className="p-2 bg-green-500/20 rounded-full mr-3">
                                    <ChartLineIcon className="w-5 h-5 text-green-500" />
                                </div>
                                <div className="flex-grow">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Acurácia de Previsão (Demanda)</p>
                                    <p className="font-bold text-lg">99.2%</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <div className="p-2 bg-blue-500/20 rounded-full mr-3">
                                    <BoltIcon className="w-5 h-5 text-blue-500" />
                                </div>
                                <div className="flex-grow">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Energia Economizada (24h)</p>
                                    <p className="font-bold text-lg">15.3 MWh</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <div className="p-2 bg-yellow-500/20 rounded-full mr-3">
                                    <CoinsIcon className="w-5 h-5 text-yellow-500" />
                                </div>
                                <div className="flex-grow">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Redução de Custo (24h)</p>
                                    <p className="font-bold text-lg">R$ 8.4k</p>
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                            Métricas baseadas na comparação entre a operação otimizada pela IA e a operação manual simulada.
                        </p>
                    </div>
                </div>
                
                {/* Right Column: Main Chart */}
                <div className="lg:col-span-2">
                     <ChartCard title="Balanço Energético e Curva do Pato (Previsão 24h)" chartHeight="h-[600px]">
                         <ResponsiveContainer>
                             <ComposedChart data={combinedData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="colorSolar" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#facc15" stopOpacity={0.8}/><stop offset="95%" stopColor="#facc15" stopOpacity={0}/></linearGradient>
                                    <linearGradient id="colorThermal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/><stop offset="95%" stopColor="#f97316" stopOpacity={0}/></linearGradient>
                                    <linearGradient id="colorHydro" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                                    <linearGradient id="colorBattery" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/><stop offset="95%" stopColor="#22c55e" stopOpacity={0}/></linearGradient>
                                    <linearGradient id="colorEolic" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8}/><stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/></linearGradient>
                                    <linearGradient id="colorNuclear" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/><stop offset="95%" stopColor="#a855f7" stopOpacity={0}/></linearGradient>
                                </defs>
                                 <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2}/>
                                 <XAxis dataKey="time" stroke="currentColor"/>
                                 <YAxis stroke="currentColor" unit=" MW" />
                                 <Tooltip contentStyle={{ backgroundColor: '#2d3748', border: 'none' }} formatter={(value: number, name: string) => [`${value.toFixed(0)} MW`, name]}/>
                                 <Legend />
                                 <Area type="monotone" dataKey="solar" stackId="1" stroke="#facc15" fill="url(#colorSolar)" name="Solar" />
                                 <Area type="monotone" dataKey="eolica" stackId="1" stroke="#22d3ee" fill="url(#colorEolic)" name="Eólica" />
                                 <Area type="monotone" dataKey="thermal" stackId="1" stroke="#f97316" fill="url(#colorThermal)" name="Térmica" />
                                 <Area type="monotone" dataKey="hydro" stackId="1" stroke="#3b82f6" fill="url(#colorHydro)" name="Hidro" />
                                 <Area type="monotone" dataKey="nuclear" stackId="1" stroke="#a855f7" fill="url(#colorNuclear)" name="Nuclear" />
                                 <Area type="monotone" dataKey="battery" stackId="1" stroke="#22c55e" fill="url(#colorBattery)" name="Baterias" />
                                 <Line type="monotone" dataKey="demand" stroke="#ed8936" strokeWidth={3} dot={false} name="Demanda Total"/>
                                 <Line type="monotone" dataKey="netDemand" stroke="#ec4899" strokeWidth={3} strokeDasharray="5 5" dot={false} name="Demanda Líquida (Curva Pato)"/>
                                 <ReferenceLine x={currentHour} stroke="red" strokeDasharray="3 3" label={{ value: 'Agora', position: 'insideTop', fill: 'red' }} />
                             </ComposedChart>
                         </ResponsiveContainer>
                    </ChartCard>
                </div>
            </div>

            {/* Bottom Row: Forecasts */}
            {chartData.sevenDayForecast && chartData.sevenDayForecast.length > 0 && (
                <div>
                    <h3 className="text-xl font-semibold mb-4 mt-8">Previsões Futuras</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <ChartCard title="Previsão do Clima (Próximos 7 Dias)" chartHeight="h-96">
                            <ResponsiveContainer>
                                <ComposedChart data={chartData.sevenDayForecast}>
                                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                                    <XAxis dataKey="day" stroke="currentColor" />
                                    <YAxis yAxisId="left" stroke="#facc15" label={{ value: 'Irradiação (kWh/m²/dia)', angle: -90, position: 'insideLeft', fill: '#facc15' }} />
                                    <YAxis yAxisId="right" orientation="right" stroke="#f87171" label={{ value: 'Temp (°C)', angle: 90, position: 'insideRight', fill: '#f87171' }} />
                                    <Tooltip contentStyle={{ backgroundColor: '#2d3748', border: 'none' }} />
                                    <Legend />
                                    <Line yAxisId="left" type="monotone" dataKey="irradiacao" stroke="#facc15" strokeWidth={2} name="Irradiação" />
                                    <Area yAxisId="right" type="monotone" dataKey="temp" stroke="#f87171" fill="#f87171" fillOpacity={0.2} name="Temperatura Média" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </ChartCard>
                        <ChartCard title="Previsão de Geração Solar (Próximos 7 Dias)" chartHeight="h-96">
                            <ResponsiveContainer>
                                <ComposedChart data={chartData.sevenDayForecast}>
                                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                                    <XAxis dataKey="day" stroke="currentColor" />
                                    <YAxis stroke="#4299e1" unit=" GWh" label={{ value: 'Geração (GWh)', angle: -90, position: 'insideLeft', fill: '#4299e1' }} />
                                    <Tooltip contentStyle={{ backgroundColor: '#2d3748', border: 'none' }} formatter={(value: number) => `${value.toFixed(2)} GWh`} />
                                    <Legend />
                                    <Area type="monotone" dataKey="geracaoPrevista" stroke="#4299e1" fill="#4299e1" fillOpacity={0.3} name="Geração Prevista" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    </div>
                </div>
            )}
        </section>
    );
};

export default AiTab;
