import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView, Platform, View } from "react-native";

import { Button } from "@/components/Button";
import { RTextInput } from "@/components/RTextInput";
import { Screen } from "@/components/Screen";
import { useCreateGroup } from "@/hooks/groups/useGroups";
import { makeStyles } from "@/hooks/useStyles";

const useStyles = makeStyles((theme) => ({ form: { gap: theme.spacing.lg } }));

export default function NewGroupScreen() {
  const { t } = useTranslation();
  const styles = useStyles();
  const router = useRouter();
  const create = useCreateGroup();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | undefined>();

  const submit = () => {
    const value = name.trim();
    if (value.length < 2) {
      setError(t("groups.nameInvalid"));
      return;
    }
    create.mutate(value, {
      onSuccess: (res) =>
        router.replace({ pathname: "/groups/[id]", params: { id: String(res.data.data.id) } }),
    });
  };

  return (
    <Screen title={t("groups.create")} back>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.form}>
          <RTextInput
            label={t("groups.nameLabel")}
            placeholder={t("groups.namePlaceholder")}
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
            title={t("groups.create")}
            variant="accent"
            size="lg"
            onPress={submit}
            loading={create.isPending}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
