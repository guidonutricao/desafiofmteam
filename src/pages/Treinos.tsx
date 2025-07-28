import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dumbbell, Home, Building, Trophy, Award, Crown, Star, Flame } from 'lucide-react';

interface Exercicio {
  nome: string;
  series: number;
  repeticoes: string;
  peso: string;
}

interface DiaTreino {
  dia: number;
  nome: string;
  grupo: string;
  exercicios: Exercicio[];
}

type TipoTreino = '3x' | '4x' | '5x' | '6x' | 'casa';

const treinosData: Record<TipoTreino, DiasTreino> = {
  '3x': {
    titulo: 'Treino 3x por Semana',
    frequencia: 'Frequência: 3x por semana',
    tipo: 'academia',
    duracao: '45-60 minutos',
    dias: [
      {
        dia: 1,
        nome: 'Peito',
        grupo: 'Peito',
        exercicios: [
          { nome: 'Supino Reto', series: 4, repeticoes: '8-12 reps', peso: '60-80%' },
          { nome: 'Supino Inclinado', series: 4, repeticoes: '8-12 reps', peso: '60%' },
          { nome: 'Supino Declinado', series: 3, repeticoes: '8-12 reps', peso: '60%' },
          { nome: 'Crucifixo', series: 3, repeticoes: '10-15 reps', peso: '45%' },
          { nome: 'Crucifixo Inclinado', series: 3, repeticoes: '10-15 reps', peso: '45%' },
          { nome: 'Paralelas', series: 3, repeticoes: '8-15 reps', peso: '60%' }
        ]
      },
      {
        dia: 2,
        nome: 'Costas',
        grupo: 'Costas',
        exercicios: [
          { nome: 'Puxada Frontal', series: 4, repeticoes: '8-12 reps', peso: '60-80%' },
          { nome: 'Puxada Atrás', series: 3, repeticoes: '8-12 reps', peso: '60%' },
          { nome: 'Remada Curvada', series: 4, repeticoes: '8-12 reps', peso: '60%' },
          { nome: 'Remada Unilateral', series: 3, repeticoes: '10-15 reps', peso: '45%' },
          { nome: 'Pullover', series: 3, repeticoes: '8-12 reps', peso: '45%' },
          { nome: 'Remada Baixa', series: 3, repeticoes: '10-15 reps', peso: '45%' }
        ]
      },
      {
        dia: 3,
        nome: 'Ombros',
        grupo: 'Ombros',
        exercicios: [
          { nome: 'Desenvolvimento Militar', series: 4, repeticoes: '8-12 reps', peso: '50%' },
          { nome: 'Desenvolvimento com Halteres', series: 3, repeticoes: '8-12 reps', peso: '50%' },
          { nome: 'Elevação Lateral', series: 4, repeticoes: '12-15 reps', peso: '45%' },
          { nome: 'Elevação Frontal', series: 4, repeticoes: '12-15 reps', peso: '45%' },
          { nome: 'Elevação Posterior', series: 4, repeticoes: '12-15 reps', peso: '45%' },
          { nome: 'Encolhimento', series: 3, repeticoes: '12-20 reps', peso: '45%' }
        ]
      }
    ]
  },
  '4x': {
    titulo: 'Treino 4x por Semana',
    frequencia: 'Frequência: 4x por semana',
    tipo: 'academia',
    duracao: '45-60 minutos',
    dias: [
      {
        dia: 1,
        nome: 'Peito',
        grupo: 'Peito',
        exercicios: [
          { nome: 'Supino Reto', series: 4, repeticoes: '8-12 reps', peso: '60-80%' },
          { nome: 'Supino Inclinado', series: 4, repeticoes: '8-12 reps', peso: '60%' },
          { nome: 'Supino Declinado', series: 3, repeticoes: '8-12 reps', peso: '60%' },
          { nome: 'Crucifixo', series: 3, repeticoes: '10-15 reps', peso: '45%' },
          { nome: 'Crucifixo Inclinado', series: 3, repeticoes: '10-15 reps', peso: '45%' },
          { nome: 'Paralelas', series: 3, repeticoes: '8-15 reps', peso: '60%' }
        ]
      },
      {
        dia: 2,
        nome: 'Costas',
        grupo: 'Costas',
        exercicios: [
          { nome: 'Puxada Frontal', series: 4, repeticoes: '8-12 reps', peso: '60-80%' },
          { nome: 'Puxada Atrás', series: 3, repeticoes: '8-12 reps', peso: '60%' },
          { nome: 'Remada Curvada', series: 4, repeticoes: '8-12 reps', peso: '60%' },
          { nome: 'Remada Unilateral', series: 3, repeticoes: '10-15 reps', peso: '45%' },
          { nome: 'Pullover', series: 3, repeticoes: '8-12 reps', peso: '45%' },
          { nome: 'Remada Baixa', series: 3, repeticoes: '10-15 reps', peso: '45%' }
        ]
      },
      {
        dia: 3,
        nome: 'Ombros',
        grupo: 'Ombros',
        exercicios: [
          { nome: 'Desenvolvimento Militar', series: 4, repeticoes: '8-12 reps', peso: '50%' },
          { nome: 'Desenvolvimento com Halteres', series: 3, repeticoes: '8-12 reps', peso: '50%' },
          { nome: 'Elevação Lateral', series: 4, repeticoes: '12-15 reps', peso: '45%' },
          { nome: 'Elevação Frontal', series: 4, repeticoes: '12-15 reps', peso: '45%' },
          { nome: 'Elevação Posterior', series: 4, repeticoes: '12-15 reps', peso: '45%' },
          { nome: 'Encolhimento', series: 3, repeticoes: '12-20 reps', peso: '45%' }
        ]
      },
      {
        dia: 4,
        nome: 'Braços',
        grupo: 'Braços',
        exercicios: [
          { nome: 'Rosca Direta', series: 4, repeticoes: '10-15 reps', peso: '45%' },
          { nome: 'Rosca Alternada', series: 3, repeticoes: '10-15 reps', peso: '45%' },
          { nome: 'Rosca Martelo', series: 3, repeticoes: '12-15 reps', peso: '45%' },
          { nome: 'Tríceps Testa', series: 4, repeticoes: '10-15 reps', peso: '45%' },
          { nome: 'Tríceps Pulley', series: 3, repeticoes: '12-15 reps', peso: '45%' },
          { nome: 'Tríceps Francês', series: 3, repeticoes: '10-15 reps', peso: '45%' }
        ]
      }
    ]
  },
  '5x': {
    titulo: 'Treino 5x por Semana',
    frequencia: 'Frequência: 5x por semana',
    tipo: 'academia',
    duracao: '60-75 minutos',
    dias: [
      {
        dia: 1,
        nome: 'Peito',
        grupo: 'Peito',
        exercicios: [
          { nome: 'Supino Reto', series: 4, repeticoes: '8-12 reps', peso: '60-80%' },
          { nome: 'Supino Inclinado', series: 4, repeticoes: '8-12 reps', peso: '60%' },
          { nome: 'Supino Declinado', series: 3, repeticoes: '8-12 reps', peso: '60%' },
          { nome: 'Crucifixo', series: 3, repeticoes: '10-15 reps', peso: '45%' },
          { nome: 'Crucifixo Inclinado', series: 3, repeticoes: '10-15 reps', peso: '45%' },
          { nome: 'Paralelas', series: 3, repeticoes: '8-15 reps', peso: '60%' }
        ]
      },
      {
        dia: 2,
        nome: 'Costas',
        grupo: 'Costas',
        exercicios: [
          { nome: 'Puxada Frontal', series: 4, repeticoes: '8-12 reps', peso: '60-80%' },
          { nome: 'Puxada Atrás', series: 3, repeticoes: '8-12 reps', peso: '60%' },
          { nome: 'Remada Curvada', series: 4, repeticoes: '8-12 reps', peso: '60%' },
          { nome: 'Remada Unilateral', series: 3, repeticoes: '10-15 reps', peso: '45%' },
          { nome: 'Pullover', series: 3, repeticoes: '8-12 reps', peso: '45%' },
          { nome: 'Remada Baixa', series: 3, repeticoes: '10-15 reps', peso: '45%' }
        ]
      },
      {
        dia: 3,
        nome: 'Ombros',
        grupo: 'Ombros',
        exercicios: [
          { nome: 'Desenvolvimento Militar', series: 4, repeticoes: '8-12 reps', peso: '50%' },
          { nome: 'Desenvolvimento com Halteres', series: 3, repeticoes: '8-12 reps', peso: '50%' },
          { nome: 'Elevação Lateral', series: 4, repeticoes: '12-15 reps', peso: '45%' },
          { nome: 'Elevação Frontal', series: 4, repeticoes: '12-15 reps', peso: '45%' },
          { nome: 'Elevação Posterior', series: 4, repeticoes: '12-15 reps', peso: '45%' },
          { nome: 'Encolhimento', series: 3, repeticoes: '12-20 reps', peso: '45%' }
        ]
      },
      {
        dia: 4,
        nome: 'Braços',
        grupo: 'Braços',
        exercicios: [
          { nome: 'Rosca Direta', series: 4, repeticoes: '10-15 reps', peso: '45%' },
          { nome: 'Rosca Alternada', series: 3, repeticoes: '10-15 reps', peso: '45%' },
          { nome: 'Rosca Martelo', series: 3, repeticoes: '12-15 reps', peso: '45%' },
          { nome: 'Tríceps Testa', series: 4, repeticoes: '10-15 reps', peso: '45%' },
          { nome: 'Tríceps Pulley', series: 3, repeticoes: '12-15 reps', peso: '45%' },
          { nome: 'Tríceps Francês', series: 3, repeticoes: '10-15 reps', peso: '45%' }
        ]
      },
      {
        dia: 5,
        nome: 'Pernas',
        grupo: 'Pernas',
        exercicios: [
          { nome: 'Agachamento', series: 4, repeticoes: '8-15 reps', peso: '50%' },
          { nome: 'Leg Press', series: 4, repeticoes: '12-20 reps', peso: '60%' },
          { nome: 'Extensora', series: 4, repeticoes: '15-20 reps', peso: '45%' },
          { nome: 'Flexora', series: 4, repeticoes: '12-15 reps', peso: '45%' },
          { nome: 'Stiff', series: 3, repeticoes: '10-15 reps', peso: '50%' },
          { nome: 'Panturrilha em Pé', series: 4, repeticoes: '15-25 reps', peso: '30%' }
        ]
      }
    ]
  },
  '6x': {
    titulo: 'Treino 6x por Semana',
    frequencia: 'Frequência: 6x por semana',
    tipo: 'academia',
    duracao: '45-60 minutos',
    dias: [
      {
        dia: 1,
        nome: 'Peito',
        grupo: 'Peito',
        exercicios: [
          { nome: 'Supino Reto', series: 4, repeticoes: '8-12 reps', peso: '60-80%' },
          { nome: 'Supino Inclinado', series: 4, repeticoes: '8-12 reps', peso: '60%' },
          { nome: 'Supino Declinado', series: 3, repeticoes: '8-12 reps', peso: '60%' },
          { nome: 'Crucifixo', series: 3, repeticoes: '10-15 reps', peso: '45%' },
          { nome: 'Crucifixo Inclinado', series: 3, repeticoes: '10-15 reps', peso: '45%' },
          { nome: 'Paralelas', series: 3, repeticoes: '8-15 reps', peso: '60%' }
        ]
      },
      {
        dia: 2,
        nome: 'Costas',
        grupo: 'Costas',
        exercicios: [
          { nome: 'Puxada Frontal', series: 4, repeticoes: '8-12 reps', peso: '60-80%' },
          { nome: 'Puxada Atrás', series: 3, repeticoes: '8-12 reps', peso: '60%' },
          { nome: 'Remada Curvada', series: 4, repeticoes: '8-12 reps', peso: '60%' },
          { nome: 'Remada Unilateral', series: 3, repeticoes: '10-15 reps', peso: '45%' },
          { nome: 'Pullover', series: 3, repeticoes: '8-12 reps', peso: '45%' },
          { nome: 'Remada Baixa', series: 3, repeticoes: '10-15 reps', peso: '45%' }
        ]
      },
      {
        dia: 3,
        nome: 'Ombros',
        grupo: 'Ombros',
        exercicios: [
          { nome: 'Desenvolvimento Militar', series: 4, repeticoes: '8-12 reps', peso: '50%' },
          { nome: 'Desenvolvimento com Halteres', series: 3, repeticoes: '8-12 reps', peso: '50%' },
          { nome: 'Elevação Lateral', series: 4, repeticoes: '12-15 reps', peso: '45%' },
          { nome: 'Elevação Frontal', series: 4, repeticoes: '12-15 reps', peso: '45%' },
          { nome: 'Elevação Posterior', series: 4, repeticoes: '12-15 reps', peso: '45%' },
          { nome: 'Encolhimento', series: 3, repeticoes: '12-20 reps', peso: '45%' }
        ]
      },
      {
        dia: 4,
        nome: 'Braços',
        grupo: 'Braços',
        exercicios: [
          { nome: 'Rosca Direta', series: 4, repeticoes: '10-15 reps', peso: '45%' },
          { nome: 'Rosca Alternada', series: 3, repeticoes: '10-15 reps', peso: '45%' },
          { nome: 'Rosca Martelo', series: 3, repeticoes: '12-15 reps', peso: '45%' },
          { nome: 'Tríceps Testa', series: 4, repeticoes: '10-15 reps', peso: '45%' },
          { nome: 'Tríceps Pulley', series: 3, repeticoes: '12-15 reps', peso: '45%' },
          { nome: 'Tríceps Francês', series: 3, repeticoes: '10-15 reps', peso: '45%' }
        ]
      },
      {
        dia: 5,
        nome: 'Pernas',
        grupo: 'Pernas',
        exercicios: [
          { nome: 'Agachamento', series: 4, repeticoes: '8-15 reps', peso: '50%' },
          { nome: 'Leg Press', series: 4, repeticoes: '12-20 reps', peso: '60%' },
          { nome: 'Extensora', series: 4, repeticoes: '15-20 reps', peso: '45%' },
          { nome: 'Flexora', series: 4, repeticoes: '12-15 reps', peso: '45%' },
          { nome: 'Stiff', series: 3, repeticoes: '10-15 reps', peso: '50%' },
          { nome: 'Panturrilha em Pé', series: 4, repeticoes: '15-25 reps', peso: '30%' }
        ]
      },
      {
        dia: 6,
        nome: 'Abdômen',
        grupo: 'Abdômen',
        exercicios: [
          { nome: 'Abdominal Supra', series: 4, repeticoes: '15-25 reps', peso: '0%' },
          { nome: 'Abdominal Oblíquo', series: 3, repeticoes: '15-20 reps', peso: '0%' },
          { nome: 'Prancha', series: 3, repeticoes: '30-60s', peso: '0%' },
          { nome: 'Elevação de Pernas', series: 3, repeticoes: '15-20 reps', peso: '0%' },
          { nome: 'Russian Twist', series: 3, repeticoes: '20-30 reps', peso: '0%' }
        ]
      }
    ]
  },
  'casa': {
    titulo: 'Treino em Casa',
    frequencia: 'Frequência: 5x por semana',
    tipo: 'casa',
    duracao: '30-45 minutos',
    dias: [
      {
        dia: 1,
        nome: 'Peito',
        grupo: 'Peito',
        exercicios: [
          { nome: 'Flexão de Braço', series: 4, repeticoes: '10-20 reps', peso: '0%' },
          { nome: 'Flexão Inclinada', series: 3, repeticoes: '8-15 reps', peso: '0%' },
          { nome: 'Flexão Declinada', series: 3, repeticoes: '8-12 reps', peso: '0%' },
          { nome: 'Flexão Diamante', series: 3, repeticoes: '5-12 reps', peso: '0%' }
        ]
      },
      {
        dia: 2,
        nome: 'Costas',
        grupo: 'Costas',
        exercicios: [
          { nome: 'Puxada com Toalha', series: 4, repeticoes: '10-15 reps', peso: '0%' },
          { nome: 'Superman', series: 3, repeticoes: '15-20 reps', peso: '0%' },
          { nome: 'Remada com Garrafa', series: 4, repeticoes: '12-20 reps', peso: '0%' },
          { nome: 'Prancha Reversa', series: 3, repeticoes: '20-40s', peso: '0%' }
        ]
      },
      {
        dia: 3,
        nome: 'Pernas',
        grupo: 'Pernas',
        exercicios: [
          { nome: 'Agachamento Livre', series: 4, repeticoes: '15-25 reps', peso: '0%' },
          { nome: 'Lunges', series: 3, repeticoes: '12-20 reps', peso: '0%' },
          { nome: 'Agachamento Búlgaro', series: 3, repeticoes: '10-15 reps', peso: '0%' },
          { nome: 'Panturrilha', series: 4, repeticoes: '20-30 reps', peso: '0%' }
        ]
      },
      {
        dia: 4,
        nome: 'Braços',
        grupo: 'Braços',
        exercicios: [
          { nome: 'Flexão Diamante', series: 3, repeticoes: '5-12 reps', peso: '0%' },
          { nome: 'Tríceps no Chão', series: 3, repeticoes: '8-15 reps', peso: '0%' },
          { nome: 'Rosca com Garrafa', series: 4, repeticoes: '12-20 reps', peso: '0%' },
          { nome: 'Tríceps na Cadeira', series: 3, repeticoes: '8-15 reps', peso: '0%' }
        ]
      },
      {
        dia: 5,
        nome: 'Abdômen',
        grupo: 'Abdômen',
        exercicios: [
          { nome: 'Abdominal Tradicional', series: 4, repeticoes: '15-25 reps', peso: '0%' },
          { nome: 'Prancha', series: 3, repeticoes: '30-60s', peso: '0%' },
          { nome: 'Bicicleta', series: 3, repeticoes: '20-30 reps', peso: '0%' },
          { nome: 'Mountain Climber', series: 3, repeticoes: '20-40 reps', peso: '0%' }
        ]
      }
    ]
  }
};

interface DiasTreino {
  titulo: string;
  frequencia: string;
  tipo: string;
  duracao: string;
  dias: DiaTreino[];
}

export default function Treinos() {
  const [treinoSelecionado, setTreinoSelecionado] = useState<TipoTreino>('5x');

  const treinoAtual = treinosData[treinoSelecionado];

  const getIconeTipo = (tipo: string) => {
    switch (tipo) {
      case 'casa': return <Home className="w-4 h-4" />;
      case 'academia': return <Building className="w-4 h-4" />;
      default: return <Dumbbell className="w-4 h-4" />;
    }
  };



  return (
    <div className="min-h-screen text-white p-6" style={{ backgroundColor: '#0B111F' }}>
      {/* Header Premium com Título Dourado */}
      <div className="text-center space-y-4 mb-8">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full font-bold">
          <Trophy className="w-5 h-5" />
          Treinos Shape Express
        </div>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Planos de treino personalizados para todos os níveis. Escolha a frequência ideal para seus objetivos.
        </p>
      </div>

      {/* Botões de Seleção */}
      <div className="flex flex-wrap gap-3 mb-8 justify-center">
        {Object.entries(treinosData).map(([key, treino]) => (
          <Button
            key={key}
            variant={treinoSelecionado === key ? "default" : "outline"}
            onClick={() => setTreinoSelecionado(key as TipoTreino)}
            className={`${treinoSelecionado === key
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:opacity-90 text-white'
                : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
              }`}
          >
            {getIconeTipo(treino.tipo)}
            <span className="ml-2">{treino.titulo}</span>
          </Button>
        ))}
      </div>

      {/* Header do Treino Selecionado */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Dumbbell className="w-6 h-6" />
              {treinoAtual.titulo}
            </h1>
            <p className="text-white/90">{treinoAtual.frequencia}</p>
          </div>
          <div className="text-right">
            <Badge variant="secondary" className="bg-white/20 text-white mb-2">
              {getIconeTipo(treinoAtual.tipo)}
              <span className="ml-1 capitalize">{treinoAtual.tipo}</span>
            </Badge>
            <p className="text-white/90 text-sm">⏱️ {treinoAtual.duracao}</p>
          </div>
        </div>
      </div>

      {/* Grid de Dias de Treino Premium */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {treinoAtual.dias.map((dia, cardIndex) => {
          // Cores diferentes para cada card de treino
          const cardColors = [
            { bg: 'from-red-50 to-pink-50', border: 'border-red-200', accent: 'from-red-400 to-pink-400', dot: 'from-red-400 to-pink-400', item: 'border-red-100', emoji: '💪' },
            { bg: 'from-blue-50 to-cyan-50', border: 'border-blue-200', accent: 'from-blue-400 to-cyan-400', dot: 'from-blue-400 to-cyan-400', item: 'border-blue-100', emoji: '🏋️' },
            { bg: 'from-green-50 to-emerald-50', border: 'border-green-200', accent: 'from-green-400 to-emerald-400', dot: 'from-green-400 to-emerald-400', item: 'border-green-100', emoji: '💥' },
            { bg: 'from-purple-50 to-violet-50', border: 'border-purple-200', accent: 'from-purple-400 to-violet-400', dot: 'from-purple-400 to-violet-400', item: 'border-purple-100', emoji: '🔥' },
            { bg: 'from-orange-50 to-yellow-50', border: 'border-orange-200', accent: 'from-orange-400 to-yellow-400', dot: 'from-orange-400 to-yellow-400', item: 'border-orange-100', emoji: '⚡' },
            { bg: 'from-indigo-50 to-blue-50', border: 'border-indigo-200', accent: 'from-indigo-400 to-blue-400', dot: 'from-indigo-400 to-blue-400', item: 'border-indigo-100', emoji: '🎯' }
          ];
          const colors = cardColors[cardIndex % cardColors.length];
          
          return (
            <Card key={dia.dia} className={`bg-gradient-to-br ${colors.bg} ${colors.border} text-gray-900 hover:shadow-xl transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 relative overflow-hidden`}>
              <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${colors.accent}/20 rounded-full -translate-y-10 translate-x-10`}></div>
              <CardHeader className="pb-4 relative z-10">
                <CardTitle className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${colors.accent} shadow-lg`}>
                    <span className="text-white text-xl font-bold">{dia.dia}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{colors.emoji}</span>
                      <span className="font-bold text-gray-800">Dia {dia.dia}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <p className="text-sm text-gray-600 font-medium">{dia.grupo}</p>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 relative z-10">
                {dia.exercicios.map((exercicio, index) => (
                  <div key={index} className={`bg-white/80 backdrop-blur-sm rounded-xl p-4 border ${colors.item} shadow-sm hover:shadow-md transition-all duration-200 hover:bg-white/90`}>
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-2 h-2 bg-gradient-to-r ${colors.dot} rounded-full flex-shrink-0 mt-2`}></div>
                      <h4 className="font-bold text-gray-800 leading-tight">{exercicio.nome}</h4>
                    </div>
                    <div className="flex gap-2 flex-wrap ml-5">
                      <Badge variant="outline" className="border-yellow-400 text-yellow-700 bg-yellow-50 font-semibold shadow-sm">
                        📊 {exercicio.series}x
                      </Badge>
                      <Badge variant="outline" className="border-orange-400 text-orange-700 bg-orange-50 font-semibold shadow-sm">
                        🔄 {exercicio.repeticoes}
                      </Badge>
                      {exercicio.peso !== '0%' && (
                        <Badge variant="outline" className="border-gray-400 text-gray-700 bg-gray-50 font-semibold shadow-sm">
                          ⚖️ {exercicio.peso}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}


      </div>

      {/* Seções Informativas */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Dicas de Treino */}
        <Card className="bg-white dark:bg-white border-gray-200 dark:border-gray-200 text-gray-900">
          <CardHeader>
            <CardTitle className="text-yellow-600 flex items-center gap-2">
              <span className="text-2xl">💡</span>
              Dicas de Treino
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-gray-700">
            <div className="flex items-start gap-2">
              <span className="text-orange-500 font-bold">•</span>
              <p>Sempre faça aquecimento antes do treino</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-orange-500 font-bold">•</span>
              <p>Mantenha a execução correta dos exercícios</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-orange-500 font-bold">•</span>
              <p>Descanse de 48-72h entre treinos do mesmo grupo muscular</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-orange-500 font-bold">•</span>
              <p>Hidrate-se durante o treino</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-orange-500 font-bold">•</span>
              <p>Progrida gradualmente nas cargas</p>
            </div>
          </CardContent>
        </Card>

        {/* Duração Recomendada */}
        <Card className="bg-white dark:bg-white border-gray-200 dark:border-gray-200 text-gray-900">
          <CardHeader>
            <CardTitle className="text-yellow-600 flex items-center gap-2">
              <span className="text-2xl">⏱️</span>
              Duração Recomendada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-gray-700">
            <div className="flex justify-between items-center">
              <span>Treino 3x/Semana:</span>
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">45-60 min</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Treino 4x/Semana:</span>
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">45-60 min</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Treino 5x/Semana:</span>
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">60-75 min</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Treino 6x/Semana:</span>
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">45-60 min</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Treino em Casa:</span>
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">30-45 min</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Card de Motivação */}
        <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Motivação Diária
            </CardTitle>
          </CardHeader>
          <CardContent>
            <blockquote className="text-white/90 italic text-center">
              "O sucesso é a soma de pequenos esforços repetidos dia após dia."
            </blockquote>
            <cite className="text-sm text-white/80 mt-3 block text-center">
              - Robert Collier
            </cite>
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
                <Flame className="w-4 h-4" />
                <span className="text-sm font-medium">Continue firme!</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Card Premium Final */}
      <div className="mt-8">
        <Card
          className="bg-amber-500 text-white cursor-pointer hover:bg-amber-600 transition-colors duration-200 max-w-4xl mx-auto"
          onClick={() => window.open('https://wa.me/5511948464441?text=Ol%C3%A1%2C%20vim%20da%20p%C3%A1gina%20de%20treinos%20e%20gostaria%20de%20saber%20mais%20sobre%20o%20acompanhamento%20premium.', '_blank')}
        >
          <CardContent className="p-8 text-center space-y-6">
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-2xl font-bold text-white">
                  Quer Resultados Ainda Melhores?
                </h3>
                <p className="text-white/90">
                  Acompanhamento individual personalizado para participantes dos treinos
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4" />
                  <span className="font-semibold">Treino Personalizado</span>
                </div>
                <p className="text-white/80">Adaptado ao seu biotipo e objetivos específicos</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-4 h-4" />
                  <span className="font-semibold">Acompanhamento Contínuo</span>
                </div>
                <p className="text-white/80">Ajustes constantes para máximos resultados</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-4 h-4" />
                  <span className="font-semibold">Suporte Premium</span>
                </div>
                <p className="text-white/80">Acesso direto via WhatsApp para dúvidas</p>
              </div>
            </div>

            <div className="pt-4">
              <div className="bg-white/20 hover:bg-white/30 transition-colors duration-200 rounded-lg px-8 py-4 inline-block">
                <span className="text-white font-semibold text-lg">
                  Conhecer Acompanhamento Premium
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}