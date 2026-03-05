import { z } from 'zod';

export const goalSchema = z.object({
  name: z.string().min(3, "Nom trop court").max(30, "Nom trop long"),
  amount: z.coerce.number().min(1, "Le montant doit être supérieur à 0"),
  walletId: z.string().uuid("Veuillez sélectionner un portefeuille"),
  startingDate: z.string().min(1, "Date de début requise"),
  endingDate: z.string().min(1, "Date de fin requise"),
});

export type GoalFormData = z.infer<typeof goalSchema>;