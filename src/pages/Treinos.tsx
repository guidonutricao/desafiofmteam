import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Toggle } from '@/components/ui/toggle';
import { Dumbbell, Home, Building, Trophy, Award, Crown, Star, Flame, Play, Info, X } from 'lucide-react';

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
  genero?: 'masculino' | 'feminino';
  dias: DiaTreino[];
}

type TipoTreino = '3x' | '4x' | '5x' | '6x' | 'casa';

const treinosDataMasculino: Record<TipoTreino, DiasTreino> = {
  '3x': {
    titulo: 'Treino 3x por Semana',
    frequencia: 'Frequência: 3x por semana',
    tipo: 'academia',
    duracao: '60 minutos',
    dias: [
      {
        dia: 1,
        nome: 'Peito + Ombro',
        grupo: 'Peito, Ombros e Tríceps',
        exercicios: [
          { nome: 'Supino Inclinado com Barra', series: 4, repeticoes: '15/12/10/8 repetições (aumentando a carga a cada série)', peso: '70%', execucao: 'https://www.youtube.com/shorts/XSiWdufUFQ8' },
          { nome: 'Supino Reto com Halteres', series: 3, repeticoes: '10 a 12 repetições', peso: '70%', execucao: 'https://www.youtube.com/shorts/hlV6f0kHmeo' },
          { nome: 'Crucifixo Máquina', series: 3, repeticoes: '12/10/8 (aumentando a carga a cada série)', peso: '60%', execucao: 'https://www.youtube.com/shorts/MENdoLpyj7c' },
          { nome: 'Crossover Polia Alta', series: 4, repeticoes: '12/10/8/6 (aumentando a carga a cada série) + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '60%', execucao: 'https://www.youtube.com/shorts/55nyV_aosNk' },
          { nome: 'Desenvolvimento com Halteres Sentado', series: 3, repeticoes: '10 a 12 repetições', peso: '60%', execucao: 'https://www.youtube.com/shorts/5I7ogOjvdnc' },
          { nome: 'Elevação Lateral com Halteres', series: 4, repeticoes: '15/12/10/8 (aumentando a carga a cada série)', peso: '50%', execucao: 'https://www.youtube.com/shorts/ot9nwSC1JnA' },
          { nome: 'Tríceps Testa na Polia com Corda', series: 3, repeticoes: '10 a 12 repetições', peso: '60%', execucao: 'https://www.youtube.com/shorts/etTuALjH3bo' },
          { nome: 'Tríceps na Polia com Barra Reta', series: 4, repeticoes: '12/10/8/6 (aumentando a carga a cada série) + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '60%', execucao: 'https://www.youtube.com/shorts/M88Bt4MMpkI' }
        ]
      },
      {
        dia: 2,
        nome: 'Costas + Trapézio e Post. Ombro',
        grupo: 'Costas, Trapézio, Posterior de Ombros e Bíceps',
        exercicios: [
          { nome: 'Puxada Aberta Barra Reta', series: 4, repeticoes: '15/12/10/8 (aumentando a carga a cada série)', peso: '70%', execucao: 'https://www.youtube.com/shorts/_2MfZAj98tk' },
          { nome: 'Puxada Neutra Triângulo', series: 3, repeticoes: '10 a 12 repetições', peso: '70%', execucao: 'https://www.youtube.com/shorts/ySLFHxmJ_Sc' },
          { nome: 'Remada Máquina (Pegada Pronada)', series: 3, repeticoes: '10 a 12 repetições', peso: '70%', execucao: 'https://www.youtube.com/watch?v=T1dEZNNfEnI' },
          { nome: 'Remada Baixa Triângulo', series: 4, repeticoes: '12/10/8/6 (aumentando a carga a cada série) + Drop set', peso: '60%', execucao: 'https://www.youtube.com/shorts/7lc8Ow4vIwA' },
          { nome: 'Crucifixo Invertido Máquina', series: 4, repeticoes: '12/10/8/6 (aumentando a carga a cada série) + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '50%', execucao: 'https://www.youtube.com/shorts/wUT3hmnzq3c' },
          { nome: 'Encolhimento com Halteres', series: 3, repeticoes: '10 a 12 repetições', peso: '60%', execucao: 'https://www.youtube.com/shorts/x9Im5d1H-Xw' },
          { nome: 'Rosca Scott com Barra W', series: 3, repeticoes: '10 a 12 repetições', peso: '60%', execucao: 'https://www.youtube.com/shorts/qhRLio6bCRo' },
          { nome: 'Rosca Direta na Polia (Barra Reta)', series: 4, repeticoes: '12/10/8/6 (aumentando a carga a cada série) + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '60%', execucao: 'https://www.youtube.com/shorts/x6JCKfdzPJE' }
        ]
      },
      {
        dia: 3,
        nome: 'Pernas e Panturrilha',
        grupo: 'Pernas Completo',
        exercicios: [
          { nome: 'Agachamento Smith', series: 4, repeticoes: '15/12/10/8 (aumentando a carga a cada série)', peso: '70%', execucao: 'https://www.youtube.com/shorts/1oipoiTpbJA' },
          { nome: 'Leg Press 45°', series: 3, repeticoes: '12/10/8 (aumentando a carga a cada série)', peso: '80%', execucao: 'https://www.youtube.com/shorts/D9WR6PoMYxs' },
          { nome: 'Cadeira Extensora', series: 4, repeticoes: '15/12/10/8 (aumentando a carga a cada série) + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '60%', execucao: 'https://www.youtube.com/shorts/PzIfB9MiiX8' },
          { nome: 'Cadeira Flexora', series: 3, repeticoes: '8 a 10 repetições', peso: '70%', execucao: 'https://www.youtube.com/shorts/T46yKiz8laY' },
          { nome: 'Mesa Flexora', series: 4, repeticoes: '15/12/10/8 (aumentando a carga a cada série) + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '70%', execucao: 'https://www.youtube.com/shorts/IXg1PQ_5gmw' },
          { nome: 'Panturrilha no Leg Press Horizontal', series: 5, repeticoes: '20/15/12/10/8 (aumentando a carga a cada série)', peso: '50%', execucao: 'https://www.youtube.com/shorts/PkXChiAQDh8' },
          { nome: 'Abdominal Infra com as Pernas Flexionadas com Elevação de Quadril', series: 3, repeticoes: 'Até a falha', peso: '0%', execucao: 'https://www.youtube.com/shorts/iZ5jYOH2ODM' },
          { nome: 'Abdominal Supra no Solo Pés Altos', series: 3, repeticoes: '10 a 12 repetições', peso: '0%', execucao: 'https://www.youtube.com/shorts/PEFjJbjnmns' }
        ]
      }
    ]
  },
  '4x': {
    titulo: 'Treino 4x por Semana',
    frequencia: 'Frequência: 4x por semana',
    tipo: 'academia',
    duracao: '60 minutos',
    dias: [
      {
        dia: 1,
        nome: 'Peito + Ombro',
        grupo: 'Peito, Ombros',
        exercicios: [
          { nome: 'Supino Inclinado com Barra', series: 4, repeticoes: '15/12/10/8 (aumentando a carga a cada série)', peso: '70%', execucao: 'https://www.youtube.com/shorts/XSiWdufUFQ8' },
          { nome: 'Crucifixo Inclinado com Halteres', series: 3, repeticoes: '10 a 12 repetições', peso: '60%', execucao: 'https://www.youtube.com/shorts/hV21YJFt6MI' },
          { nome: 'Supino Reto com Halteres', series: 4, repeticoes: '12/12/10/10 (aumentando a carga a cada série)', peso: '70%', execucao: 'https://www.youtube.com/shorts/hlV6f0kHmeo' },
          { nome: 'Crucifixo Máquina', series: 3, repeticoes: '12/10/8 (aumentando a carga a cada série)', peso: '60%', execucao: 'https://www.youtube.com/shorts/MENdoLpyj7c' },
          { nome: 'Crossover Polia Alta', series: 4, repeticoes: '12/10/8/6 (aumentando a carga a cada série) + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '60%', execucao: 'https://www.youtube.com/shorts/55nyV_aosNk' },
          { nome: 'Desenvolvimento com Halteres Sentado', series: 3, repeticoes: '10 a 12 repetições', peso: '60%', execucao: 'https://www.youtube.com/shorts/5I7ogOjvdnc' },
          { nome: 'Elevação Frontal Alternada', series: 3, repeticoes: '10 a 12 repetições', peso: '50%', execucao: 'https://www.youtube.com/shorts/GqZRmCow0rw' },
          { nome: 'Elevação Lateral com Halteres', series: 4, repeticoes: '15/12/10/8 (aumentando a carga a cada série) + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '50%', execucao: 'https://www.youtube.com/shorts/ot9nwSC1JnA' }
        ]
      },
      {
        dia: 2,
        nome: 'Costas + Trapézio e Post. Ombro',
        grupo: 'Costas, Trapézio, Posterior de Ombro',
        exercicios: [
          { nome: 'Puxada Aberta Barra Reta', series: 4, repeticoes: '15/12/10/8 (aumentando a carga a cada série)', peso: '70%', execucao: 'https://www.youtube.com/shorts/_2MfZAj98tk' },
          { nome: 'Puxada Neutra Triângulo', series: 3, repeticoes: '10 a 12 repetições', peso: '70%', execucao: 'https://www.youtube.com/shorts/ySLFHxmJ_Sc' },
          { nome: 'Remada Unilateral com Halteres no Banco Inclinado (Serrote)', series: 3, repeticoes: '8 a 10 repetições', peso: '70%', execucao: 'https://www.youtube.com/watch?v=RSBM-o4vpyc&ab_channel=AcademiaSportCenterIgrejinha' },
          { nome: 'Remada Máquina (Pegada Pronada)', series: 4, repeticoes: '12/10/8/6 (aumentando a carga a cada série)', peso: '70%', execucao: 'https://www.youtube.com/shorts/r4EmE8I74BQ' },
          { nome: 'Remada Baixa Triângulo', series: 4, repeticoes: '12/10/8/6 (aumentando a carga a cada série) + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '60%', execucao: 'https://www.youtube.com/shorts/7lc8Ow4vIwA' },
          { nome: 'Crucifixo Invertido Máquina', series: 3, repeticoes: '12/10/8 (aumentando a carga a cada série) + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '50%', execucao: 'https://www.youtube.com/shorts/wUT3hmnzq3c' },
          { nome: 'Encolhimento com Halteres', series: 3, repeticoes: '10 a 12 repetições', peso: '60%', execucao: 'https://www.youtube.com/shorts/x9Im5d1H-Xw' },
          { nome: 'Abdominal Supra no Solo Pés Altos', series: 4, repeticoes: 'Até a falha', peso: '0%', execucao: 'https://www.youtube.com/shorts/PEFjJbjnmns' }
        ]
      },
      {
        dia: 3,
        nome: 'Braços + Abdômen',
        grupo: 'Bíceps, Tríceps, Abdômen',
        exercicios: [
          { nome: 'Tríceps Testa na Polia com Corda', series: 4, repeticoes: '15/12/10/8 (aumentando a carga a cada série)', peso: '60%', execucao: 'https://www.youtube.com/shorts/etTuALjH3bo' },
          { nome: 'Tríceps Francês Unilateral na Polia', series: 3, repeticoes: '10 a 12 repetições', peso: '60%', execucao: 'https://www.youtube.com/shorts/_dtPoiFWZT4' },
          { nome: 'Tríceps na Polia com Barra Reta', series: 4, repeticoes: '12/10/8/6 (aumentando a carga a cada série) + drop set', peso: '60%', execucao: 'https://www.youtube.com/shorts/M88Bt4MMpkI' },
          { nome: 'Rosca Scott com Barra W', series: 3, repeticoes: '10 a 12 repetições', peso: '60%', execucao: 'https://www.youtube.com/shorts/qhRLio6bCRo' },
          { nome: 'Rosca Alternada com Halteres', series: 3, repeticoes: '8 a 10 repetições', peso: '60%', execucao: 'https://www.youtube.com/shorts/WUrn8iFf1js' },
          { nome: 'Rosca Direta na Polia (Barra Reta)', series: 4, repeticoes: '12/10/8/6 (aumentando a carga a cada série) + drop set', peso: '60%', execucao: 'https://www.youtube.com/shorts/x6JCKfdzPJE' },
          { nome: 'Rosca Inversa Barra W', series: 3, repeticoes: '10 a 12 repetições', peso: '50%', execucao: 'https://www.youtube.com/shorts/2izIqLamdiA' },
          { nome: 'Abdominal Prancha Isométrica', series: 4, repeticoes: '60 segundos', peso: '0%', execucao: 'https://www.youtube.com/shorts/uxPlAbWFUDs' }
        ]
      },
      {
        dia: 4,
        nome: 'Pernas e Panturrilha',
        grupo: 'Pernas Completo',
        exercicios: [
          { nome: 'Agachamento Smith', series: 4, repeticoes: '15/12/10/8 (aumentando a carga a cada série)', peso: '70%', execucao: 'https://www.youtube.com/shorts/1oipoiTpbJA' },
          { nome: 'Leg Press 45°', series: 3, repeticoes: '12/10/8 (aumentando a carga a cada série)', peso: '80%', execucao: 'https://www.youtube.com/shorts/D9WR6PoMYxs' },
          { nome: 'Cadeira Extensora', series: 4, repeticoes: '15/12/10/8 (aumentando a carga a cada série) + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '60%', execucao: 'https://www.youtube.com/shorts/PzIfB9MiiX8' },
          { nome: 'Cadeira Flexora', series: 3, repeticoes: '8 a 10 repetições', peso: '70%', execucao: 'https://www.youtube.com/shorts/T46yKiz8laY' },
          { nome: 'Mesa Flexora', series: 4, repeticoes: '15/12/10/8 (aumentando a carga a cada série) + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '70%', execucao: 'https://www.youtube.com/shorts/IXg1PQ_5gmw' },
          { nome: 'Panturrilha no Leg Press Horizontal', series: 6, repeticoes: '20/15/12/10/8/30 (aumentando a carga a cada série)', peso: '50%', execucao: 'https://www.youtube.com/shorts/PkXChiAQDh8' },
          { nome: 'Abdominal Infra com as Pernas Flexionadas com Elevação de Quadril', series: 3, repeticoes: 'Até a falha', peso: '0%', execucao: 'https://www.youtube.com/shorts/iZ5jYOH2ODM' },
          { nome: 'Abdominal Supra no Solo Pés Altos', series: 3, repeticoes: '10 a 12 repetições', peso: '0%', execucao: 'https://www.youtube.com/shorts/PEFjJbjnmns' }
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
        nome: 'Peito + Ombro',
        grupo: 'Peito, Ombros',
        exercicios: [
          { nome: 'Supino Inclinado com Barra', series: 4, repeticoes: '15/12/10/8 (aumentando a carga a cada série)', peso: '70%', execucao: 'https://www.youtube.com/shorts/XSiWdufUFQ8' },
          { nome: 'Crucifixo Inclinado com Halteres', series: 3, repeticoes: '10 a 12 repetições', peso: '60%', execucao: 'https://www.youtube.com/shorts/hV21YJFt6MI' },
          { nome: 'Supino Reto com Halteres', series: 4, repeticoes: '12/12/10/10 (aumentando a carga a cada série)', peso: '70%', execucao: 'https://www.youtube.com/shorts/hlV6f0kHmeo' },
          { nome: 'Crucifixo Máquina', series: 3, repeticoes: '12/10/8 (aumentando a carga a cada série)', peso: '60%', execucao: 'https://www.youtube.com/shorts/MENdoLpyj7c' },
          { nome: 'Crossover Polia Alta', series: 4, repeticoes: '12/10/8/6 (aumentando a carga a cada série) + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '60%', execucao: 'https://www.youtube.com/shorts/55nyV_aosNk' },
          { nome: 'Desenvolvimento com Halteres Sentado', series: 3, repeticoes: '10 a 12 repetições', peso: '60%', execucao: 'https://www.youtube.com/shorts/5I7ogOjvdnc' },
          { nome: 'Elevação Frontal Alternada', series: 3, repeticoes: '10 a 12 repetições', peso: '50%', execucao: 'https://www.youtube.com/shorts/GqZRmCow0rw' },
          { nome: 'Elevação Lateral com Halteres', series: 4, repeticoes: '15/12/10/8 (aumentando a carga a cada série) + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '50%', execucao: 'https://www.youtube.com/shorts/ot9nwSC1JnA' }
        ]
      },
      {
        dia: 2,
        nome: 'Costas + Trapézio e Post. Ombro',
        grupo: 'Costas, Trapézio, Posterior de Ombro',
        exercicios: [
          { nome: 'Puxada Aberta Barra Reta', series: 4, repeticoes: '15/12/10/8 (aumentando a carga a cada série)', peso: '70%', execucao: 'https://www.youtube.com/shorts/_2MfZAj98tk' },
          { nome: 'Puxada Neutra Triângulo', series: 3, repeticoes: '10 a 12 repetições', peso: '70%', execucao: 'https://www.youtube.com/shorts/ySLFHxmJ_Sc' },
          { nome: 'Remada Unilateral com Halteres no Banco Inclinado (Serrote)', series: 3, repeticoes: '8 a 10 repetições', peso: '70%', execucao: 'https://www.youtube.com/watch?v=RSBM-o4vpyc&ab_channel=AcademiaSportCenterIgrejinha' },
          { nome: 'Remada Máquina (Pegada Pronada)', series: 4, repeticoes: '12/10/8/6 (aumentando a carga a cada série)', peso: '70%', execucao: 'https://www.youtube.com/shorts/r4EmE8I74BQ' },
          { nome: 'Remada Baixa Triângulo', series: 4, repeticoes: '12/10/8/6 (aumentando a carga a cada série) + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '60%', execucao: 'https://www.youtube.com/shorts/7lc8Ow4vIwA' },
          { nome: 'Crucifixo Invertido Máquina', series: 3, repeticoes: '12/10/8 + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '50%', execucao: 'https://www.youtube.com/shorts/wUT3hmnzq3c' },
          { nome: 'Encolhimento com Halteres', series: 3, repeticoes: '10 a 12 repetições', peso: '60%', execucao: 'https://www.youtube.com/shorts/x9Im5d1H-Xw' },
          { nome: 'Abdominal Supra no Solo Pés Altos', series: 4, repeticoes: 'Até a falha', peso: '0%', execucao: 'https://www.youtube.com/shorts/PEFjJbjnmns' }
        ]
      },
      {
        dia: 3,
        nome: 'Braços + Abdômen',
        grupo: 'Bíceps, Tríceps, Abdômen',
        exercicios: [
          { nome: 'Tríceps Testa na Polia com Corda', series: 4, repeticoes: '15/12/10/8 (aumentando a carga a cada série)', peso: '60%', execucao: 'https://www.youtube.com/shorts/etTuALjH3bo' },
          { nome: 'Tríceps Francês Unilateral na Polia', series: 3, repeticoes: '10 a 12 repetições', peso: '60%', execucao: 'https://www.youtube.com/shorts/_dtPoiFWZT4' },
          { nome: 'Tríceps na Polia com Barra Reta', series: 4, repeticoes: '12/10/8/6 (aumentando a carga a cada série) + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '60%', execucao: 'https://www.youtube.com/shorts/M88Bt4MMpkI' },
          { nome: 'Rosca Scott com Barra W', series: 3, repeticoes: '10 a 12 repetições', peso: '60%', execucao: 'https://www.youtube.com/shorts/qhRLio6bCRo' },
          { nome: 'Rosca Alternada com Halteres', series: 3, repeticoes: '8 a 10 repetições', peso: '60%', execucao: 'https://www.youtube.com/shorts/WUrn8iFf1js' },
          { nome: 'Rosca Direta na Polia (Barra Reta)', series: 4, repeticoes: '12/10/8/6 (aumentando a carga a cada série) + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '60%', execucao: 'https://www.youtube.com/shorts/x6JCKfdzPJE' },
          { nome: 'Rosca Inversa Barra W', series: 3, repeticoes: '10 a 12 repetições', peso: '50%', execucao: 'https://www.youtube.com/shorts/2izIqLamdiA' },
          { nome: 'Abdominal Prancha Isométrica', series: 4, repeticoes: '60 segundos', peso: '0%', execucao: 'https://www.youtube.com/shorts/uxPlAbWFUDs' }
        ]
      },
      {
        dia: 4,
        nome: 'Pernas e Panturrilha',
        grupo: 'Pernas Completo',
        exercicios: [
          { nome: 'Agachamento Smith', series: 4, repeticoes: '15/12/10/8 (aumentando a carga a cada série)', peso: '70%', execucao: 'https://www.youtube.com/shorts/1oipoiTpbJA' },
          { nome: 'Leg Press 45°', series: 3, repeticoes: '12/10/8 (aumentando a carga a cada série)', peso: '80%', execucao: 'https://www.youtube.com/shorts/D9WR6PoMYxs' },
          { nome: 'Cadeira Extensora', series: 4, repeticoes: '15/12/10/8 (aumentando a carga a cada série) + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '60%', execucao: 'https://www.youtube.com/shorts/PzIfB9MiiX8' },
          { nome: 'Cadeira Flexora', series: 3, repeticoes: '8 a 10 repetições', peso: '70%', execucao: 'https://www.youtube.com/shorts/T46yKiz8laY' },
          { nome: 'Mesa Flexora', series: 4, repeticoes: '15/12/10/8 (aumentando a carga a cada série) + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '70%', execucao: 'https://www.youtube.com/shorts/IXg1PQ_5gmw' },
          { nome: 'Panturrilha no Leg Press Horizontal', series: 6, repeticoes: '20/15/12/10/8/30 (aumentando a carga a cada série)', peso: '50%', execucao: 'https://www.youtube.com/shorts/PkXChiAQDh8' },
          { nome: 'Abdominal Infra com as Pernas Flexionadas com Elevação de Quadril', series: 3, repeticoes: 'Até a falha', peso: '0%', execucao: 'https://www.youtube.com/shorts/iZ5jYOH2ODM' },
          { nome: 'Abdominal Supra no Solo Pés Altos', series: 3, repeticoes: '10 a 12 repetições', peso: '0%', execucao: 'https://www.youtube.com/shorts/PEFjJbjnmns' }
        ]
      },
      {
        dia: 5,
        nome: 'Peito + Ombro',
        grupo: 'Peito, Ombros',
        exercicios: [
          { nome: 'Supino Inclinado com Barra', series: 4, repeticoes: '15/12/10/8 (aumentando a carga a cada série)', peso: '70%', execucao: 'https://www.youtube.com/shorts/XSiWdufUFQ8' },
          { nome: 'Crucifixo Inclinado com Halteres', series: 3, repeticoes: '10 a 12 repetições', peso: '60%', execucao: 'https://www.youtube.com/shorts/hV21YJFt6MI' },
          { nome: 'Supino Reto com Halteres', series: 4, repeticoes: '12/12/10/10 (aumentando a carga a cada série)', peso: '70%', execucao: 'https://www.youtube.com/shorts/hlV6f0kHmeo' },
          { nome: 'Crucifixo Máquina', series: 3, repeticoes: '12/10/8 (aumentando a carga a cada série)', peso: '60%', execucao: 'https://www.youtube.com/shorts/MENdoLpyj7c' },
          { nome: 'Crossover Polia Alta', series: 4, repeticoes: '12/10/8/6 (aumentando a carga a cada série) + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '60%', execucao: 'https://www.youtube.com/shorts/55nyV_aosNk' },
          { nome: 'Desenvolvimento com Halteres Sentado', series: 3, repeticoes: '10 a 12 repetições', peso: '60%', execucao: 'https://www.youtube.com/shorts/5I7ogOjvdnc' },
          { nome: 'Elevação Frontal Alternada', series: 3, repeticoes: '10 a 12 repetições', peso: '50%', execucao: 'https://www.youtube.com/shorts/xvT2oA9Bwsc' },
          { nome: 'Elevação Lateral com Halteres', series: 4, repeticoes: '15/12/10/8 (aumentando a carga a cada série) + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '50%', execucao: 'https://www.youtube.com/shorts/ot9nwSC1JnA' }
        ]
      }
    ]
  },
  '6x': {
    titulo: 'Treino 6x por Semana',
    frequencia: 'Frequência: 6x por semana',
    tipo: 'academia',
    duracao: '60-75 minutos',
    dias: [
      {
        dia: 1,
        nome: 'Peito + Ombro',
        grupo: 'Peito, Ombros',
        exercicios: [
          { nome: 'Supino Inclinado com Barra', series: 4, repeticoes: '15/12/10/8 (aumentando a carga a cada série)', peso: '70%', execucao: 'https://www.youtube.com/shorts/XSiWdufUFQ8' },
          { nome: 'Crucifixo Inclinado com Halteres', series: 3, repeticoes: '10 a 12 repetições', peso: '60%', execucao: 'https://www.youtube.com/shorts/hV21YJFt6MI' },
          { nome: 'Supino Reto com Halteres', series: 4, repeticoes: '12/12/10/10 (aumentando a carga a cada série)', peso: '70%', execucao: 'https://www.youtube.com/shorts/hlV6f0kHmeo' },
          { nome: 'Crucifixo Máquina', series: 3, repeticoes: '12/10/8 (aumentando a carga a cada série)', peso: '60%', execucao: 'https://www.youtube.com/shorts/MENdoLpyj7c' },
          { nome: 'Crossover Polia Alta', series: 4, repeticoes: '12/10/8/6 (aumentando a carga a cada série) + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '60%', execucao: 'https://www.youtube.com/shorts/55nyV_aosNk' },
          { nome: 'Desenvolvimento com Halteres Sentado', series: 3, repeticoes: '10 a 12 repetições', peso: '60%', execucao: 'https://www.youtube.com/shorts/5I7ogOjvdnc' },
          { nome: 'Elevação Frontal Alternada', series: 3, repeticoes: '10 a 12 repetições', peso: '50%', execucao: 'https://www.youtube.com/shorts/GqZRmCow0rw' },
          { nome: 'Elevação Lateral com Halteres', series: 4, repeticoes: '15/12/10/8 (aumentando a carga a cada série) + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '50%', execucao: 'https://www.youtube.com/shorts/ot9nwSC1JnA' }
        ]
      },
      {
        dia: 2,
        nome: 'Costas + Trapézio e Post. Ombro',
        grupo: 'Costas, Trapézio, Posterior de Ombro',
        exercicios: [
          { nome: 'Puxada Aberta Barra Reta', series: 4, repeticoes: '15/12/10/8 (aumentando a carga a cada série)', peso: '70%', execucao: 'https://www.youtube.com/shorts/_2MfZAj98tk' },
          { nome: 'Puxada Neutra Triângulo', series: 3, repeticoes: '10 a 12 repetições', peso: '70%', execucao: 'https://www.youtube.com/shorts/ySLFHxmJ_Sc' },
          { nome: 'Remada Unilateral com Halteres no Banco Inclinado (Serrote)', series: 3, repeticoes: '8 a 10 repetições', peso: '70%', execucao: 'https://www.youtube.com/watch?v=RSBM-o4vpyc&ab_channel=AcademiaSportCenterIgrejinha' },
          { nome: 'Remada Máquina (Pegada Pronada)', series: 4, repeticoes: '12/10/8/6 (aumentando a carga a cada série)', peso: '70%', execucao: 'https://www.youtube.com/shorts/r4EmE8I74BQ' },
          { nome: 'Remada Baixa Triângulo', series: 4, repeticoes: '12/10/8/6 (aumentando a carga a cada série) + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '60%', execucao: 'https://www.youtube.com/shorts/7lc8Ow4vIwA' },
          { nome: 'Crucifixo Invertido Máquina', series: 3, repeticoes: '12/10/8 + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '50%', execucao: 'https://www.youtube.com/shorts/wUT3hmnzq3c' },
          { nome: 'Encolhimento com Halteres', series: 3, repeticoes: '10 a 12 repetições', peso: '60%', execucao: 'https://www.youtube.com/shorts/x9Im5d1H-Xw' },
          { nome: 'Abdominal Supra no Solo Pés Altos', series: 4, repeticoes: 'Até a falha', peso: '0%', execucao: 'https://www.youtube.com/shorts/PEFjJbjnmns' }
        ]
      },
      {
        dia: 3,
        nome: 'Braços + Abdômen',
        grupo: 'Bíceps, Tríceps, Abdômen',
        exercicios: [
          { nome: 'Tríceps Testa na Polia com Corda', series: 4, repeticoes: '15/12/10/8 (aumentando a carga a cada série)', peso: '60%', execucao: 'https://www.youtube.com/shorts/etTuALjH3bo' },
          { nome: 'Tríceps Francês Unilateral na Polia', series: 3, repeticoes: '10 a 12 repetições', peso: '60%', execucao: 'https://www.youtube.com/shorts/_dtPoiFWZT4' },
          { nome: 'Tríceps na Polia com Barra Reta', series: 4, repeticoes: '12/10/8/6 (aumentando a carga a cada série) + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '60%', execucao: 'https://www.youtube.com/shorts/M88Bt4MMpkI' },
          { nome: 'Rosca Scott com Barra W', series: 3, repeticoes: '10 a 12 repetições', peso: '60%', execucao: 'https://www.youtube.com/shorts/qhRLio6bCRo' },
          { nome: 'Rosca Alternada com Halteres', series: 3, repeticoes: '8 a 10 repetições', peso: '60%', execucao: 'https://www.youtube.com/shorts/WUrn8iFf1js' },
          { nome: 'Rosca Direta na Polia (Barra Reta)', series: 4, repeticoes: '12/10/8/6 (aumentando a carga a cada série) + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '60%', execucao: 'https://www.youtube.com/shorts/x6JCKfdzPJE' },
          { nome: 'Rosca Inversa Barra W', series: 3, repeticoes: '10 a 12 repetições', peso: '50%', execucao: 'https://www.youtube.com/shorts/2izIqLamdiA' },
          { nome: 'Abdominal Prancha Isométrica', series: 4, repeticoes: '60 segundos', peso: '0%', execucao: 'https://www.youtube.com/shorts/uxPlAbWFUDs' }
        ]
      },
      {
        dia: 4,
        nome: 'Pernas e Panturrilha',
        grupo: 'Pernas Completo',
        exercicios: [
          { nome: 'Agachamento Smith', series: 4, repeticoes: '15/12/10/8 (aumentando a carga a cada série)', peso: '70%', execucao: 'https://www.youtube.com/shorts/1oipoiTpbJA' },
          { nome: 'Leg Press 45°', series: 3, repeticoes: '12/10/8 (aumentando a carga a cada série)', peso: '80%', execucao: 'https://www.youtube.com/shorts/D9WR6PoMYxs' },
          { nome: 'Cadeira Extensora', series: 4, repeticoes: '15/12/10/8 (aumentando a carga a cada série) + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '60%', execucao: 'https://www.youtube.com/shorts/PzIfB9MiiX8' },
          { nome: 'Cadeira Flexora', series: 3, repeticoes: '8 a 10 repetições', peso: '70%', execucao: 'https://www.youtube.com/shorts/T46yKiz8laY' },
          { nome: 'Mesa Flexora', series: 4, repeticoes: '15/12/10/8 (aumentando a carga a cada série) + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '70%', execucao: 'https://www.youtube.com/shorts/IXg1PQ_5gmw' },
          { nome: 'Panturrilha no Leg Press Horizontal', series: 6, repeticoes: '20/15/12/10/8/30 (aumentando a carga a cada série)', peso: '50%', execucao: 'https://www.youtube.com/shorts/PkXChiAQDh8' },
          { nome: 'Abdominal Infra com as Pernas Flexionadas com Elevação de Quadril', series: 3, repeticoes: 'Até a falha', peso: '0%', execucao: 'https://www.youtube.com/shorts/iZ5jYOH2ODM' },
          { nome: 'Abdominal Supra no Solo Pés Altos', series: 3, repeticoes: '10 a 12 repetições', peso: '0%', execucao: 'https://www.youtube.com/shorts/PEFjJbjnmns' }
        ]
      },
      {
        dia: 5,
        nome: 'Peito + Ombro',
        grupo: 'Peito, Ombros',
        exercicios: [
          { nome: 'Supino Inclinado com Barra', series: 4, repeticoes: '15/12/10/8 (aumentando a carga a cada série)', peso: '70%', execucao: 'https://www.youtube.com/shorts/XSiWdufUFQ8' },
          { nome: 'Crucifixo Inclinado com Halteres', series: 3, repeticoes: '10 a 12 repetições', peso: '60%', execucao: 'https://www.youtube.com/shorts/hV21YJFt6MI' },
          { nome: 'Supino Reto com Halteres', series: 4, repeticoes: '12/12/10/10 (aumentando a carga a cada série)', peso: '70%', execucao: 'https://www.youtube.com/shorts/hlV6f0kHmeo' },
          { nome: 'Crucifixo Máquina', series: 3, repeticoes: '12/10/8 (aumentando a carga a cada série)', peso: '60%', execucao: 'https://www.youtube.com/shorts/MENdoLpyj7c' },
          { nome: 'Crossover Polia Alta', series: 4, repeticoes: '12/10/8/6 (aumentando a carga a cada série) + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '60%', execucao: 'https://www.youtube.com/shorts/55nyV_aosNk' },
          { nome: 'Desenvolvimento com Halteres Sentado', series: 3, repeticoes: '10 a 12 repetições', peso: '60%', execucao: 'https://www.youtube.com/shorts/5I7ogOjvdnc' },
          { nome: 'Elevação Frontal Alternada', series: 3, repeticoes: '10 a 12 repetições', peso: '50%', execucao: 'https://www.youtube.com/shorts/xvT2oA9Bwsc' },
          { nome: 'Elevação Lateral com Halteres', series: 4, repeticoes: '15/12/10/8 (aumentando a carga a cada série) + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '50%', execucao: 'https://www.youtube.com/shorts/ot9nwSC1JnA' }
        ]
      },
      {
        dia: 6,
        nome: 'Costas + Trapézio e Ombro Posterior',
        grupo: 'Costas, Trapézio, Posterior de Ombro',
        exercicios: [
          { nome: 'Puxada Aberta Barra Reta', series: 4, repeticoes: '15/12/10/8 (aumentando a carga a cada série)', peso: '70%', execucao: 'https://www.youtube.com/shorts/_2MfZAj98tk' },
          { nome: 'Puxada Neutra Triângulo', series: 3, repeticoes: '10 a 12 repetições', peso: '70%', execucao: 'https://www.youtube.com/shorts/ySLFHxmJ_Sc' },
          { nome: 'Remada Unilateral com Halteres no Banco Inclinado (Serrote)', series: 3, repeticoes: '8 a 10 repetições', peso: '70%', execucao: 'https://www.youtube.com/watch?v=RSBM-o4vpyc&ab_channel=AcademiaSportCenterIgrejinha' },
          { nome: 'Remada Máquina (Pegada Pronada)', series: 4, repeticoes: '12/10/8/6 (aumentando a carga a cada série)', peso: '70%', execucao: 'https://www.youtube.com/shorts/r4EmE8I74BQ' },
          { nome: 'Remada Baixa Triângulo', series: 4, repeticoes: '12/10/8/6 (aumentando a carga a cada série) + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '60%', execucao: 'https://www.youtube.com/shorts/7lc8Ow4vIwA' },
          { nome: 'Crucifixo Invertido Máquina', series: 3, repeticoes: '12/10/8 + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '50%', execucao: 'https://www.youtube.com/shorts/wUT3hmnzq3c' },
          { nome: 'Encolhimento com Halteres', series: 3, repeticoes: '10 a 12 repetições', peso: '60%', execucao: 'https://www.youtube.com/shorts/x9Im5d1H-Xw' },
          { nome: 'Abdominal Supra no Solo Pés Altos', series: 4, repeticoes: 'Até a falha', peso: '0%', execucao: 'https://www.youtube.com/shorts/PEFjJbjnmns' }
        ]
      }
    ]
  },
  'casa': {
    titulo: 'Treino em Casa',
    frequencia: 'Frequência: 3 a 6x por semana, Ao terminar o treino 3 siga a sequência e retorne para o 1',
    tipo: 'casa',
    duracao: '30-45 minutos',
    dias: [
      {
        dia: 1,
        nome: 'Dia 1',
        grupo: 'Corpo Inteiro + Cardio',
        exercicios: [
          { nome: 'Polichinelo', series: 4, repeticoes: '45 segundos', peso: '0%', execucao: 'https://www.youtube.com/shorts/guvPySViG7o' },
          { nome: 'Flexão de Braços', series: 4, repeticoes: '12 a 15 repetições reps', peso: '0%', execucao: 'https://www.youtube.com/shorts/qqECekG4jMo' },
          { nome: 'Burpee', series: 4, repeticoes: '45 segundos', peso: '0%', execucao: 'https://www.youtube.com/shorts/EiIWIEaIZe0' },
          { nome: 'Abdominal Canivete', series: 4, repeticoes: '12 a 15 repetições reps', peso: '0%', execucao: 'https://www.youtube.com/shorts/51Ryd2Ds2CI' },
          { nome: 'Abdominal Bicicleta', series: 4, repeticoes: '45 segundos', peso: '0%', execucao: 'https://www.youtube.com/shorts/OnQNhK0EkgK' },
          { nome: 'Prancha Isométrica', series: 4, repeticoes: '60 segundos', peso: '0%', execucao: 'https://www.youtube.com/shorts/uxPlAbWFUDs' }
        ]
      },
      {
        dia: 2,
        nome: 'Dia 2',
        grupo: 'Corpo Inteiro + Cardio',
        exercicios: [
          { nome: 'Burpee', series: 4, repeticoes: 'até a exaustão', peso: '0%', execucao: 'https://www.youtube.com/shorts/EiIWIEaIZe0' },
          { nome: 'Tríceps Mergulho na Cadeira', series: 4, repeticoes: '12 a 15 repetições reps', peso: '0%', execucao: 'https://www.youtube.com/shorts/z_T5hn0fqCE' },
          { nome: 'Escalador', series: 4, repeticoes: '45 segundos', peso: '0%', execucao: 'https://www.youtube.com/shorts/fDo4sulRb04' },
          { nome: 'Corrida Estacionária', series: 4, repeticoes: '45 segundos', peso: '0%', execucao: 'https://www.youtube.com/shorts/Wqg6rBCjVo0' },
          { nome: 'Abdominal Supra no Solo Pés Altos', series: 4, repeticoes: '12 a 15 repetições reps', peso: '0%', execucao: 'https://www.youtube.com/shorts/PEFjJbjnmns' },
          { nome: 'Prancha Isométrica', series: 4, repeticoes: '60 segundos', peso: '0%', execucao: 'https://www.youtube.com/shorts/uxPlAbWFUDs' }
        ]
      },
      {
        dia: 3,
        nome: 'Dia 3',
        grupo: 'Corpo Inteiro + Cardio',
        exercicios: [
          { nome: 'Polichinelo Frontal', series: 4, repeticoes: '45 segundos', peso: '0%', execucao: 'https://www.youtube.com/shorts/-Rks8TC7YD8' },
          { nome: 'Flexão de Braços', series: 4, repeticoes: '12 a 15 repetições reps', peso: '0%', execucao: 'https://www.youtube.com/shorts/qqECekG4jMo' },
          { nome: 'Lombar Solo Dinâmico', series: 4, repeticoes: '12 a 15 repetições reps', peso: '0%', execucao: 'https://www.youtube.com/shorts/RaHn_82tANI' },
          { nome: 'Escalador', series: 4, repeticoes: '45 segundos', peso: '0%', execucao: 'https://www.youtube.com/shorts/fDo4sulRb04' },
          { nome: 'Corrida Estacionária', series: 4, repeticoes: '45 segundos', peso: '0%', execucao: 'https://www.youtube.com/shorts/Wqg6rBCjVo0' },
          { nome: 'Prancha Isométrica', series: 4, repeticoes: '60 segundos', peso: '0%', execucao: 'https://www.youtube.com/shorts/uxPlAbWFUDs' }
        ]
      }
    ]
  }
};

// Treinos femininos personalizados com foco em glúteos, pernas e tonificação
const treinosDataFeminino: Record<TipoTreino, DiasTreino> = {
  '3x': {
    titulo: 'Treino 3x por Semana',
    frequencia: 'Frequência: 3x por semana',
    tipo: 'academia',
    duracao: '60 minutos',
    genero: 'feminino',
    dias: [
      {
        dia: 1,
        nome: 'Quadríceps + estímulo Isquiotibial',
        grupo: 'Quadríceps, Glúteos, Panturrilha, Abdômen',
        exercicios: [
          { nome: 'Agachamento Smith', series: 4, repeticoes: '15/12/10/8 (aumentando a carga a cada série)', peso: '70%', execucao: 'https://www.youtube.com/shorts/1oipoiTpbJA' },
          { nome: 'Leg Press 45°', series: 4, repeticoes: '12/10/8/6 (aumentando a carga a cada série)', peso: '80%', execucao: 'https://www.youtube.com/shorts/D9WR6PoMYxs' },
          { nome: 'Cadeira Extensora', series: 4, repeticoes: '12/10/8/6 (aumentando a carga a cada série) + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '60%', execucao: 'https://www.youtube.com/shorts/PzIfB9MiiX8' },
          { nome: 'Elevação de Quadril na Máquina', series: 4, repeticoes: '12/12/10/10 (aumentando a carga a cada série)', peso: '60%', execucao: 'https://www.youtube.com/shorts/Nuoo1XgRtGY' },
          { nome: 'Glúteos Coice na Polia Pernas Estendidas', series: 3, repeticoes: '10 a 12 repetições', peso: '60%', execucao: 'https://youtube.com/shorts/ZzjTOb19hPw' },
          { nome: 'Panturrilha no Leg Press Horizontal', series: 4, repeticoes: '20/15/12/10 (aumentando a carga a cada série)', peso: '50%', execucao: 'https://www.youtube.com/shorts/PkXChiAQDh8' },
          { nome: 'Abdominal Prancha Isométrica', series: 3, repeticoes: '60 segundos', peso: '0%', execucao: 'https://www.youtube.com/shorts/uxPlAbWFUDs' }
        ]
      },
      {
        dia: 2,
        nome: 'Membros superiores e Abdômen',
        grupo: 'Costas, Peito, Ombros, Braços, Abdômen',
        exercicios: [
          { nome: 'Puxada Aberta Barra Reta', series: 3, repeticoes: '12/10/8 (aumentando a carga a cada série)', peso: '70%', execucao: 'https://www.youtube.com/shorts/_2MfZAj98tk' },
          { nome: 'Supino Inclinado com Halteres', series: 3, repeticoes: '10 a 12 repetições', peso: '70%', execucao: 'https://www.youtube.com/shorts/ZaNyRjpoki8' },
          { nome: 'Remada Máquina (Pegada Neutra)', series: 3, repeticoes: '12/10/8 (aumentando a carga a cada série)', peso: '70%', execucao: 'https://www.youtube.com/shorts/r4EmE8I74BQ' },
          { nome: 'Elevação Lateral com Halteres', series: 4, repeticoes: '8 a 10 repetições + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '50%', execucao: 'https://www.youtube.com/shorts/ot9nwSC1JnA' },
          { nome: 'Rosca Direta na Polia (Barra Reta)', series: 4, repeticoes: '8 a 10 repetições + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '60%', execucao: 'https://www.youtube.com/shorts/x6JCKfdzPJE' },
          { nome: 'Tríceps Francês Unilateral na Polia', series: 3, repeticoes: '8 a 10 repetições', peso: '60%', execucao: 'https://www.youtube.com/shorts/_dtPoiFWZT4' },
          { nome: 'Tríceps na Polia com Barra Reta', series: 3, repeticoes: '10/8/6 + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '60%', execucao: 'https://www.youtube.com/shorts/M88Bt4MMpkI' },
          { nome: 'Abdominal Máquina', series: 3, repeticoes: '10 a 12 repetições', peso: '30%', execucao: 'https://www.youtube.com/shorts/uAe1Uj3Y05k' },
          { nome: 'Abdominal Infra com as Pernas Flexionadas com Elevação de Quadril', series: 3, repeticoes: 'Até a falha', peso: '0%', execucao: 'https://www.youtube.com/shorts/iZ5jYOH2ODM' }
        ]
      },
      {
        dia: 3,
        nome: 'Isquiotibial + Glúteo',
        grupo: 'Isquiotibiais, Glúteos, Panturrilha, Abdômen',
        exercicios: [
          { nome: 'Agachamento Sumô no Step com Halteres', series: 4, repeticoes: '12/12/10/10 (aumentando a carga a cada série)', peso: '60%', execucao: 'https://www.youtube.com/shorts/oFx42iwZKgo' },
          { nome: 'Stiff com Halteres', series: 4, repeticoes: '10/10/8/8 (aumentando a carga a cada série)', peso: '70%', execucao: 'https://www.youtube.com/shorts/SRVkwwXk7I4' },
          { nome: 'Elevação de Quadril na Máquina', series: 3, repeticoes: '12/10/8 (aumentando a carga a cada série)', peso: '60%', execucao: 'https://www.youtube.com/shorts/Nuoo1XgRtGY' },
          { nome: 'Abdução de Quadril Máquina com Corpo a Frente', series: 3, repeticoes: '12/10/8 (aumentando a carga a cada série) + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '60%', execucao: 'https://www.youtube.com/shorts/cZilgAG9Vx8' },
          { nome: 'Mesa Flexora', series: 4, repeticoes: '12/10/8/6 (aumentando a carga a cada série) + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '70%', execucao: 'https://www.youtube.com/shorts/IXg1PQ_5gmw' },
          { nome: 'Panturrilha no Smith com Step', series: 4, repeticoes: '10 a 12 repetições', peso: '50%', execucao: 'https://www.youtube.com/shorts/cETqVlftyJs' },
          { nome: 'Abdominal Prancha Isométrica', series: 3, repeticoes: '60 segundos', peso: '0%', execucao: 'https://www.youtube.com/shorts/uxPlAbWFUDs' }
        ]
      }
    ]
  },
  '4x': {
    titulo: 'Treino 4x por Semana',
    frequencia: 'Frequência: 4x por semana',
    tipo: 'academia',
    duracao: '60 minutos',
    genero: 'feminino',
    dias: [
      {
        dia: 1,
        nome: 'Quadríceps + estímulo Isquiotibial',
        grupo: 'Quadríceps, Glúteos, Panturrilha, Abdômen',
        exercicios: [
          { nome: 'Agachamento Smith', series: 4, repeticoes: '15/12/10/8 (aumentando a carga a cada série)', peso: '70%', execucao: 'https://www.youtube.com/shorts/1oipoiTpbJA' },
          { nome: 'Leg Press 45°', series: 4, repeticoes: '12/10/8/6 (aumentando a carga a cada série)', peso: '80%', execucao: 'https://www.youtube.com/shorts/D9WR6PoMYxs' },
          { nome: 'Cadeira Extensora', series: 4, repeticoes: '12/10/8/6 (aumentando a carga a cada série) + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '60%', execucao: 'https://www.youtube.com/shorts/PzIfB9MiiX8' },
          { nome: 'Elevação de Quadril na Máquina', series: 4, repeticoes: '12/12/10/10 (aumentando a carga a cada série)', peso: '60%', execucao: 'https://www.youtube.com/shorts/Nuoo1XgRtGY' },
          { nome: 'Glúteos Coice na Polia Pernas Estendidas', series: 3, repeticoes: '10 a 12 repetições', peso: '60%', execucao: 'https://youtube.com/shorts/ZzjTOb19hPw' },
          { nome: 'Panturrilha no Leg Press Horizontal', series: 4, repeticoes: '20/15/12/10 (aumentando a carga a cada série)', peso: '50%', execucao: 'https://www.youtube.com/shorts/PkXChiAQDh8' },
          { nome: 'Abdominal Prancha Isométrica', series: 3, repeticoes: '60 segundos', peso: '0%', execucao: 'https://www.youtube.com/shorts/uxPlAbWFUDs' }
        ]
      },
      {
        dia: 2,
        nome: 'Membros superiores e Abdômen',
        grupo: 'Costas, Peito, Ombros, Braços, Abdômen',
        exercicios: [
          { nome: 'Puxada Aberta Barra Reta', series: 3, repeticoes: '12/10/8 (aumentando a carga a cada série)', peso: '70%', execucao: 'https://www.youtube.com/shorts/_2MfZAj98tk' },
          { nome: 'Supino Inclinado com Halteres', series: 3, repeticoes: '10 a 12 repetições', peso: '70%', execucao: 'https://www.youtube.com/shorts/ZaNyRjpoki8' },
          { nome: 'Remada Máquina (Pegada Neutra)', series: 3, repeticoes: '12/10/8 (aumentando a carga a cada série)', peso: '70%', execucao: 'https://www.youtube.com/shorts/r4EmE8I74BQ' },
          { nome: 'Elevação Lateral com Halteres', series: 4, repeticoes: '8 a 10 repetições + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '50%', execucao: 'https://www.youtube.com/shorts/ot9nwSC1JnA' },
          { nome: 'Rosca Direta na Polia (Barra Reta)', series: 4, repeticoes: '8 a 10 repetições + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '60%', execucao: 'https://www.youtube.com/shorts/x6JCKfdzPJE' },
          { nome: 'Tríceps Francês Unilateral na Polia', series: 3, repeticoes: '8 a 10 repetições', peso: '60%', execucao: 'https://www.youtube.com/shorts/_dtPoiFWZT4' },
          { nome: 'Tríceps na Polia com Barra Reta', series: 3, repeticoes: '10/8/6 + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '60%', execucao: 'https://www.youtube.com/shorts/M88Bt4MMpkI' },
          { nome: 'Abdominal Máquina', series: 3, repeticoes: '10 a 12 repetições', peso: '30%', execucao: 'https://www.youtube.com/shorts/uAe1Uj3Y05k' },
          { nome: 'Abdominal Infra com as Pernas Flexionadas com Elevação de Quadril', series: 3, repeticoes: 'Até a falha', peso: '0%', execucao: 'https://www.youtube.com/shorts/iZ5jYOH2ODM' }
        ]
      },
      {
        dia: 3,
        nome: 'Isquiotibial + Glúteo',
        grupo: 'Isquiotibiais, Glúteos, Panturrilha, Abdômen',
        exercicios: [
          { nome: 'Agachamento Sumô no Step com Halteres', series: 4, repeticoes: '12/12/10/10 (aumentando a carga a cada série)', peso: '60%', execucao: 'https://www.youtube.com/shorts/oFx42iwZKgo' },
          { nome: 'Stiff com Halteres', series: 4, repeticoes: '10/10/8/8 (aumentando a carga a cada série)', peso: '70%', execucao: 'https://www.youtube.com/shorts/SRVkwwXk7I4' },
          { nome: 'Elevação de Quadril na Máquina', series: 3, repeticoes: '12/10/8 (aumentando a carga a cada série)', peso: '60%', execucao: 'https://www.youtube.com/shorts/Nuoo1XgRtGY' },
          { nome: 'Abdução de Quadril Máquina com Corpo a Frente', series: 3, repeticoes: '12/10/8 (aumentando a carga a cada série)+ Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '60%', execucao: 'https://www.youtube.com/shorts/cZilgAG9Vx8' },
          { nome: 'Mesa Flexora', series: 4, repeticoes: '12/10/8/6 (aumentando a carga a cada série) + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '70%', execucao: 'https://www.youtube.com/shorts/IXg1PQ_5gmw' },
          { nome: 'Panturrilha no Smith com Step', series: 4, repeticoes: '10 a 12 repetições', peso: '50%', execucao: 'https://www.youtube.com/shorts/cETqVlftyJs' },
          { nome: 'Abdominal Prancha Isométrica', series: 3, repeticoes: '60 segundos', peso: '0%', execucao: 'https://www.youtube.com/shorts/uxPlAbWFUDs' }
        ]
      },
      {
        dia: 4,
        nome: 'Membros superiores e Abdômen',
        grupo: 'Peito, Costas, Ombros, Braços, Abdômen',
        exercicios: [
          { nome: 'Peck Deck', series: 3, repeticoes: '10 a 12 repetições', peso: '60%', execucao: 'https://www.youtube.com/shorts/bA5KbR0xltE' },
          { nome: 'Puxada Neutra Triângulo', series: 3, repeticoes: '12/10/8 (aumentando a carga a cada série)', peso: '70%', execucao: 'https://www.youtube.com/shorts/ySLFHxmJ_Sc' },
          { nome: 'Remada Máquina (Pegada Pronada)', series: 3, repeticoes: '10/8/6 (aumentando a carga a cada série)', peso: '70%', execucao: 'https://www.youtube.com/shorts/r4EmE8I74BQ' },
          { nome: 'Crucifixo Inverso Unilateral na Polia', series: 3, repeticoes: '8 a 10 repetições', peso: '50%', execucao: 'https://www.youtube.com/shorts/rJyUiN6Gkdg' },
          { nome: 'Rosca Direta Alternada Sentado com Halteres', series: 4, repeticoes: '8 a 10 repetições', peso: '60%', execucao: 'https://www.youtube.com/shorts/4onwQ6kLrC4' },
          { nome: 'Tríceps Coice Unilateral na Polia Baixa', series: 3, repeticoes: '8 a 10 repetições', peso: '60%', execucao: 'https://www.youtube.com/shorts/Yll1IwBByRo' },
          { nome: 'Tríceps na Polia com Corda', series: 3, repeticoes: '10/8/6 + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '60%', execucao: 'https://www.youtube.com/shorts/-QGC1cL6ETE' },
          { nome: 'Abdominal Supra no Solo Pés Altos', series: 3, repeticoes: '12 a 15 repetições com carga', peso: '30%', execucao: 'https://www.youtube.com/shorts/PEFjJbjnmns' },
          { nome: 'Abdominal Infra com as Pernas Flexionadas', series: 3, repeticoes: 'Até a falha', peso: '0%', execucao: 'https://www.youtube.com/watch?v=6LtsNXhhQDY&ab_channel=BioformaAcademia' }
        ]
      }
    ]
  },
  '5x': {
    titulo: 'Treino 5x por Semana',
    frequencia: 'Frequência: 5x por semana',
    tipo: 'academia',
    duracao: '60-75 minutos',
    genero: 'feminino',
    dias: [
      {
        dia: 1,
        nome: 'Quadríceps + estímulo Isquiotibial',
        grupo: 'Quadríceps, Glúteos, Panturrilha, Abdômen',
        exercicios: [
          { nome: 'Agachamento Smith', series: 4, repeticoes: '15/12/10/8 (aumentando a carga a cada série)', peso: '70%', execucao: 'https://www.youtube.com/shorts/1oipoiTpbJA' },
          { nome: 'Leg Press 45°', series: 4, repeticoes: '12/10/8/6 (aumentando a carga a cada série)', peso: '80%', execucao: 'https://www.youtube.com/shorts/D9WR6PoMYxs' },
          { nome: 'Cadeira Extensora', series: 4, repeticoes: '12/10/8/6 (aumentando a carga a cada série) + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '60%', execucao: 'https://www.youtube.com/shorts/PzIfB9MiiX8' },
          { nome: 'Elevação de Quadril na Máquina', series: 4, repeticoes: '12/12/10/10 (aumentando a carga a cada série)', peso: '60%', execucao: 'https://www.youtube.com/shorts/Nuoo1XgRtGY' },
          { nome: 'Glúteos Coice na Polia Pernas Estendidas', series: 3, repeticoes: '10 a 12 repetições', peso: '60%', execucao: 'https://youtube.com/shorts/ZzjTOb19hPw' },
          { nome: 'Panturrilha no Leg Press Horizontal', series: 4, repeticoes: '20/15/12/10 (aumentando a carga a cada série)', peso: '50%', execucao: 'https://www.youtube.com/shorts/PkXChiAQDh8' },
          { nome: 'Abdominal Prancha Isométrica', series: 3, repeticoes: '60 segundos', peso: '0%', execucao: 'https://www.youtube.com/shorts/uxPlAbWFUDs' }
        ]
      },
      {
        dia: 2,
        nome: 'Membros superiores e Abdômen',
        grupo: 'Costas, Peito, Ombros, Braços, Abdômen',
        exercicios: [
          { nome: 'Puxada Aberta Barra Reta', series: 3, repeticoes: '12/10/8 (aumentando a carga a cada série)', peso: '70%', execucao: 'https://www.youtube.com/shorts/_2MfZAj98tk' },
          { nome: 'Supino Inclinado com Halteres', series: 3, repeticoes: '10 a 12 repetições', peso: '70%', execucao: 'https://www.youtube.com/shorts/ZaNyRjpoki8' },
          { nome: 'Remada Máquina (Pegada Neutra)', series: 3, repeticoes: '12/10/8 (aumentando a carga a cada série)', peso: '70%', execucao: 'https://www.youtube.com/shorts/r4EmE8I74BQ' },
          { nome: 'Elevação Lateral com Halteres', series: 4, repeticoes: '8 a 10 repetições + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '50%', execucao: 'https://www.youtube.com/shorts/ot9nwSC1JnA' },
          { nome: 'Rosca Direta na Polia (Barra Reta)', series: 4, repeticoes: '8 a 10 repetições + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '60%', execucao: 'https://www.youtube.com/shorts/x6JCKfdzPJE' },
          { nome: 'Tríceps Francês Unilateral na Polia', series: 3, repeticoes: '8 a 10 repetições', peso: '60%', execucao: 'https://www.youtube.com/shorts/_dtPoiFWZT4' },
          { nome: 'Tríceps na Polia com Barra Reta', series: 3, repeticoes: '10/8/6 + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '60%', execucao: 'https://www.youtube.com/shorts/M88Bt4MMpkI' },
          { nome: 'Abdominal Máquina', series: 3, repeticoes: '10 a 12 repetições', peso: '30%', execucao: 'https://www.youtube.com/shorts/uAe1Uj3Y05k' },
          { nome: 'Abdominal Infra com as Pernas Flexionadas com Elevação de Quadril', series: 3, repeticoes: 'Até a falha', peso: '0%', execucao: 'https://www.youtube.com/shorts/iZ5jYOH2ODM' }
        ]
      },
      {
        dia: 3,
        nome: 'Isquiotibial + Glúteo',
        grupo: 'Isquiotibiais, Glúteos, Panturrilha, Abdômen',
        exercicios: [
          { nome: 'Agachamento Sumô no Step com Halteres', series: 4, repeticoes: '12/12/10/10 (aumentando a carga a cada série)', peso: '60%', execucao: 'https://www.youtube.com/shorts/oFx42iwZKgo' },
          { nome: 'Stiff com Halteres', series: 4, repeticoes: '10/10/8/8 (aumentando a carga a cada série)', peso: '70%', execucao: 'https://www.youtube.com/shorts/SRVkwwXk7I4' },
          { nome: 'Elevação de Quadril na Máquina', series: 3, repeticoes: '12/10/8 (aumentando a carga a cada série)', peso: '60%', execucao: 'https://www.youtube.com/shorts/Nuoo1XgRtGY' },
          { nome: 'Abdução de Quadril Máquina com Corpo a Frente', series: 3, repeticoes: '12/10/8 + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '60%', execucao: 'https://www.youtube.com/shorts/cZilgAG9Vx8' },
          { nome: 'Mesa Flexora', series: 4, repeticoes: '12/10/8/6 (aumentando a carga a cada série) + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '70%', execucao: 'https://www.youtube.com/shorts/IXg1PQ_5gmw' },
          { nome: 'Panturrilha no Smith com Step', series: 4, repeticoes: '10 a 12 repetições', peso: '50%', execucao: 'https://www.youtube.com/shorts/cETqVlftyJs' },
          { nome: 'Abdominal Prancha Isométrica', series: 3, repeticoes: '60 segundos', peso: '0%', execucao: 'https://www.youtube.com/shorts/uxPlAbWFUDs' }
        ]
      },
      {
        dia: 4,
        nome: 'Membros superiores e Abdômen',
        grupo: 'Peito, Costas, Ombros, Braços, Abdômen',
        exercicios: [
          { nome: 'Peck Deck', series: 3, repeticoes: '10 a 12 repetições', peso: '60%', execucao: 'https://www.youtube.com/shorts/bA5KbR0xltE' },
          { nome: 'Puxada Neutra Triângulo', series: 3, repeticoes: '12/10/8 (aumentando a carga a cada série)', peso: '70%', execucao: 'https://www.youtube.com/shorts/ySLFHxmJ_Sc' },
          { nome: 'Remada Máquina (Pegada Pronada)', series: 3, repeticoes: '10/8/6 (aumentando a carga a cada série)', peso: '70%', execucao: 'https://www.youtube.com/shorts/r4EmE8I74BQ' },
          { nome: 'Crucifixo Inverso Unilateral na Polia', series: 3, repeticoes: '8 a 10 repetições', peso: '50%', execucao: 'https://www.youtube.com/shorts/rJyUiN6Gkdg' },
          { nome: 'Rosca Direta Alternada Sentado com Halteres', series: 4, repeticoes: '8 a 10 repetições', peso: '60%', execucao: 'https://www.youtube.com/shorts/4onwQ6kLrC4' },
          { nome: 'Tríceps Coice Unilateral na Polia Baixa', series: 3, repeticoes: '8 a 10 repetições', peso: '60%', execucao: 'https://www.youtube.com/shorts/Yll1IwBByRo' },
          { nome: 'Tríceps na Polia com Corda', series: 3, repeticoes: '10/8/6 + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '60%', execucao: 'https://www.youtube.com/shorts/-QGC1cL6ETE' },
          { nome: 'Abdominal Supra no Solo Pés Altos', series: 3, repeticoes: '12 a 15 repetições com carga', peso: '30%', execucao: 'https://www.youtube.com/shorts/PEFjJbjnmns' },
          { nome: 'Abdominal Infra com as Pernas Flexionadas', series: 3, repeticoes: 'Até a falha', peso: '0%', execucao: 'https://www.youtube.com/watch?v=6LtsNXhhQDY&ab_channel=BioformaAcademia' }
        ]
      },
      {
        dia: 5,
        nome: 'Quadríceps + estímulo Isquiotibial',
        grupo: 'Quadríceps, Glúteos, Panturrilha, Abdômen',
        exercicios: [
          { nome: 'Agachamento Smith', series: 4, repeticoes: '15/12/10/8 (aumentando a carga a cada série)', peso: '70%', execucao: 'https://www.youtube.com/shorts/1oipoiTpbJA' },
          { nome: 'Leg Press 45°', series: 4, repeticoes: '12/10/8/6 (aumentando a carga a cada série)', peso: '80%', execucao: 'https://www.youtube.com/shorts/D9WR6PoMYxs' },
          { nome: 'Cadeira Extensora', series: 4, repeticoes: '12/10/8/6 (aumentando a carga a cada série) + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '60%', execucao: 'https://www.youtube.com/shorts/PzIfB9MiiX8' },
          { nome: 'Elevação de Quadril na Máquina', series: 4, repeticoes: '12/12/10/10 (aumentando a carga a cada série)', peso: '60%', execucao: 'https://www.youtube.com/shorts/Nuoo1XgRtGY' },
          { nome: 'Glúteos Coice na Polia Pernas Estendidas', series: 3, repeticoes: '10 a 12 repetições', peso: '60%', execucao: 'https://youtube.com/shorts/ZzjTOb19hPw' },
          { nome: 'Panturrilha no Leg Press Horizontal', series: 4, repeticoes: '20/15/12/10 (aumentando a carga a cada série)', peso: '50%', execucao: 'https://www.youtube.com/shorts/PkXChiAQDh8' },
          { nome: 'Abdominal Prancha Isométrica', series: 3, repeticoes: '60 segundos', peso: '0%', execucao: 'https://www.youtube.com/shorts/uxPlAbWFUDs' }
        ]
      }
    ]
  },
  '6x': {
    titulo: 'Treino 6x por Semana',
    frequencia: 'Frequência: 6x por semana',
    tipo: 'academia',
    duracao: '60-75 minutos',
    genero: 'feminino',
    dias: [
      {
        dia: 1,
        nome: 'Quadríceps + estímulo Isquiotibial',
        grupo: 'Quadríceps, Glúteos, Panturrilha, Abdômen',
        exercicios: [
          { nome: 'Agachamento Smith', series: 4, repeticoes: '15/12/10/8 (aumentando a carga a cada série)', peso: '70%', execucao: 'https://www.youtube.com/shorts/1oipoiTpbJA' },
          { nome: 'Leg Press 45°', series: 4, repeticoes: '12/10/8/6 (aumentando a carga a cada série)', peso: '80%', execucao: 'https://www.youtube.com/shorts/D9WR6PoMYxs' },
          { nome: 'Cadeira Extensora', series: 4, repeticoes: '12/10/8/6 (aumentando a carga a cada série) + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '60%', execucao: 'https://www.youtube.com/shorts/PzIfB9MiiX8' },
          { nome: 'Elevação de Quadril na Máquina', series: 4, repeticoes: '12/12/10/10 (aumentando a carga a cada série)', peso: '60%', execucao: 'https://www.youtube.com/shorts/Nuoo1XgRtGY' },
          { nome: 'Glúteos Coice na Polia Pernas Estendidas', series: 3, repeticoes: '10 a 12 repetições', peso: '60%', execucao: 'https://youtube.com/shorts/ZzjTOb19hPw' },
          { nome: 'Panturrilha no Leg Press Horizontal', series: 4, repeticoes: '20/15/12/10 (aumentando a carga a cada série)', peso: '50%', execucao: 'https://www.youtube.com/shorts/PkXChiAQDh8' },
          { nome: 'Abdominal Prancha Isométrica', series: 3, repeticoes: '60 segundos', peso: '0%', execucao: 'https://www.youtube.com/shorts/uxPlAbWFUDs' }
        ]
      },
      {
        dia: 2,
        nome: 'Membros superiores e Abdômen',
        grupo: 'Costas, Peito, Ombros, Braços, Abdômen',
        exercicios: [
          { nome: 'Puxada Aberta Barra Reta', series: 3, repeticoes: '12/10/8 (aumentando a carga a cada série)', peso: '70%', execucao: 'https://www.youtube.com/shorts/_2MfZAj98tk' },
          { nome: 'Supino Inclinado com Halteres', series: 3, repeticoes: '10 a 12 repetições', peso: '70%', execucao: 'https://www.youtube.com/shorts/ZaNyRjpoki8' },
          { nome: 'Remada Máquina (Pegada Neutra)', series: 3, repeticoes: '12/10/8 (aumentando a carga a cada série)', peso: '70%', execucao: 'https://www.youtube.com/shorts/r4EmE8I74BQ' },
          { nome: 'Elevação Lateral com Halteres', series: 4, repeticoes: '8 a 10 repetições + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '50%', execucao: 'https://www.youtube.com/shorts/ot9nwSC1JnA' },
          { nome: 'Rosca Direta na Polia (Barra Reta)', series: 4, repeticoes: '8 a 10 repetições + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '60%', execucao: 'https://www.youtube.com/shorts/x6JCKfdzPJE' },
          { nome: 'Tríceps Francês Unilateral na Polia', series: 3, repeticoes: '8 a 10 repetições', peso: '60%', execucao: 'https://www.youtube.com/shorts/_dtPoiFWZT4' },
          { nome: 'Tríceps na Polia com Barra Reta', series: 3, repeticoes: '10/8/6 + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '60%', execucao: 'https://www.youtube.com/shorts/M88Bt4MMpkI' },
          { nome: 'Abdominal Máquina', series: 3, repeticoes: '10 a 12 repetições', peso: '30%', execucao: 'https://www.youtube.com/shorts/uAe1Uj3Y05k' },
          { nome: 'Abdominal Infra com as Pernas Flexionadas com Elevação de Quadril', series: 3, repeticoes: 'Até a falha', peso: '0%', execucao: 'https://www.youtube.com/shorts/iZ5jYOH2ODM' }
        ]
      },
      {
        dia: 3,
        nome: 'Isquiotibial + Glúteo',
        grupo: 'Isquiotibiais, Glúteos, Panturrilha, Abdômen',
        exercicios: [
          { nome: 'Agachamento Sumô no Step com Halteres', series: 4, repeticoes: '12/12/10/10 (aumentando a carga a cada série)', peso: '60%', execucao: 'https://www.youtube.com/shorts/oFx42iwZKgo' },
          { nome: 'Stiff com Halteres', series: 4, repeticoes: '10/10/8/8 (aumentando a carga a cada série)', peso: '70%', execucao: 'https://www.youtube.com/shorts/SRVkwwXk7I4' },
          { nome: 'Elevação de Quadril na Máquina', series: 3, repeticoes: '12/10/8 (aumentando a carga a cada série)', peso: '60%', execucao: 'https://www.youtube.com/shorts/Nuoo1XgRtGY' },
          { nome: 'Abdução de Quadril Máquina com Corpo a Frente', series: 3, repeticoes: '12/10/8 (aumentando a carga a cada série) + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '60%', execucao: 'https://www.youtube.com/shorts/cZilgAG9Vx8' },
          { nome: 'Mesa Flexora', series: 4, repeticoes: '12/10/8/6 (aumentando a carga a cada série) + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '70%', execucao: 'https://www.youtube.com/shorts/IXg1PQ_5gmw' },
          { nome: 'Panturrilha no Smith com Step', series: 4, repeticoes: '10 a 12 repetições', peso: '50%', execucao: 'https://www.youtube.com/shorts/cETqVlftyJs' },
          { nome: 'Abdominal Prancha Isométrica', series: 3, repeticoes: '60 segundos', peso: '0%', execucao: 'https://www.youtube.com/shorts/uxPlAbWFUDs' }
        ]
      },
      {
        dia: 4,
        nome: 'Membros superiores e Abdômen',
        grupo: 'Peito, Costas, Ombros, Braços, Abdômen',
        exercicios: [
          { nome: 'Peck Deck', series: 3, repeticoes: '10 a 12 repetições', peso: '60%', execucao: 'https://www.youtube.com/shorts/bA5KbR0xltE' },
          { nome: 'Puxada Neutra Triângulo', series: 3, repeticoes: '12/10/8 (aumentando a carga a cada série)', peso: '70%', execucao: 'https://www.youtube.com/shorts/ySLFHxmJ_Sc' },
          { nome: 'Remada Máquina (Pegada Pronada)', series: 3, repeticoes: '10/8/6 (aumentando a carga a cada série)', peso: '70%', execucao: 'https://www.youtube.com/shorts/r4EmE8I74BQ' },
          { nome: 'Crucifixo Inverso Unilateral na Polia', series: 3, repeticoes: '8 a 10 repetições', peso: '50%', execucao: 'https://www.youtube.com/shorts/rJyUiN6Gkdg' },
          { nome: 'Rosca Direta Alternada Sentado com Halteres', series: 4, repeticoes: '8 a 10 repetições', peso: '60%', execucao: 'https://www.youtube.com/shorts/4onwQ6kLrC4' },
          { nome: 'Tríceps Coice Unilateral na Polia Baixa', series: 3, repeticoes: '8 a 10 repetições', peso: '60%', execucao: 'https://www.youtube.com/shorts/Yll1IwBByRo' },
          { nome: 'Tríceps na Polia com Corda', series: 3, repeticoes: '10/8/6 + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '60%', execucao: 'https://www.youtube.com/shorts/-QGC1cL6ETE' },
          { nome: 'Abdominal Supra no Solo Pés Altos', series: 3, repeticoes: '12 a 15 repetições com carga', peso: '30%', execucao: 'https://www.youtube.com/shorts/PEFjJbjnmns' },
          { nome: 'Abdominal Infra com as Pernas Flexionadas', series: 3, repeticoes: 'Até a falha', peso: '0%', execucao: 'https://www.youtube.com/watch?v=6LtsNXhhQDY&ab_channel=BioformaAcademia' }
        ]
      },
      {
        dia: 5,
        nome: 'Quadríceps + estímulo Isquiotibial',
        grupo: 'Quadríceps, Glúteos, Panturrilha, Abdômen',
        exercicios: [
          { nome: 'Agachamento Smith', series: 4, repeticoes: '15/12/10/8 (aumentando a carga a cada série)', peso: '70%', execucao: 'https://www.youtube.com/shorts/1oipoiTpbJA' },
          { nome: 'Leg Press 45°', series: 4, repeticoes: '12/10/8/6 (aumentando a carga a cada série)', peso: '80%', execucao: 'https://www.youtube.com/shorts/D9WR6PoMYxs' },
          { nome: 'Cadeira Extensora', series: 4, repeticoes: '12/10/8/6 (aumentando a carga a cada série) + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '60%', execucao: 'https://www.youtube.com/shorts/PzIfB9MiiX8' },
          { nome: 'Elevação de Quadril na Máquina', series: 4, repeticoes: '12/12/10/10 (aumentando a carga a cada série)', peso: '60%', execucao: 'https://www.youtube.com/shorts/Nuoo1XgRtGY' },
          { nome: 'Glúteos Coice na Polia Pernas Estendidas', series: 3, repeticoes: '10 a 12 repetições', peso: '60%', execucao: 'https://youtube.com/shorts/ZzjTOb19hPw' },
          { nome: 'Panturrilha no Leg Press Horizontal', series: 4, repeticoes: '20/15/12/10 (aumentando a carga a cada série)', peso: '50%', execucao: 'https://www.youtube.com/shorts/PkXChiAQDh8' },
          { nome: 'Abdominal Prancha Isométrica', series: 3, repeticoes: '60 segundos', peso: '0%', execucao: 'https://www.youtube.com/shorts/uxPlAbWFUDs' }
        ]
      },
      {
        dia: 6,
        nome: 'Membros superiores e Abdômen',
        grupo: 'Costas, Peito, Ombros, Braços, Abdômen',
        exercicios: [
          { nome: 'Puxada Aberta Barra Reta', series: 3, repeticoes: '12/10/8 (aumentando a carga a cada série)', peso: '70%', execucao: 'https://www.youtube.com/shorts/_2MfZAj98tk' },
          { nome: 'Supino Inclinado com Halteres', series: 3, repeticoes: '10 a 12 repetições', peso: '70%', execucao: 'https://www.youtube.com/shorts/ZaNyRjpoki8' },
          { nome: 'Remada Máquina (Pegada Neutra)', series: 3, repeticoes: '12/10/8 (aumentando a carga a cada série)', peso: '70%', execucao: 'https://www.youtube.com/shorts/r4EmE8I74BQ' },
          { nome: 'Elevação Lateral com Halteres', series: 4, repeticoes: '8 a 10 repetições + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '50%', execucao: 'https://www.youtube.com/shorts/ot9nwSC1JnA' },
          { nome: 'Rosca Direta na Polia (Barra Reta)', series: 4, repeticoes: '8 a 10 repetições + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '60%', execucao: 'https://www.youtube.com/shorts/x6JCKfdzPJE' },
          { nome: 'Tríceps Francês Unilateral na Polia', series: 3, repeticoes: '8 a 10 repetições', peso: '60%', execucao: 'https://www.youtube.com/shorts/_dtPoiFWZT4' },
          { nome: 'Tríceps na Polia com Barra Reta', series: 3, repeticoes: '10/8/6 + Drop set (ao final da última série diminua 20% da carga e faça até a falha total)', peso: '60%', execucao: 'https://www.youtube.com/shorts/M88Bt4MMpkI' },
          { nome: 'Abdominal Máquina', series: 3, repeticoes: '10 a 12 repetições', peso: '30%', execucao: 'https://www.youtube.com/shorts/uAe1Uj3Y05k' },
          { nome: 'Abdominal Infra com as Pernas Flexionadas com Elevação de Quadril', series: 3, repeticoes: 'Até a falha', peso: '0%', execucao: 'https://www.youtube.com/shorts/iZ5jYOH2ODM' }
        ]
      }
    ]
  },
  'casa': {
    titulo: 'Treino em Casa',
    frequencia: 'Frequência: 3 a 6x por semana, Ao terminar o treino 3 siga a sequência e retorne para o 1',
    tipo: 'casa',
    duracao: '30-45 minutos',
    dias: [
      {
        dia: 1,
        nome: 'Dia 1',
        grupo: 'Corpo Inteiro + Cardio',
        exercicios: [
          { nome: 'Polichinelo', series: 4, repeticoes: '12 a 15 repetições reps', peso: '0%', execucao: 'https://www.youtube.com/shorts/guvPySViG7o' },
          { nome: 'Afundo com Carga', series: 4, repeticoes: '12 a 15 repetições reps', peso: '0%', execucao: 'https://www.youtube.com/watch?v=2JfYV4Er_Jg&ab_channel=KarlaLaleska' },
          { nome: 'Skipping Alto', series: 4, repeticoes: '30-60 segundos', peso: '0%', execucao: 'https://www.youtube.com/shorts/gxnEVpAGZqE' },
          { nome: 'Agachamento com Salto', series: 4, repeticoes: '10 a 12 repetições reps', peso: '0%', execucao: 'https://www.youtube.com/shorts/XYKLBni1080' },
          { nome: 'Prancha Isométrica', series: 4, repeticoes: '60 segundos', peso: '0%', execucao: 'https://www.youtube.com/shorts/uxPlAbWFUDs' }
        ]
      },
      {
        dia: 2,
        nome: 'Dia 2',
        grupo: 'Corpo Inteiro + Cardio',
        exercicios: [
          { nome: 'Agachamento com Salto', series: 4, repeticoes: '10 a 12 repetições reps', peso: '0%', execucao: 'https://www.youtube.com/shorts/XYKLBni1080' },
          { nome: 'Avanço Alternado', series: 3, repeticoes: '10 reps de cada lado', peso: '0%', execucao: 'https://www.youtube.com/shorts/fu_y_h3X7xE' },
          { nome: 'Escalador', series: 3, repeticoes: '10 reps de cada lado', peso: '0%', execucao: 'https://www.youtube.com/shorts/fDo4sulRb04' },
          { nome: 'Flexão de Braços com Apoio', series: 3, repeticoes: '8 a 10 repetições reps', peso: '0%', execucao: 'https://www.youtube.com/shorts/QJ7cqXaAp8w' },
          { nome: 'Prancha Isométrica', series: 3, repeticoes: '60 segundos', peso: '0%', execucao: 'https://www.youtube.com/shorts/uxPlAbWFUDs' }
        ]
      },
      {
        dia: 3,
        nome: 'Dia 3',
        grupo: 'Corpo Inteiro + Cardio',
        exercicios: [
          { nome: 'Polichinelo com Agachamento', series: 3, repeticoes: '10 a 12 repetições reps', peso: '0%', execucao: 'https://www.youtube.com/shorts/nb24dGcNjGA' },
          { nome: 'Recuo Alternado', series: 3, repeticoes: '10 a 12 repetições reps de cada lado', peso: '0%', execucao: 'https://www.youtube.com/shorts/ujmyaF0vuDM' },
          { nome: 'Skipping', series: 4, repeticoes: '10 a 12 repetições reps de cada lado', peso: '0%', execucao: 'https://www.youtube.com/shorts/6qSYlrN4XO4' },
          { nome: 'Avanço Unilateral', series: 4, repeticoes: '10 reps de cada lado', peso: '0%', execucao: 'https://www.youtube.com/shorts/QEiONKVu6rg' },
          { nome: 'Prancha Isométrica', series: 4, repeticoes: '60 segundos', peso: '0%', execucao: 'https://www.youtube.com/shorts/uxPlAbWFUDs' }
        ]
      }
    ]
  }
};

export default function Treinos() {
  const [treinoSelecionado, setTreinoSelecionado] = useState<TipoTreino>('5x');
  const [generoSelecionado, setGeneroSelecionado] = useState<'masculino' | 'feminino'>('masculino');
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState<string>('');



  const treinosData = generoSelecionado === 'masculino' ? treinosDataMasculino : treinosDataFeminino;
  const treinoAtual = treinosData[treinoSelecionado];

  // Função para extrair o ID do vídeo do YouTube
  const extractYouTubeId = (url: string): string => {
    // Regex melhorada para capturar IDs do YouTube
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/watch\?.*&v=)([^&#?]{11})/,
      /youtube\.com\/shorts\/([^&#?]{11})/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return '';
  };

  // Função para abrir o modal de vídeo
  const openVideoModal = (videoUrl: string) => {
    const videoId = extractYouTubeId(videoUrl);
    if (videoId) {
      setCurrentVideoId(videoId);
      setVideoModalOpen(true);
    } else {
      // Se não conseguir extrair o ID, abre em nova aba como fallback
      window.open(videoUrl, '_blank');
    }
  };

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
                ORIENTAÇÕES IMPORTANTES
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white text-gray-900">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-yellow-600 flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Orientações Importantes: LEIA TUDO
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 text-gray-700">
                {/* Mentalidade de Treino */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-400 p-6 rounded-r-lg">
                  <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                    🎯 MENTALIDADE DE TREINO
                  </h3>
                  <p className="text-sm text-blue-700 leading-relaxed mb-3">
                    Se dedique bastante nos treinos, foque totalmente em <strong>progressão de cargas e de esforço</strong>. Você deve literalmente <strong>DAR O MÁXIMO EM CADA TREINO</strong>, buscando fazer os movimentos de forma correta e dando seu melhor em cada treino que realizar, sempre focando em progredir nas cargas a cada treino, buscando a <strong>falha muscular</strong> em todos os exercícios.
                  </p>
                  <div className="bg-blue-100 border border-blue-200 rounded-lg p-3">
                    <p className="text-blue-800 font-semibold">
                      <strong>Falha = não conseguir realizar mais nenhuma repetição perfeita</strong>
                    </p>
                  </div>
                </div>

                {/* Como Identificar Falha */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
                  <h3 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
                    🎯 COMO IDENTIFICAR SE CHEGOU À FALHA
                  </h3>
                  <p className="text-sm text-yellow-700 leading-relaxed mb-4">
                    A ideia é você fazer as repetições previstas e <strong>não conseguir fazer mais nenhuma repetição com qualidade</strong>, pois faltará força para completar o movimento, falhando a musculatura.
                  </p>
                  
                  <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-3">Exemplo prático:</h4>
                    <p className="text-sm text-yellow-700 mb-3">Se está prescrito para fazer <strong>10 a 12 repetições</strong>:</p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <span className="text-green-600">✅</span>
                        <span className="text-yellow-700"><strong>Caso faça 13 ou mais:</strong> significa que está leve, pode aumentar</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-red-600">❌</span>
                        <span className="text-yellow-700"><strong>Caso faça 11 ou menos:</strong> significa que está pesado, pode diminuir um pouco</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-yellow-600">🎯</span>
                        <span className="text-yellow-700"><strong>Ideal:</strong> conseguir fazer exatamente 12 repetições e não conseguir fazer a 13ª com qualidade</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Regras Fundamentais */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-400 p-6 rounded-r-lg">
                  <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                    📋 REGRAS FUNDAMENTAIS
                  </h3>
                  <p className="text-sm text-green-700 leading-relaxed mb-4">
                    Peço que siga exatamente como está previsto, <strong>sem acrescentar ou retirar séries nem exercícios</strong>.
                  </p>
                  <div className="bg-green-100 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">Importante:</h4>
                    <ul className="space-y-1 text-sm text-green-700">
                      <li><strong>1.</strong> Sempre priorize técnica e amplitude de movimento</li>
                      <li><strong>2.</strong> Busque progressão de carga sempre que possível dentro da faixa de repetições prevista</li>
                      <li><strong>3.</strong> Mantenha 1 minuto ou mais de descanso entre as séries</li>
                      <li><strong>4.</strong> <strong>NÃO TENHA MEDO DE USAR CARGAS ALTAS</strong>, pois é através disso que conseguiremos sinalizar da melhor maneira a hipertrofia. Precisamos fazer com que cada treino seja desafiador a ponto do seu corpo <strong>TER QUE ENTENDER QUE ELE DEVE EVOLUIR</strong> para suportar a pancada do treino que você está dando nele.</li>
                    </ul>
                  </div>
                </div>

                {/* Observações Importantes */}
                <div className="bg-gradient-to-r from-purple-50 to-violet-50 border-l-4 border-purple-400 p-6 rounded-r-lg">
                  <h3 className="font-bold text-purple-800 mb-4 flex items-center gap-2">
                    🔥 OBSERVAÇÕES IMPORTANTES PARA EXECUTAR EM CADA TREINO
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="bg-purple-100 border border-purple-200 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-2">Aquecimento</h4>
                      <p className="text-sm text-purple-700">
                        <strong>No primeiro exercício do treino</strong> faça <strong>2 séries iniciais EXTRAS de 30 repetições</strong> como aquecimento, com uma carga leve/moderada
                      </p>
                    </div>

                    <div className="bg-purple-100 border border-purple-200 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-2">Descanso</h4>
                      <p className="text-sm text-purple-700">
                        O tempo <strong>MÍNIMO DE DESCANSO</strong> entre as séries e os exercícios é de <strong>60 A 90 SEGUNDOS</strong>
                      </p>
                    </div>

                    <div className="bg-purple-100 border border-purple-200 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-2">Cadência</h4>
                      <p className="text-sm text-purple-700 mb-2">
                        Faça uma <strong>cadência controlada</strong>, nem tão lenta e nem tão rápida
                      </p>
                      <p className="text-sm text-purple-600">
                        <strong>Exemplo:</strong> na extensora, 2 a 3 segundos na fase da subida e 2 a 3 segundos na fase da descida
                      </p>
                    </div>

                    <div className="bg-purple-100 border border-purple-200 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-2">Progressão de Carga</h4>
                      <p className="text-sm text-purple-700 mb-2">
                        <strong>Sempre que você ultrapassar as repetições previstas</strong>, é sinal que consegue aumentar a carga
                      </p>
                      <p className="text-sm text-purple-700 mb-2">
                        Nos exercícios em que diminuem as repetições a cada série, <strong>aumente a carga conforme diminui a repetição</strong>
                      </p>
                      <p className="text-sm text-purple-600">
                        <strong>Exemplo:</strong> 12/10/8 - Faz 12, descansa, faz 10 com uma carga maior, descansa, faz 8 com uma carga maior, sempre com <strong>carga MÁXIMA</strong> para cada margem de repetições
                      </p>
                    </div>
                  </div>
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
                          onClick={() => openVideoModal(exercicio.execucao!)}
                          className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300 flex items-center gap-1 text-xs px-2 py-1 h-auto"
                        >
                          <Play className="w-3 h-3" />
                          Ver Execução
                        </Button>
                      )}
                    </div>
                    <div className="flex gap-2 flex-wrap ml-5">
                      <Badge variant="outline" className="border-yellow-400 text-yellow-700 bg-yellow-50 font-semibold shadow-sm">
                        📊 {exercicio.series} séries
                      </Badge>
                      <Badge variant="outline" className="border-orange-400 text-orange-700 bg-orange-50 font-semibold shadow-sm">
                        🔄 {exercicio.repeticoes}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}


      </div>

      {/* Seções Informativas */}
      {/* 3 Cards Informativos */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        {/* Dicas de Treino */}
        <Card className="bg-white dark:bg-white border-gray-200 dark:border-gray-200 text-gray-900">
          <CardHeader>
            <CardTitle className="text-blue-600 flex items-center gap-2">
              <span className="text-2xl">💡</span>
              Dicas de Treino
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-gray-700">
            <div className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">•</span>
              <p>Sempre faça aquecimento antes do treino</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">•</span>
              <p>Mantenha a execução correta dos exercícios</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">•</span>
              <p>Descanse de 48-72h entre treinos do mesmo grupo muscular</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">•</span>
              <p>Hidrate-se durante o treino</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">•</span>
              <p>Progrida gradualmente nas cargas</p>
            </div>
          </CardContent>
        </Card>

        {/* Duração Recomendada */}
        <Card className="bg-white dark:bg-white border-gray-200 dark:border-gray-200 text-gray-900">
          <CardHeader>
            <CardTitle className="text-yellow-600 flex items-center gap-2">
              <span className="text-2xl">⏱️</span>
              Duração Estimada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-gray-700">
            <div className="flex justify-between items-center">
              <span>Treino 3x/Semana:</span>
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">60 min</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Treino 4x/Semana:</span>
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">60 min</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Treino 5x/Semana:</span>
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">60-75 min</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Treino 6x/Semana:</span>
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">60-75 min</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Treino em Casa:</span>
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">30-45 min</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Cardios */}
        <Card className="bg-white dark:bg-white border-gray-200 dark:border-gray-200 text-gray-900">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <span className="text-2xl">❤️</span>
              Cardios
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-gray-700">
            <p className="text-sm leading-relaxed">
              Sempre que possível faça um cardio após o treino (ou em outro horário do dia) de <strong>20 minutos</strong> de caminhada rápida na esteira ou na rua, <strong>sem correr</strong>, mas sempre mantendo uma intensidade a ponto de se manter <strong>ofegante</strong>.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Card de Motivação */}
      <div className="mt-8">
        <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white max-w-4xl mx-auto">
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

      {/* Modal de Vídeo */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="relative max-w-4xl w-[95vw] h-[80vh] bg-black rounded-lg">
            {/* Header do Modal */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-r from-black/80 to-transparent p-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">Execução do Exercício</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setVideoModalOpen(false)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            {/* Iframe do YouTube */}
            {currentVideoId && (
              <iframe
                src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=1&rel=0&modestbranding=1`}
                title="Execução do Exercício"
                className="w-full h-full rounded-lg"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </div>
      )}

    </div>
  );
}