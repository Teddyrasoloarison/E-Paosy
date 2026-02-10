import { z } from 'zod';

export const authSchema = z.object({
  username: z.string()
    .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères"),
  password: z.string()
    .min(4, "Le mot de passe doit contenir au moins 4 caractères"),
});

export type AuthFormData = z.infer<typeof authSchema>;