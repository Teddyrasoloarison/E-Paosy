import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletService } from '../services/walletService';
import { useAuthStore } from '../store/useAuthStore';
// On importe le DTO depuis le fichier types maintenant
import { CreateWalletDto } from '../types/wallet';

export const useWallets = () => {
  const accountId = useAuthStore((state) => state.accountId);
  const queryClient = useQueryClient();

  // 1. La Query : Pour récupérer la liste (GET)
  const query = useQuery({
    queryKey: ['wallets', accountId],
    queryFn: () => walletService.getWallets(accountId!),
    enabled: !!accountId,
  });

  // 2. La Mutation : Pour créer un wallet (POST)
  const createMutation = useMutation({
    mutationFn: (newWallet: CreateWalletDto) => 
      walletService.createWallet(accountId!, newWallet),
    
    onSuccess: () => {
      // Rafraîchit la liste des wallets automatiquement
      queryClient.invalidateQueries({ queryKey: ['wallets', accountId] });
    },
  });

  return {
    ...query, // data, isLoading, error, refetch
    createWallet: createMutation.mutate,
    isCreating: createMutation.isPending,
    createError: createMutation.error,
    createSuccess: createMutation.isSuccess,
  };
};