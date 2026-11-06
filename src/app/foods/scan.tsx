import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Linking, View } from "react-native";

import { Button } from "@/components/Button";
import { FoodRow } from "@/components/foods/FoodRow";
import { ListState } from "@/components/ListState";
import { RText } from "@/components/RText";
import { Screen } from "@/components/Screen";
import { EMOJI } from "@/constants/emoji";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMealDraft } from "@/contexts/MealDraftContext";
import { useToast } from "@/contexts/ToastContext";
import { useFoodSearch } from "@/hooks/foods/useFoods";
import { makeStyles } from "@/hooks/useStyles";
import type { Food } from "@/types/api";
import { foodName } from "@/utils/foodMath";

const useStyles = makeStyles((theme) => ({
  camera: {
    height: 280,
    borderRadius: theme.radii.xl,
    overflow: "hidden",
    backgroundColor: theme.colors.signPanel,
  },
  frame: {
    position: "absolute",
    top: 60,
    bottom: 60,
    start: 40,
    end: 40,
    borderWidth: 2,
    borderColor: theme.colors.accent,
    borderRadius: theme.radii.lg,
  },
  code: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  ask: { gap: theme.spacing.md, alignItems: "center", paddingVertical: theme.spacing.xl },
}));

/** Only retail product codes; the camera ignores QR and the rest. */
const PRODUCT_CODES = ["ean13", "ean8", "upc_a", "upc_e"] as const;

/**
 * Scan a product barcode. The code is looked up in the catalog (one request); a hit is one
 * tap from the basket, a miss offers "add my own" with the barcode pre-filled.
 */
export default function ScanFoodScreen() {
  const styles = useStyles();
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast();
  const { language } = useLanguage();
  const draft = useMealDraft();
  const [permission, requestPermission] = useCameraPermissions();
  const [code, setCode] = useState<string | null>(null);
  const results = useFoodSearch(code ?? "", null);
  const found = results.data ?? [];

  const add = (food: Food) => {
    draft.add(food, 1);
    toast.info(t("meals.added", { name: foodName(food, language) }));
    router.back();
  };

  const body = () => {
    if (!permission) return null;
    if (!permission.granted) {
      return (
        <View style={styles.ask}>
          <RText style={{ fontSize: 40, lineHeight: 48 }}>{EMOJI.scan}</RText>
          <RText variant="subtitle" align="center">
            {t("foods.scanPermissionTitle")}
          </RText>
          <RText variant="footnote" color="textSecondary" align="center">
            {t("foods.scanPermissionBody")}
          </RText>
          {permission.canAskAgain ? (
            <Button title={t("foods.scanAllow")} variant="accent" onPress={() => void requestPermission()} />
          ) : (
            <Button
              title={t("common.openSettings")}
              variant="accent"
              onPress={() => void Linking.openSettings()}
            />
          )}
        </View>
      );
    }
    return (
      <>
        <View style={styles.camera}>
          {code === null ? (
            <CameraView
              style={{ flex: 1 }}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: [...PRODUCT_CODES] }}
              onBarcodeScanned={({ data }) => {
                if (/^\d{8,14}$/.test(data)) setCode(data);
              }}
            />
          ) : null}
          <View style={styles.frame} pointerEvents="none" />
        </View>
        <RText variant="footnote" color="textSecondary" align="center">
          {code === null ? t("foods.scanHint") : t("foods.scannedCode", { code })}
        </RText>
        {code !== null ? (
          <ListState
            loading={results.isPending}
            error={results.isError ? results.error : undefined}
            onRetry={() => void results.refetch()}
            empty={!results.isPending && found.length === 0}
            emptyEmoji={EMOJI.scan}
            emptyTitle={t("foods.scanNotFound")}
            emptyBody={t("foods.scanNotFoundHint")}
            emptyAction={
              <View style={{ gap: 8 }}>
                <Button
                  title={t("foods.scanAddWithBarcode")}
                  variant="accent"
                  icon="add"
                  onPress={() => router.replace({ pathname: "/foods/new", params: { barcode: code } })}
                />
                <Button title={t("foods.scanAgain")} variant="ghost" onPress={() => setCode(null)} />
              </View>
            }>
            <View>
              {found.map((food, i) => (
                <FoodRow
                  key={food.id}
                  food={{ ...food, variants_count: 0 }}
                  first={i === 0}
                  onPress={() => add(food)}
                />
              ))}
              <Button title={t("foods.scanAgain")} variant="ghost" onPress={() => setCode(null)} />
            </View>
          </ListState>
        ) : null}
      </>
    );
  };

  return (
    <Screen title={t("foods.scanTitle")} back>
      {body()}
    </Screen>
  );
}
