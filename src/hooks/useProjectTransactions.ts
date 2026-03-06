import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { projectService } from "../services/projectService";
import { useAuthStore } from "../store/useAuthStore";
import { CreateProjectTransactionDto, UpdateProjectTransactionDto } from "../types/project";

export const useProjectTransactions = (projectId: string) => {
  const accountId = useAuthStore((state) => state.accountId);
  const queryClient = useQueryClient();

  // Query: Get all project transactions
  const query = useQuery({
    queryKey: ["projectTransactions", accountId, projectId],
    queryFn: () => projectService.getProjectTransactions(accountId!, projectId),
    enabled: !!accountId && !!projectId,
  });

  // Mutation: Create a project transaction
  const createMutation = useMutation({
    mutationFn: (newTransaction: CreateProjectTransactionDto) =>
      projectService.createProjectTransaction(accountId!, projectId, newTransaction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectTransactions", accountId, projectId] });
      queryClient.invalidateQueries({ queryKey: ["projectStatistics", accountId, projectId] });
    },
  });

  // Mutation: Update a project transaction
  const updateMutation = useMutation({
    mutationFn: ({
      transactionId,
      data,
    }: {
      transactionId: string;
      data: UpdateProjectTransactionDto;
    }) => projectService.updateProjectTransaction(accountId!, projectId, transactionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectTransactions", accountId, projectId] });
      queryClient.invalidateQueries({ queryKey: ["projectStatistics", accountId, projectId] });
    },
  });

  // Mutation: Delete a project transaction
  const deleteMutation = useMutation({
    mutationFn: (transactionId: string) =>
      projectService.deleteProjectTransaction(accountId!, projectId, transactionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectTransactions", accountId, projectId] });
      queryClient.invalidateQueries({ queryKey: ["projectStatistics", accountId, projectId] });
    },
  });

  // Helper function to handle delete with callbacks
  const handleDelete = (transactionId: string, options?: {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
  }) => {
    deleteMutation.mutate(transactionId, {
      onSuccess: () => {
        options?.onSuccess?.();
      },
      onError: (error) => {
        options?.onError?.(error as Error);
      },
    });
  };

  return {
    ...query,
    // Données des transactions
    transactions: query.data || [],

    // Actions
    createTransaction: createMutation.mutate,
    updateTransaction: updateMutation.mutate,
    deleteTransaction: handleDelete,

    // États de chargement
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Erreurs
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
  };
};
