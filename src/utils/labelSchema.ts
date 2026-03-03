import { z } from 'zod';

export const labelSchema = z.object({
  name: z.string().min(1, "Le nom est obligatoire").max(20, "Nom trop long"),
  color: z.string().startsWith("#", "Couleur invalide"),
  iconRef: z.string().optional(),
});

export type LabelFormData = z.infer<typeof labelSchema>;

// Available icons for labels
export const LABEL_ICONS = [
  'airplane',
  'bag-handle',
  'bandage',
  'balloon',
  'basketball',
  'beer',
  'brush',
  'build',
  'bicycle',
  'bus',
  'bulb',
  'car-sport',
  'camera',
  'call',
  'card',
  'boat',
  'chatbubbles',
  'dice',
  'game-controller',
  'restaurant',
  'flash',
  'gift',
  'home',
  'paw',
  'phone-portrait',
  'pulse',
  'school',
  'shirt',
  'ticket',
];

// Colors for labels
export const LABEL_COLORS = [
  '#0D9488', '#2878d3', '#C62828', '#F9A825', '#6A1B9A', '#ff7b00', '#092d7a', '#06553c'
];
