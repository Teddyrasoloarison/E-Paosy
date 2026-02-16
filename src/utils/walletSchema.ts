import { z } from 'zod';

export const walletSchema = z.object({
    name: z.string()
        .min(3, "Le nom doit contenir au moins 3 caractères")
        .max(20, "Le nom est trop long"),
    description: z.string()
        .max(50, "La description est trop longue")
        .optional()
        .or(z.literal('')),
    type: z.enum(['CASH', 'MOBILE_MONEY', 'BANK', 'DEBT'])
});

export type WalletFormData = z.infer<typeof walletSchema>;