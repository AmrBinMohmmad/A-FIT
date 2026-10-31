import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable } from "react-native";

import { MIN_TOUCH_TARGET } from "@/constants/tokens";
import { useAlert } from "@/contexts/AlertContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/contexts/ToastContext";
import { useDeleteGroup, useLeaveGroup, useRotateInvite } from "@/hooks/groups/useGroups";
import { useRemoveGroupPhoto, useUploadGroupPhoto } from "@/hooks/photos/usePhotos";
import type { Group } from "@/types/api";
import { pickSquarePhoto } from "@/utils/photos";

/** Header action: owner → delete / new code; member → leave. Confirmed through the alert dialog. */
export function GroupActions({ group }: { group: Group }) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { showAlert, confirm } = useAlert();
  const router = useRouter();
  const leave = useLeaveGroup();
  const remove = useDeleteGroup();
  const rotate = useRotateInvite();
  const uploadPhoto = useUploadGroupPhoto();
  const removePhoto = useRemoveGroupPhoto();
  const toast = useToast();

  const onPhoto = async () => {
    const result = await pickSquarePhoto();
    if (result.kind === "denied") toast.info(t("me.photoPermission"));
    if (result.kind === "picked") uploadPhoto.mutate({ groupId: group.id, uri: result.uri });
  };
  const isOwner = group.my_role === "owner";

  const onLeave = async () => {
    const ok = await confirm({
      title: t("groups.leaveConfirmTitle", { name: group.name }),
      message: t("groups.leaveConfirmBody"),
      confirmText: t("groups.leave"),
      destructive: true,
    });
    if (ok) leave.mutate(group.id, { onSuccess: () => router.back() });
  };

  const onDelete = async () => {
    const ok = await confirm({
      title: t("groups.deleteConfirmTitle", { name: group.name }),
      message: t("groups.deleteConfirmBody"),
      confirmText: t("groups.deleteGroup"),
      destructive: true,
    });
    if (ok) remove.mutate(group.id, { onSuccess: () => router.back() });
  };

  const onRotate = async () => {
    const ok = await confirm({
      title: t("groups.rotateConfirmTitle"),
      message: t("groups.rotateConfirmBody"),
      confirmText: t("groups.rotateCode"),
    });
    if (ok) rotate.mutate(group.id);
  };

  const open = () =>
    showAlert({
      title: group.name,
      buttons: isOwner
        ? [
            { text: "__cancel__", style: "cancel" },
            {
              text: t("groups.rename"),
              onPress: () =>
                router.push({ pathname: "/groups/[id]/rename", params: { id: String(group.id) } }),
            },
            { text: t("groups.changePhoto"), onPress: () => void onPhoto() },
            ...(group.photo_url
              ? [{ text: t("groups.removePhoto"), onPress: () => removePhoto.mutate(group.id) }]
              : []),
            { text: t("groups.rotateCode"), onPress: () => void onRotate() },
            { text: t("groups.deleteGroup"), style: "destructive", onPress: () => void onDelete() },
          ]
        : [
            { text: "__cancel__", style: "cancel" },
            { text: t("groups.leave"), style: "destructive", onPress: () => void onLeave() },
          ],
    });

  return (
    <Pressable
      onPress={open}
      style={{
        width: MIN_TOUCH_TARGET,
        height: MIN_TOUCH_TARGET,
        alignItems: "center",
        justifyContent: "center",
      }}
      accessibilityRole="button"
      accessibilityLabel={t("common.edit")}>
      <Ionicons name="ellipsis-horizontal" size={22} color={theme.colors.textPrimary} />
    </Pressable>
  );
}
