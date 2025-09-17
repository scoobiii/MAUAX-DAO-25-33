import React from 'react';

interface ChartCardProps {
    title: string;
    children: React.ReactNode;
    className?: string;
    controls?: React.ReactNode;
    chartHeight?: string;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, children, className, controls, chartHeight = 'h-64' }) => {
    return (
        <div className={`bg-white dark:bg-dark-card p-4 sm:p-6 rounded-lg shadow-md transition-all hover:shadow-lg ${className}`}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">{title}</h3>
                {controls && <div className="chart-controls">{controls}</div>}
            </div>
            <div className={chartHeight}>
                 {children}
            </div>
        </div>
    );
};

export default ChartCard;