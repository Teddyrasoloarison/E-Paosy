import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { goalService } from '../services/goalService';
import { useAuthStore } from '../store/useAuthStore';
import { CreateGoalDto, Goal } from '../types/goal';

export const useGoals = (filters?: { name?: string }) => {
  const accountId = useAuthStore((state) => state.accountId);
  const queryClient = useQueryClient();

  // Query : Récupérer les objectifs
  const query = useQuery({
    queryKey: ['goals', accountId, filters],
    queryFn: () => goalService.getGoals(accountId!, filters),
    enabled: !!accountId,
  });

  // Mutation : Créer
  const createMutation = useMutation({
    mutationFn: (newGoal: CreateGoalDto) => goalService.createGoal(accountId!, newGoal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', accountId] });
    },
  });

  // Mutation : Modifier
  const updateMutation = useMutation({
    mutationFn: ({ goalId, data }: { goalId: string; data: Goal }) =>
      goalService.updateGoal(accountId!, goalId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', accountId] });
    },
  });

  return {
    ...query,
    createGoal: createMutation.mutate,
    updateGoal: updateMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
};