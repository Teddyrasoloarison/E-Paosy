import { useCallback } from "react";
import { LabelItem } from "../types/label";
import { useLabels } from "./useLabels";

export const useLabelNameValidation = (currentLabelId?: string) => {
  const { labels } = useLabels();

  const isNameTaken = useCallback(
    (name: string): string | null => {
      if (!name.trim()) return null;

      const normalizedName = name.trim().toLowerCase();
      const existing = labels.find((label: LabelItem) => {
        if (currentLabelId && label.id === currentLabelId) return false;
        return label.name.toLowerCase() === normalizedName;
      });

      if (existing) {
        return currentLabelId
          ? "Ce nom de label est déjà utilisé"
          : "Ce label existe déjà, vous ne pouvez pas le recréer";
      }

      return null;
    },
    [labels, currentLabelId],
  );

  return { isNameTaken };
};
