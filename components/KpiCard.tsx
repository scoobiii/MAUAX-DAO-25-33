
import React from 'react';
import { Kpi } from '../types';

interface KpiCardProps {
    kpi: Kpi;
}

const KpiCard: React.FC<KpiCardProps> = ({ kpi }) => {
    const changeColor = kpi.changeType === 'increase' ? 'text-green-500' : 'text-red-500';

    return (
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm flex items-center transition-all hover:shadow-md hover:-translate-y-1">
            <div className="p-3 bg-accent/20 text-accent rounded-full mr-4">
               <kpi.icon className="w-6 h-6" />
            </div>
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{kpi.title}</p>
                <div className="flex items-baseline">
                    <p className="text-2xl font-bold">{kpi.value}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 ml-1">{kpi.unit}</p>
                </div>
                 <p className={`text-xs ${changeColor}`}>{kpi.change}</p>
            </div>
        </div>
    );
};

export default KpiCard;
