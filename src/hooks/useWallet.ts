// Fichier temporaire en attendant la fusion de la branche de ton ami
export const useWallets = () => {
  return {
    data: {
      values: [
        { id: '1', name: 'Portefeuille Principal' },
        { id: '2', name: 'Épargne' }
      ]
    },
    isLoading: false
  };
};