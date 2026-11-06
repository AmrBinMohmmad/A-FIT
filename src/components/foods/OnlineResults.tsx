import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Button } from "@/components/Button";
import { FoodRow } from "@/components/foods/FoodRow";
import { ListState } from "@/components/ListState";
import { RText } from "@/components/RText";
import { EMOJI } from "@/constants/emoji";
import { useOnlineFoodSearch } from "@/hooks/foods/useFoods";
import { makeStyles } from "@/hooks/useStyles";
import type { LookupResult } from "@/types/api";

interface OnlineResultsProps {
  query: string;
  online: boolean;
  onOnline: () => void;
  onPick: (result: LookupResult) => void;
}

const useStyles = makeStyles((theme) => ({
  online: { gap: theme.spacing.sm, paddingTop: theme.spacing.md },
}));

/**
 * Under the local results: one button to search online products (Open Food Facts via the
 * server), then the candidates with photos. Opt-in on purpose — never a request per keystroke.
 */
export function OnlineResults({ query, online, onOnline, onPick }: OnlineResultsProps) {
  const styles = useStyles();
  const { t } = useTranslation();
  const lookup = useOnlineFoodSearch(online ? query : "", online);
  const results = lookup.data?.results ?? [];

  return (
    <View style={styles.online}>
      {!online ? (
        <Button title={t("foods.searchOnline")} variant="secondary" icon="globe-outline" onPress={onOnline} />
      ) : (
        <>
          <RText variant="footnote" weight="medium" color="textSecondary">
            {t("foods.onlineResults")}
          </RText>
          <ListState
            loading={lookup.isPending}
            error={lookup.isError ? lookup.error : undefined}
            onRetry={() => void lookup.refetch()}
            empty={!lookup.isPending && results.length === 0}
            emptyEmoji={EMOJI.scan}
            emptyTitle={lookup.data?.available === false ? t("foods.onlineDown") : t("foods.onlineEmpty")}
            emptyBody={t("foods.searchEmptyHint")}>
            <View>
              {results.map((r, i) => (
                <FoodRow key={r.barcode} food={r} first={i === 0} index={i} onPress={() => onPick(r)} />
              ))}
            </View>
          </ListState>
          <RText variant="caption" color="textMuted" align="center">
            {t("foods.attribution")}
          </RText>
        </>
      )}
    </View>
  );
}
