import React from 'react';
import { Tab } from '../types';
import { DashboardIcon, SolarPanelIcon, ChartLineIcon, BoltIcon, CoinsIcon, BrainIcon } from './icons';

interface TabsProps {
    activeTab: Tab;
    setActiveTab: (tab: Tab) => void;
}

const tabConfig = [
    { id: Tab.Dashboard, label: 'Dashboard', icon: DashboardIcon },
    { id: Tab.Installations, label: 'Instalações', icon: SolarPanelIcon },
    { id: Tab.Projections, label: 'Projeções', icon: ChartLineIcon },
    { id: Tab.Energy, label: 'Matriz Energética', icon: BoltIcon },
    { id: Tab.Crypto, label: 'Blockchain', icon: CoinsIcon },
    { id: Tab.AI, label: 'IA & Otimização', icon: BrainIcon },
];

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
    return (
        <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
                {tabConfig.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`whitespace-nowrap flex py-4 px-1 border-b-2 font-medium text-sm items-center transition-colors
                                ${isActive 
                                    ? 'border-accent text-accent' 
                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                        >
                            <Icon className="w-5 h-5 mr-2" />
                            {tab.label}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};

export default Tabs;
