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
        return { values: [], pagination: { totalPage: 0, page: 1, hasNext: false, hasPrev: false } };
      }
      const result = await goalService.getGoals(accountId, filters);
      
      // Handle case where API returns array directly
      if (Array.isArray(result)) {
        return { 
          values: result, 
          pagination: { totalPage: 1, page: 1, hasNext: false, hasPrev: false } 
        };
      }
      
      if (!result || typeof result !== 'object') {
        return { values: [], pagination: { totalPage: 0, page: 1, hasNext: false, hasPrev: false } };
      }
      
      return {
        values: result.values || [],
        pagination: result.pagination || { totalPage: 0, page: 1, hasNext: false, hasPrev: false }
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

  // Calculate total goals from pagination
  const totalGoals = query.data?.pagination 
    ? query.data.pagination.totalPage * (filters?.pageSize || 5)
    : 0;

  return {
    ...query,
    goals: query.data?.values || [],
    totalGoals: query.data?.pagination?.totalPage || 0,
    createGoal: createMutation.mutate,
    updateGoal: updateMutation.mutate,
    archiveGoal: archiveMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isArchiving: archiveMutation.isPending,
  };
};
