import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionService } from '../services/transactionService';
import { useAuthStore } from '../store/useAuthStore';
import { TransactionFilters, TransactionPayload } from '../types/transaction';

export const useTransactions = (filters?: TransactionFilters) => {
  const accountId = useAuthStore((state) => state.accountId);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['transactions', accountId, filters],
    queryFn: () => transactionService.getTransactions(accountId!, filters),
    enabled: !!accountId,
  });

  const createMutation = useMutation({
    mutationFn: ({ walletId, data }: { walletId: string; data: TransactionPayload }) =>
      transactionService.createTransaction(accountId!, walletId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
  });

  // 🟢 AJOUT DE LA MUTATION UPDATE
  const updateMutation = useMutation({
    mutationFn: ({ walletId, transactionId, data }: { walletId: string; transactionId: string; data: TransactionPayload }) =>
      transactionService.updateTransaction(accountId!, walletId, transactionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ walletId, transactionId }: { walletId: string; transactionId: string }) =>
      transactionService.deleteTransaction(accountId!, walletId, transactionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
  });

  return {
    ...query,
    transactions: query.data ?? [],
    createTransaction: createMutation.mutate,
    updateTransaction: updateMutation.mutate, // 🟢 Exporté ici
    deleteTransaction: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,      // 🟢 Exporté ici
  };
};