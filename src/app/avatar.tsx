import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

import { Avatar } from "@/components/Avatar";
import { RText } from "@/components/RText";
import { Screen } from "@/components/Screen";
import { AVATAR_KEYS, type AvatarKey } from "@/constants/avatars";
import { useAuth } from "@/contexts/AuthContext";
import { useUpdateMe } from "@/hooks/profile/useProfile";
import { makeStyles } from "@/hooks/useStyles";

const useStyles = makeStyles((theme) => ({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.md, justifyContent: "center" },
  cell: { alignItems: "center", justifyContent: "center", padding: theme.spacing.xs, minHeight: 72 },
  pressed: { opacity: 0.7 },
}));

/** Pick one of the predefined avatars; saved with PATCH me, then back. */
export default function AvatarScreen() {
  const { t } = useTranslation();
  const styles = useStyles();
  const router = useRouter();
  const { user } = useAuth();
  const updateMe = useUpdateMe();

  const pick = (avatar: AvatarKey) => {
    if (updateMe.isPending) return;
    updateMe.mutate({ avatar }, { onSuccess: () => router.back() });
  };

  return (
    <Screen title={t("me.avatarTitle")} subtitle={t("me.avatarSubtitle")} back>
      <View style={styles.grid}>
        {AVATAR_KEYS.map((key) => (
          <Pressable
            key={key}
            onPress={() => pick(key)}
            style={({ pressed }) => [styles.cell, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={t(`avatars.${key}`)}
            accessibilityState={{ selected: user?.avatar === key }}>
            <Avatar avatar={key} name={t(`avatars.${key}`)} size={64} selected={user?.avatar === key} />
          </Pressable>
        ))}
      </View>
      {user?.avatar ? (
        <Pressable
          onPress={() => updateMe.mutate({ avatar: null }, { onSuccess: () => router.back() })}
          style={{ alignSelf: "center", minHeight: 44, justifyContent: "center" }}
          accessibilityRole="button">
          <RText variant="footnote" color="textSecondary" weight="medium">
            {t("me.avatarNone")}
          </RText>
        </Pressable>
      ) : null}
    </Screen>
  );
}
