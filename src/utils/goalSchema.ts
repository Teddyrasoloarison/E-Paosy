import { z } from 'zod';

export const goalSchema = z.object({
  name: z.string().min(3, "Le nom doit contenir au moins 3 caractères"),
  amount: z.coerce.number().positive("L'objectif doit être supérieur à 0"),
  walletId: z.string().uuid("Sélectionnez un portefeuille"),
  startingDate: z.string().or(z.date()),
  endingDate: z.string().or(z.date()),
  color: z.string().startsWith("#", "Couleur invalide"),
  iconRef: z.string().min(1, "L'icône est requise"),
});

export type GoalFormData = z.infer<typeof goalSchema>;