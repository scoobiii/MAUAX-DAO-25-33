import { useState, useEffect, useCallback } from 'react';
import { Kpi, Alert, Phase, Installation, CryptoAccount, ChartData, EnergySource, DataSource, AnnualProjection } from '../types';
import { SolarPanelIcon, BoltIcon, ChartLineIcon, BrainIcon, SunIcon, FireIcon, WaterIcon, BatteryIcon, WindIcon } from '../components/icons';

const generateInstallations = (): Installation[] => {
    const sectorData = [
        { setor: 'Residencial', edificios: 113429, area: 17099000, consumo: 60.8279 },
        { setor: 'Hospital', edificios: 281, area: 107000, consumo: 182.2441 },
        { setor: 'Hotel', edificios: 38, area: 72000, consumo: 171.4896 },
        { setor: 'Escritório', edificios: 3918, area: 1815000, consumo: 106.0874 },
        { setor: 'Varejo', edificios: 7523, area: 2693000, consumo: 163.6198 },
        { setor: 'Depósito', edificios: 977, area: 295000, consumo: 0.1 }, // Using a small value to avoid division by zero
    ];

    const sizeDistribution: { tamanho: 'Pequeno' | 'Médio' | 'Grande'; probability: number }[] = [
        { tamanho: 'Pequeno', probability: 0.533 },
        { tamanho: 'Médio', probability: 0.351 },
        { tamanho: 'Grande', probability: 0.116 },
    ];

    const orientationDistribution = [
        { orientacao: 'Norte', probability: 0.107 },
        { orientacao: 'Sul', probability: 0.084 },
        { orientacao: 'Leste', probability: 0.089 },
        { orientacao: 'Oeste', probability: 0.095 },
        { orientacao: 'Plano', probability: 0.624 },
    ] as { orientacao: 'Sul' | 'Norte' | 'Leste' | 'Oeste' | 'Plano', probability: number }[];

    const getRandomWeighted = <T extends { probability: number }>(dist: T[]): T => {
        const rand = Math.random();
        let cumulative = 0;
        for (const item of dist) {
            cumulative += item.probability;
            if (rand < cumulative) {
                return item;
            }
        }
        return dist[dist.length - 1]; // Fallback
    };

    const installations: Installation[] = [];
    const totalEdificios = sectorData.reduce((sum, s) => sum + s.edificios, 0);
    const targetCount = 400; // Increased sample size for better representation
    let instId = 0;
    
    // Define some cluster centers to simulate neighborhoods in Mauá
    const clusters = [
        { lat: -23.6675, lng: -46.4608 }, // Center
        { lat: -23.68, lng: -46.45 },   // Southeast
        { lat: -23.65, lng: -46.47 },   // Northwest
        { lat: -23.66, lng: -46.44 },   // East
    ];
    const clusterRadius = 0.015; // Radius for points around a cluster center

    sectorData.forEach(sector => {
        const count = Math.max(1, Math.round((sector.edificios / totalEdificios) * targetCount));
        const capacityPerInstallation = sector.area / count; // Represents usable area (m^2)

        for (let i = 0; i < count; i++) {
            const sizeItem = getRandomWeighted(sizeDistribution);
            const orientationItem = getRandomWeighted(orientationDistribution);

            const efficiency = 16 + Math.random() * 6; // Efficiency percentage (16% to 22%)
            const age = Math.random() * 10;
            const capacityKW = capacityPerInstallation * 0.18; // Assuming 180W per m^2 for solar panels
            const capex = capacityKW * 3500; // R$3500 per kW installed
            const opex = capex * 0.015; // 1.5% of CAPEX for annual OPEX
            // Simplified ROI: higher efficiency and lower age -> better ROI.
            const roi = 7 + (efficiency - 16) / 6 * 10 - age / 2; // ROI between ~2% and 17%

            // Pick a random cluster
            const cluster = clusters[Math.floor(Math.random() * clusters.length)];

            // Generate a point around the cluster center using a normal-like distribution (Box-Muller transform)
            const u1 = Math.random();
            const u2 = Math.random();
            const randStdNormal1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
            const randStdNormal2 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);
            
            const lat = cluster.lat + randStdNormal1 * clusterRadius * 0.5;
            const lng = cluster.lng + randStdNormal2 * clusterRadius * 0.5;

            installations.push({
                id: `inst-${instId++}`,
                setor: sector.setor,
                capacity: capacityPerInstallation * (0.8 + Math.random() * 0.4), // Area in m^2
                efficiency: efficiency,
                age: age,
                tamanho: sizeItem.tamanho,
                orientacao: orientationItem.orientacao,
                capex: capex,
                opex: opex,
                roi: roi,
                lat,
                lng,
            });
        }
    });

    return installations;
};

const generateAnnualProjections = (): AnnualProjection[] => {
    const startYear = 2023;
    const endYear = 2033;
    const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

    // Mauá population approx 480,000
    const population = 480000; 

    // Target values for 2033
    const targetGdpPerCapita = 50000; // USD
    const targetEnergyPerCapita = 10000; // kWh

    // Initial values for 2023
    const initialGdpPerCapita = 9000; // Approx Brazil per capita
    const initialEnergyPerCapita = 2800; // Approx Brazil per capita
    const initialSolarProduction = 50; // GWh
    
    const projections: AnnualProjection[] = [];

    for (const year of years) {
        const progress = (year - startYear) / (endYear - startYear);
        
        // S-curve for smoother transitions
        const easedProgress = 1 / (1 + Math.exp(-12 * (progress - 0.5))); 

        const gdpPerCapita = initialGdpPerCapita + (targetGdpPerCapita - initialGdpPerCapita) * easedProgress;
        const energyPerCapita = initialEnergyPerCapita + (targetEnergyPerCapita - initialEnergyPerCapita) * easedProgress;
        const totalConsumption = (energyPerCapita * population) / 1_000_000; // Convert to GWh
        
        // Solar adoption also follows an S-curve
        const solarProduction = initialSolarProduction + (totalConsumption * 0.35 - initialSolarProduction) * easedProgress; // Target 35% of total consumption by 2033
        const otherProduction = totalConsumption - solarProduction;

        projections.push({
            year,
            solarProduction: parseFloat(solarProduction.toFixed(2)),
            otherProduction: parseFloat(otherProduction.toFixed(2)),
            totalConsumption: parseFloat(totalConsumption.toFixed(2)),
            gdpPerCapita: parseFloat(gdpPerCapita.toFixed(0)),
            energyPerCapita: parseFloat(energyPerCapita.toFixed(0)),
        });
    }

    return projections;
};


const generateDaoData = () => {

    return {
        kpis: [
            { id: 1, title: 'Geração do Projeto', value: '1.280', unit: 'MW', change: '+2.5%', changeType: 'increase', icon: BoltIcon },
            { id: 2, title: 'Eficiência Média', value: '18,7', unit: '%', change: '+0.2%', changeType: 'increase', icon: SolarPanelIcon },
            { id: 3, title: 'ROI do Projeto', value: '15,2', unit: '%', change: '-0.1%', changeType: 'decrease', icon: ChartLineIcon },
            { id: 4, title: 'Otimização IA', value: '98,9', unit: '%', change: '+1.1%', changeType: 'increase', icon: BrainIcon },
        ] as Kpi[],
        alerts: [
            { id: 1, type: 'info', message: 'Manutenção programada para o setor B2 em 24h.', timestamp: 'há 2 minutos' },
            { id: 2, type: 'warning', message: 'Irradiação solar abaixo do esperado no setor industrial de Capuava.', timestamp: 'há 15 minutos' },
        ] as Alert[],
        phases: [
            { id: 1, title: 'Fase 1: Piloto', status: 'Concluída', progress: 100 },
            { id: 2, title: 'Fase 2: Expansão A', status: 'Em Andamento', progress: 75 },
            { id: 3, title: 'Fase 3: Expansão B', status: 'Em Andamento', progress: 30 },
            { id: 4, title: 'Otimização', status: 'Planejada', progress: 0 },
        ] as Phase[],
        installations: generateInstallations(),
        cryptoAccounts: [
            { id: 'acc-1', name: 'Reserva de Tesouraria', balance: '1,250,000 MEX', address: '0x1A...fE3d' },
            { id: 'acc-2', name: 'Fundo de Manutenção', balance: '450,000 MEX', address: '0x2B...gH4f' },
            { id: 'acc-3', name: 'Dividendos de Energia', balance: '875,000 MEX', address: '0x3C...iJ5g' },
            { id: 'acc-4', name: 'Investimento em P&D', balance: '200,000 MEX', address: '0x4D...kL6h' },
        ] as CryptoAccount[],
        energySources: [
            { name: 'Solar', capacity: '1.100 MW', percentage: 55, icon: SunIcon, color: 'text-yellow-400' },
            { name: 'Eólica', capacity: '300 MW', percentage: 15, icon: WindIcon, color: 'text-cyan-400' },
            { name: 'Térmica (Biocombustível)', capacity: '300 MW', percentage: 15, icon: FireIcon, color: 'text-orange-500' },
            { name: 'Hidrelétrica', capacity: '200 MW', percentage: 10, icon: WaterIcon, color: 'text-blue-500' },
            { name: 'Baterias', capacity: '100 MWh', percentage: 5, icon: BatteryIcon, color: 'text-green-500' }
        ] as EnergySource[],
        chartData: {
            generation: Array.from({ length: 12 }, (_, i) => ({ time: `${i * 2}:00`, geracao: 1000 + Math.random() * 300, demanda: 900 + Math.random() * 400 })),
            efficiency: [{ name: 'Residencial', value: 19.2 }, { name: 'Comercial', value: 18.5 }, { name: 'Industrial', value: 18.1 }],
            prices: Array.from({ length: 12 }, (_, i) => ({ time: `${i * 2}:00`, price: 0.5 + Math.random() * 0.2 })),
            weather: Array.from({ length: 12 }, (_, i) => ({ time: `${i * 2}:00`, irradiacao: 800 + Math.random() * 200, temp: 20 + Math.random() * 5 })),
            annualProjections: generateAnnualProjections(),
            energyMix: [{ name: 'Solar', value: 55, fill: '#facc15' }, { name: 'Eólica', value: 15, fill: '#22d3ee' }, { name: 'Térmica', value: 15, fill: '#f97316' }, { name: 'Hidro', value: 10, fill: '#3b82f6' }, { name: 'Baterias', value: 5, fill: '#22c55e' }],
            energyPrediction: Array.from({ length: 24 }, (_, i) => {
                const solar = (i >= 6 && i <= 18) ? (1100 * Math.sin((i - 6) * Math.PI / 12) + (Math.random() - 0.5) * 100) : Math.random() * 5;
                const eolica = (i < 7 || i > 18) ? 250 + (Math.random()) * 50 : 80 + (Math.random()) * 40;
                let hydro = 100 + (Math.random() - 0.5) * 15;
                if (i >= 17 && i <= 22) { hydro = 200 + (Math.random() - 0.5) * 20; }
                let thermal = 10 + Math.random() * 10;
                if (i >= 18 && i <= 21) { thermal = 250 + (Math.random()) * 50; }
                const battery = (i >= 18 && i <= 22) ? 25 + (Math.random() - 0.5) * 10 : 0;
                return { time: `${i}:00`, solar: Math.max(0, solar), thermal: Math.max(0, thermal), hydro: Math.max(0, hydro), battery: Math.max(0, battery), eolica: Math.max(0, eolica) };
            }),
            demandPrediction: Array.from({ length: 24 }, (_, i) => {
                const baseDemand = 1000;
                const dailyFluctuation = Math.sin((i - 2) * Math.PI / 12) * 200;
                const eveningPeak = Math.exp(-Math.pow(i - 19, 2) / 4) * 500;
                const value = baseDemand + dailyFluctuation + eveningPeak + (Math.random() - 0.5) * 100;
                return { time: `${i}:00`, value };
            }),
            sevenDayForecast: Array.from({ length: 7 }, (_, i) => ({
                day: `D+${i + 1}`,
                geracaoPrevista: 6.4 + (Math.random() - 0.5) * 2,
                irradiacao: 5.5 + (Math.random() - 0.5) * 2,
                temp: 24 + (Math.random() - 0.5) * 6,
            })),
        } as ChartData,
    };
};

const generateSinData = () => { // Used as a fallback if API fails
    return {
        kpis: [
            { id: 1, title: 'Carga do SIN', value: '75,3', unit: 'GW', change: '+1.8%', changeType: 'increase', icon: BoltIcon },
            { id: 2, title: 'Geração Hidro', value: '45,1', unit: 'GW', change: '-0.5%', changeType: 'decrease', icon: WaterIcon },
            { id: 3, title: 'CMO (Sudeste)', value: '180,5', unit: 'R$/MWh', change: '+3.2%', changeType: 'increase', icon: ChartLineIcon },
            { id: 4, title: 'Geração Solar/Eólica', value: '15,2', unit: 'GW', change: '+4.5%', changeType: 'increase', icon: SunIcon },
        ] as Kpi[],
        alerts: [{ id: 1, type: 'critical', message: 'Falha ao carregar dados do ONS. Exibindo dados de exemplo.', timestamp: 'agora' },] as Alert[],
        phases: [], installations: [], cryptoAccounts: [],
        energySources: [
            { name: 'Hidrelétrica', capacity: '109 GW', percentage: 60, icon: WaterIcon, color: 'text-blue-500' },
            { name: 'Eólica + Solar', capacity: '36 GW', percentage: 20, icon: SunIcon, color: 'text-yellow-400' },
            { name: 'Térmica (Total)', capacity: '27 GW', percentage: 15, icon: FireIcon, color: 'text-orange-500' },
            { name: 'Outras', capacity: '9 GW', percentage: 5, icon: BoltIcon, color: 'text-green-500' }
        ] as EnergySource[],
        chartData: {
            generation: Array.from({ length: 12 }, (_, i) => ({ time: `${i * 2}:00`, geracao: 70000 + Math.random() * 8000, demanda: 68000 + Math.random() * 8000 })),
            efficiency: [],
            prices: Array.from({ length: 12 }, (_, i) => ({ time: `${i * 2}:00`, price: 150 + Math.random() * 50 })),
            weather: [],
            annualProjections: [],
            energyMix: [{ name: 'Hidro', value: 60, fill: '#3b82f6' }, { name: 'Eólica/Solar', value: 20, fill: '#facc15' }, { name: 'Térmica', value: 15, fill: '#f97316' }, { name: 'Outras', value: 5, fill: '#22c55e' }],
            energyPrediction: [], demandPrediction: [], sevenDayForecast: [],
        } as ChartData,
    };
};

const fetchSinData = async () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const formatDateForApi = (date: Date) => date.toISOString().slice(0, 19);
    const baseUrl = 'https://dados.ons.org.br/api/3/action/datastore_search_sql?sql=';

    const genResourceId = 'b3c32060-c651-412e-9f69-a1b4d008784b';
    const loadResourceId = '72a8da6c-67b1-4d37-8588-a734a7a1343a';
    const priceResourceId = 'd7935817-92d5-4999-88c1-0164a34b223d';

    const genQuery = `SELECT * from "${genResourceId}" WHERE din_instante >= '${formatDateForApi(yesterday)}' ORDER BY din_instante ASC`;
    const loadQuery = `SELECT * from "${loadResourceId}" WHERE din_instante >= '${formatDateForApi(yesterday)}' ORDER BY din_instante ASC`;
    const priceQuery = `SELECT * from "${priceResourceId}" WHERE din_instante >= '${formatDateForApi(yesterday)}' AND id_submercado = 'SE' ORDER BY din_instante ASC`;

    const [genRes, loadRes, priceRes] = await Promise.all([
        fetch(baseUrl + encodeURIComponent(genQuery)),
        fetch(baseUrl + encodeURIComponent(loadQuery)),
        fetch(baseUrl + encodeURIComponent(priceQuery)),
    ]);

    if (!genRes.ok || !loadRes.ok || !priceRes.ok) throw new Error('Failed to fetch data from ONS');

    const genJson = await genRes.json();
    const loadJson = await loadRes.json();
    const priceJson = await priceRes.json();

    const hourlyData: { [time: string]: any } = {};
    genJson.result.records.forEach((r:any) => {
        const time = r.din_instante;
        if (!hourlyData[time]) hourlyData[time] = { hydro: 0, thermal: 0, solar: 0, eolica: 0 };
        hourlyData[time].hydro += r.val_geracao_hidraulica || 0;
        hourlyData[time].thermal += (r.val_geracao_termica || 0) + (r.val_geracao_nuclear || 0);
        hourlyData[time].solar += r.val_geracao_solar || 0;
        hourlyData[time].eolica += r.val_geracao_eolica || 0;
    });

    loadJson.result.records.forEach((r:any) => {
        const time = r.din_instante;
        if (!hourlyData[time]) hourlyData[time] = {};
        if (!hourlyData[time].demand) hourlyData[time].demand = 0;
        hourlyData[time].demand += r.val_cargahoraria || 0;
    });

    priceJson.result.records.forEach((r:any) => {
        if (hourlyData[r.din_instante]) hourlyData[r.din_instante].price = r.val_pld || 0;
    });

    const chartTimeData = Object.keys(hourlyData).sort().map(time => {
        const data = hourlyData[time];
        return {
            time: `${new Date(time).getHours()}:00`,
            geracao: (data.hydro || 0) + (data.thermal || 0) + (data.solar || 0) + (data.eolica || 0),
            demanda: data.demand, price: data.price, ...data
        }
    }).filter(d => d.demanda && d.geracao > 0);

    if (chartTimeData.length === 0) throw new Error("No valid data from ONS API");

    const latestData = chartTimeData[chartTimeData.length - 1];
    const totalGeneration = latestData.geracao;
    const hydroGeneration = latestData.hydro;
    const solarEolicaGeneration = latestData.solar + latestData.eolica;

    const toGW = (val:number) => (val / 1000).toFixed(1).replace('.', ',');

    const kpis: Kpi[] = [
        { id: 1, title: 'Carga do SIN', value: toGW(latestData.demanda), unit: 'GW', change: '', changeType: 'increase', icon: BoltIcon },
        { id: 2, title: 'Geração Hidro', value: toGW(hydroGeneration), unit: 'GW', change: '', changeType: 'decrease', icon: WaterIcon },
        { id: 3, title: 'PLD (Sudeste)', value: (latestData.price || 0).toFixed(1).replace('.',','), unit: 'R$/MWh', change: '', changeType: 'increase', icon: ChartLineIcon },
        { id: 4, title: 'Geração Solar/Eólica', value: toGW(solarEolicaGeneration), unit: 'GW', change: '', changeType: 'increase', icon: SunIcon },
    ];

    const energySources = [
        { name: 'Hidrelétrica', capacity: `${toGW(hydroGeneration)} GW`, percentage: Math.round((hydroGeneration / totalGeneration) * 100), icon: WaterIcon, color: 'text-blue-500' },
        { name: 'Eólica + Solar', capacity: `${toGW(solarEolicaGeneration)} GW`, percentage: Math.round((solarEolicaGeneration / totalGeneration) * 100), icon: SunIcon, color: 'text-yellow-400' },
        { name: 'Térmica (Total)', capacity: `${toGW(latestData.thermal)} GW`, percentage: Math.round((latestData.thermal / totalGeneration) * 100), icon: FireIcon, color: 'text-orange-500' },
    ];
    
    const energyMix = energySources.map(s => ({ name: s.name.split(' ')[0], value: s.percentage, fill: s.color.startsWith('text-blue') ? '#3b82f6' : s.color.startsWith('text-yellow') ? '#facc15' : '#f97316' }));

    return {
        kpis, alerts: [], phases: [], installations: [], cryptoAccounts: [], energySources,
        chartData: {
            generation: chartTimeData.map(d => ({ time: d.time, geracao: d.geracao, demanda: d.demanda })),
            prices: chartTimeData.map(d => ({ time: d.time, price: d.price })),
            energyPrediction: chartTimeData.map(d => ({ time: d.time, solar: d.solar, thermal: d.thermal, hydro: d.hydro, battery: 0, eolica: d.eolica })),
            demandPrediction: chartTimeData.map(d => ({ time: d.time, value: d.demanda })),
            energyMix, efficiency: [], weather: [], annualProjections: [], sevenDayForecast: [],
        },
    };
};

const useMockData = (isPaused: boolean, dataSource: DataSource) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(() => generateDaoData());

    const loadData = useCallback(async (source: DataSource) => {
        setLoading(true);
        try {
            const newData = source === DataSource.SIN ? await fetchSinData() : generateDaoData();
            setData(newData);
        } catch (error) {
            console.error(`Falha ao carregar dados para ${source}, usando dados de exemplo.`, error);
            setData(source === DataSource.SIN ? generateSinData() : generateDaoData());
        } finally {
            setTimeout(() => setLoading(false), 500);
        }
    }, []);

    useEffect(() => {
        loadData(dataSource);
    }, [dataSource, loadData]);

    const updateData = useCallback(() => {
        if (dataSource === DataSource.SIN) return;

        setData(prevData => {
            const newKpis = prevData.kpis.map(kpi => {
                const change = (Math.random() - 0.5) * 0.2;
                const currentValue = parseFloat(kpi.value.replace(',', '.'));
                const newValue = currentValue * (1 + change / 100);
                return { ...kpi, value: newValue.toFixed(1).replace('.',','), change: `${change > 0 ? '+' : ''}${(change).toFixed(1)}%`, changeType: (change > 0 ? 'increase' : 'decrease') as 'increase' | 'decrease' };
            });

            const lastGen = prevData.chartData.generation[prevData.chartData.generation.length - 1];
            const newGeneration = [
                ...prevData.chartData.generation.slice(1),
                { time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }), geracao: lastGen.geracao + (Math.random() - 0.5) * 50, demanda: lastGen.demanda + (Math.random() - 0.5) * 50 }
            ];

            return { ...prevData, kpis: newKpis, chartData: { ...prevData.chartData, generation: newGeneration } };
        });
    }, [dataSource]);

    const refreshData = useCallback(() => {
       loadData(dataSource);
    }, [dataSource, loadData]);

    useEffect(() => {
        if (isPaused || loading || dataSource === DataSource.SIN) return;
        const interval = setInterval(updateData, 3000);
        return () => clearInterval(interval);
    }, [isPaused, updateData, loading, dataSource]);

    return { data, refreshData, loading };
};

export default useMockData;