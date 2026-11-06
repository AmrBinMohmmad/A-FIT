import { createContext, useCallback, useContext, useMemo, useState } from "react";

import { AlertDialog, type AlertButton } from "@/components/ui/AlertDialog";

interface AlertOptions {
  title: string;
  message?: string;
  buttons?: AlertButton[];
}

interface AlertContextValue {
  showAlert: (options: AlertOptions) => void;
  confirm: (options: {
    title: string;
    message?: string;
    confirmText: string;
    destructive?: boolean;
  }) => Promise<boolean>;
}

const AlertContext = createContext<AlertContextValue | null>(null);

/** Themed, RTL-correct replacement for Alert.alert; `confirm` resolves to the user's choice. */
export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = useState<AlertOptions | null>(null);

  const showAlert = useCallback((options: AlertOptions) => setCurrent(options), []);

  const confirm = useCallback<AlertContextValue["confirm"]>(
    ({ title, message, confirmText, destructive }) =>
      new Promise((resolve) => {
        setCurrent({
          title,
          message,
          buttons: [
            { text: "__cancel__", style: "cancel", onPress: () => resolve(false) },
            {
              text: confirmText,
              style: destructive ? "destructive" : "default",
              onPress: () => resolve(true),
            },
          ],
        });
      }),
    [],
  );

  const value = useMemo<AlertContextValue>(() => ({ showAlert, confirm }), [showAlert, confirm]);

  return (
    <AlertContext.Provider value={value}>
      {children}
      <AlertDialog
        visible={current !== null}
        title={current?.title ?? ""}
        message={current?.message}
        buttons={current?.buttons}
        onClose={() => setCurrent(null)}
      />
    </AlertContext.Provider>
  );
}

export function useAlert(): AlertContextValue {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error("useAlert must be used within an AlertProvider");
  return ctx;
}
