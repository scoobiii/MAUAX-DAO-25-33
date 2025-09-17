
import React, { useState, useCallback } from 'react';
import { Kpi } from '../types';
import KpiCard from './KpiCard';
import { SolarPanelIcon, SearchIcon, SlidersIcon, ExpandIcon, TimesIcon } from './icons';

interface HeaderProps {
    kpis: Kpi[];
    onSidebarToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ kpis, onSidebarToggle }) => {
    const [isSearchVisible, setSearchVisible] = useState(false);

    const toggleFullScreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }, []);

    return (
        <header className="bg-white dark:bg-dark-card shadow-md">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex justify-between items-center mb-4">
                    <div className="header-left">
                        <h1 className="text-2xl font-bold flex items-center">
                            <SolarPanelIcon className="w-8 h-8 mr-3 text-accent" />
                            MEX Energy DAO
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Portal Dinâmico | Mauá Solar 2025-2033</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="hidden md:flex items-center space-x-2">
                             <button onClick={() => setSearchVisible(!isSearchVisible)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Buscar">
                                <SearchIcon className="w-5 h-5" />
                            </button>
                             <button onClick={onSidebarToggle} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Controles">
                                <SlidersIcon className="w-5 h-5" />
                            </button>
                            <button onClick={toggleFullScreen} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Tela Cheia">
                                <ExpandIcon className="w-5 h-5" />
                            </button>
                        </div>
                         <div className="flex items-center space-x-2">
                             <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                             <span>Online</span>
                         </div>
                    </div>
                </div>

                {isSearchVisible && (
                    <div className="relative mb-4">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Buscar instalações, setores, dados..." 
                            className="w-full pl-10 pr-10 py-2 border rounded-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                        <button onClick={() => setSearchVisible(false)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                           <TimesIcon className="w-5 h-5"/>
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {kpis.map(kpi => <KpiCard key={kpi.id} kpi={kpi} />)}
                </div>
            </div>
        </header>
    );
};

export default Header;
