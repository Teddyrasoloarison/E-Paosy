import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { goalService } from '../services/goalService';
import { useAuthStore } from '../store/useAuthStore';
import { GoalFilters, GoalPayload } from '../types/goal';

export const useGoals = (filters?: GoalFilters) => {
  const accountId = useAuthStore((state) => state.accountId);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['goals', accountId, filters],
    queryFn: async () => {
      if (!accountId) {
        return { values: [] };
      }
      const result = await goalService.getGoals(accountId, filters);
      
      // Handle case where API returns array directly
      if (Array.isArray(result)) {
        return { values: result };
      }
      
      if (!result || typeof result !== 'object') {
        return { values: [] };
      }
      
      return {
        values: result.values || [],
      };
    },
    enabled: !!accountId,
    staleTime: 0,
    refetchOnMount: true,
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

  const archiveMutation = useMutation({
    mutationFn: ({ walletId, goalId }: { walletId: string; goalId: string }) =>
      goalService.archiveGoal(accountId!, walletId, goalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', accountId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ walletId, goalId }: { walletId: string; goalId: string }) =>
      goalService.deleteGoal(accountId!, walletId, goalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', accountId] });
    },
  });

  return {
    ...query,
    goals: query.data?.values || [],
    totalGoals: query.data?.values?.length || 0,
    createGoal: createMutation.mutate,
    updateGoal: updateMutation.mutate,
    archiveGoal: archiveMutation.mutate,
    deleteGoal: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isArchiving: archiveMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

