import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { labelService } from "../services/labelService";
import { useAuthStore } from "../store/useAuthStore";
import { LabelItem, LabelPayload } from "../types/label";

export const useLabels = () => {
  const accountId = useAuthStore((state) => state.accountId);
  const queryClient = useQueryClient();

  // 1. La Query : Récupérer les labels
  const query = useQuery({
    queryKey: ["labels", accountId],
    queryFn: () => labelService.getLabels(accountId!),
    enabled: !!accountId,
  });

  // 2. Mutation : Créer (POST)
  const createMutation = useMutation({
    mutationFn: (payload: LabelPayload) =>
      labelService.createLabel(accountId!, payload),
    onSuccess: (newLabel) => {
      // immediately add the created label to cache so the list updates instantly
      queryClient.setQueryData<{
        pagination: {
          totalPage: number;
          page: number;
          hasNext?: boolean;
          hasPrev?: boolean;
        };
        values: LabelItem[];
      }>(["labels", accountId], (old) => {
        if (!old) {
          return {
            pagination: { totalPage: 1, page: 1 },
            values: [newLabel],
          };
        }
        return {
          ...old,
          values: [newLabel, ...old.values],
        };
      });

      // still invalidate so that refetch ensures consistency with server
      if (accountId) {
        queryClient.invalidateQueries({ queryKey: ["labels", accountId] });
      }
    },
  });

  // 3. Mutation : Mettre à jour (PUT)
  const updateMutation = useMutation({
    mutationFn: ({ labelId, data }: { labelId: string; data: LabelPayload }) =>
      labelService.updateLabel(accountId!, labelId, data),
    onSuccess: (updatedLabel) => {
      // update cache entry for the modified label
      queryClient.setQueryData<{
        pagination: {
          totalPage: number;
          page: number;
          hasNext?: boolean;
          hasPrev?: boolean;
        };
        values: LabelItem[];
      }>(["labels", accountId], (old) => {
        if (!old) return old;
        return {
          ...old,
          values: old.values.map((l) =>
            l.id === updatedLabel.id ? updatedLabel : l,
          ),
        };
      });

      if (accountId) {
        queryClient.invalidateQueries({ queryKey: ["labels", accountId] });
      }
    },
  });

  // 4. Mutation : Archiver (POST /archive)
  const archiveMutation = useMutation({
    mutationFn: (labelId: string) =>
      labelService.archiveLabel(accountId!, labelId),
    onSuccess: () => {
      if (accountId) {
        queryClient.invalidateQueries({ queryKey: ["labels", accountId] });
      }
    },
  });

  return {
    ...query,
    // expose simplified list for components
    labels: query.data?.values || [],

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
