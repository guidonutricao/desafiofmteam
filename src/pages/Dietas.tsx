import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Coffee, Utensils, Clock, Lightbulb, ExternalLink } from 'lucide-react';

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
      'Mantenha bem os alimentos',
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
      'Mantenha bem os alimentos',
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
      'Mantenha bem os alimentos',
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
      'Mantenha bem os alimentos',
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
      'Mantenha bem os alimentos',
      'Respeite os intervalos entre refeições'
    ]
  }
};

export default function Dietas() {
  const [planoSelecionado, setPlanoSelecionado] = useState('80kg');

  const plano = planosDetalhados[planoSelecionado];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-amber-500 mb-2">Planos Alimentares</h1>
        <p className="text-gray-400">Escolha o plano ideal para seu peso
        </p>
      </div>

      {/* Botões de seleção */}
      <div className="flex flex-wrap justify-center gap-3 mb-8 px-4">
        <Button
          variant="outline"
          onClick={() => setPlanoSelecionado('60kg')}
          className={`rounded-full px-6 py-2 border transition-all ${planoSelecionado === '60kg'
              ? 'bg-amber-500 text-black border-amber-500 hover:bg-amber-600'
              : 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700 hover:border-gray-500'
            }`}
        >
          Plano até 60kg
        </Button>
        <Button
          variant="outline"
          onClick={() => setPlanoSelecionado('70kg')}
          className={`rounded-full px-6 py-2 border transition-all ${planoSelecionado === '70kg'
              ? 'bg-amber-500 text-black border-amber-500 hover:bg-amber-600'
              : 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700 hover:border-gray-500'
            }`}
        >
          Plano 60-70kg
        </Button>
        <Button
          variant="outline"
          onClick={() => setPlanoSelecionado('80kg')}
          className={`rounded-full px-6 py-2 border transition-all ${planoSelecionado === '80kg'
              ? 'bg-amber-500 text-black border-amber-500 hover:bg-amber-600'
              : 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700 hover:border-gray-500'
            }`}
        >
          Plano 70-80kg
        </Button>
        <Button
          variant="outline"
          onClick={() => setPlanoSelecionado('80kg-veg')}
          className={`rounded-full px-6 py-2 border transition-all ${planoSelecionado === '80kg-veg'
              ? 'bg-amber-500 text-black border-amber-500 hover:bg-amber-600'
              : 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700 hover:border-gray-500'
            }`}
        >
          Plano 70-80kg (Vegetariano)
        </Button>
        <Button
          variant="outline"
          onClick={() => setPlanoSelecionado('90kg')}
          className={`rounded-full px-6 py-2 border transition-all ${planoSelecionado === '90kg'
              ? 'bg-amber-500 text-black border-amber-500 hover:bg-amber-600'
              : 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700 hover:border-gray-500'
            }`}
        >
          Plano 80-90kg
        </Button>
        <Button
          variant="outline"
          onClick={() => setPlanoSelecionado('90kg+')}
          className={`rounded-full px-6 py-2 border transition-all ${planoSelecionado === '90kg+'
              ? 'bg-amber-500 text-black border-amber-500 hover:bg-amber-600'
              : 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700 hover:border-gray-500'
            }`}
        >
          Plano 90kg ou mais
        </Button>
      </div>

      {/* Conteúdo do plano selecionado */}
      <div className="max-w-6xl mx-auto px-4 pb-8">
        {/* Título e descrição do plano */}
        <div className="text-center mb-8">
          <div className="inline-block bg-amber-500/20 text-amber-500 px-4 py-2 rounded-full font-medium border border-amber-500/30">
            {plano.faixaPeso}
          </div>
        </div>

        {/* Cards das refeições */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Café da Manhã */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Coffee className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold text-amber-500">Café da Manhã</h3>
              </div>
              <ul className="space-y-2 text-sm">
                {plano.refeicoes.cafe.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-amber-500 mt-1">•</span>
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Almoço */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Utensils className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold text-amber-500">Almoço</h3>
              </div>
              <ul className="space-y-2 text-sm">
                {plano.refeicoes.almoco.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-amber-500 mt-1">•</span>
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Lanche da Tarde */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Coffee className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold text-amber-500">Lanche da Tarde</h3>
              </div>
              <ul className="space-y-2 text-sm">
                {plano.refeicoes.lanche.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-amber-500 mt-1">•</span>
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Jantar */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Utensils className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold text-amber-500">Jantar</h3>
              </div>
              <ul className="space-y-2 text-sm">
                {plano.refeicoes.jantar.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-amber-500 mt-1">•</span>
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Cards de informações adicionais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Lista de Substituição */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Utensils className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold text-amber-500">Lista de Substituição de Alimentos</h3>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Acesse nossa tabela completa de substituições alimentares
              </p>
              <Button className="w-full bg-amber-500 hover:bg-amber-600 text-black font-medium">
                Acessar Tabela
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Dicas de Horários */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold text-amber-500">Dicas de Horários</h3>
              </div>
              <ul className="space-y-2 text-sm">
                {plano.horarios.map((horario, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-amber-500 mt-1">•</span>
                    <span className="text-gray-300">{horario}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Dicas Importantes */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold text-amber-500">Dicas Importantes</h3>
              </div>
              <ul className="space-y-2 text-sm">
                {plano.dicas.map((dica, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-amber-500 mt-1">•</span>
                    <span className="text-gray-300">{dica}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}