import React from 'react';
import { MoonIcon, CogIcon, TimesIcon, PauseIcon, SyncIcon, DownloadIcon, CsvIcon } from './icons';
import { DataSource } from '../types';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    theme: 'light' | 'dark';
    onThemeToggle: () => void;
    isPaused: boolean;
    setPaused: (paused: boolean) => void;
    refreshData: () => void;
    dataSource: DataSource;
    setDataSource: (source: DataSource) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, theme, onThemeToggle, isPaused, setPaused, refreshData, dataSource, setDataSource }) => {
    return (
        <>
            <div className={`fixed top-0 right-0 h-full w-80 bg-white dark:bg-dark-card shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-semibold flex items-center"><CogIcon className="w-6 h-6 mr-2" /> Controles</h3>
                        <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white">
                            <TimesIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="control-group">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tema</label>
                            <button onClick={onThemeToggle} className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                                <MoonIcon className="w-5 h-5 mr-2" />
                                <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
                            </button>
                        </div>
                        
                        <div className="control-group">
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filtros de Dados</label>
                             <div className="space-y-2">
                                <select 
                                    value={dataSource} 
                                    onChange={(e) => setDataSource(e.target.value as DataSource)}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                                >
                                    <option value={DataSource.DAO}>Dados da DAO (Projeto Mauá)</option>
                                    <option value={DataSource.SIN}>Dados do SIN (Global)</option>
                                </select>
                                <select className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
                                    <option>Todos os Setores</option>
                                    <option>Residencial</option>
                                    <option>Comercial</option>
                                    <option>Industrial</option>
                                </select>
                                <select className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
                                    <option>Todos os Tamanhos</option>
                                    <option>0-10 kW</option>
                                    <option>10-30 kW</option>
                                    <option>30+ kW</option>
                                </select>
                             </div>
                        </div>
                        
                        <div className="control-group">
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Atualizações</label>
                             <div className="flex space-x-2">
                                <button onClick={() => setPaused(!isPaused)} className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <PauseIcon className="w-5 h-5 mr-2" />
                                    {isPaused ? 'Continuar' : 'Pausar'}
                                </button>
                                <button onClick={refreshData} className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <SyncIcon className="w-5 h-5 mr-2" />
                                    Atualizar
                                </button>
                             </div>
                        </div>

                        <div className="control-group">
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Exportar</label>
                             <div className="flex space-x-2">
                                <button className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <DownloadIcon className="w-5 h-5 mr-2" />
                                    JSON
                                </button>
                                <button className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <CsvIcon className="w-5 h-5 mr-2" />
                                    CSV
                                </button>
                             </div>
                        </div>

                    </div>
                </div>
            </div>
            {isOpen && <div onClick={onClose} className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"></div>}
        </>
    );
};

export default Sidebar;
