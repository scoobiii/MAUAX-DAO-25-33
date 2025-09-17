
import React, { useState } from 'react';
import { Alert } from '../types';
import { BellIcon, TrashIcon } from './icons';

interface AlertsProps {
    alerts: Alert[];
}

const alertStyles = {
    info: 'bg-blue-100 dark:bg-blue-900/50 border-blue-500',
    warning: 'bg-yellow-100 dark:bg-yellow-900/50 border-yellow-500',
    critical: 'bg-red-100 dark:bg-red-900/50 border-red-500',
};

const Alerts: React.FC<AlertsProps> = ({ alerts: initialAlerts }) => {
    const [alerts, setAlerts] = useState(initialAlerts);

    const clearAlerts = () => {
        setAlerts([]);
    };
    
    if (alerts.length === 0) return null;

    return (
        <div className="mb-8 p-4 bg-white dark:bg-dark-card rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold flex items-center"><BellIcon className="w-5 h-5 mr-2" /> Alertas em Tempo Real</h4>
                <button onClick={clearAlerts} className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400" title="Limpar Alertas">
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="space-y-2">
                {alerts.map(alert => (
                    <div key={alert.id} className={`p-3 rounded-md border-l-4 ${alertStyles[alert.type]}`}>
                        <p className="text-sm">{alert.message}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{alert.timestamp}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Alerts;
