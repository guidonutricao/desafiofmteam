import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dumbbell, Home, Building } from 'lucide-react';

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
    <div className="min-h-screen bg-zinc-900 text-white p-6">
      {/* Botões de Seleção */}
      <div className="flex flex-wrap gap-3 mb-8 justify-center">
        {Object.entries(treinosData).map(([key, treino]) => (
          <Button
            key={key}
            variant={treinoSelecionado === key ? "default" : "outline"}
            onClick={() => setTreinoSelecionado(key as TipoTreino)}
            className={`${
              treinoSelecionado === key 
                ? 'bg-amber-500 hover:bg-amber-600 text-black' 
                : 'border-zinc-600 text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            {getIconeTipo(treino.tipo)}
            <span className="ml-2">{treino.titulo}</span>
          </Button>
        ))}
      </div>

      {/* Header do Treino Selecionado */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-500 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black flex items-center gap-2">
              <Dumbbell className="w-6 h-6" />
              {treinoAtual.titulo}
            </h1>
            <p className="text-black/80">{treinoAtual.frequencia}</p>
          </div>
          <div className="text-right">
            <Badge variant="secondary" className="bg-black/20 text-black mb-2">
              {getIconeTipo(treinoAtual.tipo)}
              <span className="ml-1 capitalize">{treinoAtual.tipo}</span>
            </Badge>
            <p className="text-black/80 text-sm">⏱️ {treinoAtual.duracao}</p>
          </div>
        </div>
      </div>

      {/* Grid de Dias de Treino */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {treinoAtual.dias.map((dia) => (
          <Card key={dia.dia} className="bg-zinc-800 border-zinc-700">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-amber-500">
                <span className="bg-amber-500 text-black rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                  {dia.dia}
                </span>
                Dia {dia.dia}
              </CardTitle>
              <p className="text-amber-400 font-medium">{dia.grupo}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {dia.exercicios.map((exercicio, index) => (
                <div key={index} className="bg-zinc-900 rounded-lg p-3">
                  <h4 className="font-medium text-white mb-2">{exercicio.nome}</h4>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline" className="border-zinc-600 text-zinc-300">
                      {exercicio.series}x
                    </Badge>
                    <Badge variant="outline" className="border-zinc-600 text-zinc-300">
                      {exercicio.repeticoes}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Seções Informativas */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Dicas de Treino */}
        <Card className="bg-zinc-800 border-zinc-700">
          <CardHeader>
            <CardTitle className="text-amber-500 flex items-center gap-2">
              <span className="text-amber-500">💡</span>
              Dicas de Treino
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-zinc-300">
            <p>• Sempre faça aquecimento antes do treino</p>
            <p>• Mantenha a forma correta dos exercícios</p>
            <p>• Descanse de 48-72h entre treinos do mesmo grupo muscular</p>
            <p>• Hidrate-se durante o treino</p>
            <p>• Progrida gradualmente nas cargas</p>
          </CardContent>
        </Card>

        {/* Duração Recomendada */}
        <Card className="bg-zinc-800 border-zinc-700">
          <CardHeader>
            <CardTitle className="text-amber-500 flex items-center gap-2">
              <span className="text-amber-500">⏱️</span>
              Duração Recomendada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-zinc-300">
            <p>Treino 3x/Semana: <span className="text-amber-500">45-60 minutos</span></p>
            <p>Treino 4x/Semana: <span className="text-amber-500">45-60 minutos</span></p>
            <p>Treino 5x/Semana: <span className="text-amber-500">60-75 minutos</span></p>
            <p>Treino 6x/Semana: <span className="text-amber-500">45-60 minutos</span></p>
            <p>Treino em Casa: <span className="text-amber-500">30-45 minutos</span></p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}