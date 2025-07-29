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

interface DiasTreino {
  titulo: string;
  frequencia: string;
  tipo: string;
  duracao: string;
  genero: 'masculino' | 'feminino';
  dias: DiaTreino[];
}

type TipoTreino = '3x' | '4x' | '5x' | '6x' | 'casa';

// Estrutura unificada com identificadores únicos
const todosOsTreinos: Record<string, DiasTreino> = {
  // TREINOS MASCULINOS
  'masc-3x': {
    titulo: 'Treino 3x por Semana',
    frequencia: 'Frequência: 3x por semana',
    tipo: 'academia',
    duracao: '45-60 minutos',
    genero: 'masculino',
    dias: [
      {
        dia: 1,
        nome: 'Treino A',
        grupo: 'Peito, Costas, Ombros, Braços, Pernas',
        exercicios: [
          { nome: 'T-Bar Row', series: 5, repeticoes: '8-12', peso: '70%', execucao: 'https://www.youtube.com/watch?v=0UBRfiO4zDs' },
          { nome: 'Supino Inclinado Smith', series: 5, repeticoes: '10-15', peso: '70%', execucao: 'https://www.youtube.com/shorts/r39cVRTjFU8' }
        ]
      }
    ]
  }
};

// Função para obter treinos filtrados por gênero
const obterTreinosPorGenero = (genero: 'masculino' | 'feminino') => {
  return Object.entries(todosOsTreinos)
    .filter(([_, treino]) => treino.genero === genero)
    .reduce((acc, [key, treino]) => {
      const keyLimpa = key.replace(/^(masc|fem)-/, '');
      acc[keyLimpa] = treino;
      return acc;
    }, {} as Record<string, DiasTreino>);
};