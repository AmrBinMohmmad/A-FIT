import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView, Platform, View } from "react-native";

import { AuthHeader } from "@/components/auth/AuthHeader";
import { Button } from "@/components/Button";
import { RText } from "@/components/RText";
import { RTextInput } from "@/components/RTextInput";
import { Screen } from "@/components/Screen";
import { useTheme } from "@/contexts/ThemeContext";
import { useRequestCode } from "@/hooks/auth/useAuthFlow";
import { makeStyles } from "@/hooks/useStyles";
import { errorMessage, normalizeError } from "@/utils/api/errors";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const useStyles = makeStyles((theme) => ({
  form: { gap: theme.spacing.lg },
}));

export default function EmailScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const request = useRequestCode();

  const submit = async () => {
    const value = email.trim().toLowerCase();
    if (!EMAIL_RE.test(value)) {
      setError(t("auth.emailInvalid"));
      return;
    }
    setError(undefined);
    try {
      await request.mutateAsync(value);
      router.push({ pathname: "/(auth)/code", params: { email: value } });
    } catch (e) {
      setError(errorMessage(normalizeError(e), t));
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <AuthHeader step={1} title={t("auth.emailTitle")} subtitle={t("auth.emailSubtitle")} />
        <View style={styles.form}>
          <RTextInput
            label={t("auth.emailLabel")}
            placeholder={t("auth.emailPlaceholder")}
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              if (error) setError(undefined);
            }}
            error={error}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
            returnKeyType="send"
            onSubmitEditing={() => void submit()}
            editable={!request.isPending}
            startAdornment={<Ionicons name="mail-outline" size={18} color={theme.colors.textMuted} />}
          />
          <Button
            title={t("auth.sendCode")}
            variant="accent"
            size="lg"
            onPress={() => void submit()}
            loading={request.isPending}
            icon="arrow-forward"
          />
          <RText variant="caption" color="textMuted" align="center">
            {t("common.appName")}
          </RText>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
