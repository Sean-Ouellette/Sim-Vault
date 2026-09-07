import React from "react";
import { View } from "react-native";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Navbar } from "../components/Navbar";
import { SignInDialog } from "../components/SignInDialog";
import { AuthProvider } from "../lib/auth";
import { SettingsProvider } from "../lib/settings";
import { VaultProvider } from "../lib/vault";
import { SettingsOverlay } from "../components/SettingsOverlay";
import { ThemeProvider, useTheme } from "../lib/theme";

export default function Layout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <SettingsProvider>
            <VaultProvider>
              <Shell />
            </VaultProvider>
          </SettingsProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function Shell() {
  const { c, mode } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <Navbar />
      <Slot />
      <SignInDialog />
      <SettingsOverlay />
    </View>
  );
}
