import { z } from 'zod';

/**
 * Schéma pour la création et la mise à jour du Projet
 * (POST /account/{id}/project et PUT /account/{id}/project/{id})
 */
export const projectSchema = z.object({
  name: z.string()
    .min(1, "Le nom est requis")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  description: z.string()
    .max(200, "La description est trop longue")
    .optional()
    .or(z.literal('')),
  initialBudget: z.number()
    .min(0, "Le budget initial doit être positif")
    .optional(),
  color: z.string().startsWith("#", "Couleur invalide").optional(),
  iconRef: z.string().min(1, "L'icône est requise").optional(),
});

// Génération des types TypeScript à partir des schémas
export type ProjectFormData = z.infer<typeof projectSchema>;
