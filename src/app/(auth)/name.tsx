import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView, Platform, View } from "react-native";

import { AuthHeader } from "@/components/auth/AuthHeader";
import { Button } from "@/components/Button";
import { RTextInput } from "@/components/RTextInput";
import { Screen } from "@/components/Screen";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { useVerifyCode } from "@/hooks/auth/useAuthFlow";
import { makeStyles } from "@/hooks/useStyles";
import { errorMessage, normalizeError } from "@/utils/api/errors";

const useStyles = makeStyles((theme) => ({
  form: { gap: theme.spacing.lg },
}));

export default function NameScreen() {
  const { t } = useTranslation();
  const styles = useStyles();
  const router = useRouter();
  const toast = useToast();
  const { email, code } = useLocalSearchParams<{ email: string; code: string }>();
  const { completeSignIn } = useAuth();
  const verify = useVerifyCode();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | undefined>();

  const submit = async () => {
    const value = name.trim();
    if (value.length < 2) {
      setError(t("auth.nameInvalid"));
      return;
    }
    if (!email || !code) {
      router.replace("/(auth)/email");
      return;
    }
    try {
      const res = await verify.mutateAsync({ email, code, name: value });
      if (res.data.token && res.data.user) {
        await completeSignIn(res.data.token, res.data.user);
        toast.success(res.message);
      } else {
        router.replace("/(auth)/email");
      }
    } catch (e) {
      setError(errorMessage(normalizeError(e), t));
    }
  };

  return (
    <Screen back>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <AuthHeader step={3} title={t("auth.nameTitle")} subtitle={t("auth.nameSubtitle")} />
        <View style={styles.form}>
          <RTextInput
            label={t("auth.nameLabel")}
            placeholder={t("auth.namePlaceholder")}
            value={name}
            onChangeText={(v) => {
              setName(v);
              if (error) setError(undefined);
            }}
            error={error}
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
            returnKeyType="done"
            onSubmitEditing={() => void submit()}
            maxLength={60}
          />
          <Button
            title={t("auth.createAccount")}
            variant="accent"
            size="lg"
            onPress={() => void submit()}
            loading={verify.isPending}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
