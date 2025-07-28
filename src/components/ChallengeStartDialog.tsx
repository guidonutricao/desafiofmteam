import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Info } from "lucide-react";

interface ChallengeStartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  challengeStartDate: Date | null;
}

export function ChallengeStartDialog({ 
  open, 
  onOpenChange, 
  challengeStartDate 
}: ChallengeStartDialogProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/Sao_Paulo'
    });
  };

  const getTomorrowDate = () => {
    if (!challengeStartDate) return null;
    
    const tomorrow = new Date(challengeStartDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  };

  const tomorrowDate = getTomorrowDate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-600">
            <Info className="w-5 h-5" />
            Seu desafio começa amanhã!
          </DialogTitle>
          <DialogDescription className="space-y-4 pt-2">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-gray-700 mb-3">
                Você se registrou hoje e pode visualizar as tarefas, mas só poderá 
                marcar como concluídas a partir de <strong>amanhã</strong>.
              </p>
              
              {tomorrowDate && (
                <div className="flex items-center gap-2 text-blue-700">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">
                    Início oficial: {formatDate(tomorrowDate)}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                O que você pode fazer hoje:
              </h4>
              <ul className="text-sm text-gray-600 space-y-1 ml-6">
                <li>• Visualizar todas as tarefas do desafio</li>
                <li>• Se preparar mentalmente para começar</li>
                <li>• Planejar sua rotina para os próximos 7 dias</li>
                <li>• Conhecer o sistema de pontuação</li>
              </ul>
            </div>

            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>Lembre-se:</strong> Volte aqui amanhã para registrar seu progresso 
                a partir do primeiro dia oficial do desafio!
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-end pt-4">
          <Button 
            onClick={() => onOpenChange(false)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Entendi!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}