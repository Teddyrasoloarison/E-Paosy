import { z } from 'zod';
import { TransactionType } from '../types/transaction';

export const transactionSchema = z.object({
  description: z.string().min(3, "La description est trop courte"),
  
  // ✅ Correction ici : on utilise z.coerce.number() 
  // Les options de message se placent souvent dans les validations suivantes
  amount: z.coerce
    .number()
    .positive("Le montant doit être supérieur à 0")
    .or(z.nan().transform(() => 0)), // Gère le cas où l'input est vide ou invalide

  type: z.enum(['IN', 'OUT'] as const),
  date: z.string().or(z.date()),
  walletId: z.string().uuid("Sélectionnez un portefeuille valide"),
  labels: z.array(z.string()).min(1, "Sélectionnez au moins un label"),
});

export type TransactionFormData = {
  description: string;
  amount: number;
  type: TransactionType;
  date: string | Date;
  walletId: string;
  labels: string[];
};