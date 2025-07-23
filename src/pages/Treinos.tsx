import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dumbbell, Clock, Target, Home, Building, Info, Timer } from 'lucide-react';

interface Exercise {
  name: string;
  sets: string;
  reps: string;
  rest: string;
}

interface WorkoutDay {
  name: string;
  muscleGroups: string;
  exercises: Exercise[];
}

interface WorkoutPlan {
  id: string;
  title: string;
  frequency: string;
  days: WorkoutDay[];
  duration: string;
  type: 'gym' | 'home';
}

const workoutPlans: WorkoutPlan[] = [
  {
    id: '3x',
    title: 'Treino 3x por Semana',
    frequency: '3x',
    type: 'gym',
    duration: '45-60 minutos',
    days: [
      {
        name: 'Dia A',
        muscleGroups: 'Peito, Tríceps, Ombro',
        exercises: [
          { name: 'Supino Reto', sets: '4x', reps: '8-12 reps', rest: '60-90s' },
          { name: 'Supino Inclinado', sets: '3x', reps: '8-12 reps', rest: '60s' },
          { name: 'Crucifixo', sets: '3x', reps: '10-15 reps', rest: '45s' },
          { name: 'Desenvolvimento Militar', sets: '4x', reps: '8-12 reps', rest: '60s' },
          { name: 'Elevação Lateral', sets: '3x', reps: '12-15 reps', rest: '45s' },
          { name: 'Tríceps Testa', sets: '3x', reps: '10-15 reps', rest: '45s' },
          { name: 'Tríceps Pulley', sets: '3x', reps: '12-15 reps', rest: '45s' }
        ]
      },
      {
        name: 'Dia B',
        muscleGroups: 'Costas, Bíceps',
        exercises: [
          { name: 'Puxada Frontal', sets: '4x', reps: '8-12 reps', rest: '60-90s' },
          { name: 'Remada Curvada', sets: '4x', reps: '8-12 reps', rest: '60s' },
          { name: 'Remada Unilateral', sets: '3x', reps: '10-12 reps', rest: '45s' },
          { name: 'Pullover', sets: '3x', reps: '12-15 reps', rest: '45s' },
          { name: 'Rosca Direta', sets: '4x', reps: '10-15 reps', rest: '45s' },
          { name: 'Rosca Martelo', sets: '3x', reps: '12-15 reps', rest: '45s' },
          { name: 'Rosca 21', sets: '2x', reps: '21 reps', rest: '60s' }
        ]
      },
      {
        name: 'Dia C',
        muscleGroups: 'Pernas, Abdome',
        exercises: [
          { name: 'Agachamento', sets: '4x', reps: '8-15 reps', rest: '90s' },
          { name: 'Leg Press', sets: '4x', reps: '12-20 reps', rest: '60s' },
          { name: 'Extensora', sets: '3x', reps: '15-20 reps', rest: '45s' },
          { name: 'Flexora', sets: '3x', reps: '12-15 reps', rest: '45s' },
          { name: 'Panturrilha em Pé', sets: '4x', reps: '15-25 reps', rest: '30s' },
          { name: 'Abdominal Supra', sets: '3x', reps: '20-30 reps', rest: '30s' },
          { name: 'Prancha', sets: '3x', reps: '30-60s', rest: '30s' }
        ]
      }
    ]
  },
  {
    id: '4x',
    title: 'Treino 4x por Semana',
    frequency: '4x',
    type: 'gym',
    duration: '45-60 minutos',
    days: [
      {
        name: 'Dia A',
        muscleGroups: 'Peito, Tríceps',
        exercises: [
          { name: 'Supino Reto', sets: '4x', reps: '8-12 reps', rest: '60-90s' },
          { name: 'Supino Inclinado', sets: '4x', reps: '8-12 reps', rest: '60s' },
          { name: 'Crucifixo', sets: '3x', reps: '10-15 reps', rest: '45s' },
          { name: 'Paralelas', sets: '3x', reps: '8-15 reps', rest: '60s' },
          { name: 'Tríceps Testa', sets: '4x', reps: '10-15 reps', rest: '45s' },
          { name: 'Tríceps Pulley', sets: '3x', reps: '12-15 reps', rest: '45s' }
        ]
      },
      {
        name: 'Dia B',
        muscleGroups: 'Costas, Bíceps',
        exercises: [
          { name: 'Puxada Frontal', sets: '4x', reps: '8-12 reps', rest: '60-90s' },
          { name: 'Remada Curvada', sets: '4x', reps: '8-12 reps', rest: '60s' },
          { name: 'Remada Unilateral', sets: '3x', reps: '10-12 reps', rest: '45s' },
          { name: 'Pullover', sets: '3x', reps: '12-15 reps', rest: '45s' },
          { name: 'Rosca Direta', sets: '4x', reps: '10-15 reps', rest: '45s' },
          { name: 'Rosca Martelo', sets: '3x', reps: '12-15 reps', rest: '45s' }
        ]
      },
      {
        name: 'Dia C',
        muscleGroups: 'Ombros, Abdome',
        exercises: [
          { name: 'Desenvolvimento Militar', sets: '4x', reps: '8-12 reps', rest: '60s' },
          { name: 'Elevação Lateral', sets: '4x', reps: '12-15 reps', rest: '45s' },
          { name: 'Elevação Posterior', sets: '3x', reps: '12-15 reps', rest: '45s' },
          { name: 'Encolhimento', sets: '3x', reps: '12-20 reps', rest: '45s' },
          { name: 'Abdominal Supra', sets: '4x', reps: '20-30 reps', rest: '30s' },
          { name: 'Prancha', sets: '3x', reps: '30-60s', rest: '30s' }
        ]
      },
      {
        name: 'Dia D',
        muscleGroups: 'Pernas',
        exercises: [
          { name: 'Agachamento', sets: '4x', reps: '8-15 reps', rest: '90s' },
          { name: 'Leg Press', sets: '4x', reps: '12-20 reps', rest: '60s' },
          { name: 'Extensora', sets: '3x', reps: '15-20 reps', rest: '45s' },
          { name: 'Flexora', sets: '3x', reps: '12-15 reps', rest: '45s' },
          { name: 'Stiff', sets: '3x', reps: '10-15 reps', rest: '60s' },
          { name: 'Panturrilha em Pé', sets: '4x', reps: '15-25 reps', rest: '30s' }
        ]
      }
    ]
  }
];const 
moreWorkoutPlans: WorkoutPlan[] = [
  {
    id: '5x',
    title: 'Treino 5x por Semana',
    frequency: '5x',
    type: 'gym',
    duration: '60-75 minutos',
    days: [
      {
        name: 'Dia 1',
        muscleGroups: 'Peito',
        exercises: [
          { name: 'Supino Reto', sets: '4x', reps: '8-12 reps', rest: '60-90s' },
          { name: 'Supino Inclinado', sets: '4x', reps: '8-12 reps', rest: '60s' },
          { name: 'Supino Declinado', sets: '3x', reps: '8-12 reps', rest: '60s' },
          { name: 'Crucifixo', sets: '3x', reps: '10-15 reps', rest: '45s' },
          { name: 'Crucifixo Inclinado', sets: '3x', reps: '10-15 reps', rest: '45s' },
          { name: 'Paralelas', sets: '3x', reps: '8-15 reps', rest: '60s' }
        ]
      },
      {
        name: 'Dia 2',
        muscleGroups: 'Costas',
        exercises: [
          { name: 'Puxada Frontal', sets: '4x', reps: '8-12 reps', rest: '60-90s' },
          { name: 'Puxada Atrás', sets: '3x', reps: '8-12 reps', rest: '60s' },
          { name: 'Remada Curvada', sets: '4x', reps: '8-12 reps', rest: '60s' },
          { name: 'Remada Unilateral', sets: '3x', reps: '10-12 reps', rest: '45s' },
          { name: 'Pullover', sets: '3x', reps: '12-15 reps', rest: '45s' },
          { name: 'Remada Baixa', sets: '3x', reps: '10-15 reps', rest: '45s' }
        ]
      },
      {
        name: 'Dia 3',
        muscleGroups: 'Ombros',
        exercises: [
          { name: 'Desenvolvimento Militar', sets: '4x', reps: '8-12 reps', rest: '60s' },
          { name: 'Desenvolvimento com Halteres', sets: '3x', reps: '8-12 reps', rest: '60s' },
          { name: 'Elevação Lateral', sets: '4x', reps: '12-15 reps', rest: '45s' },
          { name: 'Elevação Frontal', sets: '3x', reps: '12-15 reps', rest: '45s' },
          { name: 'Elevação Posterior', sets: '4x', reps: '12-15 reps', rest: '45s' },
          { name: 'Encolhimento', sets: '3x', reps: '12-20 reps', rest: '45s' }
        ]
      },
      {
        name: 'Dia 4',
        muscleGroups: 'Braços',
        exercises: [
          { name: 'Rosca Direta', sets: '4x', reps: '10-15 reps', rest: '45s' },
          { name: 'Rosca Alternada', sets: '3x', reps: '10-15 reps', rest: '45s' },
          { name: 'Rosca Martelo', sets: '3x', reps: '12-15 reps', rest: '45s' },
          { name: 'Tríceps Testa', sets: '4x', reps: '10-15 reps', rest: '45s' },
          { name: 'Tríceps Pulley', sets: '3x', reps: '12-15 reps', rest: '45s' },
          { name: 'Tríceps Francês', sets: '3x', reps: '10-15 reps', rest: '45s' }
        ]
      },
      {
        name: 'Dia 5',
        muscleGroups: 'Pernas',
        exercises: [
          { name: 'Agachamento', sets: '4x', reps: '8-15 reps', rest: '90s' },
          { name: 'Leg Press', sets: '4x', reps: '12-20 reps', rest: '60s' },
          { name: 'Extensora', sets: '4x', reps: '15-20 reps', rest: '45s' },
          { name: 'Flexora', sets: '4x', reps: '12-15 reps', rest: '45s' },
          { name: 'Stiff', sets: '3x', reps: '10-15 reps', rest: '60s' },
          { name: 'Panturrilha em Pé', sets: '4x', reps: '15-25 reps', rest: '30s' }
        ]
      }
    ]
  },
  {
    id: '6x',
    title: 'Treino 6x por Semana',
    frequency: '6x',
    type: 'gym',
    duration: '45-60 minutos',
    days: [
      {
        name: 'Dia 1',
        muscleGroups: 'Peito, Tríceps',
        exercises: [
          { name: 'Supino Reto', sets: '4x', reps: '8-12 reps', rest: '60-90s' },
          { name: 'Supino Inclinado', sets: '3x', reps: '8-12 reps', rest: '60s' },
          { name: 'Crucifixo', sets: '3x', reps: '10-15 reps', rest: '45s' },
          { name: 'Tríceps Testa', sets: '3x', reps: '10-15 reps', rest: '45s' },
          { name: 'Tríceps Pulley', sets: '3x', reps: '12-15 reps', rest: '45s' }
        ]
      },
      {
        name: 'Dia 2',
        muscleGroups: 'Costas, Bíceps',
        exercises: [
          { name: 'Puxada Frontal', sets: '4x', reps: '8-12 reps', rest: '60-90s' },
          { name: 'Remada Curvada', sets: '3x', reps: '8-12 reps', rest: '60s' },
          { name: 'Remada Unilateral', sets: '3x', reps: '10-12 reps', rest: '45s' },
          { name: 'Rosca Direta', sets: '3x', reps: '10-15 reps', rest: '45s' },
          { name: 'Rosca Martelo', sets: '3x', reps: '12-15 reps', rest: '45s' }
        ]
      },
      {
        name: 'Dia 3',
        muscleGroups: 'Pernas',
        exercises: [
          { name: 'Agachamento', sets: '4x', reps: '8-15 reps', rest: '90s' },
          { name: 'Leg Press', sets: '3x', reps: '12-20 reps', rest: '60s' },
          { name: 'Extensora', sets: '3x', reps: '15-20 reps', rest: '45s' },
          { name: 'Flexora', sets: '3x', reps: '12-15 reps', rest: '45s' },
          { name: 'Panturrilha em Pé', sets: '3x', reps: '15-25 reps', rest: '30s' }
        ]
      },
      {
        name: 'Dia 4',
        muscleGroups: 'Peito, Tríceps',
        exercises: [
          { name: 'Supino Inclinado', sets: '4x', reps: '8-12 reps', rest: '60s' },
          { name: 'Supino Declinado', sets: '3x', reps: '8-12 reps', rest: '60s' },
          { name: 'Crucifixo Inclinado', sets: '3x', reps: '10-15 reps', rest: '45s' },
          { name: 'Tríceps Francês', sets: '3x', reps: '10-15 reps', rest: '45s' },
          { name: 'Paralelas', sets: '3x', reps: '8-15 reps', rest: '60s' }
        ]
      },
      {
        name: 'Dia 5',
        muscleGroups: 'Costas, Bíceps',
        exercises: [
          { name: 'Puxada Atrás', sets: '4x', reps: '8-12 reps', rest: '60s' },
          { name: 'Remada Baixa', sets: '3x', reps: '10-15 reps', rest: '45s' },
          { name: 'Pullover', sets: '3x', reps: '12-15 reps', rest: '45s' },
          { name: 'Rosca Alternada', sets: '3x', reps: '10-15 reps', rest: '45s' },
          { name: 'Rosca 21', sets: '2x', reps: '21 reps', rest: '60s' }
        ]
      },
      {
        name: 'Dia 6',
        muscleGroups: 'Ombros, Abdome',
        exercises: [
          { name: 'Desenvolvimento Militar', sets: '4x', reps: '8-12 reps', rest: '60s' },
          { name: 'Elevação Lateral', sets: '3x', reps: '12-15 reps', rest: '45s' },
          { name: 'Elevação Posterior', sets: '3x', reps: '12-15 reps', rest: '45s' },
          { name: 'Abdominal Supra', sets: '4x', reps: '20-30 reps', rest: '30s' },
          { name: 'Prancha', sets: '3x', reps: '30-60s', rest: '30s' }
        ]
      }
    ]
  },
  {
    id: 'home',
    title: 'Treino em Casa',
    frequency: 'Flexível',
    type: 'home',
    duration: '30-45 minutos',
    days: [
      {
        name: 'Treino A',
        muscleGroups: 'Corpo Superior',
        exercises: [
          { name: 'Flexão de Braço', sets: '4x', reps: '8-20 reps', rest: '60s' },
          { name: 'Flexão Diamante', sets: '3x', reps: '5-15 reps', rest: '60s' },
          { name: 'Pike Push-up', sets: '3x', reps: '8-15 reps', rest: '45s' },
          { name: 'Tríceps no Sofá', sets: '3x', reps: '10-20 reps', rest: '45s' },
          { name: 'Prancha', sets: '3x', reps: '30-60s', rest: '30s' },
          { name: 'Mountain Climber', sets: '3x', reps: '20-40 reps', rest: '30s' }
        ]
      },
      {
        name: 'Treino B',
        muscleGroups: 'Inferior',
        exercises: [
          { name: 'Agachamento', sets: '4x', reps: '15-25 reps', rest: '60s' },
          { name: 'Agachamento Búlgaro', sets: '3x', reps: '10-15 reps', rest: '45s' },
          { name: 'Afundo', sets: '3x', reps: '12-20 reps', rest: '45s' },
          { name: 'Agachamento Sumo', sets: '3x', reps: '15-25 reps', rest: '45s' },
          { name: 'Elevação de Panturrilha', sets: '4x', reps: '20-30 reps', rest: '30s' },
          { name: 'Glúteo 4 Apoios', sets: '3x', reps: '15-25 reps', rest: '30s' }
        ]
      },
      {
        name: 'Treino C',
        muscleGroups: 'Full Body',
        exercises: [
          { name: 'Burpee', sets: '3x', reps: '8-15 reps', rest: '60s' },
          { name: 'Flexão + Agachamento', sets: '3x', reps: '10-20 reps', rest: '60s' },
          { name: 'Prancha Dinâmica', sets: '3x', reps: '10-20 reps', rest: '45s' },
          { name: 'Jumping Jacks', sets: '3x', reps: '30-60 reps', rest: '30s' },
          { name: 'High Knees', sets: '3x', reps: '30-60s', rest: '30s' },
          { name: 'Abdominal Bicicleta', sets: '3x', reps: '20-40 reps', rest: '30s' }
        ]
      }
    ]
  }
];

const allWorkoutPlans = [...workoutPlans, ...moreWorkoutPlans];

const trainingTips = [
  'Sempre faça aquecimento antes do treino',
  'Mantenha a forma correta dos exercícios',
  'Descanse entre 48-72h entre treinos do mesmo grupo muscular',
  'Hidrate-se durante o treino',
  'Progrida gradualmente nas cargas'
];

export default function Treinos() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const getTypeIcon = (type: 'gym' | 'home') => {
    return type === 'home' ? <Home className="w-4 h-4" /> : <Building className="w-4 h-4" />;
  };

  const getTypeLabel = (type: 'gym' | 'home') => {
    return type === 'home' ? 'Casa' : 'Academia';
  };

  const planButtons = [
    { id: '3x', label: 'Treino 3x/Semana', icon: <Dumbbell className="w-5 h-5" /> },
    { id: '4x', label: 'Treino 4x/Semana', icon: <Dumbbell className="w-5 h-5" /> },
    { id: '5x', label: 'Treino 5x/Semana', icon: <Dumbbell className="w-5 h-5" /> },
    { id: '6x', label: 'Treino 6x/Semana', icon: <Dumbbell className="w-5 h-5" /> },
    { id: 'home', label: 'Treino em Casa', icon: <Home className="w-5 h-5" /> }
  ];

  const selectedPlanData = selectedPlan ? allWorkoutPlans.find(plan => plan.id === selectedPlan) : null;

  return (
    <div className="fixed inset-0 bg-zinc-900 overflow-auto">
      <div className="min-h-full w-full bg-zinc-900 text-white">
        <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-amber-500">Planos de Treino</h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Escolha o treino ideal para sua frequência e objetivo
          </p>
        </div>

        {/* Plan Selection Buttons */}
        <div className="flex flex-wrap justify-center gap-4 py-8">
          {planButtons.map((button) => (
            <Button
              key={button.id}
              onClick={() => setSelectedPlan(button.id)}
              variant={selectedPlan === button.id ? "default" : "outline"}
              className={`
                flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all
                ${selectedPlan === button.id 
                  ? 'bg-amber-500 hover:bg-amber-600 text-black border-amber-500' 
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-600 hover:border-amber-500/50'
                }
              `}
            >
              {button.icon}
              {button.label}
            </Button>
          ))}
        </div>

        {/* Selected Plan Details */}
        {selectedPlanData && (
          <div className="space-y-6">
            {/* Plan Header */}
            <div className="bg-gradient-to-r from-amber-500/20 to-amber-600/20 rounded-xl p-6 border border-amber-500/30">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Dumbbell className="w-8 h-8 text-amber-500" />
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedPlanData.title}</h2>
                    <p className="text-zinc-300">Frequência: {selectedPlanData.frequency} por semana</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Badge variant="secondary" className="bg-zinc-800 text-zinc-200 flex items-center gap-2">
                    {getTypeIcon(selectedPlanData.type)}
                    {getTypeLabel(selectedPlanData.type)}
                  </Badge>
                  <Badge variant="outline" className="border-amber-500 text-amber-500 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {selectedPlanData.duration}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Workout Days */}
            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {selectedPlanData.days.map((day, dayIndex) => (
                <Card key={dayIndex} className="bg-zinc-800 border-zinc-700 hover:border-amber-500/50 transition-colors">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Target className="w-5 h-5 text-amber-500" />
                      {day.name}
                    </CardTitle>
                    <p className="text-amber-500 font-medium">{day.muscleGroups}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {day.exercises.map((exercise, exerciseIndex) => (
                      <div key={exerciseIndex} className="bg-zinc-900 rounded-lg p-3 space-y-2">
                        <h4 className="font-medium text-white">{exercise.name}</h4>
                        <div className="flex flex-wrap gap-2 text-sm">
                          <Badge variant="outline" className="border-zinc-600 text-zinc-300">
                            {exercise.sets}
                          </Badge>
                          <Badge variant="outline" className="border-zinc-600 text-zinc-300">
                            {exercise.reps}
                          </Badge>
                          <Badge variant="outline" className="border-amber-500/50 text-amber-400">
                            {exercise.rest}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Tips and Duration Cards - Below all workout days */}
            <div className="grid gap-6 lg:grid-cols-2 mt-8">
              {/* Tips Card */}
              <Card className="bg-zinc-800 border-zinc-700 hover:border-amber-500/50 transition-colors">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Info className="w-5 h-5 text-amber-500" />
                    Dicas de Treino
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {trainingTips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-zinc-300 text-sm">{tip}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Duration Card */}
              <Card className="bg-zinc-800 border-zinc-700 hover:border-amber-500/50 transition-colors">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Timer className="w-5 h-5 text-amber-500" />
                    Duração Recomendada
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-300 text-sm">Treino 3x/semana:</span>
                    <span className="text-amber-500 font-medium">45-60 minutos</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-300 text-sm">Treino 4x/semana:</span>
                    <span className="text-amber-500 font-medium">45-60 minutos</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-300 text-sm">Treino 5x/semana:</span>
                    <span className="text-amber-500 font-medium">60-75 minutos</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-300 text-sm">Treino 6x/semana:</span>
                    <span className="text-amber-500 font-medium">45-60 minutos</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-300 text-sm">Treino em casa:</span>
                    <span className="text-amber-500 font-medium">30-45 minutos</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Initial State Message */}
        {!selectedPlan && (
          <div className="text-center py-16">
            <Dumbbell className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Selecione um Plano de Treino</h3>
            <p className="text-zinc-400">Escolha uma das opções acima para ver os detalhes do treino</p>
          </div>
        )}

        {/* Footer Note */}
        <div className="text-center py-8">
          <p className="text-zinc-500 text-sm max-w-2xl mx-auto">
            Lembre-se de consultar um profissional de educação física antes de iniciar qualquer programa de exercícios. 
            Ajuste as cargas e intensidade de acordo com seu nível de condicionamento físico.
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}