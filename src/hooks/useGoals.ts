import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { goalService } from '../services/goalService';
import { useAuthStore } from '../store/useAuthStore';
import { GoalFilters, GoalPayload } from '../types/goal';

export const useGoals = (filters?: GoalFilters) => {
  const accountId = useAuthStore((state) => state.accountId);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['goals', accountId, filters],
    queryFn: () => goalService.getGoals(accountId!, filters),
    enabled: !!accountId,
  });

  const createMutation = useMutation({
    mutationFn: ({ walletId, data }: { walletId: string; data: GoalPayload }) =>
      goalService.createGoal(accountId!, walletId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', accountId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ walletId, goalId, data }: { walletId: string; goalId: string; data: GoalPayload }) =>
      goalService.updateGoal(accountId!, walletId, goalId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', accountId] });
    },
  });

  return {
    ...query,
    goals: query.data?.values || [],
    createGoal: createMutation.mutate,
    updateGoal: updateMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
};