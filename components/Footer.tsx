import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-white dark:bg-dark-card shadow-inner mt-auto">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                    <div>
                        <h3 className="font-bold">MEX Energy DAO</h3>
                        <p>Portal Dinâmico - Mauá Solar 2025-2033</p>
                    </div>
                    <div className="text-center md:text-right mt-4 md:mt-0">
                        <p>Produção Owner: MEX Energia | Gang of Seven Senior Scrum Team: GOS3</p>
                        <p className="mt-1">
                            Dados do Sistema Interligado Nacional (SIN) via <a href="https://dados.ons.org.br/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">API de Dados Abertos (ONS)</a>.
                        </p>
                        <div className="flex justify-center md:justify-end space-x-4 mt-2">
                             <a href="#" className="hover:text-accent">Documentação</a>
                             <a href="#" className="hover:text-accent">API</a>
                             <a href="#" className="hover:text-accent">Suporte</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;