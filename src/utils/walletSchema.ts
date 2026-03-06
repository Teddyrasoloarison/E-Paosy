import { z } from 'zod';

/**
 * Schéma pour la création et la mise à jour globale du Wallet
 * (POST /account/{id}/wallet et PUT /account/{id}/wallet/{id})
 */
export const walletSchema = z.object({
  name: z.string()
    .min(3, "Le nom doit contenir au moins 3 caractères")
    .max(20, "Le nom est trop long"),
  description: z.string()
    .max(50, "La description est trop longue")
    .optional()
    .or(z.literal('')),
  type: z.enum(['CASH', 'MOBILE_MONEY', 'BANK', 'DEBT']),
  color: z.string().startsWith("#", "Couleur invalide").optional(),
  iconRef: z.string().min(1, "L'icône est requise").optional(),
  isActive: z.boolean().optional(),
  walletAutomaticIncome: z.object({
    type: z.enum(['NOT_SPECIFIED', 'DAILY', 'MONTHLY', 'YEARLY']),
    amount: z.union([z.literal(''), z.coerce.number()])
      .optional(),
    paymentDay: z.coerce.number()
      .min(1, "Le jour doit être au moins 1")
      .max(31, "Le jour ne peut pas dépasser 31")
      .optional(),
  }).optional(),
});

/**
 * Schéma pour le revenu automatique (versión simplifiée pour兼容性)
 */
export const automaticIncomeSchema = z.object({
  type: z.enum(['NOT_SPECIFIED', 'DAILY', 'MONTHLY', 'YEARLY']),
  amount: z.union([z.literal(''), z.coerce.number()])
    .optional(),
  paymentDay: z.coerce.number()
    .min(1, "Le jour doit être au moins 1")
    .max(31, "Le jour ne peut pas dépasser 31"),
});

// Génération des types TypeScript à partir des schémas
export type WalletFormData = z.infer<typeof walletSchema>;
export type AutomaticIncomeFormData = z.infer<typeof automaticIncomeSchema>;
