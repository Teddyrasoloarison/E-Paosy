import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { transactionService } from "../services/transactionService";
import { useAuthStore } from "../store/useAuthStore";
import { TransactionFilters, TransactionPayload } from "../types/transaction";

export const useTransactions = (filters?: TransactionFilters) => {
  const accountId = useAuthStore((state) => state.accountId);
  const queryClient = useQueryClient();

  // 1. Récupération des transactions
  const query = useQuery({
    queryKey: ["transactions", accountId, filters],
    queryFn: () => transactionService.getTransactions(accountId!, filters),
    enabled: !!accountId,
  });

  // Fonction utilitaire pour rafraîchir toutes les données liées aux finances
  const refreshAllData = () => {
    // Invalide les transactions (peu importe les filtres appliqués)
    queryClient.invalidateQueries({
      queryKey: ["transactions"],
      exact: false,
    });
    // Invalide les portefeuilles pour mettre à jour les soldes (balance)
    queryClient.invalidateQueries({
      queryKey: ["wallets"],
      exact: false,
    });
  };

  // 2. Création d'une transaction
  const createMutation = useMutation({
    mutationFn: ({
      walletId,
      data,
    }: {
      walletId: string;
      data: TransactionPayload;
    }) => transactionService.createTransaction(accountId!, walletId, data),
    onSuccess: () => {
      console.log("Transaction créée avec succès, rafraîchissement...");
      refreshAllData();
    },
  });

  // 3. Mise à jour d'une transaction
  const updateMutation = useMutation({
    mutationFn: ({
      walletId,
      transactionId,
      data,
    }: {
      walletId: string;
      transactionId: string;
      data: TransactionPayload;
    }) => {
      // Log payload for debugging and ensure type normalization at hook level
      const normalizedData = {
        ...data,
        type:
          String(data.type || "")
            .trim()
            .toUpperCase() === "IN"
            ? "IN"
            : "OUT",
      } as TransactionPayload;
      console.log(
        "useTransactions.updateMutation -> calling updateTransaction with:",
        { walletId, transactionId, data: normalizedData },
      );
      return transactionService.updateTransaction(
        accountId!,
        walletId,
        transactionId,
        normalizedData,
      );
    },
    onSuccess: () => {
      console.log("Transaction mise à jour, rafraîchissement...");
      refreshAllData();
    },
  });

  // 4. Suppression d'une transaction
  const deleteMutation = useMutation({
    mutationFn: ({
      walletId,
      transactionId,
    }: {
      walletId: string;
      transactionId: string;
    }) =>
      transactionService.deleteTransaction(accountId!, walletId, transactionId),
    onSuccess: () => {
      console.log("Transaction supprimée, rafraîchissement...");
      refreshAllData();
    },
  });

  return {
    ...query,
    transactions: query.data ?? [],
    createTransaction: createMutation.mutate,
    updateTransaction: updateMutation.mutate,
    deleteTransaction: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    // Permet de forcer un rafraîchissement manuel si besoin (ex: pull-to-refresh)
    refetchTransactions: query.refetch,
  };
};
