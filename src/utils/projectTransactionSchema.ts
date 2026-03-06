import { z } from 'zod';

export const projectTransactionSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().optional(),
  estimatedCost: z.coerce
    .number()
    .min(0, "Le coût estimé doit être positif")
    .or(z.nan().transform(() => 0)),
  realCost: z.coerce
    .number()
    .min(0, "Le coût réel doit être positif")
    .optional()
    .or(z.nan().transform(() => 0)),
});

export type ProjectTransactionFormData = z.infer<typeof projectTransactionSchema>;
