import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Installation } from '../types';
import InstallationTable from './InstallationTable';
import InteractiveMap from './InteractiveMap';
import ChoroplethMap from './ChoroplethMap';
import InstallationDetails from './InstallationDetails';
import TreemapChart from './TreemapChart';
import { MapIcon, TableIcon, ChartAreaIcon, ThIcon, SunIcon, ExpandIcon, TimesIcon } from './icons';

interface InstallationsTabProps {
    installations: Installation[];
}

type View = 'table' | 'map' | 'choropleth' | 'treemap' | 'potential';
type Metric = keyof Pick<Installation, 'efficiency' | 'capacity' | 'age' | 'roi' | 'capex' | 'opex' | 'carbonOffset'>;

const metricOptions: { value: Metric, label: string }[] = [
    { value: 'roi', label: 'ROI Médio' },
    { value: 'efficiency', label: 'Eficiência Média' },
    { value: 'capacity', label: 'Capacidade Total' },
    { value: 'carbonOffset', label: 'CO₂ Offset Total' },
    { value: 'age', label: 'Idade Média' },
    { value: 'capex', label: 'CAPEX Médio' },
];

const ViewButton: React.FC<{
    label: string;
    icon: React.ElementType;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, icon: Icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center space-x-2 px-3 py-1.5 rounded text-sm transition-colors ${
            isActive 
            ? 'bg-accent text-white shadow' 
            : 'text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
        }`}
    >
        <Icon className="w-4 h-4" />
        <span>{label}</span>
    </button>
);

const InstallationsTab: React.FC<InstallationsTabProps> = ({ installations }) => {
    const [activeView, setActiveView] = useState<View>('table');
    const [setorFilter, setSetorFilter] = useState<string>('all');
    const [choroplethMetric, setChoroplethMetric] = useState<Metric>('roi');
    const [selectedInstallation, setSelectedInstallation] = useState<Installation | null>(null);
    const [isMapFullscreen, setMapFullscreen] = useState(false);

    const setores = useMemo(() => ['all', ...Array.from(new Set(installations.map(i => i.setor)))], [installations]);

    const filteredInstallations = useMemo(() => {
        if (setorFilter === 'all') {
            return installations;
        }
        return installations.filter(inst => inst.setor === setorFilter);
    }, [installations, setorFilter]);
    
    const handleToggleFullscreen = useCallback(() => {
        setMapFullscreen(prev => !prev);
    }, []);

    useEffect(() => {
        const originalOverflow = document.body.style.overflow;
        if (isMapFullscreen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = originalOverflow;
        }
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [isMapFullscreen]);


    const handleSelectInstallation = (installation: Installation) => {
        setSelectedInstallation(installation);
    };

    const handleCloseDetails = () => {
        setSelectedInstallation(null);
    };

    const renderView = () => {
        switch (activeView) {
            case 'map':
                return (
                    <InteractiveMap
                        installations={installations}
                        activeSector={setorFilter}
                        onSectorSelect={setSetorFilter}
                        onInstallationSelect={handleSelectInstallation}
                    />
                );
            case 'table':
                return <InstallationTable installations={filteredInstallations} onInstallationSelect={handleSelectInstallation} />;
            case 'choropleth':
                return <ChoroplethMap installations={filteredInstallations} metric={choroplethMetric} />;
            case 'treemap':
                return <TreemapChart installations={filteredInstallations} />;
            case 'potential':
                return (
                    <div className="h-[600px] w-full">
                        <iframe
                            src="https://solar-potential-296769475687.us-central1.run.app/?_gl=1*18mi7yb*_ga*MTY5NDAwMTc0MC4xNzU5MzM0NzM5*_ga_NRWSTWS78N*czE3NTkzMzQ3MzkkbzEkZzAkdDE3NTkzMzQ3NDIkajU3JGwwJGgw"
                            title="Potencial Solar"
                            className="w-full h-full border-0 rounded-lg"
                            allowFullScreen
                        ></iframe>
                    </div>
                );
            default:
                return <div className="text-center p-8">Selecione uma visualização.</div>;
        }
    };
    
    const choroplethControls = (
        <div className="flex items-center gap-2">
            <label htmlFor="metric-select" className="text-sm font-medium whitespace-nowrap">Métrica do Mapa:</label>
            <select
                id="metric-select"
                value={choroplethMetric}
                onChange={(e) => setChoroplethMetric(e.target.value as Metric)}
                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            >
                {metricOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
        </div>
    );

    const isMapView = activeView === 'map' || activeView === 'choropleth';
    const isEdgeToEdgeView = isMapView || activeView === 'potential';

    return (
        <section className="space-y-6">
            <div className={`bg-white dark:bg-dark-card p-4 sm:p-6 rounded-lg shadow-md ${isMapFullscreen ? 'hidden' : ''}`}>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-2xl font-bold">Análise de Instalações</h2>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <select
                            value={setorFilter}
                            onChange={(e) => setSetorFilter(e.target.value)}
                            className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                            aria-label="Filtrar por setor"
                        >
                            {setores.map(setor => (
                                <option key={setor} value={setor}>{setor === 'all' ? 'Todos os Setores' : setor}</option>
                            ))}
                        </select>
                        <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
                           <ViewButton label="Tabela" icon={TableIcon} isActive={activeView === 'table'} onClick={() => setActiveView('table')} />
                           <ViewButton label="Mapa" icon={MapIcon} isActive={activeView === 'map'} onClick={() => setActiveView('map')} />
                           <ViewButton label="Calor" icon={ChartAreaIcon} isActive={activeView === 'choropleth'} onClick={() => setActiveView('choropleth')} />
                           <ViewButton label="Treemap" icon={ThIcon} isActive={activeView === 'treemap'} onClick={() => setActiveView('treemap')} />
                           <ViewButton label="Potencial" icon={SunIcon} isActive={activeView === 'potential'} onClick={() => setActiveView('potential')} />
                        </div>
                        
                        {activeView === 'choropleth' && choroplethControls}
                    </div>
                </div>
            </div>

            <div 
                className={`relative bg-white dark:bg-dark-card rounded-lg shadow-md transition-all duration-300 ease-in-out
                    ${isMapFullscreen 
                        ? 'fixed inset-0 z-50 rounded-none' 
                        : isEdgeToEdgeView ? 'p-0 overflow-hidden' : 'p-4 sm:p-6'
                    }
                `}
            >
                {renderView()}

                {isMapView && (
                    <button 
                        onClick={handleToggleFullscreen} 
                        className="absolute top-3 right-3 z-[1001] bg-white dark:bg-dark-card p-2 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-transform hover:scale-110"
                        title={isMapFullscreen ? "Sair da Tela Cheia" : "Tela Cheia"}
                        aria-label={isMapFullscreen ? "Sair da Tela Cheia" : "Ver em Tela Cheia"}
                    >
                        {isMapFullscreen ? <TimesIcon className="w-5 h-5" /> : <ExpandIcon className="w-5 h-5" />}
                    </button>
                )}
            </div>
            
            {selectedInstallation && (
                <InstallationDetails
                    installation={selectedInstallation}
                    onClose={handleCloseDetails}
                />
            )}
        </section>
    );
};

export default InstallationsTab;