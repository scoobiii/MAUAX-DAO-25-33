import React from 'react';
import ChartCard from './ChartCard';
import { ChartData } from '../types';
import { ResponsiveContainer, ComposedChart, LineChart, Area, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, Legend } from 'recharts';
import { BrainIcon, ChartLineIcon, BoltIcon, CoinsIcon } from './icons';

interface AiTabProps {
    chartData: ChartData;
}

const AiTab: React.FC<AiTabProps> = ({ chartData }) => {
    const algorithmCode = `
# Carregando algoritmo de otimização...
import tensorflow as tf
import numpy as np

class MEXEnergyOptimizer:
    def __init__(self):
        self.model = self.build_lstm_model()
        
    def predict_solar_generation(self, weather_data):
        # Previsão em tempo real
        return self.model.predict(weather_data)
    `;
    
    const currentHour = `${new Date().getHours()}:00`;

    const combinedData = chartData.energyPrediction.map((ep, i) => {
        const demand = chartData.demandPrediction[i]?.value ?? 0;
        const totalGeneration = ep.solar + ep.thermal + ep.hydro + ep.battery + ep.eolica + (ep.nuclear || 0);
        const netDemand = Math.max(0, demand - ep.solar); // This is the duck curve
        return {
            ...ep,
            demand,
            totalGeneration,
            netDemand,
        };
    });

    const { totalSurplus, totalDeficit } = combinedData.reduce(
        (acc, data) => {
            const diff = data.totalGeneration - data.demand;
            if (diff > 0) {
                acc.totalSurplus += diff;
            } else {
                acc.totalDeficit += Math.abs(diff);
            }
            return acc;
        },
        { totalSurplus: 0, totalDeficit: 0 }
    );

    const netBalance = totalSurplus - totalDeficit;
    const balanceStatus = netBalance >= 0
      ? `Excedente de ${netBalance.toFixed(0)} MW`
      : `Déficit de ${Math.abs(netBalance).toFixed(0)} MW`;
    const balanceColor = netBalance >= 0 ? 'text-green-500' : 'text-red-500';

    return (
        <section>
            <h2 className="text-2xl font-bold flex items-center mb-6"><BrainIcon className="w-6 h-6 mr-3"/>IA & Otimização</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 {/* Left column */}
                <div className="space-y-8 lg:col-span-1">
                    <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-4">Algoritmo de Otimização</h3>
                        <div className="bg-gray-900 text-white p-4 rounded-md overflow-x-auto">
                            <pre><code className="text-sm font-mono">{algorithmCode}</code></pre>
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

                     <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-4">Balanço 24h (DAO Mauá)</h3>
                        <div className="space-y-2 text-sm">
                             <div className="flex justify-between">
                                <span>Excedente Previsto:</span>
                                <span className="font-bold text-green-500">+{totalSurplus.toFixed(0)} MW</span>
                            </div>
                             <div className="flex justify-between">
                                <span>Déficit Previsto:</span>
                                <span className="font-bold text-red-500">-{totalDeficit.toFixed(0)} MW</span>
                            </div>
                            <hr className="my-2 border-gray-200 dark:border-gray-700" />
                            <div className="flex justify-between font-bold text-base">
                                <span>Resultado Final:</span>
                                <span className={balanceColor}>{balanceStatus}</span>
                            </div>
                        </div>
                         <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                            A "Curva do Pato" (linha pontilhada rosa) ilustra o desafio da alta geração solar. Ao meio-dia, a energia solar abundante reduz a demanda líquida da rede. Ao anoitecer, com a queda da geração solar, outras fontes precisam suprir o pico de demanda. A IA gerencia essa transição: a <strong>energia eólica</strong>, frequentemente mais forte à noite, assume parte da carga. A <strong>hidrelétrica</strong> oferece flexibilidade para picos, enquanto a <strong>térmica a biocombustíveis</strong> (etanol/biodiesel) é acionada para garantir a potência máxima. As <strong>baterias</strong> injetam a energia solar armazenada, suavizando a rampa de demanda e garantindo estabilidade e custo mínimo.
                        </p>
                    </div>
                </div>
                
                {/* Right column */}
                <div className="lg:col-span-2 space-y-8">
                     <ChartCard title="Balanço Energético e Curva do Pato (Últimas 24h)" chartHeight="h-[750px]">
                         <ResponsiveContainer>
                             <ComposedChart data={combinedData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="colorSolar" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#facc15" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#facc15" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorThermal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorHydro" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorBattery" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                    </linearGradient>
                                     <linearGradient id="colorEolic" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorNuclear" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                                    </linearGradient>
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
                                 <Line type="monotone" dataKey="demand" stroke="#ed8936" strokeWidth={3} dot={false} name="Demanda"/>
                                 <Line type="monotone" dataKey="netDemand" stroke="#ec4899" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Demanda Líquida (Curva Pato)"/>
                                 <ReferenceLine x={currentHour} stroke="red" strokeDasharray="3 3" label={{ value: 'Agora', position: 'insideTop', fill: 'red' }} />
                             </ComposedChart>
                         </ResponsiveContainer>
                    </ChartCard>

                    {chartData.sevenDayForecast && chartData.sevenDayForecast.length > 0 && (
                        <>
                            <ChartCard title="Previsão do Clima (Próximos 7 Dias)" chartHeight="h-96">
                                <ResponsiveContainer>
                                    <LineChart data={chartData.sevenDayForecast} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                                        <XAxis dataKey="day" stroke="currentColor" />
                                        <YAxis yAxisId="left" stroke="#facc15" label={{ value: 'Irradiação (kWh/m²/dia)', angle: -90, position: 'insideLeft', fill: '#facc15' }} />
                                        <YAxis yAxisId="right" orientation="right" stroke="#f87171" label={{ value: 'Temp (°C)', angle: 90, position: 'insideRight', fill: '#f87171' }} />
                                        <Tooltip contentStyle={{ backgroundColor: '#2d3748', border: 'none' }} />
                                        <Legend />
                                        <Line yAxisId="left" type="monotone" dataKey="irradiacao" stroke="#facc15" strokeWidth={2} name="Irradiação (kWh/m²/dia)" />
                                        <Line yAxisId="right" type="monotone" dataKey="temp" stroke="#f87171" strokeWidth={2} name="Temperatura Média (°C)" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </ChartCard>
                            <ChartCard title="Previsão de Geração Solar (Próximos 7 Dias)" chartHeight="h-96">
                                <ResponsiveContainer>
                                    <LineChart data={chartData.sevenDayForecast} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                                        <XAxis dataKey="day" stroke="currentColor" />
                                        <YAxis stroke="#4299e1" unit=" GWh" label={{ value: 'Geração (GWh)', angle: -90, position: 'insideLeft', fill: '#4299e1' }} />
                                        <Tooltip contentStyle={{ backgroundColor: '#2d3748', border: 'none' }} formatter={(value: number) => `${value.toFixed(2)} GWh`} />
                                        <Legend />
                                        <Line type="monotone" dataKey="geracaoPrevista" stroke="#4299e1" strokeWidth={2} name="Geração Prevista (GWh)" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </ChartCard>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
};

export default AiTab;