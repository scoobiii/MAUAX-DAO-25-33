import React from 'react';

// Fix: Defined enums locally to break a circular dependency with App.tsx.
export enum Tab {
    Dashboard = 'Dashboard',
    Installations = 'Installations',
    Projections = 'Projections',
    Energy = 'Energy',
    Crypto = 'Crypto',
    AI = 'AI',
}

export enum DataSource {
    DAO = 'DAO',
    SIN = 'SIN',
}

export interface Kpi {
  id: number;
  title: string;
  value: string;
  unit: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: React.ElementType;
}

export interface Alert {
  id: number;
  type: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
}

export interface Phase {
    id: number;
    title: string;
    status: 'Concluída' | 'Em Andamento' | 'Planejada';
    progress: number;
}

export interface Installation {
    id:string;
    setor: string;
    tamanho: 'Pequeno' | 'Médio' | 'Grande';
    orientacao: 'Sul' | 'Norte' | 'Leste' | 'Oeste' | 'Plano';
    efficiency: number;
    capacity: number;
    age: number;
    roi: number;
    capex: number;
    opex: number;
    lat: number;
    lng: number;
}

export interface CryptoAccount {
    id: string;
    name: string;
    balance: string;
    address: string;
}

export interface AnnualProjection {
    year: number;
    solarProduction: number; // GWh
    otherProduction: number; // GWh
    totalConsumption: number; // GWh
    gdpPerCapita: number; // USD
    energyPerCapita: number; // kWh
}

export interface ChartData {
    generation: { time: string; geracao: number; demanda: number }[];
    efficiency: { name: string; value: number }[];
    prices: { time: string; price: number }[];
    weather: { time: string; irradiacao: number, temp: number }[];
    annualProjections: AnnualProjection[];
    energyMix: { name: string, value: number, fill: string }[];
    energyPrediction: { time: string; solar: number; thermal: number; hydro: number; battery: number; eolica: number; }[];
    demandPrediction: { time: string, value: number }[];
    sevenDayForecast: { day: string; geracaoPrevista: number; irradiacao: number, temp: number }[];
}

export interface EnergySource {
    name: string;
    capacity: string;
    percentage: number;
    icon: React.ElementType;
    color: string;
}
