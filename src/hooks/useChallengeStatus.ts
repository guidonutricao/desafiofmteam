import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

export interface ChallengeStatus {
  hasStarted: boolean;
  canCompleteTasks: boolean;
  challengeStartDate: Date | null;
  challengeCompletedAt: Date | null;
  daysSinceStart: number;
  currentChallengeDay: number;
  isCompleted: boolean;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useChallengeStatus(): ChallengeStatus {
  const { user } = useAuth();
  const [status, setStatus] = useState<Omit<ChallengeStatus, 'refresh'>>({
    hasStarted: false,
    canCompleteTasks: false,
    challengeStartDate: null,
    challengeCompletedAt: null,
    daysSinceStart: 0,
    currentChallengeDay: 0,
    isCompleted: false,
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!user) {
      setStatus(prev => ({ ...prev, loading: false }));
      return;
    }

    const fetchChallengeStatus = async () => {
      try {
        setStatus(prev => ({ ...prev, loading: true, error: null }));

        // Try to use the new RPC function first
        try {
          const { data, error } = await supabase
            .rpc('get_user_challenge_status', { user_id_param: user.id });

          if (error) {
            throw error;
          }

          if (data && data.length > 0) {
            const statusData = data[0];
            setStatus({
              hasStarted: statusData.has_started,
              canCompleteTasks: statusData.can_complete_tasks,
              challengeStartDate: statusData.challenge_start_date ? new Date(statusData.challenge_start_date) : null,
              challengeCompletedAt: statusData.challenge_completed_at ? new Date(statusData.challenge_completed_at) : null,
              daysSinceStart: statusData.days_since_start,
              currentChallengeDay: statusData.current_challenge_day,
              isCompleted: statusData.is_completed,
              loading: false,
              error: null
            });
            return;
          }
        } catch (rpcError) {
          console.log('RPC function not available, using fallback method');
        }

        // Fallback: Check if challenge columns exist in profiles table
        let profileData = null;
        let profileError = null;
        
        try {
          const result = await supabase
            .from('profiles')
            .select('challenge_start_date, challenge_completed_at')
            .eq('user_id', user.id)
            .single();
          
          profileData = result.data;
          profileError = result.error;
        } catch (error) {
          profileError = error;
        }

        if (profileError) {
          // If columns don't exist, check pontuacoes table as final fallback
          if (profileError.code === '42703') { // Column doesn't exist
            console.log('Challenge columns not found, checking pontuacoes table...');
            
            try {
              const { data: pontuacaoData, error: pontuacaoError } = await supabase
                .from('pontuacoes')
                .select('ultima_data_participacao, created_at, pontuacao_total')
                .eq('user_id', user.id)
                .single();

              if (pontuacaoError) {
                throw pontuacaoError;
              }

              // For users without challenge columns, use created_at as challenge start date
              // This ensures existing users are considered as having started the challenge
              const challengeStartDate = new Date(pontuacaoData.created_at);
              const hasStarted = true; // All existing users are considered as having started

              let canCompleteTasks = true;
              let daysSinceStart = 0;
              let currentChallengeDay = 0;
              
              if (challengeStartDate) {
                const now = new Date();
                const startDate = new Date(challengeStartDate);
                const diffTime = now.getTime() - startDate.getTime();
                daysSinceStart = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                
                // Challenge starts the day after registration
                canCompleteTasks = daysSinceStart > 0;
                currentChallengeDay = Math.max(0, Math.min(daysSinceStart, 7));
              }

              setStatus({
                hasStarted,
                canCompleteTasks,
                challengeStartDate,
                challengeCompletedAt: null,
                daysSinceStart,
                currentChallengeDay,
                isCompleted: daysSinceStart > 7,
                loading: false,
                error: null
              });
              return;
            } catch (pontuacaoError) {
              console.error('Error checking pontuacoes table:', pontuacaoError);
            }
            
            // Final fallback: assume user hasn't started challenge
            setStatus({
              hasStarted: false,
              canCompleteTasks: true, // Allow tasks until migration is applied
              challengeStartDate: null,
              challengeCompletedAt: null,
              daysSinceStart: 0,
              currentChallengeDay: 0,
              isCompleted: false,
              loading: false,
              error: null
            });
            return;
          }
          throw profileError;
        }

        // Calculate status based on profile data
        const hasStarted = !!profileData?.challenge_start_date;
        const challengeStartDate = profileData?.challenge_start_date ? new Date(profileData.challenge_start_date) : null;
        const challengeCompletedAt = profileData?.challenge_completed_at ? new Date(profileData.challenge_completed_at) : null;
        
        let canCompleteTasks = true;
        let daysSinceStart = 0;
        let currentChallengeDay = 0;
        
        if (challengeStartDate) {
          const now = new Date();
          const startDate = new Date(challengeStartDate);
          const diffTime = now.getTime() - startDate.getTime();
          daysSinceStart = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          
          // Challenge starts the day after registration
          canCompleteTasks = daysSinceStart > 0;
          currentChallengeDay = Math.max(0, Math.min(daysSinceStart, 7));
        }

        setStatus({
          hasStarted,
          canCompleteTasks,
          challengeStartDate,
          challengeCompletedAt,
          daysSinceStart,
          currentChallengeDay,
          isCompleted: !!challengeCompletedAt || daysSinceStart > 7,
          loading: false,
          error: null
        });

      } catch (error) {
        console.error('Error fetching challenge status:', error);
        setStatus(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Erro ao carregar status do desafio'
        }));
      }
    };

    fetchChallengeStatus();
  }, [user]);

  const refresh = async () => {
    if (user) {
      await fetchChallengeStatus();
    }
  };

  return {
    ...status,
    refresh
  };
}