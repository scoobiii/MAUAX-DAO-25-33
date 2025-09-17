import React, { useState, useMemo } from 'react';
import { Installation } from '../types';

type SortKey = keyof Installation;
type SortDirection = 'ascending' | 'descending';

interface SortConfig {
    key: SortKey;
    direction: SortDirection;
}

const SortableHeader: React.FC<{
    sortKey: SortKey;
    sortConfig: SortConfig | null;
    onSort: (key: SortKey) => void;
    children: React.ReactNode;
    className?: string;
}> = ({ sortKey, sortConfig, onSort, children, className }) => {
    const isSorted = sortConfig?.key === sortKey;
    const directionIcon = isSorted ? (sortConfig?.direction === 'ascending' ? '▲' : '▼') : '';

    return (
        <th className={`p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer ${className}`} onClick={() => onSort(sortKey)}>
            {children} <span className="ml-1">{directionIcon}</span>
        </th>
    );
};

const InstallationTable: React.FC<{ installations: Installation[] }> = ({ installations }) => {
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'roi', direction: 'descending' });

    const sortedInstallations = useMemo(() => {
        let sortableItems = [...installations];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [installations, sortConfig]);

    const requestSort = (key: SortKey) => {
        let direction: SortDirection = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };
    
    const headers: { key: SortKey; label: string, className?: string }[] = [
        { key: 'id', label: 'ID' },
        { key: 'setor', label: 'Setor' },
        { key: 'tamanho', label: 'Tamanho' },
        { key: 'capacity', label: 'Capacidade (m²)', className: 'text-right' },
        { key: 'efficiency', label: 'Eficiência (%)', className: 'text-right' },
        { key: 'age', label: 'Idade', className: 'text-right' },
        { key: 'roi', label: 'ROI (%)', className: 'text-right' },
        { key: 'capex', label: 'CAPEX (R$)', className: 'text-right' },
        { key: 'opex', label: 'OPEX (R$)', className: 'text-right' },
    ];
    
    const formatNumber = (num: number, options?: Intl.NumberFormatOptions) => num.toLocaleString('pt-BR', options);

    return (
        <div className="overflow-x-auto max-h-[600px]">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                    <tr>
                        {headers.map(header => (
                            <SortableHeader key={header.key} sortKey={header.key} sortConfig={sortConfig} onSort={requestSort} className={header.className}>
                                {header.label}
                            </SortableHeader>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-700">
                    {sortedInstallations.map((inst) => (
                        <tr key={inst.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="p-3 whitespace-nowrap text-sm font-mono">{inst.id}</td>
                            <td className="p-3 whitespace-nowrap text-sm">{inst.setor}</td>
                            <td className="p-3 whitespace-nowrap text-sm">{inst.tamanho}</td>
                            <td className="p-3 whitespace-nowrap text-sm text-right">{formatNumber(inst.capacity, { maximumFractionDigits: 0 })}</td>
                            <td className="p-3 whitespace-nowrap text-sm text-right">{formatNumber(inst.efficiency, { maximumFractionDigits: 1 })}</td>
                            <td className="p-3 whitespace-nowrap text-sm text-right">{formatNumber(inst.age, { maximumFractionDigits: 1 })}</td>
                            <td className="p-3 whitespace-nowrap text-sm text-right font-medium">{formatNumber(inst.roi, { maximumFractionDigits: 1 })}</td>
                            <td className="p-3 whitespace-nowrap text-sm text-right">{formatNumber(inst.capex, { style: 'currency', currency: 'BRL' })}</td>
                            <td className="p-3 whitespace-nowrap text-sm text-right">{formatNumber(inst.opex, { style: 'currency', currency: 'BRL' })}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default InstallationTable;
