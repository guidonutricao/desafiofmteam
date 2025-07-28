import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Toggle } from '@/components/ui/toggle';
import { Dumbbell, Home, Building, Trophy, Award, Crown, Star, Flame, Play, Info } from 'lucide-react';

interface Exercicio {
  nome: string;
  series: number;
  repeticoes: string;
  peso: string;
  execucao?: string;
}

interface DiaTreino {
  dia: number;
  nome: string;
  grupo: string;
  exercicios: Exercicio[];
}

type TipoTreino = '3x' | '4x' | '5x' | '6x' | 'casa';

const treinosDataMasculino: Record<TipoTreino, DiasTreino> = {
  '3x': {
    titulo: 'Treino 3x por Semana',
    frequencia: 'Frequência: 3x por semana',
    tipo: 'academia',
    duracao: '45-60 minutos',
    dias: [
      {
        dia: 1,
        nome: 'Treino A',
        grupo: 'Peito, Costas, Ombros, Braços, Pernas',
        exercicios: [
          { nome: 'T-Bar Row', series: 5, repeticoes: '8-12', peso: '70%', execucao: 'https://www.youtube.com/watch?v=0UBRfiO4zDs' },
          { nome: 'Supino Inclinado Smith', series: 5, repeticoes: '10-15', peso: '70%', execucao: 'https://www.youtube.com/shorts/r39cVRTjFU8' },
          { nome: 'Cross Over Polia Alta', series: 3, repeticoes: '8-15', peso: '60%', execucao: 'https://www.youtube.com/shorts/MoShufDdMWA' },
          { nome: 'Elevação Lateral na Polia', series: 3, repeticoes: '5-8', peso: '50%', execucao: 'https://www.youtube.com/watch?v=lq7eLC30b9w' },
          { nome: 'Rosca Scott Unilateral com Halteres', series: 3, repeticoes: '10-15', peso: '60%', execucao: 'https://www.youtube.com/shorts/qhRLio6bCRo' },
          { nome: 'Tríceps Francês Unilateral na Polia', series: 3, repeticoes: '8-12', peso: '60%', execucao: 'https://www.youtube.com/watch?v=sUFUQVMWdnU&t=44s' },
          { nome: 'Leg Press', series: 3, repeticoes: '8-15', peso: '80%', execucao: 'https://www.youtube.com/shorts/NY5fw4Zaofg' }
        ]
      },
      {
        dia: 2,
        nome: 'Treino B',
        grupo: 'Peito, Costas, Ombros, Braços, Pernas',
        exercicios: [
          { nome: 'Crucifixo Máquina', series: 5, repeticoes: '5-8', peso: '60%', execucao: 'https://www.youtube.com/shorts/MENdoLpyj7c' },
          { nome: 'High Cable Rows', series: 5, repeticoes: '8-12', peso: '70%', execucao: 'https://www.youtube.com/shorts/z0SebEeAajI' },
          { nome: 'Single Arm Cable Row', series: 3, repeticoes: '10-15', peso: '60%', execucao: 'https://www.youtube.com/watch?v=WvLMauqrnK8' },
          { nome: 'Desenvolvimento Máquina', series: 3, repeticoes: '8-15', peso: '60%', execucao: 'https://www.youtube.com/watch?v=WvLMauqrnK8' },
          { nome: 'Bayesian Curl', series: 3, repeticoes: '5-8', peso: '50%', execucao: 'https://www.youtube.com/shorts/OxBhN2s9O5U' },
          { nome: 'Tríceps Corda na Polia', series: 3, repeticoes: '8-12', peso: '60%', execucao: 'https://www.youtube.com/shorts/-QGC1cL6ETE' },
          { nome: 'Mesa Flexora', series: 3, repeticoes: '10-15', peso: '70%', execucao: 'https://www.youtube.com/shorts/IXg1PQ_5gmw' }
        ]
      },
      {
        dia: 3,
        nome: 'Treino C',
        grupo: 'Peito, Costas, Ombros, Braços, Pernas',
        exercicios: [
          { nome: 'Stiff Leg Deadlift', series: 5, repeticoes: '8-15', peso: '70%', execucao: 'https://www.youtube.com/shorts/raMtPJQ5f9A' },
          { nome: 'Puxada Alta', series: 5, repeticoes: '10-15', peso: '70%', execucao: 'https://www.youtube.com/watch?v=EUIri47Epcg' },
          { nome: 'Chest Dips', series: 3, repeticoes: '8-12', peso: '0%', execucao: 'https://www.youtube.com/shorts/2Q22gXghCGA' },
          { nome: 'Supino Reto Máquina', series: 3, repeticoes: '5-8', peso: '70%', execucao: 'https://www.youtube.com/shorts/2awX3rTGa1k' },
          { nome: 'Elevação Lateral com Peito Apoiado no Banco', series: 4, repeticoes: '8-15', peso: '40%', execucao: 'https://www.youtube.com/shorts/6Hv7i2DpTgs' },
          { nome: 'Rosca Martelo Sentado com Halteres', series: 3, repeticoes: '10-15', peso: '60%', execucao: 'https://www.youtube.com/shorts/33wZzZ_siuw' },
          { nome: 'Cadeira Extensora Unilateral', series: 3, repeticoes: '8-12', peso: '60%', execucao: 'https://www.youtube.com/shorts/oss6FJx-oig' }
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
        nome: 'Upper I',
        grupo: 'Costas, Peito, Ombros, Braços, Abdômen',
        exercicios: [
          { nome: 'Puxada Alta Pronada', series: 5, repeticoes: '10-15', peso: '70%', execucao: 'http://www.youtube.com/watch?v=yp14vDyCUJA' },
          { nome: 'Remada Pronada Máquina', series: 5, repeticoes: '8-12', peso: '70%', execucao: 'http://www.youtube.com/watch?v=r4EmE8I74BQ' },
          { nome: 'Supino Inclinado no Smith', series: 4, repeticoes: '5-8', peso: '70%', execucao: 'http://www.youtube.com/watch?v=r39cVRTjFU8' },
          { nome: 'Elevação Lateral na Polia', series: 3, repeticoes: '8-15', peso: '50%', execucao: 'http://www.youtube.com/watch?v=dgpts8LHOLc' },
          { nome: 'Rosca Scott Unilateral com Halteres', series: 3, repeticoes: '10-15', peso: '60%', execucao: 'http://www.youtube.com/watch?v=qhRLio6bCRo' },
          { nome: 'Tríceps Francês na Polia', series: 3, repeticoes: '8-12', peso: '60%', execucao: 'http://www.youtube.com/watch?v=IW12KjVDaoo' },
          { nome: 'Abdominal Supra na Polia', series: 3, repeticoes: '5-8', peso: '30%', execucao: 'http://www.youtube.com/watch?v=9aFqmqhMXmw' }
        ]
      },
      {
        dia: 2,
        nome: 'Lower I',
        grupo: 'Pernas',
        exercicios: [
          { nome: 'Agachamento Smith', series: 5, repeticoes: '8-15', peso: '70%', execucao: 'http://www.youtube.com/watch?v=o2A0ta3E-Yo' },
          { nome: 'Mesa Flexora', series: 4, repeticoes: '10-15', peso: '70%', execucao: 'http://www.youtube.com/watch?v=IXg1PQ_5gmw' },
          { nome: 'Adução de Quadril na Máquina', series: 4, repeticoes: '8-12', peso: '60%', execucao: 'http://www.youtube.com/watch?v=7FrNWiK9HeY' },
          { nome: 'Cadeira Extensora Unilateral', series: 3, repeticoes: '5-8', peso: '60%', execucao: 'http://www.youtube.com/watch?v=OjlRBt6itcc' },
          { nome: 'Panturrilha Sentado na Máquina', series: 3, repeticoes: '8-15', peso: '50%', execucao: 'http://www.youtube.com/watch?v=1NBoneuGtQo' }
        ]
      },
      {
        dia: 3,
        nome: 'Upper II',
        grupo: 'Ombros, Peito, Costas, Braços',
        exercicios: [
          { nome: 'Desenvolvimento Máquina', series: 4, repeticoes: '10-15', peso: '60%', execucao: 'http://www.youtube.com/watch?v=uh0oZorifmM' },
          { nome: 'Chest Dips', series: 4, repeticoes: '8-12', peso: '0%', execucao: 'http://www.youtube.com/watch?v=SXBksC78v8M' },
          { nome: 'Crucifixo Máquina', series: 4, repeticoes: '5-8', peso: '60%', execucao: 'http://www.youtube.com/watch?v=9BEQWr0u-ac' },
          { nome: 'Remada Baixa Unilateral Neutra', series: 3, repeticoes: '8-15', peso: '60%', execucao: 'http://www.youtube.com/watch?v=LpQMEygJfNY' },
          { nome: 'Lat Pulldown Unilateral', series: 3, repeticoes: '10-15', peso: '60%', execucao: 'http://www.youtube.com/watch?v=-ITLgrwk4Dc' },
          { nome: 'Rosca Direta de Costas para a Polia', series: 3, repeticoes: '8-12', peso: '50%', execucao: 'http://www.youtube.com/watch?v=5c4wrpR8cW4' },
          { nome: 'Single Arm Tricep Pushdown', series: 3, repeticoes: '5-8', peso: '60%', execucao: 'http://www.youtube.com/watch?v=86rwUWNO5fo' }
        ]
      },
      {
        dia: 4,
        nome: 'Lower II',
        grupo: 'Pernas',
        exercicios: [
          { nome: 'Stiff Leg Deadlift', series: 5, repeticoes: '8-15', peso: '70%', execucao: 'http://www.youtube.com/watch?v=CN_7cz3P-1U' },
          { nome: 'Leg Press 45°', series: 4, repeticoes: '10-15', peso: '80%', execucao: 'http://www.youtube.com/watch?v=er2WkC80JOY' },
          { nome: 'Elevação Pélvica na Máquina', series: 3, repeticoes: '8-12', peso: '60%', execucao: 'http://www.youtube.com/watch?v=PUxseXckO0s' },
          { nome: 'Flexão Nórdica Reversa', series: 3, repeticoes: '5-8', peso: '0%', execucao: 'http://www.youtube.com/watch?v=EtsFx8uiKLE' },
          { nome: 'Panturrilha de Pé na Máquina', series: 3, repeticoes: '8-15', peso: '50%', execucao: 'http://www.youtube.com/watch?v=PNLdWhbgxkU' }
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
        nome: 'Peito, Ombros, Tríceps',
        grupo: 'Peito, Ombros, Tríceps',
        exercicios: [
          { nome: 'Supino Reto com Halteres', series: 5, repeticoes: '8-12', peso: '70%', execucao: 'https://www.youtube.com/watch?v=YQ2s_Y7g5Qk' },
          { nome: 'Crossover Polia Alta', series: 4, repeticoes: '10-15', peso: '60%', execucao: 'https://www.youtube.com/watch?v=Cj6P91eFXkM' },
          { nome: 'Elevação Lateral na Polia', series: 4, repeticoes: '5-8', peso: '50%', execucao: 'https://www.youtube.com/watch?v=lq7eLC30b9w' },
          { nome: 'Crucifixo Reverso Máquina', series: 3, repeticoes: '8-15', peso: '50%', execucao: 'https://www.youtube.com/shorts/wUT3hmnzq3c' },
          { nome: 'Tríceps Francês Unilateral na Polia Média', series: 3, repeticoes: '10-15', peso: '60%', execucao: 'https://www.youtube.com/watch?v=sUFUQVMWdnU&t=47s' },
          { nome: 'Carter Extensions', series: 3, repeticoes: '8-12', peso: '50%', execucao: 'https://www.youtube.com/shorts/oDtbY57JD9s' }
        ]
      },
      {
        dia: 2,
        nome: 'Costas, Bíceps, Abdômen',
        grupo: 'Costas, Bíceps, Abdômen',
        exercicios: [
          { nome: 'T-Bar Row (Remada T)', series: 5, repeticoes: '5-8', peso: '70%', execucao: 'https://www.youtube.com/watch?v=0UBRfiO4zDs' },
          { nome: 'Single Arm Cable Row', series: 4, repeticoes: '8-15', peso: '60%', execucao: 'https://www.youtube.com/watch?v=WvLMauqrnK8' },
          { nome: 'Unilateral Lat Pulldown', series: 4, repeticoes: '10-15', peso: '60%', execucao: 'https://www.youtube.com/shorts/XkGJJ2OJmZE' },
          { nome: 'Rosca Scott Unilateral com Halteres', series: 3, repeticoes: '8-12', peso: '60%', execucao: 'https://www.youtube.com/shorts/qhRLio6bCRo' },
          { nome: 'Bayesian Curl', series: 3, repeticoes: '5-8', peso: '50%', execucao: 'https://www.youtube.com/shorts/OxBhN2s9O5U' },
          { nome: 'Abdômen no Banco Romano', series: 3, repeticoes: '8-15', peso: '30%', execucao: 'https://www.youtube.com/watch?v=4dEVMa6EjY8' }
        ]
      },
      {
        dia: 3,
        nome: 'Pernas Completo',
        grupo: 'Pernas Completo',
        exercicios: [
          { nome: 'Panturrilha no Smith com Estepe', series: 5, repeticoes: '10-15', peso: '50%', execucao: 'https://www.youtube.com/shorts/wlqTemUXPXY' },
          { nome: 'Agachamento Smith', series: 4, repeticoes: '8-12', peso: '70%', execucao: 'https://www.youtube.com/watch?v=-eO_VydErV0' },
          { nome: 'Elevação Pélvica na Máquina', series: 4, repeticoes: '5-8', peso: '60%', execucao: 'https://www.youtube.com/watch?v=ZSPmIyX9RZs' },
          { nome: 'Mesa Flexora', series: 4, repeticoes: '8-15', peso: '70%', execucao: 'https://www.youtube.com/watch?v=SiwJ_T62l9c&t=14s' },
          { nome: 'Adução de Quadril na Máquina', series: 3, repeticoes: '10-15', peso: '60%', execucao: 'https://www.youtube.com/shorts/TB4BwvHaK9o' },
          { nome: 'Cadeira Extensora Unilateral', series: 3, repeticoes: '8-12', peso: '60%', execucao: 'https://www.youtube.com/shorts/oss6FJx-oig' }
        ]
      },
      {
        dia: 4,
        nome: 'Peito, Ombros, Costas, Bíceps',
        grupo: 'Peito, Ombros, Costas, Bíceps',
        exercicios: [
          { nome: 'Supino Inclinado com Halteres', series: 5, repeticoes: '5-8', peso: '70%', execucao: 'https://www.youtube.com/shorts/ZaNyRjpoki8' },
          { nome: 'Crucifixo Máquina', series: 3, repeticoes: '8-15', peso: '60%', execucao: 'https://www.youtube.com/shorts/MENdoLpyj7c' },
          { nome: 'Shoulder Press Machine', series: 4, repeticoes: '10-15', peso: '60%', execucao: 'https://www.youtube.com/watch?v=WvLMauqrnK8' },
          { nome: 'Rosca Scott Unilateral com Halteres', series: 3, repeticoes: '8-12', peso: '60%', execucao: 'https://www.youtube.com/shorts/qhRLio6bCRo' },
          { nome: 'Puxada Alta Pronada', series: 3, repeticoes: '5-8', peso: '70%', execucao: 'https://www.youtube.com/shorts/yp14vDyCUJA' },
          { nome: 'Chest Supported Kelso Shrugs', series: 3, repeticoes: '8-15', peso: '60%', execucao: 'https://www.youtube.com/watch?v=qKCuWRx-hKk&t=11s' },
          { nome: 'Rosca de Costas para Polia', series: 3, repeticoes: '10-15', peso: '50%', execucao: 'https://www.youtube.com/watch?v=BhEAlxpiTWM&t=33s' }
        ]
      },
      {
        dia: 5,
        nome: 'Pernas, Abdômen',
        grupo: 'Pernas, Abdômen',
        exercicios: [
          { nome: 'Stiff Leg Deadlift', series: 5, repeticoes: '8-12', peso: '70%', execucao: 'https://www.youtube.com/watch?v=CN_7cz3P-1U' },
          { nome: 'Leg Press 45°', series: 4, repeticoes: '10-15', peso: '80%', execucao: 'https://www.youtube.com/shorts/D9WR6PoMYxs' },
          { nome: 'Abdução de Quadril Máquina', series: 4, repeticoes: '5-8', peso: '60%', execucao: 'https://www.youtube.com/shorts/nabhYLtz8Gg' },
          { nome: 'Flexão Nórdica Reversa', series: 4, repeticoes: '8-15', peso: '0%', execucao: 'https://www.youtube.com/watch?v=6WXRylUxQ48' },
          { nome: 'Panturrilha Sentado na Máquina', series: 3, repeticoes: '10-15', peso: '50%', execucao: 'https://www.youtube.com/shorts/9fIw0ue8iQE' },
          { nome: 'Abdominal na Polia Alta', series: 3, repeticoes: '8-12', peso: '30%', execucao: 'https://www.youtube.com/watch?v=RXlO_LaEozQ&t=39s' }
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
        nome: 'Treino A',
        grupo: 'Peito, Costas, Ombros, Braços, Pernas',
        exercicios: [
          { nome: 'T-Bar Row', series: 5, repeticoes: '8-12', peso: '70%', execucao: 'https://www.youtube.com/watch?v=0UBRfiO4zDs' },
          { nome: 'Supino Inclinado Smith', series: 5, repeticoes: '10-15', peso: '70%', execucao: 'https://www.youtube.com/shorts/r39cVRTjFU8' },
          { nome: 'Cross Over Polia Alta', series: 3, repeticoes: '8-15', peso: '60%', execucao: 'https://www.youtube.com/shorts/MoShufDdMWA' },
          { nome: 'Elevação Lateral na Polia', series: 3, repeticoes: '5-8', peso: '50%', execucao: 'https://www.youtube.com/watch?v=lq7eLC30b9w' },
          { nome: 'Rosca Scott Unilateral com Halteres', series: 3, repeticoes: '10-15', peso: '60%', execucao: 'https://www.youtube.com/shorts/qhRLio6bCRo' },
          { nome: 'Tríceps Francês Unilateral na Polia', series: 3, repeticoes: '8-12', peso: '60%', execucao: 'https://www.youtube.com/watch?v=sUFUQVMWdnU&t=44s' },
          { nome: 'Leg Press', series: 3, repeticoes: '8-15', peso: '80%', execucao: 'https://www.youtube.com/shorts/NY5fw4Zaofg' }
        ]
      },
      {
        dia: 2,
        nome: 'Treino B',
        grupo: 'Peito, Costas, Ombros, Braços, Pernas',
        exercicios: [
          { nome: 'Crucifixo Máquina', series: 5, repeticoes: '5-8', peso: '60%', execucao: 'https://www.youtube.com/shorts/MENdoLpyj7c' },
          { nome: 'High Cable Rows', series: 5, repeticoes: '8-12', peso: '70%', execucao: 'https://www.youtube.com/shorts/z0SebEeAajI' },
          { nome: 'Single Arm Cable Row', series: 3, repeticoes: '10-15', peso: '60%', execucao: 'https://www.youtube.com/watch?v=WvLMauqrnK8' },
          { nome: 'Desenvolvimento Máquina', series: 3, repeticoes: '8-15', peso: '60%', execucao: 'https://www.youtube.com/watch?v=WvLMauqrnK8' },
          { nome: 'Bayesian Curl', series: 3, repeticoes: '5-8', peso: '50%', execucao: 'https://www.youtube.com/shorts/OxBhN2s9O5U' },
          { nome: 'Tríceps Corda na Polia', series: 3, repeticoes: '8-12', peso: '60%', execucao: 'https://www.youtube.com/shorts/-QGC1cL6ETE' },
          { nome: 'Mesa Flexora', series: 3, repeticoes: '10-15', peso: '70%', execucao: 'https://www.youtube.com/shorts/IXg1PQ_5gmw' }
        ]
      },
      {
        dia: 3,
        nome: 'Treino C',
        grupo: 'Peito, Costas, Ombros, Braços, Pernas',
        exercicios: [
          { nome: 'Stiff Leg Deadlift', series: 5, repeticoes: '8-15', peso: '70%', execucao: 'https://www.youtube.com/shorts/raMtPJQ5f9A' },
          { nome: 'Puxada Alta', series: 5, repeticoes: '10-15', peso: '70%', execucao: 'https://www.youtube.com/watch?v=EUIri47Epcg' },
          { nome: 'Chest Dips', series: 3, repeticoes: '8-12', peso: '0%', execucao: 'https://www.youtube.com/shorts/2Q22gXghCGA' },
          { nome: 'Supino Reto Máquina', series: 3, repeticoes: '5-8', peso: '70%', execucao: 'https://www.youtube.com/shorts/2awX3rTGa1k' },
          { nome: 'Elevação Lateral com Peito Apoiado no Banco', series: 4, repeticoes: '8-15', peso: '40%', execucao: 'https://www.youtube.com/shorts/6Hv7i2DpTgs' },
          { nome: 'Rosca Martelo Sentado com Halteres', series: 3, repeticoes: '10-15', peso: '60%', execucao: 'https://www.youtube.com/shorts/33wZzZ_siuw' },
          { nome: 'Cadeira Extensora Unilateral', series: 3, repeticoes: '8-12', peso: '60%', execucao: 'https://www.youtube.com/shorts/oss6FJx-oig' }
        ]
      },
      {
        dia: 4,
        nome: 'Treino A (Repetição)',
        grupo: 'Peito, Costas, Ombros, Braços, Pernas',
        exercicios: [
          { nome: 'T-Bar Row', series: 5, repeticoes: '8-12', peso: '70%', execucao: 'https://www.youtube.com/watch?v=0UBRfiO4zDs' },
          { nome: 'Supino Inclinado Smith', series: 5, repeticoes: '10-15', peso: '70%', execucao: 'https://www.youtube.com/shorts/r39cVRTjFU8' },
          { nome: 'Cross Over Polia Alta', series: 3, repeticoes: '8-15', peso: '60%', execucao: 'https://www.youtube.com/shorts/MoShufDdMWA' },
          { nome: 'Elevação Lateral na Polia', series: 3, repeticoes: '5-8', peso: '50%', execucao: 'https://www.youtube.com/watch?v=lq7eLC30b9w' },
          { nome: 'Rosca Scott Unilateral com Halteres', series: 3, repeticoes: '10-15', peso: '60%', execucao: 'https://www.youtube.com/shorts/qhRLio6bCRo' },
          { nome: 'Tríceps Francês Unilateral na Polia', series: 3, repeticoes: '8-12', peso: '60%', execucao: 'https://www.youtube.com/watch?v=sUFUQVMWdnU&t=44s' },
          { nome: 'Leg Press', series: 3, repeticoes: '8-15', peso: '80%', execucao: 'https://www.youtube.com/shorts/NY5fw4Zaofg' }
        ]
      },
      {
        dia: 5,
        nome: 'Treino B (Repetição)',
        grupo: 'Peito, Costas, Ombros, Braços, Pernas',
        exercicios: [
          { nome: 'Crucifixo Máquina', series: 5, repeticoes: '5-8', peso: '60%', execucao: 'https://www.youtube.com/shorts/MENdoLpyj7c' },
          { nome: 'High Cable Rows', series: 5, repeticoes: '8-12', peso: '70%', execucao: 'https://www.youtube.com/shorts/z0SebEeAajI' },
          { nome: 'Single Arm Cable Row', series: 3, repeticoes: '10-15', peso: '60%', execucao: 'https://www.youtube.com/watch?v=WvLMauqrnK8' },
          { nome: 'Desenvolvimento Máquina', series: 3, repeticoes: '8-15', peso: '60%', execucao: 'https://www.youtube.com/watch?v=WvLMauqrnK8' },
          { nome: 'Bayesian Curl', series: 3, repeticoes: '5-8', peso: '50%', execucao: 'https://www.youtube.com/shorts/OxBhN2s9O5U' },
          { nome: 'Tríceps Corda na Polia', series: 3, repeticoes: '8-12', peso: '60%', execucao: 'https://www.youtube.com/shorts/-QGC1cL6ETE' },
          { nome: 'Mesa Flexora', series: 3, repeticoes: '10-15', peso: '70%', execucao: 'https://www.youtube.com/shorts/IXg1PQ_5gmw' }
        ]
      },
      {
        dia: 6,
        nome: 'Treino C (Repetição)',
        grupo: 'Peito, Costas, Ombros, Braços, Pernas',
        exercicios: [
          { nome: 'Stiff Leg Deadlift', series: 5, repeticoes: '8-15', peso: '70%', execucao: 'https://www.youtube.com/shorts/raMtPJQ5f9A' },
          { nome: 'Puxada Alta', series: 5, repeticoes: '10-15', peso: '70%', execucao: 'https://www.youtube.com/watch?v=EUIri47Epcg' },
          { nome: 'Chest Dips', series: 3, repeticoes: '8-12', peso: '0%', execucao: 'https://www.youtube.com/shorts/2Q22gXghCGA' },
          { nome: 'Supino Reto Máquina', series: 3, repeticoes: '5-8', peso: '70%', execucao: 'https://www.youtube.com/shorts/2awX3rTGa1k' },
          { nome: 'Elevação Lateral com Peito Apoiado no Banco', series: 4, repeticoes: '8-15', peso: '40%', execucao: 'https://www.youtube.com/shorts/6Hv7i2DpTgs' },
          { nome: 'Rosca Martelo Sentado com Halteres', series: 3, repeticoes: '10-15', peso: '60%', execucao: 'https://www.youtube.com/shorts/33wZzZ_siuw' },
          { nome: 'Cadeira Extensora Unilateral', series: 3, repeticoes: '8-12', peso: '60%', execucao: 'https://www.youtube.com/shorts/oss6FJx-oig' }
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
          { nome: 'Flexão de Braço', series: 4, repeticoes: '12-20 reps', peso: '0%', execucao: 'https://www.youtube.com/shorts/6vnBD5W8BO0' },
          { nome: 'Flexão Inclinada', series: 3, repeticoes: '8-15 reps', peso: '0%', execucao: 'https://www.youtube.com/shorts/so5nuzZWwmI' },
          { nome: 'Flexão Declinada', series: 3, repeticoes: '8-12 reps', peso: '0%', execucao: 'https://www.youtube.com/shorts/QMwqXZNMEw4' },
          { nome: 'Flexão Diamante', series: 3, repeticoes: '5-12 reps', peso: '0%', execucao: 'https://www.youtube.com/shorts/BXSvlRderXI' }
        ]
      },
      {
        dia: 2,
        nome: 'Costas',
        grupo: 'Costas',
        exercicios: [
          { nome: 'Puxada com Toalha', series: 4, repeticoes: '10-15 reps', peso: '0%', execucao: 'https://www.youtube.com/shorts/xN6Nz0bmXek' },
          { nome: 'Superman', series: 3, repeticoes: '15-20 reps', peso: '0%', execucao: 'https://www.youtube.com/watch?v=17ElZ1pYuJE&ab_channel=GuilhermeStellbrinkIFisioPrev' },
          { nome: 'Remada com Garrafa', series: 4, repeticoes: '12-20 reps', peso: '0%', execucao: 'https://www.youtube.com/shorts/hUOt4goxjOo' },
          { nome: 'Prancha Reversa', series: 3, repeticoes: '20-40s', peso: '0%', execucao: 'https://www.youtube.com/shorts/BFHYT9qsFuE' }
        ]
      },
      {
        dia: 3,
        nome: 'Pernas',
        grupo: 'Pernas',
        exercicios: [
          { nome: 'Agachamento Livre', series: 4, repeticoes: '15-25 reps', peso: '0%', execucao: 'https://www.youtube.com/shorts/OuiSymjFTJs' },
          { nome: 'Lunges (Afundo)', series: 3, repeticoes: '12-20 reps', peso: '0%', execucao: 'https://www.youtube.com/shorts/wELlYTbRZ50' },
          { nome: 'Agachamento Búlgaro', series: 3, repeticoes: '10-15 reps', peso: '0%', execucao: 'https://www.youtube.com/shorts/_yam7073fNM' },
          { nome: 'Panturrilha', series: 4, repeticoes: '20-30 reps', peso: '0%', execucao: 'https://www.youtube.com/shorts/KCoe6a_cAkM' }
        ]
      },
      {
        dia: 4,
        nome: 'Braços',
        grupo: 'Braços',
        exercicios: [
          { nome: 'Flexão Diamante', series: 3, repeticoes: '5-12 reps', peso: '0%', execucao: 'https://www.youtube.com/shorts/BXSvlRderXI' },
          { nome: 'Tríceps no Chão', series: 3, repeticoes: '8-15 reps', peso: '0%', execucao: 'https://www.youtube.com/shorts/7tcrMfukE4Q' },
          { nome: 'Rosca com Garrafa', series: 4, repeticoes: '12-20 reps', peso: '0%', execucao: 'https://www.youtube.com/shorts/viNiQ5NnF6E' },
          { nome: 'Tríceps na Cadeira', series: 3, repeticoes: '8-15 reps', peso: '0%', execucao: 'https://www.youtube.com/shorts/C7gJT-XCYj8' }
        ]
      },
      {
        dia: 5,
        nome: 'Abdômen',
        grupo: 'Abdômen',
        exercicios: [
          { nome: 'Abdominal Tradicional', series: 4, repeticoes: '15-25 reps', peso: '0%', execucao: 'https://www.youtube.com/shorts/vRDR_MmFHcI' },
          { nome: 'Prancha', series: 3, repeticoes: '30-60s', peso: '0%', execucao: 'https://www.youtube.com/shorts/uxPlAbWFUDs' },
          { nome: 'Bicicleta', series: 3, repeticoes: '20-30 reps', peso: '0%', execucao: 'https://www.youtube.com/shorts/6s4cDQw1RwU' },
          { nome: 'Mountain Climber', series: 3, repeticoes: '20-40 reps', peso: '0%', execucao: 'https://www.youtube.com/shorts/ywYRG1oBKWU' }
        ]
      }
    ]
  }
};

// Duplicando os treinos para versão feminina (mesmo conteúdo por enquanto)
const treinosDataFeminino: Record<TipoTreino, DiasTreino> = {
  '3x': {
    titulo: 'Treino 3x por Semana',
    frequencia: 'Frequência: 3x por semana',
    tipo: 'academia',
    duracao: '45-60 minutos',
    dias: [
      {
        dia: 1,
        nome: 'Treino A',
        grupo: 'Peito, Costas, Ombros, Braços, Pernas',
        exercicios: [
          { nome: 'T-Bar Row', series: 5, repeticoes: '8-12', peso: '70%', execucao: 'https://www.youtube.com/watch?v=0UBRfiO4zDs' },
          { nome: 'Supino Inclinado Smith', series: 5, repeticoes: '10-15', peso: '70%', execucao: 'https://www.youtube.com/shorts/r39cVRTjFU8' },
          { nome: 'Cross Over Polia Alta', series: 3, repeticoes: '8-15', peso: '60%', execucao: 'https://www.youtube.com/shorts/MoShufDdMWA' },
          { nome: 'Elevação Lateral na Polia', series: 3, repeticoes: '5-8', peso: '50%', execucao: 'https://www.youtube.com/watch?v=lq7eLC30b9w' },
          { nome: 'Rosca Scott Unilateral com Halteres', series: 3, repeticoes: '10-15', peso: '60%', execucao: 'https://www.youtube.com/shorts/qhRLio6bCRo' },
          { nome: 'Tríceps Francês Unilateral na Polia', series: 3, repeticoes: '8-12', peso: '60%', execucao: 'https://www.youtube.com/watch?v=sUFUQVMWdnU&t=44s' },
          { nome: 'Leg Press', series: 3, repeticoes: '8-15', peso: '80%', execucao: 'https://www.youtube.com/shorts/NY5fw4Zaofg' }
        ]
      },
      {
        dia: 2,
        nome: 'Treino B',
        grupo: 'Peito, Costas, Ombros, Braços, Pernas',
        exercicios: [
          { nome: 'Crucifixo Máquina', series: 5, repeticoes: '5-8', peso: '60%', execucao: 'https://www.youtube.com/shorts/MENdoLpyj7c' },
          { nome: 'High Cable Rows', series: 5, repeticoes: '8-12', peso: '70%', execucao: 'https://www.youtube.com/shorts/z0SebEeAajI' },
          { nome: 'Single Arm Cable Row', series: 3, repeticoes: '10-15', peso: '60%', execucao: 'https://www.youtube.com/watch?v=WvLMauqrnK8' },
          { nome: 'Desenvolvimento Máquina', series: 3, repeticoes: '8-15', peso: '60%', execucao: 'https://www.youtube.com/watch?v=WvLMauqrnK8' },
          { nome: 'Bayesian Curl', series: 3, repeticoes: '5-8', peso: '50%', execucao: 'https://www.youtube.com/shorts/OxBhN2s9O5U' },
          { nome: 'Tríceps Corda na Polia', series: 3, repeticoes: '8-12', peso: '60%', execucao: 'https://www.youtube.com/shorts/-QGC1cL6ETE' },
          { nome: 'Mesa Flexora', series: 3, repeticoes: '10-15', peso: '70%', execucao: 'https://www.youtube.com/shorts/IXg1PQ_5gmw' }
        ]
      },
      {
        dia: 3,
        nome: 'Treino C',
        grupo: 'Peito, Costas, Ombros, Braços, Pernas',
        exercicios: [
          { nome: 'Stiff Leg Deadlift', series: 5, repeticoes: '8-15', peso: '70%', execucao: 'https://www.youtube.com/shorts/raMtPJQ5f9A' },
          { nome: 'Puxada Alta', series: 5, repeticoes: '10-15', peso: '70%', execucao: 'https://www.youtube.com/watch?v=EUIri47Epcg' },
          { nome: 'Chest Dips', series: 3, repeticoes: '8-12', peso: '0%', execucao: 'https://www.youtube.com/shorts/2Q22gXghCGA' },
          { nome: 'Supino Reto Máquina', series: 3, repeticoes: '5-8', peso: '70%', execucao: 'https://www.youtube.com/shorts/2awX3rTGa1k' },
          { nome: 'Elevação Lateral com Peito Apoiado no Banco', series: 4, repeticoes: '8-15', peso: '40%', execucao: 'https://www.youtube.com/shorts/6Hv7i2DpTgs' },
          { nome: 'Rosca Martelo Sentado com Halteres', series: 3, repeticoes: '10-15', peso: '60%', execucao: 'https://www.youtube.com/shorts/33wZzZ_siuw' },
          { nome: 'Cadeira Extensora Unilateral', series: 3, repeticoes: '8-12', peso: '60%', execucao: 'https://www.youtube.com/shorts/oss6FJx-oig' }
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
        nome: 'Upper I',
        grupo: 'Costas, Peito, Ombros, Braços, Abdômen',
        exercicios: [
          { nome: 'Puxada Alta Pronada', series: 5, repeticoes: '10-15', peso: '70%', execucao: 'http://www.youtube.com/watch?v=yp14vDyCUJA' },
          { nome: 'Remada Pronada Máquina', series: 5, repeticoes: '8-12', peso: '70%', execucao: 'http://www.youtube.com/watch?v=r4EmE8I74BQ' },
          { nome: 'Supino Inclinado no Smith', series: 4, repeticoes: '5-8', peso: '70%', execucao: 'http://www.youtube.com/watch?v=r39cVRTjFU8' },
          { nome: 'Elevação Lateral na Polia', series: 3, repeticoes: '8-15', peso: '50%', execucao: 'http://www.youtube.com/watch?v=dgpts8LHOLc' },
          { nome: 'Rosca Scott Unilateral com Halteres', series: 3, repeticoes: '10-15', peso: '60%', execucao: 'http://www.youtube.com/watch?v=qhRLio6bCRo' },
          { nome: 'Tríceps Francês na Polia', series: 3, repeticoes: '8-12', peso: '60%', execucao: 'http://www.youtube.com/watch?v=IW12KjVDaoo' },
          { nome: 'Abdominal Supra na Polia', series: 3, repeticoes: '5-8', peso: '30%', execucao: 'http://www.youtube.com/watch?v=9aFqmqhMXmw' }
        ]
      },
      {
        dia: 2,
        nome: 'Lower I',
        grupo: 'Pernas',
        exercicios: [
          { nome: 'Agachamento Smith', series: 5, repeticoes: '8-15', peso: '70%', execucao: 'http://www.youtube.com/watch?v=o2A0ta3E-Yo' },
          { nome: 'Mesa Flexora', series: 4, repeticoes: '10-15', peso: '70%', execucao: 'http://www.youtube.com/watch?v=IXg1PQ_5gmw' },
          { nome: 'Adução de Quadril na Máquina', series: 4, repeticoes: '8-12', peso: '60%', execucao: 'http://www.youtube.com/watch?v=7FrNWiK9HeY' },
          { nome: 'Cadeira Extensora Unilateral', series: 3, repeticoes: '5-8', peso: '60%', execucao: 'http://www.youtube.com/watch?v=OjlRBt6itcc' },
          { nome: 'Panturrilha Sentado na Máquina', series: 3, repeticoes: '8-15', peso: '50%', execucao: 'http://www.youtube.com/watch?v=1NBoneuGtQo' }
        ]
      },
      {
        dia: 3,
        nome: 'Upper II',
        grupo: 'Ombros, Peito, Costas, Braços',
        exercicios: [
          { nome: 'Desenvolvimento Máquina', series: 4, repeticoes: '10-15', peso: '60%', execucao: 'http://www.youtube.com/watch?v=uh0oZorifmM' },
          { nome: 'Chest Dips', series: 4, repeticoes: '8-12', peso: '0%', execucao: 'http://www.youtube.com/watch?v=SXBksC78v8M' },
          { nome: 'Crucifixo Máquina', series: 4, repeticoes: '5-8', peso: '60%', execucao: 'http://www.youtube.com/watch?v=9BEQWr0u-ac' },
          { nome: 'Remada Baixa Unilateral Neutra', series: 3, repeticoes: '8-15', peso: '60%', execucao: 'http://www.youtube.com/watch?v=LpQMEygJfNY' },
          { nome: 'Lat Pulldown Unilateral', series: 3, repeticoes: '10-15', peso: '60%', execucao: 'http://www.youtube.com/watch?v=-ITLgrwk4Dc' },
          { nome: 'Rosca Direta de Costas para a Polia', series: 3, repeticoes: '8-12', peso: '50%', execucao: 'http://www.youtube.com/watch?v=5c4wrpR8cW4' },
          { nome: 'Single Arm Tricep Pushdown', series: 3, repeticoes: '5-8', peso: '60%', execucao: 'http://www.youtube.com/watch?v=86rwUWNO5fo' }
        ]
      },
      {
        dia: 4,
        nome: 'Lower II',
        grupo: 'Pernas',
        exercicios: [
          { nome: 'Stiff Leg Deadlift', series: 5, repeticoes: '8-15', peso: '70%', execucao: 'http://www.youtube.com/watch?v=CN_7cz3P-1U' },
          { nome: 'Leg Press 45°', series: 4, repeticoes: '10-15', peso: '80%', execucao: 'http://www.youtube.com/watch?v=er2WkC80JOY' },
          { nome: 'Elevação Pélvica na Máquina', series: 3, repeticoes: '8-12', peso: '60%', execucao: 'http://www.youtube.com/watch?v=PUxseXckO0s' },
          { nome: 'Flexão Nórdica Reversa', series: 3, repeticoes: '5-8', peso: '0%', execucao: 'http://www.youtube.com/watch?v=EtsFx8uiKLE' },
          { nome: 'Panturrilha de Pé na Máquina', series: 3, repeticoes: '8-15', peso: '50%', execucao: 'http://www.youtube.com/watch?v=PNLdWhbgxkU' }
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
        nome: 'Peito, Ombros, Tríceps',
        grupo: 'Peito, Ombros, Tríceps',
        exercicios: [
          { nome: 'Supino Reto com Halteres', series: 5, repeticoes: '8-12', peso: '70%', execucao: 'https://www.youtube.com/watch?v=YQ2s_Y7g5Qk' },
          { nome: 'Crossover Polia Alta', series: 4, repeticoes: '10-15', peso: '60%', execucao: 'https://www.youtube.com/watch?v=Cj6P91eFXkM' },
          { nome: 'Elevação Lateral na Polia', series: 4, repeticoes: '5-8', peso: '50%', execucao: 'https://www.youtube.com/watch?v=lq7eLC30b9w' },
          { nome: 'Crucifixo Reverso Máquina', series: 3, repeticoes: '8-15', peso: '50%', execucao: 'https://www.youtube.com/shorts/wUT3hmnzq3c' },
          { nome: 'Tríceps Francês Unilateral na Polia Média', series: 3, repeticoes: '10-15', peso: '60%', execucao: 'https://www.youtube.com/watch?v=sUFUQVMWdnU&t=47s' },
          { nome: 'Carter Extensions', series: 3, repeticoes: '8-12', peso: '50%', execucao: 'https://www.youtube.com/shorts/oDtbY57JD9s' }
        ]
      },
      {
        dia: 2,
        nome: 'Costas, Bíceps, Abdômen',
        grupo: 'Costas, Bíceps, Abdômen',
        exercicios: [
          { nome: 'T-Bar Row (Remada T)', series: 5, repeticoes: '5-8', peso: '70%', execucao: 'https://www.youtube.com/watch?v=0UBRfiO4zDs' },
          { nome: 'Single Arm Cable Row', series: 4, repeticoes: '8-15', peso: '60%', execucao: 'https://www.youtube.com/watch?v=WvLMauqrnK8' },
          { nome: 'Unilateral Lat Pulldown', series: 4, repeticoes: '10-15', peso: '60%', execucao: 'https://www.youtube.com/shorts/XkGJJ2OJmZE' },
          { nome: 'Rosca Scott Unilateral com Halteres', series: 3, repeticoes: '8-12', peso: '60%', execucao: 'https://www.youtube.com/shorts/qhRLio6bCRo' },
          { nome: 'Bayesian Curl', series: 3, repeticoes: '5-8', peso: '50%', execucao: 'https://www.youtube.com/shorts/OxBhN2s9O5U' },
          { nome: 'Abdômen no Banco Romano', series: 3, repeticoes: '8-15', peso: '30%', execucao: 'https://www.youtube.com/watch?v=4dEVMa6EjY8' }
        ]
      },
      {
        dia: 3,
        nome: 'Pernas Completo',
        grupo: 'Pernas Completo',
        exercicios: [
          { nome: 'Panturrilha no Smith com Estepe', series: 5, repeticoes: '10-15', peso: '50%', execucao: 'https://www.youtube.com/shorts/wlqTemUXPXY' },
          { nome: 'Agachamento Smith', series: 4, repeticoes: '8-12', peso: '70%', execucao: 'https://www.youtube.com/watch?v=-eO_VydErV0' },
          { nome: 'Elevação Pélvica na Máquina', series: 4, repeticoes: '5-8', peso: '60%', execucao: 'https://www.youtube.com/watch?v=ZSPmIyX9RZs' },
          { nome: 'Mesa Flexora', series: 4, repeticoes: '8-15', peso: '70%', execucao: 'https://www.youtube.com/watch?v=SiwJ_T62l9c&t=14s' },
          { nome: 'Adução de Quadril na Máquina', series: 3, repeticoes: '10-15', peso: '60%', execucao: 'https://www.youtube.com/shorts/TB4BwvHaK9o' },
          { nome: 'Cadeira Extensora Unilateral', series: 3, repeticoes: '8-12', peso: '60%', execucao: 'https://www.youtube.com/shorts/oss6FJx-oig' }
        ]
      },
      {
        dia: 4,
        nome: 'Peito, Ombros, Costas, Bíceps',
        grupo: 'Peito, Ombros, Costas, Bíceps',
        exercicios: [
          { nome: 'Supino Inclinado com Halteres', series: 5, repeticoes: '5-8', peso: '70%', execucao: 'https://www.youtube.com/shorts/ZaNyRjpoki8' },
          { nome: 'Crucifixo Máquina', series: 3, repeticoes: '8-15', peso: '60%', execucao: 'https://www.youtube.com/shorts/MENdoLpyj7c' },
          { nome: 'Shoulder Press Machine', series: 4, repeticoes: '10-15', peso: '60%', execucao: 'https://www.youtube.com/watch?v=WvLMauqrnK8' },
          { nome: 'Rosca Scott Unilateral com Halteres', series: 3, repeticoes: '8-12', peso: '60%', execucao: 'https://www.youtube.com/shorts/qhRLio6bCRo' },
          { nome: 'Puxada Alta Pronada', series: 3, repeticoes: '5-8', peso: '70%', execucao: 'https://www.youtube.com/shorts/yp14vDyCUJA' },
          { nome: 'Chest Supported Kelso Shrugs', series: 3, repeticoes: '8-15', peso: '60%', execucao: 'https://www.youtube.com/watch?v=qKCuWRx-hKk&t=11s' },
          { nome: 'Rosca de Costas para Polia', series: 3, repeticoes: '10-15', peso: '50%', execucao: 'https://www.youtube.com/watch?v=BhEAlxpiTWM&t=33s' }
        ]
      },
      {
        dia: 5,
        nome: 'Pernas, Abdômen',
        grupo: 'Pernas, Abdômen',
        exercicios: [
          { nome: 'Stiff Leg Deadlift', series: 5, repeticoes: '8-12', peso: '70%', execucao: 'https://www.youtube.com/watch?v=CN_7cz3P-1U' },
          { nome: 'Leg Press 45°', series: 4, repeticoes: '10-15', peso: '80%', execucao: 'https://www.youtube.com/shorts/D9WR6PoMYxs' },
          { nome: 'Abdução de Quadril Máquina', series: 4, repeticoes: '5-8', peso: '60%', execucao: 'https://www.youtube.com/shorts/nabhYLtz8Gg' },
          { nome: 'Flexão Nórdica Reversa', series: 4, repeticoes: '8-15', peso: '0%', execucao: 'https://www.youtube.com/watch?v=6WXRylUxQ48' },
          { nome: 'Panturrilha Sentado na Máquina', series: 3, repeticoes: '10-15', peso: '50%', execucao: 'https://www.youtube.com/shorts/9fIw0ue8iQE' },
          { nome: 'Abdominal na Polia Alta', series: 3, repeticoes: '8-12', peso: '30%', execucao: 'https://www.youtube.com/watch?v=RXlO_LaEozQ&t=39s' }
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
        nome: 'Treino A',
        grupo: 'Peito, Costas, Ombros, Braços, Pernas',
        exercicios: [
          { nome: 'T-Bar Row', series: 5, repeticoes: '8-12', peso: '70%', execucao: 'https://www.youtube.com/watch?v=0UBRfiO4zDs' },
          { nome: 'Supino Inclinado Smith', series: 5, repeticoes: '10-15', peso: '70%', execucao: 'https://www.youtube.com/shorts/r39cVRTjFU8' },
          { nome: 'Cross Over Polia Alta', series: 3, repeticoes: '8-15', peso: '60%', execucao: 'https://www.youtube.com/shorts/MoShufDdMWA' },
          { nome: 'Elevação Lateral na Polia', series: 3, repeticoes: '5-8', peso: '50%', execucao: 'https://www.youtube.com/watch?v=lq7eLC30b9w' },
          { nome: 'Rosca Scott Unilateral com Halteres', series: 3, repeticoes: '10-15', peso: '60%', execucao: 'https://www.youtube.com/shorts/qhRLio6bCRo' },
          { nome: 'Tríceps Francês Unilateral na Polia', series: 3, repeticoes: '8-12', peso: '60%', execucao: 'https://www.youtube.com/watch?v=sUFUQVMWdnU&t=44s' },
          { nome: 'Leg Press', series: 3, repeticoes: '8-15', peso: '80%', execucao: 'https://www.youtube.com/shorts/NY5fw4Zaofg' }
        ]
      },
      {
        dia: 2,
        nome: 'Treino B',
        grupo: 'Peito, Costas, Ombros, Braços, Pernas',
        exercicios: [
          { nome: 'Crucifixo Máquina', series: 5, repeticoes: '5-8', peso: '60%', execucao: 'https://www.youtube.com/shorts/MENdoLpyj7c' },
          { nome: 'High Cable Rows', series: 5, repeticoes: '8-12', peso: '70%', execucao: 'https://www.youtube.com/shorts/z0SebEeAajI' },
          { nome: 'Single Arm Cable Row', series: 3, repeticoes: '10-15', peso: '60%', execucao: 'https://www.youtube.com/watch?v=WvLMauqrnK8' },
          { nome: 'Desenvolvimento Máquina', series: 3, repeticoes: '8-15', peso: '60%', execucao: 'https://www.youtube.com/watch?v=WvLMauqrnK8' },
          { nome: 'Bayesian Curl', series: 3, repeticoes: '5-8', peso: '50%', execucao: 'https://www.youtube.com/shorts/OxBhN2s9O5U' },
          { nome: 'Tríceps Corda na Polia', series: 3, repeticoes: '8-12', peso: '60%', execucao: 'https://www.youtube.com/shorts/-QGC1cL6ETE' },
          { nome: 'Mesa Flexora', series: 3, repeticoes: '10-15', peso: '70%', execucao: 'https://www.youtube.com/shorts/IXg1PQ_5gmw' }
        ]
      },
      {
        dia: 3,
        nome: 'Treino C',
        grupo: 'Peito, Costas, Ombros, Braços, Pernas',
        exercicios: [
          { nome: 'Stiff Leg Deadlift', series: 5, repeticoes: '8-15', peso: '70%', execucao: 'https://www.youtube.com/shorts/raMtPJQ5f9A' },
          { nome: 'Puxada Alta', series: 5, repeticoes: '10-15', peso: '70%', execucao: 'https://www.youtube.com/watch?v=EUIri47Epcg' },
          { nome: 'Chest Dips', series: 3, repeticoes: '8-12', peso: '0%', execucao: 'https://www.youtube.com/shorts/2Q22gXghCGA' },
          { nome: 'Supino Reto Máquina', series: 3, repeticoes: '5-8', peso: '70%', execucao: 'https://www.youtube.com/shorts/2awX3rTGa1k' },
          { nome: 'Elevação Lateral com Peito Apoiado no Banco', series: 4, repeticoes: '8-15', peso: '40%', execucao: 'https://www.youtube.com/shorts/6Hv7i2DpTgs' },
          { nome: 'Rosca Martelo Sentado com Halteres', series: 3, repeticoes: '10-15', peso: '60%', execucao: 'https://www.youtube.com/shorts/33wZzZ_siuw' },
          { nome: 'Cadeira Extensora Unilateral', series: 3, repeticoes: '8-12', peso: '60%', execucao: 'https://www.youtube.com/shorts/oss6FJx-oig' }
        ]
      },
      {
        dia: 4,
        nome: 'Treino A (Repetição)',
        grupo: 'Peito, Costas, Ombros, Braços, Pernas',
        exercicios: [
          { nome: 'T-Bar Row', series: 5, repeticoes: '8-12', peso: '70%', execucao: 'https://www.youtube.com/watch?v=0UBRfiO4zDs' },
          { nome: 'Supino Inclinado Smith', series: 5, repeticoes: '10-15', peso: '70%', execucao: 'https://www.youtube.com/shorts/r39cVRTjFU8' },
          { nome: 'Cross Over Polia Alta', series: 3, repeticoes: '8-15', peso: '60%', execucao: 'https://www.youtube.com/shorts/MoShufDdMWA' },
          { nome: 'Elevação Lateral na Polia', series: 3, repeticoes: '5-8', peso: '50%', execucao: 'https://www.youtube.com/watch?v=lq7eLC30b9w' },
          { nome: 'Rosca Scott Unilateral com Halteres', series: 3, repeticoes: '10-15', peso: '60%', execucao: 'https://www.youtube.com/shorts/qhRLio6bCRo' },
          { nome: 'Tríceps Francês Unilateral na Polia', series: 3, repeticoes: '8-12', peso: '60%', execucao: 'https://www.youtube.com/watch?v=sUFUQVMWdnU&t=44s' },
          { nome: 'Leg Press', series: 3, repeticoes: '8-15', peso: '80%', execucao: 'https://www.youtube.com/shorts/NY5fw4Zaofg' }
        ]
      },
      {
        dia: 5,
        nome: 'Treino B (Repetição)',
        grupo: 'Peito, Costas, Ombros, Braços, Pernas',
        exercicios: [
          { nome: 'Crucifixo Máquina', series: 5, repeticoes: '5-8', peso: '60%', execucao: 'https://www.youtube.com/shorts/MENdoLpyj7c' },
          { nome: 'High Cable Rows', series: 5, repeticoes: '8-12', peso: '70%', execucao: 'https://www.youtube.com/shorts/z0SebEeAajI' },
          { nome: 'Single Arm Cable Row', series: 3, repeticoes: '10-15', peso: '60%', execucao: 'https://www.youtube.com/watch?v=WvLMauqrnK8' },
          { nome: 'Desenvolvimento Máquina', series: 3, repeticoes: '8-15', peso: '60%', execucao: 'https://www.youtube.com/watch?v=WvLMauqrnK8' },
          { nome: 'Bayesian Curl', series: 3, repeticoes: '5-8', peso: '50%', execucao: 'https://www.youtube.com/shorts/OxBhN2s9O5U' },
          { nome: 'Tríceps Corda na Polia', series: 3, repeticoes: '8-12', peso: '60%', execucao: 'https://www.youtube.com/shorts/-QGC1cL6ETE' },
          { nome: 'Mesa Flexora', series: 3, repeticoes: '10-15', peso: '70%', execucao: 'https://www.youtube.com/shorts/IXg1PQ_5gmw' }
        ]
      },
      {
        dia: 6,
        nome: 'Treino C (Repetição)',
        grupo: 'Peito, Costas, Ombros, Braços, Pernas',
        exercicios: [
          { nome: 'Stiff Leg Deadlift', series: 5, repeticoes: '8-15', peso: '70%', execucao: 'https://www.youtube.com/shorts/raMtPJQ5f9A' },
          { nome: 'Puxada Alta', series: 5, repeticoes: '10-15', peso: '70%', execucao: 'https://www.youtube.com/watch?v=EUIri47Epcg' },
          { nome: 'Chest Dips', series: 3, repeticoes: '8-12', peso: '0%', execucao: 'https://www.youtube.com/shorts/2Q22gXghCGA' },
          { nome: 'Supino Reto Máquina', series: 3, repeticoes: '5-8', peso: '70%', execucao: 'https://www.youtube.com/shorts/2awX3rTGa1k' },
          { nome: 'Elevação Lateral com Peito Apoiado no Banco', series: 4, repeticoes: '8-15', peso: '40%', execucao: 'https://www.youtube.com/shorts/6Hv7i2DpTgs' },
          { nome: 'Rosca Martelo Sentado com Halteres', series: 3, repeticoes: '10-15', peso: '60%', execucao: 'https://www.youtube.com/shorts/33wZzZ_siuw' },
          { nome: 'Cadeira Extensora Unilateral', series: 3, repeticoes: '8-12', peso: '60%', execucao: 'https://www.youtube.com/shorts/oss6FJx-oig' }
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
          { nome: 'Flexão de Braço', series: 4, repeticoes: '12-20 reps', peso: '0%', execucao: 'https://www.youtube.com/shorts/6vnBD5W8BO0' },
          { nome: 'Flexão Inclinada', series: 3, repeticoes: '8-15 reps', peso: '0%', execucao: 'https://www.youtube.com/shorts/so5nuzZWwmI' },
          { nome: 'Flexão Declinada', series: 3, repeticoes: '8-12 reps', peso: '0%', execucao: 'https://www.youtube.com/shorts/QMwqXZNMEw4' },
          { nome: 'Flexão Diamante', series: 3, repeticoes: '5-12 reps', peso: '0%', execucao: 'https://www.youtube.com/shorts/BXSvlRderXI' }
        ]
      },
      {
        dia: 2,
        nome: 'Costas',
        grupo: 'Costas',
        exercicios: [
          { nome: 'Puxada com Toalha', series: 4, repeticoes: '10-15 reps', peso: '0%', execucao: 'https://www.youtube.com/shorts/xN6Nz0bmXek' },
          { nome: 'Superman', series: 3, repeticoes: '15-20 reps', peso: '0%', execucao: 'https://www.youtube.com/watch?v=17ElZ1pYuJE&ab_channel=GuilhermeStellbrinkIFisioPrev' },
          { nome: 'Remada com Garrafa', series: 4, repeticoes: '12-20 reps', peso: '0%', execucao: 'https://www.youtube.com/shorts/hUOt4goxjOo' },
          { nome: 'Prancha Reversa', series: 3, repeticoes: '20-40s', peso: '0%', execucao: 'https://www.youtube.com/shorts/BFHYT9qsFuE' }
        ]
      },
      {
        dia: 3,
        nome: 'Pernas',
        grupo: 'Pernas',
        exercicios: [
          { nome: 'Agachamento Livre', series: 4, repeticoes: '15-25 reps', peso: '0%', execucao: 'https://www.youtube.com/shorts/OuiSymjFTJs' },
          { nome: 'Lunges (Afundo)', series: 3, repeticoes: '12-20 reps', peso: '0%', execucao: 'https://www.youtube.com/shorts/wELlYTbRZ50' },
          { nome: 'Agachamento Búlgaro', series: 3, repeticoes: '10-15 reps', peso: '0%', execucao: 'https://www.youtube.com/shorts/_yam7073fNM' },
          { nome: 'Panturrilha', series: 4, repeticoes: '20-30 reps', peso: '0%', execucao: 'https://www.youtube.com/shorts/KCoe6a_cAkM' }
        ]
      },
      {
        dia: 4,
        nome: 'Braços',
        grupo: 'Braços',
        exercicios: [
          { nome: 'Flexão Diamante', series: 3, repeticoes: '5-12 reps', peso: '0%', execucao: 'https://www.youtube.com/shorts/BXSvlRderXI' },
          { nome: 'Tríceps no Chão', series: 3, repeticoes: '8-15 reps', peso: '0%', execucao: 'https://www.youtube.com/shorts/7tcrMfukE4Q' },
          { nome: 'Rosca com Garrafa', series: 4, repeticoes: '12-20 reps', peso: '0%', execucao: 'https://www.youtube.com/shorts/viNiQ5NnF6E' },
          { nome: 'Tríceps na Cadeira', series: 3, repeticoes: '8-15 reps', peso: '0%', execucao: 'https://www.youtube.com/shorts/C7gJT-XCYj8' }
        ]
      },
      {
        dia: 5,
        nome: 'Abdômen',
        grupo: 'Abdômen',
        exercicios: [
          { nome: 'Abdominal Tradicional', series: 4, repeticoes: '15-25 reps', peso: '0%', execucao: 'https://www.youtube.com/shorts/vRDR_MmFHcI' },
          { nome: 'Prancha', series: 3, repeticoes: '30-60s', peso: '0%', execucao: 'https://www.youtube.com/shorts/uxPlAbWFUDs' },
          { nome: 'Bicicleta', series: 3, repeticoes: '20-30 reps', peso: '0%', execucao: 'https://www.youtube.com/shorts/6s4cDQw1RwU' },
          { nome: 'Mountain Climber', series: 3, repeticoes: '20-40 reps', peso: '0%', execucao: 'https://www.youtube.com/shorts/ywYRG1oBKWU' }
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
  const [generoSelecionado, setGeneroSelecionado] = useState<'masculino' | 'feminino'>('masculino');

  const treinosData = generoSelecionado === 'masculino' ? treinosDataMasculino : treinosDataFeminino;
  const treinoAtual = treinosData[treinoSelecionado];

  const getIconeTipo = (tipo: string) => {
    switch (tipo) {
      case 'casa': return <Home className="w-4 h-4" />;
      case 'academia': return <Building className="w-4 h-4" />;
      default: return <Dumbbell className="w-4 h-4" />;
    }
  };



  return (
    <div className="min-h-screen text-white p-6 pb-6 lg:pb-6" style={{ backgroundColor: '#0B111F' }}>
      {/* Header Premium com Título Dourado e toggle de gênero */}
      <div className="text-center space-y-4 mb-8 relative">
        {/* Toggle de Gênero - Responsivo */}
        <div className="absolute top-0 right-0 sm:right-0 max-sm:relative max-sm:flex max-sm:justify-center max-sm:mb-4">
          <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full p-1 gap-1 max-sm:scale-90">
            <Toggle
              pressed={generoSelecionado === 'masculino'}
              onPressedChange={() => setGeneroSelecionado('masculino')}
              className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                generoSelecionado === 'masculino'
                  ? 'bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              👨 Masculino
            </Toggle>
            <Toggle
              pressed={generoSelecionado === 'feminino'}
              onPressedChange={() => setGeneroSelecionado('feminino')}
              className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                generoSelecionado === 'feminino'
                  ? 'bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              👩 Feminino
            </Toggle>
          </div>
        </div>

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
        
        {/* Botão Observações */}
        <div className="mt-4 flex justify-center">
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all duration-200"
              >
                <Info className="w-4 h-4 mr-2" />
                Observações
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-white text-gray-900">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-yellow-600 flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Observações Importantes
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-gray-700">
                <p className="text-sm leading-relaxed">
                  <span className="font-semibold text-orange-600">Séries preparatórias</span> servem para preparar o sistema nervoso central, permitindo que faça suas séries de trabalho da maneira mais segura e bem feita quanto for possível.
                </p>
                
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                  <h3 className="font-bold text-yellow-800 mb-2">CONCEITOS BÁSICOS - SÉRIES PREPARATÓRIAS:</h3>
                  <p className="text-sm text-yellow-700 leading-relaxed">
                    Essas séries não contam no volume de treino semanal, pois não são levadas próximo a falha o suficiente para induzir hipertrofia. Pensando nisso, tome cuidado para não passar dos RIR indicados. Dessa forma, evitará acumular fadiga desnecessária, diminuindo sua performance nas séries válidas.
                  </p>
                </div>
                
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <p className="text-sm text-blue-700 leading-relaxed font-medium">
                    💡 <span className="font-bold">Dica importante:</span> Por isso as séries começam com repetições mais altas, aumente a carga à medida que as repetições diminuem.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 bg-gradient-to-r ${colors.dot} rounded-full flex-shrink-0 mt-2`}></div>
                        <h4 className="font-bold text-gray-800 leading-tight">{exercicio.nome}</h4>
                      </div>
                      {exercicio.execucao && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(exercicio.execucao, '_blank')}
                          className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300 flex items-center gap-1 text-xs px-2 py-1 h-auto"
                        >
                          <Play className="w-3 h-3" />
                          Ver Execução
                        </Button>
                      )}
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