import { useCallback } from "react";
import { ModernAlertOptions, getModernAlertHandler } from "../components/ModernAlert";


export function useModernAlert() {
  const show = useCallback((options: ModernAlertOptions) => {
    const handler = getModernAlertHandler();
    if (handler) {
      handler.show(options);
    }
  }, []);

  const alert = useCallback(
    (
      title: string,
      message?: string,
      type: "info" | "success" | "error" | "warning" = "info",
    ) => {
      show({
        title,
        message,
        type,
        buttons: [{ text: "OK", style: "default" }],
      });
    },
    [show],
  );

  const confirm = useCallback(
    (
      title: string,
      message: string,
      onConfirm?: () => void,
      onCancel?: () => void,
    ) => {
      show({
        title,
        message,
        type: "confirm",
        buttons: [
          { text: "Annuler", style: "cancel", onPress: onCancel },
          { text: "Confirmer", style: "default", onPress: onConfirm },
        ],
      });
    },
    [show],
  );

  const success = useCallback(
    (title: string, message?: string) => {
      alert(title, message, "success");
    },
    [alert],
  );

  const error = useCallback(
    (title: string, message?: string) => {
      alert(title, message, "error");
    },
    [alert],
  );

  const warning = useCallback(
    (title: string, message?: string) => {
      alert(title, message, "warning");
    },
    [alert],
  );

  return { show, alert, confirm, success, error, warning };
}
