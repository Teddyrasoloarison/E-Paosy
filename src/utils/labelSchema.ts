import { z } from 'zod';

export const labelSchema = z.object({
  name: z.string().min(1, "Le nom est obligatoire").max(20, "Nom trop long"),
  color: z.string().startsWith("#", "Couleur invalide"),
});

export type LabelFormData = z.infer<typeof labelSchema>;