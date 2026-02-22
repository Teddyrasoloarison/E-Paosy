import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletService } from '../services/walletService';
import { useAuthStore } from '../store/useAuthStore';
import { CreateWalletDto, UpdateWalletDto, UpdateAutomaticIncomeDto } from '../types/wallet';

export const useWallets = () => {
  const accountId = useAuthStore((state) => state.accountId);
  const queryClient = useQueryClient();

  // 1. La Query : Pour récupérer la liste (GET)
  const query = useQuery({
    queryKey: ['wallets', accountId],
    queryFn: () => walletService.getWallets(accountId!),
    enabled: !!accountId,
  });

  // 2. Mutation : Créer un wallet (POST)
  const createMutation = useMutation({
    mutationFn: (newWallet: CreateWalletDto) => 
      walletService.createWallet(accountId!, newWallet),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets', accountId] });
    },
  });

  // 3. Mutation : Mettre à jour les infos de base (PUT /wallet/{id})
  const updateMutation = useMutation({
    mutationFn: ({ walletId, data }: { walletId: string; data: UpdateWalletDto }) =>
      walletService.updateWallet(accountId!, walletId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets', accountId] });
    },
  });

  // 4. Mutation : Revenu automatique (PUT /wallet/{id}/automaticIncome)
  const incomeMutation = useMutation({
    mutationFn: ({ walletId, data }: { walletId: string; data: UpdateAutomaticIncomeDto }) =>
      walletService.updateAutomaticIncome(accountId!, walletId, data),
    onSuccess: () => {
      // ✅ Invalidation automatique : l'UI se rafraîchit dès que le serveur répond OK
      queryClient.invalidateQueries({ queryKey: ['wallets', accountId] });
    },
  });

  return {
    ...query, // data, isLoading, error, refetch
    
    // Actions
    createWallet: createMutation.mutate,
    updateWallet: updateMutation.mutate,
    updateIncome: incomeMutation.mutate,

    // États de chargement
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isUpdatingIncome: incomeMutation.isPending,
    
    // Erreurs
    createError: createMutation.error,
    updateError: updateMutation.error,
    incomeError: incomeMutation.error,
  };
};