import React from 'react';
import {
    CoinsIcon, BoltIcon, UsersIcon, HeartIcon, BookOpenIcon, DropletIcon, ChartLineIcon, BuildingIcon, InequalityIcon, LeafIcon, ShieldCheckIcon
} from './icons';

const goals = [
    {
        icon: CoinsIcon,
        title: "Renda Per Capita",
        description: "Renda média por habitante, refletindo o poder de compra e qualidade de vida.",
        currentValue: 9500,
        goalValue: 50000,
        unit: "$",
        isCurrency: true,
        isPoints: false,
    },
    {
        icon: BoltIcon,
        title: "Consumo de Energia",
        description: "Consumo de energia per capita, indicando desenvolvimento industrial e acesso.",
        currentValue: 2800,
        goalValue: 10000,
        unit: "KWh",
        isCurrency: false,
        isPoints: false,
    },
    {
        icon: UsersIcon,
        title: "Erradicação da Pobreza",
        description: "Progresso na redução da pobreza e vulnerabilidade social.",
        currentValue: 68.5,
        goalValue: 92,
        unit: "pontos",
        isCurrency: false,
        isPoints: true,
    },
    {
        icon: HeartIcon,
        title: "Saúde e Bem-Estar",
        description: "Acesso e qualidade dos serviços de saúde para todos os cidadãos.",
        currentValue: 72.1,
        goalValue: 95,
        unit: "pontos",
        isCurrency: false,
        isPoints: true,
    },
    {
        icon: BookOpenIcon,
        title: "Educação de Qualidade",
        description: "Qualidade do ensino, infraestrutura escolar e acesso à educação.",
        currentValue: 64.1,
        goalValue: 90,
        unit: "pontos",
        isCurrency: false,
        isPoints: true,
    },
    {
        icon: DropletIcon,
        title: "Água Potável e Saneamento",
        description: "Disponibilidade e gestão sustentável da água e saneamento.",
        currentValue: 81.3,
        goalValue: 98,
        unit: "pontos",
        isCurrency: false,
        isPoints: true,
    },
    {
        icon: ChartLineIcon,
        title: "Trabalho e Crescimento",
        description: "Promoção do crescimento econômico sustentado e emprego pleno.",
        currentValue: 59.8,
        goalValue: 88,
        unit: "pontos",
        isCurrency: false,
        isPoints: true,
    },
    {
        icon: BuildingIcon,
        title: "Indústria e Inovação",
        description: "Infraestrutura resiliente, industrialização inclusiva e fomento à inovação.",
        currentValue: 61,
        goalValue: 85,
        unit: "pontos",
        isCurrency: false,
        isPoints: true,
    },
    {
        icon: InequalityIcon,
        title: "Redução das Desigualdades",
        description: "Progresso na redução da desigualdade de renda e oportunidades.",
        currentValue: 55.4,
        goalValue: 82,
        unit: "pontos",
        isCurrency: false,
        isPoints: true,
    },
    {
        icon: BuildingIcon,
        title: "Cidades Sustentáveis",
        description: "Tornar as cidades inclusivas, seguras, resilientes e sustentáveis.",
        currentValue: 70.2,
        goalValue: 93,
        unit: "pontos",
        isCurrency: false,
        isPoints: true,
    },
    {
        icon: LeafIcon,
        title: "Consumo Responsável",
        description: "Assegurar padrões de produção e de consumo sustentáveis.",
        currentValue: 63.7,
        goalValue: 89,
        unit: "pontos",
        isCurrency: false,
        isPoints: true,
    },
    {
        icon: ShieldCheckIcon,
        title: "Paz, Justiça e Instituições",
        description: "Promover sociedades pacíficas e inclusivas para o desenvolvimento.",
        currentValue: 69.1,
        goalValue: 91,
        unit: "pontos",
        isCurrency: false,
        isPoints: true,
    },
];

const GoalCard: React.FC<typeof goals[0]> = ({ icon: Icon, title, description, currentValue, goalValue, unit, isCurrency, isPoints }) => {
    
    const formatValue = (value: number) => {
        if (isCurrency) {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
        }
        if (isPoints) {
            return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value);
        }
        return new Intl.NumberFormat('pt-BR').format(value);
    };

    const progress = (currentValue / goalValue) * 100;
    
    const iconColorMap: { [key: string]: string } = {
        "Renda Per Capita": "text-green-400 bg-green-900",
        "Consumo de Energia": "text-yellow-400 bg-yellow-900",
        "Erradicação da Pobreza": "text-red-400 bg-red-900",
        "Saúde e Bem-Estar": "text-pink-400 bg-pink-900",
        "Educação de Qualidade": "text-purple-400 bg-purple-900",
        "Água Potável e Saneamento": "text-blue-400 bg-blue-900",
        "Trabalho e Crescimento": "text-teal-400 bg-teal-900",
        "Indústria e Inovação": "text-gray-400 bg-gray-600",
        "Redução das Desigualdades": "text-orange-400 bg-orange-900",
        "Cidades Sustentáveis": "text-lime-400 bg-lime-900",
        "Consumo Responsável": "text-cyan-400 bg-cyan-900",
        "Paz, Justiça e Instituições": "text-indigo-400 bg-indigo-900",
    };
    
    const iconStyle = iconColorMap[title] || "text-gray-400 bg-gray-900";

    return (
        <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6 flex flex-col justify-between transition-all hover:border-accent hover:shadow-2xl hover:shadow-accent/10 hover:-translate-y-1">
            <div>
                <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${iconStyle}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">{title}</h3>
                        <p className="text-sm text-gray-400 mt-1 h-14">{description}</p>
                    </div>
                </div>
                <div className="flex items-center justify-between my-6">
                    <div>
                        <p className="text-xs text-gray-500">HOJE</p>
                        <p className="text-2xl font-semibold text-white">{formatValue(currentValue)}</p>
                    </div>
                    <span className="text-2xl text-gray-500 mx-2">→</span>
                    <div>
                        <p className="text-xs text-gray-500 text-right">META 2033</p>
                        <p className="text-2xl font-semibold text-accent">{formatValue(goalValue)} {isPoints ? "" : unit}</p>
                    </div>
                </div>
            </div>
            <div>
                <p className="text-xs text-gray-400 mb-1">Progresso para a Meta</p>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div className="bg-gradient-to-r from-green-500 to-teal-400 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
        </div>
    );
};


const Vision2033Tab = () => {
    return (
        <div className="bg-gray-800 text-white font-sans -mx-4 sm:-mx-6 lg:-mx-8 -my-8 p-8 sm:p-12">
            <header className="text-center mb-12 animate-fade-in">
                <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    Visão Mauá 2033
                </h1>
                <p className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto">
                    Projeção de Mauá no ranking Top 10 do Índice de Desenvolvimento Sustentável das Cidades (IDSC).
                </p>
            </header>
            <main>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {goals.map((goal, index) => (
                        <div key={goal.title} style={{ animationDelay: `${index * 50}ms`}} className="animate-fade-in-up">
                            <GoalCard {...goal} />
                        </div>
                    ))}
                </div>
            </main>
            <footer className="text-center mt-12 text-sm text-gray-500">
                <p>Dados de indicadores baseados no IDSC e metas projetadas para 2033.</p>
                <p>© 2024 Projeção de Desenvolvimento Sustentável de Mauá.</p>
            </footer>
        </div>
    );
};

export default Vision2033Tab;
