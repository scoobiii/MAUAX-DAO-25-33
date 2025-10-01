import React, { useEffect, useCallback } from 'react';
import { Installation } from '../types';
import { TimesIcon, SolarPanelIcon, BoltIcon, CoinsIcon, LeafIcon } from './icons';

interface InstallationDetailsProps {
    installation: Installation;
    onClose: () => void;
}

const DetailItem: React.FC<{ label: string; value: string | number; unit?: string; className?: string }> = ({ label, value, unit, className }) => (
    <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className={`text-lg font-semibold ${className}`}>
            {value} <span className="text-sm font-normal">{unit}</span>
        </p>
    </div>
);

const InstallationDetails: React.FC<InstallationDetailsProps> = ({ installation, onClose }) => {
    
    // Handle Escape key press to close the modal
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            onClose();
        }
    }, [onClose]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    const formatNumber = (num: number, options?: Intl.NumberFormatOptions) => num.toLocaleString('pt-BR', options);

    const roiColor = installation.roi > 10 ? 'text-green-500' : installation.roi > 5 ? 'text-yellow-500' : 'text-red-500';

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="installation-details-title"
        >
            <div 
                className="bg-white dark:bg-dark-card rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all animate-fade-in-up"
                onClick={e => e.stopPropagation()} // Prevent closing when clicking inside the modal
            >
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-dark-card">
                    <h2 id="installation-details-title" className="text-xl font-bold flex items-center">
                        <SolarPanelIcon className="w-6 h-6 mr-3 text-accent" />
                        Detalhes da Instalação: <span className="font-mono ml-2">{installation.id}</span>
                    </h2>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white" aria-label="Fechar">
                        <TimesIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* General Info */}
                    <section>
                        <h3 className="text-lg font-semibold mb-3 border-l-4 border-accent pl-2">Informações Gerais</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                            <DetailItem label="Setor" value={installation.setor} />
                            <DetailItem label="Tamanho" value={installation.tamanho} />
                            <DetailItem label="Orientação" value={installation.orientacao} />
                            <DetailItem label="Idade" value={formatNumber(installation.age, { maximumFractionDigits: 1 })} unit="anos" />
                        </div>
                    </section>
                    
                    {/* Performance & Impact */}
                    <section>
                         <h3 className="text-lg font-semibold mb-3 border-l-4 border-accent pl-2">Desempenho & Impacto</h3>
                         <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center">
                                <BoltIcon className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">Eficiência</p>
                                <p className="text-2xl font-bold">{formatNumber(installation.efficiency, { maximumFractionDigits: 1 })}<span className="text-base font-normal">%</span></p>
                            </div>
                             <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center">
                                <SolarPanelIcon className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">Capacidade</p>
                                <p className="text-2xl font-bold">{formatNumber(installation.capacity, { maximumFractionDigits: 0 })}<span className="text-base font-normal"> m²</span></p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center col-span-2 md:col-span-1">
                                <LeafIcon className="w-8 h-8 mx-auto text-green-500 mb-2" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">CO₂ Offset Anual</p>
                                <p className="text-2xl font-bold">{formatNumber(installation.carbonOffset, { maximumFractionDigits: 0 })}<span className="text-base font-normal"> kg</span></p>
                            </div>
                         </div>
                    </section>

                    {/* Financial Data */}
                    <section>
                        <h3 className="text-lg font-semibold mb-3 border-l-4 border-accent pl-2">Dados Financeiros</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                            <DetailItem 
                                label="Retorno Sobre Investimento (ROI)" 
                                value={formatNumber(installation.roi, { maximumFractionDigits: 1 })} 
                                unit="%"
                                className={roiColor}
                            />
                            <DetailItem 
                                label="CAPEX" 
                                value={formatNumber(installation.capex, { style: 'currency', currency: 'BRL' })}
                            />
                            <DetailItem 
                                label="OPEX (Anual)" 
                                value={formatNumber(installation.opex, { style: 'currency', currency: 'BRL' })}
                            />
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default InstallationDetails;
