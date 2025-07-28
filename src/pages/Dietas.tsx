import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coffee, Utensils, Clock, Lightbulb, ExternalLink, Trophy, Award, Star, Crown, Apple } from 'lucide-react';

interface PlanoDetalhes {
  nome: string;
  descricao: string;
  faixaPeso: string;
  refeicoes: {
    cafe: string[];
    almoco: string[];
    lanche: string[];
    jantar: string[];
  };
  horarios: string[];
  dicas: string[];
}

const planosDetalhados: Record<string, PlanoDetalhes> = {
  '60kg': {
    nome: 'Plano até 60kg',
    descricao: 'Plano nutricional equilibrado para manutenção de peso',
    faixaPeso: 'Ideal para: até 60kg',
    refeicoes: {
      cafe: [
        '2 fatias de pão integral',
        '1 ovo mexido + 1 clara',
        '1 xícara de café com leite desnatado',
        '1 fruta + 1 colher de mel',
        '1 fatia de queijo branco'
      ],
      almoco: [
        '150g de peito de frango grelhado',
        '2 xícaras de arroz integral',
        '2/3 xícara de feijão',
        'Salada verde à vontade',
        '1 colher de azeite'
      ],
      lanche: [
        '1 iogurte grego',
        '1 colher de granola',
        '8 castanhas',
        '1 fruta média'
      ],
      jantar: [
        '120g de peixe ou carne vermelha magra',
        'Legumes refogados',
        '1 batata doce pequena',
        'Salada de folhas verdes'
      ]
    },
    horarios: [
      'Café da manhã: 7h – 9h',
      'Almoço: 12h – 14h',
      'Lanche: 15h – 17h',
      'Jantar: 19h – 21h'
    ],
    dicas: [
      'Beba 2-3 litros de água por dia',
      'Evite frituras e doces',
      'Não pule refeições',
      'Respeite os intervalos entre refeições'
    ]
  },
  '70kg': {
    nome: 'Plano 60-70kg',
    descricao: 'Plano nutricional balanceado para energia sustentada',
    faixaPeso: 'Ideal para: 60kg - 70kg',
    refeicoes: {
      cafe: [
        '2 fatias de pão integral',
        '2 ovos mexidos + 1 clara',
        '1 xícara de café com leite desnatado',
        '1 fruta + 1 colher de mel',
        '1 fatia de queijo branco'
      ],
      almoco: [
        '180g de peito de frango grelhado',
        '2 xícaras de arroz integral',
        '3/4 xícara de feijão',
        'Salada verde à vontade',
        '1 colher de azeite'
      ],
      lanche: [
        '1 iogurte grego',
        '2 colheres de granola',
        '10 castanhas',
        '1 fruta média'
      ],
      jantar: [
        '140g de peixe ou carne vermelha magra',
        'Legumes refogados',
        '1 batata doce média',
        'Salada de folhas verdes'
      ]
    },
    horarios: [
      'Café da manhã: 7h – 9h',
      'Almoço: 12h – 14h',
      'Lanche: 15h – 17h',
      'Jantar: 19h – 21h'
    ],
    dicas: [
      'Beba 2-3 litros de água por dia',
      'Evite frituras e doces',
      'Não pule refeições',
      'Respeite os intervalos entre refeições'
    ]
  },
  '80kg': {
    nome: 'Plano 70-80kg',
    descricao: 'Plano nutricional robusto para maior demanda energética',
    faixaPeso: 'Ideal para: 70kg - 80kg',
    refeicoes: {
      cafe: [
        '3 fatias de pão integral',
        '2 ovos mexidos + 2 claras',
        '1 xícara de café com leite desnatado',
        '1 fruta + 1 colher de mel',
        '1 fatia de queijo branco'
      ],
      almoco: [
        '200g de peito de frango grelhado',
        '2 xícaras de arroz integral',
        '3/4 xícara de feijão',
        'Salada verde à vontade',
        '1 colher de azeite'
      ],
      lanche: [
        '1 iogurte grego',
        '2 colheres de granola',
        '10 castanhas',
        '1 fruta média'
      ],
      jantar: [
        '150g de peixe ou carne vermelha magra',
        'Legumes refogados',
        '1 batata doce grande',
        'Salada de folhas verdes'
      ]
    },
    horarios: [
      'Café da manhã: 7h – 9h',
      'Almoço: 12h – 14h',
      'Lanche: 15h – 17h',
      'Jantar: 19h – 21h'
    ],
    dicas: [
      'Beba 2-3 litros de água por dia',
      'Evite frituras e doces',
      'Mantenha bem os alimentos',
      'Respeite os intervalos entre refeições'
    ]
  },
  '80kg-veg': {
    nome: 'Plano 70-80kg (Vegetariano)',
    descricao: 'Plano nutricional vegetariano completo e balanceado',
    faixaPeso: 'Ideal para: 70kg - 80kg',
    refeicoes: {
      cafe: [
        '3 fatias de pão integral',
        '2 ovos mexidos + 2 claras',
        '1 xícara de café com leite de aveia',
        '1 fruta + 1 colher de mel',
        '1 fatia de queijo vegano'
      ],
      almoco: [
        '200g de tofu grelhado ou leguminosas',
        '2 xícaras de arroz integral',
        '3/4 xícara de feijão',
        'Salada verde à vontade',
        '1 colher de azeite'
      ],
      lanche: [
        '1 iogurte de coco',
        '2 colheres de granola',
        '10 castanhas',
        '1 fruta média'
      ],
      jantar: [
        '150g de proteína vegetal',
        'Legumes refogados',
        '1 batata doce grande',
        'Salada de folhas verdes'
      ]
    },
    horarios: [
      'Café da manhã: 7h – 9h',
      'Almoço: 12h – 14h',
      'Lanche: 15h – 17h',
      'Jantar: 19h – 21h'
    ],
    dicas: [
      'Beba 2-3 litros de água por dia',
      'Evite frituras e doces',
      'Não pule refeições',
      'Respeite os intervalos entre refeições'
    ]
  },
  '90kg': {
    nome: 'Plano 80-90kg',
    descricao: 'Plano nutricional intensivo para alta demanda energética',
    faixaPeso: 'Ideal para: 80kg - 90kg',
    refeicoes: {
      cafe: [
        '3 fatias de pão integral',
        '3 ovos mexidos + 2 claras',
        '1 xícara de café com leite desnatado',
        '1 fruta + 1 colher de mel',
        '2 fatias de queijo branco'
      ],
      almoco: [
        '220g de peito de frango grelhado',
        '2,5 xícaras de arroz integral',
        '1 xícara de feijão',
        'Salada verde à vontade',
        '1 colher de azeite'
      ],
      lanche: [
        '1 iogurte grego grande',
        '3 colheres de granola',
        '12 castanhas',
        '1 fruta grande'
      ],
      jantar: [
        '180g de peixe ou carne vermelha magra',
        'Legumes refogados',
        '1 batata doce grande',
        'Salada de folhas verdes'
      ]
    },
    horarios: [
      'Café da manhã: 7h – 9h',
      'Almoço: 12h – 14h',
      'Lanche: 15h – 17h',
      'Jantar: 19h – 21h'
    ],
    dicas: [
      'Beba 3-4 litros de água por dia',
      'Evite frituras e doces',
      'Não pule refeições',
      'Respeite os intervalos entre refeições'
    ]
  },
  '90kg+': {
    nome: 'Plano 90kg ou mais',
    descricao: 'Plano nutricional completo para máxima performance',
    faixaPeso: 'Ideal para: 90kg ou mais',
    refeicoes: {
      cafe: [
        '4 fatias de pão integral',
        '3 ovos mexidos + 3 claras',
        '1 xícara de café com leite desnatado',
        '1 fruta + 2 colheres de mel',
        '2 fatias de queijo branco'
      ],
      almoco: [
        '250g de peito de frango grelhado',
        '3 xícaras de arroz integral',
        '1 xícara de feijão',
        'Salada verde à vontade',
        '2 colheres de azeite'
      ],
      lanche: [
        '1 iogurte grego grande',
        '3 colheres de granola',
        '15 castanhas',
        '1 fruta grande'
      ],
      jantar: [
        '200g de peixe ou carne vermelha magra',
        'Legumes refogados',
        '2 batatas doces médias',
        'Salada de folhas verdes'
      ]
    },
    horarios: [
      'Café da manhã: 7h – 9h',
      'Almoço: 12h – 14h',
      'Lanche: 15h – 17h',
      'Jantar: 19h – 21h'
    ],
    dicas: [
      'Beba 3-4 litros de água por dia',
      'Evite frituras e doces',
      'Não pule refeições',
      'Respeite os intervalos entre refeições'
    ]
  }
};

export default function Dietas() {
  const [planoSelecionado, setPlanoSelecionado] = useState('80kg');

  const plano = planosDetalhados[planoSelecionado];

  return (
    <div className="min-h-screen text-white p-6" style={{ backgroundColor: '#0B111F' }}>
      <div className="space-y-6">
        {/* Header com título centralizado */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full font-bold">
            <Trophy className="w-5 h-5" />
            Planos Alimentares Shape Express
          </div>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Planos nutricionais personalizados para todos os pesos. Escolha o plano ideal para seus objetivos.
          </p>
        </div>

        {/* Botões de Seleção */}
        <div className="flex flex-wrap gap-3 justify-center">
          {Object.entries(planosDetalhados).map(([key, plano]) => (
            <Button
              key={key}
              variant={planoSelecionado === key ? "default" : "outline"}
              onClick={() => setPlanoSelecionado(key)}
              className={`${planoSelecionado === key
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:opacity-90 text-white'
                : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                }`}
            >
              <Apple className="w-4 h-4" />
              <span className="ml-2">{plano.nome}</span>
            </Button>
          ))}
        </div>

        {/* Informações do plano selecionado */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            <Apple className="w-6 h-6" />
            {plano.nome}
          </h1>
          <p className="text-gray-300">{plano.descricao}</p>
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="text-lg font-bold text-white">{plano.faixaPeso}</div>
              <div className="text-sm text-gray-300">Faixa de Peso</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">4</div>
              <div className="text-sm text-gray-300">Refeições Diárias</div>
            </div>
          </div>
        </div>

        {/* Grid de Refeições Premium */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Café da Manhã */}
          <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200 text-gray-900 hover:shadow-xl transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-200/30 to-yellow-200/30 rounded-full -translate-y-10 translate-x-10"></div>
            <CardHeader className="pb-4 relative z-10">
              <CardTitle className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-400 to-yellow-400 shadow-lg">
                  <Coffee className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">☕</span>
                    <span className="font-bold text-gray-800">Café da Manhã</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Energia para começar o dia</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 relative z-10">
              {plano.refeicoes.cafe.map((item, index) => (
                <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-orange-100 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-white/90">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full flex-shrink-0"></div>
                    <p className="text-gray-800 text-sm font-medium leading-relaxed">{item}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Almoço */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 text-gray-900 hover:shadow-xl transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-200/30 to-emerald-200/30 rounded-full -translate-y-10 translate-x-10"></div>
            <CardHeader className="pb-4 relative z-10">
              <CardTitle className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-400 to-emerald-400 shadow-lg">
                  <Utensils className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🍽️</span>
                    <span className="font-bold text-gray-800">Almoço</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Refeição principal do dia</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 relative z-10">
              {plano.refeicoes.almoco.map((item, index) => (
                <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-green-100 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-white/90">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex-shrink-0"></div>
                    <p className="text-gray-800 text-sm font-medium leading-relaxed">{item}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Lanche da Tarde */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 text-gray-900 hover:shadow-xl transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full -translate-y-10 translate-x-10"></div>
            <CardHeader className="pb-4 relative z-10">
              <CardTitle className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 shadow-lg">
                  <Coffee className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🥤</span>
                    <span className="font-bold text-gray-800">Lanche da Tarde</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Energia para a tarde</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 relative z-10">
              {plano.refeicoes.lanche.map((item, index) => (
                <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-purple-100 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-white/90">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex-shrink-0"></div>
                    <p className="text-gray-800 text-sm font-medium leading-relaxed">{item}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Jantar */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 text-gray-900 hover:shadow-xl transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full -translate-y-10 translate-x-10"></div>
            <CardHeader className="pb-4 relative z-10">
              <CardTitle className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-400 shadow-lg">
                  <Utensils className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🌙</span>
                    <span className="font-bold text-gray-800">Jantar</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Refeição noturna leve</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 relative z-10">
              {plano.refeicoes.jantar.map((item, index) => (
                <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-blue-100 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-white/90">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full flex-shrink-0"></div>
                    <p className="text-gray-800 text-sm font-medium leading-relaxed">{item}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Seções Informativas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Lista de Substituição */}
          <Card className="bg-white dark:bg-white border-gray-200 dark:border-gray-200 text-gray-900">
            <CardHeader>
              <CardTitle className="text-yellow-600 flex items-center gap-2">
                <Utensils className="w-5 h-5" />
                Lista de Substituição
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-700">
              <p className="text-sm mb-4">
                Acesse nossa tabela completa de substituições alimentares
              </p>
              <Button className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:opacity-90 text-white font-medium">
                Acessar Tabela
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Dicas de Horários */}
          <Card className="bg-white dark:bg-white border-gray-200 dark:border-gray-200 text-gray-900">
            <CardHeader>
              <CardTitle className="text-yellow-600 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Horários Recomendados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-700">
              {plano.horarios.map((horario, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold">•</span>
                  <p className="text-sm">{horario}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Dicas Importantes */}
          <Card className="bg-white dark:bg-white border-gray-200 dark:border-gray-200 text-gray-900">
            <CardHeader>
              <CardTitle className="text-yellow-600 flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Dicas Importantes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-700">
              {plano.dicas.map((dica, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold">•</span>
                  <p className="text-sm">{dica}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Card Premium Final */}
        <Card
          className="bg-amber-500 text-white cursor-pointer hover:bg-amber-600 transition-colors duration-200"
          onClick={() => window.open('https://wa.me/5511948464441?text=Ol%C3%A1%2C%20vim%20da%20p%C3%A1gina%20de%20dietas%20e%20gostaria%20de%20saber%20mais%20sobre%20o%20acompanhamento%20nutricional%20premium.', '_blank')}
        >
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto">
              <Award className="w-6 h-6 text-white" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">
                Quer um Plano Ainda Mais Personalizado?
              </h3>
              <p className="text-white/90 text-sm">
                Acompanhamento nutricional individual com ajustes personalizados
              </p>
            </div>

            <div className="pt-2">
              <div className="bg-white/20 hover:bg-white/30 transition-colors duration-200 rounded-lg px-6 py-3 inline-block">
                <span className="text-white font-semibold">
                  Conhecer Acompanhamento Nutricional Premium
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}