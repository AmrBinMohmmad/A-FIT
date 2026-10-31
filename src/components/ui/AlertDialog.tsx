import { useTranslation } from "react-i18next";
import { Modal, Pressable, View } from "react-native";

import { Button } from "@/components/Button";
import { RText } from "@/components/RText";
import { makeStyles } from "@/hooks/useStyles";

export interface AlertButton {
  text: string;
  style?: "default" | "cancel" | "destructive";
  onPress?: () => void;
}

interface AlertDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: AlertButton[];
  onClose: () => void;
}

const useStyles = makeStyles((theme) => ({
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.xl,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: theme.colors.elevated,
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.xl,
    gap: theme.spacing.sm,
    ...theme.shadows.md,
  },
  buttons: { flexDirection: "row", gap: theme.spacing.sm, marginTop: theme.spacing.lg },
  button: { flex: 1 },
}));

/** Themed confirmation dialog. The sentinel "__cancel__" text renders the localized Cancel. */
export function AlertDialog({ visible, title, message, buttons = [], onClose }: AlertDialogProps) {
  const styles = useStyles();
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={styles.overlay}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel={t("common.close")}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()} accessibilityRole="none">
          <RText variant="subtitle">{title}</RText>
          {message ? (
            <RText variant="body" color="textSecondary">
              {message}
            </RText>
          ) : null}
          <View style={styles.buttons}>
            {(buttons.length ? buttons : [{ text: t("common.ok"), style: "default" as const }]).map(
              (btn, index) => (
                <Button
                  key={index}
                  style={styles.button}
                  variant={
                    btn.style === "destructive" ? "danger" : btn.style === "cancel" ? "secondary" : "primary"
                  }
                  title={btn.text === "__cancel__" ? t("common.cancel") : btn.text}
                  onPress={() => {
                    onClose();
                    btn.onPress?.();
                  }}
                />
              ),
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
