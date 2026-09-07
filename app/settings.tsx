import { useEffect } from "react";
import { Redirect } from "expo-router";
import { useAuth } from "../lib/auth";
import { useSettings } from "../lib/settings";

/** Deep link: Settings is an overlay, so /settings opens Home with the drawer up. */
export default function SettingsRoute() {
  const { user, openDialog } = useAuth();
  const { openSettings } = useSettings();
  useEffect(() => { openSettings(); }, []);
  return <Redirect href="/" />;
}
