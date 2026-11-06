import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView, Platform, View } from "react-native";

import { Button } from "@/components/Button";
import { RTextInput } from "@/components/RTextInput";
import { Screen } from "@/components/Screen";
import { useGroup, useRenameGroup } from "@/hooks/groups/useGroups";
import { makeStyles } from "@/hooks/useStyles";

const useStyles = makeStyles((theme) => ({ form: { gap: theme.spacing.lg } }));

/** Owner renames the group; the server enforces the owner check (403 → toast). */
export default function RenameGroupScreen() {
  const { t } = useTranslation();
  const styles = useStyles();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const groupId = Number(id);
  const group = useGroup(groupId);
  const rename = useRenameGroup();
  const [name, setName] = useState(group.data?.group.name ?? "");
  const [error, setError] = useState<string | undefined>();

  const submit = () => {
    const value = name.trim();
    if (value.length < 2) {
      setError(t("groups.nameInvalid"));
      return;
    }
    rename.mutate({ id: groupId, name: value }, { onSuccess: () => router.back() });
  };

  return (
    <Screen title={t("groups.renameTitle")} back>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.form}>
          <RTextInput
            label={t("groups.renameLabel")}
            value={name}
            onChangeText={(v) => {
              setName(v);
              setError(undefined);
            }}
            error={error}
            maxLength={60}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={submit}
          />
          <Button
            title={t("common.save")}
            variant="accent"
            size="lg"
            onPress={submit}
            loading={rename.isPending}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
