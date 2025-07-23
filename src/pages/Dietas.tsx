import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UtensilsCrossed, Leaf, Coffee, Sun, Sunset, Moon, Clock, AlertCircle, ExternalLink } from 'lucide-react';

interface MealItem {
  item: string;
  quantidade: string;
}

interface Refeicao {
  nome: string;
  icon: React.ReactNode;
  items: MealItem[];
}

interface PlanoDieta {
  id: string;
  nome: string;
  descricao: string;
  faixaPeso: string;
  isVegetariano?: boolean;
  refeicoes: Refeicao[];
}

const planosNutricionais: PlanoDieta[] = [
  {
    id: 'ate-60kg',
    nome: 'Plano até 60kg',
    descricao: 'Plano nutricional personalizado para pessoas de até 60kg',
    faixaPeso: 'Até 60kg',
    refeicoes: [
      {
        nome: 'Café da Manhã',
        icon: <Coffee className="w-4 h-4" />,
        items: [
          { item: '2 fatias de pão integral', quantidade: '' },
          { item: '1 ovo mexido', quantidade: '' },
          { item: '1 xícara de café com leite desnatado', quantidade: '' },
          { item: '1 fruta (banana ou maçã)', quantidade: '' }
        ]
      },
      {
        nome: 'Almoço',
        icon: <Sun className="w-4 h-4" />,
        items: [
          { item: '150g de peito de frango grelhado', quantidade: '' },
          { item: '1 xícara de arroz integral', quantidade: '' },
          { item: '1/2 xícara de feijão', quantidade: '' },
          { item: 'Salada verde à vontade', quantidade: '' },
          { item: '1 colher de azeite', quantidade: '' }
        ]
      },
      {
        nome: 'Lanche da Tarde',
        icon: <Sunset className="w-4 h-4" />,
        items: [
          { item: '1 iogurte natural', quantidade: '' },
          { item: '1 colher de granola', quantidade: '' },
          { item: '5 castanhas', quantidade: '' }
        ]
      },
      {
        nome: 'Jantar',
        icon: <Moon className="w-4 h-4" />,
        items: [
          { item: '120g de peixe grelhado', quantidade: '' },
          { item: 'Legumes refogados', quantidade: '' },
          { item: '1 batata doce pequena', quantidade: '' },
          { item: 'Salada de folhas verdes', quantidade: '' }
        ]
      }
    ]
  },
  {
    id: '60-70kg',
    nome: 'Plano 60-70kg',
    descricao: 'Plano nutricional balanceado para faixa de peso intermediária',
    faixaPeso: '60kg - 70kg',
    refeicoes: [
      {
        nome: 'Café da Manhã',
        icon: <Coffee className="w-4 h-4" />,
        items: [
          { item: '3 fatias de pão integral', quantidade: '' },
          { item: '2 ovos mexidos', quantidade: '' },
          { item: '1 xícara de café com leite desnatado', quantidade: '' },
          { item: '1 fruta + 1 colher de mel', quantidade: '' }
        ]
      },
      {
        nome: 'Almoço',
        icon: <Sun className="w-4 h-4" />,
        items: [
          { item: '180g de peito de frango grelhado', quantidade: '' },
          { item: '1,5 xícara de arroz integral', quantidade: '' },
          { item: '1/2 xícara de feijão', quantidade: '' },
          { item: 'Salada verde à vontade', quantidade: '' },
          { item: '1 colher de azeite', quantidade: '' }
        ]
      },
      {
        nome: 'Lanche da Tarde',
        icon: <Sunset className="w-4 h-4" />,
        items: [
          { item: '1 iogurte grego', quantidade: '' },
          { item: '1 colher de granola', quantidade: '' },
          { item: '8 castanhas', quantidade: '' },
          { item: '1 fruta pequena', quantidade: '' }
        ]
      },
      {
        nome: 'Jantar',
        icon: <Moon className="w-4 h-4" />,
        items: [
          { item: '150g de peixe grelhado', quantidade: '' },
          { item: 'Legumes refogados', quantidade: '' },
          { item: '1 batata doce média', quantidade: '' },
          { item: 'Salada de folhas verdes', quantidade: '' }
        ]
      }
    ]
  },
  {
    id: '70-80kg',
    nome: 'Plano 70-80kg',
    descricao: 'Plano nutricional robusto para maior demanda energética',
    faixaPeso: '70kg - 80kg',
    refeicoes: [
      {
        nome: 'Café da Manhã',
        icon: <Coffee className="w-4 h-4" />,
        items: [
          { item: '3 fatias de pão integral', quantidade: '' },
          { item: '2 ovos mexidos + 2 claras', quantidade: '' },
          { item: '1 xícara de café com leite desnatado', quantidade: '' },
          { item: '1 fruta + 1 colher de mel', quantidade: '' },
          { item: '1 fatia de queijo branco', quantidade: '' }
        ]
      },
      {
        nome: 'Almoço',
        icon: <Sun className="w-4 h-4" />,
        items: [
          { item: '200g de peito de frango grelhado', quantidade: '' },
          { item: '2 xícaras de arroz integral', quantidade: '' },
          { item: '3/4 xícara de feijão', quantidade: '' },
          { item: 'Salada verde à vontade', quantidade: '' },
          { item: '1 colher de azeite', quantidade: '' }
        ]
      },
      {
        nome: 'Lanche da Tarde',
        icon: <Sunset className="w-4 h-4" />,
        items: [
          { item: '1 iogurte grego', quantidade: '' },
          { item: '2 colheres de granola', quantidade: '' },
          { item: '10 castanhas', quantidade: '' },
          { item: '1 fruta média', quantidade: '' }
        ]
      },
      {
        nome: 'Jantar',
        icon: <Moon className="w-4 h-4" />,
        items: [
          { item: '180g de peixe ou carne vermelha magra', quantidade: '' },
          { item: 'Legumes refogados', quantidade: '' },
          { item: '1 batata doce grande', quantidade: '' },
          { item: 'Salada de folhas verdes', quantidade: '' }
        ]
      }
    ]
  },
  {
    id: '70-80kg-vegetariano',
    nome: 'Plano 70-80kg (Vegetariano)',
    descricao: 'Plano vegetariano completo e balanceado',
    faixaPeso: '70kg - 80kg',
    isVegetariano: true,
    refeicoes: [
      {
        nome: 'Café da Manhã',
        icon: <Coffee className="w-4 h-4" />,
        items: [
          { item: '3 fatias de pão integral', quantidade: '' },
          { item: '2 ovos mexidos', quantidade: '' },
          { item: '1 xícara de leite de amêndoas', quantidade: '' },
          { item: '1 fruta + 1 colher de mel', quantidade: '' },
          { item: '1 fatia de queijo vegano', quantidade: '' }
        ]
      },
      {
        nome: 'Almoço',
        icon: <Sun className="w-4 h-4" />,
        items: [
          { item: '150g de tofu grelhado ou proteína de soja', quantidade: '' },
          { item: '2 xícaras de arroz integral', quantidade: '' },
          { item: '3/4 xícara de feijão', quantidade: '' },
          { item: '1/2 xícara de quinoa', quantidade: '' },
          { item: 'Salada verde à vontade', quantidade: '' },
          { item: '1 colher de azeite', quantidade: '' }
        ]
      },
      {
        nome: 'Lanche da Tarde',
        icon: <Sunset className="w-4 h-4" />,
        items: [
          { item: '1 iogurte de coco', quantidade: '' },
          { item: '2 colheres de granola', quantidade: '' },
          { item: '10 castanhas', quantidade: '' },
          { item: '1 fruta média', quantidade: '' }
        ]
      },
      {
        nome: 'Jantar',
        icon: <Moon className="w-4 h-4" />,
        items: [
          { item: '150g de grão-de-bico ou lentilha', quantidade: '' },
          { item: 'Legumes refogados', quantidade: '' },
          { item: '1 batata doce grande', quantidade: '' },
          { item: 'Salada de folhas verdes', quantidade: '' },
          { item: 'Sementes de girassol', quantidade: '' }
        ]
      }
    ]
  },
  {
    id: '80-90kg',
    nome: 'Plano 80-90kg',
    descricao: 'Plano nutricional intensivo para alta demanda calórica',
    faixaPeso: '80kg - 90kg',
    refeicoes: [
      {
        nome: 'Café da Manhã',
        icon: <Coffee className="w-4 h-4" />,
        items: [
          { item: '4 fatias de pão integral', quantidade: '' },
          { item: '3 ovos mexidos', quantidade: '' },
          { item: '1 xícara de café com leite desnatado', quantidade: '' },
          { item: '1 fruta grande + 1 colher de mel', quantidade: '' },
          { item: '2 fatias de queijo branco', quantidade: '' }
        ]
      },
      {
        nome: 'Almoço',
        icon: <Sun className="w-4 h-4" />,
        items: [
          { item: '250g de peito de frango grelhado', quantidade: '' },
          { item: '2,5 xícaras de arroz integral', quantidade: '' },
          { item: '1 xícara de feijão', quantidade: '' },
          { item: 'Salada verde à vontade', quantidade: '' },
          { item: '1,5 colher de azeite', quantidade: '' }
        ]
      },
      {
        nome: 'Lanche da Tarde',
        icon: <Sunset className="w-4 h-4" />,
        items: [
          { item: '1 iogurte grego grande', quantidade: '' },
          { item: '3 colheres de granola', quantidade: '' },
          { item: '12 castanhas', quantidade: '' },
          { item: '1 fruta grande', quantidade: '' }
        ]
      },
      {
        nome: 'Jantar',
        icon: <Moon className="w-4 h-4" />,
        items: [
          { item: '200g de peixe ou carne vermelha magra', quantidade: '' },
          { item: 'Legumes refogados abundantes', quantidade: '' },
          { item: '1 batata doce grande', quantidade: '' },
          { item: 'Salada de folhas verdes', quantidade: '' }
        ]
      }
    ]
  },
  {
    id: '90kg-mais',
    nome: 'Plano 90kg ou mais',
    descricao: 'Plano nutricional máximo para alta performance',
    faixaPeso: '90kg ou mais',
    refeicoes: [
      {
        nome: 'Café da Manhã',
        icon: <Coffee className="w-4 h-4" />,
        items: [
          { item: '4 fatias de pão integral', quantidade: '' },
          { item: '3 ovos mexidos + 2 claras', quantidade: '' },
          { item: '1 xícara de café com leite desnatado', quantidade: '' },
          { item: '1 fruta grande + 2 colheres de mel', quantidade: '' },
          { item: '2 fatias de queijo branco', quantidade: '' },
          { item: '1 colher de pasta de amendoim', quantidade: '' }
        ]
      },
      {
        nome: 'Almoço',
        icon: <Sun className="w-4 h-4" />,
        items: [
          { item: '300g de peito de frango grelhado', quantidade: '' },
          { item: '3 xícaras de arroz integral', quantidade: '' },
          { item: '1 xícara de feijão', quantidade: '' },
          { item: 'Salada verde à vontade', quantidade: '' },
          { item: '2 colheres de azeite', quantidade: '' }
        ]
      },
      {
        nome: 'Lanche da Tarde',
        icon: <Sunset className="w-4 h-4" />,
        items: [
          { item: '1 iogurte grego grande', quantidade: '' },
          { item: '3 colheres de granola', quantidade: '' },
          { item: '15 castanhas', quantidade: '' },
          { item: '1 fruta grande', quantidade: '' },
          { item: '1 barra de cereal integral', quantidade: '' }
        ]
      },
      {
        nome: 'Jantar',
        icon: <Moon className="w-4 h-4" />,
        items: [
          { item: '250g de peixe ou carne vermelha magra', quantidade: '' },
          { item: 'Legumes refogados abundantes', quantidade: '' },
          { item: '1 batata doce extra grande', quantidade: '' },
          { item: 'Salada de folhas verdes', quantidade: '' },
          { item: '1/4 unidade de abacate', quantidade: '' }
        ]
      }
    ]
  }
];

const cardsFixos = [
  {
    id: 'substituicoes',
    titulo: 'Lista de Substituição de Alimentos',
    descricao: 'Acesse nossa tabela completa de substituições alimentares',
    botao: 'Acessar Tabela',
    link: 'https://www.quantocomer.com.br/fabriciomoura/',
    icon: <UtensilsCrossed className="w-5 h-5" />
  },
  {
    id: 'horarios',
    titulo: 'Dicas de Horários',
    descricao: '',
    items: [
      'Café da manhã: 7h – 9h',
      'Almoço: 12h – 14h',
      'Lanche: 15h – 17h',
      'Jantar: 19h – 21h'
    ],
    icon: <Clock className="w-5 h-5" />
  },
  {
    id: 'dicas',
    titulo: 'Dicas Importantes',
    descricao: '',
    items: [
      'Beba 2–3 litros de água por dia',
      'Evite frituras e doces',
      'Mastigue bem os alimentos',
      'Respeite os intervalos entre refeições'
    ],
    icon: <AlertCircle className="w-5 h-5" />
  }
];

export default function Dietas() {
  const [planoSelecionado, setPlanoSelecionado] = useState<string>('70-80kg');

  const planoAtual = planosNutricionais.find(plano => plano.id === planoSelecionado);

  return (
    <div className="fixed inset-0 bg-zinc-900 overflow-auto">
      <div className="min-h-full w-full bg-zinc-900 text-white">
        <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-amber-500">
            Planos Alimentares
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Escolha o plano ideal para seu peso e objetivo
          </p>

          {/* Botões de Seleção */}
          <div className="flex flex-wrap justify-center gap-2 max-w-5xl mx-auto">
            {planosNutricionais.map((plano) => (
              <button
                key={plano.id}
                onClick={() => setPlanoSelecionado(plano.id)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  planoSelecionado === plano.id
                    ? 'bg-amber-500 text-zinc-900 shadow-lg'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700'
                }`}
              >
                {plano.nome}
              </button>
            ))}
          </div>
        </div>

        {/* Plano Selecionado */}
        {planoAtual && (
          <div className="space-y-8">
            {/* Cabeçalho do Plano */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                <h2 className="text-3xl font-bold text-white">
                  {planoAtual.nome}
                </h2>
                {planoAtual.isVegetariano && (
                  <Badge className="bg-green-600 hover:bg-green-700 text-white">
                    <Leaf className="w-3 h-3 mr-1" />
                    Vegetariano
                  </Badge>
                )}
              </div>
              <p className="text-zinc-400 text-lg">{planoAtual.descricao}</p>
              <div className="inline-block bg-amber-500/10 border border-amber-500/20 rounded-full px-6 py-3">
                <span className="text-amber-500 font-semibold text-lg">
                  Ideal para: {planoAtual.faixaPeso}
                </span>
              </div>
            </div>

            {/* Refeições */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {planoAtual.refeicoes.map((refeicao, index) => (
                <Card key={index} className="bg-zinc-800 border-zinc-700 hover:border-amber-500/50 transition-all duration-200 hover:shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-amber-500">
                      {refeicao.icon}
                      {refeicao.nome}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {refeicao.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="text-sm text-zinc-300 leading-relaxed">
                        • {item.item}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Cards Fixos */}
            <div className="grid gap-6 md:grid-cols-3 mt-12">
              {cardsFixos.map((card) => (
                <Card key={card.id} className="bg-zinc-800 border-zinc-700 hover:border-amber-500/50 transition-all duration-200 hover:shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-amber-500">
                      {card.icon}
                      {card.titulo}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {card.descricao && (
                      <p className="text-zinc-300 text-sm">{card.descricao}</p>
                    )}
                    {card.items && (
                      <div className="space-y-1">
                        {card.items.map((item, index) => (
                          <div key={index} className="text-sm text-zinc-300">
                            • {item}
                          </div>
                        ))}
                      </div>
                    )}
                    {card.botao && card.link && (
                      <Button 
                        className="w-full bg-amber-500 hover:bg-amber-600 text-zinc-900 font-semibold transition-colors"
                        onClick={() => window.open(card.link, '_blank')}
                      >
                        {card.botao}
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}