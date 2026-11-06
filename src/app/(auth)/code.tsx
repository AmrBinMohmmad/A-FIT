import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView, Platform, View } from "react-native";

import { AuthHeader } from "@/components/auth/AuthHeader";
import { OtpInput } from "@/components/auth/OtpInput";
import { Button } from "@/components/Button";
import { RText } from "@/components/RText";
import { Screen } from "@/components/Screen";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { useRequestCode, useVerifyCode } from "@/hooks/auth/useAuthFlow";
import { makeStyles } from "@/hooks/useStyles";
import { errorMessage, normalizeError } from "@/utils/api/errors";

const RESEND_SECONDS = 60;

const useStyles = makeStyles((theme) => ({
  form: { gap: theme.spacing.lg },
  links: { alignItems: "center", gap: theme.spacing.md },
}));

export default function CodeScreen() {
  const { t } = useTranslation();
  const styles = useStyles();
  const router = useRouter();
  const toast = useToast();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { completeSignIn } = useAuth();
  const verify = useVerifyCode();
  const resend = useRequestCode();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [seconds, setSeconds] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  const submit = async (value: string) => {
    if (!email) {
      router.replace("/(auth)/email");
      return;
    }
    if (value.length !== 6) {
      setError(t("auth.codeIncomplete"));
      return;
    }
    setError(undefined);
    try {
      const res = await verify.mutateAsync({ email, code: value });
      if (res.data.requires_name) {
        router.push({ pathname: "/(auth)/name", params: { email, code: value } });
        return;
      }
      if (res.data.token && res.data.user) {
        await completeSignIn(res.data.token, res.data.user);
        toast.success(res.message);
      }
    } catch (e) {
      setError(errorMessage(normalizeError(e), t));
      setCode("");
    }
  };

  const handleResend = async () => {
    if (!email || seconds > 0) return;
    try {
      const res = await resend.mutateAsync(email);
      toast.info(res.data.message);
      setSeconds(RESEND_SECONDS);
      setCode("");
    } catch (e) {
      setError(errorMessage(normalizeError(e), t));
    }
  };

  return (
    <Screen back>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <AuthHeader step={2} title={t("auth.codeTitle")} subtitle={t("auth.codeSubtitle", { email })} />
        <View style={styles.form}>
          <OtpInput
            value={code}
            onChange={(v) => {
              setCode(v);
              if (error) setError(undefined);
              if (v.length === 6) void submit(v);
            }}
            error={error}
            disabled={verify.isPending}
          />
          <Button
            title={t("auth.verify")}
            variant="accent"
            size="lg"
            onPress={() => void submit(code)}
            loading={verify.isPending}
            disabled={code.length !== 6}
          />
          <View style={styles.links}>
            {seconds > 0 ? (
              <RText variant="footnote" color="textMuted" tabular>
                {t("auth.resendIn", { seconds })}
              </RText>
            ) : (
              <Button
                title={t("auth.resend")}
                variant="ghost"
                onPress={() => void handleResend()}
                loading={resend.isPending}
              />
            )}
            <Button
              title={t("auth.changeEmail")}
              variant="ghost"
              onPress={() => router.replace("/(auth)/email")}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
