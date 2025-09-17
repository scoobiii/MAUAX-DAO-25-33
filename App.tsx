import React, { useState, useEffect, useCallback } from 'react';
import { Tab, DataSource } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Alerts from './components/Alerts';
import Tabs from './components/Tabs';
import DashboardTab from './components/DashboardTab';
import InstallationsTab from './components/InstallationsTab';
import ProjectionsTab from './components/ProjectionsTab';
import EnergyMatrixTab from './components/EnergyMatrixTab';
import BlockchainTab from './components/BlockchainTab';
import AiTab from './components/AiTab';
import Vision2033Tab from './components/Vision2033Tab';
import Footer from './components/Footer';
import useMockData from './hooks/useMockData';
import { SyncIcon } from './components/icons';

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>(Tab.Vision2033);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const [isPaused, setPaused] = useState(false);
    const [dataSource, setDataSource] = useState<DataSource>(DataSource.DAO);
    const { data, refreshData, loading } = useMockData(isPaused, dataSource);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const handleThemeToggle = useCallback(() => {
        setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
    }, []);

    const renderTabContent = () => {
        switch (activeTab) {
            case Tab.Vision2033:
                return <Vision2033Tab />;
            case Tab.Dashboard:
                return <DashboardTab chartData={data.chartData} phases={data.phases} />;
            case Tab.Installations:
                return <InstallationsTab installations={data.installations} />;
            case Tab.Projections:
                return <ProjectionsTab chartData={data.chartData} />;
            case Tab.Energy:
                return <EnergyMatrixTab chartData={data.chartData} energySources={data.energySources} />;
            case Tab.Crypto:
                return <BlockchainTab cryptoAccounts={data.cryptoAccounts} />;
            case Tab.AI:
                return <AiTab chartData={data.chartData} />;
            default:
                return <DashboardTab chartData={data.chartData} phases={data.phases} />;
        }
    };
    
    if (loading && activeTab !== Tab.Vision2033) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-dark-bg text-gray-800 dark:text-dark-text">
                <div className="text-center">
                    <SyncIcon className="w-16 h-16 animate-spin mx-auto mb-4" />
                    <p className="text-xl">Carregando dados...</p>
                </div>
            </div>
        );
    }

    const isVisionTab = activeTab === Tab.Vision2033;

    return (
        <div className={`min-h-screen transition-colors duration-300 relative ${isSidebarOpen ? 'lg:pr-80' : ''}`}>
            <Sidebar 
                isOpen={isSidebarOpen} 
                onClose={() => setSidebarOpen(false)}
                theme={theme}
                onThemeToggle={handleThemeToggle}
                isPaused={isPaused}
                setPaused={setPaused}
                refreshData={refreshData}
                dataSource={dataSource}
                setDataSource={setDataSource}
            />
            <div className="flex flex-col min-h-screen">
                {!isVisionTab && (
                    <Header 
                        kpis={data.kpis} 
                        onSidebarToggle={() => setSidebarOpen(true)}
                    />
                )}
                <div className={`flex-grow ${!isVisionTab ? 'container mx-auto px-4 sm:px-6 lg:px-8 py-8' : ''}`}>
                    <main>
                         <div className={`${!isVisionTab ? '' : 'container mx-auto px-4 sm:px-6 lg:px-8 py-8'}`}>
                            {!isVisionTab && <Alerts alerts={data.alerts} />}
                            <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
                        </div>
                        <div className={isVisionTab ? "" : "mt-8"}>
                            {renderTabContent()}
                        </div>
                    </main>
                </div>
                <Footer />
            </div>
        </div>
    );
};

export default App;