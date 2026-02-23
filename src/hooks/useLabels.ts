import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { labelService } from '../services/labelService';
import { useAuthStore } from '../store/useAuthStore';
import { LabelPayload } from '../types/label';

export const useLabels = () => {
  const accountId = useAuthStore((state) => state.accountId);
  const queryClient = useQueryClient();

  // 1. La Query : Récupérer les labels
  const query = useQuery({
    queryKey: ['labels', accountId],
    queryFn: () => labelService.getLabels(accountId!),
    enabled: !!accountId,
  });

  // 2. Mutation : Créer (POST)
  const createMutation = useMutation({
    mutationFn: (payload: LabelPayload) => labelService.createLabel(accountId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels', accountId] });
    },
  });

  // 3. Mutation : Mettre à jour (PUT)
  const updateMutation = useMutation({
    mutationFn: ({ labelId, data }: { labelId: string; data: LabelPayload }) =>
      labelService.updateLabel(accountId!, labelId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels', accountId] });
    },
  });

  // 4. Mutation : Archiver (POST /archive)
  const archiveMutation = useMutation({
    mutationFn: (labelId: string) => labelService.archiveLabel(accountId!, labelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels', accountId] });
    },
  });

  return {
    ...query,
    createLabel: createMutation.mutate,
    updateLabel: updateMutation.mutate,
    archiveLabel: archiveMutation.mutate,

    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isArchiving: archiveMutation.isPending,

    createError: createMutation.error,
    updateError: updateMutation.error,
    archiveError: archiveMutation.error,
  };
};