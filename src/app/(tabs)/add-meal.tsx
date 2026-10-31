import { Redirect } from "expo-router";

/** Legacy tab route; meal logging is now the modal at /meals/new. */
export default function LegacyAddMeal() {
  return <Redirect href="/meals/new" />;
}
