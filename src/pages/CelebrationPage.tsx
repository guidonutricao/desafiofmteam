import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Navigate } from 'react-router-dom';

import { Confetti } from '@/components/Confetti';
import { EvolutionCard } from '@/components/EvolutionCard';

import { SocialSharing } from '@/components/SocialSharing';
import { CelebrationErrorBoundary } from '@/components/CelebrationErrorBoundary';
import { Trophy, Heart, Loader2, AlertCircle, RefreshCw, Wifi, WifiOff, LogOut } from 'lucide-react';
import { useCelebrationData, type ChallengeData } from '@/hooks/useCelebrationData';
import { useAuth } from '@/hooks/use-auth';
import { useChallengeStatus } from '@/hooks/useChallengeStatus';
import { updateSocialMetaTags, generateCelebrationMetaTags, addStructuredData, cleanupSocialMetaTags } from '@/lib/socialMetaTags';
import { announceToScreenReader, manageFocus } from '@/lib/accessibilityUtils';

interface CelebrationPageProps {
  challengeData?: ChallengeData;
  onShare?: () => void;
  onCTAClick?: () => void;
}

function CelebrationPageContent({ 
  challengeData, 
  onShare, 
  onCTAClick 
}: CelebrationPageProps) {
  const { user, loading: authLoading, signOut } = useAuth();
  const { isCompleted, loading: challengeLoading } = useChallengeStatus();
  const { 
    data: fetchedData, 
    loading: dataLoading, 
    error, 
    refresh, 
    retryCount, 
    isRetrying 
  } = useCelebrationData();
  const [animationStage, setAnimationStage] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const skipLinkRef = useRef<HTMLAnchorElement>(null);

  // Use provided challengeData or fetched data
  const data = challengeData || fetchedData;
  
  // Combined loading state
  const loading = authLoading || challengeLoading || dataLoading;

  // Redirect to login if not authenticated
  if (!authLoading && !user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to challenge page if challenge is not completed
  if (!challengeLoading && !isCompleted && !challengeData) {
    return <Navigate to="/desafio-diario" replace />;
  }

  // Trigger staggered animations on mount and update meta tags
  useEffect(() => {
    const intervals = [300, 600, 900, 1200, 1500];
    const timeoutIds = intervals.map((delay, index) => 
      setTimeout(() => setAnimationStage(index + 1), delay)
    );

    // Update social media meta tags and structured data when data is available
    if (data) {
      const metaTags = generateCelebrationMetaTags(data);
      updateSocialMetaTags(metaTags);
      addStructuredData(data);
    }

    // Focus management and announcements for screen readers
    if (data && mainContentRef.current) {
      // Announce page load to screen readers
      const announcement = announceToScreenReader(
        `Página de celebração carregada. Parabéns, ${data.patientName}, você completou o desafio de 7 dias com ${data.totalScore} pontos!`
      );
      
      // Cleanup function
      return () => {
        timeoutIds.forEach(clearTimeout);
        if (document.body.contains(announcement)) {
          document.body.removeChild(announcement);
        }
        // Clean up social meta tags when component unmounts
        cleanupSocialMetaTags();
      };
    } else {
      // Cleanup function for when there's no data
      return () => {
        timeoutIds.forEach(clearTimeout);
        // Clean up social meta tags when component unmounts
        cleanupSocialMetaTags();
      };
    }
  }, [data]);

  // Handle skip link navigation
  const handleSkipToMain = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    manageFocus(mainContentRef.current);
  };

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-retry if we were offline and had an error
      if (error && !loading) {
        refresh();
      }
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [error, loading, refresh]);

  // Keyboard navigation handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key to return focus to main content
      if (e.key === 'Escape' && mainContentRef.current) {
        mainContentRef.current.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);



  // Handle CTA click for lead generation
  const handleCTAClick = () => {
    if (!data) return;
    
    const message = encodeURIComponent(
      `Olá! Acabei de concluir o desafio de 7 dias da Shape Express e gostaria de conhecer o acompanhamento premium. Minha pontuação foi ${data.totalScore} pontos!`
    );
    const whatsappUrl = `https://wa.me/5511948464441?text=${message}`;
    window.open(whatsappUrl, '_blank');
    
    if (onCTAClick) onCTAClick();
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut();
      // The auth state change will automatically redirect to login
      // But we can also force it to be sure
      window.location.href = '/login';
    } catch (error) {
      console.error('Error during logout:', error);
      // Force redirect even if there's an error
      window.location.href = '/login';
    }
  };

  // Enhanced loading state with retry information
  if (loading) {
    return (
      <div 
        className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 flex items-center justify-center"
        role="main"
        aria-label="Carregando página de celebração"
      >
        <div className="text-center space-y-6 p-8 max-w-md mx-auto">
          {/* Network status indicator */}
          {!isOnline && (
            <div 
              className="flex items-center gap-2 p-3 bg-red-100 border border-red-200 rounded-lg text-sm text-red-700 mb-4"
              role="alert"
            >
              <WifiOff className="w-4 h-4" aria-hidden="true" />
              Sem conexão com a internet
            </div>
          )}

          <div 
            className="p-6 rounded-full bg-white/80 backdrop-blur-sm shadow-lg w-fit mx-auto"
            role="status"
            aria-label="Carregando"
          >
            <Loader2 className="w-12 h-12 animate-spin text-amber-600" aria-hidden="true" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">
              {authLoading ? 'Verificando autenticação...' : 
               challengeLoading ? 'Verificando status do desafio...' : 
               isRetrying ? `Tentativa ${retryCount}...` :
               'Preparando sua celebração...'}
            </h1>
            <p className="text-gray-600">
              {authLoading ? 'Validando suas credenciais...' :
               challengeLoading ? 'Verificando se você completou o desafio...' :
               isRetrying ? 'Tentando novamente carregar seus dados...' :
               'Estamos carregando todos os seus dados do desafio para criar uma experiência especial!'}
            </p>
            
            {/* Retry progress indicator */}
            {retryCount > 0 && (
              <div className="flex items-center gap-2 text-sm text-amber-600 mt-3">
                <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Tentativa {retryCount} de 3</span>
              </div>
            )}
          </div>
        </div>
        
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {authLoading ? 'Verificando autenticação' :
           challengeLoading ? 'Verificando status do desafio' :
           isRetrying ? `Tentativa ${retryCount} de carregar dados` :
           'Carregando dados do desafio'}, aguarde por favor.
        </div>
      </div>
    );
  }

  // Enhanced error state with network awareness and retry information
  if (error) {
    const isAuthError = error.includes('JWT') || error.includes('Sessão expirada') || error.includes('token');
    const isNetworkError = error.includes('conexão') || error.includes('network') || error.includes('fetch');
    
    return (
      <div 
        className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 flex items-center justify-center"
        role="main"
        aria-label="Erro ao carregar página de celebração"
      >
        <div className="text-center space-y-6 p-8 max-w-md mx-auto">
          {/* Network status indicator */}
          {!isOnline && (
            <div 
              className="flex items-center gap-2 p-3 bg-red-100 border border-red-200 rounded-lg text-sm text-red-700 mb-4"
              role="alert"
            >
              <WifiOff className="w-4 h-4" aria-hidden="true" />
              Sem conexão com a internet
            </div>
          )}

          <div 
            className="p-6 rounded-full bg-red-100 w-fit mx-auto"
            role="img"
            aria-label="Ícone de erro"
          >
            <AlertCircle className="w-12 h-12 text-red-600" aria-hidden="true" />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {isAuthError ? 'Sessão Expirada' : 
               isNetworkError ? 'Erro de Conexão' :
               'Ops! Algo deu errado'}
            </h1>
            
            <div className="space-y-2">
              <p className="text-gray-600" role="alert" aria-live="polite">
                {error}
              </p>
              
              {/* Retry information */}
              {retryCount > 0 && !isAuthError && (
                <p className="text-sm text-gray-500">
                  Tentativas realizadas: {retryCount} de 3
                </p>
              )}
              
              {/* Network-specific help */}
              {isNetworkError && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                  <div className="flex items-center gap-2 mb-1">
                    <Wifi className="w-4 h-4" aria-hidden="true" />
                    <span className="font-medium">Dicas para resolver:</span>
                  </div>
                  <ul className="text-left space-y-1 text-xs">
                    <li>• Verifique sua conexão com a internet</li>
                    <li>• Tente conectar-se a uma rede Wi-Fi</li>
                    <li>• Aguarde alguns instantes e tente novamente</li>
                  </ul>
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {!isAuthError && (
                <Button 
                  onClick={refresh}
                  variant="outline"
                  className="gap-2"
                  disabled={!isOnline && isNetworkError}
                  aria-label="Tentar carregar a página novamente"
                >
                  <RefreshCw className="w-4 h-4" aria-hidden="true" />
                  {!isOnline && isNetworkError ? 'Aguardando conexão...' : 'Tentar novamente'}
                </Button>
              )}
              
              {isAuthError && (
                <Button 
                  onClick={() => window.location.href = '/login'}
                  variant="default"
                  className="gap-2"
                  aria-label="Ir para página de login"
                >
                  Fazer Login
                </Button>
              )}
              
              <Button 
                onClick={() => window.location.href = '/desafio-diario'}
                variant="outline"
                className="gap-2"
                aria-label="Voltar para página do desafio"
              >
                <Trophy className="w-4 h-4" aria-hidden="true" />
                Ir para Desafio
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No data state - only show if user is authenticated and challenge is completed but no data
  if (!data && user && isCompleted) {
    return (
      <div 
        className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 flex items-center justify-center"
        role="main"
        aria-label="Nenhum dado de desafio encontrado"
      >
        <div className="text-center space-y-6 p-8 max-w-md mx-auto">
          <div 
            className="p-6 rounded-full bg-gray-100 w-fit mx-auto"
            role="img"
            aria-label="Ícone de troféu"
          >
            <Trophy className="w-12 h-12 text-gray-400" aria-hidden="true" />
          </div>
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">Nenhum dado encontrado</h1>
            <p className="text-gray-600">
              Não encontramos dados do seu desafio. Complete algumas atividades primeiro!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={refresh}
                variant="outline"
                className="gap-2"
                aria-label="Recarregar dados do desafio"
              >
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                Recarregar
              </Button>
              <Button 
                onClick={() => window.location.href = '/desafio-diario'}
                variant="default"
                className="gap-2"
                aria-label="Ir para página do desafio diário"
              >
                Ir para Desafio
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Validate data structure before rendering
  if (data && (!data.patientName || !data.dailyScores || !Array.isArray(data.dailyScores))) {
    console.error('Invalid data structure:', data);
    return (
      <div 
        className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 flex items-center justify-center"
        role="main"
        aria-label="Dados inválidos"
      >
        <div className="text-center space-y-6 p-8 max-w-md mx-auto">
          <div 
            className="p-6 rounded-full bg-yellow-100 w-fit mx-auto"
            role="img"
            aria-label="Ícone de aviso"
          >
            <AlertCircle className="w-12 h-12 text-yellow-600" aria-hidden="true" />
          </div>
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">Dados Inconsistentes</h1>
            <p className="text-gray-600">
              Os dados do seu desafio estão em um formato inesperado. Vamos tentar recarregar.
            </p>
            <Button 
              onClick={refresh}
              variant="outline"
              className="gap-2"
              aria-label="Recarregar dados do desafio"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              Recarregar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Only render if we have valid data
  if (!data) {
    return null;
  }

  return (
    <div className="min-h-screen bg-celebration-gradient-animated relative overflow-hidden gpu-accelerated">
      {/* Skip to main content link for keyboard users */}
      <a
        ref={skipLinkRef}
        href="#main-content"
        onClick={handleSkipToMain}
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-amber-600 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
      >
        Pular para o conteúdo principal
      </a>

      {/* Logout Button - Top Right Corner */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50">
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="bg-white/90 backdrop-blur-sm border-amber-200/50 hover:bg-white hover:border-amber-300 text-gray-700 hover:text-gray-900 shadow-xl hover:shadow-2xl transition-all duration-300 gap-2 rounded-full px-3 py-2 sm:px-4 sm:py-2"
          aria-label="Sair da conta e voltar para login"
        >
          <LogOut className="w-4 h-4" aria-hidden="true" />
          <span className="hidden sm:inline text-sm font-medium">Sair</span>
        </Button>
      </div>

      {/* Confetti Animation Background */}
      <Confetti aria-hidden="true" />
      
      {/* Main Content Container - Mobile-first responsive design */}
      <main 
        ref={mainContentRef}
        id="main-content"
        className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 space-y-6 sm:space-y-8 lg:space-y-12"
        role="main"
        aria-label={`Página de celebração do desafio concluído por ${data.patientName}`}
        tabIndex={-1}
      >
        
        {/* Hero Section - Mobile-first responsive design */}
        <header 
          className={`text-center space-y-4 sm:space-y-6 lg:space-y-8 transition-all duration-1000 gpu-accelerated ${
            animationStage >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          aria-labelledby="celebration-title"
        >
          {/* Completion Badge */}
          <div className="flex justify-center animate-slide-up-staggered animate-delay-100">
            <div 
              className="inline-flex items-center gap-2 sm:gap-3 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 sm:px-6 sm:py-3 lg:px-8 lg:py-4 shadow-xl border border-amber-200/50 animate-pulse-glow gpu-accelerated"
              role="img"
              aria-label="Badge de desafio concluído"
            >
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-amber-600 animate-scale-bounce" aria-hidden="true" />
              <span className="text-sm sm:text-lg lg:text-xl font-bold text-amber-800 tracking-wide">
                DESAFIO CONCLUÍDO
              </span>
            </div>
          </div>
          
          {/* Main Title - Responsive typography */}
          <div className="space-y-3 sm:space-y-4 lg:space-y-6 animate-slide-up-staggered animate-delay-200">
            <h1 
              id="celebration-title"
              className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-gray-900 leading-tight tracking-tight"
            >
              Desafio Shape Express - Concluído
            </h1>
            <div className="relative">
              <div 
                className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 leading-tight tracking-tight"
                aria-label={`Mensagem de parabéns para ${data.patientName}`}
              >
                Parabéns, {data.patientName}!
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg blur opacity-20 animate-pulse-glow" aria-hidden="true"></div>
              <div className="absolute -inset-2 bg-gradient-to-r from-amber-300/10 to-orange-300/10 rounded-lg blur-xl animate-glow" aria-hidden="true"></div>
            </div>
          </div>
          
          {/* Challenge Summary - Mobile-optimized spacing and typography */}
          <section 
            className="max-w-4xl mx-auto space-y-4 sm:space-y-6 animate-slide-up-staggered animate-delay-300"
            aria-labelledby="challenge-summary"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-amber-100/50 animate-card-hover gpu-accelerated">
              <p 
                id="challenge-summary"
                className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-800 font-semibold leading-relaxed mb-4 sm:mb-6"
              >
                Você completou com sucesso o Desafio Shape Express de{' '}
                <span 
                  className="inline-flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-amber-100 to-orange-100 px-2 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 rounded-full text-amber-800 font-bold text-sm sm:text-base lg:text-lg"
                  role="img"
                  aria-label={`${data.challengeDuration} dias de duração`}
                >
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" aria-hidden="true" />
                  7 dias
                </span>
                ! Continue mantendo esses hábitos saudáveis em sua rotina.
              </p>
              
              {/* Total Score Display - Mobile-optimized */}
              <div className="relative animate-slide-up-staggered animate-delay-400">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-center shadow-xl gpu-accelerated"
                  role="region"
                  aria-labelledby="total-score"
                >
                  <div className="text-white space-y-1 sm:space-y-2">
                    <div 
                      className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight animate-scale-bounce"
                      aria-label={`${data.totalScore} pontos totais`}
                    >
                      {data.totalScore}
                    </div>
                    <p className="text-sm sm:text-base lg:text-lg font-medium opacity-90">
                      pontos totais
                    </p>
                  </div>
                  
                  {/* Enhanced glow effects */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-400 rounded-xl sm:rounded-2xl blur-xl opacity-30 animate-pulse-glow" aria-hidden="true"></div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-amber-300/20 to-orange-300/20 rounded-xl sm:rounded-2xl blur-2xl animate-glow" aria-hidden="true"></div>
                </div>
              </div>
            </div>
            
            {/* Motivational Blocks - New section with target content */}
            <div 
              className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-8 animate-slide-up-staggered animate-delay-500"
              role="region"
              aria-label="Blocos motivacionais"
            >
              {/* Motivação Diária Block */}
              <div className="relative bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl border border-blue-100/50 animate-card-hover gpu-accelerated">
                <div className="relative z-10 text-center space-y-3 sm:space-y-4">
                  <div className="text-3xl sm:text-4xl mb-2" aria-hidden="true">💪</div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                    Motivação Diária
                  </h3>
                  <p className="text-base sm:text-lg text-gray-700 font-medium leading-relaxed">
                    "Você não precisa ser extremo, apenas consistente."
                  </p>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-xl sm:rounded-2xl blur opacity-30 animate-pulse-glow" aria-hidden="true"></div>
              </div>

              {/* Mais Energia Block */}
              <div className="relative bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl border border-green-100/50 animate-card-hover gpu-accelerated">
                <div className="relative z-10 text-center space-y-3 sm:space-y-4">
                  <div className="text-3xl sm:text-4xl mb-2" aria-hidden="true">⚡</div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                    Mais Energia
                  </h3>
                  <p className="text-base sm:text-lg text-gray-700 font-medium leading-relaxed">
                    "Aumente seus níveis de energia e disposição com hábitos saudáveis consistentes."
                  </p>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-xl sm:rounded-2xl blur opacity-30 animate-pulse-glow" aria-hidden="true"></div>
              </div>
            </div>
          </section>
        </header>

        {/* EvolutionCard Component */}
        <section 
          className={`transition-all duration-1000 delay-600 gpu-accelerated ${
            animationStage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          aria-labelledby="evolution-section"
        >
          <EvolutionCard stats={data.stats} totalScore={data.totalScore} />
        </section>



        {/* Lead Generation CTA Section - Mobile-optimized */}
        <section 
          className={`transition-all duration-1000 delay-900 gpu-accelerated ${
            animationStage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          aria-labelledby="premium-offer"
        >
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 shadow-2xl border border-green-100/50 relative overflow-hidden animate-card-hover gpu-accelerated">
              {/* Background gradient effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 via-emerald-50/30 to-teal-50/50 rounded-2xl sm:rounded-3xl animate-diagonal-gradient" aria-hidden="true"></div>
              
              {/* Content */}
              <div className="relative z-10 text-center space-y-4 sm:space-y-6 lg:space-y-8">
                {/* Header */}
                <header className="space-y-2 sm:space-y-4">
                  <div 
                    className="inline-flex items-center gap-1 sm:gap-2 bg-green-100 text-green-800 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold"
                    role="img"
                    aria-label="Badge de oferta especial"
                  >
                    <Heart className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />
                    Oferta Especial
                  </div>
                  <h2 
                    id="premium-offer"
                    className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight px-2 sm:px-0"
                  >
                    Quer Resultados ainda melhores?
                  </h2>
                </header>
                
                {/* Promotion Copy */}
                <div className="space-y-4 sm:space-y-6">
                  <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 font-medium leading-relaxed max-w-3xl mx-auto px-2 sm:px-0">
                    Acompanhamento individual personalizado com{' '}
                    <span className="text-green-600 font-bold">Bônus especiais</span>{' '}
                    para os participantes do desafio!
                  </p>
                  
                  {/* Benefits list - Mobile-first responsive grid */}
                  <div 
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mt-4 sm:mt-6 lg:mt-8"
                    role="list"
                    aria-label="Benefícios do acompanhamento premium"
                  >
                    <div 
                      className="bg-white/80 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 shadow-lg border border-green-100"
                      role="listitem"
                    >
                      <div className="text-green-600 text-xl sm:text-2xl mb-2 sm:mb-3" aria-hidden="true">🎯</div>
                      <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Plano Personalizado</h3>
                      <p className="text-gray-600 text-xs sm:text-sm">Treinos e dieta adaptados ao seu perfil</p>
                    </div>
                    <div 
                      className="bg-white/80 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 shadow-lg border border-green-100"
                      role="listitem"
                    >
                      <div className="text-green-600 text-xl sm:text-2xl mb-2 sm:mb-3" aria-hidden="true">👨‍⚕️</div>
                      <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Acompanhamento 1:1</h3>
                      <p className="text-gray-600 text-xs sm:text-sm">Suporte direto com profissional</p>
                    </div>
                    <div 
                      className="bg-white/80 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 shadow-lg border border-green-100 sm:col-span-2 lg:col-span-1"
                      role="listitem"
                    >
                      <div className="text-green-600 text-xl sm:text-2xl mb-2 sm:mb-3" aria-hidden="true">🎁</div>
                      <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Bônus Exclusivos</h3>
                      <p className="text-gray-600 text-xs sm:text-sm">Benefícios especiais para você</p>
                    </div>
                  </div>
                </div>
                
                {/* CTA Button - Mobile-optimized sizing */}
                <div className="pt-2 sm:pt-4">
                  <Button
                    variant="cta"
                    size="lg"
                    onClick={handleCTAClick}
                    className="w-full sm:w-auto text-sm sm:text-base lg:text-lg px-6 py-3 sm:px-8 sm:py-4 lg:px-12 lg:py-6 h-auto font-bold shadow-2xl hover:shadow-green-500/25 hover:scale-105 transition-all duration-300 relative group gpu-accelerated animate-slide-up-staggered animate-delay-300"
                    aria-label="Conhecer acompanhamento premium - abre conversa no WhatsApp"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-md blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300 animate-glow" aria-hidden="true"></div>
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 animate-scale-bounce" aria-hidden="true" />
                    <span className="hidden sm:inline">Conhecer Acompanhamento Premium</span>
                    <span className="sm:hidden">Acompanhamento Premium</span>
                  </Button>
                  
                  <p className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-4 px-2 sm:px-0">
                    Clique para conversar no WhatsApp • Sem compromisso
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Sharing Section - Mobile-optimized button stacking */}
        <section 
          className={`flex justify-center transition-all duration-1000 delay-1200 gpu-accelerated ${
            animationStage >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          aria-labelledby="social-sharing"
        >
          <SocialSharing
            challengeData={data}
            onShare={onShare}
            className="w-full sm:w-auto max-w-sm sm:max-w-none animate-slide-up-staggered animate-delay-400"
          />
        </section>
      </main>
    </div>
  );
}

// Main component wrapped with error boundary
export default function CelebrationPage(props: CelebrationPageProps) {
  return (
    <CelebrationErrorBoundary
      onError={(error, errorInfo) => {
        console.error('CelebrationPage Error:', error, errorInfo);
        // In production, you might want to send this to an error reporting service
      }}
      onRetry={() => {
        // Force a page refresh as a last resort
        window.location.reload();
      }}
    >
      <CelebrationPageContent {...props} />
    </CelebrationErrorBoundary>
  );
}