import { Redirect } from "expo-router";

/** Legacy route from the previous auth flow; the unified e-mail flow replaced it. */
export default function LegacyAuthRedirect() {
  return <Redirect href="/(auth)/email" />;
}
