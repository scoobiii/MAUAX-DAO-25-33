
import React from 'react';
import { CryptoAccount } from '../types';
import { CoinsIcon } from './icons';

interface BlockchainTabProps {
    cryptoAccounts: CryptoAccount[];
}

const BlockchainTab: React.FC<BlockchainTabProps> = ({ cryptoAccounts }) => {
    return (
        <section>
            <h2 className="text-2xl font-bold flex items-center mb-6"><CoinsIcon className="w-6 h-6 mr-3"/>Blockchain & Criptocontas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cryptoAccounts.map(account => (
                    <div key={account.id} className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow">
                        <h3 className="text-lg font-semibold text-accent mb-2">{account.name}</h3>
                        <p className="text-3xl font-bold mb-4">{account.balance}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-mono break-all">{account.address}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default BlockchainTab;
