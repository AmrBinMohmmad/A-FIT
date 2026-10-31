import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView, Platform, View } from "react-native";

import { Button } from "@/components/Button";
import { RText } from "@/components/RText";
import { RTextInput } from "@/components/RTextInput";
import { Screen } from "@/components/Screen";
import { useJoinGroup } from "@/hooks/groups/useGroups";
import { makeStyles } from "@/hooks/useStyles";

const useStyles = makeStyles((theme) => ({ form: { gap: theme.spacing.lg } }));

const normalise = (raw: string) =>
  raw
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8);

/** Join by code; also the deep-link target for afit://groups/join?code=XXXX. */
export default function JoinGroupScreen() {
  const { t } = useTranslation();
  const styles = useStyles();
  const router = useRouter();
  const { code: fromLink } = useLocalSearchParams<{ code?: string }>();
  const join = useJoinGroup();
  const [code, setCode] = useState(normalise(fromLink ?? ""));
  const [error, setError] = useState<string | undefined>();

  const submit = () => {
    if (code.length !== 8) {
      setError(t("groups.codeInvalid"));
      return;
    }
    join.mutate(code, {
      onSuccess: (res) =>
        router.replace({ pathname: "/groups/[id]", params: { id: String(res.data.data.id) } }),
    });
  };

  return (
    <Screen title={t("groups.join")} back>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.form}>
          <RTextInput
            label={t("groups.codeLabel")}
            placeholder={t("groups.codePlaceholder")}
            value={code.length > 4 ? `${code.slice(0, 4)}-${code.slice(4)}` : code}
            onChangeText={(v) => {
              setCode(normalise(v));
              setError(undefined);
            }}
            error={error}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={9}
            englishNumbers
            autoFocus
            returnKeyType="done"
            onSubmitEditing={submit}
          />
          <RText variant="caption" color="textMuted">
            {t("groups.codeInvalid")}
          </RText>
          <Button
            title={t("groups.join")}
            variant="accent"
            size="lg"
            onPress={submit}
            loading={join.isPending}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
