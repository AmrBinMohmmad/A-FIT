import { Redirect } from "expo-router";

import { useAuth } from "@/contexts/AuthContext";

/** Boot resolver: session → tabs, otherwise the e-mail screen. Onboarding is gated inside the tabs. */
export default function Index() {
  const { status } = useAuth();
  if (status === "signedIn") return <Redirect href="/(tabs)" />;
  return <Redirect href="/(auth)/email" />;
}
