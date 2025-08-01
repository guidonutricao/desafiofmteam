import React from 'react';
import { CelebrationImageGenerator } from '@/components/CelebrationImageGenerator';
import { type ChallengeData } from '@/hooks/useCelebrationData';

// Dados de exemplo para demonstração
const exampleChallengeData: ChallengeData = {
  patientName: 'Maria Silva',
  totalScore: 92,
  challengeDuration: 7,
  dailyScores: [
    { day: 1, score: 14, date: '2024-01-01' },
    { day: 2, score: 13, date: '2024-01-02' },
    { day: 3, score: 15, date: '2024-01-03' },
    { day: 4, score: 12, date: '2024-01-04' },
    { day: 5, score: 13, date: '2024-01-05' },
    { day: 6, score: 12, date: '2024-01-06' },
    { day: 7, score: 13, date: '2024-01-07' }
  ],
  stats: {
    completedDays: 7,
    averageScore: 13.1,
    bestDay: { day: 3, score: 15 },
    improvementTrend: 'improving' as const
  }
};

/**
 * Exemplo de uso do CelebrationImageGenerator
 * 
 * Este componente demonstra como integrar o gerador de imagem
 * de celebração em qualquer página da aplicação.
 */
export function CelebrationImageExample() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Exemplo: Gerador de Imagem de Celebração
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Demonstração da funcionalidade que permite aos usuários gerar e compartilhar 
            imagens personalizadas de suas conquistas no Desafio Shape Express.
          </p>
        </header>

        {/* Dados do Desafio */}
        <section className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Dados do Desafio (Exemplo)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informações Básicas */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800">Informações Básicas</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Nome:</strong> {exampleChallengeData.patientName}</p>
                <p><strong>Pontuação Total:</strong> {exampleChallengeData.totalScore} pontos</p>
                <p><strong>Duração:</strong> {exampleChallengeData.challengeDuration} dias</p>
                <p><strong>Dias Completados:</strong> {exampleChallengeData.stats.completedDays}/7</p>
              </div>
            </div>

            {/* Estatísticas */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800">Estatísticas</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Média Diária:</strong> {exampleChallengeData.stats.averageScore} pontos</p>
                <p><strong>Melhor Dia:</strong> Dia {exampleChallengeData.stats.bestDay.day} ({exampleChallengeData.stats.bestDay.score} pontos)</p>
                <p><strong>Tendência:</strong> {exampleChallengeData.stats.improvementTrend === 'improving' ? 'Melhorando' : 'Estável'}</p>
              </div>
            </div>
          </div>

          {/* Pontuações Diárias */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Pontuações Diárias</h3>
            <div className="grid grid-cols-7 gap-2">
              {exampleChallengeData.dailyScores.map((dayScore) => (
                <div 
                  key={dayScore.day}
                  className="bg-amber-100 rounded-lg p-3 text-center"
                >
                  <div className="text-xs text-gray-600">Dia {dayScore.day}</div>
                  <div className="text-lg font-bold text-amber-800">{dayScore.score}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Gerador de Imagem */}
        <section className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            Gerador de Imagem de Celebração
          </h2>
          
          <CelebrationImageGenerator 
            challengeData={exampleChallengeData}
            className="max-w-2xl mx-auto"
          />
        </section>

        {/* Instruções de Uso */}
        <section className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">
            Como Usar
          </h2>
          
          <div className="space-y-4 text-blue-800">
            <div className="flex items-start gap-3">
              <div className="bg-blue-200 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                1
              </div>
              <div>
                <h3 className="font-semibold">Clique em "Compartilhar"</h3>
                <p className="text-sm">
                  Gera a imagem e abre o menu de compartilhamento nativo do dispositivo (se disponível).
                  Ideal para compartilhar diretamente no WhatsApp, Instagram, Facebook, etc.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-blue-200 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                2
              </div>
              <div>
                <h3 className="font-semibold">Clique em "Baixar Imagem"</h3>
                <p className="text-sm">
                  Gera e baixa a imagem diretamente para o dispositivo. 
                  Útil para salvar a imagem e compartilhar posteriormente.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-blue-200 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                3
              </div>
              <div>
                <h3 className="font-semibold">Aguarde a Geração</h3>
                <p className="text-sm">
                  O processo leva alguns segundos. A imagem é criada em alta qualidade (1080x1080px) 
                  com todos os dados personalizados do usuário.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Especificações Técnicas */}
        <section className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Especificações Técnicas
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Formato da Imagem</h3>
              <ul className="space-y-1 text-gray-600">
                <li>• <strong>Resolução:</strong> 1080x1080 pixels</li>
                <li>• <strong>Formato:</strong> PNG</li>
                <li>• <strong>Qualidade:</strong> 90%</li>
                <li>• <strong>Tamanho:</strong> ~150-300KB</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Compatibilidade</h3>
              <ul className="space-y-1 text-gray-600">
                <li>• <strong>Navegadores:</strong> Chrome 60+, Firefox 55+, Safari 12+</li>
                <li>• <strong>Dispositivos:</strong> Desktop, Mobile, Tablet</li>
                <li>• <strong>Compartilhamento:</strong> Web Share API + Fallback</li>
                <li>• <strong>Acessibilidade:</strong> WCAG 2.1 AA</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-gray-600 text-sm">
          <p>
            Esta funcionalidade está integrada na página de celebração do Desafio Shape Express.
            <br />
            Para mais informações, consulte a documentação em <code>CELEBRATION_IMAGE_GENERATOR.md</code>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default CelebrationImageExample;